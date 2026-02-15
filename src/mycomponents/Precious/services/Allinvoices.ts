// services/purchaseInvoicesService.ts
import axiosClient from "@/lib/axiosClient";

export interface PurchaseInvoice {
  _id?: string;
  id?: string;
  invoiceNumber?: string;
  paymentStatus?: string;
  totalPayment?: number;
  createdAt?: string;
  updatedAt?: string;
  products?: any[];
  [key: string]: any;
}

/**
 * اضبط BASE حسب إعدادات axiosClient:
 * - لو axiosClient.baseURL = '/api/v1' استخدم '/purchase-invoices'
 * - لو مفيش baseURL استخدم '/api/v1/purchase-invoices'
 */
const BASE = "/purchase-invoices";

/**
 * GET ALL PURCHASE INVOICES
 * يرجع كائن: { data: PurchaseInvoice[], results: number, paginationResult: any, raw: any }
 */
export const getPurchaseInvoicesService = async (params?: Record<string, any>) => {
  const res = await axiosClient.get(BASE, { params });
  const payload = res?.data ?? {};

  // نحاول استخراج المصفوفة من الأشكال الممكنة
  let arr: PurchaseInvoice[] = [];

  if (Array.isArray(payload.data)) {
    // الشكل المتوقع: { message, data: [ ... ], results, paginationResult }
    arr = payload.data;
  } else if (Array.isArray(payload.data?.purchaseInvoices)) {
    // شكل آخر: { data: { purchaseInvoices: [...] } }
    arr = payload.data.purchaseInvoices;
  } else if (Array.isArray(payload.purchaseInvoices)) {
    // { purchaseInvoices: [...] }
    arr = payload.purchaseInvoices;
  } else if (Array.isArray(payload.data?.docs)) {
    // pagination.docs
    arr = payload.data.docs;
  } else if (Array.isArray(payload)) {
    // نادراً لو رد السيرفر مصفوفة مباشرة
    arr = payload as PurchaseInvoice[];
  } else {
    arr = [];
  }

  const normalized = arr.map((inv) => ({ ...inv, _id: inv._id ?? inv.id }));

  const results = payload?.results ?? normalized.length;
  const paginationResult = payload?.paginationResult ?? payload?.pagination ?? null;

  return {
    data: normalized,
    results,
    paginationResult,
    raw: payload,
  };
};

/**
 * GET PURCHASE INVOICE BY ID
 */
export const getPurchaseInvoiceByIdService = async (id: string) => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload = res?.data ?? {};

  
  let invoice: any = null;

  if (payload?.data && !Array.isArray(payload.data)) {
    // payload.data could be the invoice object or wrapper
    invoice = payload.data.purchaseInvoice ?? payload.data;
  } else if (payload.purchaseInvoice) {
    invoice = payload.purchaseInvoice;
  } else if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    invoice = payload;
  } else {
    invoice = null;
  }

  if (!invoice) return null;

  // Normalize id
  invoice._id = invoice._id ?? invoice.id;
  return invoice as PurchaseInvoice;
};

export default {
  getPurchaseInvoicesService,
  getPurchaseInvoiceByIdService,
};
