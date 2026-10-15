"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddLeadModal from "@/components/AddLeadModal";
import LeadCard from "@/components/LeadCard";
import LeadTimelineModal from "@/components/LeadTimelineModal";
import { fetchLeads, isTodayOrOverdue } from "@/lib/api";
import { LEAD_STATUSES, Lead, LeadStatus } from "@/types/lead";

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "All">(
    "All"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeads(selectedStatus, searchQuery);
      setLeads(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the LeadFlow API."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadLeads]);

  const { pinnedLeads, otherLeads } = useMemo(() => {
    const pinned: Lead[] = [];
    const regular: Lead[] = [];

    for (const lead of leads) {
      if (isTodayOrOverdue(lead.follow_up_at)) {
        pinned.push(lead);
      } else {
        regular.push(lead);
      }
    }

    pinned.sort((a, b) => {
      const timeA = a.follow_up_at ? new Date(a.follow_up_at).getTime() : 0;
      const timeB = b.follow_up_at ? new Date(b.follow_up_at).getTime() : 0;
      return timeA - timeB;
    });

    return { pinnedLeads: pinned, otherLeads: regular };
  }, [leads]);

  function handleLeadCreated(newLead: Lead) {
    if (selectedStatus === "All" || selectedStatus === newLead.status) {
      setLeads((prev) => [newLead, ...prev]);
    }
  }

  function handleLeadUpdated(updatedLead: Lead) {
    setActiveLead(updatedLead);
    setLeads((prev) => {
      if (selectedStatus !== "All" && updatedLead.status !== selectedStatus) {
        return prev.filter((l) => l.id !== updatedLead.id);
      }
      return prev.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xl">↗</span>
            <h1 className="text-xl font-extrabold tracking-tight text-blue-600">
              LeadFlow
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
          >
            + Add New Lead
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
              Filters:
            </span>
            {(["All", ...LEAD_STATUSES] as const).map((status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <input
              type="text"
              placeholder="Search leads by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Today's Follow-ups Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>📌</span>
            <span>Today&apos;s Follow-ups</span>
          </h2>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
              Loading follow-ups...
            </div>
          ) : pinnedLeads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-5 text-xs text-slate-400">
              No follow-ups scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {pinnedLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isPinned={true}
                  onClick={(l) => setActiveLead(l)}
                />
              ))}
            </div>
          )}
        </section>

        {/* All Leads Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            All Leads
          </h2>

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-400">
              Loading leads...
            </div>
          ) : otherLeads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-400">
              No leads found matching the current filters.
            </div>
          ) : (
            <div className="space-y-3">
              {otherLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isPinned={false}
                  onClick={(l) => setActiveLead(l)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onLeadCreated={handleLeadCreated}
      />

      <LeadTimelineModal
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onLeadUpdated={handleLeadUpdated}
      />
    </div>
  );
}