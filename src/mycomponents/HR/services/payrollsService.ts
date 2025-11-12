// src/mycomponents/payrolls/services/payrollsService.ts
import axiosClient from "@/lib/axiosClient";

export interface Payroll {
  _id: string;
  employee: {
    _id: string;
    name: string;
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

/**
 * normalize API response into array
 */
function extractArrayFromResponse(resp: any): any[] {
  console.log("extractArrayFromResponse -> raw:", resp);

  try {
    // axios response shape: resp.data
    const outer = resp?.data ?? resp;

    // common shape in your example: { status: 'success', results: 2, data: { payrolls: [...] } }
    if (Array.isArray(outer?.data?.payrolls)) return outer.data.payrolls;
    if (Array.isArray(outer?.payrolls)) return outer.payrolls;

    // sometimes resp is the axios response itself
    if (Array.isArray(resp?.data?.data?.payrolls)) return resp.data.data.payrolls;
    if (Array.isArray(resp?.data?.payrolls)) return resp.data.payrolls;
    if (Array.isArray(resp?.data)) return resp.data;

    // fallback: scan object keys for first array
    const dataLayer = resp?.data?.data ?? resp?.data ?? resp;
    if (dataLayer && typeof dataLayer === "object") {
      for (const k of Object.keys(dataLayer)) {
        if (Array.isArray(dataLayer[k])) return dataLayer[k];
      }
    }

    console.warn("extractArrayFromResponse: no array found, returning []", { outer, dataLayer: resp?.data?.data ?? resp?.data ?? resp });
    return [];
  } catch (err) {
    console.error("extractArrayFromResponse error", err);
    return [];
  }
}

/**
 * Get all payrolls
 */
export const getAllPayrollsService = async (params?: Record<string, any>) => {
  const res = await axiosClient.get(BASE, { params, headers: { "Cache-Control": "no-cache" } });
  return extractArrayFromResponse(res);
};

/**
 * Get a single payroll by ID
 */
export const getPayrollByIdService = async (id: string): Promise<Payroll | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const d = res.data ?? res;
  if (d?.data?.payroll) return d.data.payroll;
  if (d?.payroll) return d.payroll;
  if (d?.data) return d.data;
  return d ?? null;
};

/**
 * Update payroll (PATCH /payrolls/:id)
 */
export const updatePayrollService = async (id: string, payload: Record<string, any>) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, payload);
  return res.data ?? res;
};

export default {
  getAllPayrollsService,
  getPayrollByIdService,
  updatePayrollService,
};
