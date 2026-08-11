"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, Filter, Plus, X, Phone, Mail, MapPin,
  Droplets, AlertTriangle, ChevronRight, Calendar,
  Clock, User, FileText, Activity, ChevronUp, ChevronDown,
  Printer, ShieldAlert, HeartPulse, Pill, FlaskConical,
  Eye, Download, FileSpreadsheet, CheckCircle2, RotateCcw,
  Sparkles, Stethoscope, UserCheck, Check, Info, FilePlus,
  Share2, ArrowRight, ExternalLink, CalendarCheck, AlertCircle,
  Building2, Layers, Heart, UserX, Compass, Users, Sparkle
} from "lucide-react";
import { cn, getInitials, formatDate, formatTime } from "@/lib/utils";
import {
  patients,
  prescriptions,
  todayQueue,
  currentDoctor,
  sampleVitals,
} from "@/lib/mock-data";
import { PatientTypeBadge, QueueStatusBadge } from "@/components/ui/StatusBadge";
import type { Patient, Prescription, QueueEntry, PatientType } from "@/lib/types";

// ─── Patient Category Badge Component ─────────────────────────────────────────

function CategoryBadge({ type }: { type: PatientType }) {
  const configs: Record<PatientType, { label: string; color: string; bg: string }> = {
    emergency:   { label: "Emergency",   color: "#DC2626", bg: "#FEE2E2" },
    returning:   { label: "Returning",   color: "#1D4ED8", bg: "#DBEAFE" },
    appointment: { label: "Appointment", color: "#15803D", bg: "#DCFCE7" },
    "walk-in":   { label: "Walk-in",     color: "#6B7280", bg: "#F3F4F6" },
  };
  const c = configs[type] ?? configs["walk-in"];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
}

// ─── Mock Data for Imaging, Lab & Documents ───────────────────────────────────

interface ImagingRecord {
  id: string;
  type: string;
  name: string;
  date: string;
  doctor: string;
  status: "Completed" | "Pending";
  findings: string;
}

const mockImaging: ImagingRecord[] = [
  {
    id: "img-1", type: "X-Ray", name: "Chest X-Ray PA View",
    date: "2026-05-20", doctor: "Dr. Arjun Mehta", status: "Completed",
    findings: "Lung fields clear bilaterally. Heart size normal. No pleural effusion.",
  },
  {
    id: "img-2", type: "ECG", name: "12-Lead ECG",
    date: "2026-06-15", doctor: "Dr. Arjun Mehta", status: "Completed",
    findings: "Normal sinus rhythm. Heart rate 74 bpm. No ST-T segment changes.",
  },
  {
    id: "img-3", type: "Ultrasound", name: "Abdomen & Pelvis USG",
    date: "2026-03-10", doctor: "Dr. S. K. Nandi", status: "Completed",
    findings: "Liver normal size, mild fatty infiltration. Gallbladder normal without calculi.",
  },
];

interface LabRecord {
  id: string;
  testName: string;
  requestedDate: string;
  completedDate: string;
  doctor: string;
  status: "Completed" | "Pending";
  resultsSummary: string;
}

const mockLabResults: LabRecord[] = [
  {
    id: "lab-1", testName: "HbA1c & Fasting Blood Sugar",
    requestedDate: "2026-07-08", completedDate: "2026-07-10",
    doctor: "Dr. Arjun Mehta", status: "Completed",
    resultsSummary: "HbA1c: 8.2% (Elevated), FBS: 142 mg/dL",
  },
  {
    id: "lab-2", testName: "Lipid Profile Panel",
    requestedDate: "2026-07-08", completedDate: "2026-07-10",
    doctor: "Dr. Arjun Mehta", status: "Completed",
    resultsSummary: "Total Chol: 210 mg/dL, Triglycerides: 185 mg/dL, HDL: 42 mg/dL",
  },
  {
    id: "lab-3", testName: "Renal Function Test (KFT)",
    requestedDate: "2026-04-12", completedDate: "2026-04-13",
    doctor: "Dr. Arjun Mehta", status: "Completed",
    resultsSummary: "Serum Creatinine: 0.9 mg/dL, Blood Urea: 24 mg/dL",
  },
];

interface PatientDocument {
  id: string;
  fileName: string;
  fileType: "PDF" | "Image" | "Lab Report" | "Discharge Summary";
  uploadDate: string;
  uploadedBy: string;
  size: string;
}

const mockDocuments: PatientDocument[] = [
  { id: "doc-1", fileName: "Hospital_Discharge_Summary_2024.pdf", fileType: "Discharge Summary", uploadDate: "2024-05-12", uploadedBy: "Reception", size: "2.4 MB" },
  { id: "doc-2", fileName: "Cardiology_Consultation_Letter.pdf", fileType: "PDF", uploadDate: "2025-11-20", uploadedBy: "Dr. Arjun Mehta", size: "1.1 MB" },
  { id: "doc-3", fileName: "Annual_Health_Checkup_Report.pdf", fileType: "Lab Report", uploadDate: "2026-01-15", uploadedBy: "Patient Portal", size: "3.8 MB" },
];

// ─── REUSABLE PATIENT EMR VIEW COMPONENT ──────────────────────────────────────

export function PatientEMRView({
  patient,
  onClose,
  isOverlay = false,
}: {
  patient: Patient;
  onClose?: () => void;
  isOverlay?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "consultations" | "prescriptions" | "history" | "lab" | "investigations" | "vitals" | "documents" | "appointments" | "timeline"
  >("overview");

  // Modals inside EMR
  const [viewingRx, setViewingRx] = useState<Prescription | null>(null);
  const [viewingLab, setViewingLab] = useState<LabRecord | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<any | null>(null);

  const patientPrescriptions = useMemo(
    () => prescriptions.filter((rx) => rx.patientId === patient.id),
    [patient]
  );

  const queueEntry = useMemo(
    () => todayQueue.find((q) => q.patient.id === patient.id),
    [patient]
  );

  return (
    <div className={cn("space-y-4", isOverlay && "p-2")}>

      {/* ── EMR Header ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0 text-white font-bold text-xl shadow-sm">
              {getInitials(patient.name)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-[#111827]">{patient.name}</h2>
                <span className="text-xs font-mono font-bold bg-[#F3F4F6] text-[#374151] px-2.5 py-1 rounded-lg">
                  {patient.uhid}
                </span>
                <CategoryBadge type={patient.patientType} />
              </div>
              <p className="text-xs text-[#6B7280] mt-1">
                {patient.age} years · {patient.gender} · DOB: {formatDate(patient.dob)} · Blood Group: <span className="font-bold text-[#DC2626]">{patient.bloodGroup}</span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Primary Physician: <span className="font-medium text-[#374151]">Dr. Arjun Mehta</span> · Registered: {patient.registeredOn}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {queueEntry && !isOverlay && (
              <Link
                href="/consultation"
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
              >
                <Stethoscope size={14} />
                View Current Consultation
              </Link>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
            >
              <Printer size={14} />
              Print Summary
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F3F4F6] text-[#374151] text-xs font-bold rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                <X size={14} />
                {isOverlay ? "Close & Return" : "Close Record"}
              </button>
            )}
          </div>
        </div>

        {/* Pinned Clinical Alerts */}
        <div className="pt-3 border-t border-[#F3F4F6] flex flex-wrap gap-2">
          {patient.allergies.map((a) => (
            <div key={a} className="flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-bold text-[#DC2626]">
              <AlertTriangle size={13} />
              <span>Allergy: {a}</span>
            </div>
          ))}
          {patient.chronicConditions.map((c) => (
            <div key={c} className="flex items-center gap-1.5 px-3 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-lg text-xs font-bold text-[#B45309]">
              <HeartPulse size={13} />
              <span>Chronic: {c}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg text-xs font-semibold text-[#1D4ED8]">
            <Pill size={13} />
            <span>Active Meds: {patientPrescriptions.length > 0 ? patientPrescriptions[0].drugs.length : 2}</span>
          </div>
        </div>
      </div>

      {/* ── SPLIT LAYOUT (Left Fixed Summary + Right Segmented Tabs) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ==================================================================== */}
        {/* LEFT PANEL — PATIENT SUMMARY (Always visible, 3 cols)               */}
        {/* ==================================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3.5 shadow-sm text-xs">
            <p className="font-bold text-[#374151] uppercase tracking-wider text-[11px]">Patient Summary</p>

            {/* Demographics & Contact */}
            <div className="space-y-1.5 border-b border-[#F3F4F6] pb-3 text-[#374151]">
              <p><span className="text-[#9CA3AF]">Mobile:</span> {patient.mobile}</p>
              <p><span className="text-[#9CA3AF]">Email:</span> {patient.email}</p>
              <p className="truncate"><span className="text-[#9CA3AF]">Address:</span> {patient.address}</p>
              <p><span className="text-[#9CA3AF]">Emergency Contact:</span> +91 98112 00000</p>
            </div>

            {/* Vitals Summary */}
            <div className="space-y-1.5 border-b border-[#F3F4F6] pb-3">
              <p className="font-bold text-[#374151] text-[11px] uppercase tracking-wider">Latest Vitals</p>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#F8FAFC] p-2 rounded"><p className="text-[#9CA3AF]">BP</p><p className="font-bold text-[#111827]">138/88</p></div>
                <div className="bg-[#F8FAFC] p-2 rounded"><p className="text-[#9CA3AF]">BMI</p><p className="font-bold text-[#D97706]">25.9</p></div>
                <div className="bg-[#F8FAFC] p-2 rounded"><p className="text-[#9CA3AF]">Sugar</p><p className="font-bold text-[#DC2626]">142 mg/dL</p></div>
                <div className="bg-[#F8FAFC] p-2 rounded"><p className="text-[#9CA3AF]">Pulse</p><p className="font-bold text-[#111827]">82 bpm</p></div>
              </div>
            </div>

            {/* Lifestyle */}
            <div className="space-y-1 text-[#374151]">
              <p><span className="text-[#9CA3AF]">Smoking:</span> Non-Smoker</p>
              <p><span className="text-[#9CA3AF]">Alcohol:</span> Occasional</p>
              <p><span className="text-[#9CA3AF]">Activity:</span> Moderate</p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT PANEL — SEGMENTED TABS (9 cols)                                */}
        {/* ==================================================================== */}
        <div className="lg:col-span-9 bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
          {/* Tab Header Bar */}
          <div className="flex items-center overflow-x-auto border-b border-[#E5E7EB] bg-[#F8FAFC] px-3 pt-2 scrollbar-none">
            {[
              { id: "overview",       label: "Overview",       icon: Sparkles },
              { id: "consultations",  label: "Consultations",  icon: Stethoscope },
              { id: "prescriptions",  label: "Prescriptions",  icon: Pill },
              { id: "history",        label: "Medical History",icon: Clock },
              { id: "lab",            label: "Laboratory",     icon: FlaskConical },
              { id: "investigations", label: "Investigations", icon: FileText },
              { id: "vitals",         label: "Vitals",         icon: Activity },
              { id: "documents",      label: "Documents",      icon: FileSpreadsheet },
              { id: "appointments",   label: "Appointments",   icon: CalendarCheck },
              { id: "timeline",       label: "Timeline",       icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-t border-x border-transparent shrink-0",
                    isActive
                      ? "bg-white text-[#2563EB] border-[#E5E7EB] border-b-white -mb-px font-bold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents Area */}
          <div className="p-5">

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-[#111827] uppercase tracking-wider">Latest Diagnosis & Clinical Impression</p>
                    <p className="text-sm font-bold text-[#1D4ED8]">Type 2 Diabetes Mellitus - Uncontrolled</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">
                      Elevated fasting sugar (142 mg/dL) and HbA1c 8.2%. Dosage adjusted. Follow-up lab requested in 14 days.
                    </p>
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-[#111827] uppercase tracking-wider">Active Medications Summary</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-medium text-[#111827]">
                        <span>Metformin 500mg (Twice daily)</span>
                        <span className="text-[#16A34A] font-bold">Active</span>
                      </div>
                      <div className="flex justify-between font-medium text-[#111827]">
                        <span>Telma 40mg (Once daily)</span>
                        <span className="text-[#16A34A] font-bold">Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-3 bg-white">
                  <p className="text-xs font-bold text-[#111827] uppercase tracking-wider">Recent Laboratory Results</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {mockLabResults.map((r) => (
                      <div key={r.id} className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg">
                        <p className="font-bold text-[#111827]">{r.testName}</p>
                        <p className="text-[#9CA3AF] text-[10px]">{r.completedDate}</p>
                        <p className="text-xs font-semibold text-[#2563EB] mt-1">{r.resultsSummary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONSULTATIONS */}
            {activeTab === "consultations" && (
              <div className="space-y-3 animate-fade-in">
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Date</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Doctor</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Primary Diagnosis</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Medicines</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#6B7280]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {patientPrescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-3.5 py-3 font-semibold text-[#111827]">{formatDate(rx.date)}</td>
                          <td className="px-3.5 py-3 text-[#374151]">{rx.doctorName}</td>
                          <td className="px-3.5 py-3 font-medium text-[#1D4ED8]">{rx.diagnosis[0]}</td>
                          <td className="px-3.5 py-3 text-[#374151]">{rx.drugs.length} prescribed</td>
                          <td className="px-3.5 py-3 text-right">
                            <button onClick={() => setViewingConsultation(rx)} className="px-2.5 py-1 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: PRESCRIPTIONS */}
            {activeTab === "prescriptions" && (
              <div className="space-y-3 animate-fade-in">
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Date</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Doctor</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Diagnosis</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Medicines</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#6B7280]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {patientPrescriptions.map((rx) => (
                        <tr key={rx.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-3.5 py-3 font-semibold text-[#111827]">{formatDate(rx.date)}</td>
                          <td className="px-3.5 py-3 text-[#374151]">{rx.doctorName}</td>
                          <td className="px-3.5 py-3 font-medium text-[#111827]">{rx.diagnosis[0]}</td>
                          <td className="px-3.5 py-3 text-[#374151]">{rx.drugs.map((d) => d.name).join(", ")}</td>
                          <td className="px-3.5 py-3 text-right space-x-2">
                            <button onClick={() => setViewingRx(rx)} className="px-2.5 py-1 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                              View Rx
                            </button>
                            <button onClick={() => window.print()} className="px-2.5 py-1 text-[11px] font-bold text-[#374151] bg-white border border-[#E5E7EB] rounded-lg">
                              Print
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: MEDICAL HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Longitudinal Medical History</h3>
                <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E7EB]">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">April 2022 — Patient Registered</p>
                    <p className="text-[11px] text-[#9CA3AF]">Registered at CareClinic Bhopal OPD</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">May 2024 — Surgery: Appendectomy</p>
                    <p className="text-[11px] text-[#9CA3AF]">Performed at AIIMS Bhopal, Uneventful recovery</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#D97706] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">Family History</p>
                    <p className="text-[11px] text-[#9CA3AF]">Father: Type 2 Diabetes & Coronary Artery Disease</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: LABORATORY */}
            {activeTab === "lab" && (
              <div className="space-y-3 animate-fade-in">
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Test Name</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Completed Date</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Results Summary</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#6B7280]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {mockLabResults.map((r) => (
                        <tr key={r.id} className="hover:bg-[#F8FAFC]">
                          <td className="px-3.5 py-3 font-semibold text-[#111827]">{r.testName}</td>
                          <td className="px-3.5 py-3 text-[#374151]">{r.completedDate}</td>
                          <td className="px-3.5 py-3 font-medium text-[#2563EB]">{r.resultsSummary}</td>
                          <td className="px-3.5 py-3 text-right">
                            <button onClick={() => setViewingLab(r)} className="px-2.5 py-1 text-[11px] font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg">
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: INVESTIGATIONS */}
            {activeTab === "investigations" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                {mockImaging.map((img) => (
                  <div key={img.id} className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2563EB]">{img.type}</span>
                      <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded">{img.status}</span>
                    </div>
                    <p className="text-xs font-bold text-[#111827]">{img.name}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Date: {img.date} · {img.doctor}</p>
                    <p className="text-xs text-[#6B7280] italic leading-relaxed">"{img.findings}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 7: VITALS */}
            {activeTab === "vitals" && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-[#111827]">Vitals History & Trends</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl"><p className="text-[#9CA3AF]">Blood Pressure</p><p className="font-bold text-base text-[#111827]">138/88 <span className="text-xs font-normal text-[#D97706]">↑</span></p></div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl"><p className="text-[#9CA3AF]">Pulse</p><p className="font-bold text-base text-[#111827]">82 bpm</p></div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl"><p className="text-[#9CA3AF]">Weight</p><p className="font-bold text-base text-[#111827]">68 kg</p></div>
                  <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl"><p className="text-[#9CA3AF]">BMI</p><p className="font-bold text-base text-[#D97706]">25.9 kg/m²</p></div>
                </div>
              </div>
            )}

            {/* TAB 8: DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={20} className="text-[#2563EB] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] truncate">{doc.fileName}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{doc.fileType} · {doc.size}</p>
                      </div>
                    </div>
                    <button className="text-[#2563EB] hover:text-[#1D4ED8] p-1">
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 9: APPOINTMENTS */}
            {activeTab === "appointments" && (
              <div className="space-y-3 animate-fade-in">
                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Date & Time</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Doctor</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#6B7280]">Purpose</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#6B7280]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="px-3.5 py-3 font-semibold text-[#111827]">11 Aug 2026, 10:00 AM</td>
                        <td className="px-3.5 py-3 text-[#374151]">Dr. Arjun Mehta</td>
                        <td className="px-3.5 py-3 text-[#374151]">Routine Diabetes Review</td>
                        <td className="px-3.5 py-3 text-right"><span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded">Upcoming</span></td>
                      </tr>
                      <tr className="hover:bg-[#F8FAFC]">
                        <td className="px-3.5 py-3 font-semibold text-[#111827]">10 Jul 2026, 11:30 AM</td>
                        <td className="px-3.5 py-3 text-[#374151]">Dr. Arjun Mehta</td>
                        <td className="px-3.5 py-3 text-[#374151]">General Consultation</td>
                        <td className="px-3.5 py-3 text-right"><span className="text-[10px] bg-[#F3F4F6] text-[#6B7280] font-bold px-2 py-0.5 rounded">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 10: TIMELINE */}
            {activeTab === "timeline" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Complete Patient Journey Timeline</h3>
                <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E7EB]">
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">2022 — Patient Registered</p>
                    <p className="text-[11px] text-[#9CA3AF]">Initial check-in at CareClinic Main OPD</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#16A34A] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">May 2024 — Surgery: Appendectomy</p>
                    <p className="text-[11px] text-[#9CA3AF]">Uneventful recovery</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#0EA5E9] border-2 border-white" />
                    <p className="text-xs font-bold text-[#111827]">July 2026 — Laboratory Investigation</p>
                    <p className="text-[11px] text-[#9CA3AF]">HbA1c & Lipid Profile completed</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Viewing Rx Modal */}
      {viewingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <p className="text-base font-bold text-[#111827]">Prescription #{viewingRx.id}</p>
                <p className="text-xs text-[#9CA3AF]">{formatDate(viewingRx.date)} · {viewingRx.doctorName}</p>
              </div>
              <button onClick={() => setViewingRx(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-3 text-xs">
              <p><span className="font-bold text-[#374151]">Diagnosis:</span> {viewingRx.diagnosis.join(", ")}</p>
              <div className="space-y-1">
                <p className="font-bold text-[#374151]">Prescribed Medicines:</p>
                {viewingRx.drugs.map((d, i) => (
                  <p key={d.id} className="text-[#111827] font-semibold">{i + 1}. {d.name} — {d.dosage} ({d.frequency}, {d.duration})</p>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => window.print()} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg">Print Rx</button>
              <button onClick={() => setViewingRx(null)} className="px-4 py-2 bg-white border text-[#374151] text-xs font-semibold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Lab Modal */}
      {viewingLab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <p className="text-base font-bold text-[#111827]">{viewingLab.testName}</p>
              <button onClick={() => setViewingLab(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs space-y-2">
              <p><span className="font-bold">Requested Date:</span> {viewingLab.requestedDate}</p>
              <p><span className="font-bold">Completed Date:</span> {viewingLab.completedDate}</p>
              <p><span className="font-bold text-[#2563EB]">Results:</span> {viewingLab.resultsSummary}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setViewingLab(null)} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Consultation Details Modal */}
      {viewingConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <p className="text-base font-bold text-[#111827]">Consultation Details — {formatDate(viewingConsultation.date)}</p>
              <button onClick={() => setViewingConsultation(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
            </div>
            <div className="p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl text-xs space-y-2">
              <p><span className="font-bold">Doctor:</span> {viewingConsultation.doctorName}</p>
              <p><span className="font-bold">Primary Diagnosis:</span> {viewingConsultation.diagnosis[0]}</p>
              <p><span className="font-bold">Notes:</span> {viewingConsultation.notes}</p>
              <p><span className="font-bold">Medicines:</span> {viewingConsultation.drugs.length} prescribed</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setViewingConsultation(null)} className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── STANDALONE PATIENT RECORDS PAGE (WORKFLOW 1) ─────────────────────────────

export default function StandalonePatientsPage() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");

  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialId || null);
  const [genderFilter, setGenderFilter] = useState("all");

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? null,
    [selectedPatientId]
  );

  const searchResults = useMemo(() => {
    let data = [...patients];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.mobile.includes(q) ||
          p.email.toLowerCase().includes(q)
      );
    }
    if (genderFilter !== "all") {
      data = data.filter((p) => p.gender.toLowerCase() === genderFilter);
    }
    return data;
  }, [search, genderFilter]);

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* Standalone Header / Search Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Patient Records (EMR)</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Search any registered patient in clinic database to view full longitudinal medical records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-[#E5E7EB] rounded-lg bg-white outline-none cursor-pointer"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Large Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3 border border-[#E5E7EB] rounded-xl bg-white focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#DBEAFE] transition-all shadow-sm">
            <Search size={18} className="text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, UHID (e.g. UHID-2024-0001), Phone, or Email..."
              className="flex-1 text-sm outline-none placeholder-[#9CA3AF] text-[#111827]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[#9CA3AF] hover:text-[#374151]">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {search.trim() && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-[#F3F4F6]">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#9CA3AF]">
                  No patients found matching "{search}"
                </div>
              ) : (
                searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedPatientId(p.id); setSearch(""); }}
                    className="p-3.5 hover:bg-[#F8FAFC] cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">{getInitials(p.name)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{p.name}</p>
                        <p className="text-xs text-[#9CA3AF]">{p.uhid} · {p.age}y {p.gender} · {p.mobile}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-lg">
                      Open EMR →
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* WORKFLOW 1 DISPLAY logic */}
      {selectedPatient ? (
        <PatientEMRView
          patient={selectedPatient}
          onClose={() => setSelectedPatientId(null)}
          isOverlay={false}
        />
      ) : (
        /* WORKFLOW 1 EMPTY / PROMPT STATE */
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-10 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto text-[#2563EB]">
              <Users size={40} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-lg font-bold text-[#111827]">Search Patient Database</h2>
              <p className="text-xs text-[#6B7280]">
                Search above or select any patient card below to open their complete Electronic Medical Record (EMR).
              </p>
            </div>
          </div>

          {/* Quick Selection Cards Grid */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Recently Registered / Active Patients</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {patients.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-4 cursor-pointer hover:border-[#2563EB] hover:shadow-md transition-all group space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0 text-white font-bold text-xs">
                      {getInitials(p.name)}
                    </div>
                    <CategoryBadge type={p.patientType} />
                  </div>
                  <div>
                    <p className="font-bold text-[#111827] text-sm group-hover:text-[#2563EB] transition-colors">{p.name}</p>
                    <p className="text-xs text-[#9CA3AF] font-mono">{p.uhid}</p>
                    <p className="text-xs text-[#6B7280] mt-1">{p.age}y {p.gender} · Blood: <span className="font-bold text-[#DC2626]">{p.bloodGroup}</span></p>
                  </div>
                  <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-xs text-[#2563EB] font-bold">
                    <span>View Record</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
