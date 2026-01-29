// src/services/mobileStocksService.ts
import axiosClient from "@/lib/axiosClient";

/**
 * تبسيط الـ MobileStock ليحتوي الحقول الأساسية المتوقعة من الـ API.
 * السماحية عبر [key: string]: any عشان نواكب أي حقول إضافية من السيرفر.
 */
export interface MobileStock {
  _id?: string;
  id?: string;
  name?: string;
  capacity?: number;
  representative?: string;
  createdAt?: string;
  updatedAt?: string;
  inventorySummary?: {
    totalItems?: number;
    totalQuantity?: number;
    totalValue?: number;
    lowStockCount?: number;
    outOfStockCount?: number;
  };
  topProducts?: Array<{
    product?: { name?: string; code?: string; [key: string]: any };
    quantity?: number;
    status?: string;
    [key: string]: any;
  }>;
  capacityUsage?: {
    used?: number;
    available?: number;
    percentage?: number;
  };
  [key: string]: any;
}

export interface PaginatedResult<T> {
  items: T[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    next?: number | null;
    [key: string]: any;
  };
}

/** مسار الـ API الأساسي */
const BASE = "/mobile-stocks";

/**
 * GET /mobile-stocks
 * يحاول يتعامل مع صيغ متعددة للレスپونس:
 * - { message, data: [...], paginationResult: { currentPage, limit, totalDocs, ... } }
 * - { data: { docs: [...] , meta: {...} } }
 * - أو صيغ أخرى مرنة
 */
export const getMobileStocksService = async (
  params?: Record<string, any>
): Promise<PaginatedResult<MobileStock>> => {
  const res = await axiosClient.get(BASE, {
    params,
    headers: { "Cache-Control": "no-cache" },
  });

  const data = (res.data ?? {}) as any;

  // محاولة استخراج المصفوفة من أماكن محتملة
  let items: MobileStock[] = [];
  if (Array.isArray(data?.data)) {
    items = data.data;
  } else if (Array.isArray(data?.data?.docs)) {
    items = data.data.docs;
  } else if (Array.isArray(data?.docs)) {
    items = data.docs;
  } else if (Array.isArray(data?.items)) {
    items = data.items;
  } else if (Array.isArray(data?.mobileStocks)) {
    items = data.mobileStocks;
  } else if (Array.isArray(data)) {
    items = data;
  }

  // ميتاداتا: نحاول قراءة paginationResult ثم نرجع لقيم أخرى كاحتياط
  const pagination = data?.paginationResult ?? data?.data?.paginationResult ?? data?.data?.meta ?? data?.meta ?? data?.paging ?? null;

  const meta: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    next?: number | null;
    [key: string]: any;
  } = {};

  if (pagination) {
    meta.page = pagination.currentPage ?? pagination.page ?? pagination?.pageNumber ?? undefined;
    meta.limit = pagination.limit ?? pagination.perPage ?? pagination?.pageSize ?? undefined;
    meta.total = pagination.totalDocs ?? pagination.total ?? pagination.results ?? pagination.count ?? undefined;
    meta.totalPages = pagination.totalPages ?? pagination.total_pages ?? undefined;
    meta.next = typeof pagination.next !== "undefined" ? pagination.next : pagination.nextPage ?? null;
  } else {
    // fallbacks
    meta.total = data?.results ?? data?.totalDocs ?? data?.total ?? data?.count ?? undefined;
    meta.page = data?.currentPage ?? data?.page ?? undefined;
    meta.limit = data?.limit ?? undefined;
  }

  return {
    items,
    meta,
  };
};

/**
 * POST /mobile-stocks
 */
export const createMobileStockService = async (payload: Record<string, any> | FormData) => {
  try {
    const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await axiosClient.post(BASE, payload, {
      headers: isForm ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
    });
    return response.data ?? response;
  } catch (error) {
    console.error("createMobileStockService error:", error);
    throw error;
  }
};

/**
 * GET /mobile-stocks/:id
 * يتعامل مع استجابات ترجع العنصر داخل data كمصفوفة أو ككائن.
 */
export const getMobileStockByIdService = async (id: string): Promise<MobileStock | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const data = (res.data ?? {}) as any;
  // الأماكن المحتملة للعنصر المفرد:
  let candidate = data?.data ?? data;
  if (Array.isArray(candidate)) {
    candidate = candidate.length > 0 ? candidate[0] : null;
  } else if (candidate?.mobileStock) {
    candidate = candidate.mobileStock;
  }
  return candidate ?? null;
};

/**
 * PATCH /mobile-stocks/:id
 */
export const updateMobileStockService = async (id: string, payload: Record<string, any> | FormData) => {
  try {
    const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await axiosClient.patch(`${BASE}/${id}`, payload, {
      headers: isForm ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" },
    });
    return response.data ?? response;
  } catch (error) {
    console.error("updateMobileStockService error:", error);
    throw error;
  }
};

/**
 * DELETE /mobile-stocks/:id
 */
export const deleteMobileStockService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data ?? res;
};

export default {
  getMobileStocksService,
  createMobileStockService,
  getMobileStockByIdService,
  updateMobileStockService,
  deleteMobileStockService,
};
