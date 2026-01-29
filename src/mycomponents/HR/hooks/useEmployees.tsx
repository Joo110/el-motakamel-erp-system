import { useCallback, useEffect, useState } from "react";
import {
  getEmployeesService,
  createEmployeeService,
  getEmployeeByIdService,
  updateEmployeeService,
  activateEmployeeService,
  deleteEmployeeService,
} from "../services/employeesService";
import type {
  Employee,
} from "../services/employeesService";
import { toast } from "react-hot-toast";

export function useEmployees(initialParams?: Record<string, any>) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getEmployeesService(p ?? params);
      setEmployees(list);
    } catch (err) {
      console.error("useEmployees: fetch error", err);
      setError(err);
      toast.error("Error fetching employees.");
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


  const createEmployee = useCallback(async (payload: any) => {
    try {
      setLoading(true);
      const res = await createEmployeeService(payload);
      const created = res?.data ?? res?.employee ?? res ?? null;
      if (created) {
        setEmployees((prev) => [created, ...prev]);
      }
      return created;
    } catch (err: any) {
      console.error("Create failed", err);
      setError(err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error creating employee";

      if (message.includes("E11000 duplicate key error")) {
        if (message.includes("email")) {
          toast.error("This email is already registered!");
        } else if (message.includes("phone")) {
          toast.error("This phone number is already registered!");
        } else if (message.includes("alternativePhone")) {
          toast.error("This alternative phone is already registered!");
        } else {
          toast.error("Duplicate field value detected.");
        }
      } else {
        toast.error(message || "Error creating employee");
      }
    } finally {
      setLoading(false);
    }
  }, []);


  const getEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getEmployeeByIdService(id);
      return res;
    } catch (err) {
      console.error("Get employee failed", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(async (id: string, payload: any) => {
    try {
      setLoading(true);
      const res = await updateEmployeeService(id, payload);
      const updated = res?.data ?? res ?? null;
      if (updated) {
        setEmployees((prev) =>
          prev.map((e) =>
            e._id === updated._id || e.id === updated.id ? updated : e
          )
        );
      }
      return updated;
    } catch (err: any) {
      console.error("Update failed", err);
      setError(err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error updating employee";

      if (message.includes("E11000 duplicate key error")) {
        if (message.includes("email")) {
          toast.error("❌ This email is already registered!");
        } else if (message.includes("phone")) {
          toast.error("❌ This phone number is already registered!");
        } else if (message.includes("alternativePhone")) {
          toast.error("❌ This alternative phone is already registered!");
        } else {
          toast.error("❌ Duplicate field value detected.");
        }
      } else {
        toast.error(message || "Error updating employee");
      }
    } finally {
      setLoading(false);
    }
  }, []);


  const activateEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await activateEmployeeService(id);
      // API قد لا يرجع جسم، لذلك نحدث الحالة محليًا
      setEmployees(prev =>
        prev.map(e => {
          if (e._id === id || e.id === id) {
            return { ...e, active: true };
          }
          return e;
        })
      );
      toast.success("✅ Employee activated.");
    } catch (err) {
      console.error("Activate failed", err);
      setError(err);
      toast.error("Error activating employee.");
    } finally {
      setLoading(false);
    }
  }, []);


  const deleteEmployee = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteEmployeeService(id);
      setEmployees(prev => prev.filter(e => e._id !== id && e.id !== id));
      toast.success("✅ Employee deleted.");
    } catch (err) {
      console.error("Delete failed", err);
      setError(err);
      toast.error("Error deleting employee.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    employees,
    loading,
    error,
    refresh,
    createEmployee,
    getEmployee,
    updateEmployee,
    activateEmployee,
    deleteEmployee,
  };
}

export default useEmployees;
