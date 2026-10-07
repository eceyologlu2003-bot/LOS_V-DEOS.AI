"use client";

import React from "react";
import { 
  Sparkles, 
  Clock, 
  Flame, 
  Tag, 
  Zap, 
  HelpCircle, 
  Activity, 
  Layers, 
  CheckCircle 
} from "lucide-react";
import { HookAnalysis } from "@/types";

interface HookAnalysisCardProps {
  hookData: HookAnalysis | null;
  acousticPeaks?: number[];
  fullTranscriptText?: string;
}

export default function HookAnalysisCard({
  hookData,
  acousticPeaks = [],
  fullTranscriptText,
}: HookAnalysisCardProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getHookBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "curiosity gap":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      case "high energy peak":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "bold claim":
        return "bg-rose-500/10 text-rose-300 border-rose-500/30";
      case "contrarian take":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    }
  };

  if (!hookData) {
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
                AI Hook Karar Matrisi
              </h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Beklemede</span>
          </div>

          <div className="my-12 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600 shadow-inner">
              <Layers className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">Henüz Video İşlenmedi</h3>
            <p className="mt-1.5 max-w-xs text-xs text-zinc-500">
              Sol taraftan bir MP4 video yükleyin. OpenAI Whisper ve Librosa RMS tepe noktaları analiz edilerek en yüksek izlenme getiren 3 saniyelik Hook burada listelenecektir.
            </p>
          </div>
        </div>

        {/* Feature summary preview */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Vyra-TR Algoritması Nasıl Çalışır?
          </p>
          <div className="space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span>Librosa ile RMS ses genlik tepe noktaları (%80 üstü) taranır.</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
              <span>GPT-4o merak uyandıran veya iddialı cümleleri puanlar.</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>FFmpeg 1.15x zoom efektiyle Hook'u videonun 0. saniyesine yerleştirir.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const duration = (hookData.end_time - hookData.start_time).toFixed(1);

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl">
      <div>
        {/* Card Header */}
        <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
                AI Hook Karar Matrisi
              </h2>
              <p className="text-xs text-zinc-400">GPT-4o &amp; Librosa Analiz Sonucu</p>
            </div>
          </div>

          {/* Hook Type Badge */}
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${getHookBadgeStyle(
              hookData.hook_type
            )}`}
          >
            {hookData.hook_type}
          </span>
        </div>

        {/* Selected Hook Highlight Banner */}
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-zinc-950 p-4 shadow-lg shadow-amber-500/5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Seçilen Kanca Cümlesi (Hook):
            </span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
              {duration} sn
            </span>
          </div>

          {/* Bold highlighted text with yellow background */}
          <div className="rounded-lg bg-amber-400/95 p-3.5 text-zinc-950 shadow-inner">
            <p className="text-sm font-bold leading-relaxed tracking-normal">
              &ldquo;{hookData.hook_text}&rdquo;
            </p>
          </div>
        </div>

        {/* Exact Timestamp & Metadata Metrics */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Zaman Damgası Aralığı</span>
            </div>
            <p className="text-base font-mono font-bold text-zinc-100">
              {formatTime(hookData.start_time)} - {formatTime(hookData.end_time)}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              ({hookData.start_time.toFixed(2)}s - {hookData.end_time.toFixed(2)}s)
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Akustik Enerji Tepe Noktaları</span>
            </div>
            <p className="text-base font-mono font-bold text-emerald-400">
              {acousticPeaks.length} Peak Tespit Edildi
            </p>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
              RMS 80th Percentile
            </p>
          </div>
        </div>

        {/* AI Reasoning Section */}
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Seçim Gerekçesi (Retention Mantığı):</span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-300">
            {hookData.reasoning}
          </p>
        </div>

        {/* Highlighted Keywords Badges */}
        {hookData.keywords_to_highlight && hookData.keywords_to_highlight.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Tag className="h-3.5 w-3.5 text-amber-400" />
              <span>Vurgulanan Anahtar Kelimeler:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hookData.keywords_to_highlight.map((kw, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applied FFmpeg Effect Banner */}
      <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>FFmpeg 1.15x Zoom efekti ile 0. saniyeye monte edildi.</span>
        </div>
        <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded font-medium">
          scale=1.15
        </span>
      </div>
    </div>
  );
}
