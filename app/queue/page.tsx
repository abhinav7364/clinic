"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Clock, Users, AlertTriangle, RotateCcw, CalendarCheck,
  Timer, Play, Stethoscope, ChevronRight, X, Search,
  Filter, ArrowRight, User, Droplets, AlertCircle,
  FlaskConical, Pill, CheckCircle2, XCircle, UserCheck,
  PhoneIncoming, Printer, Activity, BarChart3, ArrowUpRight,
  TrendingDown, CalendarX, UserX, RefreshCw, Eye,
  HeartPulse, ShieldAlert, ClipboardList,
} from "lucide-react";
import { cn, getInitials, formatTime, formatDate } from "@/lib/utils";
import {
  todayQueue,
  patients,
  prescriptions,
  returningPatients,
  activityTimeline,
  dashboardStats,
  type ReturningPatient,
  type ActivityEvent,
} from "@/lib/mock-data";
import type { QueueEntry, Patient, PatientType, QueueStatus } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const WAIT_WARNING_MINS = 30;

function getWaitMins(checkedInAt: string): number {
  return Math.max(0, Math.floor(
    (Date.now() - new Date(checkedInAt).getTime()) / 60000
  ));
}

function formatWait(mins: number): string {
  if (mins < 1)  return "Just arrived";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function isLateAppointment(entry: QueueEntry): boolean {
  if (!entry.appointmentTime) return false;
  const [h, m] = entry.appointmentTime.split(":").map(Number);
  const apptMs = new Date(entry.checkedInAt);
  apptMs.setHours(h, m, 0, 0);
  return new Date(entry.checkedInAt).getTime() > apptMs.getTime() + 10 * 60000;
}

// ─── Category Badge ───────────────────────────────────────────────────────────

interface CategoryConfig { label: string; color: string; bg: string }

function getCategoryConfig(
  type: PatientType,
  late?: boolean
): CategoryConfig {
  if (late) return { label: "Late",        color: "#D97706", bg: "#FEF3C7" };
  const map: Record<PatientType, CategoryConfig> = {
    emergency:   { label: "Emergency",   color: "#DC2626", bg: "#FEE2E2" },
    returning:   { label: "Returning",   color: "#1D4ED8", bg: "#DBEAFE" },
    appointment: { label: "Appointment", color: "#15803D", bg: "#DCFCE7" },
    "walk-in":   { label: "Walk-in",     color: "#6B7280", bg: "#F3F4F6" },
  };
  return map[type];
}

function CategoryBadge({ type, late }: { type: PatientType; late?: boolean }) {
  const c = getCategoryConfig(type, late);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QueueStatus }) {
  const configs: Record<QueueStatus, { label: string; dot: string; text: string; bg: string }> = {
    "waiting":          { label: "Waiting",         dot: "#D97706", text: "#B45309", bg: "#FEF3C7" },
    "in-consultation":  { label: "In Consultation",  dot: "#2563EB", text: "#1D4ED8", bg: "#DBEAFE" },
    "completed":        { label: "Completed",        dot: "#16A34A", text: "#15803D", bg: "#DCFCE7" },
    "cancelled":        { label: "Cancelled",        dot: "#6B7280", text: "#6B7280", bg: "#F3F4F6" },
    "no-show":          { label: "No Show",          dot: "#DC2626", text: "#DC2626", bg: "#FEE2E2" },
  };
  const c = configs[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ color: c.text, background: c.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

// ─── Returning Status Badge ────────────────────────────────────────────────────

function ReturnStatusBadge({ status }: { status: ReturningPatient["status"] }) {
  const c = {
    "returned":        { label: "Ready to Return", color: "#16A34A", bg: "#DCFCE7" },
    "waiting-outside": { label: "At Lab",           color: "#D97706", bg: "#FEF3C7" },
    "delayed":         { label: "Delayed",          color: "#DC2626", bg: "#FEE2E2" },
  }[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: c.color, background: c.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

// ─── Activity Icon ─────────────────────────────────────────────────────────────

function ActivityDot({ type }: { type: ActivityEvent["type"] }) {
  const configs: Record<ActivityEvent["type"], { icon: React.ElementType; color: string; bg: string }> = {
    "consultation-completed": { icon: CheckCircle2,  color: "#16A34A", bg: "#DCFCE7" },
    "consultation-started":   { icon: Stethoscope,   color: "#2563EB", bg: "#DBEAFE" },
    "prescription-printed":   { icon: Printer,       color: "#6B7280", bg: "#F3F4F6" },
    "patient-returned":       { icon: UserCheck,     color: "#0EA5E9", bg: "#E0F2FE" },
    "patient-called":         { icon: PhoneIncoming, color: "#2563EB", bg: "#DBEAFE" },
    "no-show":                { icon: XCircle,       color: "#DC2626", bg: "#FEE2E2" },
    "lab-ready":              { icon: FlaskConical,  color: "#D97706", bg: "#FEF3C7" },
  };
  const { icon: Icon, color, bg } = configs[type];
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: bg }}>
      <Icon size={13} style={{ color }} />
    </div>
  );
}

// ─── Consultation Timer ────────────────────────────────────────────────────────

function ConsultationTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const tick = () =>
      setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <span className="font-mono text-2xl font-bold text-[#2563EB]">
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

// ─── Waiting Time Cell ─────────────────────────────────────────────────────────

function WaitingTimeCell({
  checkedInAt,
  status,
  tick,
}: {
  checkedInAt: string;
  status: QueueStatus;
  tick: number;
}) {
  if (status === "completed" || status === "no-show" || status === "cancelled") {
    return <span className="text-xs text-[#D1D5DB]">—</span>;
  }
  if (status === "in-consultation") {
    return <span className="text-xs text-[#2563EB] font-medium">In consult</span>;
  }
  const mins = getWaitMins(checkedInAt);
  const warn = mins >= WAIT_WARNING_MINS;
  return (
    <div className="flex items-center gap-1.5">
      {warn && <AlertCircle size={12} className="text-[#DC2626] shrink-0" />}
      <span className={cn("text-sm font-medium", warn ? "text-[#DC2626]" : "text-[#374151]")}>
        {formatWait(mins)}
      </span>
    </div>
  );
}

// ─── Patient Preview Drawer ────────────────────────────────────────────────────

function PatientDrawer({
  entry,
  onClose,
}: {
  entry: QueueEntry;
  onClose: () => void;
}) {
  const p = entry.patient;
  // Find prescriptions for this patient
  const patientRx = prescriptions.filter(
    (rx: { patientId: string }) => rx.patientId === p.id
  );
  const lastRx = patientRx[patientRx.length - 1];

  const isLate = isLateAppointment(entry);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] bg-white border-l border-[#E5E7EB] shadow-2xl flex flex-col animate-slide-right overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{getInitials(p.name)}</span>
            </div>
            <div>
              <p className="font-bold text-[#111827] text-base leading-tight">{p.name}</p>
              <p className="text-xs text-[#9CA3AF]">{p.uhid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Badges Row */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F3F4F6] flex-wrap">
          <CategoryBadge type={entry.patientType} late={isLate} />
          <StatusBadge status={entry.status} />
          <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded font-mono">
            Token #{entry.token}
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Demographics */}
          <div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
              Patient Details
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Age",         value: `${p.age} years` },
                { label: "Gender",      value: p.gender },
                { label: "Date of Birth",value: formatDate(p.dob) },
                { label: "Blood Group", value: p.bloodGroup },
              ].map((item) => (
                <div key={item.label} className="bg-[#F8FAFC] rounded-lg p-3">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-semibold text-[#111827] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
              Contact
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <span className="text-[#9CA3AF] text-xs w-14 shrink-0">Mobile</span>
                <span className="font-medium">{p.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#374151]">
                <span className="text-[#9CA3AF] text-xs w-14 shrink-0">Email</span>
                <span className="text-xs truncate">{p.email}</span>
              </div>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5">
            <p className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider mb-1">
              Chief Complaint
            </p>
            <p className="text-sm text-[#92400E] leading-relaxed">{entry.chiefComplaint}</p>
          </div>

          {/* Allergies */}
          {p.allergies.length > 0 && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={13} className="text-[#DC2626]" />
                <p className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">
                  Known Allergies
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.allergies.map((a) => (
                  <span key={a} className="text-xs bg-[#FEE2E2] text-[#DC2626] font-semibold px-2 py-0.5 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {p.chronicConditions.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
                Chronic Conditions
              </p>
              <div className="space-y-1.5">
                {p.chronicConditions.map((c) => (
                  <div key={c} className="flex items-center gap-2.5 text-sm text-[#374151] bg-[#F8FAFC] rounded-lg px-3 py-2">
                    <HeartPulse size={13} className="text-[#9CA3AF] shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Visit */}
          <div>
            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
              Visit History
            </p>
            {p.lastVisit ? (
              <div className="flex items-center justify-between bg-[#F8FAFC] rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-xs text-[#9CA3AF]">Last Visit</p>
                  <p className="text-sm font-semibold text-[#111827]">{formatDate(p.lastVisit)}</p>
                </div>
                {lastRx && (
                  <div className="text-right">
                    <p className="text-xs text-[#9CA3AF]">Diagnosis</p>
                    <p className="text-xs font-medium text-[#374151] max-w-[140px] text-right truncate">
                      {lastRx.diagnosis[0]}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF] italic">No previous visits recorded</p>
            )}
          </div>

          {/* Current Medications */}
          {lastRx && (
            <div>
              <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2.5">
                Current Medications
              </p>
              <div className="space-y-1.5">
                {lastRx.drugs.slice(0, 3).map((d: { id: string; name: string; frequency: string }) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm text-[#374151] bg-[#F8FAFC] rounded-lg px-3 py-2">
                    <Pill size={12} className="text-[#9CA3AF] shrink-0" />
                    <span className="truncate">{d.name}</span>
                    <span className="text-xs text-[#9CA3AF] shrink-0">{d.frequency}</span>
                  </div>
                ))}
                {lastRx.drugs.length > 3 && (
                  <p className="text-xs text-[#9CA3AF] px-3">+{lastRx.drugs.length - 3} more</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E5E7EB] flex gap-2.5 shrink-0">
          <Link
            href={`/patients?id=${entry.patient.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors"
          >
            <Eye size={14} />
            View Full Record
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Main Queue Page ───────────────────────────────────────────────────────────

const FILTER_CATEGORIES: { label: string; value: string }[] = [
  { label: "All",         value: "all" },
  { label: "Emergency",   value: "emergency" },
  { label: "Returning",   value: "returning" },
  { label: "Appointment", value: "appointment" },
  { label: "Walk-in",     value: "walk-in" },
];

const FILTER_STATUSES: { label: string; value: string }[] = [
  { label: "All Statuses",      value: "all" },
  { label: "Waiting",           value: "waiting" },
  { label: "In Consultation",   value: "in-consultation" },
  { label: "Completed",         value: "completed" },
  { label: "No Show",           value: "no-show" },
];

export default function QueuePage() {
  const [tick,        setTick]        = useState(0);
  const [search,      setSearch]      = useState("");
  const [catFilter,   setCatFilter]   = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");
  const [selected,    setSelected]    = useState<QueueEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Live timer tick every 30s for waiting times
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Derived counts
  const waiting       = todayQueue.filter((q) => q.status === "waiting");
  const inConsult     = todayQueue.find((q)  => q.status === "in-consultation");
  const emergency     = todayQueue.filter((q) => q.priority === "emergency" && q.status === "waiting");
  const appointments  = todayQueue.filter((q) => q.patientType === "appointment");
  const walkIns       = todayQueue.filter((q) => q.patientType === "walk-in");
  const completed     = todayQueue.filter((q) => q.status === "completed");
  const noShow        = todayQueue.filter((q) => q.status === "no-show");

  const avgWaitMins = useMemo(() => {
    const w = waiting.filter((q) => q.status === "waiting");
    if (!w.length) return 0;
    return Math.round(w.reduce((s, q) => s + getWaitMins(q.checkedInAt), 0) / w.length);
  }, [tick, waiting.length]);

  const longestWait = useMemo(() => {
    const w = waiting.slice().sort(
      (a, b) => new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime()
    );
    return w[0] ?? null;
  }, [waiting.length]);

  // Filtered table data
  const tableData = useMemo(() => {
    let data = [...todayQueue];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.patient.name.toLowerCase().includes(q) ||
          e.patient.uhid.toLowerCase().includes(q) ||
          String(e.token).includes(q)
      );
    }
    if (catFilter !== "all")    data = data.filter((e) => e.patientType === catFilter);
    if (statusFilter !== "all") data = data.filter((e) => e.status === statusFilter);
    return data;
  }, [search, catFilter, statusFilter, tick]);

  const sortedActivity = useMemo(
    () => [...activityTimeline].sort((a, b) =>
      new Date(b.time).getTime() - new Date(a.time).getTime()
    ),
    []
  );

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] leading-tight">Today's Queue</h1>
          <p className="text-[#6B7280] text-sm mt-0.5">
            {todayQueue.length} patients registered ·{" "}
            <span className="text-[#D97706] font-medium">{waiting.length} waiting</span>
            {emergency.length > 0 && (
              <>
                <span className="mx-1.5 text-[#E5E7EB]">·</span>
                <span className="text-[#DC2626] font-semibold">
                  {emergency.length} emergency
                </span>
              </>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[
          {
            icon: Clock, label: "Waiting",      value: waiting.length,
            sub: "In queue now", color: "#D97706", bg: "#FEF3C7",
          },
          {
            icon: RotateCcw, label: "Returning", value: returningPatients.length,
            sub: "Sent for tests", color: "#0EA5E9", bg: "#E0F2FE",
          },
          {
            icon: AlertTriangle, label: "Emergency", value: emergency.length,
            sub: "Urgent attention", color: "#DC2626", bg: "#FEE2E2",
            pulse: emergency.length > 0,
          },
          {
            icon: CalendarCheck, label: "Appointments", value: appointments.length,
            sub: "Scheduled today", color: "#15803D", bg: "#DCFCE7",
          },
          {
            icon: Users, label: "Walk-ins",     value: walkIns.length,
            sub: "Unscheduled", color: "#6B7280", bg: "#F3F4F6",
          },
          {
            icon: Timer, label: "Avg Wait",     value: `${avgWaitMins}m`,
            sub: "Per patient today", color: "#2563EB", bg: "#DBEAFE",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={cn(
              "card p-4 flex flex-col gap-3 group",
              (card as any).pulse && "ring-2 ring-[#DC2626]/30"
            )}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#6B7280]">{card.label}</p>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: card.bg }}
                >
                  <Icon size={15} style={{ color: card.color }} strokeWidth={2.2} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#111827] leading-none">{card.value}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-1.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid: Consultation + Right Panel ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT + CENTRE (2 cols) */}
        <div className="xl:col-span-2 space-y-5">

          {/* Current Consultation */}
          {inConsult ? (
            <div className="card border-l-4 border-l-[#2563EB] bg-[#FAFCFF] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <p className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest">
                    Active Consultation
                  </p>
                </div>
                <span className="font-mono text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2.5 py-1 rounded-lg">
                  Token #{inConsult.token}
                </span>
              </div>

              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-white">
                    {getInitials(inConsult.patient.name)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <p className="text-xl font-bold text-[#111827]">{inConsult.patient.name}</p>
                    <CategoryBadge type={inConsult.patientType} />
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    {inConsult.patient.age}y {inConsult.patient.gender}
                    <span className="mx-2">·</span>
                    {inConsult.patient.uhid}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1 italic truncate">
                    "{inConsult.chiefComplaint}"
                  </p>

                  {inConsult.patient.allergies.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <AlertTriangle size={12} className="text-[#DC2626]" />
                      <span className="text-xs text-[#DC2626] font-medium">
                        Allergy: {inConsult.patient.allergies.join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timer */}
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-0.5">
                    Duration
                  </p>
                  {inConsult.consultationStartedAt ? (
                    <ConsultationTimer startedAt={inConsult.consultationStartedAt} />
                  ) : (
                    <span className="text-lg font-mono font-bold text-[#9CA3AF]">—</span>
                  )}
                  {inConsult.consultationStartedAt && (
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      Started {formatTime(inConsult.consultationStartedAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#E5E7EB]">
                <Link
                  href="/consultation"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors"
                >
                  <Stethoscope size={16} />
                  Continue Consultation
                </Link>
                <button
                  onClick={() => setSelected(inConsult)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  View Patient Summary
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center text-center gap-4 bg-[#FAFCFF] border-dashed border-2 border-[#BFDBFE]">
              <div className="w-14 h-14 rounded-2xl bg-[#DBEAFE] flex items-center justify-center">
                <Stethoscope size={24} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-base font-bold text-[#374151]">No active consultation</p>
                <p className="text-sm text-[#9CA3AF] mt-1">
                  {waiting.length > 0
                    ? `${waiting.length} patient${waiting.length > 1 ? "s are" : " is"} waiting. Call the next patient to begin.`
                    : "All patients have been attended to."}
                </p>
              </div>
              {waiting.length > 0 && (
                <Link
                  href="/consultation"
                  className="flex items-center gap-2.5 px-8 py-3 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-[#2563EB]/20"
                >
                  <Play size={16} />
                  Call Next Patient
                </Link>
              )}
            </div>
          )}

          {/* Search + Filters */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#DBEAFE] transition-all">
                <Search size={15} className="text-[#9CA3AF] shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, token, or UHID…"
                  className="flex-1 text-sm outline-none placeholder-[#9CA3AF] text-[#111827]"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-[#9CA3AF] hover:text-[#374151]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
                  showFilters
                    ? "bg-[#DBEAFE] border-[#BFDBFE] text-[#1D4ED8]"
                    : "bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAFC]"
                )}
              >
                <Filter size={14} />
                Filters
                {(catFilter !== "all" || statusFilter !== "all") && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                )}
              </button>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-4 pt-2 border-t border-[#F3F4F6]">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Category
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_CATEGORIES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setCatFilter(f.value)}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                          catFilter === f.value
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {FILTER_STATUSES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setStatusFilter(f.value)}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                          statusFilter === f.value
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Queue Table */}
          <div className="card overflow-hidden">
            {tableData.length === 0 ? (
              <div className="py-16 flex flex-col items-center text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
                  <ClipboardList size={28} className="text-[#D1D5DB]" />
                </div>
                <p className="text-base font-semibold text-[#374151]">
                  No patients in queue
                </p>
                <p className="text-sm text-[#9CA3AF] mt-1.5">
                  {search || catFilter !== "all" || statusFilter !== "all"
                    ? "No patients match your current filters."
                    : "No consultations are currently scheduled."}
                </p>
                {(search || catFilter !== "all" || statusFilter !== "all") ? (
                  <button
                    onClick={() => { setSearch(""); setCatFilter("all"); setStatusFilter("all"); }}
                    className="mt-4 px-4 py-2 text-sm font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors"
                  >
                    Return to Dashboard
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[860px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                      {[
                        { label: "#",           w: "w-10"  },
                        { label: "Token",       w: "w-16"  },
                        { label: "Patient",     w: ""      },
                        { label: "Age / Gender",w: "w-24"  },
                        { label: "Category",    w: "w-28"  },
                        { label: "Appt. Time",  w: "w-24"  },
                        { label: "Check-in",    w: "w-24"  },
                        { label: "Waiting",     w: "w-28"  },
                        { label: "Status",      w: "w-36"  },
                      ].map((col) => (
                        <th
                          key={col.label}
                          className={cn(
                            "px-4 py-3 text-left text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider",
                            col.w
                          )}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {tableData.map((entry, idx) => {
                      const isActive  = entry.status === "in-consultation";
                      const isUrgent  = entry.priority === "emergency";
                      const late      = isLateAppointment(entry);
                      const waitMins  = getWaitMins(entry.checkedInAt);
                      const warnWait  = waitMins >= WAIT_WARNING_MINS && entry.status === "waiting";

                      return (
                        <tr
                          key={entry.id}
                          onClick={() => setSelected(entry)}
                          className={cn(
                            "cursor-pointer transition-colors group",
                            isActive  && "bg-[#EFF6FF] hover:bg-[#E0EFFE]",
                            isUrgent && !isActive && "bg-[#FFF5F5] hover:bg-[#FEE8E8]",
                            !isActive && !isUrgent && "hover:bg-[#F8FAFC]"
                          )}
                        >
                          {/* Position */}
                          <td className="px-4 py-3.5 text-xs font-medium text-[#9CA3AF]">
                            {idx + 1}
                          </td>

                          {/* Token */}
                          <td className="px-4 py-3.5">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              isActive
                                ? "bg-[#2563EB] text-white"
                                : isUrgent
                                ? "bg-[#FEE2E2] text-[#DC2626]"
                                : "bg-[#F3F4F6] text-[#6B7280]"
                            )}>
                              {entry.token}
                            </div>
                          </td>

                          {/* Patient */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                isActive ? "bg-[#2563EB]" : "bg-[#374151]"
                              )}>
                                <span className="text-[11px] font-bold text-white">
                                  {getInitials(entry.patient.name)}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className={cn(
                                  "font-semibold truncate",
                                  isActive ? "text-[#1D4ED8]" : "text-[#111827]"
                                )}>
                                  {entry.patient.name}
                                </p>
                                <p className="text-[11px] text-[#9CA3AF] font-mono">
                                  {entry.patient.uhid}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Age / Gender */}
                          <td className="px-4 py-3.5 text-sm text-[#374151]">
                            {entry.patient.age}y
                            <span className="text-[#9CA3AF] ml-1">
                              {entry.patient.gender[0]}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3.5">
                            <CategoryBadge type={entry.patientType} late={late} />
                          </td>

                          {/* Appt Time */}
                          <td className="px-4 py-3.5 text-xs text-[#6B7280]">
                            {entry.appointmentTime ?? (
                              <span className="text-[#D1D5DB]">—</span>
                            )}
                          </td>

                          {/* Check-in */}
                          <td className="px-4 py-3.5 text-xs text-[#6B7280]">
                            {formatTime(entry.checkedInAt)}
                          </td>

                          {/* Waiting */}
                          <td className="px-4 py-3.5">
                            <WaitingTimeCell
                              checkedInAt={entry.checkedInAt}
                              status={entry.status}
                              tick={tick}
                            />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            {tableData.length > 0 && (
              <div className="px-5 py-2.5 border-t border-[#F3F4F6] bg-[#F8FAFC] flex items-center justify-between">
                <p className="text-xs text-[#9CA3AF]">
                  {tableData.length} patient{tableData.length !== 1 ? "s" : ""}
                  {(search || catFilter !== "all" || statusFilter !== "all")
                    ? " (filtered)"
                    : " total"}
                </p>
                <p className="text-xs text-[#9CA3AF]">Click any row to preview patient</p>
              </div>
            )}
          </div>

          {/* Queue Insights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                label:   "Longest Wait",
                value:   longestWait
                  ? `${formatWait(getWaitMins(longestWait.checkedInAt))}`
                  : "—",
                sub:     longestWait?.patient.name ?? "No one waiting",
                icon:    TrendingDown,
                color:   longestWait && getWaitMins(longestWait.checkedInAt) >= WAIT_WARNING_MINS
                  ? "#DC2626" : "#6B7280",
              },
              {
                label:   "Avg Wait",
                value:   `${avgWaitMins}m`,
                sub:     "Across waiting patients",
                icon:    Timer,
                color:   "#6B7280",
              },
              {
                label:   "Remaining",
                value:   waiting.length,
                sub:     "Patients left today",
                icon:    ClipboardList,
                color:   "#2563EB",
              },
              {
                label:   "Returning Soon",
                value:   returningPatients.filter((r) => r.status !== "returned").length,
                sub:     "Pending lab results",
                icon:    RotateCcw,
                color:   "#0EA5E9",
              },
              {
                label:   "Completed",
                value:   completed.length,
                sub:     `${noShow.length} no-show${noShow.length !== 1 ? "s" : ""}`,
                icon:    CheckCircle2,
                color:   "#16A34A",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="card p-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} style={{ color: card.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#9CA3AF] font-medium">{card.label}</p>
                    <p className="text-lg font-bold text-[#111827] leading-tight mt-0.5">
                      {card.value}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{card.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Call Next CTA (when active consultation exists) */}
          {inConsult && waiting.length > 0 && (
            <div className="card p-4 bg-[#F8FAFC] border-dashed border-2 border-[#BFDBFE]">
              <p className="text-xs text-[#6B7280] mb-3 text-center">
                Complete current consultation to call next patient
              </p>
              <div className="flex items-center gap-3 p-3 bg-white border border-[#E5E7EB] rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#6B7280]">
                    {waiting[0].token}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#374151] truncate">
                    {waiting[0].patient.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">Next in queue</p>
                </div>
                <CategoryBadge type={waiting[0].patientType} />
              </div>
            </div>
          )}

          {/* Emergency Alerts */}
          {emergency.length > 0 && (
            <div className="card overflow-hidden border-l-4 border-l-[#DC2626]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={15} className="text-[#DC2626]" />
                  <p className="text-sm font-bold text-[#111827]">Emergency Patients</p>
                </div>
                <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                  {emergency.length} urgent
                </span>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {emergency.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-[#FFF5F5] transition-colors"
                    onClick={() => setSelected(e)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#DC2626]">
                        {getInitials(e.patient.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">
                        {e.patient.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        Arrived {formatTime(e.checkedInAt)} · Queue #{e.token}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-[#D1D5DB] shrink-0" />
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-[#FFF5F5] border-t border-[#FEE2E2]">
                <p className="text-xs text-[#9CA3AF] text-center">
                  Emergency patients are prioritised by the Queue Module
                </p>
              </div>
            </div>
          )}

          {/* Returning Patients */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-[#0EA5E9]" />
                <p className="text-sm font-bold text-[#111827]">Returning Today</p>
              </div>
              <span className="text-xs text-[#9CA3AF]">{returningPatients.length} patients</span>
            </div>

            {returningPatients.length === 0 ? (
              <div className="py-8 text-center px-5">
                <UserCheck className="w-8 h-8 text-[#E5E7EB] mx-auto mb-2" />
                <p className="text-xs text-[#9CA3AF]">No patients sent for investigations</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {returningPatients.map((rp) => (
                  <div key={rp.id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-[#0EA5E9]">
                            {getInitials(rp.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827] truncate">{rp.name}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{rp.age}y · {rp.uhid}</p>
                        </div>
                      </div>
                      <ReturnStatusBadge status={rp.status} />
                    </div>
                    <div className="flex items-center justify-between pl-[42px]">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical size={11} className="text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">{rp.reason}</span>
                      </div>
                      <span className="text-[11px] text-[#9CA3AF]">
                        {rp.status === "returned"
                          ? "Ready now"
                          : `~${formatTime(rp.expectedReturnAt)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#F3F4F6]">
              <p className="text-[11px] text-[#9CA3AF] text-center">
                Nurse will notify when patient is ready to return
              </p>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E7EB]">
              <Activity size={14} className="text-[#6B7280]" />
              <p className="text-sm font-bold text-[#111827]">Queue Activity</p>
            </div>
            <div className="px-5 py-4">
              <div className="relative">
                <div className="absolute left-3.5 top-3.5 bottom-0 w-px bg-[#F3F4F6]" />
                <div className="space-y-4">
                  {sortedActivity.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <ActivityDot type={event.type} />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-[#111827] leading-snug">
                          {event.title}
                        </p>
                        {event.subtitle && (
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">
                            {event.subtitle}
                          </p>
                        )}
                        <p className="text-[11px] text-[#C4C9D4] mt-0.5">
                          {formatTime(event.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
        {/* END RIGHT COLUMN */}

      </div>

      {/* ── Patient Preview Drawer ──────────────────────────────────────────── */}
      {selected && (
        <PatientDrawer entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
