import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ----------------------
   TYPES
   ---------------------- */
export type SaleOrderProductPayload = {
  productId: string;
  inventoryId: string;
  name?: string;
  quantity: number;
  price: number;
  discount?: number;
};

export type CreateSaleOrderPayload = {
  customerId: string;
  organizationId?: string;
  products: SaleOrderProductPayload[];
  shippingCost?: number;
  expectedDeliveryDate?: string;
  tax?: number;
  notes?: string;
  createdBy?: string;
};

export type SaleOrderProduct = SaleOrderProductPayload & {
  _id?: string;
  total?: number;
};

export type SaleOrder = {
  _id: string;
  customerId?: string;
  organizationId?: string;
  products: SaleOrderProduct[];
  shippingCost?: number;
  expectedDeliveryDate?: string;
  tax?: number;
  notes?: string;
  status?: string;
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

function extractListFromResponse(resData: any): SaleOrder[] {
  if (!resData) return [];
  // common shapes:
  // { data: { saleOrders: [...] } }
  if (resData.data && Array.isArray(resData.data.saleOrders)) return resData.data.saleOrders as SaleOrder[];
  // { saleOrders: [...] }
  if (Array.isArray(resData.saleOrders)) return resData.saleOrders as SaleOrder[];
  // { data: [...] }
  if (Array.isArray(resData.data)) return resData.data as SaleOrder[];
  // direct array
  if (Array.isArray(resData)) return resData as SaleOrder[];
  // try find array inside data
  if (resData.data) {
    const found = Object.values(resData.data).find((v) => Array.isArray(v));
    if (Array.isArray(found)) return found as SaleOrder[];
  }
  return [];
}

function extractSingleFromResponse(resData: any): SaleOrder | null {
  if (!resData) return null;
  if (resData.data && resData.data.saleOrder) return resData.data.saleOrder as SaleOrder;
  if (resData.saleOrder) return resData.saleOrder as SaleOrder;
  if (resData.data && Array.isArray(resData.data.saleOrders)) return resData.data.saleOrders[0] ?? null;
  if (resData._id) return resData as SaleOrder;
  return null;
}

/* ----------------------
   SERVICE FUNCTIONS
   ---------------------- */

export async function getSaleOrders(status?: string, config?: AxiosRequestConfig): Promise<SaleOrder[]> {
  const { data } = await axiosClient.get(`${BASE}`, {
    params: status ? { status } : {},
    ...config,
  });
  return extractListFromResponse(data);
}

export async function getSaleOrderById(id: string, config?: AxiosRequestConfig): Promise<SaleOrder | null> {
  const { data } = await axiosClient.get(`${BASE}/${id}`, config);
  return extractSingleFromResponse(data);
}

export async function createSaleOrder(payload: CreateSaleOrderPayload, config?: AxiosRequestConfig): Promise<SaleOrder> {
  const { data } = await axiosClient.post(`${BASE}`, payload, config);
  const single = extractSingleFromResponse(data);
  if (single) return single;
  return data as SaleOrder;
}

export async function updateSaleOrder(id: string, payload: Partial<CreateSaleOrderPayload>, config?: AxiosRequestConfig): Promise<SaleOrder | null> {
  const { data } = await axiosClient.patch(`${BASE}/${id}`, payload, config);
  return extractSingleFromResponse(data);
}

export async function deleteSaleOrder(
  id: string,
  config?: AxiosRequestConfig
): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.delete(`${BASE}/${id}`, config);
  return data ?? null;
}