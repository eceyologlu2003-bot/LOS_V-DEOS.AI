"use client";

import React from "react";
import { Layers, Sparkles, Mic, CheckCircle2 } from "lucide-react";
import { VideoProjectData } from "@/types";

interface PlanAndDetailsProps {
  project: VideoProjectData;
  editingSteps: string[];
}

export default function PlanAndDetails({ project, editingSteps }: PlanAndDetailsProps) {
  const hook = project.hook_analysis;
  const confidence = hook.confidence || 95;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* 1. Kurgu planı (Span 4 or 5) */}
      <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#0284c7]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Kurgu planı</h4>
            </div>
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-600">
              {editingSteps.length} adım
            </span>
          </div>

          {editingSteps.length === 0 ? (
            <p className="text-xs leading-relaxed text-slate-500">
              Henüz adım yok. Asistana Türkçe bir kurgu komutu yaz — plan burada adım adım görünür, uygulanabilen katmanlar oynatıcıda anında önizlenir.
            </p>
          ) : (
            <div className="space-y-2">
              {editingSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Hook optimizasyonu (Span 4) */}
      <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#ea580c]" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">Hook optimizasyonu</h4>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {hook.start_formatted || "00:14"} — {hook.end_formatted || "00:17"}
            </span>
          </div>

          <p className="text-xs font-bold text-slate-900 mb-2 leading-snug">
            &ldquo;{hook.hook_text}&rdquo;
          </p>

          <p className="text-xs leading-relaxed text-slate-500 mb-4">
            {hook.reasoning}
          </p>
        </div>

        {/* Confidence progress bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
            <span></span>
            <span>Güven %{confidence}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              style={{ width: `${confidence}%` }}
              className="h-full bg-[#0284c7] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Whisper deşifresi (Span 4) */}
      <div className="md:col-span-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#0284c7]" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-800">Whisper deşifresi</h4>
          </div>
        </div>

        <div className="flex-1 max-h-36 overflow-y-auto pr-2 rounded bg-slate-50 border border-slate-100 p-2.5">
          <p className="text-xs leading-relaxed text-slate-600 select-text">
            {project.transcript.text}
          </p>
        </div>
      </div>
    </div>
  );
}
