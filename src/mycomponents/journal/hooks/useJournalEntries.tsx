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

const isValidObjectId = (v: any) => {
  return typeof v === "string" && /^[a-fA-F0-9]{24}$/.test(v);
};

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
    void fetch();
  }, [fetch]);

  const refresh = useCallback(async (p?: Record<string, any>) => {
    setParams(p ?? params);
    return fetch(p);
  }, [fetch, params]);

  /**
   * createEntry:
   * - normalize payload keys (journalId <- jornalId)
   * - validate journalId and each lines[].accountId format (ObjectId)
   * - if invalid, throw descriptive error (so UI shows helpful message)
   */
  const createEntry = useCallback(async (payload: Partial<JournalEntry>) => {
    try {
      setLoading(true);
      setError(null);

      // normalize / fallback journalId
      const journalId = (payload as any).journalId ?? (payload as any).jornalId ?? payload.journalId;
      if (!journalId) {
        const err = new Error("Journal ID is required. Please select a journal from the dropdown.");
        toast.error(err.message);
        setError(err);
        throw err;
      }
      if (!isValidObjectId(journalId)) {
        const err = new Error(`Invalid journal ID format: "${String(journalId)}". Please select a valid journal.`);
        toast.error(err.message);
        setError(err);
        throw err;
      }

      // validate lines
      const lines = Array.isArray(payload.lines) ? payload.lines : [];
      if (lines.length === 0) {
        const err = new Error("At least one line is required.");
        toast.error(err.message);
        setError(err);
        throw err;
      }

      for (let i = 0; i < lines.length; i++) {
        const ln: any = lines[i];
        const acc = ln.accountId ?? ln.account ?? ln.accountCode ?? ln.accountName;
        if (!acc) {
          const err = new Error(`Line ${i + 1}: account is required.`);
          toast.error(err.message);
          setError(err);
          throw err;
        }
        if (!isValidObjectId(acc)) {
          // descriptive error: show the invalid value so the user can correct
          const err = new Error(`Line ${i + 1}: invalid account ID format: "${String(acc)}". Please select the account from the dropdown (must be an internal ID).`);
          toast.error(err.message);
          setError(err);
          throw err;
        }
      }

      // prepare payload for service (map jornalId -> journalId)
      const body: any = {
        ...payload,
        journalId,
        lines: lines.map((ln: any) => ({
          accountId: ln.accountId ?? ln.account ?? undefined,
          description: ln.description ?? ln.desc ?? "",
          debit: Number(ln.debit) || 0,
          credit: Number(ln.credit) || 0,
          ...(ln._id ? { _id: ln._id } : {}),
        })),
      };

      const res = await createJournalEntryService(body);
      const created = res?.data ?? res?.journalEntry ?? res ?? null;

      if (created) {
        // push created to local list if it has id
        const createdNormalized = (typeof created === "object" ? created : null) as JournalEntry | null;
        if (createdNormalized && (createdNormalized._id || createdNormalized.id)) {
          setEntries(prev => [createdNormalized, ...prev]);
        }
        toast.success("Journal entry created successfully");
      }

      return created;
    } catch (err: any) {
      console.error("createEntry error", err);
      setError(err);
      // If backend returned validation errors, try to surface them
      const backendMsg = err?.response?.data?.message ?? err?.response?.data?.errors ?? err?.message;
      toast.error(backendMsg || "Error creating journal entry");
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
      // we validate journalId if present in payload
      if ((payload as any).journalId || (payload as any).jornalId) {
        const journalId = (payload as any).journalId ?? (payload as any).jornalId;
        if (!isValidObjectId(journalId)) {
          const err = new Error(`Invalid journal ID format: "${String(journalId)}".`);
          toast.error(err.message);
          setError(err);
          throw err;
        }
      }

      // validate lines accountId if present
      if (Array.isArray(payload.lines)) {
        for (let i = 0; i < payload.lines.length; i++) {
          const acc = (payload.lines[i] as any).accountId ?? (payload.lines[i] as any).account;
          if (acc && !isValidObjectId(acc)) {
            const err = new Error(`Line ${i + 1}: invalid account ID format: "${String(acc)}".`);
            toast.error(err.message);
            setError(err);
            throw err;
          }
        }
      }

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
