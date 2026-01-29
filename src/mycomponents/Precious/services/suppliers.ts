import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ---------- Types ---------- */
export type Supplier = {
  _id: string;
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  organizationId?: string[] | string;
  createdBy?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

export type SuppliersResponseShape = {
  status?: string;
  result?: number;
  data?: {
    suppliers?: Supplier[];
    [k: string]: any;
  } | Supplier[];
};

/* ---------- Service functions ---------- */

// get all suppliers with optional query params
export async function getSuppliersService(config?: AxiosRequestConfig): Promise<Supplier[]> {
  const res = await axiosClient.get<SuppliersResponseShape>('/suppliers', config);
  const payload = res.data;

  // Try different response shapes
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as Supplier[];
  if (Array.isArray((payload as any).data)) return payload.data as Supplier[];
  if ((payload as any).data?.suppliers) return (payload as any).data.suppliers as Supplier[];
  if ((payload as any).suppliers) return (payload as any).suppliers as Supplier[];

  return [];
}

// get specific supplier by id
export async function getSupplierByIdService(id: string, config?: AxiosRequestConfig): Promise<Supplier | null> {
  try {
    const res = await axiosClient.get(`/suppliers/${id}`, config);
    const payload = res.data;

    if (!payload) return null;

    // handle different shapes
    if (payload.data?.supplier) return payload.data.supplier as Supplier;
    if (payload._id) return payload as Supplier;
    return null;
  } catch (err) {
    console.error("Error fetching supplier by ID:", err);
    return null;
  }
}
