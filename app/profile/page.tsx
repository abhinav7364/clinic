"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  User, Mail, Phone, Building2, Award, BookOpen,
  Hash, Clock, Edit2, Save, Camera, ShieldCheck,
  Pill, Activity, Users, CheckCircle2, Search, Plus,
  Trash2, FlaskConical, X, Check, Lock, Key, Shield
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { currentDoctor } from "@/lib/mock-data";

// ─── Favorite Medicine Interface ─────────────────────────────────────────────

interface FavoriteMed {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  category: string;
  stockQty: number;
}

const initialFavMeds: FavoriteMed[] = [
  { id: "fav-1", name: "Metformin Glycomet", genericName: "Metformin Hydrochloride", strength: "500mg", category: "Diabetes", stockQty: 450 },
  { id: "fav-2", name: "Augmentin 625", genericName: "Amoxicillin + Clavulanic Acid", strength: "625mg", category: "Antibiotic", stockQty: 120 },
  { id: "fav-3", name: "Pan 40", genericName: "Pantoprazole Sodium", strength: "40mg", category: "Antacid", stockQty: 600 },
  { id: "fav-4", name: "Dolo 650", genericName: "Paracetamol", strength: "650mg", category: "Analgesic", stockQty: 18 },
  { id: "fav-5", name: "Telma 40", genericName: "Telmisartan", strength: "40mg", category: "Hypertension", stockQty: 320 },
];

const pharmacyInventoryOptions = [
  { name: "Azithral 500", genericName: "Azithromycin", strength: "500mg", category: "Antibiotic", stockQty: 90 },
  { name: "Montair LC", genericName: "Montelukast + Levocetirizine", strength: "10mg/5mg", category: "Respiratory", stockQty: 210 },
  { name: "Asthalin Inhaler", genericName: "Salbutamol Sulfate", strength: "100mcg", category: "Asthma", stockQty: 45 },
  { name: "Rosuvas 10", genericName: "Rosuvastatin", strength: "10mg", category: "Lipid Lowering", stockQty: 180 },
];

// ─── MAIN MY PROFILE PAGE COMPONENT ──────────────────────────────────────────

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Profile Information State
  const [profile, setProfile] = useState({
    fullName: currentDoctor.name,
    gender: "Male",
    dob: "1984-06-15",
    phone: currentDoctor.mobile,
    email: currentDoctor.email,
    address: "102, Doctor Enclave, Civil Lines, Bhopal, MP",
    emergencyContact: "+91 98112 34567",
    registrationNumber: currentDoctor.registrationNumber,
    medicalCouncil: "Medical Council of India / NMC",
    qualifications: currentDoctor.qualification,
    specialization: currentDoctor.specialization,
    department: "Internal Medicine & OPD",
    experience: currentDoctor.experience,
    clinic: currentDoctor.clinic,
    bio: "Senior consultant family physician with over 12 years of experience in managing chronic metabolic conditions, hypertension, and primary care outpatient medicine.",
  });

  // 2. Prescription Preferences State
  const [rxPref, setRxPref] = useState({
    defaultMode: "printed" as "printed" | "handwritten",
    showBrandName: true,
    showGenericName: true,
    showStrength: true,
    showQuantity: true,
    showInstructions: true,
  });

  // 3. Favorite Medicines State
  const [favMeds, setFavMeds] = useState<FavoriteMed[]>(initialFavMeds);
  const [medSearch, setMedSearch] = useState("");
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [selectedInvMed, setSelectedInvMed] = useState<typeof pharmacyInventoryOptions[0] | null>(null);

  // 4. Account (Password Change) State
  const [passState, setPassState] = useState({ current: "", newPass: "", confirm: "" });
  const [passSuccess, setPassSuccess] = useState(false);

  // Inventory Search Filtering
  const inventorySearchHits = useMemo(() => {
    if (!medSearch.trim()) return pharmacyInventoryOptions;
    const q = medSearch.toLowerCase();
    return pharmacyInventoryOptions.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [medSearch]);

  const handleAddSelectedToFavs = () => {
    if (selectedInvMed) {
      setFavMeds([
        ...favMeds,
        {
          id: `fav-${Date.now()}`,
          name: selectedInvMed.name,
          genericName: selectedInvMed.genericName,
          strength: selectedInvMed.strength,
          category: selectedInvMed.category,
          stockQty: selectedInvMed.stockQty,
        },
      ]);
      setSelectedInvMed(null);
      setShowAddMedModal(false);
      setMedSearch("");
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passState.newPass && passState.newPass === passState.confirm) {
      setPassSuccess(true);
      setPassState({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPassSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. PROFILE HEADER                                                       */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            {/* Photograph */}
            <div className="relative shrink-0">
              <div className="w-22 h-22 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-2xl shadow-md border-2 border-white">
                {getInitials(profile.fullName)}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#E5E7EB] shadow flex items-center justify-center text-[#6B7280] hover:bg-[#F8FAFC]">
                <Camera size={13} />
              </button>
            </div>

            {/* Doctor Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-[#111827]">{profile.fullName}</h1>
                <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified Practitioner
                </span>
              </div>

              <p className="text-sm font-semibold text-[#2563EB]">{profile.specialization}</p>
              <p className="text-xs text-[#6B7280]">
                Reg No: <span className="font-mono font-bold text-[#374151]">{profile.registrationNumber}</span> · {profile.qualifications} · {profile.experience} Yrs Experience
              </p>
              <p className="text-xs text-[#9CA3AF]">{profile.clinic} · {profile.department}</p>
            </div>
          </div>

          {/* Edit Profile Action */}
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 size={14} /> Profile Saved
              </span>
            )}
            <button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm",
                isEditing
                  ? "bg-[#16A34A] text-white hover:bg-[#15803D]"
                  : "bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F8FAFC]"
              )}
            >
              {isEditing ? <><Save size={15} /> Save Changes</> : <><Edit2 size={15} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 2. PROFESSIONAL STATISTICS                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#374151] uppercase tracking-wider">Professional Statistics</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Consultation Statistics */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
              <span className="text-xs font-bold text-[#374151]">Consultations</span>
              <Users size={16} className="text-[#2563EB]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Total Consulted</p><p className="font-bold text-base text-[#111827]">1,247</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Today</p><p className="font-bold text-base text-[#2563EB]">12</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">This Week</p><p className="font-bold text-base text-[#111827]">68</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">This Month</p><p className="font-bold text-base text-[#111827]">289</p></div>
            </div>
          </div>

          {/* Patient Statistics */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
              <span className="text-xs font-bold text-[#374151]">Patient Flow</span>
              <Activity size={16} className="text-[#16A34A]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">New Patients</p><p className="font-bold text-base text-[#16A34A]">4</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Returning</p><p className="font-bold text-base text-[#1D4ED8]">8</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Avg Consult Time</p><p className="font-bold text-base text-[#111827]">14m</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Avg Patients/Day</p><p className="font-bold text-base text-[#111827]">16</p></div>
            </div>
          </div>

          {/* Prescription Statistics */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
              <span className="text-xs font-bold text-[#374151]">Prescriptions</span>
              <Pill size={16} className="text-[#0EA5E9]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Total Issued</p><p className="font-bold text-base text-[#111827]">3,421</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Printed Rx</p><p className="font-bold text-base text-[#16A34A]">2,890</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Handwritten</p><p className="font-bold text-base text-[#6B7280]">531</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Top Drug</p><p className="font-bold text-xs text-[#2563EB] truncate">Metformin</p></div>
            </div>
          </div>

          {/* Clinical Statistics */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
              <span className="text-xs font-bold text-[#374151]">Clinical Diagnostics</span>
              <FlaskConical size={16} className="text-[#D97706]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Labs Requested</p><p className="font-bold text-base text-[#111827]">142</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Referrals Made</p><p className="font-bold text-base text-[#111827]">18</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Follow-ups</p><p className="font-bold text-base text-[#111827]">210</p></div>
              <div className="bg-[#F8FAFC] p-2 rounded-lg"><p className="text-[10px] text-[#9CA3AF]">Return Today</p><p className="font-bold text-base text-[#D97706]">15</p></div>
            </div>
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. PROFILE INFORMATION                                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">
          Profile Information
        </h2>

        {/* Personal Details */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#2563EB]">Personal Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Full Name</label>
              <input
                type="text" value={profile.fullName} onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC] font-semibold text-[#111827]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Gender</label>
              <select
                value={profile.gender} onChange={(e) => setProfile({...profile, gender: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-white outline-none disabled:bg-[#F8FAFC]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Date of Birth</label>
              <input
                type="date" value={profile.dob} onChange={(e) => setProfile({...profile, dob: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Phone Number</label>
              <input
                type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Email Address</label>
              <input
                type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Emergency Contact</label>
              <input
                type="text" value={profile.emergencyContact} onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1 sm:col-span-3">
              <label className="font-semibold text-[#374151]">Address</label>
              <input
                type="text" value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-3 pt-4 border-t border-[#F3F4F6]">
          <p className="text-xs font-bold text-[#2563EB]">Professional Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Medical Registration Number</label>
              <input
                type="text" value={profile.registrationNumber} onChange={(e) => setProfile({...profile, registrationNumber: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none font-mono font-bold text-[#2563EB] disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Medical Council</label>
              <input
                type="text" value={profile.medicalCouncil} onChange={(e) => setProfile({...profile, medicalCouncil: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Qualifications</label>
              <input
                type="text" value={profile.qualifications} onChange={(e) => setProfile({...profile, qualifications: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Specialization</label>
              <input
                type="text" value={profile.specialization} onChange={(e) => setProfile({...profile, specialization: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Department</label>
              <input
                type="text" value={profile.department} onChange={(e) => setProfile({...profile, department: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-[#374151]">Years of Experience</label>
              <input
                type="number" value={profile.experience} onChange={(e) => setProfile({...profile, experience: Number(e.target.value)})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none disabled:bg-[#F8FAFC]"
              />
            </div>
            <div className="space-y-1 sm:col-span-3">
              <label className="font-semibold text-[#374151]">Professional Biography</label>
              <textarea
                rows={3} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})}
                disabled={!isEditing} className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none resize-none text-xs disabled:bg-[#F8FAFC]"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
            <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-lg">
              Cancel
            </button>
            <button onClick={handleSaveProfile} className="px-5 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-lg hover:bg-[#15803D]">
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 4. PRESCRIPTION PREFERENCES                                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">
          Prescription Preferences
        </h2>

        <div className="space-y-4 text-xs">
          {/* Default Prescription Mode */}
          <div className="space-y-2">
            <p className="font-bold text-[#374151]">Default Prescription Mode</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                onClick={() => setRxPref({...rxPref, defaultMode: "printed"})}
                className={cn("py-2.5 px-3 border rounded-xl font-bold text-center transition-colors", rxPref.defaultMode === "printed" ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}
              >
                Printed Prescription
              </button>
              <button
                onClick={() => setRxPref({...rxPref, defaultMode: "handwritten"})}
                className={cn("py-2.5 px-3 border rounded-xl font-bold text-center transition-colors", rxPref.defaultMode === "handwritten" ? "bg-[#EFF6FF] border-[#2563EB] text-[#1D4ED8]" : "bg-white border-[#E5E7EB] text-[#6B7280]")}
              >
                Handwritten Prescription
              </button>
            </div>
          </div>

          {/* Display Options Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#F3F4F6]">
            <p className="font-bold text-[#374151]">Display Options</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: "showBrandName" as const, label: "Show Brand Name" },
                { key: "showGenericName" as const, label: "Show Generic Name" },
                { key: "showStrength" as const, label: "Show Medicine Strength" },
                { key: "showQuantity" as const, label: "Show Quantity" },
                { key: "showInstructions" as const, label: "Show Instructions" },
              ].map((t) => (
                <div key={t.key} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl">
                  <span className="font-medium text-[#111827]">{t.label}</span>
                  <button
                    onClick={() => setRxPref({...rxPref, [t.key]: !rxPref[t.key]})}
                    className={cn("w-9 h-5 rounded-full relative transition-colors", rxPref[t.key] ? "bg-[#2563EB]" : "bg-[#D1D5DB]")}
                  >
                    <span className={cn("w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform", rxPref[t.key] ? "left-4.5" : "left-0.5")} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#9CA3AF] italic">Changes apply to future printed prescriptions only.</p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 5. FAVORITE MEDICINES                                                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E7EB] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Favorite Medicines</h2>
            <p className="text-xs text-[#6B7280]">
              Favorite medicines automatically appear at the top of medicine search inside the Consultation Workspace
            </p>
          </div>
          <button
            onClick={() => setShowAddMedModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            <Plus size={15} /> Add Favorite Medicine
          </button>
        </div>

        {/* Favorite Medicines Searchable Table */}
        {favMeds.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
            <Pill size={32} className="text-[#9CA3AF] mx-auto" />
            <p className="text-sm font-bold text-[#374151]">No favorite medicines added yet.</p>
            <button
              onClick={() => setShowAddMedModal(true)}
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8]"
            >
              Add Favorite Medicine
            </button>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Medicine Name</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Generic Name</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Strength</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Category</th>
                  <th className="px-4 py-3 text-left font-bold text-[#6B7280]">Available Stock</th>
                  <th className="px-4 py-3 text-right font-bold text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {favMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-bold text-[#111827]">{med.name}</td>
                    <td className="px-4 py-3 text-[#6B7280] italic">{med.genericName}</td>
                    <td className="px-4 py-3 text-[#374151] font-semibold">{med.strength}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] font-bold rounded text-[10px]">
                        {med.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#16A34A]">{med.stockQty} in stock</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setFavMeds(favMeds.filter((x) => x.id !== med.id))}
                        className="text-[#9CA3AF] hover:text-[#DC2626] p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 6. ACCOUNT (CHANGE PASSWORD)                                             */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider border-b border-[#E5E7EB] pb-2">
          Account
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md text-xs">
          <p className="font-bold text-[#374151]">Change Password</p>

          {passSuccess && (
            <div className="p-3 bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] font-bold rounded-lg flex items-center gap-2">
              <CheckCircle2 size={16} /> Password updated successfully!
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-[#374151]">Current Password</label>
            <input
              type="password"
              required
              value={passState.current}
              onChange={(e) => setPassState({...passState, current: e.target.value})}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#374151]">New Password</label>
            <input
              type="password"
              required
              value={passState.newPass}
              onChange={(e) => setPassState({...passState, newPass: e.target.value})}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#374151]">Confirm New Password</label>
            <input
              type="password"
              required
              value={passState.confirm}
              onChange={(e) => setPassState({...passState, confirm: e.target.value})}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB]"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#2563EB] text-white font-bold text-xs rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* ADD FAVORITE MEDICINE MODAL                                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-fade-in border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Add Favorite Medicine</h3>
              <button onClick={() => setShowAddMedModal(false)} className="text-[#9CA3AF] hover:text-[#374151]">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-xl bg-white focus-within:border-[#2563EB]">
                <Search size={15} className="text-[#9CA3AF]" />
                <input
                  type="text" value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
                  placeholder="Search inventory by Brand Name, Generic Name, or Category..."
                  className="flex-1 text-xs outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-xl">
                {inventorySearchHits.map((m, idx) => (
                  <div
                    key={idx} onClick={() => setSelectedInvMed(m)}
                    className={cn(
                      "p-3 cursor-pointer text-xs flex items-center justify-between transition-colors",
                      selectedInvMed?.name === m.name ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"
                    )}
                  >
                    <div>
                      <p className="font-bold text-[#111827]">{m.name} ({m.strength})</p>
                      <p className="text-[10px] text-[#9CA3AF]">{m.genericName} · {m.category}</p>
                    </div>
                    {selectedInvMed?.name === m.name && <Check size={16} className="text-[#2563EB]" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddMedModal(false)} className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] text-xs font-semibold rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleAddSelectedToFavs}
                disabled={!selectedInvMed}
                className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                Add to Favorites
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
