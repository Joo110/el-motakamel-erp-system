// src/services/statistics.ts
import axiosClient from '@/lib/axiosClient';

export type StatisticsResponse = {
  sales?: number;
  purchases?: number;
  cars?: number;
  users?: number;
  [k: string]: any;
};

const BASE = '/statistics';

export async function getStatistics(): Promise<StatisticsResponse> {
  const { data } = await axiosClient.get(BASE);
  return data?.data ?? data; 
}