"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Maximize2 
} from "lucide-react";
import { VideoProjectData } from "@/types";

interface VideoPlayerCardProps {
  project: VideoProjectData;
}

export default function VideoPlayerCard({ project }: VideoPlayerCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(14.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const duration = project.duration_seconds || 45.0;

  // Sync simulated or real video playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (videoRef.current && project.processed_video_url) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    if (project.processed_video_url) {
      const a = document.createElement("a");
      a.href = project.processed_video_url;
      a.download = project.filename || "kurgu_ai_video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Demo kurgusu: Kendi MP4 videonuzu yükleyerek tam render çıktısını indirebilirsiniz.");
    }
  };

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Card Header matching Screenshot 1 */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-700">
          <Film className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[280px] sm:max-w-md">
            {project.title}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Önizleme · kurgu katmanları
        </span>
      </div>

      {/* Main Video Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden select-none">
        {project.processed_video_url ? (
          <video
            ref={videoRef}
            src={project.processed_video_url}
            className="w-full h-full object-contain"
            playsInline
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
          />
        ) : (
          /* Realistic George Hotz talking-head representation matching screenshot */
          <div 
            onClick={togglePlay}
            className="relative w-full h-full cursor-pointer flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950"
          >
            {/* Background talking head frame representation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-90 overflow-hidden">
              <svg viewBox="0 0 640 360" className="w-full h-full object-cover">
                <defs>
                  <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </radialGradient>
                </defs>
                <rect width="640" height="360" fill="url(#bgGrad)" />
                {/* Room curtain / wall background */}
                <rect x="0" y="0" width="220" height="360" fill="#1e293b" opacity="0.4" />
                <rect x="220" y="0" width="20" height="360" fill="#0f172a" opacity="0.6" />
                
                {/* Person silhouette / George Hotz hoodie representation */}
                <path d="M 230 360 C 235 270  260 210  320 205 C 380 210  405 270  410 360 Z" fill="#475569" />
                {/* Head */}
                <ellipse cx="320" cy="155" rx="52" ry="62" fill="#cbd5e1" />
                {/* Hair */}
                <path d="M 268 150 C 265 105  320 95  372 135 C 360 110  320 100  275 125 Z" fill="#334155" />
                {/* Hoodie collar & strings */}
                <path d="M 270 230 C 320 260  320 260  370 230" stroke="#334155" strokeWidth="4" fill="none" />
                {/* Microphone boom arm */}
                <line x1="80" y1="120" x2="255" y2="230" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
                <circle cx="255" cy="230" r="12" fill="#0f172a" />
                <rect x="240" y="240" width="28" height="60" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
              </svg>
            </div>
          </div>
        )}

        {/* OVERLAY 1: Top-Left AI HOOK Badge */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 rounded-sm bg-[#ea580c] px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
          <span className="text-[9px]">■</span>
          <span>AI HOOK</span>
        </div>

        {/* OVERLAY 2: Subtitle text in center/lower third */}
        <div className="absolute bottom-16 inset-x-0 z-20 flex justify-center text-center px-4 pointer-events-none">
          <p className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {project.subtitle_overlay}
          </p>
        </div>

        {/* OVERLAY 3: Bottom Hook Banner with Orange Border */}
        <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="rounded border-2 border-[#ea580c] bg-black/85 px-4 py-1.5 text-center shadow-2xl backdrop-blur-sm">
            <span className="font-mono text-xs sm:text-sm font-extrabold tracking-wide text-white">
              {project.bottom_hook_banner}
            </span>
          </div>
        </div>

        {/* Play/Pause Overlay indicator when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute z-30 flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-black/80"
          >
            <Play className="h-6 w-6 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Video Player Controls Bar */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <button
            onClick={() => setCurrentTime(0)}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-7 w-7 items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          <span className="font-mono text-slate-700 text-[11px] font-medium">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>
        </div>

        {/* Scrubber slider */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-4">
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
          />
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-md bg-[#0284c7] hover:bg-[#0369a1] px-3 py-1.5 text-xs font-semibold text-white transition shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          <span>İndir</span>
        </button>
      </div>
    </div>
  );
}
