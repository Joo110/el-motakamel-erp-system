import { useCallback, useEffect, useState } from 'react';
import { getStatistics } from '../services/statistics';
import type { StatisticsResponse } from '../services/statistics';

export function useStatistics(autoFetch: boolean = true) {
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getStatistics();

      // enhance the returned object so components that expect either:
      //  - direct object { key: value }
      //  - or nested { data: { ... } }
      // will work without changing the hook's external shape.
      const normalized = {
        ...res,
        // ensure there's a `data` property pointing to the canonical object
        data: res,
      } as StatisticsResponse & { data: StatisticsResponse };

      setData(normalized);
      return normalized;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Failed to fetch statistics');
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) void fetch();
  }, [autoFetch, fetch]);

  return { data, loading, error, fetch, setData } as const;
}
