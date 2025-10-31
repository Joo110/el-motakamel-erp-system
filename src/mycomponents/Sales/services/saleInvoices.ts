import axiosClient from '@/lib/axiosClient';

export type SaleInvoice = {
  _id: string;
  saleOrderId?: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

const BASE = '/saleInvoices';

export async function getSaleInvoiceById(id: string): Promise<SaleInvoice | null> {
  const { data } = await axiosClient.post(`${BASE}/${id}`);
  return data?.data?.invoice || data?.invoice || data;
}