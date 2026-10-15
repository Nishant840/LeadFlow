import { LeadStatus } from "@/types/lead";

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-emerald-100 text-emerald-800",
  Contacted: "bg-amber-100 text-amber-800",
  Qualified: "bg-blue-100 text-blue-800",
  "Proposal Sent": "bg-purple-100 text-purple-700",
  Won: "bg-slate-100 text-slate-600",
  Lost: "bg-rose-100 text-rose-700",
};

interface StatusBadgeProps {
  status: LeadStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}