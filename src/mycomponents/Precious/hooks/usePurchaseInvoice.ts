import { useCallback, useEffect, useState } from 'react';
import { payInvoiceById } from '../services/invoicePay';

export function usePurchaseInvoice(id?: string) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (invoiceId?: string) => {
    const realId = invoiceId ?? id;
    if (!realId) throw new Error('Missing invoice ID');
    setLoading(true);
    setError(null);
    try {
      const res = await payInvoiceById(realId);
      setInvoice(res);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetch(id);
  }, [id, fetch]);

  return { invoice, loading, error, fetch } as const;
}