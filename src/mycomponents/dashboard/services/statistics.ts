// src/mycomponents/statistics/services/statistics.ts
import axiosClient from "@/lib/axiosClient";

export interface RecentActivity {
  title: string;
  time: string;
}

export interface StatisticsData {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalBank: number;
  totalReceivable: number;
  totalPayable: number;
  totalGrossProfit: number;
  netProfit: number;
  totalUsers: number;
  totalProducts: number;
  monthlySales: number;
  revenuePercentage: string;
  userPercentage: string;
  productPercentage: string;
  monthlySalesPercentage: string;
  conversionRate: string;
  avgOrderValue: string;
  activeSessions: number;
  recentActivities: RecentActivity[];
}

export interface StatisticsResponse {
  message: string;
  data: StatisticsData;
}

export const getStatisticsService = async (): Promise<StatisticsResponse> => {
  const response = await axiosClient.get("/stats");
  return response.data ?? response;
};