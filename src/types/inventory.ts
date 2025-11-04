export interface Inventory {
_id?: string;
name: string;
location: string;
capacity: number | string;
capacityUnit?: string;
createdAt?: string;
updatedAt?: string;
}


export type InventoryInput = Omit<Inventory, "_id" | "createdAt" | "updatedAt"> & {
  image?: File | string | null;
};


export interface GetInventoriesResponse {
status: string;
results: number;
data: {
inventories: Inventory[];
};
}


export interface SingleInventoryResponse {
status: string;
data: {
inventory: Inventory;
};
}


export interface InventoryResponse<T = unknown> {
status?: string;
message?: string;
data?: T;
}