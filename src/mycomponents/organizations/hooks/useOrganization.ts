import { useCallback, useEffect, useState } from 'react';
import { getOrganizationById } from '../services/organizations';

export function useOrganization(id?: string) {
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async (orgId?: string) => {
    const realId = orgId ?? id;
    if (!realId) throw new Error('Missing organization ID');
    setLoading(true);
    setError(null);
    try {
      const res = await getOrganizationById(realId);
      setOrganization(res);
      return res;
    } catch (err) {
      const e = err as Error;
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) void fetch(id);
  }, [id, fetch]);

  return { organization, loading, error, fetch } as const;
}