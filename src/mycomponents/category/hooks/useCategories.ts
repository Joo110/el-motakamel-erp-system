import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosRequestConfig } from "axios";
import {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService,
  type Category,
  type CategoryInput,
} from "../services/categoryService";

const isAbortError = (err: unknown) => {
  if (typeof err !== "object" || err === null) return false;
  const name = (err as { name?: unknown }).name;
  return name === "CanceledError" || name === "AbortError";
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Abort previous
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await getCategoriesService({ signal: controller.signal } as AxiosRequestConfig);
      // مرونة في التعامل مع طبقات الـ response المختلفة
      const payload = res?.data?.data ?? res?.data ?? res;
      // payload قد يحتوي على { categories: [...] } أو يكون مصفوفة مباشرة
      const list: Category[] = payload?.categories ?? payload ?? [];
      setCategories(Array.isArray(list) ? list : []);
      return list;
    } catch (err: unknown) {
      if (isAbortError(err)) return;
      setError(err as Error);
      console.error("fetchAll categories error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchAll]);

  const refetch = useCallback(() => fetchAll(), [fetchAll]);

  const create = useCallback(async (payload: CategoryInput) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await createCategoryService(payload);
      const created = res?.data?.data ?? res?.data ?? res;
      // حاول استنتاج الكاتيجوري المنشأ (قد تكون داخل .category أو مباشرة)
      const newCategory: Category = created?.category ?? created;
      setCategories((prev) => [newCategory, ...prev]);
      return newCategory;
    } catch (err: unknown) {
      setError(err as Error);
      console.error("create category error:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<CategoryInput>) => {
    setIsMutating(true);
    setError(null);
    try {
      const res = await updateCategoryService(id, data);
      const updatedPayload = res?.data?.data ?? res?.data ?? res;
      const updatedCategory: Category = updatedPayload?.category ?? updatedPayload;
      setCategories((prev) => prev.map((c) => (String(c._id) === String(id) ? updatedCategory : c)));
      return updatedCategory;
    } catch (err: unknown) {
      setError(err as Error);
      console.error("update category error:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsMutating(true);
    setError(null);
    try {
      await deleteCategoryService(id);
      setCategories((prev) => prev.filter((c) => String(c._id) !== String(id)));
      return true;
    } catch (err: unknown) {
      setError(err as Error);
      console.error("delete category error:", err);
      throw err;
    } finally {
      setIsMutating(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    isMutating,
    error,
    refetch,
    create,
    update,
    remove,
  } as const;
};

export default useCategories;