// hooks/usePurchaseInvoices.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getPurchaseInvoicesService,
  getPurchaseInvoiceByIdService,
} from "../services/Allinvoices";

import type { PurchaseInvoice } from "../services/Allinvoices";
import { toast } from "react-hot-toast";

export function usePurchaseInvoices(initialParams?: Record<string, any>) {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState(initialParams);

  /* ============================
         FETCH LIST
  ============================= */
  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const list = await getPurchaseInvoicesService(p ?? params);
        setInvoices(list);
        return list;
      } catch (err) {
        console.error("usePurchaseInvoices: fetch error", err);
        setError(err);
        toast.error("Error fetching purchase invoices");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(
    async (p?: Record<string, any>) => {
      setParams(p ?? params);
      return fetch(p);
    },
    [fetch, params]
  );

  /* ============================
       GET BY ID
  ============================= */
  const getInvoice = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const invoice = await getPurchaseInvoiceByIdService(id);
      return invoice;
    } catch (err) {
      console.error("getInvoice error:", err);
      toast.error("Error fetching invoice");
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invoices,
    loading,
    error,
    refresh,
    getInvoice,
  };
}

export default usePurchaseInvoices;
