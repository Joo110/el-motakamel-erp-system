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

  // fetch all inventories (supports several response shapes)
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response: any = await getInventoriesService();

      // support multiple response shapes:
      // - service might already return parsed { items: Inventory[], ... }
      // - or might return { data: Inventory[], ... }
      // - or might return Inventory[] directly
      let items: Inventory[] = [];

      if (!response) {
        items = [];
      } else if (Array.isArray(response)) {
        items = response;
      } else if (Array.isArray(response.items)) {
        items = response.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        // nested data.data sometimes
        items = response.data.data;
      } else {
        // fallback: try to find first array field
        const possibleArray = Object.values(response).find((v) => Array.isArray(v));
        items = Array.isArray(possibleArray) ? (possibleArray as Inventory[]) : [];
      }

      setInventories(items || []);
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

  const create = useCallback(async (payload: InventoryInput | FormData) => {
    setIsMutating(true);
    setError(null);
    try {
      let formData: FormData;

      if (payload instanceof FormData) {
        formData = payload;
      } else {
        formData = new FormData();
        formData.append("name", (payload as any).name);
        formData.append("location", (payload as any).location);
        formData.append("capacity", String((payload as any).capacity ?? 0));

        if ((payload as any).image instanceof File) {
          formData.append("avatar", (payload as any).image);
        }
      }

      const newInventory = await createInventoryService(formData);
      // newInventory should be normalized object
      setInventories((prev) => [newInventory, ...prev]);
      return newInventory;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, data: Partial<InventoryInput>, file?: File) => {
      setIsMutating(true);
      setError(null);
      try {
        const updated = await updateInventoryService(id, data, file);
        // updated is normalized
        setInventories((prev) =>
          prev.map((i) => {
            // match by either _id or id
            if ((i as any)._id && (updated as any)._id) return (i as any)._id === (updated as any)._id ? updated : i;
            if ((i as any).id && (updated as any).id) return (i as any).id === (updated as any).id ? updated : i;
            return i;
          })
        );
        return updated;
      } catch (err: unknown) {
        setError(err as Error);
        throw err;
      } finally {
        setIsMutating(false);
      }
    },
    []
  );

  const getStocks = useCallback(async (inventoryId: string) => {
    // don't flip global isLoading here; caller (component) uses its own stocksLoading.
    try {
      const data = await getInventoryStocksService(inventoryId);
      return data;
    } catch (err: unknown) {
      setError(err as Error);
      throw err;
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
      setInventories((prev) => prev.filter((i) => (i as any)._id !== id && (i as any).id !== id));
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
      // results are normalized Inventory[]
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
