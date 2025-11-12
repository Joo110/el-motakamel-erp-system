import axiosClient from "@/lib/axiosClient";

export interface Attendance {
  _id: string;
  employee: {
    _id: string;
    name: string;
    jobTitle?: string;
    avatar?: string;
    department?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  date: string;
  status: string;
  checkIn?: string | null;
  checkOut?: string | null;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}


const BASE = "/attendances";

/**
 * Helper: normalize various API response shapes into an array
 */
function extractArrayFromResponse(resp: any): any[] {
  console.log("extractArrayFromResponse -> raw:", resp);
  if (!resp) return [];

  // الوصول لأكثر من طبقة ممكنة
  const d = resp.data?.data ?? resp.data ?? resp;

  if (Array.isArray(d.attendances)) return d.attendances;
  if (Array.isArray(d.data?.attendances)) return d.data.attendances;
  if (Array.isArray(d)) return d;
  for (const k of Object.keys(d)) {
    if (Array.isArray(d[k])) return d[k];
  }
  return [];
}


/**
 * Get all attendances (with optional query params)
 */
export const getAllAttendancesService = async (params?: Record<string, any>): Promise<Attendance[]> => {
  const res = await axiosClient.get(BASE, { params, headers: { "Cache-Control": "no-cache" } });
  return extractArrayFromResponse(res);
};

/**
 * Get today's attendances
 * GET /attendances/today
 */
export const getTodayAttendancesService = async (): Promise<Attendance[]> => {
  const res = await axiosClient.get(`${BASE}/today`, { headers: { "Cache-Control": "no-cache" } });
  return extractArrayFromResponse(res);
};

/**
 * Get attendances for current month or server-provided month endpoint
 * GET /attendances/month
 * optional query params supported (e.g. ?year=2025&month=11)
 */
export const getMonthAttendancesService = async (params?: Record<string, any>): Promise<Attendance[]> => {
  const res = await axiosClient.get(`${BASE}/month`, { params, headers: { "Cache-Control": "no-cache" } });
  return extractArrayFromResponse(res);
};

/**
 * Get attendances for a specific day (day param expected '07' or '2025-11-07' depending on backend)
 * GET /attendances/day/:day
 */
export const getDayAttendancesService = async (day: string): Promise<Attendance[]> => {
  const res = await axiosClient.get(`${BASE}/day/${encodeURIComponent(day)}`, { headers: { "Cache-Control": "no-cache" } });
  return extractArrayFromResponse(res);
};

/**
 * Get a single attendance by id
 */
export const getAttendanceByIdService = async (id: string): Promise<Attendance | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  // try common shapes
  const d = res.data ?? res;
  if (d?.data?.attendance) return d.data.attendance;
  if (d?.attendance) return d.attendance;
  if (d?.data) return d.data;
  return d ?? null;
};

/**
 * Check-in (PATCH /attendances/:id/check-in)
 * optional payload can include location, note, etc.
 */
export const checkInService = async (id: string, payload?: Record<string, any>) => {
  const res = await axiosClient.patch(`${BASE}/${id}/check-in`, payload ?? {});
  return res.data ?? res;
};

/**
 * Check-out (PATCH /attendances/:id/check-out)
 */
export const checkOutService = async (id: string, payload?: Record<string, any>) => {
  const res = await axiosClient.patch(`${BASE}/${id}/check-out`, payload ?? {});
  return res.data ?? res;
};

/**
 * Generic export
 */
export default {
  getAllAttendancesService,
  getTodayAttendancesService,
  getMonthAttendancesService,
  getDayAttendancesService,
  getAttendanceByIdService,
  checkInService,
  checkOutService,
};
