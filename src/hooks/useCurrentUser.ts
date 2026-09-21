import { useAuthStore, useDataStore } from '../store';

/**
 * Get the provider profile linked to the current user
 */
export function useCurrentProvider() {
  const { currentUser } = useAuthStore();
  const { providers } = useDataStore();

  if (!currentUser || currentUser.role !== 'PROVIDER') return null;
  
  const provider = providers.find(p => p.userId === currentUser.id);
  return provider || providers[0] || null; // fallback to first provider for demo
}

/**
 * Get the customer profile linked to the current user
 */
export function useCurrentCustomer() {
  const { currentUser } = useAuthStore();
  const { customers } = useDataStore();

  if (!currentUser || currentUser.role !== 'CUSTOMER') return null;
  
  const customer = customers.find(c => c.userId === currentUser.id);
  return customer || customers[0] || null; // fallback to first customer for demo
}

/**
 * Get the wallet linked to the current provider
 */
export function useCurrentWallet() {
  const provider = useCurrentProvider();
  const { wallets } = useDataStore();

  if (!provider) return null;
  return wallets.find(w => w.ownerId === provider.id) || wallets[0] || null;
}
