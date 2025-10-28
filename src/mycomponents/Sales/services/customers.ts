// src/services/customers.ts
import axiosClient from '@/lib/axiosClient';
import type { AxiosRequestConfig } from 'axios';

/* ---------- Types ---------- */
export type Customer = {
  _id?: string;
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

type ListResponseShape = any; // backend may vary

/* ---------- Helpers ---------- */
const BASE = '/customers';
const ORG_ADD_CUSTOMER = '/organizations/addCustomer';

function extractCustomersFromResponse(payload: ListResponseShape): Customer[] {
  if (!payload) return [];
  // common shapes:
  // { data: { customers: [...] } }
  if (payload.data?.customers && Array.isArray(payload.data.customers)) return payload.data.customers;
  // { customers: [...] }
  if (Array.isArray(payload.customers)) return payload.customers;
  // { data: [...] }
  if (Array.isArray(payload.data)) return payload.data;
  // direct array
  if (Array.isArray(payload)) return payload;
  // fallback: try to find first array under data
  if (payload.data) {
    const maybe = Object.values(payload.data).find((v) => Array.isArray(v));
    if (Array.isArray(maybe)) return maybe as Customer[];
  }
  return [];
}

/* ---------- Service functions ---------- */

/**
 * Get all customers
 * GET /api/v1/customers
 */
export async function getAllCustomers(config?: AxiosRequestConfig): Promise<Customer[]> {
  const { data } = await axiosClient.get<ListResponseShape>(BASE, config);
  return extractCustomersFromResponse(data);
}

/**
 * Get single customer by id
 * GET /api/v1/customers/:id
 */
export async function getCustomerById(id: string, config?: AxiosRequestConfig): Promise<Customer | null> {
  const { data } = await axiosClient.get<any>(`${BASE}/${id}`, config);
  // handle multiple shapes
  if (!data) return null;
  if (data.data?.customer) return data.data.customer as Customer;
  if (data.customer) return data.customer as Customer;
  // sometimes backend returns the resource directly
  if (data._id) return data as Customer;
  return null;
}

/**
 * Create customer under organization
 * POST /api/v1/organizations/addCustomer/:orgId
 * body: customer payload
 */
export async function createCustomerUnderOrg(orgId: string, payload: Partial<Customer>, config?: AxiosRequestConfig): Promise<Customer> {
  const { data } = await axiosClient.post<any>(`${ORG_ADD_CUSTOMER}/${orgId}`, payload, config);
  if (data?.data?.customer) return data.data.customer as Customer;
  if (data?.customer) return data.customer as Customer;
  // sometimes API returns created object directly
  return (data?.data ?? data) as Customer;
}

/**
 * Delete customer (endpoint given as /organizations/addCustomer/:orgId)
 * DELETE /api/v1/organizations/addCustomer/:orgId
 * If backend expects customer id, pass it via params.customerId
 */

/**
 * Direct delete customer:
 * DELETE /api/v1/customers/:id
 */
export async function deleteCustomer(id: string, config?: AxiosRequestConfig): Promise<{ success?: boolean; message?: string } | null> {
  const { data } = await axiosClient.delete(`/customers/${id}`, config);
  return data ?? null;
}

/**
 * Update customer
 * PATCH /api/v1/customers/:id
 */
export async function updateCustomer(id: string, payload: Partial<Customer>, config?: AxiosRequestConfig): Promise<Customer> {
  const { data } = await axiosClient.patch<any>(`${BASE}/${id}`, payload, config);
  if (data?.data?.customer) return data.data.customer as Customer;
  if (data?.customer) return data.customer as Customer;
  return data as Customer;
}