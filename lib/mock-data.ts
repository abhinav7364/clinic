import type {
  Patient,
  QueueEntry,
  Prescription,
  Notification,
  DashboardStats,
  Doctor,
  Vitals,
} from "./types";

// ─── Doctor ────────────────────────────────────────────────────────────────

export const currentDoctor: Doctor = {
  id: "doc-001",
  name: "Dr. Arjun Mehta",
  specialization: "General Physician & Family Medicine",
  qualification: "MBBS, MD (Internal Medicine)",
  registrationNumber: "MCI-2014-84726",
  email: "arjun.mehta@careclinic.in",
  mobile: "+91 98765 43210",
  clinic: "CareClinic Outpatient Centre",
  experience: 12,
};

// ─── Patients ──────────────────────────────────────────────────────────────

export const patients: Patient[] = [
  {
    id: "pat-001", uhid: "UHID-2024-0001",
    name: "Priya Sharma", age: 34, gender: "Female", dob: "1990-03-15",
    mobile: "+91 98112 34567", email: "priya.sharma@gmail.com",
    address: "12, Rose Garden Colony, Bhopal, MP - 462001",
    bloodGroup: "B+", allergies: ["Penicillin", "Sulfa drugs"],
    chronicConditions: ["Type 2 Diabetes", "Hypertension"],
    patientType: "returning", registeredOn: "2022-04-10", lastVisit: "2026-07-10",
  },
  {
    id: "pat-002", uhid: "UHID-2024-0002",
    name: "Rahul Verma", age: 52, gender: "Male", dob: "1972-11-22",
    mobile: "+91 90234 56789", email: "rahul.verma@yahoo.com",
    address: "45B, Nehru Nagar, Indore, MP - 452001",
    bloodGroup: "O+", allergies: [],
    chronicConditions: ["Coronary Artery Disease"],
    patientType: "appointment", registeredOn: "2021-08-20", lastVisit: "2026-06-28",
  },
  {
    id: "pat-003", uhid: "UHID-2024-0003",
    name: "Sunita Patel", age: 28, gender: "Female", dob: "1998-07-04",
    mobile: "+91 91122 33445", email: "sunita.p@hotmail.com",
    address: "78, Shivaji Marg, Bhopal, MP - 462016",
    bloodGroup: "A+", allergies: ["Aspirin"],
    chronicConditions: [],
    patientType: "walk-in", registeredOn: "2026-07-28", lastVisit: null,
  },
  {
    id: "pat-004", uhid: "UHID-2024-0004",
    name: "Amir Khan", age: 67, gender: "Male", dob: "1959-01-30",
    mobile: "+91 88990 11223", email: "amir.khan@gmail.com",
    address: "3, Civil Lines, Jabalpur, MP - 482001",
    bloodGroup: "AB+", allergies: ["NSAIDs", "Latex"],
    chronicConditions: ["COPD", "Hypertension", "Type 2 Diabetes"],
    patientType: "emergency", registeredOn: "2019-12-05", lastVisit: "2026-07-20",
  },
  {
    id: "pat-005", uhid: "UHID-2024-0005",
    name: "Meena Joshi", age: 45, gender: "Female", dob: "1981-05-18",
    mobile: "+91 97123 45678", email: "meena.joshi@gmail.com",
    address: "22, MG Road, Ujjain, MP - 456001",
    bloodGroup: "O-", allergies: [],
    chronicConditions: ["Hypothyroidism"],
    patientType: "returning", registeredOn: "2020-02-14", lastVisit: "2026-07-15",
  },
  {
    id: "pat-006", uhid: "UHID-2024-0006",
    name: "Vikram Singh", age: 39, gender: "Male", dob: "1987-09-02",
    mobile: "+91 96789 01234", email: "vikram.s@outlook.com",
    address: "55, Subhash Nagar, Bhopal, MP - 462023",
    bloodGroup: "B-", allergies: ["Codeine"],
    chronicConditions: [],
    patientType: "appointment", registeredOn: "2023-06-12", lastVisit: "2026-05-30",
  },
  {
    id: "pat-007", uhid: "UHID-2024-0007",
    name: "Ananya Roy", age: 23, gender: "Female", dob: "2003-12-11",
    mobile: "+91 99001 22334", email: "ananya.roy@gmail.com",
    address: "101, Lake View Apartments, Bhopal, MP - 462003",
    bloodGroup: "A-", allergies: [],
    chronicConditions: [],
    patientType: "walk-in", registeredOn: "2026-07-28", lastVisit: null,
  },
  {
    id: "pat-008", uhid: "UHID-2024-0008",
    name: "Deepak Gupta", age: 58, gender: "Male", dob: "1968-04-25",
    mobile: "+91 85678 90123", email: "deepak.g@gmail.com",
    address: "9, Platinum Plaza, Indore, MP - 452010",
    bloodGroup: "O+", allergies: ["Metformin"],
    chronicConditions: ["Gout", "Hypertension"],
    patientType: "returning", registeredOn: "2018-11-01", lastVisit: "2026-07-05",
  },
  {
    id: "pat-009", uhid: "UHID-2024-0009",
    name: "Kavita Nair", age: 31, gender: "Female", dob: "1995-08-19",
    mobile: "+91 93456 78901", email: "kavita.nair@yahoo.com",
    address: "33, Palm Street, Bhopal, MP - 462008",
    bloodGroup: "B+", allergies: [],
    chronicConditions: ["Migraine"],
    patientType: "appointment", registeredOn: "2024-03-07", lastVisit: "2026-06-14",
  },
  {
    id: "pat-010", uhid: "UHID-2024-0010",
    name: "Suresh Tiwari", age: 72, gender: "Male", dob: "1954-02-28",
    mobile: "+91 87654 32109", email: "suresh.tiwari@gmail.com",
    address: "5, Old Palasia, Indore, MP - 452018",
    bloodGroup: "AB-", allergies: ["Warfarin"],
    chronicConditions: ["Atrial Fibrillation", "CKD Stage 3", "Hypertension"],
    patientType: "returning", registeredOn: "2017-06-30", lastVisit: "2026-07-22",
  },
  {
    id: "pat-011", uhid: "UHID-2025-0011",
    name: "Pooja Mishra", age: 26, gender: "Female", dob: "2000-10-05",
    mobile: "+91 92234 56789", email: "pooja.m@gmail.com",
    address: "67, Gulmohar Colony, Bhopal, MP - 462039",
    bloodGroup: "A+", allergies: [],
    chronicConditions: [],
    patientType: "walk-in", registeredOn: "2026-07-28", lastVisit: null,
  },
  {
    id: "pat-012", uhid: "UHID-2025-0012",
    name: "Rajesh Kumar", age: 48, gender: "Male", dob: "1978-06-16",
    mobile: "+91 94345 67890", email: "rajesh.kumar@gmail.com",
    address: "18, Railway Colony, Jabalpur, MP - 482008",
    bloodGroup: "O+", allergies: ["Ibuprofen"],
    chronicConditions: ["Peptic Ulcer Disease"],
    patientType: "returning", registeredOn: "2022-09-18", lastVisit: "2026-07-01",
  },
  {
    id: "pat-013", uhid: "UHID-2025-0013",
    name: "Nisha Agarwal", age: 36, gender: "Female", dob: "1990-03-22",
    mobile: "+91 78901 23456", email: "nisha.a@outlook.com",
    address: "44, Saket Nagar, Bhopal, MP - 462024",
    bloodGroup: "B+", allergies: [],
    chronicConditions: ["Polycystic Ovary Syndrome"],
    patientType: "appointment", registeredOn: "2023-01-10", lastVisit: "2026-05-20",
  },
  {
    id: "pat-014", uhid: "UHID-2025-0014",
    name: "Arjun Patil", age: 19, gender: "Male", dob: "2007-01-14",
    mobile: "+91 79012 34567", email: "arjun.patil@gmail.com",
    address: "2, College Road, Ujjain, MP - 456010",
    bloodGroup: "A-", allergies: [],
    chronicConditions: [],
    patientType: "walk-in", registeredOn: "2026-07-28", lastVisit: null,
  },
  {
    id: "pat-015", uhid: "UHID-2025-0015",
    name: "Geeta Saxena", age: 61, gender: "Female", dob: "1965-08-30",
    mobile: "+91 80123 45678", email: "geeta.saxena@yahoo.com",
    address: "88, Koh-e-Fiza, Bhopal, MP - 462001",
    bloodGroup: "O+", allergies: ["Sulfonamides"],
    chronicConditions: ["Osteoarthritis", "Hypothyroidism"],
    patientType: "returning", registeredOn: "2019-04-02", lastVisit: "2026-07-18",
  },
];

// ─── Vitals ────────────────────────────────────────────────────────────────

export const sampleVitals: Vitals = {
  id: "vit-001",
  patientId: "pat-001",
  recordedAt: "2026-07-28T09:30:00",
  bloodPressureSystolic: 138,
  bloodPressureDiastolic: 88,
  heartRate: 82,
  temperature: 37.1,
  oxygenSaturation: 97,
  respiratoryRate: 16,
  weight: 68,
  height: 162,
  bmi: 25.9,
  bloodGlucose: 142,
};

// ─── Today's Queue ─────────────────────────────────────────────────────────

export const todayQueue: QueueEntry[] = [
  {
    id: "q-001", token: 1, patient: patients[3],
    status: "completed", patientType: "emergency",
    appointmentTime: null, checkedInAt: "2026-07-28T08:05:00",
    consultationStartedAt: "2026-07-28T08:08:00",
    consultationEndedAt: "2026-07-28T08:35:00",
    chiefComplaint: "Severe breathlessness and chest tightness",
    priority: "emergency",
  },
  {
    id: "q-002", token: 2, patient: patients[1],
    status: "completed", patientType: "appointment",
    appointmentTime: "09:00", checkedInAt: "2026-07-28T08:50:00",
    consultationStartedAt: "2026-07-28T09:02:00",
    consultationEndedAt: "2026-07-28T09:28:00",
    chiefComplaint: "Follow-up for chest pain and cardiac review",
    priority: "urgent",
  },
  {
    id: "q-003", token: 3, patient: patients[0],
    status: "in-consultation", patientType: "returning",
    appointmentTime: "09:30", checkedInAt: "2026-07-28T09:20:00",
    consultationStartedAt: "2026-07-28T09:35:00",
    consultationEndedAt: null,
    chiefComplaint: "Uncontrolled blood sugar, fatigue, blurred vision",
    priority: "normal",
  },
  {
    id: "q-004", token: 4, patient: patients[4],
    status: "waiting", patientType: "returning",
    appointmentTime: "10:00", checkedInAt: "2026-07-28T09:45:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Thyroid review, fatigue and hair loss",
    priority: "normal",
  },
  {
    id: "q-005", token: 5, patient: patients[2],
    status: "waiting", patientType: "walk-in",
    appointmentTime: null, checkedInAt: "2026-07-28T09:55:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Fever for 3 days, body aches, sore throat",
    priority: "normal",
  },
  {
    id: "q-006", token: 6, patient: patients[8],
    status: "waiting", patientType: "appointment",
    appointmentTime: "10:30", checkedInAt: "2026-07-28T10:15:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Migraine episode, nausea, light sensitivity",
    priority: "normal",
  },
  {
    id: "q-007", token: 7, patient: patients[5],
    status: "waiting", patientType: "appointment",
    appointmentTime: "11:00", checkedInAt: "2026-07-28T10:50:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Persistent cough and mild fever for a week",
    priority: "normal",
  },
  {
    id: "q-008", token: 8, patient: patients[6],
    status: "waiting", patientType: "walk-in",
    appointmentTime: null, checkedInAt: "2026-07-28T10:55:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Stomach pain, nausea, loose stools",
    priority: "normal",
  },
  {
    id: "q-009", token: 9, patient: patients[11],
    status: "no-show", patientType: "appointment",
    appointmentTime: "09:00", checkedInAt: "2026-07-28T09:00:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Gastric review",
    priority: "normal",
  },
  {
    id: "q-010", token: 10, patient: patients[9],
    status: "waiting", patientType: "returning",
    appointmentTime: "11:30", checkedInAt: "2026-07-28T11:10:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Routine CKD monitoring and medication review",
    priority: "urgent",
  },
  {
    id: "q-011", token: 11, patient: patients[13],
    status: "waiting", patientType: "walk-in",
    appointmentTime: null, checkedInAt: "2026-07-28T11:20:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Ankle sprain, pain and swelling",
    priority: "normal",
  },
  {
    id: "q-012", token: 12, patient: patients[14],
    status: "waiting", patientType: "returning",
    appointmentTime: "12:00", checkedInAt: "2026-07-28T11:45:00",
    consultationStartedAt: null, consultationEndedAt: null,
    chiefComplaint: "Joint pain review, knee stiffness",
    priority: "normal",
  },
];

// ─── Prescriptions ─────────────────────────────────────────────────────────

export const prescriptions: Prescription[] = [
  {
    id: "rx-001", patientId: "pat-001", patient: patients[0],
    doctorName: "Dr. Arjun Mehta",
    date: "2026-07-10",
    diagnosis: ["Type 2 Diabetes Mellitus - Uncontrolled", "Essential Hypertension"],
    drugs: [
      { id: "d-1", name: "Metformin 500mg", dosage: "500mg", frequency: "Twice daily", duration: "30 days", mealInstruction: "After meals", instructions: "Take with a glass of water" },
      { id: "d-2", name: "Glipizide 5mg", dosage: "5mg", frequency: "Once daily", duration: "30 days", mealInstruction: "Before meals", instructions: "30 minutes before breakfast" },
      { id: "d-3", name: "Amlodipine 5mg", dosage: "5mg", frequency: "Once daily", duration: "30 days", mealInstruction: "After meals", instructions: "" },
    ],
    notes: "Patient advised on diet control and regular exercise. Monitor BP at home.",
    followUpDate: "2026-08-10",
    status: "active",
  },
  {
    id: "rx-002", patientId: "pat-002", patient: patients[1],
    doctorName: "Dr. Arjun Mehta",
    date: "2026-06-28",
    diagnosis: ["Stable Angina", "Dyslipidemia"],
    drugs: [
      { id: "d-4", name: "Aspirin 75mg", dosage: "75mg", frequency: "Once daily", duration: "90 days", mealInstruction: "After meals", instructions: "Take with food to protect stomach" },
      { id: "d-5", name: "Atorvastatin 20mg", dosage: "20mg", frequency: "At bedtime", duration: "90 days", mealInstruction: "After meals", instructions: "" },
      { id: "d-6", name: "Metoprolol 25mg", dosage: "25mg", frequency: "Twice daily", duration: "90 days", mealInstruction: "After meals", instructions: "Do not stop suddenly" },
    ],
    notes: "Echo scheduled for next month. Avoid strenuous activity.",
    followUpDate: "2026-07-28",
    status: "active",
  },
  {
    id: "rx-003", patientId: "pat-004", patient: patients[3],
    doctorName: "Dr. Arjun Mehta",
    date: "2026-07-20",
    diagnosis: ["COPD Exacerbation", "Community-Acquired Pneumonia"],
    drugs: [
      { id: "d-7", name: "Amoxicillin-Clavulanate 625mg", dosage: "625mg", frequency: "Thrice daily", duration: "7 days", mealInstruction: "After meals", instructions: "" },
      { id: "d-8", name: "Salbutamol Inhaler 100mcg", dosage: "100mcg", frequency: "As needed", duration: "14 days", mealInstruction: "After meals", instructions: "2 puffs when breathless. Max 8 puffs per day" },
      { id: "d-9", name: "Prednisolone 40mg", dosage: "40mg", frequency: "Once daily", duration: "5 days", mealInstruction: "After meals", instructions: "Take with food" },
    ],
    notes: "O2 saturation to be monitored. Return immediately if breathlessness worsens.",
    followUpDate: "2026-07-28",
    status: "completed",
  },
  {
    id: "rx-004", patientId: "pat-005", patient: patients[4],
    doctorName: "Dr. Arjun Mehta",
    date: "2026-07-15",
    diagnosis: ["Hypothyroidism - Undertreated"],
    drugs: [
      { id: "d-10", name: "Levothyroxine 75mcg", dosage: "75mcg", frequency: "Once daily", duration: "60 days", mealInstruction: "Empty stomach", instructions: "Take 30 minutes before breakfast. Avoid milk within 4 hours" },
    ],
    notes: "TSH to be repeated after 6 weeks. Adjust dose based on results.",
    followUpDate: "2026-08-15",
    status: "active",
  },
  {
    id: "rx-005", patientId: "pat-010", patient: patients[9],
    doctorName: "Dr. Arjun Mehta",
    date: "2026-07-22",
    diagnosis: ["Chronic Kidney Disease - Stage 3", "Hypertension"],
    drugs: [
      { id: "d-11", name: "Telmisartan 40mg", dosage: "40mg", frequency: "Once daily", duration: "30 days", mealInstruction: "After meals", instructions: "" },
      { id: "d-12", name: "Calcium Carbonate 500mg", dosage: "500mg", frequency: "Thrice daily", duration: "30 days", mealInstruction: "After meals", instructions: "With meals to bind phosphate" },
      { id: "d-13", name: "Furosemide 20mg", dosage: "20mg", frequency: "Once daily", duration: "30 days", mealInstruction: "After meals", instructions: "Take in the morning" },
    ],
    notes: "Renal function tests in 2 weeks. Strict fluid and salt restriction. Avoid NSAIDs.",
    followUpDate: "2026-08-22",
    status: "active",
  },
];

// ─── Notifications ─────────────────────────────────────────────────────────

export const notifications: Notification[] = [
  {
    id: "n-001", type: "warning", read: false,
    title: "Emergency Patient",
    message: "Token #4 — Amir Khan flagged as high priority. COPD review needed.",
    timestamp: "2026-07-28T11:10:00",
  },
  {
    id: "n-002", type: "info", read: false,
    title: "Lab Results Available",
    message: "HbA1c and lipid profile for Priya Sharma (UHID-2024-0001) are ready.",
    timestamp: "2026-07-28T10:45:00",
  },
  {
    id: "n-003", type: "success", read: false,
    title: "Prescription Sent",
    message: "Prescription for Rahul Verma has been sent to the pharmacy.",
    timestamp: "2026-07-28T09:30:00",
  },
  {
    id: "n-004", type: "error", read: true,
    title: "No Show",
    message: "Rajesh Kumar (Token #9) did not arrive for scheduled appointment.",
    timestamp: "2026-07-28T09:05:00",
  },
  {
    id: "n-005", type: "info", read: true,
    title: "System Update",
    message: "CareClinic portal updated to v2.4.1. New features available.",
    timestamp: "2026-07-27T20:00:00",
  },
];

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export const dashboardStats: DashboardStats = {
  totalPatientsToday: 12,
  completed: 2,
  waiting: 8,
  inConsultation: 1,
  cancelled: 0,
  noShow: 1,
  avgConsultationMinutes: 24,
  newPatients: 4,
};

// ─── Medicine Search Database ──────────────────────────────────────────────

export const medicineDatabase = [
  "Amoxicillin 250mg", "Amoxicillin 500mg", "Amoxicillin-Clavulanate 625mg",
  "Azithromycin 250mg", "Azithromycin 500mg",
  "Ciprofloxacin 250mg", "Ciprofloxacin 500mg",
  "Doxycycline 100mg",
  "Metronidazole 400mg",
  "Cetirizine 10mg", "Loratadine 10mg",
  "Paracetamol 500mg", "Paracetamol 650mg",
  "Ibuprofen 400mg", "Ibuprofen 600mg",
  "Diclofenac 50mg", "Diclofenac 75mg",
  "Pantoprazole 40mg", "Omeprazole 20mg", "Rabeprazole 20mg",
  "Metformin 500mg", "Metformin 1000mg",
  "Glipizide 5mg", "Glibenclamide 5mg",
  "Sitagliptin 100mg",
  "Atorvastatin 10mg", "Atorvastatin 20mg", "Atorvastatin 40mg",
  "Rosuvastatin 10mg", "Rosuvastatin 20mg",
  "Amlodipine 5mg", "Amlodipine 10mg",
  "Telmisartan 40mg", "Telmisartan 80mg",
  "Enalapril 5mg", "Enalapril 10mg",
  "Metoprolol 25mg", "Metoprolol 50mg",
  "Aspirin 75mg", "Aspirin 150mg",
  "Clopidogrel 75mg",
  "Levothyroxine 25mcg", "Levothyroxine 50mcg", "Levothyroxine 75mcg", "Levothyroxine 100mcg",
  "Prednisolone 5mg", "Prednisolone 10mg", "Prednisolone 20mg", "Prednisolone 40mg",
  "Montelukast 10mg",
  "Salbutamol Inhaler 100mcg",
  "Budesonide Inhaler 200mcg",
  "Furosemide 20mg", "Furosemide 40mg",
  "Calcium Carbonate 500mg",
  "Vitamin D3 60000IU",
  "Vitamin B12 1500mcg",
  "Iron (Ferrous Sulphate) 150mg",
  "Folic Acid 5mg",
  "Ranitidine 150mg",
  "Domperidone 10mg",
  "Ondansetron 4mg", "Ondansetron 8mg",
  "Tramadol 50mg",
  "Codeine 30mg",
  "Pregabalin 75mg",
  "Diazepam 5mg",
  "Alprazolam 0.25mg",
  "Sertraline 50mg",
];

// ─── Returning Patients ────────────────────────────────────────────────────

export interface ReturningPatient {
  id: string;
  name: string;
  age: number;
  uhid: string;
  reason: string;
  sentAt: string;           // when they were sent out
  expectedReturnAt: string; // expected return time
  status: "waiting-outside" | "returned" | "delayed";
}

export const returningPatients: ReturningPatient[] = [
  {
    id: "rp-001",
    name: "Rahul Verma",
    age: 52,
    uhid: "UHID-2024-0002",
    reason: "CBC & Lipid Profile",
    sentAt: "2026-07-28T09:28:00",
    expectedReturnAt: "2026-07-28T10:30:00",
    status: "returned",
  },
  {
    id: "rp-002",
    name: "Meena Joshi",
    age: 45,
    uhid: "UHID-2024-0005",
    reason: "Thyroid Function Test",
    sentAt: "2026-07-28T10:05:00",
    expectedReturnAt: "2026-07-28T11:15:00",
    status: "waiting-outside",
  },
  {
    id: "rp-003",
    name: "Suresh Tiwari",
    age: 72,
    uhid: "UHID-2024-0010",
    reason: "Renal Function & Electrolytes",
    sentAt: "2026-07-28T10:40:00",
    expectedReturnAt: "2026-07-28T12:00:00",
    status: "delayed",
  },
];

// ─── Activity Timeline ──────────────────────────────────────────────────────

export type ActivityType =
  | "consultation-completed"
  | "consultation-started"
  | "prescription-printed"
  | "patient-returned"
  | "patient-called"
  | "no-show"
  | "lab-ready";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  time: string;
  title: string;
  subtitle?: string;
}

export const activityTimeline: ActivityEvent[] = [
  {
    id: "act-001",
    type: "consultation-started",
    time: "2026-07-28T08:08:00",
    title: "Consultation Started",
    subtitle: "Amir Khan · Token #1",
  },
  {
    id: "act-002",
    type: "consultation-completed",
    time: "2026-07-28T08:35:00",
    title: "Consultation Completed",
    subtitle: "Amir Khan · 27 min",
  },
  {
    id: "act-003",
    type: "patient-called",
    time: "2026-07-28T08:52:00",
    title: "Next Patient Called",
    subtitle: "Rahul Verma · Token #2",
  },
  {
    id: "act-004",
    type: "consultation-completed",
    time: "2026-07-28T09:28:00",
    title: "Consultation Completed",
    subtitle: "Rahul Verma · 26 min",
  },
  {
    id: "act-005",
    type: "prescription-printed",
    time: "2026-07-28T09:30:00",
    title: "Prescription Printed",
    subtitle: "Rahul Verma",
  },
  {
    id: "act-006",
    type: "no-show",
    time: "2026-07-28T09:05:00",
    title: "No Show Marked",
    subtitle: "Rajesh Kumar · Token #9",
  },
  {
    id: "act-007",
    type: "patient-called",
    time: "2026-07-28T09:35:00",
    title: "Consultation Started",
    subtitle: "Priya Sharma · Token #3",
  },
  {
    id: "act-008",
    type: "lab-ready",
    time: "2026-07-28T10:45:00",
    title: "Lab Report Ready",
    subtitle: "HbA1c & Lipid Profile — Priya Sharma",
  },
  {
    id: "act-009",
    type: "patient-returned",
    time: "2026-07-28T11:05:00",
    title: "Patient Returned",
    subtitle: "Rahul Verma · CBC results ready",
  },
];

// ─── Dashboard Notifications ────────────────────────────────────────────────

export const dashboardNotifications = [
  {
    id: "dn-001",
    title: "CBC Report Ready",
    message: "Rahul Verma's CBC & Lipid Profile report is now available.",
    time: "2026-07-28T11:05:00",
    read: false,
    icon: "lab",
  },
  {
    id: "dn-002",
    title: "Returning Patient Ready",
    message: "Meena Joshi has returned from the lab and is waiting.",
    time: "2026-07-28T10:58:00",
    read: false,
    icon: "patient",
  },
  {
    id: "dn-003",
    title: "Prescription Printed",
    message: "Prescription for Rahul Verma has been successfully printed.",
    time: "2026-07-28T09:30:00",
    read: false,
    icon: "print",
  },
  {
    id: "dn-004",
    title: "System Notification",
    message: "Next scheduled patient Meena Joshi has an appointment at 10:00 AM.",
    time: "2026-07-28T09:50:00",
    read: true,
    icon: "system",
  },
  {
    id: "dn-005",
    title: "Emergency Alert",
    message: "Amir Khan arrived as emergency — COPD exacerbation.",
    time: "2026-07-28T08:05:00",
    read: true,
    icon: "alert",
  },
];
