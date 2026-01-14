// src/services/salesTripService.ts
import axiosClient from "@/lib/axiosClient";

// ====== TYPES ======

export interface GoodsItem {
  _id: string;
  product: string;
  code: string;
  unit: number;
  discount: number;
  total: number;
}

export interface SalesOrder {
  _id: string;
  customer: string;
  orderDate: string;
  goods: GoodsItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  orderNumber: number;
}

export interface CreateSalesTripPayload {
  customer: string;
  orderDate: string;
  goods: {
    product: string;
    code: string;
    unit: number;
    discount: number;
    total: number;
  }[];
  total: number;
}

// ===== BASE URL =====
const BASE = "/salesTrip";

// ===== SERVICES =====

// POST api/v1/salesTrip/:tripId
export const createSalesTripService = async (
  tripId: string,
  payload: CreateSalesTripPayload
) => {
  const res = await axiosClient.post(`${BASE}/${tripId}`, payload);
  return res.data;
};

// GET api/v1/salesTrip/:id
export const getSalesTripByIdService = async (
  id: string
): Promise<SalesOrder[]> => {
  const res = await axiosClient.get(`${BASE}/${id}`);

  const data = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.allSalesOrder))
    return data.data.allSalesOrder;

  return [];
};

// GET api/v1/salesTrip
export const getAllSalesTripsService = async (): Promise<SalesOrder[]> => {
  const res = await axiosClient.get(BASE);

  const data = res.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data?.allSalesOrder))
    return data.data.allSalesOrder;

  return [];
};

export default {
  createSalesTripService,
  getSalesTripByIdService,
  getAllSalesTripsService,
};