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
  // يدعم أشكال مختلفة من الريسبونس:
  // - { data: { purchases: [...] } }
  // - { purchases: [...] }
  // - [...]
  if (!resData) return [];
  if (Array.isArray(resData)) return resData as PurchaseOrderResponse[];

  if (resData.data && Array.isArray(resData.data.purchases)) return resData.data.purchases as PurchaseOrderResponse[];

  if (Array.isArray(resData.purchases)) return resData.purchases as PurchaseOrderResponse[];

  // else: حاول إيجاد أي مصفوفة تحت data
  if (resData.data) {
    const maybe = Object.values(resData.data).find((v) => Array.isArray(v)) as any;
    if (Array.isArray(maybe)) return maybe as PurchaseOrderResponse[];
  }

  return [];
}

/* ---------- Service functions ---------- */

// Create a purchase order
export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  config?: AxiosRequestConfig
): Promise<PurchaseOrderResponse> {
  const { data } = await axiosClient.post(`${BASE}`, payload, config);
  // بعض الباكندات يرجعوا الغرض مباشرة أو داخل data
  if (data && data.data && data.data.purchase) return data.data.purchase as PurchaseOrderResponse;
  if (data && data.purchase) return data.purchase as PurchaseOrderResponse;
  // افترض أن body نفسه هو الـ resource
  return data as PurchaseOrderResponse;
}

// Get purchase orders (optionally by status)
export async function getPurchaseOrders(status?: 'draft' | 'approved' | 'delivered') {
  // نمرّر status كـ query param للحصول على مرونة
  const { data } = await axiosClient.get<any>(`${BASE}`, {
    params: status ? { status } : {},
  });

  return extractPurchasesFromListResponse(data);
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: string) {
  const { data } = await axiosClient.get<any>(`${BASE}/${id}`);
  // unwrap common shapes
  if (data && data.data && (data.data.purchase || data.data.purchases)) {
    if (data.data.purchase) return data.data.purchase as PurchaseOrderResponse;
    if (Array.isArray(data.data.purchases)) return data.data.purchases[0] as PurchaseOrderResponse;
  }
  if (data && data.purchase) return data.purchase as PurchaseOrderResponse;
  // else assume response is the resource
  return data as PurchaseOrderResponse;
}

// Update purchase order
export async function updatePurchaseOrder(id: string, payload: Partial<CreatePurchaseOrderPayload>) {
  const { data } = await axiosClient.patch<any>(`${BASE}/${id}`, payload);
  // return updated resource if provided
  if (data && data.data && data.data.purchase) return data.data.purchase as PurchaseOrderResponse;
  return data as PurchaseOrderResponse;
}

// Delete purchase order
export async function deletePurchaseOrder(id: string) {
  const { data } = await axiosClient.delete<{ success: boolean; message?: string }>(`${BASE}/${id}`);
  return data;
}