"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format, formatDistanceToNowStrict, differenceInMinutes } from "date-fns";
import {
  Users, CheckCircle2, Clock, AlertTriangle, Timer,
  CalendarCheck, ArrowRight, Play, ChevronRight,
  Stethoscope, Search, FileText, User, Settings,
  FlaskConical, Printer, UserCheck, PhoneIncoming,
  AlertCircle, Bell, RotateCcw, XCircle, Activity,
  ClipboardList, Building2, Sparkles,
} from "lucide-react";
import { cn, formatTime, getInitials } from "@/lib/utils";
import {
  currentDoctor,
  todayQueue,
  dashboardStats,
  returningPatients,
  activityTimeline,
  dashboardNotifications,
  type ReturningPatient,
  type ActivityEvent,
} from "@/lib/mock-data";
import { QueueStatusBadge, PatientTypeBadge, PriorityBadge } from "@/components/ui/StatusBadge";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getWaitingMinutes(checkedInAt: string): number {
  return differenceInMinutes(new Date(), new Date(checkedInAt));
}

function formatWaiting(mins: number): string {
  if (mins < 1) return "Just arrived";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  supporting: string;
  iconColor: string;
  iconBg: string;
  highlight?: boolean;
}

function StatCard({ icon: Icon, title, value, supporting, iconColor, iconBg, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "card p-5 flex flex-col gap-4 group cursor-default",
      highlight && "ring-2 ring-[#2563EB] ring-offset-1"
    )}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#6B7280]">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} strokeWidth={2} />
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold text-[#111827] leading-none">{value}</p>
        <p className="text-xs text-[#9CA3AF] mt-2 leading-relaxed">{supporting}</p>
      </div>
    </div>
  );
}

// ─── Quick Action Card ───────────────────────────────────────────────────────

function QuickActionCard({
  icon: Icon,
  title,
  desc,
  href,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="card p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: color + "18" }}
      >
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#111827] truncate">{title}</p>
        <p className="text-xs text-[#9CA3AF] truncate mt-0.5">{desc}</p>
      </div>
      <ChevronRight size={14} className="text-[#D1D5DB] shrink-0 group-hover:text-[#9CA3AF] transition-colors" />
    </Link>
  );
}

// ─── Category Badge ──────────────────────────────────────────────────────────

function CategoryBadge({ type }: { type: string }) {
  const configs: Record<string, { label: string; color: string; bg: string }> = {
    emergency:   { label: "Emergency",   color: "#DC2626", bg: "#FEE2E2" },
    returning:   { label: "Returning",   color: "#1D4ED8", bg: "#DBEAFE" },
    appointment: { label: "Appointment", color: "#15803D", bg: "#DCFCE7" },
    "walk-in":   { label: "Walk-in",     color: "#6B7280", bg: "#F3F4F6" },
  };
  const c = configs[type] ?? configs["walk-in"];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: c.color, background: c.bg }}
    >
      {c.label}
    </span>
  );
}

// ─── Activity Icon ───────────────────────────────────────────────────────────

function ActivityIcon({ type }: { type: ActivityEvent["type"] }) {
  const configs: Record<ActivityEvent["type"], { icon: React.ElementType; color: string; bg: string }> = {
    "consultation-completed": { icon: CheckCircle2,  color: "#16A34A", bg: "#DCFCE7" },
    "consultation-started":   { icon: Stethoscope,   color: "#2563EB", bg: "#DBEAFE" },
    "prescription-printed":   { icon: Printer,       color: "#6B7280", bg: "#F3F4F6" },
    "patient-returned":       { icon: UserCheck,     color: "#0EA5E9", bg: "#E0F2FE" },
    "patient-called":         { icon: PhoneIncoming, color: "#2563EB", bg: "#DBEAFE" },
    "no-show":                { icon: XCircle,       color: "#DC2626", bg: "#FEE2E2" },
    "lab-ready":              { icon: FlaskConical,  color: "#D97706", bg: "#FEF3C7" },
  };
  const c = configs[type];
  const Icon = c.icon;
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{ background: c.bg }}
    >
      <Icon size={13} style={{ color: c.color }} />
    </div>
  );
}

// ─── Returning Patient Status ────────────────────────────────────────────────

function ReturningStatusBadge({ status }: { status: ReturningPatient["status"] }) {
  const configs = {
    "returned":        { label: "Returned",        color: "#16A34A", bg: "#DCFCE7" },
    "waiting-outside": { label: "Waiting Outside", color: "#D97706", bg: "#FEF3C7" },
    "delayed":         { label: "Delayed",         color: "#DC2626", bg: "#FEE2E2" },
  };
  const c = configs[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: c.color, background: c.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}

// ─── Notification Icon ───────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    lab:     { icon: FlaskConical, color: "#D97706" },
    patient: { icon: UserCheck,    color: "#0EA5E9" },
    print:   { icon: Printer,      color: "#6B7280" },
    system:  { icon: Bell,         color: "#2563EB" },
    alert:   { icon: AlertCircle,  color: "#DC2626" },
  };
  const c = map[type] ?? map["system"];
  const Icon = c.icon;
  return <Icon size={15} style={{ color: c.color }} className="shrink-0 mt-0.5" />;
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Derived data
  const activeConsultation = todayQueue.find((q) => q.status === "in-consultation");
  const waitingPatients    = todayQueue.filter((q) => q.status === "waiting");
  const completedToday     = todayQueue.filter((q) => q.status === "completed");
  const emergencyPatients  = todayQueue.filter((q) => q.priority === "emergency" && q.status === "waiting");
  const queuePreview       = todayQueue
    .filter((q) => q.status === "waiting" || q.status === "in-consultation")
    .slice(0, 6);
  const unreadNotifs       = dashboardNotifications.filter((n) => !n.read).length;

  // Sort timeline newest-first
  const sortedActivity = [...activityTimeline].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const firstName = currentDoctor.name.replace("Dr. ", "").split(" ")[0];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#F59E0B]" />
            <p className="text-xs font-medium text-[#9CA3AF] uppercase tracking-widest">
              {currentDoctor.clinic}
            </p>
          </div>
          <h1 className="text-[28px] font-bold text-[#111827] leading-tight">
            {getGreeting()}, Dr. {firstName}
          </h1>
          <p className="text-[#6B7280] text-sm">
            {format(currentTime, "EEEE, d MMMM yyyy")}
            <span className="mx-2 text-[#E5E7EB]">·</span>
            <span className="font-medium text-[#374151]">
              {format(currentTime, "hh:mm a")}
            </span>
          </p>
        </div>

        {/* Summary Banner */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl shadow-sm shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#DBEAFE] flex items-center justify-center">
            <Activity size={16} className="text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              {todayQueue.length} scheduled patients today
            </p>
            <p className="text-xs text-[#6B7280]">
              {completedToday.length} completed · {waitingPatients.length} waiting
            </p>
          </div>
        </div>
      </div>

      {/* ── Statistics Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Clock}
          title="Patients Waiting"
          value={waitingPatients.length}
          supporting="Currently in queue"
          iconColor="#D97706"
          iconBg="#FEF3C7"
        />
        <StatCard
          icon={RotateCcw}
          title="Returning"
          value={returningPatients.length}
          supporting="Sent for investigations"
          iconColor="#0EA5E9"
          iconBg="#E0F2FE"
        />
        <StatCard
          icon={CheckCircle2}
          title="Completed"
          value={completedToday.length}
          supporting={`Out of ${todayQueue.length} today`}
          iconColor="#16A34A"
          iconBg="#DCFCE7"
        />
        <StatCard
          icon={AlertTriangle}
          title="Emergency"
          value={emergencyPatients.length}
          supporting="Awaiting attention"
          iconColor="#DC2626"
          iconBg="#FEE2E2"
          highlight={emergencyPatients.length > 0}
        />
        <StatCard
          icon={Timer}
          title="Avg. Time"
          value={`${dashboardStats.avgConsultationMinutes}m`}
          supporting="Per consultation today"
          iconColor="#6B7280"
          iconBg="#F3F4F6"
        />
        <StatCard
          icon={CalendarCheck}
          title="Remaining"
          value={waitingPatients.length}
          supporting="Appointments left"
          iconColor="#2563EB"
          iconBg="#DBEAFE"
        />
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <QuickActionCard icon={ClipboardList} title="Today's Queue"         desc="View & manage queue"          href="/queue"          color="#2563EB" />
        <QuickActionCard icon={Search}        title="Search Patient"         desc="Find by name or UHID"         href="/patients"       color="#0EA5E9" />
        <QuickActionCard icon={FileText}      title="Prescription History"   desc="View past prescriptions"      href="/prescriptions"  color="#16A34A" />
        <QuickActionCard icon={User}          title="My Profile"             desc="Professional profile & credentials" href="/profile"  color="#6B7280" />
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN — Queue + Consultation */}
        <div className="xl:col-span-2 space-y-5">

          {/* Current Consultation Card */}
          {activeConsultation ? (
            <div className="card p-5 border-l-4 border-l-[#2563EB] bg-[#FAFCFF]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                  <p className="text-sm font-bold text-[#1D4ED8] uppercase tracking-wide">
                    Active Consultation
                  </p>
                </div>
                <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-lg font-mono">
                  Token #{activeConsultation.token}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-white">
                    {getInitials(activeConsultation.patient.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-[#111827]">{activeConsultation.patient.name}</p>
                  <p className="text-sm text-[#6B7280]">
                    {activeConsultation.patient.age}y {activeConsultation.patient.gender}
                    <span className="mx-2">·</span>
                    {activeConsultation.patient.uhid}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1 italic truncate">
                    "{activeConsultation.chiefComplaint}"
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex flex-col items-end gap-1.5">
                    <CategoryBadge type={activeConsultation.patientType} />
                    {activeConsultation.consultationStartedAt && (
                      <p className="text-xs text-[#6B7280]">
                        Since {formatTime(activeConsultation.consultationStartedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {activeConsultation.patient.allergies.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
                  <AlertTriangle size={13} className="text-[#DC2626] shrink-0" />
                  <p className="text-xs text-[#DC2626] font-medium">
                    Allergy: {activeConsultation.patient.allergies.join(", ")}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Link
                  href="/consultation"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
                >
                  <Stethoscope size={15} />
                  Continue Consultation
                </Link>
                <Link
                  href={`/patients?id=${activeConsultation.patient.id}`}
                  className="px-4 py-2.5 text-sm font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ) : (
            <div className="card p-5 border-l-4 border-l-[#E5E7EB]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                <p className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wide">
                  No Active Consultation
                </p>
              </div>
              <p className="text-sm text-[#6B7280] mb-4">
                No consultation is currently in progress. Call the next waiting patient to begin.
              </p>
              <Link
                href="/queue"
                className="flex items-center justify-center gap-2 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
              >
                <Play size={14} />
                Call Next Patient
              </Link>
            </div>
          )}

          {/* Today's Queue Overview */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Today's Queue</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Showing next {queuePreview.length} patients
                </p>
              </div>
              <Link
                href="/queue"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                View Full Queue
                <ArrowRight size={13} />
              </Link>
            </div>

            {queuePreview.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center px-8">
                <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-3">
                  <Users size={24} className="text-[#D1D5DB]" />
                </div>
                <p className="text-sm font-semibold text-[#374151]">
                  No consultations scheduled for today
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">
                  All done or no patients registered yet.
                </p>
                <Link
                  href="/queue"
                  className="mt-4 px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
                >
                  View Appointments
                </Link>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-[40px_1fr_56px_100px_80px_110px] gap-3 px-5 py-2.5 bg-[#F8FAFC] border-b border-[#F3F4F6]">
                  {["Token", "Patient", "Age", "Category", "Waiting", "Status"].map((h) => (
                    <p key={h} className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider truncate">
                      {h}
                    </p>
                  ))}
                </div>

                <div className="divide-y divide-[#F3F4F6]">
                  {queuePreview.map((entry) => {
                    const waitMins = getWaitingMinutes(entry.checkedInAt);
                    const isActive = entry.status === "in-consultation";
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "grid grid-cols-[40px_1fr_56px_100px_80px_110px] gap-3 items-center px-5 py-3 hover:bg-[#F8FAFC] transition-colors",
                          isActive && "bg-[#F0F7FF]",
                          entry.priority === "emergency" && !isActive && "bg-[#FFFBFB]"
                        )}
                      >
                        {/* Token */}
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          isActive
                            ? "bg-[#2563EB] text-white"
                            : entry.priority === "emergency"
                            ? "bg-[#FEE2E2] text-[#DC2626]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        )}>
                          {entry.token}
                        </div>

                        {/* Patient */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                            isActive ? "bg-[#2563EB]" : "bg-[#374151]"
                          )}>
                            <span className="text-[10px] font-bold text-white">
                              {getInitials(entry.patient.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className={cn(
                              "text-sm font-semibold truncate",
                              isActive ? "text-[#1D4ED8]" : "text-[#111827]"
                            )}>
                              {entry.patient.name}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF] truncate">
                              {entry.patient.uhid}
                            </p>
                          </div>
                        </div>

                        {/* Age */}
                        <p className="text-sm text-[#374151]">
                          {entry.patient.age}y
                        </p>

                        {/* Category */}
                        <div>
                          <CategoryBadge type={entry.patientType} />
                        </div>

                        {/* Waiting */}
                        <div className="flex items-center gap-1">
                          <Clock size={11} className={cn(
                            waitMins > 30 ? "text-[#DC2626]" : "text-[#9CA3AF]"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            waitMins > 30 ? "text-[#DC2626]" : "text-[#374151]"
                          )}>
                            {isActive ? "—" : formatWaiting(waitMins)}
                          </span>
                        </div>

                        {/* Status */}
                        <QueueStatusBadge status={entry.status} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* Emergency Alerts */}
          {emergencyPatients.length > 0 && (
            <div className="card overflow-hidden border-l-4 border-l-[#DC2626]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-[#DC2626]" />
                  <p className="text-sm font-bold text-[#111827]">Emergency Alerts</p>
                </div>
                <span className="text-xs font-semibold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full">
                  {emergencyPatients.length} urgent
                </span>
              </div>
              <div className="divide-y divide-[#F3F4F6]">
                {emergencyPatients.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#FEE2E2] flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#DC2626]">
                        {getInitials(entry.patient.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#111827] truncate">
                        {entry.patient.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        Arrived {formatTime(entry.checkedInAt)}
                      </p>
                    </div>
                    <PriorityBadge priority="emergency" />
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-[#FFF5F5] border-t border-[#FEE2E2]">
                <Link
                  href="/queue"
                  className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                >
                  View in Queue <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {/* Returning Patients */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <RotateCcw size={14} className="text-[#0EA5E9]" />
                <p className="text-sm font-bold text-[#111827]">Returning Patients</p>
              </div>
              <span className="text-xs text-[#9CA3AF]">{returningPatients.length} sent out</span>
            </div>

            {returningPatients.length === 0 ? (
              <div className="py-8 text-center px-5">
                <UserCheck className="w-8 h-8 text-[#E5E7EB] mx-auto mb-2" />
                <p className="text-xs text-[#9CA3AF]">No patients sent for investigations</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F3F4F6]">
                {returningPatients.map((rp) => (
                  <div key={rp.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-[#E0F2FE] flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-[#0EA5E9]">
                            {getInitials(rp.name)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827] truncate">{rp.name}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{rp.age}y · {rp.uhid}</p>
                        </div>
                      </div>
                      <ReturningStatusBadge status={rp.status} />
                    </div>
                    <div className="flex items-center justify-between mt-2 pl-9">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical size={11} className="text-[#9CA3AF]" />
                        <span className="text-xs text-[#6B7280]">{rp.reason}</span>
                      </div>
                      <span className="text-[11px] text-[#9CA3AF]">
                        {rp.status === "returned"
                          ? "Ready"
                          : `~${formatTime(rp.expectedReturnAt)}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-[#6B7280]" />
                <p className="text-sm font-bold text-[#111827]">Notifications</p>
              </div>
              {unreadNotifs > 0 && (
                <span className="text-xs font-semibold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                  {unreadNotifs} new
                </span>
              )}
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {dashboardNotifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors",
                    !n.read && "bg-[#FAFBFF]"
                  )}
                >
                  {/* Unread dot */}
                  <div className="relative mt-0.5">
                    <NotifIcon type={n.icon} />
                    {!n.read && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2563EB] border border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs text-[#111827] leading-snug",
                      !n.read && "font-semibold"
                    )}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-[#C4C9D4] mt-1">{formatTime(n.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#6B7280]" />
                <p className="text-sm font-bold text-[#111827]">Recent Activity</p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3.5 top-3.5 bottom-3.5 w-px bg-[#F3F4F6]" />

                <div className="space-y-4">
                  {sortedActivity.slice(0, 8).map((event) => (
                    <div key={event.id} className="flex gap-3 relative">
                      <ActivityIcon type={event.type} />
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-xs font-semibold text-[#111827] leading-snug">
                          {event.title}
                        </p>
                        {event.subtitle && (
                          <p className="text-[11px] text-[#9CA3AF] mt-0.5 truncate">{event.subtitle}</p>
                        )}
                        <p className="text-[11px] text-[#C4C9D4] mt-0.5">{formatTime(event.time)}</p>
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
    </div>
  );
}
