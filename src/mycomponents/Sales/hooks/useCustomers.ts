// src/hooks/useCustomers.ts
import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '../services/customers';
import {
  getAllCustomers,
  getCustomerById,
  createCustomerUnderOrg,
  deleteCustomer,
  updateCustomer,
} from '../services/customers';

export function useCustomers(initialFetch = true) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCustomers();
      setCustomers(data ?? []);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch customers';
      setError(msg);
      console.error('fetchCustomers error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerById(id);
      return data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewCustomer = useCallback(async (orgId: string, payload: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createCustomerUnderOrg(orgId, payload);
      setCustomers((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateExistingCustomer = useCallback(async (id: string, payload: Partial<Customer>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateCustomer(id, payload);
      setCustomers((prev) => prev.map((c) => (c._id === id ? updated : c)));
      return updated;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to update customer';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCustomer = useCallback(
    async (customerId: string, orgId?: string) => {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🗑️ Deleting customer:', { customerId, orgId });

        let res;
        if (orgId) {
          // 🏢 استخدم endpoint المنظمة
         // res = await deleteCustomerFromOrg(orgId, { customerId });
        } else {
          res = await deleteCustomer(customerId);
        }

        console.log('✅ Delete API response:', res);


const isDeleted =
  !res ||
  res.success === true ||
  (res as any)?.status === 204 ||
  (res as any)?.status === 'success' ||
  (typeof (res as any)?.message === 'string' &&
    (res as any).message.toLowerCase().includes('deleted'));

if (isDeleted) {
  setCustomers((prev) => prev.filter((c) => c._id !== customerId));
  console.log('✅ Customer removed from state');
} else {
  console.warn('⚠️ Unexpected delete response:', res);
}


        return res;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err.message ||
          'Failed to delete customer';
        setError(msg);
        console.error('❌ Delete customer failed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialFetch) void fetchCustomers();
  }, [fetchCustomers, initialFetch]);

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    getCustomer,
    createNewCustomer,
    updateExistingCustomer,
    removeCustomer,
    setCustomers,
  } as const;
}