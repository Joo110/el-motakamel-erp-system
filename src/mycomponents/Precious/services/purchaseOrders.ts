// src/services/purchaseOrders.ts
import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ---------- Types ---------- */

export type ProductLinePayload = {
  productId: string;
  inventoryId: string;
  name?: string;
  quantity: number;
  price: number;
  discount?: number;
};

export type CreatePurchaseOrderPayload = {
  supplierId: string;
  organizationId?: string;
  products: ProductLinePayload[];
  expectedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  createdBy?: string;
};

export type PurchaseOrderProduct = {
  productId: string;
  name?: string;
  quantity: number;
  deliveredQuantity?: number;
  remainingQuantity?: number;
  price: number;
  discount?: number;
  inventoryId?: string;
  _id?: string;
  total?: number;
};

export type PurchaseOrderResponse = {
  _id: string;
  supplierId: string;
  organizationId?: string;
  products: PurchaseOrderProduct[];
  expectedDeliveryDate?: string;
  currency?: string;
  status?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number;
  invoiceNumber?: string;
  __v?: number;
};

/* ---------- Helpers ---------- */

const BASE = '/purchaseOrders';

function extractPurchasesFromListResponse(resData: any): PurchaseOrderResponse[] {

  if (!resData) return [];
  if (Array.isArray(resData)) return resData as PurchaseOrderResponse[];

  // common structure: { status, results, data: { purchases: [...] } }
  if (resData.data && Array.isArray(resData.data.purchases)) return resData.data.purchases as PurchaseOrderResponse[];

  // sometimes: { purchases: [...] }
  if (Array.isArray(resData.purchases)) return resData.purchases as PurchaseOrderResponse[];

  // maybe the API put the array directly under data but with different key
  if (resData.data && typeof resData.data === 'object') {
    const maybeArray = Object.values(resData.data).find(v => Array.isArray(v)) as any;
    if (Array.isArray(maybeArray)) return maybeArray as PurchaseOrderResponse[];
  }

  return [];
}

/* ---------- Service functions ---------- */

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  config?: AxiosRequestConfig
): Promise<PurchaseOrderResponse> {
  try {
    const { data } = await axiosClient.post(`${BASE}`, payload, config);
    if (data?.data?.purchase) return data.data.purchase;
    if (data?.purchase) return data.purchase;
    return data as PurchaseOrderResponse;
  } catch (error: any) {
    console.error("❌ createPurchaseOrder error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * NOTE:
 * The backend endpoints you showed use this path shape:
 *   /api/v1/purchaseOrders/status=draft
 * So when a status is provided we call: /purchaseOrders/status=<status>
 * (axiosClient should add baseURL like /api/v1 if configured).
 */
export async function getPurchaseOrders(status?: 'draft' | 'approved' | 'delivered') {
  try {
    const url = status ? `${BASE}/status=${status}` : BASE;
    console.log('⤴️ getPurchaseOrders request URL:', url);

    const { data } = await axiosClient.get<any>(url);
    console.log('⤵️ getPurchaseOrders raw response:', data);

    const purchases = extractPurchasesFromListResponse(data);
    console.log('🔎 extracted purchases count:', purchases.length);
    return purchases;
  } catch (err: any) {
    console.error('❌ getPurchaseOrders error:', err.response?.data || err.message);
    throw err;
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: string) {
  const { data } = await axiosClient.get<any>(`${BASE}/${id}`);
  if (data && data.data && (data.data.purchase || data.data.purchases)) {
    if (data.data.purchase) return data.data.purchase as PurchaseOrderResponse;
    if (Array.isArray(data.data.purchases)) return data.data.purchases[0] as PurchaseOrderResponse;
  }
  if (data && data.purchase) return data.purchase as PurchaseOrderResponse;
  return data as PurchaseOrderResponse;
}

// Update purchase order
export async function updatePurchaseOrder(id: string, payload: Partial<CreatePurchaseOrderPayload>) {
  const { data } = await axiosClient.patch<any>(`${BASE}/${id}`, payload);
  if (data && data.data && data.data.purchase) return data.data.purchase as PurchaseOrderResponse;
  return data as PurchaseOrderResponse;
}

// Delete purchase order
export async function deletePurchaseOrder(id: string) {
  const { data } = await axiosClient.delete<{ success: boolean; message?: string }>(`${BASE}/${id}`);
  return data;
}

// Approve purchase order
export async function approvePurchaseOrder(id: string) {
  try {
    const { data } = await axiosClient.patch(`${BASE}/${id}/approve`);
    console.log("Response:", data);
    return data?.data?.purchase || data;
  } catch (error: any) {
    console.error("❌ approvePurchaseOrder error:", error.response?.data || error.message);
    throw error;
  }
}

// Deliver purchase order
export async function deliverPurchaseOrder(id: string) {
  try {
    const { data } = await axiosClient.patch(`${BASE}/${id}/deliver`);
    return data?.data?.purchase || data;
  } catch (error: any) {
    console.error("❌ deliverPurchaseOrder error:", error.response?.data || error.message);
    throw error;
  }
}
