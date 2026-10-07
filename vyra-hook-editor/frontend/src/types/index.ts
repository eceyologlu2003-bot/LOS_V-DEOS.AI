export interface HookAnalysis {
  hook_text: string;
  hook_type: string;
  start_time: number;
  end_time: number;
  start_formatted?: string;
  end_formatted?: string;
  confidence?: number;
  reasoning: string;
  keywords_to_highlight?: string[];
}

export interface GapRegion {
  start: number;
  end: number;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptData {
  text: string;
  words?: WordTimestamp[];
}

export interface VideoProjectData {
  title: string;
  short_title: string;
  duration_formatted: string;
  duration_seconds: number;
  beats_count: number;
  beat_interval: number;
  measure: string;
  gaps: GapRegion[];
  hook_analysis: HookAnalysis;
  subtitle_overlay: string;
  bottom_hook_banner: string;
  transcript: TranscriptData;
  processed_video_url?: string;
  filename?: string;
  initial_assistant_message?: string;
}

export interface ProcessResponse {
  status: string;
  processed_video_url: string;
  filename: string;
  transcript: TranscriptData;
  hook_analysis: HookAnalysis;
  acoustic_peaks?: number[];
  beats_count?: number;
  beat_interval?: number;
  gaps?: GapRegion[];
  title?: string;
  short_title?: string;
}

export interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp?: string;
  actions?: string[];
}
