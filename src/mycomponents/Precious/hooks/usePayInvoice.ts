import { useCallback, useState } from 'react';
import { payInvoiceById, paypayrollsById } from '../services/invoicePay';

export function usePayInvoice() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // دفع الفاتورة
  const payInvoice = useCallback(async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payInvoiceById(invoiceId);
      setResponse(res);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // دفع المرتبات
  const payPayroll = useCallback(async (payrollId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await paypayrollsById(payrollId);
      setResponse(res);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { response, loading, error, payInvoice, payPayroll } as const;
}
