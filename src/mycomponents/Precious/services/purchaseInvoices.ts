import axiosClient from '@/lib/axiosClient';

const BASE = '/purchaseInvoices';

export async function postPurchaseInvoiceById(id: string) {
  try {
    console.log("📡 Sending request to:", `${BASE}/${id}`);
    const { data } = await axiosClient.post(`${BASE}/${id}`);
    console.log("✅ Invoice created response:", data);
    return data?.data?.invoice || data?.invoice || data;
  } catch (error: any) {
    console.error("❌ postPurchaseInvoiceById error:", error.response?.data || error.message);
    throw error;
  }
}