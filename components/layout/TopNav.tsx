"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Search, Bell, ChevronDown, Calendar, Command } from "lucide-react";
import { cn, getNotificationColor, getInitials } from "@/lib/utils";
import { currentDoctor, notifications as mockNotifications } from "@/lib/mock-data";
import { GlobalSearch } from "./GlobalSearch";
import Link from "next/link";

interface TopNavProps {
  sidebarCollapsed: boolean;
}

export function TopNav({ sidebarCollapsed }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;
  const today = new Date();

  return (
    <>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-white border-b border-[#E5E7EB] flex items-center gap-4 px-6 transition-all duration-200",
          sidebarCollapsed ? "left-[68px]" : "left-[240px]"
        )}
      >
        {/* Search Trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg hover:border-[#D1D5DB] transition-colors w-72 text-left"
          aria-label="Open search"
          id="global-search-trigger"
        >
          <Search size={15} />
          <span className="flex-1">Search patients, UHID, medicines…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-[#9CA3AF] bg-white border border-[#E5E7EB] rounded shadow-sm">
            <Command size={10} />K
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Current Date */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[#6B7280]">
          <Calendar size={15} className="text-[#9CA3AF]" />
          <span className="font-medium text-[#374151]">
            {format(today, "EEEE, d MMMM yyyy")}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827] transition-colors"
            aria-label={`${unreadCount} unread notifications`}
            id="notifications-btn"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                  <p className="text-sm font-semibold text-[#111827]">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#F3F4F6]">
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-4 py-3 hover:bg-[#F8FAFC] cursor-pointer",
                        !n.read && "bg-[#F8FAFC]"
                      )}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: getNotificationColor(n.type) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={cn(
                          "text-xs text-[#111827] truncate",
                          !n.read && "font-semibold"
                        )}>
                          {n.title}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-1">
                          {format(new Date(n.timestamp), "hh:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#E5E7EB]">
                  <button className="text-xs text-[#2563EB] font-medium hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Doctor Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#E5E7EB]">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {getInitials(currentDoctor.name)}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-[#111827] leading-tight">
              {currentDoctor.name}
            </p>
            <p className="text-[11px] text-[#9CA3AF] leading-tight">
              {currentDoctor.specialization.split(" &")[0]}
            </p>
          </div>
          <ChevronDown size={14} className="text-[#9CA3AF]" />
        </div>
      </header>
    </>
  );
}
