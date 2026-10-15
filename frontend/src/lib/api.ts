import { Lead, LeadStatus } from "@/types/lead";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchLeads(
  status?: LeadStatus | "All",
  search?: string
): Promise<Lead[]> {
  const params = new URLSearchParams();
  if (status && status !== "All") {
    params.set("status", status);
  }
  if (search && search.trim()) {
    params.set("search", search.trim());
  }

  const queryString = params.toString();
  const url = `${API_BASE}/leads${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch leads (${res.status})`);
  }
  return res.json();
}

export async function createLead(data: {
  name: string;
  company?: string;
  phone?: string;
}): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create lead (${res.status})`);
  }
  return res.json();
}

export async function updateLeadStatus(
  leadId: number,
  status: LeadStatus
): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update status (${res.status})`);
  }
  return res.json();
}

export async function addDiscussion(
  leadId: number,
  data: { note: string; follow_up_at?: string | null }
): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${leadId}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to add discussion (${res.status})`);
  }
  return res.json();
}

export function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
}

export function isTodayOrOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );
  return target.getTime() <= endOfToday.getTime();
}

export function isOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  return new Date(dateString).getTime() < Date.now();
}