// src/services/suppliers.ts
import axiosClient from '@/lib/axiosClient'; // غيّر المسار لو لازم
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
  } | Supplier[]; // be flexible
};

/* ---------- Service functions ---------- */

/**
 * Fetch all suppliers.
 * Ensures it ALWAYS returns an array (possibly empty).
 */
export async function getSuppliersService(config?: AxiosRequestConfig): Promise<Supplier[]> {
  const res = await axiosClient.get<SuppliersResponseShape>('/suppliers', config);

  const payload = res.data;

  // Case 1: payload.data.suppliers exists
  if (payload && (payload as any).data) {
    const maybe = (payload as any).data.suppliers ?? (payload as any).data;
    if (Array.isArray(maybe)) return maybe as Supplier[];
  }

  // Case 2: payload itself is an array
  if (Array.isArray(payload)) return payload as unknown as Supplier[];

  // Case 3: payload.data may be array directly
  if (Array.isArray((payload as any).suppliers)) return (payload as any).suppliers as Supplier[];

  // Fallback: try to extract any suppliers-like property, else empty array
  const fallback = (payload as any).data?.suppliers ?? (payload as any).suppliers ?? [];
  return Array.isArray(fallback) ? fallback : [];
}

/**
 * Get a single supplier by id.
 * Returns null if not found or error thrown.
 */
export async function getSupplierByIdService(id: string, config?: AxiosRequestConfig): Promise<Supplier | null> {
  const res = await axiosClient.get<any>(`/suppliers/${id}`, config);
  // backend might return { data: { supplier: { ... } } } or the supplier directly
  const payload = res.data;
  if (!payload) return null;
  if (payload.data && payload.data.supplier) return payload.data.supplier as Supplier;
  if (payload.data && payload.data.suppliers && Array.isArray(payload.data.suppliers)) {
    return payload.data.suppliers.find((s: Supplier) => s._id === id) ?? null;
  }
  // if payload itself looks like supplier
  if (payload._id) return payload as Supplier;
  return null;
}