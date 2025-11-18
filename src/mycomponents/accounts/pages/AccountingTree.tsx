import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, BarChart, Bar } from 'recharts';

const AccountingTree: React.FC = () => {
  // بيانات الرسم البياني الشهري
  const monthlyData = [
    { month: 1, gross: 100000, net: 90000 },
    { month: 2, gross: 65000, net: 10000 },
    { month: 3, gross: 50000, net: 15000 },
    { month: 4, gross: 45000, net: 40000 },
    { month: 5, gross: 15000, net: 5000 },
    { month: 6, gross: 40000, net: 20000 },
    { month: 7, gross: 45000, net: 5000 },
    { month: 8, gross: 45000, net: 35000 },
    { month: 9, gross: 80000, net: 5000 },
    { month: 10, gross: 5000, net: 0 },
    { month: 11, gross: 95000, net: 75000 },
    { month: 12, gross: 75000, net: 70000 }
  ];

  // بيانات Net & Gross Profit
  const profitData = [
    { name: 'Net profit', value: 180 },
    { name: 'Gross profit', value: 420 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="ltr">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>Dashboard</span>
          <span>›</span>
          <span>Production</span>
          <span>›</span>
          <span>Bestboost</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
      </div>

      {/* الصف الأول - البطاقات الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Revenue</div>
          <div className="text-2xl font-bold text-gray-900">22586 SR</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Expanses</div>
          <div className="text-2xl font-bold text-gray-900">11220 SR</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Profit</div>
          <div className="text-2xl font-bold text-gray-900">2366 SR</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Bank</div>
          <div className="text-2xl font-bold text-gray-900">788 SR</div>
        </div>
      </div>

      {/* الصف الثاني */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Accounts Receivable</div>
          <div className="text-2xl font-bold text-gray-900">40255 SR</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-2">Accounts Payable</div>
          <div className="text-2xl font-bold text-gray-900">21255 SR</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-3">Net & Gross Profit</div>
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

      {/* الرسم البياني الكبير */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Profit</h2>
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
              formatter={(value: number | string) => typeof value === 'number' ? value.toLocaleString() : value}
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