// components/ExpenseModal.tsx
'use client';
import { useState } from 'react';

const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Other',
];

interface Props {
  onClose: () => void;
  onSave: (data: { amount: number; category: string; note: string; date: string }) => void;
}

export default function ExpenseModal({ onClose, onSave }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    onSave({ amount: Number(amount), category, note, date });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">New expense</h2>
          <p className="text-[15px] text-[#4f86f7] font-medium">
            Track a single purchase. Stays on this device.
          </p>
        </div>

        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); }}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-5 py-3.5 text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c] transition-all"
            />
            {error && <p className="text-[12px] text-red-500 mt-2 font-medium">{error}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-5 py-3.5 text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c] appearance-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-5 py-3.5 text-[16px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-[14px] font-bold text-gray-900 mb-2">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="Lunch with team"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-100 bg-gray-50/50 rounded-xl px-5 py-3.5 text-[16px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
            />
          </div>
        </div>

        {/* Save */}
        <div className="mt-10">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#1a6b3c] hover:bg-[#155c32] text-white px-6 py-4 rounded-2xl font-bold text-[16px] transition-all shadow-lg shadow-[#1a6b3c]/20 cursor-pointer"
          >
            Save expense
          </button>
        </div>
      </div>
    </div>
  );
}
