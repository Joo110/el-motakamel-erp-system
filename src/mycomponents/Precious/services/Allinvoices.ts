// services/purchaseInvoicesService.ts
import axiosClient from "@/lib/axiosClient";

export interface PurchaseInvoice {
  _id: string;
  invoiceNumber: string;
  paymentStatus: string;
  totalPayment: number;
  createdAt: string;
  updatedAt: string;
  products: any[];
  [key: string]: any;
}

const BASE = "/purchaseInvoices";

/* ============================
   GET ALL PURCHASE INVOICES
============================= */
export const getPurchaseInvoicesService = async (
  params?: Record<string, any>
): Promise<PurchaseInvoice[]> => {
  const res = await axiosClient.get(BASE, { params });
  const payload = res.data;

  if (Array.isArray(payload?.data?.purchaseInvoices))
    return payload.data.purchaseInvoices;

  if (Array.isArray(payload?.purchaseInvoices))
    return payload.purchaseInvoices;

  return [];
};

/* ============================
   GET PURCHASE INVOICE BY ID
============================= */
export const getPurchaseInvoiceByIdService = async (
  id: string
): Promise<PurchaseInvoice | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload = res.data;

  if (payload?.data?.purchaseInvoice)
    return payload.data.purchaseInvoice;

  if (payload?.purchaseInvoice)
    return payload.purchaseInvoice;

  if (payload?.data)
    return payload.data;

  return payload || null;
};

export default {
  getPurchaseInvoicesService,
  getPurchaseInvoiceByIdService,
};