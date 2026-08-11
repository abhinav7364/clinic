"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, FileText, Pill, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { patients, medicineDatabase } from "@/lib/mock-data";

type SearchCategory = "patient" | "medicine";

interface SearchResult {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle: string;
  href: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const results: SearchResult[] = React.useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const out: SearchResult[] = [];

    patients.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        p.id.includes(q)
      ) {
        out.push({
          id: p.id,
          category: "patient",
          title: p.name,
          subtitle: `${p.uhid} • ${p.age}y ${p.gender} • ${p.mobile}`,
          href: `/patients?id=${p.id}`,
        });
      }
    });

    medicineDatabase
      .filter((m) => m.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach((m, i) => {
        out.push({
          id: `med-${i}`,
          category: "medicine",
          title: m,
          subtitle: "Medicine",
          href: `/prescriptions?q=${encodeURIComponent(m)}`,
        });
      });

    return out.slice(0, 10);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-fade-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, UHID, mobile, medicines…"
            className="flex-1 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none bg-transparent"
            aria-label="Global search"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 ? (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-[#E5E7EB] mx-auto mb-2" />
              <p className="text-sm text-[#9CA3AF]">Type at least 2 characters to search</p>
              <p className="text-xs text-[#D1D5DB] mt-1">
                Search by name, UHID, mobile number, or medicine
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#6B7280]">No results for "{query}"</p>
            </div>
          ) : (
            <div className="py-1">
              {/* Patient results */}
              {results.filter((r) => r.category === "patient").length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Patients
                  </div>
                  {results
                    .filter((r) => r.category === "patient")
                    .map((result) => (
                      <button
                        key={result.id}
                        onClick={() => { router.push(result.href); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0">
                          <User size={14} className="text-[#2563EB]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">{result.title}</p>
                          <p className="text-xs text-[#6B7280] truncate">{result.subtitle}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
              {/* Medicine results */}
              {results.filter((r) => r.category === "medicine").length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Medicines
                  </div>
                  {results
                    .filter((r) => r.category === "medicine")
                    .map((result) => (
                      <button
                        key={result.id}
                        onClick={() => { router.push(result.href); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F8FAFC] transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                          <Pill size={14} className="text-[#16A34A]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#111827] truncate">{result.title}</p>
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[#F3F4F6] flex items-center gap-4 text-xs text-[#9CA3AF]">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>ESC close</span>
        </div>
      </div>
    </div>
  );
}
