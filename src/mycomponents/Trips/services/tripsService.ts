import axiosClient from "@/lib/axiosClient";

export interface TripProduct {
  product: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface TripPayload {
  representative: string;
  driver: string;
  car: string;
  location: string;
  date: string;
  area?: string;
  products?: TripProduct[];
}

export interface Trip extends TripPayload {
  _id?: string;
  id?: string;
  tripNumber?: number | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const TRIPS_BASE = "/trips";

function normalizeTrip(raw: any): Trip {
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    _id: raw._id ?? raw.id ?? (typeof raw === "object" ? raw.id : undefined),
    id: raw.id ?? raw._id,
    tripNumber: raw.tripNumber ?? raw.trip_number ?? raw.tripNo ?? raw._id ?? raw.id,
    representative: raw.representative ?? null,
    driver: raw.driver ?? null,
    car: raw.car ?? null,
    location: raw.location ?? raw.area ?? null,
    date: raw.date ?? raw.createdAt ?? null,
    status: raw.status ?? null,
    products: raw.products ?? [],
  } as Trip;
}

// CREATE api/v1/trips
export const createTripService = async (payload: TripPayload) => {
  const res = await axiosClient.post(TRIPS_BASE, payload);
  return res.data;
};

// GET api/v1/trips
export const getTripsService = async (
  params?: Record<string, any>
): Promise<Trip[]> => {
  const res = await axiosClient.get(TRIPS_BASE, { params });
  const d = res.data ?? {};

  let arr: any[] | undefined;

  if (Array.isArray(d)) arr = d;
  else if (Array.isArray(d.data)) arr = d.data;
  else if (Array.isArray(d.results?.data)) arr = d.results.data;
  else if (Array.isArray(d.items)) arr = d.items;
  else if (Array.isArray(d.docs)) arr = d.docs;
  else if (Array.isArray(d.paginationResult?.data)) arr = d.paginationResult.data;
  else if (Array.isArray((res as any).data?.data)) arr = (res as any).data.data;

  if (!arr) {
    // try to detect data.* arrays
    for (const key of Object.keys(d)) {
      if (Array.isArray((d as any)[key])) {
        // prefer known names
        const name = key.toLowerCase();
        if (["data", "items", "docs", "results", "mobileStocks", "trips"].includes(name)) {
          arr = (d as any)[key];
          break;
        }
      }
    }
  }

  if (!arr && d && typeof d === "object") {
    // check common nested
    const candidates = ["data", "items", "docs", "results", "trips"];
    for (const c of candidates) {
      if (Array.isArray(d[c])) {
        arr = d[c];
        break;
      }
    }
  }

  if (!arr) return [];

  // normalize each item
  return arr.map(normalizeTrip);
};

// PATCH api/v1/trips
export const patchTripsService = async (payload: TripPayload) => {
  const res = await axiosClient.patch(TRIPS_BASE, payload);
  return res.data;
};

// PATCH api/v1/trips/complete/:id
export const completeTripService = async (
  id: string,
  payload?: Record<string, any>
) => {
  const res = await axiosClient.patch(
    `${TRIPS_BASE}/complete/${id}`,
    payload ?? {}
  );
  return res.data;
};


// GET api/v1/trips/:id
export const getTripByIdService = async (id: string): Promise<Trip | null> => {
  const res = await axiosClient.get(`${TRIPS_BASE}/${id}`);
  const raw = res.data?.data ?? res.data?.trip ?? res.data ?? null;
  if (!raw) return null;
  return normalizeTrip(raw);
};

export default {
  createTripService,
  getTripsService,
  patchTripsService,
  completeTripService,
  getTripByIdService,
};