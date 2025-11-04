// hooks/useRoles.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getRolesService,
  createRoleService,
  getRoleByIdService,
  updateRoleService,
  deleteRoleService,
} from "../services/rolesService";
import type { Role } from "../services/rolesService";
import { toast } from "react-hot-toast";

export function useRoles(initialParams?: Record<string, any>) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getRolesService(p ?? params);
      setRoles(list);
    } catch (err) {
      console.error("useRoles: fetch error", err);
      setError(err);
      toast.error("Error fetching roles.");
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

  const createRole = useCallback(async (payload: Partial<Role>) => {
    try {
      setLoading(true);
      const res = await createRoleService(payload);
      const created = res?.data ?? res ?? null;
      if (created) setRoles(prev => [created, ...prev]);
      return created;
    } catch (err: any) {
      console.error("useRoles: create error", err);
      setError(err);
      toast.error("Error creating role.");
    } finally {
      setLoading(false);
    }
  }, []);

  const getRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getRoleByIdService(id);
      return res;
    } catch (err) {
      console.error("useRoles: get error", err);
      setError(err);
      toast.error("Error fetching role.");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRole = useCallback(async (id: string, payload: Partial<Role>) => {
    try {
      setLoading(true);
      const res = await updateRoleService(id, payload);
      const updated = res?.data ?? res ?? null;
      if (updated) setRoles(prev => prev.map(r => (r._id === updated._id || r.id === updated.id ? updated : r)));
      return updated;
    } catch (err) {
      console.error("useRoles: update error", err);
      setError(err);
      toast.error("Error updating role.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteRoleService(id);
      setRoles(prev => prev.filter(r => r._id !== id && r.id !== id));
      toast.success("✅ Role deleted.");
    } catch (err) {
      console.error("useRoles: delete error", err);
      setError(err);
      toast.error("Error deleting role.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    roles,
    loading,
    error,
    refresh,
    createRole,
    getRole,
    updateRole,
    deleteRole,
  };
}

export default useRoles;