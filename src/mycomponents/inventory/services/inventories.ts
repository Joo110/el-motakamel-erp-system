import axiosClient from "@/lib/axiosClient";
import type {
  Inventory,
  InventoryInput,
  GetInventoriesResponse,
  SingleInventoryResponse,
  InventoryResponse,
} from "@/types/inventory";



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
// inventories.ts
export const createInventoryService = async (payload: FormData) => {
  try {
    const response = await axiosClient.post('/inventories', payload, {
      headers: {
        'Content-Type': 'multipart/form-data', // ⭐️ ده المهم
      },
    });
    return response.data;
  } catch (error) {
    console.error('createInventoryService error:', error);
    throw error;
  }
};

// ✅ Update inventory
export const updateInventoryService = async (
  id: string,
  updatedData: Partial<InventoryInput>,
  file?: File
): Promise<Inventory> => {
  const form = new FormData();

  if (updatedData.name !== undefined) form.append('name', updatedData.name);
  if (updatedData.location !== undefined) form.append('location', updatedData.location);

  if (updatedData.capacity !== undefined || updatedData.capacityUnit !== undefined) {
    let capacityValue: string | number = updatedData.capacity || '';
    if (typeof updatedData.capacity === "number" && updatedData.capacityUnit) {
      capacityValue = `${updatedData.capacity} ${updatedData.capacityUnit}`;
    }
    form.append('capacity', String(capacityValue));
  }

  if (file) {
    form.append('avatar', file);
  }

  try {
    const response = await axiosClient.patch<SingleInventoryResponse>(`/inventories/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.inventory;
  } catch (error) {
    console.error('updateInventoryService error:', error);
    throw error;
  }
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
// services/inventories.ts
export const getInventoryStocksService = async (inventoryId: string) => {
  const response = await axiosClient.get(`/inventories/${inventoryId}/stocks`);
  console.log("getInventoryStocksService response:", response.data);
  return response.data.data;
};


// ✅ Get all stocks
export const getAllStocksService = async () => {
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

// ✅ Add stock to specific inventory
export const addStockToInventoryService = async (
  inventoryId: string,
  payload: { productId: string; quantity: number }
) => {
  const response = await axiosClient.post(`/inventories/${inventoryId}/stock`, payload);
  console.log("addStockToInventoryService response:", response.data);
  return response.data;
};


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