import axiosClient from "@/lib/axiosClient";
import type { AxiosRequestConfig } from "axios";

export type Supplier = {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  organizationId?: string[] | string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierResponse = {
  status: string;
  result?: number;
  data?: {
    suppliers?: Supplier[];
    supplier?: Supplier;
  };
};

/* ============================================================
   SERVICE FUNCTIONS
============================================================ */

// ✅ Get all suppliers
export async function getSuppliers(config?: AxiosRequestConfig): Promise<Supplier[]> {
  const { data } = await axiosClient.get<SupplierResponse>("/suppliers", config);
  return data?.data?.suppliers || [];
}

// ✅ Get single supplier by ID
export async function getSupplierById(id: string, config?: AxiosRequestConfig): Promise<Supplier | null> {
  const { data } = await axiosClient.get<SupplierResponse>(`/suppliers/${id}`, config);
  return data?.data?.supplier || null;
}

// ✅ Create supplier
export async function createSupplier(body: Supplier, config?: AxiosRequestConfig): Promise<Supplier> {
  const { data } = await axiosClient.post<SupplierResponse>("/suppliers", body, config);
  return data?.data?.supplier || (data as unknown as Supplier);
}

// ✅ Update supplier
export async function updateSupplier(id: string, body: Partial<Supplier>, config?: AxiosRequestConfig): Promise<Supplier> {
  const { data } = await axiosClient.put<SupplierResponse>(`/suppliers/${id}`, body, config);
  return data?.data?.supplier || (data as unknown as Supplier);
}

// ✅ Delete supplier
export async function deleteSupplier(id: string, config?: AxiosRequestConfig): Promise<{ message?: string }> {
  const { data } = await axiosClient.delete<{ message?: string }>(`/suppliers/${id}`, config);
  return data;
}