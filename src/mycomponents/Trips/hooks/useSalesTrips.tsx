// src/mycomponents/salesTrip/hooks/useSalesTrips.tsx

import { useState, useEffect, useCallback } from "react";
import {
  createSalesTripService,
  getAllSalesTripsService,
  getSalesTripByIdService,
  type SalesOrder,
  type CreateSalesTripPayload,
} from "../services/salesTripService";

import { toast } from "react-hot-toast";

export function useSalesTrips() {
  const [salesTrips, setSalesTrips] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // ===================== FETCH ALL =====================
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllSalesTripsService();
      setSalesTrips(list);
      return list;
    } catch (err) {
      console.error("fetch sales trips error", err);
      setError(err);
      toast.error("Error fetching sales trips");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  // ===================== CREATE =====================
  const create = useCallback(
    async (tripId: string, payload: CreateSalesTripPayload) => {
      setLoading(true);
      try {
        const res = await createSalesTripService(tripId, payload);
        toast.success("Sales trip created");
        await fetch();
        return res;
      } catch (err: any) {
        console.error("create sales trip failed", err);
        setError(err);
        toast.error(
          err?.response?.data?.message ?? "Error creating sales trip"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  // ===================== GET BY ID =====================
  const getSalesTrip = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await getSalesTripByIdService(id);
      return res;
    } catch (err) {
      console.error("getSalesTrip failed", err);
      setError(err);
      toast.error("Error fetching sales trip");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    salesTrips,
    loading,
    error,

    fetch,
    create,
    getSalesTrip,
  };
}

export default useSalesTrips;