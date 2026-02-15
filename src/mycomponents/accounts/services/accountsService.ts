// services/accountsService.ts
import axiosClient from "@/lib/axiosClient";

export interface Account {
  _id?: string;
  id?: string;
  name?: string;
  code?: string;
  type?: string;
  amount?: number;
  currency?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}


const BASE = "/accounts";

export const getAccountsService = async (params?: Record<string, any>): Promise<Account[]> => {
  const response = await axiosClient.get(BASE, { params, headers: { "Cache-Control": "no-cache" } });
  const body = response.data as any;

  if (Array.isArray(body)) return body as Account[];
  if (body?.data && Array.isArray(body.data)) return body.data;
  return [];
};



export const createAccountService = async (data: Partial<Account>) => {
  const res = await axiosClient.post(BASE, data);
  return res.data;
};


export const deleteAccountService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getAccountsService,
  createAccountService,
  deleteAccountService,
};