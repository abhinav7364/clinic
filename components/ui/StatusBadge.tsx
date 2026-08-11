"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  getQueueStatusConfig,
  getPatientTypeConfig,
  getPrescriptionStatusConfig,
} from "@/lib/utils";
import type { QueueStatus, PatientType, PrescriptionStatus } from "@/lib/types";

interface StatusBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function QueueStatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps & { status: QueueStatus }) {
  const config = getQueueStatusConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{ color: config.color, background: config.bg }}
    >
      <span
        className="status-dot shrink-0"
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}

export function PatientTypeBadge({
  type,
  className,
  size = "md",
}: StatusBadgeProps & { type: PatientType }) {
  const config = getPatientTypeConfig(type);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}

export function PrescriptionStatusBadge({
  status,
  className,
  size = "md",
}: StatusBadgeProps & { status: PrescriptionStatus }) {
  const config = getPrescriptionStatusConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        className
      )}
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: "normal" | "urgent" | "emergency";
  className?: string;
}) {
  const configs = {
    normal:    { label: "Normal",    color: "#6B7280", bg: "#F3F4F6" },
    urgent:    { label: "Urgent",    color: "#D97706", bg: "#FEF3C7" },
    emergency: { label: "Emergency", color: "#DC2626", bg: "#FEE2E2" },
  };
  const config = configs[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        className
      )}
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  );
}
