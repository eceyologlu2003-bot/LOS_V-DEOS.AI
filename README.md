# Vyra-TR Hook Edition: AI-Powered Micro-Retention Video Editor

> **Vyra-TR**, [usevyra.com](https://usevyra.com) vizyonundan ilham alan ve 100+ puanlık yenilikçi bir mikro-retention kancası (Micro-Retention Hook Engine) sunan tam teşekküllü bir yapay zeka video kurgulama uygulamasıdır.

Ham konuşmacı MP4 videolarınızı yükleyin; sistem arka planda:
1. **OpenAI Whisper** ile kelime bazlı hassas zaman damgaları çıkarır,
2. **Librosa** ile RMS akustik enerji eğrisini çıkarıp %80 persentil üstü tepe noktalarını tespit eder,
3. **OpenAI GPT-4o** ile merak aralığı (Curiosity Gap) ve yüksek enerjili iddialı 3-5 saniyelik en vurucu Hook segmentini belirler,
4. **FFmpeg** ile bu kanca segmentini kesip **1.15x dinamik zoom** efektiyle videonun 0. saniyesine (en başına) monte eder,
5. **Next.js 15 & Tailwind CSS** modern SaaS arayüzünde nihai videoyu ve AI karar matrisini sunar.

---

## 🚀 Hızlı Başlangıç (Nasıl Çalıştırılır?)

### 1. Backend Kurulumu & Başlatma (FastAPI)

```bash
# Backend dizinine geçin
cd backend

# (Opsiyonel) Virtual environment aktif edin (zaten hazır)
.\venv\Scripts\activate

# Gerekli bağımlılıkları yükleyin (zaten yüklü)
pip install -r requirements.txt

# .env dosyasına OpenAI API Key'inizi ekleyin
# OPENAI_API_KEY=sk-...

# FastAPI sunucusunu başlatın (Port: 8000)
python main.py
```
Sunucu `http://localhost:8000` adresinde çalışacaktır. API Dokümantasyonuna `http://localhost:8000/docs` adresinden erişebilirsiniz.

### 2. Frontend Kurulumu & Başlatma (Next.js 15)

```bash
# Frontend dizinine geçin
cd frontend

# Bağımlılıkları kontrol edin / yükleyin
npm install

# Geliştirme sunucusunu başlatın (Port: 3000)
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresini açarak uygulamayı kullanmaya başlayabilirsiniz!

---

## 📁 Proje Mimarisi

```
├── backend/
│   ├── uploads/               # Yüklenen ham videolar
│   ├── static/                # FFmpeg ile işlenmiş nihai MP4 videolar
│   ├── audio_processor.py     # Librosa RMS akustik enerji analizi & tepe noktası tespiti
│   ├── ai_agent.py            # GPT-4o mikro-retention kancası karar motoru
│   ├── video_editor.py        # FFmpeg-python 1.15x zoom ve 0.0s montaj motoru
│   ├── main.py                # FastAPI CORS & Whisper API endpointleri
│   ├── requirements.txt       # Python bağımlılıkları
│   └── .env                   # OpenAI API Anahtarı
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css    # Tailwind CSS v4 & koyu SaaS teması
    │   │   ├── layout.tsx     # Kök layout ve yazı tipleri
    │   │   └── page.tsx       # 2 kolonlu SaaS ana ekranı
    │   ├── components/
    │   │   ├── VideoUploader.tsx     # Drag & Drop ve 4 adımlı yükleme animasyonu
    │   │   ├── HookAnalysisCard.tsx  # AI karar matrisi, sarı vurgulu metin & rozetler
    │   │   └── VideoPlayer.tsx       # HTML5 player, zoom göstergesi & MP4 indirme butonu
    │   └── types/
    │       └── index.ts       # TypeScript arayüz tanımları
    └── package.json           # Next.js 15, React 19, Lucide React
```
