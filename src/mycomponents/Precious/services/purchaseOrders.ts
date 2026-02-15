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
  productId?: string;
  name?: string;
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  discount?: number;
  inventoryId?: string;
  _id?: string;
  total?: number;
};


export type PurchaseOrderResponse = {
  _id?: string;
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
  totalAmount?: number;
  invoiceNumber?: string;
  __v?: number;
};

/* ---------- Helpers ---------- */

const BASE = '/purchase-orders';

function extractPurchasesFromListResponse(resData: any): any[] {
  if (!resData) return [];

  if (Array.isArray(resData)) return resData as any[];
  if (resData.data && Array.isArray(resData.data)) return resData.data as any[];
  if (resData.data && Array.isArray(resData.data.purchases)) return resData.data.purchases as any[];
  if (Array.isArray(resData.purchases)) return resData.purchases as any[];

  if (resData.data && typeof resData.data === 'object') {
    const maybeArray = Object.values(resData.data).find((v) => Array.isArray(v));
    if (Array.isArray(maybeArray)) return maybeArray as any[];
  }

  return [];
}

/* ---------- Normalization ---------- */

function normalizeProductLine(raw: any): PurchaseOrderProduct {
  if (!raw) {
    return {
      quantity: 0,
      wholesalePrice: 0,
      retailPrice: 0,
    } as PurchaseOrderProduct;
  }

  const productNode = raw.product ?? null;

  const name =
    raw.name ??
    (productNode && (productNode.name ?? productNode.title)) ??
    raw.productName ??
    raw.itemName ??
    undefined;

  const productId =
    raw.productId ??
    (productNode && (productNode.id ?? productNode._id)) ??
    undefined;

  const quantity = Number(raw.quantity ?? raw.qty ?? raw.count ?? 0);

const wholesalePrice =
  Number(raw.wholesalePrice ?? raw.price ?? 0) || 0;

const retailPrice =
  Number(raw.retailPrice ?? 0) || 0;

  const discount = Number(raw.discount ?? 0) || 0;

  const total = Number(raw.total ?? raw.lineTotal ?? raw.amount ?? (wholesalePrice * quantity - (discount || 0))) || 0;

  const inventoryId =
    raw.inventoryId ?? raw.inventory?._id ?? raw.inventory?.id ?? raw.inventory ?? undefined;

  const _id = raw._id ?? raw.id ?? (productNode && (productNode._id ?? productNode.id)) ?? undefined;

return {
  productId,
  name,
  quantity,
  wholesalePrice,
  retailPrice,
  discount,
  total,
  inventoryId,
  _id,
} as PurchaseOrderProduct;
}

function normalizePurchaseOrder(raw: any): PurchaseOrderResponse {
  if (!raw) return { products: [] };

  // If the response wrapper is { data: { ... } } sometimes the actual object is nested.
  const payload = raw.data && (raw.id || raw.invoiceNumber || raw.products) ? raw.data : raw;

  const _id = payload._id ?? payload.id ?? undefined;
  const supplierId =
    payload.supplierId ??
    payload.supplier?._id ??
    payload.supplier?.id ??
    payload.customer?.id ??
    payload.customer?._id ??
    payload.customerId ??
    undefined;

  const organizationId =
    payload.organizationId ??
    payload.organization?.id ??
    payload.organization?._id ??
    (typeof payload.organization === 'string' ? payload.organization : undefined);

  const invoiceNumber = payload.invoiceNumber ?? payload.invoiceNo ?? payload.invoice ?? undefined;

  const expectedDeliveryDate = payload.expectedDeliveryDate ?? payload.expected_delivery_date ?? undefined;

  const currency = payload.currency ?? undefined;

  const status = payload.status ?? payload.state ?? undefined;

  const notes = payload.notes ?? payload.note ?? undefined;

  const createdBy = payload.createdBy ?? payload.created_by ?? undefined;

  const createdAt = payload.createdAt ?? payload.created_at ?? undefined;
  const updatedAt = payload.updatedAt ?? payload.updated_at ?? undefined;

  const totalAmount = Number(
    payload.totalAmount ?? payload.total ?? payload.grandTotal ?? payload.amount ?? 0
  );

  // Products normalization: support products array where each element may be nested product object
  const rawProducts = Array.isArray(payload.products)
    ? payload.products
    : Array.isArray(payload.items)
    ? payload.items
    : [];

  const products = rawProducts.map((p: any) => normalizeProductLine(p));

  return {
    _id,
    supplierId,
    organizationId,
    products,
    expectedDeliveryDate,
    currency,
    status,
    notes,
    createdBy,
    createdAt,
    updatedAt,
    totalAmount,
    invoiceNumber,
  } as PurchaseOrderResponse;
}

/* ---------- Service functions ---------- */

export async function createPurchaseOrder(
  payload: CreatePurchaseOrderPayload,
  config?: AxiosRequestConfig
): Promise<PurchaseOrderResponse> {
  try {
    const { data } = await axiosClient.post(`${BASE}`, payload, config);
    const raw = data ?? {};
    if (raw?.data?.purchase) return normalizePurchaseOrder(raw.data.purchase);
    if (raw?.purchase) return normalizePurchaseOrder(raw.purchase);
    if (raw?.data && (raw.data.invoiceNumber || raw.data.products)) {
      return normalizePurchaseOrder(raw.data);
    }
    return normalizePurchaseOrder(raw);
  } catch (error: any) {
    console.error("❌ createPurchaseOrder error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * NOTE:
 * Backend endpoints may use: /purchase-orders/status/<status>
 */
export async function getPurchaseOrders(status?: 'draft' | 'approved' | 'delivered') {
  try {
    const url = status ? `${BASE}/status/${status}` : BASE;
    console.log('⤴️ getPurchaseOrders request URL:', url);

    const { data } = await axiosClient.get<any>(url);
    console.log('⤵️ getPurchaseOrders raw response:', data);

    const purchasesRaw = data ? extractPurchasesFromListResponse(data) : [];
    console.log('🔎 extracted purchases count:', purchasesRaw.length);

    // Normalize each entry
    return purchasesRaw.map((p) => normalizePurchaseOrder(p));
  } catch (err: any) {
    console.error('❌ getPurchaseOrders error:', err.response?.data || err.message);
    throw err;
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: string) {
  try {
    const resp = await axiosClient.get<any>(`${BASE}/${id}`);
    const data = resp?.data ?? resp;

    if (data && data.data && (data.data.invoiceNumber || data.data.products || data.data.id)) {
      return normalizePurchaseOrder(data.data);
    }
    if (data && data.purchase) {
      return normalizePurchaseOrder(data.purchase);
    }
    if (data && Array.isArray(data.data?.purchases) && data.data.purchases.length > 0) {
      return normalizePurchaseOrder(data.data.purchases[0]);
    }
    if (data && data.data && typeof data.data === 'object') {
      return normalizePurchaseOrder(data.data);
    }
    return normalizePurchaseOrder(data);
  } catch (error: any) {
    console.error('❌ getPurchaseOrderById error:', error.response?.data || error.message);
    throw error;
  }
}

// Update purchase order
export async function updatePurchaseOrder(id: string, payload: Partial<CreatePurchaseOrderPayload>) {
  try {
    const { data } = await axiosClient.patch<any>(`${BASE}/${id}`, payload);
    const raw = data ?? {};
    if (raw?.data?.purchase) return normalizePurchaseOrder(raw.data.purchase);
    if (raw?.purchase) return normalizePurchaseOrder(raw.purchase);
    if (raw?.data && (raw.data.invoiceNumber || raw.data.products)) return normalizePurchaseOrder(raw.data);
    return normalizePurchaseOrder(raw);
  } catch (error: any) {
    console.error('❌ updatePurchaseOrder error:', error.response?.data || error.message);
    throw error;
  }
}

// Delete purchase order
export async function deletePurchaseOrder(id: string) {
  const { data } = await axiosClient.delete<{ success: boolean; message?: string }>(`${BASE}/${id}`);
  return data;
}

// Approve purchase order
export async function approvePurchaseOrder(id: string) {
  try {
    const { data } = await axiosClient.patch(`${BASE}/approve/${id}`, { status: 'approved' });
    // Try to normalize returned purchase if present
    if (data?.data?.purchase) return normalizePurchaseOrder(data.data.purchase);
    if (data?.purchase) return normalizePurchaseOrder(data.purchase);
    return data ?? null;
  } catch (error: any) {
    console.error('❌ approvePurchaseOrder error:', error.response?.data || error.message);
    throw error;
  }
}

// Ship / Deliver purchase order
export async function deliverPurchaseOrder(id: string) {
  try {
    const { data } = await axiosClient.patch(
      `/purchase-orders/deliver/${id}`,
      {
        deliveredQuantities: [], // سيبه فاضي زي ما الـ API طالب
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (data?.data?.purchase) return normalizePurchaseOrder(data.data.purchase);
    if (data?.purchase) return normalizePurchaseOrder(data.purchase);
    return data ?? null;
  } catch (error: any) {
    console.error(
      '❌ deliverPurchaseOrder error:',
      error.response?.data || error.message
    );
    throw error;
  }
}


// Cancel purchase order
export async function cancelPurchaseOrder(id: string, payload: { status?: string } = { status: 'canceled' }) {
  try {
    const { data } = await axiosClient.patch(`/purchase-orders/cancel/${id}`, payload);
    if (data?.data?.purchase) return normalizePurchaseOrder(data.data.purchase);
    if (data?.purchase) return normalizePurchaseOrder(data.purchase);
    return data ?? { success: true };
  } catch (error: any) {
    console.error('❌ cancelPurchaseOrder error:', error.response?.data || error.message);
    throw error;
  }
}
