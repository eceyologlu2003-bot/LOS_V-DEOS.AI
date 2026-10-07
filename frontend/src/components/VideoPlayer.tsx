"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize2, 
  Sparkles, 
  Film,
  ZoomIn
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  filename?: string;
  hookDuration?: number;
  onReset?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  filename = "vyra_hook_edited.mp4",
  hookDuration = 3.5,
  onReset,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHookPlaying, setIsHookPlaying] = useState<boolean>(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // If current playback time is within the initial hook segment, indicate it
      setIsHookPlaying(video.currentTime < hookDuration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [hookDuration]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl backdrop-blur-xl">
      {/* Player Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
              Kurgulanmış Final Video
            </h2>
            <p className="text-xs text-zinc-400">
              Hook segmenti 1.15x zoom ile 0.0s&apos;ye eklendi
            </p>
          </div>
        </div>

        {/* Dynamic Zoom Badge indicator */}
        <div className="flex items-center gap-2">
          {isHookPlaying && (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300 animate-pulse">
              <ZoomIn className="h-3 w-3" />
              1.15x Zoom Hook Aktif
            </span>
          )}
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            FFmpeg Render Tamamlandı
          </span>
        </div>
      </div>

      {/* HTML5 Video Display Container */}
      <div className="relative group overflow-hidden rounded-xl border border-zinc-800 bg-black aspect-video flex items-center justify-center shadow-inner">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          className="h-full w-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Center Play Overlay Icon when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/90 text-zinc-950 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-amber-400 active:scale-95"
          >
            <Play className="h-7 w-7 fill-zinc-950 ml-1" />
          </button>
        )}

        {/* Video Overlay Info for Hook Segment */}
        {isHookPlaying && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/70 border border-amber-500/40 px-2.5 py-1 text-[11px] font-mono text-amber-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>00:00 - {formatSeconds(hookDuration)} [Vurgulu Hook Segmenti]</span>
          </div>
        )}
      </div>

      {/* Custom Video Controls Bar */}
      <div className="mt-4 space-y-2">
        {/* Progress Timeline Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />
        </div>

        {/* Controls and Actions */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
              title={isPlaying ? "Duraklat" : "Oynat"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            <button
              onClick={handleRestart}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
              title="Başa Sar"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition"
              title={isMuted ? "Sesi Aç" : "Sessize Al"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <span className="font-mono text-zinc-300 text-xs">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onReset && (
              <button
                onClick={onReset}
                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition"
              >
                Yeni Video Yükle
              </button>
            )}

            {/* Required Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-zinc-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Kurgulanmış MP4 İndir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
