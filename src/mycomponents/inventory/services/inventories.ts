// services/inventories.ts
import axiosClient from "@/lib/axiosClient";
import type {
  Inventory,
  InventoryInput,
} from "@/types/inventory";

/**
 * Helpers
 */
const normalizeInventory = (item: any): Inventory => {
  const _id = item._id ?? item.id ?? item._id_str ?? "";

  return {
    _id,
    name: item.name ?? item.title ?? "",
    avatar: item.avatar ?? item.image ?? item.avatarUrl ?? "",
    location: item.location ?? item.address ?? "",
    capacity: item.capacity ?? item.totalCapacity ?? 0,
    currentCapacity: item.currentCapacity ?? item.current_capacity ?? item.current ?? undefined,
    description: item.description ?? "",
    status: item.status ?? "",
    isActive: item.isActive ?? (item.status ? item.status === "active" : true),
    createdAt: item.createdAt ?? item.created_at ?? item.createdAt,
    updatedAt: item.updatedAt ?? item.updated_at ?? item.updatedAt,
  } as unknown as Inventory;
};

/**
 * Parse list response (supports old & new shapes)
 */
const parseListResponse = (payload: any) => {
  if (Array.isArray(payload?.data)) {
    const itemsRaw = payload.data;
    const items = itemsRaw.map(normalizeInventory);
    return {
      items,
      results: payload.results ?? items.length,
      paginationResult: payload.paginationResult ?? undefined,
      raw: payload,
    };
  }

  if (Array.isArray(payload?.data?.inventories)) {
    const itemsRaw = payload.data.inventories;
    const items = itemsRaw.map(normalizeInventory);
    return {
      items,
      results: payload.result ?? items.length,
      paginationResult: undefined,
      raw: payload,
    };
  }

  if (Array.isArray(payload)) {
    const items = payload.map(normalizeInventory);
    return { items, results: items.length, paginationResult: undefined, raw: payload };
  }

  return { items: [], results: 0, paginationResult: undefined, raw: payload };
};

/**
 * Get all inventories
 */
export const getInventoriesService = async () => {
  const response = await axiosClient.get("/inventories");
  console.log("getInventoriesService response:", response.data);
  const parsed = parseListResponse(response.data);
  return parsed;
};

/**
 * Get single inventory by id
 */
export const getInventoryByIdService = async (id: string): Promise<Inventory> => {
  const response = await axiosClient.get(`/inventories/${id}`);
  console.log("getInventoryByIdService response:", response.data);
  const payload = response.data;

  let itemRaw: any = undefined;
  if (payload?.data?.inventory) itemRaw = payload.data.inventory;
  else if (payload?.data && !Array.isArray(payload.data)) itemRaw = payload.data;
  else if (payload?.data && Array.isArray(payload.data) && payload.data.length) itemRaw = payload.data[0];
  else if (payload?.inventory) itemRaw = payload.inventory;
  else itemRaw = payload;

  return normalizeInventory(itemRaw);
};

/**
 * Create new inventory (FormData)
 */
export const createInventoryService = async (payload: FormData) => {
  try {
    const response = await axiosClient.post("/inventories", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("createInventoryService response:", response.data);

    const createdRaw = response.data?.data ?? response.data;
    const itemRaw = createdRaw?.inventory ?? (Array.isArray(createdRaw) ? createdRaw[0] : createdRaw);
    return normalizeInventory(itemRaw);
  } catch (error) {
    console.error("createInventoryService error:", error);
    throw error;
  }
};

/**
 * Update inventory
 */
export const updateInventoryService = async (
  id: string,
  updatedData: Partial<InventoryInput>,
  file?: File
): Promise<Inventory> => {
  let dataToSend: any;
  const headers: Record<string, string> = {};

  if (file) {
    const form = new FormData();
    if (updatedData.name !== undefined) form.append("name", updatedData.name as string);
    if (updatedData.location !== undefined) form.append("location", updatedData.location as string);
    if (updatedData.capacity !== undefined) form.append("capacity", String(updatedData.capacity));
    form.append("avatar", file);
    dataToSend = form;
    headers["Content-Type"] = "multipart/form-data";
  } else {
    dataToSend = updatedData;
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await axiosClient.patch(`/inventories/${id}`, dataToSend, { headers });
    console.log("updateInventoryService response:", response.data);

    const payload = response.data;
    let itemRaw: any;
    itemRaw = payload?.data?.updatedInventory ?? payload?.data ?? payload?.updatedInventory ?? payload;
    if (payload?.data?.inventory) itemRaw = payload.data.inventory;

    return normalizeInventory(itemRaw);
  } catch (error) {
    console.error("updateInventoryService error:", error);
    throw error;
  }
};

/**
 * Delete inventory
 */
export const deleteInventoryService = async (id: string): Promise<string> => {
  const response = await axiosClient.delete(`/inventories/${id}`);
  console.log("deleteInventoryService response:", response.data);
  return response.data?.message ?? "Inventory deleted successfully";
};

/**
 * Search inventories
 */
export const searchInventoriesService = async (q: string): Promise<Inventory[]> => {
  const response = await axiosClient.get("/inventories/search", {
    params: { q },
  });
  console.log("searchInventoriesService response:", response.data);
  const parsed = parseListResponse(response.data);
  return parsed.items;
};

/**
 * ✅ FIXED: Get inventory stocks
 * Uses the correct endpoint: /stocks/stocks/{inventoryId}
 */
export const getInventoryStocksService = async (inventoryId: string) => {
  try {
    const response = await axiosClient.get(`/stocks/stocks/${inventoryId}`);
    console.log("✅ getInventoryStocksService response:", response.data);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.error("❌ getInventoryStocksService error:", error);
    throw error;
  }
};

export const getAllStocksService = async () => {
  const response = await axiosClient.get("/stock-transfers");
  console.log("getAllStocksService response:", response.data);
  return response.data?.data ?? response.data;
};

interface StockTransferPayload {
  fromInventoryId: string;
  toInventoryId: string;
  productId: string;
  quantity: number;
}

export const addStockToInventoryService = async (
  inventoryId: string,
  payload: { productId: string; quantity: number }
) => {
  const response = await axiosClient.post(`/stocks/${inventoryId}`, payload);
  console.log("addStockToInventoryService response:", response.data);
  return response.data?.data ?? response.data;
};

export const transferStockService = async (payload: StockTransferPayload) => {
  const response = await axiosClient.post("/stockTransfer", payload);
  console.log("transferStockService response:", response.data);
  return response.data?.data ?? response.data;
};

export const getAllStockTransfersService = async () => {
  const response = await axiosClient.get("/stock-transfers");
  console.log("getAllStockTransfersService response:", response.data);
  return response.data?.data ?? response.data;
};