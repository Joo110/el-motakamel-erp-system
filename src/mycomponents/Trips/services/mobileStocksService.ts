// File: src/services/mobileStocksService.ts
import axiosClient from "@/lib/axiosClient";


export interface MobileStock {
_id?: string;
id?: string;
sku?: string;
name?: string;
quantity?: number;
unit?: string;
price?: number;
location?: string;
barcode?: string;
notes?: string;
createdAt?: string;
updatedAt?: string;
[key: string]: any;
}


const BASE = "/mobileStocks";


export const getMobileStocksService = async (params?: Record<string, any>): Promise<MobileStock[]> => {
const response = await axiosClient.get(BASE, {
params,
headers: { "Cache-Control": "no-cache" },
});


const maybe = (response.data as any);
// support multiple shapes: direct array, data.mobileStocks, mobileStocks
if (Array.isArray(maybe)) return maybe as MobileStock[];
if (maybe?.data?.mobileStocks && Array.isArray(maybe.data.mobileStocks)) return maybe.data.mobileStocks;
if (maybe?.mobileStocks && Array.isArray(maybe.mobileStocks)) return maybe.mobileStocks;
if (maybe?.data && Array.isArray(maybe.data)) return maybe.data;


return [];
};


export const createMobileStockService = async (payload: Record<string, any> | FormData) => {
try {
// accept JSON or FormData depending on caller
const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
const response = await axiosClient.post(BASE, payload, {
headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
});
return response.data;
} catch (error) {
console.error('createMobileStockService error:', error);
throw error;
}
};


export const getMobileStockByIdService = async (id: string): Promise<MobileStock | null> => {
const res = await axiosClient.get(`${BASE}/${id}`);
// try to pick common shapes
const data = (res.data as any);
return data?.data?.mobileStock ?? data?.mobileStock ?? data?.data ?? null;
};


export const updateMobileStockService = async (id: string, payload: Record<string, any> | FormData) => {
try {
const isForm = typeof FormData !== 'undefined' && payload instanceof FormData;
const response = await axiosClient.patch(`${BASE}/${id}`, payload, {
headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
});
return response.data;
} catch (error) {
console.error('updateMobileStockService error:', error);
throw error;
}
};


export const deleteMobileStockService = async (id: string) => {
const res = await axiosClient.delete(`${BASE}/${id}`);
return res.data;
};


export default {
getMobileStocksService,
createMobileStockService,
getMobileStockByIdService,
updateMobileStockService,
deleteMobileStockService,
};