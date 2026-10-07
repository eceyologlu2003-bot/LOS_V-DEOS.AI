import os
import sys
import re
import shutil
import subprocess
from pathlib import Path
from typing import Dict, Any, Tuple
import ffmpeg

def ensure_ffmpeg_path() -> None:
    """Ensure ffmpeg executable is available in PATH."""
    if shutil.which("ffmpeg"):
        return

    scripts_dir = Path(sys.executable).parent
    candidate = scripts_dir / ("ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")
    if candidate.exists():
        os.environ["PATH"] = str(scripts_dir) + os.pathsep + os.environ.get("PATH", "")
        return

    try:
        import imageio_ffmpeg
        ffmpeg_bin = Path(imageio_ffmpeg.get_ffmpeg_exe())
        if ffmpeg_bin.exists():
            bin_dir = ffmpeg_bin.parent
            std_name = bin_dir / ("ffmpeg.exe" if sys.platform == "win32" else "ffmpeg")
            if not std_name.exists():
                try:
                    shutil.copy2(ffmpeg_bin, std_name)
                except Exception:
                    pass
            os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")
    except Exception:
        pass


def _probe_video_metadata(video_path: str) -> Tuple[int, int, bool]:
    """
    Probes video dimensions (width, height) and checks if an audio stream exists.
    Returns (width, height, has_audio).
    """
    ensure_ffmpeg_path()
    res = subprocess.run(
        ["ffmpeg", "-i", video_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=False
    )
    stderr_out = res.stderr or ""

    # Parse video resolution
    match = re.search(r"Stream.*Video:.*?(\d{2,5})x(\d{2,5})", stderr_out)
    if match:
        w, h = int(match.group(1)), int(match.group(2))
    else:
        w, h = 1280, 720

    # Ensure even dimensions for H.264 macroblocks
    w = w - (w % 2)
    h = h - (h % 2)

    has_audio = "Audio:" in stderr_out
    return w, h, has_audio


def process_video_with_hook(input_path: str, output_path: str, hook_info: Dict[str, Any]) -> str:
    """
    Uses ffmpeg-python to:
    a) Cut the 3-5s Hook segment from hook_info['start_time'] to hook_info['end_time'].
    b) Apply a subtle zoom-in filter (scale=1.15) to the Hook segment via centered crop & scale.
    c) Concatenate the zoomed Hook segment to the very beginning (0.0s) of the original video.
    d) Save the final compiled video to output_path and return the file path.
    """
    ensure_ffmpeg_path()

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input video not found: {input_path}")

    # Extract Hook start and end times
    start_time = float(hook_info.get("start_time", 0.0))
    end_time = float(hook_info.get("end_time", start_time + 3.5))

    # Guarantee valid positive duration
    if end_time <= start_time or (end_time - start_time) < 1.0:
        end_time = start_time + 3.5

    # Probe resolution and audio track existence
    w, h, has_audio = _probe_video_metadata(input_path)

    # 1.15x Zoom calculation:
    # Cropping to 1/1.15 dimensions centered, then scaling back to original w x h
    zoom_factor = 1.15
    crop_w = int(w / zoom_factor)
    crop_w = crop_w - (crop_w % 2)
    crop_h = int(h / zoom_factor)
    crop_h = crop_h - (crop_h % 2)
    offset_x = f"({w}-{crop_w})/2"
    offset_y = f"({h}-{crop_h})/2"

    in_file = ffmpeg.input(input_path)

    # 1. Hook Video Stream: trim -> reset timestamps -> center crop -> scale to w,h -> setsar 1
    hook_v = (
        in_file.video
        .filter("trim", start=start_time, end=end_time)
        .filter("setpts", "PTS-STARTPTS")
        .filter("crop", crop_w, crop_h, offset_x, offset_y)
        .filter("scale", w, h)
        .filter("setsar", 1)
    )

    # 2. Original Video Stream: reset timestamps -> scale to w,h -> setsar 1
    orig_v = (
        in_file.video
        .filter("setpts", "PTS-STARTPTS")
        .filter("scale", w, h)
        .filter("setsar", 1)
    )

    # Output directory creation
    out_dir = Path(output_path).parent
    out_dir.mkdir(parents=True, exist_ok=True)

    if has_audio:
        # Hook Audio Stream: trim -> reset timestamps
        hook_a = (
            in_file.audio
            .filter("atrim", start=start_time, end=end_time)
            .filter("asetpts", "PTS-STARTPTS")
        )

        # Original Audio Stream: reset timestamps
        orig_a = (
            in_file.audio
            .filter("asetpts", "PTS-STARTPTS")
        )

        # Concatenate: [hook_v, hook_a] + [orig_v, orig_a]
        joined = ffmpeg.concat(hook_v, hook_a, orig_v, orig_a, v=1, a=1).node
        out = ffmpeg.output(
            joined[0], joined[1],
            output_path,
            vcodec="libx264",
            pix_fmt="yuv420p",
            preset="fast",
            crf=22,
            acodec="aac",
            audio_bitrate="192k",
            movflags="+faststart"
        )
    else:
        # Video-only concatenation
        joined = ffmpeg.concat(hook_v, orig_v, v=1, a=0).node
        out = ffmpeg.output(
            joined[0],
            output_path,
            vcodec="libx264",
            pix_fmt="yuv420p",
            preset="fast",
            crf=22,
            movflags="+faststart"
        )

    # Run FFmpeg compilation
    out.run(overwrite_output=True)

    return output_path
