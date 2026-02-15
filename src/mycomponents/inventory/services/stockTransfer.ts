// src/mycomponents/stockTransfer/services/stockTransfer.ts
import axiosClient from "@/lib/axiosClient";

export interface StockTransferProduct {
  productId: string;
  unit: number;
  price: number;
}

export interface StockTransferRequest {
  from: string;
  to: string;
  products: StockTransferProduct[];
  shippingCost?: number;
}

export interface StockTransferResponse {
  status?: string;
  reference?: string;
  from?: string;
  to?: string;
  products?: StockTransferProduct[];
  shippingCost?: number;
  [key: string]: any;
}

export const createStockTransferService = async (
  data: StockTransferRequest
): Promise<any> => {
  const response = await axiosClient.post("/stock-transfers", data);
  return response.data ?? response;
};


export const getStockTransferByRefService = async (
  reference: string
): Promise<any> => {
  const response = await axiosClient.get(`/stock-transfers/${reference}`);
  return response.data ?? response;
};


export const getTransfersByStatusService = async (status: string) => {
  const response = await axiosClient.get(`/stock-transfers`, {
    params: { status },
  });
  return response.data ?? response;
};


export const updateStockTransferShippingCostService = async (
  id: string,
  shippingCost: number
): Promise<any> => {
  const response = await axiosClient.patch(`/stock-transfers/ship/${id}`, {
    shippingCost,
  });
  return response.data ?? response;
};


export const markStockTransferAsShippingService = async (id: string) => {
  const response = await axiosClient.patch(`/stock-transfers/ship/${id}`);
  return response.data ?? response;
};


export const markStockTransferAsDeliveredService = async (id: string) => {
  const response = await axiosClient.patch(`/stock-transfers/deliver/${id}`);
  return response.data ?? response;
};


export const getTransferDocumentService = async (id: string) => {
  const response = await axiosClient.get(`/stock-transfers/document/${id}`, {
    responseType: "arraybuffer",
  });
  return response.data ?? response;
};

export const getAllStockTransfersService = async (params?: Record<string, any>) => {
  const response = await axiosClient.get("/stock-transfers", { params });
  return response.data ?? response;
};
