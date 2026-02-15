// src/mycomponents/statistics/hooks/useStatistics.ts
import { useState, useCallback } from "react";
import { getStatisticsService } from "../services/statistics";
import type { StatisticsResponse } from "../services/statistics";

export const useStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StatisticsResponse | null>(null);

  const getStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStatisticsService();
      setData(res);
      return res;
    } catch (err: any) {
      console.error("Get statistics error:", err);
      setError(err?.response?.data?.message ?? "Failed to fetch statistics");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getStatistics,
    data,
    loading,
    error,
  } as const;
};
