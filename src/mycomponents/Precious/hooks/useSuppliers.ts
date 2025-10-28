// src/hooks/useSuppliers.ts
import { useCallback, useEffect, useState } from 'react';
import type { Supplier } from '../services/suppliers';
import { getSuppliersService } from '../services/suppliers';

export function useSuppliers(initialFetch = true) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuppliersService();
      setSuppliers(data ?? []);
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load suppliers');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialFetch) void fetchSuppliers();
  }, [fetchSuppliers, initialFetch]);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    setSuppliers,
  } as const;
}