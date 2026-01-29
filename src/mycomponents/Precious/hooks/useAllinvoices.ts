// hooks/usePurchaseInvoices.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getPurchaseInvoicesService,
  getPurchaseInvoiceByIdService,
} from "../services/Allinvoices"; // غيّر المسار لو ملفك في مكان تاني
import type { PurchaseInvoice } from "../services/Allinvoices";
import { toast } from "react-hot-toast";

export function usePurchaseInvoices(initialParams?: Record<string, any>) {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  /* ==========================
     FETCH LIST
  =========================== */
  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPurchaseInvoicesService(p ?? params);
        // res: { data, results, paginationResult, raw }
        setInvoices(res.data ?? []);
        setTotal(res.results ?? (res.data?.length ?? 0));
        setPagination(res.paginationResult ?? null);
        return res;
      } catch (err) {
        console.error("usePurchaseInvoices: fetch error", err);
        setError(err);
        toast.error("Error fetching purchase invoices");
        return { data: [], results: 0, paginationResult: null, raw: null };
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    // auto-fetch on mount (if initialParams provided or not)
    void fetch();
  }, [fetch]);

  const refresh = useCallback(
    async (p?: Record<string, any>) => {
      setParams((prev) => p ?? prev);
      return fetch(p);
    },
    [fetch]
  );

  /* ==========================
     GET BY ID
  =========================== */
  const getInvoice = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const invoice = await getPurchaseInvoiceByIdService(id);
        return invoice;
      } catch (err) {
        console.error("getInvoice error:", err);
        setError(err);
        toast.error("Error fetching invoice");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    invoices,
    total,
    pagination,
    loading,
    error,
    params,
    setParams,
    refresh,
    getInvoice,
  } as const;
}

export default usePurchaseInvoices;
