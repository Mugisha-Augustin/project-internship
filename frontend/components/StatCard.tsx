// components/StatCard.tsx
export default function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-[2rem] p-9 shadow-sm border border-gray-100/30 flex flex-col justify-center min-h-[160px]">
      <p className="text-[14px] font-bold text-gray-400 mb-4 tracking-tight">{label}</p>
      <p className="text-[38px] font-bold text-gray-900 leading-none">{value}</p>
    </div>
  );
}
