import { useCallback, useEffect, useRef, useState } from "react";
import type { Inventory, InventoryInput } from "@/types/inventory";
import {
  getInventoriesService,
  createInventoryService,
  updateInventoryService,
  deleteInventoryService,
  searchInventoriesService,
  transferStockService,
  getAllStocksService,
  getAllStockTransfersService,
  getInventoryStocksService,
  addStockToInventoryService,
} from "@/mycomponents/inventory/services/inventories";

const isAbortError = (err: unknown) => {
  if (typeof err !== "object" || err === null) return false;
  const name = (err as { name?: unknown }).name;
  return name === "CanceledError" || name === "AbortError";
};

export const useInventories = () => {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await getInventoriesService();
      setInventories(response.data.inventories || []);
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setError(err as Error);
      console.error("fetchAll inventories error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchAll]);

  const refetch = useCallback(() => fetchAll(), [fetchAll]);

  const create = useCallback(async (payload: InventoryInput) => {
    setIsMutating(true);
    setError(null);
    try {
let formData: FormData;

if (payload instanceof FormData) {
  formData = payload;
} else {
  formData = new FormData();
  formData.append("name", payload.name);
  formData.append("location", payload.location);
  formData.append("capacity", String(payload.capacity));

  if ((payload as any).image instanceof File) {
    formData.append("avatar", (payload as any).image);
  }
}

const newInventory = await createInventoryService(formData);
      setInventories((prev) => [newInventory, ...prev]);
      return newInventory;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<InventoryInput>) => {
    setIsMutating(true);
    setError(null);
    try {
      const updated = await updateInventoryService(id, data);
      setInventories((prev) => prev.map((i) => (i._id === id ? updated : i)));
      return updated;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const getStocks = useCallback(async (inventoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventoryStocksService(inventoryId);
      return data;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllStocksService();
      return data;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllStockTransfers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllStockTransfersService();
      return data;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transferStock = useCallback(
    async (fromInventoryId: string, toInventoryId: string, productId: string, quantity: number) => {
      setIsMutating(true);
      setError(null);
      try {
        const payload = { fromInventoryId, toInventoryId, productId, quantity };
        const result = await transferStockService(payload);
        return result;
      } catch (err: unknown) {
        setError(err as Error);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

    const addStockToInventory = useCallback(
    async (inventoryId: string, productId: string, quantity: number) => {
      setIsMutating(true);
      setError(null);
      try {
        const payload = { productId, quantity };
        const result = await addStockToInventoryService(inventoryId, payload);
        return result;
      } catch (err: unknown) {
        setError(err as Error);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );


  const remove = useCallback(async (id: string) => {
    setIsMutating(true);
    setError(null);
    try {
      await deleteInventoryService(id);
      setInventories((prev) => prev.filter((i) => i._id !== id));
      return true;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchInventoriesService(query);
      setInventories(results);
      return results;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    inventories,
    isLoading,
    isMutating,
    error,
    addStockToInventory,
    refetch,
    create,
    update,
    remove,
    search,
    getStocks,
    getAllStocks,
    getAllStockTransfers,
    transferStock,
  } as const;
};
