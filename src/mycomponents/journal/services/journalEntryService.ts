// services/journalEntryService.ts
import axiosClient from "@/lib/axiosClient";

export interface JournalEntry {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  date?: string;
  authorId?: string;
  [key: string]: any;
}

const BASE = "/jornalEntry";

export const getJournalEntriesService = async (params?: Record<string, any>): Promise<JournalEntry[]> => {
  const res = await axiosClient.get(BASE, { params });
  const payload = res.data;

  if (Array.isArray(payload)) return payload as JournalEntry[];
  if (Array.isArray(payload?.data)) return payload.data as JournalEntry[];
  if (Array.isArray(payload?.data?.journalEntries)) return payload.data.journalEntries as JournalEntry[];
  if (Array.isArray(payload?.journalEntries)) return payload.journalEntries as JournalEntry[];

  return [];
};

export const getJournalEntryByIdService = async (id: string): Promise<JournalEntry | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload = res.data;

  if (payload?.data?.journalEntry) return payload.data.journalEntry as JournalEntry;
  if (payload?.data) return payload.data as JournalEntry;
  if (payload?.journalEntry) return payload.journalEntry as JournalEntry;
  if (payload) return payload as JournalEntry;

  return null;
};

export const createJournalEntryService = async (payload: Partial<JournalEntry>) => {
  const res = await axiosClient.post(BASE, payload);
  return res.data;
};

export const updateJournalEntryService = async (id: string, payload: Partial<JournalEntry>) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, payload);
  return res.data;
};

export const deleteJournalEntryService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};

export default {
  getJournalEntriesService,
  getJournalEntryByIdService,
  createJournalEntryService,
  updateJournalEntryService,
  deleteJournalEntryService,
};