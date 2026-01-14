// hooks/useJournalEntries.tsx
import { useCallback, useEffect, useState } from "react";
import {
  getJournalEntriesService,
  getJournalEntryByIdService,
  createJournalEntryService,
  updateJournalEntryService,
  deleteJournalEntryService,
} from "../services/journalEntryService";
import type { JournalEntry } from "../services/journalEntryService";
import { toast } from "react-hot-toast";

export function useJournalEntries(initialParams?: Record<string, any>) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [params, setParams] = useState<Record<string, any> | undefined>(initialParams);

  const fetch = useCallback(async (p?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getJournalEntriesService(p ?? params);
      setEntries(list);
      return list;
    } catch (err) {
      console.error("useJournalEntries: fetch error", err);
      setError(err);
      toast.error("Error fetching journal entries");
      return [];
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const refresh = useCallback(async (p?: Record<string, any>) => {
    setParams(p ?? params);
    return fetch(p);
  }, [fetch, params]);

  const createEntry = useCallback(async (payload: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      const res = await createJournalEntryService(payload);
      const created = res?.data ?? res?.journalEntry ?? res ?? null;
      if (created) {
        setEntries(prev => [created, ...prev]);
        toast.success("Journal entry created successfully");
      }
      return created;
    } catch (err: any) {
      console.error("createEntry error", err);
      setError(err);
      toast.error(err?.response?.data?.message || err?.message || "Error creating journal entry");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await getJournalEntryByIdService(id);
      return res;
    } catch (err) {
      console.error("getEntry error", err);
      setError(err);
      toast.error("Error fetching journal entry");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEntry = useCallback(async (id: string, payload: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      const res = await updateJournalEntryService(id, payload);
      const updated = res?.data ?? res ?? null;
      if (updated) {
        setEntries(prev => prev.map(e => (e._id === updated._id || e.id === updated.id ? updated : e)));
        toast.success("Journal entry updated successfully");
      }
      return updated;
    } catch (err: any) {
      console.error("updateEntry error", err);
      setError(err);
      toast.error(err?.response?.data?.message || "Error updating journal entry");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteJournalEntryService(id);
      setEntries(prev => prev.filter(e => e._id !== id && e.id !== id));
      toast.success("Journal entry deleted successfully");
    } catch (err) {
      console.error("deleteEntry error", err);
      setError(err);
      toast.error("Error deleting journal entry");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    entries,
    loading,
    error,
    refresh,
    createEntry,
    getEntry,
    updateEntry,
    deleteEntry,
  };
}

export default useJournalEntries;