"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { cn } from "@/lib/utils";

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopNav sidebarCollapsed={collapsed} />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-200",
          collapsed ? "pl-[68px]" : "pl-[240px]"
        )}
      >
        <div className="p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
