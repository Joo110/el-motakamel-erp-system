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


export const getCategoriesService = (config?: AxiosRequestConfig) => {
  return axiosClient.get("/categories", config);
};


export const createCategoryService = (payload: CategoryInput, config?: AxiosRequestConfig) => {
  return axiosClient.post("/category", payload, config);
};


export const updateCategoryService = (id: string, payload: Partial<CategoryInput>, config?: AxiosRequestConfig) => {
  return axiosClient.put(`/category/${id}`, payload, config);
};

export const deleteCategoryService = (id: string, config?: AxiosRequestConfig) => {
  return axiosClient.delete(`/category/${id}`, config);
};

export default {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
};