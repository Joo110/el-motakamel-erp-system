// hooks/useDepartments.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getDepartmentsService,
  createDepartmentService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
} from "../services/departmentsService";
import type { Department } from "../services/departmentsService";
import { toast } from "react-hot-toast";

export function useDepartments(initialParams?: Record<string, any>) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getDepartmentsService(p ?? params);
      setDepartments(list);
    } catch (err) {
      console.error("useDepartments: fetch error", err);
      setError(err);
      toast.error("Error fetching departments.");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(async (p?: Record<string, any>) => {
    setParams(p ?? params);
    await fetch(p);
  }, [fetch, params]);

  const createDepartment = useCallback(async (payload: Partial<Department>) => {
    try {
      setLoading(true);
      const res = await createDepartmentService(payload);
      const created = res?.data ?? res ?? null;
      if (created) {
        setDepartments(prev => [created, ...prev]);
        toast.success("✅ Department created.");
      }
      return created;
    } catch (err: any) {
      console.error("useDepartments: create error", err);
      if (err?.response?.data?.err?.code === 11000 || err?.err?.code === 11000) {
        toast.error("❌ This department already exists!");
      } else {
        toast.error("Error creating department.");
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDepartment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getDepartmentByIdService(id);
      return res;
    } catch (err) {
      console.error("useDepartments: get error", err);
      setError(err);
      toast.error("Error fetching department.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, payload: Partial<Department>) => {
    try {
      setLoading(true);
      const res = await updateDepartmentService(id, payload);
      const updated = res?.data ?? res ?? null;
      if (updated) {
        setDepartments(prev => prev.map(d => (d._id === updated._id || d.id === updated.id ? updated : d)));
        toast.success("✅ Department updated.");
      }
      return updated;
    } catch (err) {
      console.error("useDepartments: update error", err);
      setError(err);
      toast.error("Error updating department.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteDepartmentService(id);
      setDepartments(prev => prev.filter(d => d._id !== id && d.id !== id));
      toast.success("✅ Department deleted.");
    } catch (err) {
      console.error("useDepartments: delete error", err);
      setError(err);
      toast.error("Error deleting department.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    departments,
    loading,
    error,
    refresh,
    createDepartment,
    getDepartment,
    updateDepartment,
    deleteDepartment,
  };
}

export default useDepartments;