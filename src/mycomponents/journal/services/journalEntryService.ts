import axiosClient from "@/lib/axiosClient";

export interface JournalEntry {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  date?: string;
  authorId?: string;
  // possible journal entry shape
  journalId?: string;
  jornalId?: string;
  lines?: Array<{
    _id?: string;
    id?: string;
    accountId?: string;
    accountCode?: string;
    accountName?: string;
    description?: string;
    debit?: number;
    credit?: number;
    [k: string]: any;
  }>;
  reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const BASE = "/journal-entries";

/**
 * Prepare payload to match API expectations:
 * - ensure `journalId` exists (map from `jornalId` fallback)
 * - ensure each line uses `accountId` key (map from other keys if present)
 */
function preparePayload(payload: Partial<JournalEntry>) {
  const body: any = { ...payload };

  // journalId fallback from jornalId
  if (!body.journalId && body.jornalId) {
    body.journalId = body.jornalId;
  }

  // normalize lines
  if (Array.isArray(body.lines)) {
    body.lines = body.lines.map((ln: any) => {
      const normalizedLine: any = { ...ln };
      // map possible alternate keys to accountId
      if (!normalizedLine.accountId) {
        normalizedLine.accountId = normalizedLine.account ?? normalizedLine.account_id ?? normalizedLine.accountCode ?? normalizedLine.accountCodeValue;
      }
      // ensure numeric values for debit/credit
      normalizedLine.debit = normalizedLine.debit ? Number(normalizedLine.debit) : 0;
      normalizedLine.credit = normalizedLine.credit ? Number(normalizedLine.credit) : 0;
      return normalizedLine;
    });
  }

  return body;
}

// --- Services ---

export const getJournalEntriesService = async (params?: Record<string, any>): Promise<JournalEntry[]> => {
  const res = await axiosClient.get(BASE, { params });
  const payload = res?.data ?? res;

  // Normalize common response shapes
  if (Array.isArray(payload)) return payload as JournalEntry[];
  if (Array.isArray(payload?.data)) return payload.data as JournalEntry[];
  if (Array.isArray(payload?.data?.journalEntries)) return payload.data.journalEntries as JournalEntry[];
  if (Array.isArray(payload?.journalEntries)) return payload.journalEntries as JournalEntry[];
  if (payload?.data?.docs && Array.isArray(payload.data.docs)) return payload.data.docs as JournalEntry[];

  return [];
};

export const getJournalEntryByIdService = async (id: string): Promise<JournalEntry | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload = res?.data ?? res;

  if (payload?.data?.journalEntry) return payload.data.journalEntry as JournalEntry;
  if (payload?.data) return payload.data as JournalEntry;
  if (payload?.journalEntry) return payload.journalEntry as JournalEntry;
  if (payload) return payload as JournalEntry;

  return null;
};

// Create journal entry: prepare payload then send
export const createJournalEntryService = async (payload: Partial<JournalEntry>) => {
  const body = preparePayload(payload);
  const res = await axiosClient.post(BASE, body);
  return res?.data ?? res;
};

// Update journal entry
export const updateJournalEntryService = async (id: string, payload: Partial<JournalEntry>) => {
  const body = preparePayload(payload);
  const res = await axiosClient.patch(`${BASE}/${id}`, body);
  return res?.data ?? res;
};

// Delete journal entry
export const deleteJournalEntryService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res?.data ?? res;
};

export default {
  getJournalEntriesService,
  getJournalEntryByIdService,
  createJournalEntryService,
  updateJournalEntryService,
  deleteJournalEntryService,
};
