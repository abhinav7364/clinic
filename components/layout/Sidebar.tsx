"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users2,
  ClipboardList,
  Stethoscope,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  Cross,
} from "lucide-react";

// Doctor Portal Navigation Modules
const navItems = [
  { href: "/dashboard",     label: "Dashboard",          icon: LayoutDashboard },
  { href: "/queue",         label: "Today's Queue",       icon: ClipboardList },
  { href: "/consultation",  label: "Consultation",        icon: Stethoscope },
  { href: "/patients",      label: "Patient Records",     icon: Users2 },
  { href: "/prescriptions", label: "Prescription History",icon: FileText },
  { href: "/profile",       label: "My Profile",          icon: User },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-200 ease-in-out",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
            <Cross className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-[#111827] truncate leading-tight">CareClinic</p>
              <p className="text-xs text-[#6B7280] truncate">Doctor Portal</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="px-2 space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
              Clinical Workspace
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const href = item.href;
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  isActive
                    ? "bg-[#DBEAFE] text-[#1D4ED8] font-bold"
                    : "text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]",
                  collapsed && "justify-center"
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 shrink-0 transition-colors",
                    isActive ? "text-[#2563EB]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                  )}
                  size={18}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 pb-4 border-t border-[#E5E7EB] pt-3">
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
