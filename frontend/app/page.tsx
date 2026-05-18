'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/StatCard';
import ExpenseModal from '@/components/ExpenseModal';
import ExpenseList from '@/components/ExpenseList';
import Insights from '@/components/Insights';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface Expense {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  date: string;
}

export interface Stats {
  this_month: number;
  all_time: number;
  entries: number;
  by_category: { category: string; total: number }[];
  last_7_days: { day: string; total: number }[];
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'insights'>('recent');
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const limit = 10;

  async function fetchData() {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    try {
      const [expRes, statsRes] = await Promise.all([
        fetch(`${API}/expenses?${queryParams}`),
        fetch(`${API}/expenses/stats`),
      ]);
      const expData = await expRes.json();
      setExpenses(expData.data || []);
      setTotal(expData.total || 0);
      setStats(await statsRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page, category, startDate, endDate]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await fetch(`${API}/expenses/${id}`, { method: 'DELETE' });
    fetchData();
  }

  async function handleAdd(data: {
    amount: number;
    category: string;
    note: string;
    date: string;
  }) {
    await fetch(`${API}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    fetchData();
  }

  const exportToCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }
    
    // Create CSV rows
    const headers = ['ID', 'Amount (FRW)', 'Category', 'Note', 'Date'];
    const rows = expenses.map(e => [
      e.id,
      e.amount,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.note || '').replace(/"/g, '""')}"`,
      new Date(e.date).toISOString().split('T')[0]
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    // Create download link using Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pocket_expenses_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1a6b3c] rounded-full flex items-center justify-center shadow-lg shadow-[#1a6b3c]/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              <path d="M16 12h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Pocket</h1>
            <p className="text-[13px] font-medium text-gray-400">Simple expense tracker</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-[1rem] text-[14px] font-bold flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1a6b3c] hover:bg-[#155c32] text-white px-6 py-3 rounded-[1rem] text-[14px] font-bold flex items-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <span className="text-xl leading-none">+</span> Add expense
          </button>
        </div>
      </header>

      <div className="max-w-[800px] mx-auto px-6 py-10 space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5">
          <StatCard label="This month" value={`${(stats?.this_month ?? 0).toLocaleString()} FRW`} />
          <StatCard label="All time" value={`${(stats?.all_time ?? 0).toLocaleString()} FRW`} />
          <StatCard label="Entries" value={String(stats?.entries ?? 0)} />
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#e9e7e1] rounded-[1.2rem] p-1 flex items-center">
          <button
            onClick={() => setActiveTab('recent')}
            className={`flex-1 py-3 rounded-[1rem] text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'recent'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/>
            </svg>
            Recent
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-3 rounded-[1rem] text-[14px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            Insights
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'recent' ? (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white/50 p-4 rounded-[1.5rem] flex gap-4 items-center border border-white/40 backdrop-blur-sm overflow-x-auto no-scrollbar">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[14px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Health">Health</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Utilities">Utilities</option>
                <option value="Other">Other</option>
              </select>
              
              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                <span className="text-[12px] font-bold text-gray-400 uppercase">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="text-[14px] font-medium text-gray-700 focus:outline-none cursor-pointer"
                />
              </div>

              <span className="text-gray-400 font-bold">→</span>

              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                <span className="text-[12px] font-bold text-gray-400 uppercase">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="text-[14px] font-medium text-gray-700 focus:outline-none cursor-pointer"
                />
              </div>
            </div>
            
            <ExpenseList expenses={expenses} onDelete={handleDelete} />
            
            {total > limit && (
              <div className="flex justify-between items-center bg-white/50 p-5 rounded-[1.5rem] border border-white/40">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-[14px] font-bold text-gray-400">
                  Page {page} of {Math.ceil(total / limit) || 1}
                </span>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-[14px] font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <Insights byCategory={stats?.by_category ?? []} last7Days={stats?.last_7_days ?? []} />
        )}

        <p className="text-center text-[13px] font-bold text-gray-400/60 pt-4">Data stored professionally in PostgreSQL.</p>
      </div>

      {/* Modal */}
      {showModal && (
        <ExpenseModal onClose={() => setShowModal(false)} onSave={handleAdd} />
      )}
    </main>
  );
}
