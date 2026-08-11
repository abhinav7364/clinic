"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, X, Eye, Printer, ChevronUp, ChevronDown,
  Pill, Calendar, User, FileText, Download, Filter,
  Clock, ArrowRight, RotateCcw, CheckCircle2, ShieldAlert,
  Sparkles, Stethoscope, RefreshCw, FileSpreadsheet, Layers,
  ChevronRight, Building2, UserCheck, AlertCircle, FilePlus,
  Check, History, SlidersHorizontal, ArrowDown, ExternalLink
} from "lucide-react";
import { cn, getInitials, formatDate, formatTime } from "@/lib/utils";
import { prescriptions, patients, currentDoctor } from "@/lib/mock-data";
import { PrescriptionStatusBadge } from "@/components/ui/StatusBadge";
import type { Prescription, PrescriptionDrug } from "@/lib/types";

// ─── Extended Mock Data for Prescriptions Archive ─────────────────────────────

interface ExtendedPrescription extends Prescription {
  rxNumber: string;
  type: "printed" | "handwritten";
  version: number;
  printLogs: { date: string; by: string; copies: number }[];
  versionHistory: { version: number; date: string; note: string; drugCount: number }[];
  medicationTimeline: { date: string; title: string; subtitle: string }[];
}

const extendedPrescriptions: ExtendedPrescription[] = prescriptions.map((rx, idx) => ({
  ...rx,
  rxNumber: `RX-2026-${String(idx + 101).padStart(4, "0")}`,
  type: idx % 3 === 2 ? "handwritten" : "printed",
  version: idx === 0 ? 2 : 1,
  printLogs: [
    { date: `${rx.date} 09:35 AM`, by: "Dr. Arjun Mehta", copies: 1 },
    { date: `${rx.date} 10:15 AM`, by: "OPD Receptionist", copies: 1 },
  ],
  versionHistory: [
    { version: 1, date: rx.date, note: "Initial Consultation Prescription", drugCount: rx.drugs.length },
    ...(idx === 0 ? [{ version: 2, date: "2026-07-12", note: "Dosage adjusted after lab results", drugCount: rx.drugs.length }] : []),
  ],
  medicationTimeline: [
    { date: rx.date, title: "Prescription Created", subtitle: `Prescribed ${rx.drugs.length} medicines by ${rx.doctorName}` },
    { date: rx.date, title: "Prescription Printed", subtitle: "1 copy printed at OPD Counter #2" },
    ...(idx === 0 ? [{ date: "2026-07-12", title: "Lab Results Reviewed", subtitle: "HbA1c 8.2% — Dosage adjusted" }] : []),
  ],
}));

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 flex flex-col justify-between shadow-sm group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#6B7280]">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <Icon size={16} style={{ color }} strokeWidth={2.2} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-[#111827] leading-none">{value}</p>
        <p className="text-[11px] text-[#9CA3AF] mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── AUTHENTIC PRESCRIPTION PAPER PREVIEW MODAL ───────────────────────────────

function AuthenticPrescriptionPaper({
  rx,
  onClose,
}: {
  rx: ExtendedPrescription;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"preview" | "versions" | "printLogs" | "timeline">("preview");
  const [selectedVersion, setSelectedVersion] = useState(rx.version);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-[#E5E7EB]">

        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-[#F8FAFC] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111827]">{rx.rxNumber}</h2>
              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                rx.type === "printed" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F3F4F6] text-[#6B7280]"
              )}>
                {rx.type}
              </span>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded">
                v{rx.version}.0
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              Issued {formatDate(rx.date)} · Patient: <span className="font-semibold text-[#374151]">{rx.patient.name}</span> ({rx.patient.uhid})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              <Printer size={14} /> Print Again
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:bg-[#E5E7EB] hover:text-[#374151]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Segmented Navigation Tabs */}
        <div className="flex items-center border-b border-[#E5E7EB] px-6 bg-white shrink-0">
          {[
            { id: "preview",   label: "Prescription Paper Preview", icon: FileText },
            { id: "versions",  label: `Version History (${rx.versionHistory.length})`, icon: History },
            { id: "printLogs", label: `Print Audit (${rx.printLogs.length})`, icon: Printer },
            { id: "timeline",  label: "Medication Timeline", icon: Clock },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all",
                  isActive
                    ? "border-[#2563EB] text-[#2563EB] font-bold"
                    : "border-transparent text-[#6B7280] hover:text-[#111827]"
                )}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">

          {/* ── TAB 1: REALISTIC PRESCRIPTION PAPER PREVIEW ─────────────────── */}
          {activeTab === "preview" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto print:border-none print:shadow-none">

              {/* Clinic & Doctor Header */}
              <div className="flex items-start justify-between border-b-2 border-[#2563EB] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-[#2563EB]" />
                    <h3 className="text-lg font-bold text-[#111827]">{currentDoctor.clinic}</h3>
                  </div>
                  <p className="text-xs text-[#6B7280]">Outpatient Department · Reg. No: {currentDoctor.registrationNumber}</p>
                  <p className="text-xs text-[#9CA3AF]">Contact: {currentDoctor.mobile} · {currentDoctor.email}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-sm font-bold text-[#111827]">{currentDoctor.name}</p>
                  <p className="text-xs text-[#2563EB] font-semibold">{currentDoctor.qualification}</p>
                  <p className="text-xs text-[#6B7280]">{currentDoctor.specialization}</p>
                </div>
              </div>

              {/* Patient Info Row */}
              <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div><p className="text-[#9CA3AF] text-[10px]">Patient Name</p><p className="font-bold text-[#111827]">{rx.patient.name}</p></div>
                <div><p className="text-[#9CA3AF] text-[10px]">UHID / Age / Gender</p><p className="font-semibold text-[#111827]">{rx.patient.uhid} · {rx.patient.age}y {rx.patient.gender}</p></div>
                <div><p className="text-[#9CA3AF] text-[10px]">Date</p><p className="font-semibold text-[#111827]">{formatDate(rx.date)}</p></div>
                <div><p className="text-[#9CA3AF] text-[10px]">Rx Number</p><p className="font-mono font-bold text-[#2563EB]">{rx.rxNumber}</p></div>
              </div>

              {/* Diagnosis Block */}
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Diagnosis</p>
                <div className="flex flex-wrap gap-1.5">
                  {rx.diagnosis.map((d) => (
                    <span key={d} className="px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-xs font-semibold rounded-lg">
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rx Medicines Table */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-lg font-serif font-bold text-[#2563EB]">
                  <span>℞</span>
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#374151]">Prescribed Medications</span>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold text-[#6B7280]">#</th>
                        <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Medicine & Dose</th>
                        <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Frequency</th>
                        <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Duration</th>
                        <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Food & Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {rx.drugs.map((d, i) => (
                        <tr key={d.id}>
                          <td className="px-3 py-2.5 font-bold text-[#9CA3AF]">{i + 1}</td>
                          <td className="px-3 py-2.5 font-bold text-[#111827]">{d.name}</td>
                          <td className="px-3 py-2.5 text-[#374151]">{d.frequency}</td>
                          <td className="px-3 py-2.5 text-[#374151]">{d.duration}</td>
                          <td className="px-3 py-2.5 text-[#374151]">
                            <span className="font-semibold text-[#1D4ED8]">{d.mealInstruction}</span>
                            {d.instructions && <p className="text-[11px] text-[#9CA3AF] italic mt-0.5">{d.instructions}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-[#E5E7EB]">
                <div className="space-y-1">
                  <p className="font-bold text-[#374151]">Doctor's Advice & Notes:</p>
                  <p className="text-[#6B7280] italic leading-relaxed bg-[#FFFBEB] p-2.5 rounded-lg border border-[#FDE68A]">
                    {rx.notes || "Follow diet and exercise recommendations strictly."}
                  </p>
                </div>
                <div className="space-y-1 text-right sm:text-left">
                  <p className="font-bold text-[#374151]">Follow-up Review Date:</p>
                  <p className="text-sm font-bold text-[#2563EB]">{rx.followUpDate ? formatDate(rx.followUpDate) : "As needed"}</p>
                </div>
              </div>

              {/* Digital Signature Area */}
              <div className="pt-6 border-t border-[#E5E7EB] flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-[#9CA3AF]">Computer Generated Prescription</p>
                  <p className="text-[10px] text-[#9CA3AF]">CareClinic EMR System v2.4</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-36 border-b border-[#374151] pb-1">
                    <span className="font-serif italic text-sm font-bold text-[#2563EB]">{currentDoctor.name}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-[#374151]">Doctor's Signature</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: VERSION HISTORY ──────────────────────────────────────── */}
          {activeTab === "versions" && (
            <div className="space-y-3 animate-fade-in max-w-xl mx-auto">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Prescription Versions</h3>
              <div className="space-y-2">
                {rx.versionHistory.map((vh) => (
                  <div
                    key={vh.version}
                    onClick={() => setSelectedVersion(vh.version)}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                      selectedVersion === vh.version
                        ? "bg-[#EFF6FF] border-[#2563EB]"
                        : "bg-white border-[#E5E7EB] hover:bg-[#F8FAFC]"
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#111827]">Version {vh.version}.0</span>
                        <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded">
                          {vh.date}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">{vh.note}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#2563EB]">{vh.drugCount} medicines</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: PRINT AUDIT LOGS ─────────────────────────────────────── */}
          {activeTab === "printLogs" && (
            <div className="space-y-3 animate-fade-in max-w-xl mx-auto">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Print Audit Trail</h3>
              <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Print Timestamp</th>
                      <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Printed By</th>
                      <th className="px-3.5 py-2.5 text-right font-bold text-[#6B7280]">Copies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {rx.printLogs.map((log, i) => (
                      <tr key={i}>
                        <td className="px-3.5 py-3 font-semibold text-[#111827]">{log.date}</td>
                        <td className="px-3.5 py-3 text-[#374151]">{log.by}</td>
                        <td className="px-3.5 py-3 text-right font-bold text-[#2563EB]">{log.copies}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 4: MEDICATION TIMELINE ─────────────────────────────────── */}
          {activeTab === "timeline" && (
            <div className="space-y-4 animate-fade-in max-w-xl mx-auto">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Medication Lifecycle Timeline</h3>
              <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E7EB]">
                {rx.medicationTimeline.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">{item.title}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">{item.subtitle}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{item.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── MAIN PRESCRIPTION HISTORY PAGE ───────────────────────────────────────────

export default function PrescriptionsPage() {
  const [search, setSearch] = useState("");
  const [rxTypeFilter, setRxTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [viewingRx, setViewingRx] = useState<ExtendedPrescription | null>(null);

  // Filtered Prescriptions List
  const filteredData = useMemo(() => {
    let data = [...extendedPrescriptions];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (rx) =>
          rx.patient.name.toLowerCase().includes(q) ||
          rx.patient.uhid.toLowerCase().includes(q) ||
          rx.rxNumber.toLowerCase().includes(q) ||
          rx.diagnosis.some((d) => d.toLowerCase().includes(q)) ||
          rx.drugs.some((d) => d.name.toLowerCase().includes(q)) ||
          rx.notes.toLowerCase().includes(q)
      );
    }

    if (rxTypeFilter !== "all") {
      data = data.filter((rx) => rx.type === rxTypeFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((rx) => rx.status === statusFilter);
    }

    data.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return data;
  }, [search, rxTypeFilter, statusFilter, sortOrder]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Prescription History</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Archive of all previously issued prescriptions with full medication history and print audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors",
              showAdvancedSearch
                ? "bg-[#DBEAFE] border-[#BFDBFE] text-[#1D4ED8]"
                : "bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC]"
            )}
          >
            <SlidersHorizontal size={14} />
            Advanced Search
          </button>
        </div>
      </div>

      {/* ── Summary Statistics Cards (6 Cards) ───────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          icon={FileText} title="Total Issued" value="3,421" sub="All time prescriptions"
          color="#2563EB" bg="#DBEAFE"
        />
        <StatCard
          icon={Printer} title="Printed" value="2,890" sub="84.5% of total"
          color="#16A34A" bg="#DCFCE7"
        />
        <StatCard
          icon={Pill} title="Handwritten" value="531" sub="15.5% recorded in EMR"
          color="#6B7280" bg="#F3F4F6"
        />
        <StatCard
          icon={Clock} title="Today's Rx" value="12" sub="Issued today"
          color="#D97706" bg="#FEF3C7"
        />
        <StatCard
          icon={Calendar} title="This Month" value="289" sub="Issued in July"
          color="#0EA5E9" bg="#E0F2FE"
        />
        <StatCard
          icon={Sparkles} title="Top Medicine" value="Metformin" sub="Most prescribed"
          color="#2563EB" bg="#DBEAFE"
        />
      </div>

      {/* ── Search & Filter Controls ───────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#DBEAFE] transition-all w-full">
            <Search size={16} className="text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, UHID, Medicine Name, Diagnosis, or Rx ID..."
              className="flex-1 text-xs outline-none placeholder-[#9CA3AF] text-[#111827]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#9CA3AF] hover:text-[#374151]">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg bg-white outline-none cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Filters Bar */}
        {showAdvancedSearch && (
          <div className="pt-3 border-t border-[#F3F4F6] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            <div>
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Prescription Type</label>
              <select
                value={rxTypeFilter} onChange={(e) => setRxTypeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white outline-none mt-1"
              >
                <option value="all">All Types (Printed & Handwritten)</option>
                <option value="printed">Printed Prescriptions Only</option>
                <option value="handwritten">Handwritten Prescriptions Only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#9CA3AF] uppercase">Prescription Status</label>
              <select
                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg bg-white outline-none mt-1"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => { setSearch(""); setRxTypeFilter("all"); setStatusFilter("all"); setSortOrder("newest"); }}
                className="w-full py-1.5 px-3 bg-[#F3F4F6] text-[#374151] font-bold rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Prescription History Data Table ───────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto text-[#9CA3AF]">
              <FileText size={28} />
            </div>
            <p className="text-base font-bold text-[#374151]">No prescriptions found</p>
            <p className="text-xs text-[#9CA3AF]">No prescription records match your current search or filter criteria.</p>
            <button
              onClick={() => { setSearch(""); setRxTypeFilter("all"); setStatusFilter("all"); }}
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB] sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Rx ID</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Date</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Patient &amp; UHID</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Doctor</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Primary Diagnosis</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Medicines</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Type</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-right font-bold text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {filteredData.map((rx) => (
                  <tr
                    key={rx.id}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                    onClick={() => setViewingRx(rx)}
                  >
                    {/* Rx Number */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                      {rx.rxNumber}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 font-semibold text-[#111827]">
                      {formatDate(rx.date)}
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-[10px]">
                          {getInitials(rx.patient.name)}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827]">{rx.patient.name}</p>
                          <p className="text-[10px] text-[#9CA3AF] font-mono">{rx.patient.uhid}</p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="px-4 py-3.5 text-[#374151]">
                      {rx.doctorName}
                    </td>

                    {/* Primary Diagnosis */}
                    <td className="px-4 py-3.5 font-medium text-[#1D4ED8] max-w-[200px] truncate">
                      {rx.diagnosis[0]}
                    </td>

                    {/* Medicines Count */}
                    <td className="px-4 py-3.5 text-[#374151]">
                      <span className="font-semibold">{rx.drugs.length}</span> medicines
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        rx.type === "printed" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F3F4F6] text-[#6B7280]"
                      )}>
                        {rx.type}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <PrescriptionStatusBadge status={rx.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setViewingRx(rx)}
                        className="px-2.5 py-1 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg hover:bg-[#DBEAFE] transition-colors"
                      >
                        View Rx
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-2 py-1 text-[11px] font-semibold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F8FAFC] transition-colors"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {filteredData.length > 0 && (
          <div className="px-4 py-3 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#9CA3AF]">
            <p>Showing {filteredData.length} prescription records</p>
            <p>Click any row to view complete prescription preview, print audit, and version history</p>
          </div>
        )}
      </div>

      {/* ── Prescription Paper Viewer Modal ───────────────────────────────── */}
      {viewingRx && (
        <AuthenticPrescriptionPaper rx={viewingRx} onClose={() => setViewingRx(null)} />
      )}

    </div>
  );
}
