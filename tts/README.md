# Kokoro TTS service (Korean)

Used by the article editor to generate Korean audio from text.

## Setup

From the project root:

```bash
python3 -m venv tts/venv
source tts/venv/bin/activate   # Windows: tts\venv\Scripts\activate
pip install -r tts/requirements.txt
```

## Run

From the project root (so that `tts/server.py` is importable):

```bash
source tts/venv/bin/activate
uvicorn tts.server:app --reload --host 127.0.0.1 --port 8765
```

Or from inside `tts/`:

```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8765
```

Then the Next.js app can call `POST http://127.0.0.1:8765/synthesize` with `{"text": "한글 텍스트"}` to get WAV bytes.

Set `TTS_SERVICE_URL=http://127.0.0.1:8765` in `.env` if you use a different host/port.

## Notes

- **Python 3.14**: The server uses `PlainTextDocumentParser` so that spaCy is not loaded (spaCy’s Pydantic v1 usage can raise “unable to infer type for attribute REGEX” on Python 3.14). If you see other compatibility issues, use Python 3.12 or 3.13 for the TTS venv.
- **Korean**: Korean G2P requires `nltk`; it is listed in `requirements.txt`.
