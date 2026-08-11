import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import type { QueueStatus, PatientType, NotificationType, PrescriptionStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatTime(date: string | Date) {
  return format(new Date(date), "hh:mm a");
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function getQueueStatusConfig(status: QueueStatus) {
  const configs: Record<QueueStatus, { label: string; color: string; bg: string }> = {
    waiting:          { label: "Waiting",         color: "#B45309", bg: "#FEF3C7" },
    "in-consultation":{ label: "In Consultation",  color: "#1D4ED8", bg: "#DBEAFE" },
    completed:        { label: "Completed",        color: "#15803D", bg: "#DCFCE7" },
    cancelled:        { label: "Cancelled",        color: "#6B7280", bg: "#F3F4F6" },
    "no-show":        { label: "No Show",          color: "#DC2626", bg: "#FEE2E2" },
  };
  return configs[status];
}

export function getPatientTypeConfig(type: PatientType) {
  const configs: Record<PatientType, { label: string; color: string; bg: string }> = {
    emergency:   { label: "Emergency",  color: "#DC2626", bg: "#FEE2E2" },
    returning:   { label: "Returning",  color: "#1D4ED8", bg: "#DBEAFE" },
    appointment: { label: "Appointment",color: "#15803D", bg: "#DCFCE7" },
    "walk-in":   { label: "Walk-in",    color: "#6B7280", bg: "#F3F4F6" },
  };
  return configs[type];
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    info:    "#0EA5E9",
    warning: "#F59E0B",
    success: "#16A34A",
    error:   "#DC2626",
  };
  return colors[type];
}

export function getPrescriptionStatusConfig(status: PrescriptionStatus) {
  const configs: Record<PrescriptionStatus, { label: string; color: string; bg: string }> = {
    active:    { label: "Active",    color: "#15803D", bg: "#DCFCE7" },
    completed: { label: "Completed", color: "#1D4ED8", bg: "#DBEAFE" },
    cancelled: { label: "Cancelled", color: "#6B7280", bg: "#F3F4F6" },
  };
  return configs[status];
}
