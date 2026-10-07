import os
import json
import logging
from typing import List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger("ai_agent")

def _fallback_hook_selection(transcript_data: Dict[str, Any], acoustic_peaks: List[float]) -> Dict[str, Any]:
    """
    Intelligent fallback hook detector when OpenAI API key is not configured or offline.
    Uses acoustic energy peaks and word-level timestamps to select an optimal 3.5s window.
    """
    words = transcript_data.get("words", [])
    full_text = transcript_data.get("text", "")

    # Default fallback timestamps
    start_time = 0.0
    end_time = 4.0
    hook_text = "En çarpıcı anı yakalayın ve izleyicinin dikkatini ilk 3 saniyede çekin!"
    keywords = ["dikkatini", "ilk 3 saniyede", "en çarpıcı"]

    if words and len(words) > 0:
        # If we have acoustic peaks, find the peak with highest concentration or center
        target_time = acoustic_peaks[0] if acoustic_peaks else words[0].get("start", 0.0)

        # Find word closest to target_time
        closest_idx = 0
        min_diff = float("inf")
        for idx, w in enumerate(words):
            diff = abs(w.get("start", 0.0) - target_time)
            if diff < min_diff:
                min_diff = diff
                closest_idx = idx

        # Expand window around closest_idx to get ~3.5-4.5 seconds
        w_start = words[closest_idx].get("start", 0.0)
        selected_words = []
        cur_end = w_start
        for w in words[closest_idx:]:
            cur_end = w.get("end", cur_end)
            selected_words.append(w.get("word", ""))
            if (cur_end - w_start) >= 3.5:
                break

        if selected_words:
            hook_text = " ".join(selected_words).strip()
            start_time = round(float(w_start), 2)
            end_time = round(float(cur_end), 2)
            keywords = [w for w in selected_words if len(w) > 4][:3]
    elif full_text:
        hook_text = full_text[:80]

    return {
        "hook_text": hook_text,
        "hook_type": "High Energy Peak" if acoustic_peaks else "Curiosity Gap",
        "start_time": max(0.0, start_time),
        "end_time": max(start_time + 3.0, end_time),
        "reasoning": (
            f"Acoustic peak analizi ({target_time if acoustic_peaks else 0.0:.2f}s) ve kelime zaman damgaları "
            f"incelenerek en yüksek vokal enerjisine sahip 3-5 saniyelik mikro-retention kancası seçildi. "
            f"Bu aralık izleyicinin videoda kalma oranını ve swipe-away bariyerini aşmayı hedefler."
        ),
        "keywords_to_highlight": keywords if keywords else ["kanca", "retention", "dikkat"]
    }


def discover_hook_and_editing_plan(transcript_data: Dict[str, Any], acoustic_peaks: List[float]) -> Dict[str, Any]:
    """
    Calls OpenAI GPT-4o with response_format={"type": "json_object"}.
    Passes the transcript, word-level timestamps, and acoustic peaks.
    Instructs GPT-4o to select a 3-5 second "Hook" based on curiosity gap,
    high energy peaks, or bold claims.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    # If API key is dummy or not provided, run intelligent local heuristic fallback
    if not api_key or api_key in ("your_key_here", "sk-placeholder", ""):
        logger.warning("OPENAI_API_KEY is not configured or dummy. Using local heuristic hook detector.")
        return _fallback_hook_selection(transcript_data, acoustic_peaks)

    client = OpenAI(api_key=api_key, timeout=5.0, max_retries=0)

    transcript_text = transcript_data.get("text", "")
    words = transcript_data.get("words", [])

    system_instruction = (
        "You are the Lead Micro-Retention Architect and Viral Video Editor for Vyra-TR. "
        "Your task is to analyze talking-head video transcripts, word-level timestamps, and acoustic RMS energy peaks "
        "to pinpoint the single most captivating 3 to 5 second 'Hook' segment that will immediately stop the scroll.\n\n"
        "HOOK SELECTION RULES:\n"
        "1. Duration MUST be strictly between 3.0 and 5.5 seconds (end_time - start_time).\n"
        "2. Hook Types: 'Curiosity Gap', 'High Energy Peak', 'Bold Claim', 'Contrarian Take', or 'Shocking Statement'.\n"
        "3. Align start_time and end_time precisely with the natural spoken boundaries of words.\n"
        "4. Prioritize moments that align with high acoustic energy peaks and emotionally charged claims.\n"
        "5. Return a strict JSON object with EXACT keys:\n"
        "   - 'hook_text': (string) Exact words spoken in this segment\n"
        "   - 'hook_type': (string) One of the hook classifications\n"
        "   - 'start_time': (float) Precise start timestamp in seconds\n"
        "   - 'end_time': (float) Precise end timestamp in seconds\n"
        "   - 'reasoning': (string) In-depth explanation of WHY this specific hook drives retention\n"
        "   - 'keywords_to_highlight': (list of strings) 2-4 impactful power words"
    )

    user_payload = {
        "full_transcript": transcript_text,
        "word_level_timestamps": words,
        "acoustic_energy_peaks_seconds": acoustic_peaks
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_instruction},
                {
                    "role": "user",
                    "content": f"Analyze this video data and produce the optimal Hook editing plan:\n{json.dumps(user_payload, ensure_ascii=False)}"
                }
            ],
            temperature=0.25,
        )

        content = response.choices[0].message.content or "{}"
        plan = json.loads(content)

        # Validate structure and sanitize values
        start_time = float(plan.get("start_time", 0.0))
        end_time = float(plan.get("end_time", start_time + 3.5))

        # Ensure valid positive interval of at least 2.5 seconds
        if end_time <= start_time or (end_time - start_time) < 2.0:
            end_time = start_time + 3.5

        return {
            "hook_text": str(plan.get("hook_text", "")).strip(),
            "hook_type": str(plan.get("hook_type", "Curiosity Gap")),
            "start_time": round(start_time, 2),
            "end_time": round(end_time, 2),
            "reasoning": str(plan.get("reasoning", "")).strip(),
            "keywords_to_highlight": list(plan.get("keywords_to_highlight", []))
        }

    except Exception as e:
        logger.error(f"OpenAI GPT-4o Hook generation error: {e}. Falling back to acoustic analysis.")
        return _fallback_hook_selection(transcript_data, acoustic_peaks)
