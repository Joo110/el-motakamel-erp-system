import axiosClient from '@/lib/axiosClient';

export type StatisticsResponse = {
  // canonical keys we want to expose to UI
  totalRevenue?: number;
  totalExpenses?: number;
  totalProfit?: number;
  profit?: number;
  totalBank?: number;
  accountReceivable?: number;
  totalReceivable?: number;
  totalPayable?: number;
  totalGrossProfit?: number;
  totalGrosProfit?: number; // keep old typo alias just in case
  netProfit?: number;
  monthly?: any[];
  // allow any other fields
  [k: string]: any;
};

const BASE = '/stats';

export async function getStatistics(): Promise<StatisticsResponse> {
  const { data } = await axiosClient.get(BASE);
  // backend may return { message, data: {...} } or direct object
  const raw = data?.data ?? data ?? {};

  // normalize / map backend keys to the keys the UI expects
  const totalReceivable = raw.totalReceivable ?? raw.accountReceivable ?? raw.receivable ?? raw.receivables;
  const totalPayable = raw.totalPayable ?? raw.payable ?? raw.totalPayables;
  const totalGrossProfit = raw.totalGrossProfit ?? raw.totalGrosProfit ?? raw.grossProfit ?? raw.total_gross_profit;
  const totalProfit = raw.totalProfit ?? raw.profit ?? raw.netProfit ?? raw.total_profit;
  const monthly = Array.isArray(raw.monthly) ? raw.monthly : Array.isArray(raw.months) ? raw.months : raw.monthlyData ?? [];

  const normalized: StatisticsResponse = {
    // keep original if present
    ...raw,
    // add canonical keys (so component can rely on them)
    totalRevenue: raw.totalRevenue ?? raw.revenue ?? 0,
    totalExpenses: raw.totalExpenses ?? raw.expenses ?? 0,
    totalProfit: raw.totalProfit ?? totalProfit,
    profit: raw.profit ?? totalProfit,
    totalBank: raw.totalBank ?? raw.bank ?? 0,
    accountReceivable: raw.accountReceivable ?? totalReceivable ?? 0,
    totalReceivable: totalReceivable ?? 0,
    totalPayable: totalPayable ?? 0,
    totalGrossProfit: totalGrossProfit ?? 0,
    // keep the typo alias too (some code may still expect it)
    totalGrosProfit: (raw.totalGrosProfit ?? totalGrossProfit) as any,
    netProfit: raw.netProfit ?? raw.net_profit ?? (raw.net ?? 0),
    monthly,
  };

  return normalized;
}
