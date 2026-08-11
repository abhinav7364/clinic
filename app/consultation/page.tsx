"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  User, Calendar, Clock, AlertTriangle, FileText, CheckCircle2,
  ChevronRight, Stethoscope, Pill, FlaskConical, Play, RotateCcw,
  ArrowRight, Sparkles, Printer, Eye, Upload, UserPlus, Info,
  Search, Plus, Trash2, Edit2, ShieldAlert, Check, X, Building2,
  FileCheck, HelpCircle, Layers, ArrowLeft, HeartPulse, Activity,
  ChevronDown, Save, Ban, History, Paperclip, ClipboardList, CheckSquare,
  Copy, List, FileSpreadsheet, Lock, AlertCircle, Phone, ArrowUpRight
} from "lucide-react";
import { cn, getInitials, formatDate, formatTime } from "@/lib/utils";
import { todayQueue, patients, prescriptions } from "@/lib/mock-data";
import { QueueStatusBadge, PatientTypeBadge } from "@/components/ui/StatusBadge";
import { PatientEMRView } from "../patients/page";
import type { QueueEntry, Patient, PrescriptionDrug, DosageFrequency, MealInstruction } from "@/lib/types";

// ─── Extended Pharmacy Inventory Item ─────────────────────────────────────────

interface PharmacyItem {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  category: string;
  stockQty: number;
  isFavorite?: boolean;
}

const pharmacyInventory: PharmacyItem[] = [
  { id: "inv-1", brandName: "Metformin Glycomet", genericName: "Metformin Hydrochloride", strength: "500mg", dosageForm: "Tablet", manufacturer: "USV Ltd", category: "Diabetes", stockQty: 450, isFavorite: true },
  { id: "inv-2", brandName: "Glipizide", genericName: "Glipizide", strength: "5mg", dosageForm: "Tablet", manufacturer: "Cipla", category: "Diabetes", stockQty: 280, isFavorite: true },
  { id: "inv-3", brandName: "Telma", genericName: "Telmisartan", strength: "40mg", dosageForm: "Tablet", manufacturer: "Glenmark", category: "Hypertension", stockQty: 320, isFavorite: true },
  { id: "inv-4", brandName: "Augmentin 625", genericName: "Amoxicillin + Clavulanic Acid", strength: "625mg", dosageForm: "Tablet", manufacturer: "GSK", category: "Antibiotic", stockQty: 120, isFavorite: true },
  { id: "inv-5", brandName: "Pan 40", genericName: "Pantoprazole Sodium", strength: "40mg", dosageForm: "Tablet", manufacturer: "Alkem Labs", category: "Antacid", stockQty: 600, isFavorite: true },
  { id: "inv-6", brandName: "Dolo 650", genericName: "Paracetamol", strength: "650mg", dosageForm: "Tablet", manufacturer: "Micro Labs", category: "Analgesic", stockQty: 850, isFavorite: false },
  { id: "inv-7", brandName: "Atorva 20", genericName: "Atorvastatin", strength: "20mg", dosageForm: "Tablet", manufacturer: "Zydus Cadila", category: "Lipid Lowering", stockQty: 190, isFavorite: false },
  { id: "inv-8", brandName: "Amlopress 5", genericName: "Amlodipine", strength: "5mg", dosageForm: "Tablet", manufacturer: "Cipla", category: "Hypertension", stockQty: 410, isFavorite: false },
  { id: "inv-9", brandName: "Azithral 500", genericName: "Azithromycin", strength: "500mg", dosageForm: "Tablet", manufacturer: "Alembic", category: "Antibiotic", stockQty: 95, isFavorite: false },
];

interface LocalComplaint {
  id: string;
  complaint: string;
  duration: string;
  severity: string;
  notes: string;
}

// ─── PERSISTENT CONSULTATION SESSION CACHE ────────────────────────────────────

let activeSessionCache: {
  queueIndex: number;
  activeTab: string;
  vitals: {
    bpSys: string; bpDia: string; hr: string; temp: string;
    spo2: string; rr: string; weight: string; height: string; glucose: string; painScore: string; notes: string;
  };
  complaints: LocalComplaint[];
  hpiNotes: string;
  examNotes: string;
  primaryDiag: string;
  secondaryDiags: string[];
  differential: string;
  clinicalImpression: string;
  icdCode: string;
  clinicalNotes: string;
  prescribedDrugs: any[];
  rxMode: "printed" | "handwritten" | "both";
  reviewDate: string;
  reviewDays: string;
  adviceNotes: string;
  lifestyleAdvice: string[];
  dietAdvice: string[];
  exerciseAdvice: string;
  referralDept: string;
  labRequests: string[];
  hasActiveSession: boolean;
  visitTimeline: { time: string; text: string }[];
} | null = null;

function getInitialSessionState() {
  if (activeSessionCache && activeSessionCache.hasActiveSession) {
    return activeSessionCache;
  }
  const defaultEntry = todayQueue.find((q) => q.status === "in-consultation") || todayQueue[0];
  return {
    queueIndex: 0,
    activeTab: "vitals",
    vitals: {
      bpSys: "138", bpDia: "88", hr: "82", temp: "37.1",
      spo2: "97", rr: "16", weight: "68", height: "162", glucose: "142", painScore: "3", notes: "Vitals stable. Mild BP elevation.",
    },
    complaints: [
      { id: "c1", complaint: defaultEntry.chiefComplaint, duration: "3 days", severity: "Moderate", notes: "Gradual onset, aggravated in morning" },
    ],
    hpiNotes: "Patient reports 3-day history of increased thirst, mild fatigue, and morning knee joint stiffness. No acute chest pain or dyspnea.",
    examNotes: "HEENT: Clear, non-icteric.\nChest: Clear to auscultation bilaterally.\nCVS: S1 S2 normal, no murmurs.\nAbdomen: Soft, non-tender, no organomegaly.\nExtremities: Mild bilateral pedal edema (-).",
    primaryDiag: "Type 2 Diabetes Mellitus - Uncontrolled",
    secondaryDiags: ["Essential Hypertension", "Mild Hyperlipidemia"],
    differential: "Diabetic Nephropathy Stage 1 (rule out)",
    clinicalImpression: "Patient shows elevated HbA1c symptoms. Requires strict glycemic control and medication adjustment.",
    icdCode: "E11.9 — Type 2 Diabetes Mellitus without complications",
    clinicalNotes: `SUBJECTIVE:\nPatient presents with 3-day history of fatigue, polydipsia, and mild morning blurred vision.\n\nOBJECTIVE:\n- BP: 138/88 mmHg, HR: 82 bpm, Temp: 37.1°C, Blood Glucose: 142 mg/dL.\n- Chest clear, CVS normal.\n\nASSESSMENT & PLAN:\n- Adjust Metformin dosage.\n- Request HbA1c & Lipid Profile lab tests.\n- Dietary & lifestyle counseling.`,
    prescribedDrugs: [
      { id: "rx-1", name: "Metformin Glycomet 500mg", dosage: "500mg", frequency: "Twice daily", duration: "30 days", mealInstruction: "After meals", instructions: "Take after food with water", route: "Oral", category: "Diabetes", quantity: "60 Tabs", stockQty: 450 },
      { id: "rx-2", name: "Glipizide 5mg", dosage: "5mg", frequency: "Once daily", duration: "30 days", mealInstruction: "Before meals", instructions: "Take 30 mins before breakfast", route: "Oral", category: "Diabetes", quantity: "30 Tabs", stockQty: 280 },
      { id: "rx-3", name: "Telma 40mg", dosage: "40mg", frequency: "Once daily", duration: "30 days", mealInstruction: "After meals", instructions: "Morning dose", route: "Oral", category: "Hypertension", quantity: "30 Tabs", stockQty: 320 },
    ],
    rxMode: "printed" as const,
    reviewDate: "2026-08-10",
    reviewDays: "14",
    adviceNotes: "Drink plenty of water (2.5L daily). Monitor blood sugar levels every morning before breakfast.",
    lifestyleAdvice: ["Low sodium diet (<2g/day)", "30 mins daily brisk walk", "Avoid refined sugars"],
    dietAdvice: ["High fiber foods", "Low glycemic index carbohydrates", "Small frequent meals"],
    exerciseAdvice: "30 minutes moderate aerobic walking 5 days a week.",
    referralDept: "None",
    labRequests: ["HbA1c & Glycemic Profile", "Lipid Profile", "Renal Function Test (KFT)"],
    hasActiveSession: true,
    visitTimeline: [
      { time: "09:00 AM", text: "Consultation Started" },
      { time: "09:05 AM", text: "Vitals Recorded (BP: 138/88, Sugar: 142)" },
      { time: "09:12 AM", text: "Chief Complaints & HPI Entered" },
      { time: "09:25 AM", text: "Prescription Builder Updated (3 Drugs)" },
    ],
  };
}

// ─── MAIN CONSULTATION WORKSPACE COMPONENT ────────────────────────────────────

export default function ConsultationPage() {
  const [hasActiveSession, setHasActiveSession] = useState<boolean>(
    activeSessionCache ? activeSessionCache.hasActiveSession : true
  );

  // Queue Patient Entry State
  const [queueIndex, setQueueIndex] = useState(() => activeSessionCache?.queueIndex ?? 0);
  const activeEntries = useMemo(
    () => todayQueue.filter((q) => q.status === "in-consultation" || q.status === "waiting"),
    []
  );
  const currentEntry: QueueEntry = activeEntries[queueIndex] ?? todayQueue[0];
  const p: Patient = currentEntry.patient;

  // Consultation Active Timer Ticking
  const [timerSeconds, setTimerSeconds] = useState(522); // 08:42
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Center Panel Segmented Tabs State
  type TabType = "vitals" | "complaints" | "diagnosis" | "notes" | "prescription" | "followup" | "timeline";
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (activeSessionCache?.activeTab as TabType) ?? "vitals"
  );

  // Vitals State
  const [vitals, setVitals] = useState(() => activeSessionCache?.vitals ?? getInitialSessionState().vitals);
  const bmi = vitals.weight && vitals.height
    ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1)
    : "—";

  // Complaints & HPI & Examination
  const [complaints, setComplaints] = useState<LocalComplaint[]>(() => activeSessionCache?.complaints ?? getInitialSessionState().complaints);
  const [hpiNotes, setHpiNotes] = useState(() => activeSessionCache?.hpiNotes ?? getInitialSessionState().hpiNotes);
  const [examNotes, setExamNotes] = useState(() => activeSessionCache?.examNotes ?? getInitialSessionState().examNotes);

  // Diagnosis State
  const [primaryDiag, setPrimaryDiag] = useState(() => activeSessionCache?.primaryDiag ?? getInitialSessionState().primaryDiag);
  const [secondaryDiags, setSecondaryDiags] = useState<string[]>(() => activeSessionCache?.secondaryDiags ?? getInitialSessionState().secondaryDiags);
  const [newDiagInput, setNewDiagInput] = useState("");
  const [differential, setDifferential] = useState(() => activeSessionCache?.differential ?? getInitialSessionState().differential);
  const [clinicalImpression, setClinicalImpression] = useState(() => activeSessionCache?.clinicalImpression ?? getInitialSessionState().clinicalImpression);
  const [icdCode, setIcdCode] = useState(() => activeSessionCache?.icdCode ?? getInitialSessionState().icdCode);

  // Clinical Notes & Labs
  const [clinicalNotes, setClinicalNotes] = useState(() => activeSessionCache?.clinicalNotes ?? getInitialSessionState().clinicalNotes);
  const [labRequests, setLabRequests] = useState<string[]>(() => activeSessionCache?.labRequests ?? getInitialSessionState().labRequests);

  // Prescription State
  const [prescribedDrugs, setPrescribedDrugs] = useState<any[]>(() => activeSessionCache?.prescribedDrugs ?? getInitialSessionState().prescribedDrugs);
  const [rxMode, setRxMode] = useState<"printed" | "handwritten" | "both">(
    () => (activeSessionCache?.rxMode as any) ?? "printed"
  );
  const [drugSearch, setDrugSearch] = useState("");
  const [selectedInventoryMed, setSelectedInventoryMed] = useState<PharmacyItem | null>(null);

  // Medicine Entry Card Drawer/Card state
  const [medEntryCard, setMedEntryCard] = useState<{
    med: PharmacyItem | null;
    dose: string;
    frequency: DosageFrequency;
    duration: string;
    route: string;
    mealInstruction: MealInstruction;
    instructions: string;
    quantity: string;
    specialNotes: string;
  } | null>(null);

  // Follow-up State
  const [reviewDate, setReviewDate] = useState(() => activeSessionCache?.reviewDate ?? getInitialSessionState().reviewDate);
  const [reviewDays, setReviewDays] = useState(() => activeSessionCache?.reviewDays ?? getInitialSessionState().reviewDays);
  const [adviceNotes, setAdviceNotes] = useState(() => activeSessionCache?.adviceNotes ?? getInitialSessionState().adviceNotes);
  const [lifestyleAdvice, setLifestyleAdvice] = useState<string[]>(() => activeSessionCache?.lifestyleAdvice ?? getInitialSessionState().lifestyleAdvice);
  const [dietAdvice, setDietAdvice] = useState<string[]>(() => activeSessionCache?.dietAdvice ?? getInitialSessionState().dietAdvice);
  const [exerciseAdvice, setExerciseAdvice] = useState(() => activeSessionCache?.exerciseAdvice ?? getInitialSessionState().exerciseAdvice);
  const [referralDept, setReferralDept] = useState(() => activeSessionCache?.referralDept ?? getInitialSessionState().referralDept);

  // Timeline State
  const [visitTimeline, setVisitTimeline] = useState(() => activeSessionCache?.visitTimeline ?? getInitialSessionState().visitTimeline);

  // Modal Dialogs State
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishOutcome, setFinishOutcome] = useState<"complete" | "return">("complete");
  const [returnReason, setReturnReason] = useState("Laboratory Test (HbA1c & Lipid Profile)");
  const [returnTime, setReturnTime] = useState("30 mins");
  const [selectedRxTypeChoice, setSelectedRxTypeChoice] = useState<"printed" | "handwritten" | "both">("printed");

  const [isCompleted, setIsCompleted] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<any>(null);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [showEMROverlay, setShowEMROverlay] = useState(false);
  const [showPaperPreview, setShowPaperPreview] = useState(false);
  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Auto-Save State Cache
  useEffect(() => {
    activeSessionCache = {
      queueIndex,
      activeTab,
      vitals,
      complaints,
      hpiNotes,
      examNotes,
      primaryDiag,
      secondaryDiags,
      differential,
      clinicalImpression,
      icdCode,
      clinicalNotes,
      prescribedDrugs,
      rxMode,
      reviewDate,
      reviewDays,
      adviceNotes,
      lifestyleAdvice,
      dietAdvice,
      exerciseAdvice,
      referralDept,
      labRequests,
      hasActiveSession,
      visitTimeline,
    };
  }, [
    queueIndex, activeTab, vitals, complaints, hpiNotes, examNotes,
    primaryDiag, secondaryDiags, differential, clinicalImpression, icdCode, clinicalNotes, prescribedDrugs, rxMode,
    reviewDate, reviewDays, adviceNotes, lifestyleAdvice, dietAdvice, exerciseAdvice, referralDept, labRequests, hasActiveSession, visitTimeline
  ]);

  // Inventory Search Filter (Favorites top)
  const searchResults = useMemo(() => {
    let list = [...pharmacyInventory];
    if (drugSearch.trim()) {
      const q = drugSearch.toLowerCase();
      list = list.filter(
        (m) =>
          m.brandName.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
  }, [drugSearch]);

  const handleOpenMedEntryCard = (med: PharmacyItem) => {
    setMedEntryCard({
      med,
      dose: med.strength,
      frequency: "Twice daily",
      duration: "30 days",
      route: "Oral",
      mealInstruction: "After meals",
      instructions: "Take with water after meals",
      quantity: "60 Tabs",
      specialNotes: "",
    });
    setDrugSearch("");
  };

  const handleSaveMedEntry = () => {
    if (medEntryCard && medEntryCard.med) {
      const newDrug = {
        id: `rx-${Date.now()}`,
        name: `${medEntryCard.med.brandName} ${medEntryCard.med.strength}`,
        genericName: medEntryCard.med.genericName,
        dosage: medEntryCard.dose,
        frequency: medEntryCard.frequency,
        duration: medEntryCard.duration,
        route: medEntryCard.route,
        mealInstruction: medEntryCard.mealInstruction,
        instructions: medEntryCard.instructions,
        quantity: medEntryCard.quantity,
        category: medEntryCard.med.category,
        stockQty: medEntryCard.med.stockQty,
      };
      setPrescribedDrugs([...prescribedDrugs, newDrug]);
      setMedEntryCard(null);
    }
  };

  const handleRemoveDrug = (id: string) => {
    setPrescribedDrugs(prescribedDrugs.filter((d) => d.id !== id));
  };

  const handleSaveDraft = () => {
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 2500);
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    setCompletedSummary({
      patientName: p.name,
      uhid: p.uhid,
      token: currentEntry.token,
      outcome: finishOutcome,
      primaryDiag,
      drugsCount: prescribedDrugs.length,
      rxType: selectedRxTypeChoice,
      returnReason,
      reviewDate,
    });
    setIsCompleted(true);
    activeSessionCache = null;
  };

  const handleCallNextPatient = () => {
    setIsCallingNext(true);
    setTimeout(() => {
      setIsCallingNext(false);
      setIsCompleted(false);
      const nextIdx = (queueIndex + 1) % activeEntries.length;
      setQueueIndex(nextIdx);
      setActiveTab("vitals");
      setHasActiveSession(true);
    }, 1200);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // NO ACTIVE CONSULTATION EMPTY STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (!hasActiveSession || activeEntries.length === 0) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-lg max-w-md w-full p-8 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto shadow-inner">
            <Stethoscope size={40} strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#111827]">No Active Consultation</h2>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Start a consultation by selecting a patient from Today's Queue.
            </p>
          </div>

          <Link
            href="/queue"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-md shadow-[#2563EB]/20"
          >
            <Play size={15} /> Go to Today's Queue
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // COMPLETION SCREEN OVERLAY
  // ─────────────────────────────────────────────────────────────────────────────
  if (isCompleted && completedSummary) {
    const hasMorePatients = activeEntries.length > 1;
    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-xl max-w-lg w-full p-8 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto text-[#16A34A]">
            <CheckCircle2 size={36} strokeWidth={2.5} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full">
              {completedSummary.outcome === "complete" ? "Consultation Completed Successfully" : "Consultation Saved (Returning Today)"}
            </span>
            <h2 className="text-2xl font-bold text-[#111827] mt-3">
              {completedSummary.patientName}
            </h2>
            <p className="text-sm font-mono text-[#6B7280] mt-0.5">{completedSummary.uhid} · Token #{completedSummary.token}</p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[#6B7280]">Primary Diagnosis</span>
              <span className="font-bold text-[#111827]">{completedSummary.primaryDiag}</span>
            </div>
            <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
              <span className="text-[#6B7280]">Prescription Format</span>
              <span className="font-bold text-[#2563EB] uppercase">{completedSummary.rxType} ({completedSummary.drugsCount} drugs)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Follow-up Date</span>
              <span className="font-bold text-[#16A34A]">{completedSummary.reviewDate ? formatDate(completedSummary.reviewDate) : "As needed"}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 py-3 text-xs font-bold text-[#374151] bg-white border border-[#E5E7EB] rounded-xl hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
            >
              Return to Dashboard
            </Link>

            {hasMorePatients ? (
              <button
                onClick={handleCallNextPatient}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#2563EB] rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-md shadow-[#2563EB]/20"
              >
                <Play size={15} /> Call Next Patient
              </button>
            ) : (
              <Link
                href="/queue"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#16A34A] rounded-xl hover:bg-[#15803D] transition-colors"
              >
                Go to Today's Queue
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CALLING NEXT PATIENT TRANSITION
  // ─────────────────────────────────────────────────────────────────────────────
  if (isCallingNext) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
            <Stethoscope size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Calling Next Patient...</h2>
          <p className="text-xs text-[#6B7280]">Loading EMR context &amp; patient records</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FULL 3-PANEL CONSULTATION WORKSPACE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in pb-16">

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. STICKY HEADER                                                         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border border-[#E5E7EB] rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Header info & Breadcrumb */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
            <span className="text-base font-bold text-white">{getInitials(p.name)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#9CA3AF] font-medium">Dashboard &gt; Queue &gt;</span>
              <h1 className="text-base font-bold text-[#111827]">{p.name}</h1>
              <PatientTypeBadge type={currentEntry.patientType} />
              <span className="text-xs font-mono font-bold bg-[#F3F4F6] text-[#374151] px-2 py-0.5 rounded">
                Token #{currentEntry.token}
              </span>
              <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" /> In Consultation
              </span>
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {p.uhid} · {p.age} yrs · {p.gender} · Blood: <span className="font-bold text-[#111827]">{p.bloodGroup}</span> · Time: <span className="font-mono font-bold text-[#2563EB]">{formatTimer(timerSeconds)}</span>
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {draftSavedToast && (
            <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-lg animate-fade-in flex items-center gap-1">
              <CheckCircle2 size={13} /> Draft Saved
            </span>
          )}
          <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-xl hover:bg-[#F8FAFC]">
            <Save size={14} /> Save Draft
          </button>
          <button onClick={() => setShowEMROverlay(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] text-xs font-bold rounded-xl hover:bg-[#DBEAFE]">
            <FileText size={14} /> View Full Medical Record
          </button>
          <button onClick={() => { setFinishOutcome("complete"); setShowFinishModal(true); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-xl hover:bg-[#15803D] shadow-sm">
            <CheckCircle2 size={14} /> Finish Consultation
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. 3-PANEL PERSISTENT WORKSPACE LAYOUT                                   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* LEFT PANEL — PATIENT CONTEXT (3 cols)                              */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Patient Summary Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-3">
              <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xl shrink-0">
                {getInitials(p.name)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#111827]">{p.name}</h2>
                <p className="text-xs font-mono text-[#2563EB] font-semibold">{p.uhid}</p>
                <p className="text-[11px] text-[#6B7280]">{p.age}y · {p.gender} · {p.bloodGroup} · DOB: {p.dob}</p>
              </div>
            </div>

            {/* Vitals Badges Summary */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E5E7EB]">
              <div><p className="text-[10px] text-[#9CA3AF]">Height</p><p className="font-bold text-[#111827]">{vitals.height} cm</p></div>
              <div><p className="text-[10px] text-[#9CA3AF]">Weight</p><p className="font-bold text-[#111827]">{vitals.weight} kg</p></div>
              <div><p className="text-[10px] text-[#9CA3AF]">BMI</p><p className="font-bold text-[#2563EB]">{bmi}</p></div>
            </div>

            {/* Pinned Clinical Alerts Bar */}
            <div className="space-y-2 text-xs">
              <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={12} /> Pinned Clinical Alerts
              </p>
              <div className="flex flex-wrap gap-1">
                {p.allergies.length > 0 ? (
                  p.allergies.map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5] text-[10px] font-bold rounded">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-[#9CA3AF] italic">No known allergies</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {p.chronicConditions.map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] text-[10px] font-semibold rounded">
                    {c}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[10px] font-semibold rounded">
                  High Risk Patient
                </span>
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#F3F4F6]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Current Medications</p>
              <p className="font-semibold text-[#111827]">Metformin 500mg (BD) · Telma 40mg (OD)</p>
            </div>

            {/* Vitals History Trend Card */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#F3F4F6]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Vitals History Trend</p>
              <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] space-y-1 text-[11px]">
                <div className="flex justify-between"><span className="text-[#6B7280]">Blood Pressure</span><span className="font-bold text-[#111827]">138/88 <span className="text-[#9CA3AF] font-normal">(prev 142/90)</span></span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Blood Glucose</span><span className="font-bold text-[#D97706]">142 mg/dL <span className="text-[#9CA3AF] font-normal">(prev 158)</span></span></div>
                <div className="flex justify-between"><span className="text-[#6B7280]">Weight</span><span className="font-bold text-[#111827]">68 kg <span className="text-[#9CA3AF] font-normal">(prev 69.5)</span></span></div>
              </div>
            </div>

            {/* Investigation History Summary */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#F3F4F6]">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Investigation History</p>
              <div className="p-2 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] space-y-1 text-[11px]">
                <p className="font-bold text-[#16A34A]">HbA1c &amp; Lipid Profile (Ready)</p>
                <p className="text-[#6B7280]">Chest X-Ray PA: Clear bilaterally</p>
              </div>
            </div>

            {/* View Full Medical Record Button */}
            <button
              onClick={() => setShowEMROverlay(true)}
              className="w-full py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <FileText size={14} /> View Full Medical Record
            </button>
          </div>

          {/* Today's Consultation Timeline Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-sm text-xs">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Today's Consultation Timeline</p>
            <div className="relative pl-5 space-y-3 border-l-2 border-[#E5E7EB]">
              {visitTimeline.map((vt, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-[#2563EB] border-2 border-white" />
                  <p className="font-bold text-[#111827]">{vt.text}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{vt.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* CENTER PANEL — CONSULTATION WORKSPACE (6 cols)                     */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-6 space-y-4">

          {/* Segmented Workspace Navigation Tabs */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-2 shadow-sm flex items-center gap-1 overflow-x-auto">
            {[
              { id: "vitals",     label: "Vitals" },
              { id: "complaints", label: "Chief Complaints" },
              { id: "diagnosis",  label: "Diagnosis" },
              { id: "notes",      label: "Clinical Notes" },
              { id: "prescription",label:"Prescription Builder" },
              { id: "followup",   label: "Follow-up & Advice" },
              { id: "timeline",   label: "Visit Timeline" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id as TabType)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap",
                  activeTab === s.id
                    ? "bg-[#2563EB] text-white font-bold"
                    : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ── TAB 1: VITALS ENTRY ────────────────────────────────────────── */}
          {activeTab === "vitals" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Vitals Entry</h3>
                <span className="text-[11px] text-[#9CA3AF]">BMI: <strong className="text-[#2563EB]">{bmi} kg/m²</strong></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">BP Systolic (mmHg)</label>
                  <input type="text" value={vitals.bpSys} onChange={(e) => setVitals({...vitals, bpSys: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 142</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">BP Diastolic (mmHg)</label>
                  <input type="text" value={vitals.bpDia} onChange={(e) => setVitals({...vitals, bpDia: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 90</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">Pulse Rate (bpm)</label>
                  <input type="text" value={vitals.hr} onChange={(e) => setVitals({...vitals, hr: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 80</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">Temp (°C)</label>
                  <input type="text" value={vitals.temp} onChange={(e) => setVitals({...vitals, temp: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 36.8</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">SpO₂ (%)</label>
                  <input type="text" value={vitals.spo2} onChange={(e) => setVitals({...vitals, spo2: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#16A34A]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 98</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">Blood Sugar (mg/dL)</label>
                  <input type="text" value={vitals.glucose} onChange={(e) => setVitals({...vitals, glucose: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#D97706]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 158</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">Weight (kg)</label>
                  <input type="text" value={vitals.weight} onChange={(e) => setVitals({...vitals, weight: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 69.5</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[#9CA3AF] font-medium">Height (cm)</label>
                  <input type="text" value={vitals.height} onChange={(e) => setVitals({...vitals, height: e.target.value})} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#111827]" />
                  <p className="text-[10px] text-[#9CA3AF]">Prev: 162</p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: CHIEF COMPLAINTS & HPI & EXAM ──────────────────────── */}
          {activeTab === "complaints" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#F3F4F6] pb-2">
                Chief Complaints &amp; History of Present Illness (HPI)
              </h3>
              <div className="space-y-3 text-xs">
                {complaints.map((c) => (
                  <div key={c.id} className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#111827]">{c.complaint}</p>
                      <p className="text-[#9CA3AF] text-[11px]">Duration: {c.duration} · Severity: {c.severity}</p>
                    </div>
                  </div>
                ))}
                <div className="space-y-1 pt-2">
                  <label className="font-semibold text-[#374151]">History of Present Illness (HPI)</label>
                  <textarea rows={3} value={hpiNotes} onChange={(e) => setHpiNotes(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none resize-none text-xs" />
                </div>
                <div className="space-y-1 pt-2">
                  <label className="font-semibold text-[#374151]">Physical Examination Findings</label>
                  <textarea rows={3} value={examNotes} onChange={(e) => setExamNotes(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none resize-none font-mono text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: DIAGNOSIS ENTRY ────────────────────────────────────── */}
          {activeTab === "diagnosis" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#F3F4F6] pb-2">
                Diagnosis Entry &amp; ICD Coding
              </h3>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Primary Diagnosis</label>
                  <input type="text" value={primaryDiag} onChange={(e) => setPrimaryDiag(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">ICD-10 Code Classification</label>
                  <input type="text" value={icdCode} onChange={(e) => setIcdCode(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-mono font-bold text-[#374151]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#374151]">Secondary Diagnoses</label>
                  <div className="flex gap-2">
                    <input type="text" value={newDiagInput} onChange={(e) => setNewDiagInput(e.target.value)} placeholder="Add secondary diagnosis..." className="flex-1 px-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none" />
                    <button onClick={() => { if (newDiagInput.trim()) { setSecondaryDiags([...secondaryDiags, newDiagInput.trim()]); setNewDiagInput(""); }}} className="px-3 py-1.5 bg-[#2563EB] text-white font-bold rounded-lg">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {secondaryDiags.map((sd) => (
                      <span key={sd} className="px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-lg font-semibold flex items-center gap-1">
                        {sd}
                        <button onClick={() => setSecondaryDiags(secondaryDiags.filter((x) => x !== sd))}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: CLINICAL NOTES ─────────────────────────────────────── */}
          {activeTab === "notes" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#F3F4F6] pb-2">
                Clinical Consultation Notes (SOAP Format)
              </h3>
              <textarea rows={8} value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Document examination findings, assessment and plan..." className="w-full px-3.5 py-3 border border-[#E5E7EB] rounded-xl outline-none font-mono text-xs text-[#111827] resize-none leading-relaxed" />
            </div>
          )}

          {/* ── TAB 5: PRESCRIPTION BUILDER ───────────────────────────────── */}
          {activeTab === "prescription" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Prescription Builder</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setRxMode("printed")} className={cn("px-2.5 py-1 text-[11px] font-bold rounded", rxMode === "printed" ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280]")}>Printed</button>
                  <button onClick={() => setRxMode("handwritten")} className={cn("px-2.5 py-1 text-[11px] font-bold rounded", rxMode === "handwritten" ? "bg-[#2563EB] text-white" : "bg-[#F3F4F6] text-[#6B7280]")}>Handwritten</button>
                </div>
              </div>

              {/* Medicine Search Bar */}
              <div className="relative space-y-2">
                <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">Search Pharmacy Inventory (Favorites First)</p>
                <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-xl bg-white focus-within:border-[#2563EB]">
                  <Search size={15} className="text-[#9CA3AF]" />
                  <input type="text" value={drugSearch} onChange={(e) => setDrugSearch(e.target.value)} placeholder="Search by Brand Name, Generic Name, or Category..." className="flex-1 text-xs outline-none" />
                </div>
                {drugSearch.trim() && (
                  <div className="absolute top-16 left-0 right-0 z-20 bg-white border border-[#E5E7EB] rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-[#F3F4F6]">
                    {searchResults.map((med) => (
                      <div key={med.id} onClick={() => handleOpenMedEntryCard(med)} className="p-3 hover:bg-[#EFF6FF] cursor-pointer text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#111827]">{med.brandName} ({med.strength})</span>
                            {med.isFavorite && <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] font-bold px-1.5 py-0.2 rounded">★ Favorite</span>}
                          </div>
                          <p className="text-[10px] text-[#9CA3AF]">{med.genericName} · {med.dosageForm} · Stock: {med.stockQty}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#2563EB]">Configure +</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Medicine Entry Card Modal */}
              {medEntryCard && (
                <div className="p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl space-y-3 text-xs animate-fade-in">
                  <div className="flex items-center justify-between border-b border-[#BFDBFE] pb-2">
                    <p className="font-bold text-[#1D4ED8]">Configure Medication — {medEntryCard.med?.brandName}</p>
                    <button onClick={() => setMedEntryCard(null)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-[#6B7280]">Dose</label>
                      <input type="text" value={medEntryCard.dose} onChange={(e) => setMedEntryCard({...medEntryCard, dose: e.target.value})} className="w-full px-2 py-1 border rounded bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B7280]">Frequency</label>
                      <select value={medEntryCard.frequency} onChange={(e) => setMedEntryCard({...medEntryCard, frequency: e.target.value as any})} className="w-full px-2 py-1 border rounded bg-white">
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Thrice daily">Thrice daily</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B7280]">Duration</label>
                      <input type="text" value={medEntryCard.duration} onChange={(e) => setMedEntryCard({...medEntryCard, duration: e.target.value})} className="w-full px-2 py-1 border rounded bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6B7280]">Meal Timing</label>
                      <select value={medEntryCard.mealInstruction} onChange={(e) => setMedEntryCard({...medEntryCard, mealInstruction: e.target.value as any})} className="w-full px-2 py-1 border rounded bg-white">
                        <option value="After meals">After meals</option>
                        <option value="Before meals">Before meals</option>
                        <option value="Empty stomach">Empty stomach</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setMedEntryCard(null)} className="px-3 py-1 bg-white border text-[#374151] rounded font-semibold">Cancel</button>
                    <button onClick={handleSaveMedEntry} className="px-4 py-1 bg-[#2563EB] text-white rounded font-bold">Save Medicine</button>
                  </div>
                </div>
              )}

              {/* Current Prescription Table */}
              <div className="border border-[#E5E7EB] rounded-xl overflow-hidden text-xs">
                <table className="w-full">
                  <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Medicine</th>
                      <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Frequency</th>
                      <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Duration</th>
                      <th className="px-3 py-2 text-left font-bold text-[#6B7280]">Food Timing</th>
                      <th className="px-3 py-2 text-right font-bold text-[#6B7280]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {prescribedDrugs.map((d) => (
                      <tr key={d.id}>
                        <td className="px-3 py-2.5 font-bold text-[#111827]">{d.name}</td>
                        <td className="px-3 py-2.5 text-[#374151]">{d.frequency}</td>
                        <td className="px-3 py-2.5 text-[#374151]">{d.duration}</td>
                        <td className="px-3 py-2.5 font-semibold text-[#1D4ED8]">{d.mealInstruction}</td>
                        <td className="px-3 py-2.5 text-right">
                          <button onClick={() => handleRemoveDrug(d.id)} className="text-[#9CA3AF] hover:text-[#DC2626]"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 6: FOLLOW-UP ADVICE ───────────────────────────────────── */}
          {activeTab === "followup" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in text-xs">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#F3F4F6] pb-2">
                Follow-up &amp; Advice
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#374151]">Review Follow-up Date</label>
                  <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-bold text-[#2563EB]" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#374151]">General Advice &amp; Instructions</label>
                  <textarea rows={2} value={adviceNotes} onChange={(e) => setAdviceNotes(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#374151]">Exercise &amp; Lifestyle Advice</label>
                  <input type="text" value={exerciseAdvice} onChange={(e) => setExerciseAdvice(e.target.value)} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 7: TIMELINE ───────────────────────────────────────────── */}
          {activeTab === "timeline" && (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in text-xs">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider border-b border-[#F3F4F6] pb-2">
                Chronological Visit Timeline
              </h3>
              <div className="relative pl-6 space-y-4 border-l-2 border-[#E5E7EB]">
                {visitTimeline.map((vt, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white" />
                    <p className="font-bold text-[#111827]">{vt.text}</p>
                    <p className="text-[10px] text-[#9CA3AF]">{vt.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ────────────────────────────────────────────────────────────────── */}
        {/* RIGHT PANEL — ACTIONS & HISTORY SUMMARY (3 cols)                  */}
        {/* ────────────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Consultation Section */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-sm text-xs">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Consultation</p>
            <div className="space-y-1.5">
              <button onClick={handleSaveDraft} className="w-full py-2 bg-white border border-[#E5E7EB] text-[#374151] font-semibold rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5">
                <Save size={14} /> Save Draft
              </button>
              <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] px-1">
                <span>Auto Save Status</span>
                <span className="font-semibold text-[#16A34A]">Saved 5s ago</span>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-sm text-xs">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Prescription</p>
            <div className="space-y-1.5">
              <button onClick={() => window.print()} className="w-full py-2 bg-white border border-[#E5E7EB] text-[#374151] font-semibold rounded-lg hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5">
                <Printer size={14} /> Print Prescription
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-2 shadow-sm text-xs">
            <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Quick Actions</p>
            <button onClick={() => setShowEMROverlay(true)} className="w-full text-left p-2 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] font-bold flex items-center justify-between hover:bg-[#DBEAFE]">
              <span>View Patient Record</span>
              <FileText size={13} />
            </button>
          </div>

          {/* Fixed Primary Action Button (Bottom Sticky) */}
          <div className="pt-2">
            <button
              onClick={() => { setFinishOutcome("complete"); setShowFinishModal(true); }}
              className="w-full py-3 bg-[#16A34A] text-white font-bold text-xs rounded-xl hover:bg-[#15803D] transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Finish Consultation
            </button>
          </div>

        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* FINISH CONSULTATION DIALOG MODAL                                         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">
                {finishOutcome === "complete" ? "Finish Consultation" : "Send for Lab / Return Patient"}
              </h3>
              <button onClick={() => setShowFinishModal(false)} className="text-[#9CA3AF] hover:text-[#374151]"><X size={16} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-bold text-[#374151]">Section 1: Prescription Mode</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setSelectedRxTypeChoice("printed")} className={cn("py-2 px-2 border rounded-lg font-bold text-center text-[11px]", selectedRxTypeChoice === "printed" ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}>Printed</button>
                <button onClick={() => setSelectedRxTypeChoice("handwritten")} className={cn("py-2 px-2 border rounded-lg font-bold text-center text-[11px]", selectedRxTypeChoice === "handwritten" ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}>Handwritten</button>
                <button onClick={() => setSelectedRxTypeChoice("both")} className={cn("py-2 px-2 border rounded-lg font-bold text-center text-[11px]", selectedRxTypeChoice === "both" ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}>Both</button>
              </div>

              <p className="font-bold text-[#374151] pt-2 border-t border-[#F3F4F6]">Section 2: Visit Outcome</p>
              <div className="flex gap-2">
                <button onClick={() => setFinishOutcome("complete")} className={cn("flex-1 py-2 border rounded-lg font-bold text-center", finishOutcome === "complete" ? "bg-[#DCFCE7] border-[#16A34A] text-[#15803D]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}>Complete</button>
                <button onClick={() => setFinishOutcome("return")} className={cn("flex-1 py-2 border rounded-lg font-bold text-center", finishOutcome === "return" ? "bg-[#FEF3C7] border-[#D97706] text-[#B45309]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}>Return Today</button>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl space-y-1">
                <p><span className="font-bold">Diagnosis:</span> {primaryDiag}</p>
                <p><span className="font-bold">Medicines:</span> {prescribedDrugs.length} prescribed ({selectedRxTypeChoice})</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowFinishModal(false)} className="flex-1 py-2.5 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-xl">Cancel</button>
              <button onClick={handleConfirmFinish} className="flex-1 py-2.5 bg-[#16A34A] text-white text-xs font-bold rounded-xl hover:bg-[#15803D]">Finish Consultation</button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* EMR OVERLAY DRAWER                                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showEMROverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#F8FAFC] w-full max-w-6xl h-full shadow-2xl overflow-y-auto p-6 space-y-4 border-l border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 sticky top-0 bg-[#F8FAFC] z-20 py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-xs">{getInitials(p.name)}</div>
                <div>
                  <h2 className="text-base font-bold text-[#111827]">Full Medical Record (EMR) — {p.name}</h2>
                  <p className="text-xs font-mono text-[#6B7280]">{p.uhid} · Active Consultation State Preserved</p>
                </div>
              </div>
              <button onClick={() => setShowEMROverlay(false)} className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8]">
                <X size={16} /> Close &amp; Return to Consultation
              </button>
            </div>
            <PatientEMRView patient={p} onClose={() => setShowEMROverlay(false)} isOverlay={true} />
          </div>
        </div>
      )}

    </div>
  );
}
