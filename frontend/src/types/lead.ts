export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Won"
  | "Lost";

export const LEAD_STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

export interface Discussion {
  id: number;
  lead_id: number;
  note: string;
  follow_up_at: string | null;
  created_at: string;
}

export interface Lead {
  id: number;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  follow_up_at: string | null;
  created_at: string;
  discussions: Discussion[];
  last_note: string | null;
  last_discussion_at: string | null;
}