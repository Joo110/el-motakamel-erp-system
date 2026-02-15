import axiosClient from "@/lib/axiosClient";

export interface Payroll {
  id?: string;
  _id?: string;
  employee?: {
    _id?: string;
    name?: string;
    [key: string]: any;
  };
  salary?: number | string;
  bonus?: { purpose?: string; amount?: number } | number;
  deduction?: { purpose?: string; amount?: number } | number;
  overtime?: number;
  total?: number;
  date?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const BASE = "/payrolls";


function extractArrayFromResponse(resp: any): Payroll[] {
  console.log("API RESPONSE:", resp);

  // axios response
  const body = resp?.data ?? resp;

  if (Array.isArray(body?.data)) return body.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data?.payrolls)) return body.data.payrolls;
  if (Array.isArray(body?.payrolls)) return body.payrolls;

  console.warn("❌ No payroll array found in response:", body);
  return [];
}

/**
 * Get all payrolls
 */
export const getAllPayrollsService = async (params?: Record<string, any>) => {
  const res = await axiosClient.get(BASE, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });

  return extractArrayFromResponse(res);
};

/**
 * Get payroll by ID
 */
export const getPayrollByIdService = async (id: string): Promise<Payroll | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const body = res?.data ?? res;

  if (body?.data) return body.data;
  return body ?? null;
};

/**
 * Update payroll
 */
export const updatePayrollService = async (id: string, payload: Record<string, any>) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, payload);
  return res.data ?? res;
};
