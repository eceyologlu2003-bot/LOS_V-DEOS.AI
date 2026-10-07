import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "los videos.ai · Kurgu Stüdyosu | TR · MENA Yerelleştirme Katmanı",
  description: "AI-powered video editor with automated Micro-Retention Hook Engine, Whisper transcription, and Librosa rhythmic signal rail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#f1f5f9] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
