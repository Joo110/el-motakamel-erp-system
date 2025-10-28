// src/hooks/useSaleOrders.ts
import { useCallback, useEffect, useState } from 'react';
import type { SaleOrder, CreateSaleOrderPayload } from '../services/saleOrders';
import {
  getSaleOrders,
  getSaleOrderById,
  createSaleOrder,
  updateSaleOrder,
  deleteSaleOrder,
} from '../services/saleOrders';

/**
 * useSaleOrdersList - list + create/update/delete helpers
 * @param initialStatus optional status filter to fetch automatically (e.g. 'approved' | 'delivered' | 'draft')
 * @param autoFetch whether to fetch on mount
 */
export function useSaleOrdersList(initialStatus?: string, autoFetch = true) {
  const [items, setItems] = useState<SaleOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getSaleOrders(status ?? initialStatus);
      setItems(list);
      return list;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to load sale orders');
      setError(e);
      setItems([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialStatus]);

  const create = useCallback(async (payload: CreateSaleOrderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createSaleOrder(payload);
      setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create sale order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: Partial<CreateSaleOrderPayload>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateSaleOrder(id, payload);
      if (updated) {
        setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      }
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update sale order');
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
      await deleteSaleOrder(id);
      setItems((prev) => prev.filter((it) => it._id !== id));
      return true;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to delete sale order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetch(initialStatus);
  }, [autoFetch, fetch, initialStatus]);

  return { items, loading, error, fetch, create, update, remove, setItems } as const;
}

/**
 * useSaleOrder - single sale order hook
 */
export function useSaleOrder(id?: string) {
  const [item, setItem] = useState<SaleOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (idToFetch?: string) => {
    const realId = idToFetch ?? id;
    if (!realId) throw new Error('Missing id to fetch sale order');
    setLoading(true);
    setError(null);
    try {
      const got = await getSaleOrderById(realId);
      setItem(got);
      return got;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch sale order');
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