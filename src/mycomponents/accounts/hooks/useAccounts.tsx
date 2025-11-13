// hooks/useAccounts.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getAccountsService,
  createAccountService,
  deleteAccountService,
} from "../services/accountsService";
import type { Account } from "../services/accountsService";
import { toast } from "react-hot-toast";

export function useAccounts(initialParams?: Record<string, any>) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  // جلب البيانات
  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAccountsService(p ?? params);
      setAccounts(list);
    } catch (err) {
      console.error("useAccounts: fetch error", err);
      setError(err);
      toast.error("❌ Error fetching accounts.");
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

  // إنشاء حساب جديد
  const createAccount = useCallback(async (payload: Partial<Account>) => {
    try {
      setLoading(true);
      const res = await createAccountService(payload);
      const created = res?.data ?? res ?? null;
      if (created) {
        setAccounts(prev => [created, ...prev]);
        toast.success("✅ Account created successfully.");
      }
      return created;
    } catch (err: any) {
      console.error("useAccounts: create error", err);
      if (err?.response?.data?.err?.code === 11000 || err?.err?.code === 11000) {
        toast.error("❌ This account already exists!");
      } else {
        toast.error("❌ Error creating account.");
      }
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // حذف حساب
  const deleteAccount = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteAccountService(id);
      setAccounts(prev => prev.filter(a => a._id !== id && a.id !== id));
      toast.success("✅ Account deleted.");
    } catch (err) {
      console.error("useAccounts: delete error", err);
      setError(err);
      toast.error("❌ Error deleting account.");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accounts,
    loading,
    error,
    refresh,
    createAccount,
    deleteAccount,
  };
}

export default useAccounts;