import { useState, useCallback } from "react";
import {
  createTripInvoiceService,
  getAllTripInvoicesService,
} from "../services/tripInvoicesService";
import type { Invoice } from "../services/tripInvoicesService";

export const useTripInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTripInvoicesService();
      setInvoices(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(
    async (saleOrderId: string, payload: any = {}) => {
      try {
        setLoading(true);
        await createTripInvoiceService(saleOrderId, payload);
        await fetch();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  return {
    invoices,
    loading,
    error,
    fetch,
    createInvoice,
  };
};