"use client";

import React from "react";
import { Sparkles, RotateCcw, Video } from "lucide-react";

interface HeaderProps {
  shortTitle: string;
  onOpenUpload: () => void;
}

export default function Header({ shortTitle, onOpenUpload }: HeaderProps) {
  return (
    <header className="w-full">
      {/* Top Blue Bar */}
      <div className="bg-[#0284c7] px-6 py-2.5 text-white flex items-center justify-between shadow-sm">
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-3">
          {/* Orange LV Logo matching user reference image */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f59e0b] via-[#ea580c] to-[#c2410c] shadow-md border border-amber-300/40 overflow-hidden ring-1 ring-black/25">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent pointer-events-none" />
            <span className="relative font-black text-white text-base tracking-tighter select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              LV
            </span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-none">
              los videos.ai · Kurgu Stüdyosu
            </h1>
            <p className="text-[11px] text-white/80 font-normal mt-0.5">
              TR · MENA yerelleştirme katmanı
            </p>
          </div>
        </div>

        {/* Right: Current Video Badge & New Video Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 rounded-md bg-white/10 border border-white/20 px-3 py-1 text-xs text-white/90 font-mono">
            <span>{shortTitle}</span>
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-md border border-white/40 bg-white/10 hover:bg-white/20 active:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Yeni video</span>
          </button>
        </div>
      </div>

      {/* Sub-bar / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 text-xs font-medium text-slate-500 flex items-center gap-2">
        <span>Stüdyo</span>
        <span>/</span>
        <span className="text-slate-800">Önizleme ve kurgu planı</span>
      </div>
    </header>
  );
}
