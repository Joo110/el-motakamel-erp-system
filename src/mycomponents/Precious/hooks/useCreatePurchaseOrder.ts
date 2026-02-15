// src/hooks/usePurchaseOrders.ts
import { useCallback, useEffect, useState } from 'react';
import type { CreatePurchaseOrderPayload, PurchaseOrderResponse } from '../services/purchaseOrders';
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  approvePurchaseOrder,
  deliverPurchaseOrder,
  cancelPurchaseOrder,
} from '../services/purchaseOrders';

/* ---------- useCreatePurchaseOrder ---------- */
export function useCreatePurchaseOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<PurchaseOrderResponse | null>(null);

  const create = useCallback(async (payload: CreatePurchaseOrderPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createPurchaseOrder(payload);
      setData(res);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error, data } as const;
}

/* ---------- usePurchaseOrdersList ---------- */
export function usePurchaseOrdersList(
  status: 'draft' | 'approved' | 'delivered' | undefined = 'approved'
) {
  const [items, setItems] = useState<PurchaseOrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (statusToFetch?: 'draft' | 'approved' | 'delivered') => {
      setLoading(true);
      setError(null);
      try {
        const purchases = await getPurchaseOrders(statusToFetch ?? status);
        setItems(purchases);

        console.log('🔎 extracted purchases count:', purchases.length);

        return purchases;
      } catch (err) {
        const e = err as Error;
        setError(e);
        setItems([]);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    void fetch(status);
  }, [fetch, status]);

  return { items, loading, error, fetch, setItems } as const;
}

/* ---------- usePurchaseOrder (single) ---------- */
export function usePurchaseOrder(id?: string) {
  const [item, setItem] = useState<PurchaseOrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(
    async (idToFetch?: string) => {
      const realId = idToFetch ?? id;
      // Note: do not throw on missing id so component can call hook without immediate crash
      if (!realId) {
        setItem(null);
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getPurchaseOrderById(realId);
        setItem(data);
        return data;
      } catch (err) {
        const e = err as Error;
        setError(e);
        setItem(null);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const patch = useCallback(
    async (patchPayload: Partial<CreatePurchaseOrderPayload>) => {
      if (!id) throw new Error('Missing id to update purchase order');
      setLoading(true);
      setError(null);
      try {
        const updated = await updatePurchaseOrder(id, patchPayload);
        setItem(updated);
        return updated;
      } catch (err) {
        const e = err as Error;
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  const approve = useCallback(async () => {
    if (!id) throw new Error('Missing id to approve purchase order');
    setLoading(true);
    setError(null);
    try {
      const res = await approvePurchaseOrder(id);
      // If API returns the updated order normalize/assign it
      if (res && typeof res === 'object') {
        setItem(res as PurchaseOrderResponse);
      }
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const deliver = useCallback(async () => {
    if (!id) throw new Error('Missing id to deliver purchase order');
    setLoading(true);
    setError(null);
    try {
      const res = await deliverPurchaseOrder(id);
      if (res && typeof res === 'object') {
        setItem(res as PurchaseOrderResponse);
      }
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const cancel = useCallback(async (status: string = 'canceled') => {
    if (!id) throw new Error('Missing id to cancel purchase order');
    setLoading(true);
    setError(null);
    try {
      const res = await cancelPurchaseOrder(id, { status });
      // backend may or may not return the updated purchase - if it does, set it
      if (res && typeof res === 'object' && (res._id || (res as any).id || (res as any).status)) {
        setItem(res as PurchaseOrderResponse);
      }
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const remove = useCallback(async () => {
    if (!id) throw new Error('Missing id to delete purchase order');
    setLoading(true);
    setError(null);
    try {
      const res = await deletePurchaseOrder(id);
      setItem(null);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetch(id);
  }, [id, fetch]);

  return { item, loading, error, fetch, patch, remove, approve, deliver, cancel } as const;
}
