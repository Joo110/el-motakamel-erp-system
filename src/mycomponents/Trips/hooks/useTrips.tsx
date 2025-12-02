import { useState, useCallback, useEffect } from "react";
import {
  getTripsService,
  patchTripsService,
  completeTripService,
  getTripByIdService,
  type Trip,
  type TripPayload,
  createTripService,     // ← تمت إضافته
} from "../services/tripsService";
import { toast } from "react-hot-toast";

export function useTrips(initialParams?: Record<string, any>) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const list = await getTripsService(p ?? params);
        setTrips(list);
        return list;
      } catch (err) {
        console.error("fetch trips error", err);
        setError(err);
        toast.error("Error fetching trips");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const refresh = useCallback(
    async (p?: Record<string, any>) => {
      setParams(p ?? params);
      return await fetch(p);
    },
    [fetch, params]
  );

  // ✅ PATCH Trip
  const patchTrips = useCallback(
    async (payload: TripPayload) => {
      setLoading(true);
      try {
        const res = await patchTripsService(payload);
        toast.success("Trip updated successfully");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("patchTrips failed", err);
        setError(err);
        toast.error(err?.response?.data?.message ?? "Updating trips failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  // 🆕🔥 CREATE Trip
  const createTrip = useCallback(
    async (payload: TripPayload) => {
      setLoading(true);
      try {
        const res = await createTripService(payload);
        toast.success("Trip created successfully");
        await fetch(); // تحديث القائمة بعد الإنشاء
        return res;
      } catch (err: any) {
        console.error("createTrip failed", err);
        setError(err);
        toast.error(
          err?.response?.data?.message ?? "Error creating trip"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  // COMPLETE Trip
  const completeTrip = useCallback(
    async (id: string, payload?: Record<string, any>) => {
      setLoading(true);
      try {
        const res = await completeTripService(id, payload);
        toast.success("Trip completed");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("completeTrip failed", err);
        setError(err);
        toast.error(
          err?.response?.data?.message ?? "Completing trip failed"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const getTrip = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getTripByIdService(id);
      return res;
    } catch (err) {
      console.error("getTrip failed", err);
      setError(err);
      toast.error("Error fetching trip");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    trips,
    loading,
    error,
    params,
    refresh,
    fetch,
    patchTrips,
    completeTrip,
    getTrip,
    createTrip, // ← تمت إضافته هنا
  };
}

export default useTrips;
