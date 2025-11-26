import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';
import { useStatistics } from '../hooks/useStatistics';
import { useTranslation } from 'react-i18next';

const AccountingTree: React.FC = () => {
  const { data, loading } = useStatistics(true);
  const { t } = useTranslation();

  // fallback default values in case loading or no data returned
  const stats = data ?? {
    revenue: 22586,
    expenses: 11220,
    profit: 2366,
    bank: 788,
    receivable: 40255,
    payable: 21255,
    monthly: [],
    grossProfit: 420,
    netProfit: 180,
  };

  // Formatting monthly chart data
  const monthlyData = useMemo(() => {
    if (!stats.monthly || !Array.isArray(stats.monthly)) return [];
    return stats.monthly.map((m: any) => ({
      month: m.month,
      gross: m.gross ?? 0,
      net: m.net ?? 0,
    }));
  }, [stats]);

  const profitData = [
    { name: t('Net profit'), value: stats.netProfit ?? 0 },
    { name: t('Gross profit'), value: stats.grossProfit ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{t('Dashboard')}</span>
          <span>›</span>
          <span>{t('Production')}</span>
          <span>›</span>
          <span>{t('Statistics')}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('Accounting')}</h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Revenue')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.revenue} SR`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Expanses')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.expenses} SR`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Profit')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.profit} SR`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Bank')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.bank} SR`}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Accounts Receivable')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.receivable} SR`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">{t('Accounts Payable')}</div>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? t('Loading...') : `${stats.payable} SR`}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-3">{t('Net & Gross Profit')}</div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={profitData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="value" fill="#4F6F8F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
          </div>
        </div>
      </div>

      {/* Monthly Profit Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{t('Monthly Profit')}</h2>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              formatter={(value: number | string) =>
                typeof value === 'number' ? value.toLocaleString() : value
              }
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="gross"
              stackId="1"
              stroke="#C4A580"
              fill="#C4A580"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="net"
              stackId="1"
              stroke="#5A6B7E"
              fill="#5A6B7E"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AccountingTree;