import { useCallback, useEffect, useState } from 'react';
import { getSaleInvoiceById } from '../services/saleInvoices';
import type { SaleInvoice } from '../services/saleInvoices';

export function useSaleInvoice(id?: string) {
  const [item, setItem] = useState<SaleInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (idToFetch?: string) => {
    const realId = idToFetch ?? id;
    if (!realId) throw new Error('Missing id to fetch sale invoice');
    setLoading(true);
    setError(null);
    try {
      const got = await getSaleInvoiceById(realId);
      setItem(got);
      return got;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch sale invoice');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetch(id);
  }, [id, fetch]);

  return { item, loading, error, fetch, setItem } as const;
}