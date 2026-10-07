"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import VideoPlayerCard from "@/components/VideoPlayerCard";
import SignalRail from "@/components/SignalRail";
import PlanAndDetails from "@/components/PlanAndDetails";
import AssistantSidebar from "@/components/AssistantSidebar";
import UploadModal from "@/components/UploadModal";
import { VideoProjectData } from "@/types";

const DEFAULT_PROJECT: VideoProjectData = {
  title: "_Yazılım öğrenmenin tek yolu..._ - George Hot...",
  short_title: "_Yazılım öğrenmenin tek yolu..._ - Georg...",
  duration_formatted: "00:45",
  duration_seconds: 45.0,
  beats_count: 58,
  beat_interval: 0.45,
  measure: "9/8",
  gaps: [
    { start: 2.0, end: 7.5 },
    { start: 39.0, end: 44.5 }
  ],
  hook_analysis: {
    hook_text: "The only way to learn programming is to do it",
    hook_type: "High Energy Peak",
    start_time: 14.0,
    end_time: 17.0,
    start_formatted: "00:14",
    end_formatted: "00:17",
    confidence: 95,
    reasoning: "En yüksek ses enerjisine sahip ve videonun temel iddiasını en net, harekete geçirici şekilde özetleyen bölüm olduğu için seçilmiştir.",
    keywords_to_highlight: ["programming", "learn", "do it"]
  },
  subtitle_overlay: "hepsi aynı yoldan öğrendi",
  bottom_hook_banner: "THE ONLY WAY TO LEARN PROGRAMMING IS TO DO IT",
  transcript: {
    text: "On how to get into programming. You are never going to learn programming by watching a video called Learn Programming. The only way to learn programming, I think, and the only way everyone I've ever met who can program well learned it all in the same way. They had something they wanted to do, and then they tried to do it. And then they were like, Oh, well, okay, this is kind of, you know, it'd be nice if the computer could kind of do this. And then, you know, that's how you learn. You just keep pushing on a project. So the only advice I have for learning programming is on program."
  },
  initial_assistant_message:
    "Videoyu inceledim: 00:45 · 58 ritim vuruşu · 2 boşluk/duraklama bölgesi. " +
    'En güçlü hook: "The only way to learn programming is to do it" (00:14–00:17). ' +
    "Ne yapmamı istersin? Yerelleştirme katmanlarından birini seçebilir ya da kendi cümlenle yazabilirsin " +
    '— "abi şu boşlukları uçur, arkaya damar bir müzik at" gibi.',
};

export default function Home() {
  const [project, setProject] = useState<VideoProjectData>(DEFAULT_PROJECT);
  const [editingSteps, setEditingSteps] = useState<string[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);

  const handleAddStep = (step: string) => {
    setEditingSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const handleUploadSuccess = (data: VideoProjectData) => {
    setProject(data);
    setEditingSteps([
      "Hook segmenti kesildi ve 1.15x zoom ile başa monte edildi",
      "Akustik tepe noktaları (%80 RMS) analiz edildi"
    ]);
  };

  const handleResetToDemo = () => {
    setProject(DEFAULT_PROJECT);
    setEditingSteps([]);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col font-sans">
      {/* Top Header matching screenshots */}
      <Header
        shortTitle={project.short_title}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Video Player + Signal Rail + 3 Cards) */}
          <div className="lg:col-span-8 space-y-4">
            <VideoPlayerCard project={project} />
            <SignalRail project={project} />
            <PlanAndDetails project={project} editingSteps={editingSteps} />
          </div>

          {/* Right Column (Kurgu Asistanı Chat) */}
          <div className="lg:col-span-4 sticky top-4">
            <div className="h-[calc(100vh-110px)] min-h-[640px]">
              <AssistantSidebar project={project} onAddStep={handleAddStep} />
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        onLoadDefaultDemo={handleResetToDemo}
      />
    </div>
  );
}
