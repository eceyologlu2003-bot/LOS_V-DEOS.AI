"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";
import { VideoProjectData } from "@/types";

interface SignalRailProps {
  project: VideoProjectData;
}

export default function SignalRail({ project }: SignalRailProps) {
  const [measure, setMeasure] = useState<string>(project.measure || "9/8");
  const duration = project.duration_seconds || 45.0;

  // Calculate percentage positions
  const hookStartPct = ((project.hook_analysis.start_time || 14.0) / duration) * 100;
  const hookEndPct = ((project.hook_analysis.end_time || 17.0) / duration) * 100;
  const hookWidthPct = Math.max(4, hookEndPct - hookStartPct);

  // Gaps percentage
  const gaps = project.gaps && project.gaps.length > 0 ? project.gaps : [
    { start: 2.0, end: 7.5 },
    { start: 39.0, end: 44.5 }
  ];

  // 58 rhythm beat markers
  const beatCount = project.beats_count || 58;
  const beatTicks = Array.from({ length: Math.min(60, beatCount) }, (_, i) => i);

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header matching Screenshot 2 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#0284c7]" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">Sinyal rayı</h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Ölçü</span>
          
          <button
            onClick={() => setMeasure("4/4")}
            className={`rounded px-2 py-0.5 text-xs font-semibold transition ${
              measure === "4/4"
                ? "bg-[#0284c7] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            4/4
          </button>

          <button
            onClick={() => setMeasure("9/8")}
            className={`rounded px-2.5 py-0.5 text-xs font-semibold transition ${
              measure === "9/8"
                ? "bg-[#0284c7] text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            9/8
          </button>

          <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600">
            {project.beat_interval || 0.45}s vuruş
          </span>
        </div>
      </div>

      {/* 5-Track Signal Timeline */}
      <div className="space-y-2.5">
        {/* Track 1: Hook */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs font-medium text-slate-600 select-none">
            Hook
          </span>
          <div className="relative h-4 flex-1 rounded bg-slate-100 border border-slate-200 overflow-hidden">
            {/* Orange Hook segment matching screenshot */}
            <div
              style={{
                left: `${hookStartPct}%`,
                width: `${hookWidthPct}%`,
              }}
              className="absolute top-0 bottom-0 bg-[#ea580c] rounded-xs shadow-sm"
              title={`Hook: ${project.hook_analysis.start_formatted || "00:14"} - ${project.hook_analysis.end_formatted || "00:17"}`}
            />
          </div>
        </div>

        {/* Track 2: Boşluk (Gaps) */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs font-medium text-slate-600 select-none">
            Boşluk
          </span>
          <div className="relative h-4 flex-1 rounded bg-slate-100 border border-slate-200 overflow-hidden">
            {/* Dark teal blocks for pauses */}
            {gaps.map((gap, idx) => {
              const startPct = (gap.start / duration) * 100;
              const widthPct = Math.max(3, ((gap.end - gap.start) / duration) * 100);
              return (
                <div
                  key={idx}
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                  }}
                  className="absolute top-0 bottom-0 bg-[#0e7490] rounded-xs"
                  title={`Boşluk: ${gap.start.toFixed(1)}s - ${gap.end.toFixed(1)}s`}
                />
              );
            })}
          </div>
        </div>

        {/* Track 3: Ürün (Product) */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs font-medium text-slate-600 select-none">
            Ürün
          </span>
          <div className="relative h-4 flex-1 rounded bg-slate-100 border border-slate-200 overflow-hidden">
            {/* Base track */}
          </div>
        </div>

        {/* Track 4: KVKK */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs font-medium text-slate-600 select-none">
            KVKK
          </span>
          <div className="relative h-4 flex-1 rounded bg-slate-100 border border-slate-200 overflow-hidden">
            {/* Base track */}
          </div>
        </div>

        {/* Track 5: Ritim (Beats) */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs font-medium text-slate-600 select-none">
            Ritim
          </span>
          <div className="relative h-5 flex-1 rounded bg-slate-100 border border-slate-200 flex items-center justify-between px-1 overflow-hidden">
            {beatTicks.map((b) => (
              <div
                key={b}
                className="h-3 w-px bg-emerald-700/80 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Timestamps: 00:00 & 00:45 */}
      <div className="mt-2 flex justify-between pl-15 text-[11px] font-mono text-slate-500">
        <span>00:00</span>
        <span>{project.duration_formatted || "00:45"}</span>
      </div>
    </div>
  );
}
