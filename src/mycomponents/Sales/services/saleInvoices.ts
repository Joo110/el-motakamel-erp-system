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

export async function createInvoiceForSaleOrder(
  saleOrderId: string,
  payload: {
    notes?: string;
    dueDate?: string;
  }
) {
  const { data } = await axiosClient.post(
    `/sale-invoices/${saleOrderId}`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (data?.data?.invoice) return data.data.invoice;
  if (data?.invoice) return data.invoice;
  return data;
}


export async function getSaleInvoiceById(id: string): Promise<SaleInvoice | null> {
  const { data } = await axiosClient.get(`${BASE}/${id}`);
  return data?.data?.invoice ?? data?.invoice ?? data ?? null;
}