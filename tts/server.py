"""
Kokoro TTS FastAPI server for Korean (and other languages).
POST /synthesize with body {"text": "한글 텍스트"} returns WAV bytes.
Run: uvicorn server:app --reload --host 127.0.0.1 --port 8765
"""
from __future__ import annotations

import tempfile
from pathlib import Path

import soundfile as sf
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

# Lazy pipeline so first request loads the model
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None:
        from pykokoro import GenerationConfig, KokoroPipeline, PipelineConfig
        from pykokoro.stages.doc_parsers.plain import PlainTextDocumentParser

        # Korean: use lang="ko" (PyKokoro docs list Korean in supported languages).
        # PlainTextDocumentParser avoids loading spaCy, which triggers Pydantic v1
        # "unable to infer type for attribute REGEX" on Python 3.14.
        config = PipelineConfig(
            voice="af_bella",
            generation=GenerationConfig(lang="ko", speed=1.0),
        )
        _pipeline = KokoroPipeline(config, doc_parser=PlainTextDocumentParser())
    return _pipeline


app = FastAPI(title="Kokoro TTS", version="0.1.0")


class SynthesizeBody(BaseModel):
    text: str


@app.post("/synthesize")
def synthesize(body: SynthesizeBody) -> Response:
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    try:
        pipe = get_pipeline()
        result = pipe.run(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as f:
        path = Path(f.name)
        sf.write(path, result.audio, result.sample_rate)
        wav_bytes = path.read_bytes()

    return Response(
        content=wav_bytes,
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=tts.wav"},
    )


@app.get("/health")
def health() -> dict:
    return {"ok": True}
