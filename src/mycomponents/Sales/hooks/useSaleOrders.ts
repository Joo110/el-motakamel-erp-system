import { useCallback, useEffect, useState } from 'react';
import type { CreatePurchaseOrderPayload, PurchaseOrder } from '../services/saleOrders';
import {
  getsalesOrders,
  getsaleseOrderById,
  createsaleseOrder,
  updatePurchaseOrder,
  deletesaleseOrder,
  approveSaleOrder,
  markSaleOrderDelivered,
} from '../services/saleOrders';

export function useSaleOrders(initialStatus?: 'draft' | 'approved' | 'delivered', autoFetch = true) {
  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (status?: 'draft' | 'approved' | 'delivered') => {
    setLoading(true);
    setError(null);
    try {
      const list = await getsalesOrders(status ?? initialStatus);
      setItems(list);
      return list;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load purchase orders');
      setError(e);
      setItems([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  const create = useCallback(async (payload: CreatePurchaseOrderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createsaleseOrder(payload);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create purchase order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: Partial<CreatePurchaseOrderPayload>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updatePurchaseOrder(id, payload);
      if (updated) {
        setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      }
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update purchase order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletesaleseOrder(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to delete purchase order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Approve order
  const approve = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const updated = await approveSaleOrder(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Mark delivered
  const markDelivered = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const updated = await markSaleOrderDelivered(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetch(initialStatus);
  }, [autoFetch, fetch, initialStatus]);

  return { items, loading, error, fetch, create, update, remove, approve, markDelivered, setItems } as const;
}

export function usePurchaseOrder(id?: string) {
  const [item, setItem] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (idToFetch?: string) => {
    const realId = idToFetch ?? id;
    if (!realId) throw new Error('Missing id to fetch purchase order');
    setLoading(true);
    setError(null);
    try {
      const got = await getsaleseOrderById(realId);
      setItem(got);
      return got;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch purchase order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ✅ PATCH (Update existing sale order)
  const patch = useCallback(async (payload: Partial<CreatePurchaseOrderPayload>) => {
    if (!id) throw new Error('Missing order id to update');
    setLoading(true);
    setError(null);
    try {
      const updated = await updatePurchaseOrder(id, payload);
      setItem(updated);
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update purchase order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetch(id);
  }, [id, fetch]);

  return { item, loading, error, fetch, patch, setItem } as const;
}