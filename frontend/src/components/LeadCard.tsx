import { formatTimeAgo, isOverdue } from "@/lib/api";
import { Lead } from "@/types/lead";
import StatusBadge from "./StatusBadge";

interface LeadCardProps {
  lead: Lead;
  isPinned?: boolean;
  onClick: (lead: Lead) => void;
}

function formatFollowUpLabel(dateString: string, overdue: boolean): string {
  const date = new Date(dateString);
  const now = new Date();
  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (isSameDay) {
    return overdue
      ? `Overdue today at ${timeStr}`
      : `Follow-up today at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return overdue
    ? `Overdue: ${dateStr} at ${timeStr}`
    : `Follow-up: ${dateStr} at ${timeStr}`;
}

export default function LeadCard({
  lead,
  isPinned = false,
  onClick,
}: LeadCardProps) {
  const overdue = isOverdue(lead.follow_up_at);

  const cardClasses = isPinned
    ? overdue
      ? "bg-red-50/70 border-red-200 hover:border-red-300"
      : "bg-blue-50/60 border-blue-200 hover:border-blue-300"
    : "bg-white border-slate-200 hover:border-slate-300";

  return (
    <div
      onClick={() => onClick(lead)}
      className={`w-full rounded-xl border p-5 transition-all cursor-pointer shadow-xs hover:shadow-md ${cardClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {lead.name}
            </h3>
            {lead.company && (
              <span className="text-sm text-slate-500 font-normal">
                ({lead.company})
              </span>
            )}
          </div>

          <p className="text-sm text-slate-700 truncate">
            <span className="font-semibold text-slate-900">Last Note: </span>
            <span>{lead.last_note || "No discussions logged yet."}</span>
            {lead.last_discussion_at && (
              <span className="ml-2 text-xs text-slate-400">
                {formatTimeAgo(lead.last_discussion_at)}
              </span>
            )}
          </p>

          {lead.follow_up_at && (
            <div className="pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                  overdue
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : "bg-blue-100/80 text-blue-700"
                }`}
              >
                <span>{overdue ? "⚠️" : "🔔"}</span>
                <span>{formatFollowUpLabel(lead.follow_up_at, overdue)}</span>
              </span>
            </div>
          )}
        </div>

        <StatusBadge status={lead.status} />
      </div>
    </div>
  );
}