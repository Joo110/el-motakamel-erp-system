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


// ✅ إنشاء تحويل مخزون جديد
export const createStockTransferService = async (
  data: StockTransferRequest
): Promise<StockTransferResponse> => {
  const response = await axiosClient.post<StockTransferResponse>(
    "/stockTransfer",
    data
  );
  return response.data;
};

// ✅ الحصول على تحويل محدد بالـ reference
export const getStockTransferByRefService = async (
  reference: string
): Promise<StockTransferResponse> => {
  const response = await axiosClient.get<StockTransferResponse>(
    `/stockTransfer/${reference}`
  );
  return response.data;
};

// ✅ جلب التحويلات بحالة "Draft"
export const getDraftStockTransfersService = async () => {
  const response = await axiosClient.get("/stockTransfer/status=draft");
  return response.data;
};

// ✅ تحديث حالة التحويل إلى "Shipping"
export const markStockTransferAsShippingService = async (
  id: string
): Promise<StockTransferResponse> => {
  const response = await axiosClient.patch<StockTransferResponse>(
    `/stockTransfer/${id}/shipping`
  );
  return response.data;
};

// ✅ جلب التحويلات بحالة "Shipped"
export const getShippedStockTransfersService = async () => {
  const response = await axiosClient.get("/stockTransfer/status=shipped");
  return response.data;
};

// ✅ تحديث حالة التحويل إلى "Delivered"
export const markStockTransferAsDeliveredService = async (
  id: string
): Promise<StockTransferResponse> => {
  const response = await axiosClient.patch<StockTransferResponse>(
  `/stockTransfer/${id}/delivered`
);
  return response.data;
};

// ✅ جلب التحويلات بحالة "Delivered"
export const getDeliveredStockTransfersService = async () => {
  const response = await axiosClient.get("/stockTransfer/status=delivered");
  return response.data;
};

// ✅ جلب تحويل "Delivered" معين بالـ id
export const getDeliveredStockTransferByIdService = async (
  id: string
): Promise<StockTransferResponse> => {
  const response = await axiosClient.get<StockTransferResponse>(
    `/stockTransfer/status=delivered/${id}`
  );
  return response.data;
};