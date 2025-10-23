import axiosClient from "@/lib/axiosClient";
import type {
  Inventory,
  InventoryInput,
  GetInventoriesResponse,
  SingleInventoryResponse,
  InventoryResponse,
} from "@/types/inventory";
import { buildInventoryPayload } from "@/utils/inventoryPayload";

// ✅ Get all inventories
export const getInventoriesService = async (): Promise<GetInventoriesResponse> => {
  const response = await axiosClient.get<GetInventoriesResponse>("/inventories");
  console.log("getInventoriesService response:", response.data);
  return response.data;
};

// ✅ Get single inventory
export const getInventoryByIdService = async (id: string): Promise<Inventory> => {
  const response = await axiosClient.get<SingleInventoryResponse>(`/inventories/${id}`);
  return response.data.data.inventory;
};

// ✅ Create new inventory (fixed)
export const createInventoryService = async (inventory: InventoryInput): Promise<Inventory> => {
  const payload = buildInventoryPayload(inventory);

  try {
    const response = await axiosClient.post("/inventories", payload);
    console.log("createInventoryService success:", response.data);

    // ✅ السيرفر بيرجع الـ inventory في data.newInventory
    const newInventory = response.data?.data?.newInventory;

    if (!newInventory || !newInventory._id) {
      console.error("createInventoryService unexpected response:", response.data);
      throw new Error("Invalid response from server: inventory data missing.");
    }

    console.log("✅ Created inventory:", newInventory);
    return newInventory;
    
  } catch (error) {
    console.error("createInventoryService error:", error);
    throw error;
  }
};

// ✅ Update inventory
export const updateInventoryService = async (
  id: string,
  updatedData: Partial<InventoryInput>
): Promise<Inventory> => {
  const payload: Record<string, string | number> = {};

  if (updatedData.name !== undefined) payload.name = updatedData.name;
  if (updatedData.location !== undefined) payload.location = updatedData.location;

  if (updatedData.capacity !== undefined || updatedData.capacityUnit !== undefined) {
    if (typeof updatedData.capacity === "number") {
      payload.capacity = updatedData.capacityUnit
        ? `${updatedData.capacity} ${updatedData.capacityUnit}`
        : updatedData.capacity;
    } else if (typeof updatedData.capacity === "string") {
      payload.capacity = updatedData.capacity;
    }
  }

  const response = await axiosClient.patch<SingleInventoryResponse>(`/inventories/${id}`, payload);
  return response.data.data.inventory;
};

// ✅ Delete inventory
export const deleteInventoryService = async (id: string): Promise<string> => {
  const response = await axiosClient.delete<InventoryResponse>(`/inventories/${id}`);
  return response.data.message ?? "Inventory deleted successfully";
};

// ✅ Search inventories
export const searchInventoriesService = async (q: string): Promise<Inventory[]> => {
  const response = await axiosClient.get<GetInventoriesResponse>("/inventories/search", {
    params: { q },
  });
  return response.data.data.inventories || [];
};

// ✅ Get stocks for specific inventory
export const getInventoryStocksService = async (inventoryId: string) => {
  const response = await axiosClient.get(
    `/inventories/${inventoryId}/stocks`
  );
  console.log("getInventoryStocksService response:", response.data);
  return response.data;
};

// ✅ Get all stocks
export const getAllStocksService = async () => {
  // ✅ أضف populate للـ from و to
  const response = await axiosClient.get("/stocks");
  console.log("getAllStocksService response:", response.data);
  return response.data;
};

// ✅ Transfer stock between inventories
interface StockTransferPayload {
  fromInventoryId: string;
  toInventoryId: string;
  productId: string;
  quantity: number;
}

export const transferStockService = async (payload: StockTransferPayload) => {
  const response = await axiosClient.post("/stockTransfer", payload);
  console.log("transferStockService response:", response.data);
  return response.data;
};

// ✅ Get all stock transfers
export const getAllStockTransfersService = async () => {
  const response = await axiosClient.get("/stockTransfer");
  console.log("getAllStockTransfersService response:", response.data);
  return response.data;
};