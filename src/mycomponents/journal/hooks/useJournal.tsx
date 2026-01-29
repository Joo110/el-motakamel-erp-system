import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import type { JournalEntry } from "../services/journalService";
import {
  getJournalService,
  getJournalByIdService,
  createJournalService,
  updateJournalService,
  deleteJournalService,
  getJournalEntriesByJournalIdService,
} from "../services/journalService";

export function useJournal(initialParams?: Record<string, any>) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [params, setParams] = useState(initialParams);
  const [journalId, setJournalId] = useState<string | null>(null);

  const fetch = useCallback(
    async (p?: Record<string, any>) => {
      try {
        setLoading(true);
        let items: JournalEntry[] = [];

        if (journalId) {
          const response = await getJournalEntriesByJournalIdService(journalId);
          items = response || [];
        } else {
          const response = await getJournalService(p ?? params);
          items = response || [];
        }

        setEntries(items);
        return items;
      } catch (err) {
        console.error(err);
        toast.error("Error loading journal entries");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params, journalId]
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

  const createEntry = useCallback(
    async (payload: JournalEntry) => {
      try {
        setLoading(true);
        const created = await createJournalService(payload);
        // created is normalized JournalEntry
        if (created && created._id) {
          setEntries((prev) => [created, ...prev]);
          return created;
        }
        // fallback: if service returned something unexpected
        setEntries((prev) => [created as any, ...prev]);
        return created;
      } catch (err: any) {
        console.error(err);
        toast.error("Error creating journal entry");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getEntry = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        return await getJournalByIdService(id);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching journal entry");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateEntry = useCallback(
    async (id: string, payload: JournalEntry) => {
      try {
        setLoading(true);
        const updated = await updateJournalService(id, payload);

        if (updated && updated._id) {
          setEntries((prev) => prev.map((j) => (j._id === updated._id ? updated : j)));
        }

        return updated;
      } catch (err) {
        console.error(err);
        toast.error("Error updating journal entry");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeEntry = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await deleteJournalService(id);
        setEntries((prev) => prev.filter((j) => j._id !== id));
        toast.success("Journal entry deleted");
      } catch (err) {
        console.error(err);
        toast.error("Error deleting journal entry");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    entries,
    loading,
    error,
    journalId,
    setJournalId,
    refresh,
    createEntry,
    getEntry,
    updateEntry,
    removeEntry,
  };
}

export default useJournal;
