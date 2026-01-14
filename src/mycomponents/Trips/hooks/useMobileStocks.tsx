// File: src/mycomponents/mobileStocks/hooks/useMobileStocks.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getMobileStocksService,
  getMobileStockByIdService,
  createMobileStockService,
  updateMobileStockService,
  deleteMobileStockService,
  type MobileStock,
} from "../services/mobileStocksService";
import { toast } from "react-hot-toast";

export function useMobileStocks(initialParams?: Record<string, any>) {
  const [mobileStocks, setMobileStocks] = useState<MobileStock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getMobileStocksService(p ?? params);
      setMobileStocks(list);
      return list;
    } catch (err) {
      console.error("useMobileStocks: fetch error", err);
      setError(err);
      toast.error("Error fetching mobile stocks.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const refresh = useCallback(async (p?: Record<string, any>) => {
    setParams(p ?? params);
    return await fetch(p);
  }, [fetch, params]);

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

  const createItem = useCallback(async (payload: Record<string, any> | FormData) => {
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
  }, [fetch]);

  const updateItem = useCallback(async (id: string, payload: Record<string, any> | FormData) => {
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
  }, [fetch]);

  const deleteItem = useCallback(async (id: string) => {
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
  }, [fetch]);

  return {
    mobileStocks,
    loading,
    error,
    params,
    refresh,
    fetch,
    getById,
    createItem,
    updateItem,
    deleteItem,
  };
}

export default useMobileStocks;