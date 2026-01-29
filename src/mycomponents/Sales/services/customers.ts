import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ---------- Types ---------- */
export type Customer = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  currency?: string;
  notes?: string;
  address?: string;
  country?: string;
  city?: string;
  taxNumber?: string;
  organizationId?: string | string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

type ListResponseShape = any;

/* ---------- Helpers ---------- */
const BASE = '/customers';

function extractCustomersFromResponse(payload: any): Customer[] {
  const customers =
    payload?.data?.customers ||
    payload?.customers ||
    payload?.data ||
    payload ||
    [];

  return customers.map((c: any) => ({
    ...c,
    _id: c._id ?? c.id,
  }));
}

/* ---------- Service functions ---------- */

export async function getAllCustomers(config?: AxiosRequestConfig): Promise<Customer[]> {
  const { data } = await axiosClient.get<ListResponseShape>(BASE, config);
  return extractCustomersFromResponse(data);
}

export async function getCustomerById(id: string, config?: AxiosRequestConfig): Promise<Customer | null> {
  const { data } = await axiosClient.get<any>(`${BASE}/${id}`, config);
  if (!data) return null;

  const customer =
    data.data?.customer ||
    data.data ||
    data.customer ||
    data;

  return {
    ...customer,
    _id: customer._id ?? customer.id,
  };
}


export async function createCustomerUnderOrg(
  payload: Partial<Customer>,
  config?: AxiosRequestConfig
): Promise<Customer> {
  try {
    const { data } = await axiosClient.post<any>(
      `/customers`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(config?.headers || {}),
        },
        ...config,
      }
    );

    if (data?.data?.customer) return data.data.customer;
    if (data?.customer) return data.customer;
    if (data?.data) return data.data;
    return data;
  } catch (error: any) {
    console.error('❌ createCustomerUnderOrg error:', error.response?.data || error.message);
    throw error;
  }
}


export async function updateCustomer(
  id: string,
  payload: Partial<Customer>,
  config?: AxiosRequestConfig
): Promise<Customer> {
  const { data } = await axiosClient.patch<any>(`${BASE}/${id}`, payload, config);
  if (data?.data?.customer) return data.data.customer;
  if (data?.customer) return data.customer;
  return data;
}

// ————————————————
export async function hardDeleteCustomer(
  id: string,
  config?: AxiosRequestConfig
): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.delete(`${BASE}/${id}`, config);
  return data ?? null;
}

export async function softDeleteCustomer(
  id: string,
  config?: AxiosRequestConfig
): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.patch(`${BASE}/soft-delete/${id}`, null, config);
  return data ?? null;
}

// PATCH — إضافة Organization للعميل
export async function addOrganizationToCustomer(
  customerId: string,
  orgId: string,
  config?: AxiosRequestConfig
): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.patch(`${BASE}/${customerId}/organizations/${orgId}`, null, config);
  return data ?? null;
}

// DELETE — حذف Organization من عميل
export async function removeOrganizationFromCustomer(
  customerId: string,
  orgId: string,
  config?: AxiosRequestConfig
): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.delete(`${BASE}/${customerId}/organizations/${orgId}`, config);
  return data ?? null;
}
