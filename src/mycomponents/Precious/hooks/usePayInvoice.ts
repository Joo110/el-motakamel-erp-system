// hooks/usePayInvoice.ts
import { useCallback, useState } from 'react';
import { payInvoiceById, paypayrollsById } from '../services/invoicePay';
import type { PayInvoicePayload, PayPayload } from '../services/invoicePay';

import { toast } from 'react-hot-toast';

export function usePayInvoice() {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);

  /**
   * دفع فاتورة (Invoice)
   * - invoiceId, payload: { amount, ... }
   * - يدمج default fields (paymentMethod: 'bank_transfer', notes) داخل الخدمة
   */
  const payInvoice = useCallback(
    async (invoiceId: string, payload: Partial<PayInvoicePayload>) => {
      setLoading(true);
      setError(null);

      try {
        const normalized: PayInvoicePayload = {
          ...(payload as PayInvoicePayload),
          // لا نضع paymentMethod هنا لأن الخدمة نفسها تضع الافتراضي،
          // لكن لو حبيت تمرر قيمة معينة فهي ستغلب الافتراضي بسبب spread.
        };

        const res = await payInvoiceById(invoiceId, normalized);
        setResponse(res);
        return res;
      } catch (err: any) {
        setError(err);

        const errors = err?.response?.data?.errors;
        if (Array.isArray(errors)) {
          errors.forEach((e: any) => toast.error(e.msg || JSON.stringify(e)));
        } else {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Payment failed';
          toast.error(msg);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * دفع مرتبات (Payroll) — موجود لو احتاجته
   */
  const payPayroll = useCallback(
    async (payrollId: string, payload?: PayPayload) => {
      setLoading(true);
      setError(null);
      try {
        const res = await paypayrollsById(payrollId, payload);
        setResponse(res);
        return res;
      } catch (err: any) {
        setError(err);
        const errors = err?.response?.data?.errors;
        if (Array.isArray(errors)) {
          errors.forEach((e: any) => toast.error(e.msg || JSON.stringify(e)));
        } else {
          const msg = err?.response?.data?.message ?? err?.message ?? 'Payment failed';
          toast.error(msg);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { response, loading, error, payInvoice, payPayroll } as const;
}

export default usePayInvoice;
