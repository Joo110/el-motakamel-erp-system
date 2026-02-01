import { useCallback, useEffect, useState } from "react";
import {
  getAllPayrollsService,
  getPayrollByIdService,
  updatePayrollService,
} from "../services/payrollsService";
import type { Payroll } from "../services/payrollsService";
import { toast } from "react-hot-toast";

export function usePayrolls(initialParams?: Record<string, any>) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const list = await getAllPayrollsService(p ?? params);
        setPayrolls(Array.isArray(list) ? (list as Payroll[]) : []);
        return list;
      } catch (err) {
        console.error("usePayrolls: fetch error", err);
        setError(err);
        toast.error("Error fetching payrolls.");
        setPayrolls([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await getAllPayrollsService(params);
        setPayrolls(Array.isArray(list) ? (list as Payroll[]) : []);
      } catch (err) {
        console.error("usePayrolls initial load failed", err);
        setPayrolls([]);
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(
    async (p?: Record<string, any>) => {
      setParams(p ?? params);
      return await fetch(p);
    },
    [fetch, params]
  );

  const getPayroll = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const payroll = await getPayrollByIdService(id);
      return payroll;
    } catch (err) {
      console.error("getPayroll failed", err);
      setError(err);
      toast.error("Error fetching payroll.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayroll = useCallback(
    async (id: string, payload: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await updatePayrollService(id, payload);
        // refresh local list after update
        await fetch();
        return res;
      } catch (err: any) {
        console.error("updatePayroll failed", err);
        setError(err);
        const msg = err?.response?.data?.message ?? err?.message ?? "Update failed";
        toast.error(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  return {
    payrolls,
    loading,
    error,
    params,
    refresh,
    fetch,
    getPayroll,
    updatePayroll,
  };
}

export default usePayrolls;
