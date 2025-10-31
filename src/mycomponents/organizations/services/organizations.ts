import axiosClient from '@/lib/axiosClient';

const BASE = '/organizations';

export async function getOrganizationById(id: string) {
  try {
    const { data } = await axiosClient.get(`${BASE}/${id}`);
    return data?.data?.organization || data?.organization || data;
  } catch (error: any) {
    console.error("❌ getOrganizationById error:", error.response?.data || error.message);
    throw error;
  }
}