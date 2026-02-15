// src/mycomponents/attendances/hooks/useAttendances.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getAllAttendancesService,
  getTodayAttendancesService,
  getMonthAttendancesService,
  getDayAttendancesService,
  getAttendanceByIdService,
  checkInService,
  checkOutService,
} from "../services/attendancesService";
import type { Attendance } from "../services/attendancesService";

import { toast } from "react-hot-toast";

/**
 * useAttendances hook
 * - initialParams: optional query params for the default fetch
 */
export function useAttendances(initialParams?: Record<string, any>) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllAttendancesService(p ?? params);
      setAttendances(list);
      return list;
    } catch (err) {
      console.error("useAttendances: fetch error", err);
      setError(err);
      toast.error("Error fetching attendances.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const refresh = useCallback(async (p?: Record<string, any>) => {
    setParams(p ?? params);
    return await fetch(p);
  }, [fetch, params]);

  const getToday = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getTodayAttendancesService();
      // optionally update state (we won't overwrite the main list, but we can)
      setAttendances(list);
      return list;
    } catch (err) {
      console.error("getToday failed", err);
      toast.error("Error fetching today's attendances.");
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonth = useCallback(async (query?: Record<string, any>) => {
    setLoading(true);
    try {
      const list = await getMonthAttendancesService(query);
      return list;
    } catch (err) {
      console.error("getMonth failed", err);
      toast.error("Error fetching month attendances.");
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getDay = useCallback(async (day: string) => {
    setLoading(true);
    try {
      const list = await getDayAttendancesService(day);
      return list;
    } catch (err) {
      console.error("getDay failed", err);
      toast.error("Error fetching day attendances.");
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAttendance = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const att = await getAttendanceByIdService(id);
      return att;
    } catch (err) {
      console.error("getAttendance failed", err);
      setError(err);
      toast.error("Error fetching attendance.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (id: string, payload?: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await checkInService(id, payload);
      toast.success("✅ Check-in success");
      // optionally refresh list
      await fetch();
      return res;
    } catch (err: any) {
      console.error("checkIn failed", err);
      setError(err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Check-in failed";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  const checkOut = useCallback(async (id: string, payload?: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await checkOutService(id, payload);
      toast.success("✅ Check-out success");
      await fetch();
      return res;
    } catch (err: any) {
      console.error("checkOut failed", err);
      setError(err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Check-out failed";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetch]);

  return {
    attendances,
    loading,
    error,
    params,
    refresh,
    fetch,
    getToday,
    getMonth,
    getDay,
    getAttendance,
    checkIn,
    checkOut,
  };
}

export default useAttendances;