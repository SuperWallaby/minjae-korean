#!/usr/bin/env python3
"""
Print a single JSON object to stdout: {"text":"..."} or {"error":"..."}.
Always exits 0 so callers can parse stdout (check the "error" field on failure).
Used by youtube_personal_digest.mjs (no YouTube Data API key required for captions).

  yarn youtube:transcript-install   # repo .venv-youtube
  .venv-youtube/bin/python3 scripts/youtube_transcript_fetch.py VIDEO_ID [en,ko,hi]

If preferred languages fail (e.g. video only has hi auto-captions), falls back to
the first transcript that returns non-empty text from list().
"""

from __future__ import annotations

import json
import sys


def _join_text(fetched) -> str:
    return " ".join(s.text for s in fetched).replace("\n", " ").strip()


def _try_preferred(api, video_id: str, langs: list[str]) -> tuple[str | None, str | None]:
    """Return (text_or_none, error_message_or_none)."""
    if not langs:
        return None, None
    try:
        fetched = api.fetch(video_id, languages=tuple(langs))
    except Exception as e:
        return None, str(e)
    t = _join_text(fetched)
    return (t, None) if t else (None, "preferred_languages_returned_empty")


def _fetch_any_from_list(api, video_id: str, langs: list[str]) -> tuple[str | None, str | None]:
    """Return (text, error_detail) — text None if nothing worked."""
    try:
        tl = api.list(video_id)
    except Exception as e:
        return None, f"list(): {e}"

    for code in langs:
        try:
            tr = tl.find_transcript([code])
            fetched = tr.fetch()
            t = _join_text(fetched)
            if t:
                return t, None
        except Exception:
            continue

    for tr in tl:
        try:
            fetched = tr.fetch()
            t = _join_text(fetched)
            if t:
                return t, None
        except Exception:
            continue

    return None, "no_transcript_with_text_after_listing"


def main() -> None:
    """
    Always prints one JSON line to stdout.
    Exit code is always 0 so Node execFile can parse stdout (use JSON \"error\" for failures).
    """
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: youtube_transcript_fetch.py VIDEO_ID [en,ko,hi]"}))
        return

    video_id = sys.argv[1].strip()
    if not video_id:
        print(json.dumps({"error": "missing VIDEO_ID"}))
        return

    raw_langs = sys.argv[2] if len(sys.argv) > 2 else "en,ko,hi"
    langs = [x.strip() for x in raw_langs.split(",") if x.strip()]

    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        print(
            json.dumps(
                {
                    "error": "Missing package: pip install youtube-transcript-api "
                    "(see requirements-youtube.txt)",
                },
            ),
        )
        return

    api = YouTubeTranscriptApi()

    text, preferred_err = _try_preferred(api, video_id, langs)
    if text:
        print(json.dumps({"text": text}, ensure_ascii=False))
        return

    text2, list_err = _fetch_any_from_list(api, video_id, langs)
    if text2:
        print(json.dumps({"text": text2}, ensure_ascii=False))
        return

    parts = []
    if preferred_err:
        parts.append(preferred_err)
    if list_err:
        parts.append(list_err)
    print(json.dumps({"error": " | ".join(parts) or "unknown_transcript_error"}))


if __name__ == "__main__":
    main()
