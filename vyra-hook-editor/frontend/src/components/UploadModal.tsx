"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  FileVideo, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  Wand2, 
  AudioWaveform, 
  Scissors, 
  AlertCircle 
} from "lucide-react";
import { VideoProjectData } from "@/types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: VideoProjectData) => void;
  onLoadDefaultDemo: () => void;
}

const STAGES = [
  { id: 1, label: "AI Whisper Deşifre Ediyor...", sub: "Kelime bazlı zaman damgaları çıkarılıyor", icon: Wand2 },
  { id: 2, label: "Librosa Ses Analizi...", sub: "RMS akustik enerji ve ritim vuruşları hesaplanıyor", icon: AudioWaveform },
  { id: 3, label: "Hook Tespit Ediliyor...", sub: "GPT-4o ile mikro-retention kancası belirleniyor", icon: Sparkles },
  { id: 4, label: "FFmpeg Kurgulanıyor...", sub: "1.15x dinamik zoom ve 0. saniyeye montaj yapılıyor", icon: Scissors },
];

export default function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  onLoadDefaultDemo,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStageIndex(0);

    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/process-video`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Video işleme hatası");
      }

      const data = await res.json();
      onSuccess(data);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Video işlenirken beklenmeyen bir hata oluştu.";
      setErrorMessage(message);
    } finally {
      clearInterval(stageTimer);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-slate-800 mb-1">
          Yeni Video Yükle &amp; Kurgula
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Ham MP4 videonuzu yükleyin, los videos.ai anında analiz edip Hook katmanını hazırlasın.
        </p>

        {!isProcessing ? (
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100 hover:border-[#0284c7] transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="h-10 w-10 text-[#0284c7] mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : "Videonuzu seçmek için tıklayın"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">MP4, MOV veya WebM (Maks 250MB)</p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleUploadSubmit}
                disabled={!selectedFile}
                className="flex-1 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 py-2.5 text-xs font-semibold text-white transition shadow-sm"
              >
                Videonun Kurgusunu Başlat
              </button>

              <button
                onClick={() => {
                  onLoadDefaultDemo();
                  onClose();
                }}
                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition"
              >
                George Hotz Örneği
              </button>
            </div>
          </div>
        ) : (
          /* Multi-step Animated Progress Pipeline */
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#0284c7]" />
              <span>AI Kurgu Motoru Çalışıyor...</span>
            </div>

            {STAGES.map((stg, idx) => {
              const Icon = stg.icon;
              const isActive = idx === currentStageIndex;
              const isDone = idx < currentStageIndex;

              return (
                <div
                  key={stg.id}
                  className={`flex items-start gap-3 rounded-lg p-2.5 transition ${
                    isActive
                      ? "bg-[#0284c7]/10 border border-[#0284c7]/30 text-[#0284c7]"
                      : isDone
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border border-slate-100 text-slate-400 opacity-60"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Icon className={`h-4 w-4 ${isActive ? "animate-spin text-[#0284c7]" : ""}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{stg.label}</p>
                    <p className="text-[10px] text-slate-500">{stg.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
