// src/services/tripInvoicesService.ts
import axiosClient from "@/lib/axiosClient";

// ===== TYPES =====
export interface GoodsItem {
  _id: string;
  product: string;
  code: string;
  unit: number;
  discount: number;
  total: number;
}

export interface SalesOrder {
  _id: string;
  customer: string;
  orderDate: string;
  goods: GoodsItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  orderNumber: number;
}

export interface Invoice {
  _id: string;
  saleOrder: SalesOrder;
  createdAt: string;
  updatedAt: string;
}

// ===== BASE =====
const BASE = "/trip/invoices";

// POST api/v1/trip/invoices/:saleOrderId
export const createTripInvoiceService = async (
  saleOrderId: string,
  payload: any = {}
) => {
  const res = await axiosClient.post(`${BASE}/${saleOrderId}`, payload);
  return res.data;
};

// GET api/v1/trip/invoices
export const getAllTripInvoicesService = async (): Promise<Invoice[]> => {
  const res = await axiosClient.get(BASE);
  const data = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.invoices)) return data.data.invoices;

  return [];
};

export default {
  createTripInvoiceService,
  getAllTripInvoicesService,
};