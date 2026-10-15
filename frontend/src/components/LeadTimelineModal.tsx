"use client";

import { FormEvent, useState } from "react";
import { addDiscussion, formatTimeAgo, updateLeadStatus } from "@/lib/api";
import { LEAD_STATUSES, Lead, LeadStatus } from "@/types/lead";

interface LeadTimelineModalProps {
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (updatedLead: Lead) => void;
}

function formatDateTime(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LeadTimelineModal({
  lead,
  onClose,
  onLeadUpdated,
}: LeadTimelineModalProps) {
  const [note, setNote] = useState("");
  const [hasFollowUp, setHasFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("14:00");
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!lead) return null;

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead || newStatus === lead.status) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const updated = await updateLeadStatus(lead.id, newStatus);
      onLeadUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!lead) return;
    if (!note.trim()) {
      setError("Please enter a discussion note.");
      return;
    }

    let followUpIso: string | null = null;
    if (hasFollowUp) {
      if (!followUpDate) {
        setError("Please select a follow-up date.");
        return;
      }
      const timePart = followUpTime || "09:00";
      const combined = new Date(`${followUpDate}T${timePart}`);
      if (isNaN(combined.getTime())) {
        setError("Invalid follow-up date or time.");
        return;
      }
      followUpIso = combined.toISOString();
    }

    setSubmitting(true);
    setError(null);
    try {
      const updated = await addDiscussion(lead.id, {
        note: note.trim(),
        follow_up_at: followUpIso,
      });
      setNote("");
      setHasFollowUp(false);
      setFollowUpDate("");
      onLeadUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{lead.name}</h2>
              {lead.company && (
                <span className="text-base text-slate-500 font-normal">
                  ({lead.company})
                </span>
              )}
            </div>
            {lead.phone && (
              <p className="mt-1 text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <span>📞</span>
                <span>{lead.phone}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Lead status"
              value={lead.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none cursor-pointer"
            >
              {LEAD_STATUSES.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1 cursor-pointer"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {lead.discussions.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No discussions logged yet.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
              {lead.discussions.map((item, idx) => {
                const isLatest = idx === 0;
                const isSystemNote =
                  item.note === "Lead created via web form.";

                return (
                  <div key={item.id} className="relative">
                    <span
                      className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        isLatest ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    />
                    <div className="text-xs text-slate-500 mb-1.5">
                      <span className="font-medium text-slate-600">
                        {formatDateTime(item.created_at)}
                      </span>{" "}
                      <span className="text-slate-400">
                        ({formatTimeAgo(item.created_at)})
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                      <p
                        className={`text-sm ${
                          isSystemNote
                            ? "italic text-slate-600"
                            : "text-slate-800"
                        }`}
                      >
                        {item.note}
                      </p>

                      {item.follow_up_at && (
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <span>🗓️</span>
                            <span>
                              Follow-up set for:{" "}
                              {formatDateTime(item.follow_up_at)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Form */}
        <form
          onSubmit={handleAddNote}
          className="border-t border-slate-100 p-6 bg-slate-50/40 rounded-b-2xl space-y-4"
        >
          <textarea
            rows={3}
            placeholder="Log a new discussion..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none resize-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasFollowUp}
                  onChange={(e) => setHasFollowUp(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Set Follow-up</span>
              </label>

              <input
                type="date"
                disabled={!hasFollowUp}
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-600 focus:outline-none"
              />

              <input
                type="time"
                disabled={!hasFollowUp}
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}