import { useCallback, useEffect, useState } from 'react';
import type { Customer } from '../services/customers';
import {
  getAllCustomers,
  getCustomerById,
  createCustomerUnderOrg,
  updateCustomer,
  hardDeleteCustomer,
  softDeleteCustomer,
  addOrganizationToCustomer,
  removeOrganizationFromCustomer,
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

  const createNewCustomer = useCallback(
    async (orgId: string, payload: Partial<Customer>) => {
      setLoading(true);
      setError(null);
      try {
        const body = {
          ...payload,
          organizationId: [orgId],
        };
        const created = await createCustomerUnderOrg(body);
        setCustomers((prev) => [created, ...prev]);
        return created;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message || 'Failed to create customer';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

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

  const deleteCustomerHard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await hardDeleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed hard delete';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomerSoft = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await softDeleteCustomer(id);
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed soft delete';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const attachOrgToCustomer = useCallback(async (customerId: string, orgId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await addOrganizationToCustomer(customerId, orgId);
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed add org';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const detachOrgFromCustomer = useCallback(async (customerId: string, orgId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await removeOrganizationFromCustomer(customerId, orgId);
      return res;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed remove org';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCustomer = deleteCustomerHard;

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
    deleteCustomerHard,
    deleteCustomerSoft,
    attachOrgToCustomer,
    detachOrgFromCustomer,
    removeCustomer,
    setCustomers,
  } as const;
}
