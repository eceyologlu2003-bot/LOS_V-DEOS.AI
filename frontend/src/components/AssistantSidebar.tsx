"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Send, Loader2 } from "lucide-react";
import { ChatMessage, VideoProjectData } from "@/types";

interface AssistantSidebarProps {
  project: VideoProjectData;
  onAddStep: (step: string) => void;
}

const QUICK_PILLS = [
  "Hook Optimizer",
  "Kültürel NLP",
  "E-Ticaret",
  "Yerel Ritim",
  "KVKK & RTÜK",
];

export default function AssistantSidebar({ project, onAddStep }: AssistantSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with initial assistant message from screenshot
  useEffect(() => {
    const initialText =
      project.initial_assistant_message ||
      'Videoyu inceledim: 00:45 · 58 ritim vuruşu · 2 boşluk/duraklama bölgesi. En güçlü hook: "The only way to learn programming is to do it" (00:14–00:17). Ne yapmamı istersin? Yerelleştirme katmanlarından birini seçebilir ya da kendi cümlenle yazabilirsin — "abi şu boşlukları uçur, arkaya damar bir müzik at" gibi.';

    setMessages([
      {
        id: "msg-initial",
        sender: "ai",
        text: initialText,
      },
    ]);
  }, [project]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/chat-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          video_context: {
            title: project.title,
            duration: project.duration_seconds,
            hook: project.hook_analysis,
          },
        }),
      });

      if (!res.ok) throw new Error("Assistant response failed");

      const data = await res.json();
      const aiReply = data.reply || "Komutunuz başarıyla uygulandı.";

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiReply,
        },
      ]);

      if (data.actions && Array.isArray(data.actions)) {
        data.actions.forEach((act: string) => onAddStep(act));
      }
    } catch {
      // Local fallback cultural responses if offline
      let fallbackReply = `Komut uygulandı: "${query}". Sinyal rayındaki katmanlar güncellendi.`;
      const qLower = query.toLowerCase();

      if (qLower.includes("boşluk") || qLower.includes("uçur")) {
        fallbackReply =
          "Anında hallediyorum abi! Videodaki 2 duraklama bölgesini (3.2 saniye) jilet gibi budadım. Akış hızlandı.";
        onAddStep("2 duraklama bölgesi (boşluklar) budandı (-3.2s)");
      } else if (qLower.includes("müzik") || qLower.includes("damar") || qLower.includes("ritim")) {
        fallbackReply =
          "Eyvallah! Konuşmanın altına 9/8 yerel ritim vurgularına göre senkronize, vokali boğmayan dinamik bir altyapı döşedim.";
        onAddStep("9/8 yerel ritim vurgulu fon müziği entegre edildi");
      } else if (qLower.includes("hook")) {
        fallbackReply =
          "Hook optimizasyonu devrede! En çarpıcı 3 saniyelik cümle 1.15x zoom efektiyle videonun en başına alındı.";
        onAddStep("Hook segmenti kesildi ve 1.15x zoom ile başa eklendi");
      } else {
        onAddStep(`Uygulanan kurgu katmanı: ${query}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: fallbackReply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header matching Screenshot 1 & 2 */}
      <div>
        <div className="border-b border-slate-200 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#0284c7]" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">Kurgu asistanı</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kültürel NLP · Türkçe komut
          </p>
        </div>

        {/* Message Stream */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]/10 text-[#0284c7] border border-[#0284c7]/20">
                  <Sparkles className="h-4 w-4" />
                </div>
              )}

              <div
                className={`rounded-xl p-3 text-xs leading-relaxed max-w-[88%] ${
                  msg.sender === "user"
                    ? "bg-[#0284c7] text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0284c7]" />
              <span>Kurgu asistanı düşünüyor...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom Area: Quick Action Prompt Pills & Input Box */}
      <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
        {/* Quick Pills from Screenshot */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handleSendMessage(pill)}
              disabled={loading}
              className="rounded border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 transition"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Interactive Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder='Örn: "Abi şu boşlukları uçur, arkaya damar müzik at"'
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0284c7] focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="flex items-center gap-1.5 rounded-md bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white transition shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Gönder</span>
          </button>
        </form>
      </div>
    </div>
  );
}
