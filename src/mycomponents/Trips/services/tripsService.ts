import axiosClient from "@/lib/axiosClient";

export interface TripPayload {
  representative: string;
  driver: string;
  car: string;
  location: string;
  date: string; // example: "11-7-2025"
}

export interface Trip extends TripPayload {
  _id?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TRIPS_BASE = "/trips";

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

  const d = res.data;

  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data?.trips)) return d.data.trips;
  if (Array.isArray(d?.trips)) return d.trips;

  return [];
};

// PATCH api/v1/trips
export const patchTripsService = async (payload: TripPayload) => {
  const res = await axiosClient.patch(TRIPS_BASE, payload);
  return res.data;
};

// PATCH api/v1/trips/:id/trip/compelete
export const completeTripService = async (
  id: string,
  payload?: Record<string, any>
) => {
  const res = await axiosClient.patch(
    `${TRIPS_BASE}/${id}/trip/compelete`,
    payload ?? {}
  );
  return res.data;
};

// GET api/v1/trips/:id
export const getTripByIdService = async (id: string): Promise<Trip> => {
  const res = await axiosClient.get(`${TRIPS_BASE}/${id}`);
  return res.data?.data?.trip ?? res.data?.trip ?? res.data;
};

export default {
  createTripService,
  getTripsService,
  patchTripsService,
  completeTripService,
  getTripByIdService,
};