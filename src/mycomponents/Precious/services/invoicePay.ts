import axiosClient from "@/lib/axiosClient";

/* ================= TYPES ================= */


export interface Payroll {
  id?: string;
  _id?: string;

  employee?: {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    [key: string]: any;
  };

  salary?: number | string;
  bonus?: { purpose?: string; amount?: number } | number;
  deduction?: { purpose?: string; amount?: number } | number;
  overtime?: number;
  total?: number;
  date?: string;
  month?: number;
  year?: number;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type PayPayload = {
  method?: string;
  amount?: number;
  notes?: string;
  [key: string]: any;
};

const BASE = "/payrolls/pay";

/* ================= HELPERS ================= */

function extractArrayFromResponse(resp: any): Payroll[] {
  try {
    const body = resp?.data ?? resp;

    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (Array.isArray(body?.data?.payrolls)) return body.data.payrolls;
    if (Array.isArray(body?.payrolls)) return body.payrolls;

    const searchLayer = body?.data ?? body;
    if (searchLayer && typeof searchLayer === "object") {
      for (const k of Object.keys(searchLayer)) {
        if (Array.isArray(searchLayer[k])) return searchLayer[k];
      }
    }

    if (Array.isArray(resp?.data?.data)) return resp.data.data;

    return [];
  } catch {
    return [];
  }
}

/* ================= SERVICES ================= */

/** Get all payrolls */
export const getAllPayrollsService = async (
  params?: Record<string, any>
): Promise<Payroll[]> => {
  const res = await axiosClient.get(BASE, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });
  return extractArrayFromResponse(res);
};

/** Get payroll by id */
export const getPayrollByIdService = async (
  id: string
): Promise<Payroll | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const body = res?.data ?? res;

  if (body?.data?.payroll) return body.data.payroll;
  if (body?.payroll) return body.payroll;
  if (body?.data && typeof body.data === "object") return body.data;
  if (body && typeof body === "object") return body;

  return null;
};

export interface PayInvoicePayload {
  amount?: number;  // بدل ما كانت required
  paymentMethod?: string;
  notes?: string;
}

export const payInvoiceById = async (
  invoiceId: string,
  payload: PayInvoicePayload = {}
) => {
  const body = {
    paymentMethod: "bank",
    notes: "Payment via bank transfer",
    ...payload,
  };

  const res = await axiosClient.post(
    `/purchase-invoice-payments/pay/${invoiceId}`,
    body
  );

  return res.data ?? res;
};


/** Update payroll */
export const updatePayrollService = async (
  id: string,
  payload: Record<string, any>
) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, payload);
  return res.data ?? res;
};

export const paypayrollsById = async (
  payrollId: string,
  payload?: PayPayload
) => {
  const res = await axiosClient.post(
    `${BASE}/${payrollId}`,
    payload
  );
  return res.data ?? res;
};
