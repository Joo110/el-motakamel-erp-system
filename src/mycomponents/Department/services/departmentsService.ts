// services/departmentsService.ts
import axiosClient from "@/lib/axiosClient";

export interface Department {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const BASE = "/departments";

/**
 * جلب قائمة الأقسام — يعيد Department[]
 */
export const getDepartmentsService = async (params?: Record<string, any>): Promise<Department[]> => {
  const response = await axiosClient.get<{ status?: string; results?: number; data?: { departments?: Department[] } }>(
    BASE,
    { params, headers: { "Cache-Control": "no-cache" } }
  );

  const body = response.data as any;
  if (Array.isArray(body)) return body as Department[];
  if (body?.data?.departments && Array.isArray(body.data.departments)) return body.data.departments;
  if (body?.departments && Array.isArray(body.departments)) return body.departments;
  // fallback: maybe response.data itself is array
  return [];
};

export const createDepartmentService = async (data: Partial<Department>) => {
  const res = await axiosClient.post(BASE, data);
  return res.data;
};

export const getDepartmentByIdService = async (id: string) => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  return res.data;
};

export const updateDepartmentService = async (id: string, data: Partial<Department>) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, data);
  return res.data;
};

export const deleteDepartmentService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getDepartmentsService,
  createDepartmentService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
};