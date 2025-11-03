// src/services/saleInvoices.ts
import axiosClient from '@/lib/axiosClient';

export type SaleInvoice = {
  _id: string;
  invoiceNumber?: string;
  saleOrder?: string;
  totalPayment?: number;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

const BASE = '/saleInvoices';

export async function createInvoiceForSaleOrder(saleOrderId: string): Promise<SaleInvoice> {
  const { data } = await axiosClient.post(`${BASE}/${saleOrderId}`);
  return data?.data?.invoice ?? data?.invoice ?? data;
}

export async function getSaleInvoiceById(id: string): Promise<SaleInvoice | null> {
  const { data } = await axiosClient.get(`${BASE}/${id}`);
  return data?.data?.invoice ?? data?.invoice ?? data ?? null;
}