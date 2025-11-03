// src/services/purchaseOrders.ts
import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ----------------------
   TYPES
   ---------------------- */

export type PurchaseOrderProductPayload = {
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
  products: PurchaseOrderProductPayload[];
  expectedDeliveryDate?: string;
  currency?: string;
  notes?: string;
  createdBy?: string;
};

export type PurchaseOrderProduct = PurchaseOrderProductPayload & {
  _id?: string;
  total?: number;
};

export type PurchaseOrder = {
  _id: string;
  supplierId?: string;
  organizationId?: string;
  products: PurchaseOrderProduct[];
  expectedDeliveryDate?: string;
  currency?: string;
  status?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  invoiceNumber?: string;
  totalAmount?: number;
  [k: string]: any;
};

/* ----------------------
   HELPERS
   ---------------------- */

const BASE = '/saleOrders';

function extractListFromResponse(resData: any): PurchaseOrder[] {
  if (!resData) return [];

  if (resData.data && Array.isArray(resData.data.purchases)) return resData.data.purchases as PurchaseOrder[];
  if (Array.isArray(resData.purchases)) return resData.purchases as PurchaseOrder[];
  if (Array.isArray(resData.purchaseOrders)) return resData.purchaseOrders as PurchaseOrder[];
  if (Array.isArray(resData.data)) return resData.data as PurchaseOrder[];
  if (Array.isArray(resData)) return resData as PurchaseOrder[];

  if (resData.data && typeof resData.data === 'object') {
    const maybe = Object.values(resData.data).find((v) => Array.isArray(v));
    if (Array.isArray(maybe)) return maybe as PurchaseOrder[];
  }

  return [];
}

function extractSingleFromResponse(resData: any): PurchaseOrder | null {
  if (!resData) return null;
  if (resData.data && resData.data.purchase) return resData.data.purchase as PurchaseOrder;
  if (resData.purchase) return resData.purchase as PurchaseOrder;
  if (resData.data && Array.isArray(resData.data.purchases)) return resData.data.purchases[0] ?? null;
  if (resData._id) return resData as PurchaseOrder;
  return null;
}

/* ----------------------
   SERVICE FUNCTIONS
   ---------------------- */

export async function getsalesOrders(status?: 'draft' | 'approved' | 'delivered', config?: AxiosRequestConfig): Promise<PurchaseOrder[]> {
  const url = status ? `${BASE}/status=${status}` : BASE;
  const { data } = await axiosClient.get(url, config);
  return extractListFromResponse(data);
}


export async function getsaleseOrderById(id: string, config?: AxiosRequestConfig): Promise<PurchaseOrder | null> {
  const { data } = await axiosClient.get(`${BASE}/${id}`, config);
  return data?.data?.saleOrder ?? null;
}


export async function createsaleseOrder(payload: CreatePurchaseOrderPayload, config?: AxiosRequestConfig): Promise<PurchaseOrder> {
  const { data } = await axiosClient.post(BASE, payload, config);
  const single = extractSingleFromResponse(data);
  if (single) return single;
  return data as PurchaseOrder;
}

export async function updatePurchaseOrder(id: string, payload: Partial<CreatePurchaseOrderPayload>, config?: AxiosRequestConfig): Promise<PurchaseOrder | null> {
  const { data } = await axiosClient.patch(`${BASE}/${id}`, payload, config);
  return extractSingleFromResponse(data);
}

export async function deletesaleseOrder(id: string, config?: AxiosRequestConfig): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.delete(`${BASE}/${id}`, config);
  return data ?? null;
}

/* ----------------------
   ✅ NEW PATCH ENDPOINTS
   ---------------------- */

// Approve sale order
// Approve sale order
export async function approveSaleOrder(id: string): Promise<PurchaseOrder | null> {
  const { data } = await axiosClient.patch(`${BASE}/${id}/approve`);
  return extractSingleFromResponse(data);
}

export async function markSaleOrderDelivered(id: string): Promise<PurchaseOrder | null> {
  const { data } = await axiosClient.get(`${BASE}/${id}/deliver`);
  return extractSingleFromResponse(data);
}