import axiosClient from '@/lib/axiosClient';

export async function payInvoiceById(id: string) {
  try {
    const endpoint = `/invoice-pay/${id}/pay`;
    console.log("📡 Sending request to:", endpoint);

    const { data } = await axiosClient.post(endpoint);

    console.log("✅ Invoice pay response:", data);
    return data?.data || data;
  } catch (error: any) {
    console.error("❌ payInvoiceById error:", error.response?.data || error.message);
    throw error;
  }
}

export async function paypayrollsById(id: string) {
  try {
    const endpoint = `/payrolls/${id}/pay`;
    console.log("📡 Sending request to:", endpoint);

    const { data } = await axiosClient.patch(endpoint);

    console.log("✅ Invoice pay response:", data);
    return data?.data || data;
  } catch (error: any) {
    console.error("❌ payInvoiceById error:", error.response?.data || error.message);
    throw error;
  }
}