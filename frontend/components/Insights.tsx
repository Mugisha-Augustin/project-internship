// components/Insights.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Premium coordinated HSL color palette
const COLORS = [
  '#1a6b3c', // primary dark green
  '#2a8f55', // medium green
  '#4ab27a', // light emerald
  '#84d9aa', // sage
  '#b9ecd0', // light mint
  '#f0b85d', // warm yellow accent
  '#e76f51', // terracotta accent
];

export default function Insights({
  byCategory,
  last7Days,
}: {
  byCategory: { category: string; total: number }[];
  last7Days: { day: string; total: number }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (byCategory.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-gray-400 text-sm font-semibold">
        No expense data yet. Add some expenses to see visual insights!
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-gray-400 text-sm font-semibold">
        Loading charts...
      </div>
    );
  }

  // Format date labels for last 7 days bar chart to be more readable
  const formattedTrendData = (last7Days || []).map((item) => {
    const dateObj = new Date(item.day);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    return {
      ...item,
      formattedDay: dayName,
    };
  });

  return (
    <div className="space-y-8">
      {/* Category Breakdown (Donut) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
        <h3 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#1a6b3c] rounded-full" />
          Category Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-[260px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: 'none' }}>
                <Pie
                  isAnimationActive={false}
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="total"
                  nameKey="category"
                  style={{ outline: 'none' }}
                >
                  {byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} FRW`, 'Total Spent']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3.5">
            {byCategory.map((item, index) => {
              const totalSum = byCategory.reduce((acc, curr) => acc + curr.total, 0);
              const percentage = ((item.total / totalSum) * 100).toFixed(0);

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-[#fbfbfa] rounded-xl border border-gray-50">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <span className="text-[14px] font-bold text-gray-800">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[14px] font-bold text-gray-900 block">{item.total.toLocaleString()} FRW</span>
                    <span className="text-[11px] font-medium text-gray-400">{percentage}% of total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spending Trends (Bar) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50">
        <h3 className="text-[18px] font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#f0b85d] rounded-full" />
          Spending Trend (Last 7 Days)
        </h3>

        {formattedTrendData.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm font-semibold">
            No trend data available for the last 7 days.
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a6b3c" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1a6b3c" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="formattedDay" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `${val.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} FRW`, 'Spent']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '1rem',
                    border: '1px solid #f3f4f6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Bar 
                  isAnimationActive={false}
                  dataKey="total" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={36}
                  style={{ outline: 'none' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
