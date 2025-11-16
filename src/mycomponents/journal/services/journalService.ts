import axiosClient from "@/lib/axiosClient";

export interface JournalEntry {
  _id?: string;
  id?: string;
  date: string;
  description: string;
  reference?: string;
  totalDebit?: number;
  totalCredit?: number;
  entries?: Array<{
    account: string;
    debit: number;
    credit: number;
    note?: string;
  }>;
  [key: string]: any;
}

const BASE = "/jornals";

// Get all journal entries
export const getJournalService = async (params?: Record<string, any>): Promise<JournalEntry[]> => {
  const res = await axiosClient.get(BASE, { params });

  const data = res.data;
  if (Array.isArray(data)) return data;
  if (data?.data?.jornals) return data.data.jornals;
  if (data?.jornals) return data.jornals;

  return [];
};

// Get by ID
export const getJournalByIdService = async (id: string): Promise<JournalEntry> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  return res.data?.data?.jornal ?? res.data;
};

// Create
export const createJournalService = async (payload: JournalEntry) => {
  const res = await axiosClient.post(BASE, payload);
  return res.data;
};

// Update
export const updateJournalService = async (id: string, payload: JournalEntry) => {
  const res = await axiosClient.patch(`${BASE}/${id}`, payload);
  return res.data;
};

// Delete
export const deleteJournalService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res.data;
};