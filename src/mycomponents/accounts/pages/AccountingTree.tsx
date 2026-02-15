import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useStatistics } from '../hooks/useStatistics';
import { useTranslation } from 'react-i18next';

/** Helpers **/
const sanitizeNumber = (v: any): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  // avoid insane scientific values from backend
  if (Math.abs(n) > 1e15) return 0;
  return n;
};

// compact formatter: 1.2K / 2.3M
const formatCompact = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '0';
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  // use Intl when available
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 2 }).format(n);
  } catch {
    // fallback custom
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${(n / 1_000).toFixed(2)}K`;
    return n.toLocaleString();
  }
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '0.00';
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border shadow-sm rounded-md p-3" style={{ minWidth: 160 }}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, background: p.color, borderRadius: 3 }} />
            <span className="text-sm text-gray-700">{p.name}</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">{formatCurrency(p.value)} SR</div>
        </div>
      ))}
    </div>
  );
};

/** Component **/
const AccountingTree: React.FC = () => {
  const { data, loading } = useStatistics(true);
  const { t } = useTranslation();

  // support both shapes: { status, data: {...} } or direct data {...}
  const raw = (data && (data.data ?? data)) ?? {};

  // pick values with many fallbacks to be resilient to backend naming
  const stats = {
    totalRevenue: sanitizeNumber(raw.totalRevenue ?? raw.revenue ?? 0),
    totalExpenses: sanitizeNumber(raw.totalExpenses ?? raw.expenses ?? 0),
    // profit might be provided as profit, totalProfit, netProfit etc.
    profit: sanitizeNumber(raw.profit ?? raw.totalProfit ?? raw.netProfit ?? 0),
    totalBank: sanitizeNumber(raw.totalBank ?? raw.bank ?? 0),
    // receivable keys
    accountReceivable: sanitizeNumber(raw.accountReceivable ?? raw.totalReceivable ?? raw.receivable ?? 0),
    totalReceivable: sanitizeNumber(raw.totalReceivable ?? raw.accountReceivable ?? 0),
    totalPayable: sanitizeNumber(raw.totalPayable ?? raw.payable ?? 0),
    // gross profit: accept either spelling
    totalGrossProfit: sanitizeNumber(raw.totalGrossProfit ?? raw.totalGrosProfit ?? raw.grossProfit ?? 0),
    totalGrosProfit: sanitizeNumber(raw.totalGrosProfit ?? raw.totalGrossProfit ?? 0),
    netProfit: sanitizeNumber(raw.netProfit ?? raw.net ?? 0),
    monthly: Array.isArray(raw.monthly) ? raw.monthly : Array.isArray(raw.months) ? raw.months : [],
  };

  // monthlyData: either map real months or provide a single fallback point
  const monthlyData = useMemo(() => {
    if (Array.isArray(stats.monthly) && stats.monthly.length > 0) {
      return stats.monthly.map((m: any, idx: number) => ({
        month: m.month ?? m.label ?? m.name ?? `#${idx + 1}`,
        gross: sanitizeNumber(m.gross ?? m.totalGrossProfit ?? m.totalGrosProfit ?? m.grossProfit ?? 0),
        net: sanitizeNumber(m.net ?? m.netProfit ?? m.net_profit ?? 0),
      }));
    }
    // fallback single datum (so chart renders nicely)
    return [
      {
        month: t('Current') ?? 'Current',
        gross: stats.totalGrossProfit,
        net: stats.netProfit,
      },
    ];
  }, [stats.monthly, stats.totalGrossProfit, stats.netProfit, t]);

  const profitData = [
    { name: t('Net profit'), value: stats.netProfit },
    { name: t('Gross profit'), value: stats.totalGrossProfit },
  ];

  const MyLegend = () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-[#5A6B7E]" />
        <span className="text-sm text-gray-700">{t('Net profit')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-[#C4A580]" />
        <span className="text-sm text-gray-700">{t('Gross profit')}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('Dashboard')}</span>
          <span>›</span>
          <span>{t('Production')}</span>
          <span>›</span>
          <span>{t('Statistics')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{t('Accounting')}</h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Revenue')}</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.totalRevenue)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1"> {formatCurrency(stats.totalRevenue)} SR</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Expenses')}</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.totalExpenses)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1"> {formatCurrency(stats.totalExpenses)} SR</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Profit')}</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.profit)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1"> {formatCurrency(stats.profit)} SR</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Bank')}</div>
          <div className="text-2xl font-bold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.totalBank)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1"> {formatCurrency(stats.totalBank)} SR</div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Accounts Receivable')}</div>
          <div className="text-xl font-semibold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.accountReceivable)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1">{formatCurrency(stats.accountReceivable)} SR</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-xs text-gray-500 mb-2">{t('Accounts Payable')}</div>
          <div className="text-xl font-semibold text-gray-900">{loading ? t('Loading...') : `${formatCompact(stats.totalPayable)} SR`}</div>
          <div className="text-xs text-gray-400 mt-1">{formatCurrency(stats.totalPayable)} SR</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-500">{t('Net & Gross Profit')}</div>
            <Legend content={<MyLegend />} />
          </div>
          <ResponsiveContainer width="100%" height={84}>
            <BarChart data={profitData} layout="vertical" margin={{ left: 0 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={120} />
              <Bar dataKey="value" fill="#4F6F8F" radius={[6, 6, 6, 6]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-400 mt-2">{t('Net')}: {formatCurrency(stats.netProfit)} SR — {t('Gross')}: {formatCurrency(stats.totalGrossProfit)} SR</div>
        </div>
      </div>

      {/* Monthly Profit Chart (professional) */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('Monthly Profit')}</h2>
            <p className="text-sm text-gray-500">{t('Gross & Net profit overview')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#C4A580]"/><span className="text-sm text-gray-700">{t('Gross profit')}</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#5A6B7E]"/><span className="text-sm text-gray-700">{t('Net profit')}</span></div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={420}>
          <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4A580" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#C4A580" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5A6B7E" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#5A6B7E" stopOpacity={0.08}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(v) => formatCompact(Number(v))} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip content={<CustomTooltip t={t} />} />
            <Area type="monotone" dataKey="gross" name={t('Gross profit')} stroke="#C4A580" strokeWidth={2.5} fill="url(#gGross)" fillOpacity={1} dot={{ r: 3 }} activeDot={{ r: 6 }} animationDuration={900} />
            <Area type="monotone" dataKey="net" name={t('Net profit')} stroke="#5A6B7E" strokeWidth={2.5} fill="url(#gNet)" fillOpacity={1} dot={{ r: 3 }} activeDot={{ r: 6 }} animationDuration={900} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccountingTree;
