// ─── Patient ───────────────────────────────────────────────────────────────

export type PatientType = "walk-in" | "appointment" | "emergency" | "returning";

export type Gender = "Male" | "Female" | "Other";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "O+" | "O-" | "AB+" | "AB-";

export interface Patient {
  id: string;
  uhid: string;
  name: string;
  age: number;
  gender: Gender;
  dob: string;
  mobile: string;
  email: string;
  address: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  chronicConditions: string[];
  patientType: PatientType;
  registeredOn: string;
  lastVisit: string | null;
  avatar?: string;
}

// ─── Queue ─────────────────────────────────────────────────────────────────

export type QueueStatus =
  | "waiting"
  | "in-consultation"
  | "completed"
  | "cancelled"
  | "no-show";

export interface QueueEntry {
  id: string;
  token: number;
  patient: Patient;
  status: QueueStatus;
  patientType: PatientType;
  appointmentTime: string | null;
  checkedInAt: string;
  consultationStartedAt: string | null;
  consultationEndedAt: string | null;
  chiefComplaint: string;
  priority: "normal" | "urgent" | "emergency";
}

// ─── Vitals ────────────────────────────────────────────────────────────────

export interface Vitals {
  id: string;
  patientId: string;
  recordedAt: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  weight: number;
  height: number;
  bmi: number;
  bloodGlucose?: number;
}

// ─── Prescription ──────────────────────────────────────────────────────────

export type DosageFrequency =
  | "Once daily"
  | "Twice daily"
  | "Thrice daily"
  | "Four times daily"
  | "Every 4 hours"
  | "Every 6 hours"
  | "Every 8 hours"
  | "At bedtime"
  | "As needed";

export type MealInstruction = "Before meals" | "After meals" | "With meals" | "Empty stomach";

export interface PrescriptionDrug {
  id: string;
  name: string;
  dosage: string;
  frequency: DosageFrequency;
  duration: string;
  mealInstruction: MealInstruction;
  instructions: string;
}

export type PrescriptionStatus = "active" | "completed" | "cancelled";

export interface Prescription {
  id: string;
  patientId: string;
  patient: Patient;
  doctorName: string;
  date: string;
  diagnosis: string[];
  drugs: PrescriptionDrug[];
  notes: string;
  followUpDate: string | null;
  status: PrescriptionStatus;
}

// ─── Consultation ──────────────────────────────────────────────────────────

export interface Consultation {
  id: string;
  queueEntryId: string;
  patient: Patient;
  vitals: Vitals;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  diagnosis: string[];
  prescription: Prescription;
  doctorNotes: string;
  followUpRequired: boolean;
  followUpDate: string | null;
  referral: string | null;
  startedAt: string;
  endedAt: string | null;
}

// ─── Visit History ─────────────────────────────────────────────────────────

export interface VisitRecord {
  id: string;
  date: string;
  diagnosis: string[];
  doctorName: string;
  prescriptionId: string;
}

// ─── Doctor ────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  email: string;
  mobile: string;
  clinic: string;
  avatar?: string;
  experience: number;
}

// ─── Notification ──────────────────────────────────────────────────────────

export type NotificationType = "info" | "warning" | "success" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export interface DashboardStats {
  totalPatientsToday: number;
  completed: number;
  waiting: number;
  inConsultation: number;
  cancelled: number;
  noShow: number;
  avgConsultationMinutes: number;
  newPatients: number;
}
