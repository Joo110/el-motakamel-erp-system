// services/rolesService.ts
import axiosClient from "@/lib/axiosClient";

export interface Role {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const BASE = "/roles";

export const getRolesService = async (params?: Record<string, any>): Promise<Role[]> => {
  const response = await axiosClient.get<{ status?: string; results?: number; data?: { roles?: Role[] } }>(
    BASE,
    { params, headers: { "Cache-Control": "no-cache" } }
  );

  const body = response.data as any;
  if (Array.isArray(body)) return body as Role[];
  if (body?.data?.roles && Array.isArray(body.data.roles)) return body.data.roles;
  if (body?.roles && Array.isArray(body.roles)) return body.roles;
  return [];
};

export const createRoleService = async (data: Partial<Role>) => {
  const res = await axiosClient.post(BASE, data);
  return res.data;
};

export const getRoleByIdService = async (id: string) => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  return res.data;
};

export const updateRoleService = async (id: string, data: Partial<Role>) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, data);
  return res.data;
};

export const deleteRoleService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getRolesService,
  createRoleService,
  getRoleByIdService,
  updateRoleService,
  deleteRoleService,
};