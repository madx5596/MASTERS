import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { ProviderLayout, AdminLayout, ClientLayout } from './components/layouts';
import { LoginPage } from './pages/auth/LoginPage';
import { ClientHome, ClientSearch, ClientBookings, ClientMasters, ClientPromotions, ClientProfile } from './pages/client';
import { ProviderToday, ProviderCalendar, ProviderBookings, ProviderClients, ProviderServices, ProviderSchedule, ProviderAnalytics, ProviderProfile, ProviderMessages } from './pages/provider';
import { AdminDashboard, AdminUsers, AdminProviders, AdminCustomers, AdminServices, AdminAppointments, AdminPayments, AdminWallets, AdminTransactions, AdminPromotions, AdminAdvertisements, AdminPremium, AdminNotifications, AdminAudit, AdminSettings } from './pages/admin';

// ============ PROTECTED ROUTES ============
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { isAuthenticated, currentUser } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (currentUser && !allowedRoles.includes(currentUser.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ============ APP ============
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Client Routes */}
        <Route path="/client/*" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ClientLayout>
              <Routes>
                <Route path="/" element={<ClientHome />} />
                <Route path="/search" element={<ClientSearch />} />
                <Route path="/bookings" element={<ClientBookings />} />
                <Route path="/masters" element={<ClientMasters />} />
                <Route path="/promotions" element={<ClientPromotions />} />
                <Route path="/profile" element={<ClientProfile />} />
              </Routes>
            </ClientLayout>
          </ProtectedRoute>
        } />

        {/* Provider Routes */}
        <Route path="/provider/*" element={
          <ProtectedRoute allowedRoles={['PROVIDER']}>
            <ProviderLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/provider/today" replace />} />
                <Route path="/today" element={<ProviderToday />} />
                <Route path="/calendar" element={<ProviderCalendar />} />
                <Route path="/bookings" element={<ProviderBookings />} />
                <Route path="/messages" element={<ProviderMessages />} />
                <Route path="/clients" element={<ProviderClients />} />
                <Route path="/services" element={<ProviderServices />} />
                <Route path="/schedule" element={<ProviderSchedule />} />
                <Route path="/analytics" element={<ProviderAnalytics />} />
                <Route path="/profile" element={<ProviderProfile />} />
                {/* Legacy deep links */}
                <Route path="/wallet" element={<ProviderProfile />} />
                <Route path="/promotion" element={<ProviderProfile />} />
                <Route path="/ads" element={<ProviderProfile />} />
                <Route path="/premium" element={<ProviderProfile />} />
                <Route path="/finance" element={<ProviderProfile />} />
              </Routes>
            </ProviderLayout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'CONTENT_ADMIN', 'ANALYST']}>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/providers" element={<AdminProviders />} />
                <Route path="/customers" element={<AdminCustomers />} />
                <Route path="/services" element={<AdminServices />} />
                <Route path="/appointments" element={<AdminAppointments />} />
                <Route path="/payments" element={<AdminPayments />} />
                <Route path="/wallets" element={<AdminWallets />} />
                <Route path="/transactions" element={<AdminTransactions />} />
                <Route path="/promotions" element={<AdminPromotions />} />
                <Route path="/advertisements" element={<AdminAdvertisements />} />
                <Route path="/premium" element={<AdminPremium />} />
                <Route path="/notifications" element={<AdminNotifications />} />
                <Route path="/audit" element={<AdminAudit />} />
                <Route path="/settings" element={<AdminSettings />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
