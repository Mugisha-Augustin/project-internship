// components/ExpenseList.tsx
import { Expense } from '@/app/page';

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-[#fdf6e6] text-[#8b5e3c]',
  Transport: 'bg-[#eef2ff] text-[#4f46e5]',
  Shopping: 'bg-[#fdf2f8] text-[#db2777]',
  Health: 'bg-[#fef2f2] text-[#dc2626]',
  Entertainment: 'bg-[#f5f3ff] text-[#7c3aed]',
  Utilities: 'bg-[#f8fafc] text-[#475569]',
  Other: 'bg-[#f0fdf4] text-[#166534]',
};

export default function ExpenseList({
  expenses,
  onDelete,
}: {
  expenses: Expense[];
  onDelete: (id: number) => void;
}) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-[2rem] border border-gray-100/50 shadow-sm text-gray-400 text-sm font-semibold">
        No expenses found matching the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="bg-white rounded-[1.5rem] px-7 py-6 flex items-center justify-between shadow-sm border border-gray-100/50"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className={`text-[12px] font-bold px-3 py-1 rounded-full ${
                  CATEGORY_COLORS[expense.category] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {expense.category}
              </span>
              <span className="text-[16px] font-bold text-gray-900">
                {expense.note || 'No note'}
              </span>
            </div>
            <p className="text-[14px] text-gray-400 font-bold">
              {new Date(expense.date).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[18px] font-bold text-gray-900">
              {Number(expense.amount).toLocaleString()} FRW
            </span>
            <button
              onClick={() => onDelete(expense.id)}
              className="text-gray-900 hover:text-red-600 transition-colors cursor-pointer"
              title="Delete"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
