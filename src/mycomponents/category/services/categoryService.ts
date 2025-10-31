import axiosClient from "@/lib/axiosClient";
import type { AxiosRequestConfig } from "axios";

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  [key: string]: any;
}

export interface CategoryInput {
  name: string;
  description?: string;
  [key: string]: any;
}

/**
 * يحصل على كل الكاتيجوريات
 * يمكنك تمرير { signal } للالغاء
 */
export const getCategoriesService = (config?: AxiosRequestConfig) => {
  return axiosClient.get("/category", config);
};

/**
 * ينشئ كاتيجوري جديد
 */
export const createCategoryService = (payload: CategoryInput, config?: AxiosRequestConfig) => {
  return axiosClient.post("/category", payload, config);
};

/**
 * يحدث كاتيجوري ب id
 */
export const updateCategoryService = (id: string, payload: Partial<CategoryInput>, config?: AxiosRequestConfig) => {
  return axiosClient.put(`/category/${id}`, payload, config);
};

/**
 * يحذف كاتيجوري ب id
 */
export const deleteCategoryService = (id: string, config?: AxiosRequestConfig) => {
  return axiosClient.delete(`/category/${id}`, config);
};

export default {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
};