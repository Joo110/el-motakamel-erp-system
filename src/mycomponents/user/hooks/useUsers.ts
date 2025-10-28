import { useCallback, useEffect, useState } from 'react';
import type { User } from '../Services/Urls/users';
import { getUsersService } from '../Services/Urls/users';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsersService();
      setUsers(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      setError(err as Error);
      setUsers([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers } as const;
}