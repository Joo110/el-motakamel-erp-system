import axiosClient from '@/lib/axiosClient';

const BASE = '/purchaseInvoices';

export async function payInvoiceById(id: string) {
  try {
    console.log("📡 Sending request to:", `${BASE}/${id}`);
    const { data } = await axiosClient.post(`${BASE}/${id}`);
    console.log("✅ Invoice paid response:", data);
    return data?.data?.invoice || data?.invoice || data;
  } catch (error: any) {
    console.error("❌ payInvoiceById error:", error.response?.data || error.message);
    throw error;
  }
}
