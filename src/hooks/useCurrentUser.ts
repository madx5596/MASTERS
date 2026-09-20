import { useAuthStore, useDataStore } from '../store';

/**
 * Get the provider profile linked to the current user
 * Returns null if the current user is not a provider
 */
export function useCurrentProvider() {
  const { currentUser } = useAuthStore();
  const { providers } = useDataStore();

  if (!currentUser || currentUser.role !== 'PROVIDER') return null;
  
  // Find provider by user_id
  const provider = providers.find(p => p.userId === currentUser.id);
  return provider || null;
}

/**
 * Get the customer profile linked to the current user
 * Returns null if the current user is not a customer
 */
export function useCurrentCustomer() {
  const { currentUser } = useAuthStore();
  const { customers } = useDataStore();

  if (!currentUser || currentUser.role !== 'CUSTOMER') return null;
  
  // Find customer by user_id
  const customer = customers.find(c => c.userId === currentUser.id);
  return customer || null;
}

/**
 * Get the wallet linked to the current provider
 */
export function useCurrentWallet() {
  const provider = useCurrentProvider();
  const { wallets } = useDataStore();

  if (!provider) return null;
  return wallets.find(w => w.ownerId === provider.id) || null;
}
