import { query, queryOne, transaction } from '../db/pool.js';

export interface Appointment {
  id: string;
  organization_id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  start_at: string;
  end_at: string;
  status: string;
  price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get provider by user_id
 */
export async function getProviderByUserId(userId: string): Promise<any | null> {
  return queryOne('SELECT * FROM providers WHERE user_id = $1', [userId]);
}

/**
 * Get customer by user_id
 */
export async function getCustomerByUserId(userId: string): Promise<any | null> {
  return queryOne('SELECT * FROM customers WHERE user_id = $1', [userId]);
}

/**
 * Get available time slots for a provider on a given date
 */
export async function getAvailability(providerId: string, date: string, serviceDuration: number): Promise<string[]> {
  // Get provider schedule for the day of week
  const dayOfWeek = new Date(date).getDay();
  const schedule = await queryOne<{ start_time: string; end_time: string; break_start: string | null; break_end: string | null }>(
    'SELECT start_time, end_time, break_start, break_end FROM schedules WHERE provider_id = $1 AND day_of_week = $2 AND is_active = TRUE',
    [providerId, dayOfWeek]
  );

  if (!schedule) return [];

  // Check for exceptions
  const exception = await queryOne<{ type: string; start_time: string | null; end_time: string | null }>(
    'SELECT type, start_time, end_time FROM schedule_exceptions WHERE provider_id = $1 AND date = $2',
    [providerId, date]
  );

  if (exception?.type === 'DAY_OFF' || exception?.type === 'VACATION') return [];

  let workStart = exception?.start_time || schedule.start_time;
  let workEnd = exception?.end_time || schedule.end_time;
  const breakStart = exception?.start_time || schedule.break_start;
  const breakEnd = exception?.end_time || schedule.break_end;

  // Get existing appointments
  const appointments = await query<{ start_at: string; end_at: string }>(
    `SELECT start_at, end_at FROM appointments
     WHERE provider_id = $1 AND DATE(start_at) = $2 AND status NOT IN ('CANCELLED', 'NO_SHOW')`,
    [providerId, date]
  );

  // Generate available slots
  const slots: string[] = [];
  const interval = 30; // minutes
  const [startH, startM] = workStart.split(':').map(Number);
  const [endH, endM] = workEnd.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let mins = startMinutes; mins + serviceDuration <= endMinutes; mins += interval) {
    const slotStart = mins;
    const slotEnd = mins + serviceDuration;

    // Check if slot overlaps with break
    if (breakStart && breakEnd) {
      const [bH, bM] = breakStart.split(':').map(Number);
      const [beH, beM] = breakEnd.split(':').map(Number);
      const breakStartMins = bH * 60 + bM;
      const breakEndMins = beH * 60 + beM;
      if (slotStart < breakEndMins && slotEnd > breakStartMins) continue;
    }

    // Check if slot overlaps with existing appointments
    const hasConflict = appointments.some(apt => {
      const [aH, aM] = apt.start_at.split('T')[1].split(':').map(Number);
      const [aeH, aeM] = apt.end_at.split('T')[1].split(':').map(Number);
      const aptStart = aH * 60 + aM;
      const aptEnd = aeH * 60 + aeM;
      return slotStart < aptEnd && slotEnd > aptStart;
    });

    if (!hasConflict) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      slots.push(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    }
  }

  return slots;
}

/**
 * Create appointment with validation and double-booking protection
 * Backend computes price, duration, endAt from service
 */
export async function createAppointment(data: {
  userId: string;
  providerId: string;
  serviceId: string;
  startAt: string;
  notes?: string;
}): Promise<Appointment> {
  // Validate service exists and is active
  const service = await queryOne<any>(
    'SELECT * FROM services WHERE id = $1 AND status = $2',
    [data.serviceId, 'ACTIVE']
  );

  if (!service) {
    const error = new Error('Service not found or inactive') as any;
    error.code = 'SERVICE_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Validate service belongs to provider
  if (service.provider_id !== data.providerId) {
    const error = new Error('Service does not belong to this provider') as any;
    error.code = 'SERVICE_PROVIDER_MISMATCH';
    error.statusCode = 400;
    throw error;
  }

  // Validate provider exists and is active
  const provider = await queryOne<any>(
    'SELECT * FROM providers WHERE id = $1 AND status = $2',
    [data.providerId, 'ACTIVE']
  );

  if (!provider) {
    const error = new Error('Provider not found or inactive') as any;
    error.code = 'PROVIDER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  // Get customer for this user
  const customer = await getCustomerByUserId(data.userId);
  if (!customer) {
    const error = new Error('Customer profile not found') as any;
    error.code = 'CUSTOMER_NOT_FOUND';
    error.statusCode = 400;
    throw error;
  }

  // Compute endAt from startAt + duration
  const startDate = new Date(data.startAt);
  const endDate = new Date(startDate.getTime() + service.duration * 60000);

  try {
    const result = await queryOne<Appointment>(
      `INSERT INTO appointments (organization_id, customer_id, provider_id, service_id, start_at, end_at, status, price, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)
       RETURNING *`,
      [service.organization_id, customer.id, data.providerId, data.serviceId, data.startAt, endDate.toISOString(), service.price, data.notes || null]
    );

    if (!result) throw new Error('Failed to create appointment');
    return result;
  } catch (error: any) {
    if (error.code === '23P01') { // Exclusion constraint violation
      const err = new Error('SLOT_ALREADY_BOOKED') as any;
      err.code = 'SLOT_ALREADY_BOOKED';
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  return queryOne<Appointment>('SELECT * FROM appointments WHERE id = $1', [id]);
}

export async function getProviderAppointments(providerId: string): Promise<Appointment[]> {
  return query<Appointment>(
    'SELECT * FROM appointments WHERE provider_id = $1 ORDER BY start_at DESC',
    [providerId]
  );
}

export async function getCustomerAppointments(customerId: string): Promise<Appointment[]> {
  return query<Appointment>(
    'SELECT * FROM appointments WHERE customer_id = $1 ORDER BY start_at DESC',
    [customerId]
  );
}

export async function getAllAppointments(): Promise<Appointment[]> {
  return query<Appointment>('SELECT * FROM appointments ORDER BY start_at DESC LIMIT 100');
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Appointment | null> {
  return queryOne<Appointment>(
    `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
}
