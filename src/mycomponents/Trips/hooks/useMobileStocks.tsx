// src/hooks/useMobileStocks.ts
import { useCallback, useEffect, useState } from "react";
import {
  getMobileStocksService,
  getMobileStockByIdService,
  createMobileStockService,
  updateMobileStockService,
  deleteMobileStockService,
  type MobileStock,
  type PaginatedResult,
} from "../services/mobileStocksService";
import { toast } from "react-hot-toast";

export function useMobileStocks(initialParams?: Record<string, any>) {
  const [mobileStocks, setMobileStocks] = useState<MobileStock[]>([]);
  const [meta, setMeta] = useState<{ total?: number; page?: number; limit?: number; [key: string]: any } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const effectiveParams = p ?? params;
        const res: PaginatedResult<MobileStock> = await getMobileStocksService(effectiveParams);
        setMobileStocks(res.items ?? []);
        setMeta({
          total: res.meta?.total,
          page: res.meta?.page,
          limit: res.meta?.limit,
          totalPages: res.meta?.totalPages,
          next: res.meta?.next,
        });
        return res;
      } catch (err) {
        console.error("useMobileStocks: fetch error", err);
        setError(err);
        toast.error("Error fetching mobile stocks.");
        return { items: [], meta: undefined } as PaginatedResult<MobileStock>;
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    void fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch]);

  const refresh = useCallback(
    async (p?: Record<string, any>) => {
      if (p) setParams(p);
      return await fetch(p);
    },
    [fetch]
  );

  const getById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const item = await getMobileStockByIdService(id);
      return item;
    } catch (err) {
      console.error("getById failed", err);
      setError(err);
      toast.error("Error fetching item.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (payload: Record<string, any> | FormData) => {
      setLoading(true);
      try {
        const res = await createMobileStockService(payload);
        toast.success("✅ Created successfully");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("createItem failed", err);
        setError(err);
        const msg = err?.response?.data?.message ?? err?.message ?? "Create failed";
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const updateItem = useCallback(
    async (id: string, payload: Record<string, any> | FormData) => {
      setLoading(true);
      try {
        const res = await updateMobileStockService(id, payload);
        toast.success("✅ Updated successfully");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("updateItem failed", err);
        setError(err);
        const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const res = await deleteMobileStockService(id);
        toast.success("✅ Deleted successfully");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("deleteItem failed", err);
        setError(err);
        const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  return {
    mobileStocks,
    meta,
    loading,
    error,
    params,
    setParams,
    refresh,
    fetch,
    getById,
    createItem,
    updateItem,
    deleteItem,
  };
}

export default useMobileStocks;
