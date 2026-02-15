import axiosClient from "@/lib/axiosClient";

export interface JournalEntry {
  _id?: string;
  id?: string;
  name?: string;
  journalType?: string; // canonical
  jornalType?: string; // legacy/typo compatibility (used by UI)
  code?: string;
  createdAt?: string;
  updatedAt?: string;

  // journal entries
  date?: string;
  description?: string;
  reference?: string;
  totalDebit?: number;
  totalCredit?: number;
  entries?: Array<{
    account?: string;
    debit?: number;
    credit?: number;
    note?: string;
    [k: string]: any;
  }>;

  [key: string]: any;
}

const BASE = "/journals";

/** 🔧 Ensure backend-required fields are sent correctly */
function preparePayload(payload: JournalEntry) {
  return {
    ...payload,
    // backend strictly requires journalType
    journalType: payload.journalType ?? payload.jornalType,
  };
}

/** Normalize raw backend object to canonical JournalEntry shape.
 *  Keeps both `journalType` and `jornalType` for compatibility with UI.
 */
function normalizeJournal(raw: any): JournalEntry {
  if (!raw || typeof raw !== "object") return {} as JournalEntry;

  const _id = raw._id ?? raw.id ?? raw._ID ?? raw._Id;
  const id = raw.id ?? _id;
  const name = raw.name ?? raw.title ?? raw.journalName ?? "";
  const journalType =
    raw.journalType ??
    raw.jornalType ??
    raw.type ??
    raw.journal_type ??
    "";
  const jornalType = raw.jornalType ?? raw.journalType ?? journalType;
  const code = raw.code ?? raw.reference ?? raw.codeValue ?? "";
  const createdAt = raw.createdAt ?? raw.created_at ?? raw.created;
  const updatedAt = raw.updatedAt ?? raw.updated_at ?? raw.updated;

  return {
    ...raw,
    _id,
    id,
    name,
    journalType,
    jornalType,
    code,
    createdAt,
    updatedAt,
  } as JournalEntry;
}

/** ---------------- Services ---------------- **/

// Get all journals
export const getJournalService = async (
  params?: Record<string, any>
): Promise<JournalEntry[]> => {
  const res = await axiosClient.get(BASE, { params });
  const payload = res?.data ?? res;

  let items: any[] = [];

  if (Array.isArray(payload)) items = payload;
  else if (Array.isArray(payload.data)) items = payload.data;
  else if (Array.isArray(payload.results)) items = payload.results;
  else if (payload?.data?.docs && Array.isArray(payload.data.docs))
    items = payload.data.docs;
  else if (Array.isArray(payload.journals)) items = payload.journals;

  return items.map(normalizeJournal);
};

// Get journal by id
export const getJournalByIdService = async (
  id: string
): Promise<JournalEntry | null> => {
  const res = await axiosClient.get(`${BASE}/${id}`);
  const payload = res?.data ?? res;
  const raw = payload?.data ?? payload;

  if (!raw) return null;
  if (Array.isArray(raw)) return normalizeJournal(raw[0] ?? {});

  return normalizeJournal(raw);
};

// Create journal ✅ FIXED
export const createJournalService = async (payload: JournalEntry) => {
  const body = preparePayload(payload);

  const res = await axiosClient.post(BASE, body);
  const api = res?.data ?? res;
  const raw = api?.data ?? api;

  return normalizeJournal(raw ?? {});
};

// Update journal ✅ FIXED
export const updateJournalService = async (
  id: string,
  payload: JournalEntry
) => {
  const body = preparePayload(payload);

  const res = await axiosClient.patch(`${BASE}/${id}`, body);
  const api = res?.data ?? res;
  const raw = api?.data ?? api;

  return normalizeJournal(raw ?? {});
};

// Delete journal
export const deleteJournalService = async (id: string) => {
  const res = await axiosClient.delete(`${BASE}/${id}`);
  return res?.data ?? res;
};

// ضع هذا داخل ملف الخدمة حيث توجد بقية الدوال (مثلاً src/services/journalService.ts أو journalEntryService.ts)

type RawAny = any;

/**
 * Normalize a single journal-entry raw object into the shape the UI expects.
 * - ensures _id exists (from _id or id)
 * - ensures journalId is normalized (keeps nested object but exposes journalId._id)
 * - normalizes each line: if line.accountId is an object -> map to accountId string and keep accountName/accountCode
 */
function normalizeJournalEntry(raw: RawAny) {
  if (!raw || typeof raw !== "object") return raw;

  const _id = raw._id ?? raw.id ?? undefined;
  const journalIdRaw = raw.journalId ?? raw.jornalId ?? null;

  // normalize lines
  const rawLines = Array.isArray(raw.lines) ? raw.lines : [];

  const lines = rawLines.map((ln: any, idx: number) => {
    // handle accountId being object or string
    let accountId: string | undefined = undefined;
    let accountName: string | undefined = undefined;
    let accountCode: string | undefined = undefined;

    if (ln && typeof ln.accountId === "object" && ln.accountId !== null) {
      accountId = ln.accountId._id ?? ln.accountId.id;
      accountName = ln.accountId.name ?? ln.accountName;
      accountCode = ln.accountId.code ?? ln.accountCode;
    } else {
      accountId = ln.accountId ?? ln.account ?? undefined;
      accountName = ln.accountName ?? undefined;
      accountCode = ln.accountCode ?? undefined;
    }

    return {
      _id: ln._id ?? ln.id ?? `${_id ?? "entry"}-line-${idx}`,
      accountId,
      accountName,
      accountCode,
      description: ln.description ?? ln.desc ?? "",
      debit: Number(ln.debit ?? 0),
      credit: Number(ln.credit ?? 0),
      ...ln, // keep other fields if any
    };
  });

  // normalize journalId: keep object but expose id as journalId._id if nested
  const normalizedJournalId =
    journalIdRaw && typeof journalIdRaw === "object"
      ? {
          _id: journalIdRaw._id ?? journalIdRaw.id,
          name: journalIdRaw.name,
          journalType: journalIdRaw.journalType ?? journalIdRaw.type,
          ...journalIdRaw,
        }
      : journalIdRaw; // could be string id

  // build normalized entry
  const normalized: any = {
    ...raw,
    _id,
    id: raw.id ?? _id,
    journalId: normalizedJournalId,
    lines,
    totalDebit: Number(raw.totalDebit ?? raw.total_debit ?? (lines.reduce((s: number, l: any) => s + (l.debit || 0), 0))),
    totalCredit: Number(raw.totalCredit ?? raw.total_credit ?? (lines.reduce((s: number, l: any) => s + (l.credit || 0), 0))),
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };

  return normalized;
}

/**
 * Fetch journal entries for a given journalId.
 * Tries multiple request patterns:
 * 1) GET /journal-entries?journalId=ID  (preferred)
 * 2) GET /journals/:journalId/journal-entries
 * 3) GET /journal-entries/journal/:journalId
 * 4) GET /journal-entries/:id  (if backend returns a single entry)
 *
 * Returns normalized JournalEntry[].
 */
export const getJournalEntriesByJournalIdService = async (
  journalId: string
): Promise<any[]> => {
  if (!journalId) return [];

  const triedPaths: string[] = [];

  // helper to parse payload into array of raw entries
  const parsePayloadToArray = (payload: any): any[] => {
    if (!payload) return [];

    // if payload is array
    if (Array.isArray(payload)) return payload;

    // if payload.data is array
    if (Array.isArray(payload.data)) return payload.data;

    // if nested docs
    if (payload?.data?.docs && Array.isArray(payload.data.docs)) return payload.data.docs;

    // if payload.data is a single object that looks like an entry
    if (payload?.data && typeof payload.data === "object" && (payload.data.id || payload.data._id || payload.data.lines)) {
      return [payload.data];
    }

    // if payload itself is an object looking like a single entry
    if (typeof payload === "object" && (payload.id || payload._id || payload.lines)) {
      return [payload];
    }

    return [];
  };

  // candidate requests in preferred order
  const candidates = [
    { url: `/journal-entries`, params: { journalId } }, // GET /journal-entries?journalId=...
    { url: `/journal-entries`, params: { journal: journalId } }, // GET /journal-entries?journal=...
    { url: `/journals/${journalId}/journal-entries` }, // nested journals route
    { url: `/journal-entries/journal/${journalId}` }, // alternate
    { url: `/journal-entries/${journalId}` }, // may return single entry or error if ID is not entry id
  ];

  for (const candidate of candidates) {
    try {
      triedPaths.push(candidate.params ? `${candidate.url}?${new URLSearchParams(candidate.params as any).toString()}` : candidate.url);
      // use axiosClient.get with params when provided
      const res = candidate.params
        ? await axiosClient.get(candidate.url, { params: candidate.params })
        : await axiosClient.get(candidate.url);

      const payload = res?.data ?? res;
      const items = parsePayloadToArray(payload);

      if (items.length > 0) {
        return items.map(normalizeJournalEntry);
      }

      // if payload includes an error message like { status: 'fail', message: 'No document for this ID: ...' } -> skip to next
      if (payload && payload.status === "fail" && typeof payload.message === "string") {
        console.warn(`getJournalEntriesByJournalIdService candidate ${candidate.url} failed:`, payload.message);
        // continue to try next candidate
      }
    } catch (err) {
      console.debug(`getJournalEntriesByJournalIdService: request to ${candidate.url} failed`, err);
      // try next
    }
  }

  console.warn(`getJournalEntriesByJournalIdService: no entries found for journalId=${journalId}. tried: ${triedPaths.join(", ")}`);
  return [];
};
