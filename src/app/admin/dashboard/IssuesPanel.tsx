// components/IssuesPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Quote, CalendarDays, Trash2, CheckCircle2, Eye } from "lucide-react";

type Issue = {
  _id: string;
  user: string;
  studentId?: string;
  school: string;
  type: string;
  message: string;
  topic?: string;
  status: "pending" | "resolved";
  createdAt: string;
};

export default function IssuesPanel() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const r = await fetch("/api/issues", { cache: "no-store" });
      const j = await r.json();
      setIssues(j?.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const pending = useMemo(() => issues.filter(i => i.status === "pending"), [issues]);
  const resolved = useMemo(() => issues.filter(i => i.status === "resolved"), [issues]);
  const visible = tab === "pending" ? pending : resolved;

  const markResolved = async (id: string) => {
    const r = await fetch(`/api/issues/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "resolved" }) });
    if (r.ok) setIssues(prev => prev.map(i => (i._id === id ? { ...i, status: "resolved" } : i)));
  };

  const removeIssue = async (id: string) => {
    if (!confirm("Delete this issue?")) return;
    const r = await fetch(`/api/issues/${id}`, { method: "DELETE" });
    if (r.ok) setIssues(prev => prev.filter(i => i._id !== id));
  };

  return (
    <div className="w-full md:w-[420px]">
      <h3 className="text-[22px] font-semibold text-[#111] mb-3">Issues & Feedback</h3>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setTab("pending")}
          className={`px-5 py-2 rounded-[14px] text-sm font-medium ${tab === "pending" ? "bg-black text-white" : "bg-white border"}`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={`px-5 py-2 rounded-[14px] text-sm font-medium ${tab === "resolved" ? "bg-black text-white" : "bg-white border"}`}
        >
          Resolved ({resolved.length})
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">{tab === "pending" ? "No pending issues" : "No resolved issues"}</p>
      ) : (
        <div className="space-y-4">
          {visible.map(issue => (
            <IssueCard
              key={issue._id}
              issue={issue}
              onResolve={() => markResolved(issue._id)}
              onDelete={() => removeIssue(issue._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({
  issue,
  onResolve,
  onDelete,
}: {
  issue: Issue;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const date = new Date(issue.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="rounded-2xl border border-[#D9D9D9] bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-[#111]">{issue.user}</p>
          <p className="text-[12px] text-[#616161]">{issue.school}</p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="p-1 rounded-full border">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Body */}
      {open && (
        <>
          <div className="mt-3 space-y-2">
            <p className="text-[13px] flex items-center gap-2">
              <span className="font-semibold">Issue Type:</span>
              <span className="text-[#111]">{issue.type}</span>
            </p>

            {issue.message && (
              <div className="text-[13px] text-[#111] bg-[#F7F8FA] border rounded-xl p-3 flex gap-2">
                <Quote size={16} className="mt-0.5" />
                <p className="leading-snug">{issue.message}</p>
              </div>
            )}

            {issue.topic && (
              <p className="text-[13px]">
                <span className="font-semibold">Topic:</span>{" "}
                <span className="text-[#111]">{issue.topic}</span>
              </p>
            )}

            <p className="text-[12px] text-[#616161] flex items-center gap-2">
              <CalendarDays size={16} /> {date}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2">
            <button className="px-4 py-1.5 rounded-full border text-[12px] flex items-center gap-2">
              <Eye size={14} /> View
            </button>

            {issue.status === "pending" ? (
              <button
                onClick={onResolve}
                className="px-4 py-1.5 rounded-full border text-[12px] text-green-700 border-green-700 flex items-center gap-2 hover:bg-green-700 hover:text-white transition"
              >
                <CheckCircle2 size={14} /> Mark as Resolved
              </button>
            ) : null}

            <button
              onClick={onDelete}
              className="px-4 py-1.5 rounded-full border text-[12px] text-red-600 border-red-600 flex items-center gap-2 hover:bg-red-600 hover:text-white transition ml-auto"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}