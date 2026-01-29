// src/mycomponents/Precious/hooks/useSaleOrders.ts
import { useCallback, useEffect, useState } from 'react';
import type { CreatePurchaseOrderPayload, PurchaseOrder } from '../services/saleOrders';
import {
  getsalesOrders,
  getsaleseOrderById,
  createsaleseOrder,
  updatePurchaseOrder,
  deletesaleseOrder,
  approveSaleOrder,
  shipSaleOrder,
  deliverSaleOrder,
  cancelSaleOrder,
} from '../services/saleOrders';

export function useSaleOrders(initialParams?: Record<string, any>, autoFetch = true) {
  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  /**
   * fetch:
   * - fetch() -> uses stored params
   * - fetch({ page:1 }) -> uses provided params
   * - fetch('approved') -> uses status
   * - fetch('approved', { page:1 }) -> status + params
   */
  const fetch = useCallback(async (maybeStatusOrParams?: any, maybeExtraParams?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      let status: 'draft' | 'approved' | 'delivered' | undefined;
      let mergedParams: Record<string, any> = {};

      if (typeof maybeStatusOrParams === 'string') {
        status = maybeStatusOrParams as 'draft' | 'approved' | 'delivered';
        mergedParams = { ...(maybeExtraParams ?? {}) };
      } else if (maybeStatusOrParams && typeof maybeStatusOrParams === 'object') {
        mergedParams = { ...(maybeStatusOrParams ?? {}) };
      } else {
        mergedParams = { ...(params ?? {}) };
      }

      // ensure mergedParams is an object and not null
      mergedParams = mergedParams && typeof mergedParams === 'object' ? mergedParams : {};

      // Build config only if there are params to send
      const config = Object.keys(mergedParams).length ? { params: mergedParams } : undefined;

      // Call service. getsalesOrders supports both signatures.
      const list = status ? await getsalesOrders(status, config) : await getsalesOrders(config);
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
  }, [params]);

  const create = useCallback(async (payload: CreatePurchaseOrderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createsaleseOrder(payload);
      // prepend new item if valid
      if (created) setItems((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to create sale order');
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
      await deletesaleseOrder(id);
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

  // Approve
  const approve = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await approveSaleOrder(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to approve sale order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ship
  const ship = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await shipSaleOrder(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to mark sale order as shipped');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Deliver
  const deliver = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await deliverSaleOrder(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to mark sale order as delivered');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel
  const cancel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await cancelSaleOrder(id);
      if (updated) setItems((prev) => prev.map((it) => (it._id === id ? updated : it)));
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to cancel sale order');
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetch(params);
  }, [autoFetch, fetch, params]);

  return {
    items,
    loading,
    error,
    params,
    setParams,
    fetch,
    create,
    update,
    remove,
    approve,
    ship,
    deliver,
    cancel,
    setItems,
  } as const;
}

/* hook for single purchase/sale order */
export function usePurchaseOrder(id?: string) {
  const [item, setItem] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (idToFetch?: string) => {
    const realId = idToFetch ?? id;
    if (!realId) {
      // don't throw so components can mount without immediate id
      setItem(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const got = await getsaleseOrderById(realId);
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

  const patch = useCallback(async (payload: Partial<CreatePurchaseOrderPayload>) => {
    if (!id) throw new Error('Missing order id to update');
    setLoading(true);
    setError(null);
    try {
      const updated = await updatePurchaseOrder(id, payload);
      setItem(updated);
      return updated;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to update sale order');
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
