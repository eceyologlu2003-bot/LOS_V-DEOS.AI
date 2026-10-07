"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  FileVideo, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  AudioWaveform, 
  Scissors, 
  Wand2 
} from "lucide-react";
import { ProcessResponse } from "@/types";

interface VideoUploaderProps {
  onProcessSuccess: (data: ProcessResponse) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

const STAGES = [
  { id: 1, label: "AI Whisper Deşifre Ediyor...", sub: "Kelime bazlı zaman damgaları çıkarılıyor", icon: Wand2 },
  { id: 2, label: "Librosa Ses Analizi...", sub: "RMS akustik enerji ve vokal tepe noktaları hesaplanıyor", icon: AudioWaveform },
  { id: 3, label: "Hook Tespit Ediliyor...", sub: "GPT-4o ile mikro-retention kancası belirleniyor", icon: Sparkles },
  { id: 4, label: "FFmpeg Kurgulanıyor...", sub: "1.15x dinamik zoom ve 0. saniyeye montaj yapılıyor", icon: Scissors },
];

export default function VideoUploader({
  onProcessSuccess,
  isProcessing,
  setIsProcessing,
}: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Animated pipeline progress simulation while waiting for API
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessing) {
      setCurrentStageIndex(0);
      const stageDurations = [2500, 3000, 3500, 4000];

      const advanceStage = (index: number) => {
        if (index < STAGES.length - 1) {
          timer = setTimeout(() => {
            setCurrentStageIndex(index + 1);
            advanceStage(index + 1);
          }, stageDurations[index]);
        }
      };

      advanceStage(0);
    } else {
      setCurrentStageIndex(0);
    }
    return () => clearTimeout(timer);
  }, [isProcessing]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    const validExtensions = ["mp4", "mov", "webm", "mkv"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setErrorMessage("Lütfen geçerli bir video dosyası (.mp4, .mov, .webm) seçin.");
      return;
    }

    // 250MB limit warning
    if (file.size > 250 * 1024 * 1024) {
      setErrorMessage("Dosya boyutu çok büyük (Maksimum 250MB desteklenir).");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/api/process-video`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Sunucu hatası: ${response.statusText}`);
      }

      const data: ProcessResponse = await response.json();
      onProcessSuccess(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Video işlenirken beklenmeyen bir hata oluştu.";
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl transition-all">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UploadCloud className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              Ham Video Yükleme
            </h2>
            <p className="text-xs text-zinc-400">
              Konuşma içeren ham MP4 videonuzu yükleyin
            </p>
          </div>
        </div>
        <span className="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
          MP4 / MOV / WebM
        </span>
      </div>

      {/* Drag & Drop Zone */}
      {!isProcessing ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? "border-amber-400 bg-amber-500/10 scale-[0.99]"
              : "border-zinc-700/80 bg-zinc-950/40 hover:border-zinc-500 hover:bg-zinc-950/80"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:scale-110 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>

          <p className="mb-1 text-sm font-medium text-zinc-200">
            Videonuzu buraya sürükleyin veya <span className="text-amber-400 underline underline-offset-2">seçmek için tıklayın</span>
          </p>
          <p className="text-xs text-zinc-500">
            En iyi sonuç için konuşmacı içeren 15sn - 3dk arası dikey veya yatay video önerilir
          </p>

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/90 px-4 py-2 text-left shadow-lg">
              <FileVideo className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="max-w-[240px] truncate">
                <p className="text-xs font-medium text-zinc-200 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-zinc-400">{formatFileSize(selectedFile.size)}</p>
              </div>
              <span className="ml-auto flex items-center text-[11px] text-emerald-400 font-medium">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Hazır
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Processing Pipeline State with Animated Stepper */
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-inner">
          <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">AI Hook Engine Çalışıyor</h3>
                <p className="text-xs text-zinc-400">Mikro-retention kurgu analizi yapılıyor</p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-amber-400">
              {currentStageIndex + 1} / {STAGES.length}
            </span>
          </div>

          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isActive = idx === currentStageIndex;
              const isDone = idx < currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3 rounded-lg p-3 transition-all ${
                    isActive
                      ? "border border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : isDone
                      ? "border border-emerald-500/20 bg-emerald-500/5 text-zinc-300"
                      : "border border-transparent bg-zinc-900/30 text-zinc-500 opacity-60"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-medium ${
                      isActive
                        ? "bg-amber-500 text-black shadow-md shadow-amber-500/20 animate-pulse"
                        : isDone
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isActive ? (
                      <Icon className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${isActive ? "text-amber-300" : isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                      {stage.label}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">{stage.sub}</p>
                  </div>
                  {isActive && (
                    <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                      İşleniyor
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="flex-1">{errorMessage}</p>
        </div>
      )}

      {/* Action Button */}
      {!isProcessing && selectedFile && (
        <button
          onClick={handleSubmit}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4 fill-zinc-950" />
          Hook Engine'i Çalıştır &amp; Kurgula
        </button>
      )}
    </div>
  );
}
