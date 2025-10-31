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
  shippingCost: number;
}

export interface StockTransferResponse {
  status: string;
  reference: string;
  from: string;
  to: string;
  products: StockTransferProduct[];
  shippingCost: number;
}


export const createStockTransferService = async (
  data: StockTransferRequest
): Promise<StockTransferResponse> => {
  const response = await axiosClient.post<StockTransferResponse>(
    "/stockTransfer",
    data
  );
  return response.data;
};

export const getStockTransferByRefService = async (
  reference: string
): Promise<StockTransferResponse> => {
  const response = await axiosClient.get<StockTransferResponse>(
    `/stockTransfer/${reference}`
  );
  return response.data;
};