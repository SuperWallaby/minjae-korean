#!/usr/bin/env python3
"""Run a blog article through multiple de-AI passes (from substack pipeline)."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PASS_NAMES = ["strip", "humanize", "roughen", "highlight", "proof"]

BANNED_PHRASES = [
    "cognitive debt",
    "literacy of attention",
    "literacy-of-attention",
    "taste intelligence",
    "the pattern I keep noticing",
    "what surprised me is",
    "cementing inequality",
    "democratizing skill",
    "a bleak synthesis",
    "it's not x, it's y",
]

BANNED_REGEX = [
    re.compile(r"\bit's not .+, it's .+\b", re.I),
    re.compile(r"\bthat's not .+, (it's|that'?s) .+\b", re.I),
]

PASS_PROMPTS = {
    "strip": """You are a de-AI editor. PASS 1: STRIP structural AI patterns and summary/listicle shape.

Rewrite the article below. Keep the core thesis, facts, numbers, title, subtitle, and source line.
Do NOT add new information. Do NOT invent personal experiences.

REMOVE:
- Listicle structure (Top N, ranked items, "what to do instead")
- Source-following structure (study-by-study retelling)
- One-line paragraphs stacked for drama
- --- horizontal rules between sections
- "That's not X. That's Y." / symmetrical antithesis
- "Here's the truth" / "The part nobody talks about" / "Let me explain"
- "Guess which one?" / "But it got worse." / "And here's the kicker."
- Motivational poster closers
- Excessive rhetorical questions
- ALL semicolons (;) — replace with periods, commas, or "and"

If the article is an opinion essay, it must read as an opinionated essay, not a summary.
If the article is an SEO learning guide, preserve the useful guide structure: # title, ## section headers, Korean examples, Common Mistakes, and FAQ.
In both cases, if it can be reverse-engineered to source section order, restructure.

Return ONLY the rewritten markdown article. No commentary.""",

    "humanize": """You are a de-AI editor. PASS 2: HUMANIZE as reflective essay voice.

Rewrite the article below. Keep thesis, facts, numbers, title, subtitle, source line.
Do NOT add new information. Do NOT invent fake personal stories ("last week I tried...").

ADD:
- Observations and interpretations ("I suspect", "my take", "most people assume")
- Occasional skepticism
- Contractions (don't, it's, I'd, you're)
- Plain section titles
- Mixed paragraph lengths (some 4-6 lines, some short blunt ones)
- Preserve helpful SEO guide elements when present: ## headers, Korean examples, Common Mistakes, FAQ

AVOID:
- Semicolons (;)
- Overused AI openers: "what surprised me", "the pattern I keep noticing" (use sparingly or skip)
- Listicles, report tone, fake experiences

Return ONLY the rewritten markdown article. No commentary.""",

    "roughen": """You are a de-AI editor. PASS 3: ROUGHEN — remove Claude-style phrasebook and uniform polish.

Rewrite the article below. Keep thesis, facts, numbers, title, subtitle, source line, and any useful guide/FAQ structure.

REPLACE coined AI label phrases with plain speech:
- "cognitive debt" → explain plainly (borrow thinking now, pay later / skipped the hard part)
- "literacy of attention" → plain words (paying attention, following an argument)
- "taste intelligence" → plain words (knowing what's good, having an eye)
- "cementing inequality" → making the gap harder to close
- "democratizing" → say what actually happens
- "agency" as buzzword → be specific
- "amplification/amplifier" → only if needed; prefer simpler words
- "landscape", "navigate", "delve", "unpack" → delete or replace
- "it's not X, it's Y" → two normal sentences

ROUGHEN prose (humans are not uniformly polished):
- Per major section, add ONE slightly imperfect element: casual aside ("OK anyway"), half-formed thought, blunt short sentence after a long one, mild tangent, or wobbly analogy
- NOT every sentence should sound quotable
- Vary rhythm — some rambly, some stubby

Do NOT invent fake personal stories. Do NOT use semicolons.

Return ONLY the rewritten markdown article. No commentary.""",

    "highlight": """You are a de-AI editor. PASS 4: HIGHLIGHT key sentences.

Edit the article below. Do NOT rewrite. Only add **bold** around full sentences.
Preserve all # and ## markdown headers exactly unless they contain obvious AI wording.

Rules:
- Bold 1-2 KEY SENTENCES per section — sentences that carry the thesis or a sharp insight
- Wrap the ENTIRE sentence in **bold**
- Do NOT bold individual words, terms, or stats
- Remove any existing word-level bold

Return ONLY the markdown article. No commentary.""",

    "proof": """You are a de-AI editor. PASS 5: PROOF read for remaining AI smell.

Read the article. Fix anything that still sounds LLM-generated.

Catch:
- Semicolons (;) — zero allowed
- Missing `##` section headers — restore them if stripped
- Coined phrases: cognitive debt, literacy of attention, taste intelligence, "the pattern I keep noticing", "what surprised me is", cementing inequality
- Every sentence equally polished — roughen one more spot if needed
- Listicle / summary structure
- Invented personal experiences
- "That's not X. That's Y."

Keep facts, title, subtitle, source line, sentence-level **bold**. No word-level bold.

Return ONLY the final markdown article. No commentary.""",
}


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            env[key] = value.strip().strip('"').strip("'")
    return env


def load_all_env() -> dict[str, str]:
    merged: dict[str, str] = {}
    for name in [".env.local", ".env"]:
        merged.update(load_env(ROOT / name))
    return merged


def chat(
    endpoint: str,
    api_key: str,
    deployment: str,
    system: str,
    user: str,
    api_version: str = "2024-08-01-preview",
) -> str:
    url = f"{endpoint.rstrip('/')}/openai/deployments/{deployment}/chat/completions?api-version={api_version}"
    payload = {
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.7,
        "max_completion_tokens": 8000,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"api-key": api_key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        result = json.loads(resp.read().decode())
    return result["choices"][0]["message"]["content"].strip()


def strip_code_fence(text: str) -> str:
    if text.startswith("```"):
        lines = text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        return "\n".join(lines).strip()
    return text


def check_banned_phrases(text: str) -> list[str]:
    lower = text.lower()
    hits = [p for p in BANNED_PHRASES if p in lower]
    for rx in BANNED_REGEX:
        if rx.search(text):
            hits.append(f"regex:{rx.pattern}")
    return hits


def run_passes(
    article: str,
    passes: list[str],
    endpoint: str,
    api_key: str,
    deployment: str,
) -> str:
    current = article
    for i, name in enumerate(passes, 1):
        print(f"  Pass {i}/{len(passes)}: {name}...")
        prompt = PASS_PROMPTS[name]
        raw = chat(endpoint, api_key, deployment, prompt, current)
        current = strip_code_fence(raw)
        print(f"    Done ({len(current)} chars)")
    return current


def main() -> int:
    parser = argparse.ArgumentParser(description="De-AI blog article pipeline")
    parser.add_argument("input", help="Input markdown file (draft)")
    parser.add_argument("--out", required=True, help="Output markdown file (final)")
    parser.add_argument(
        "--passes",
        type=int,
        default=5,
        choices=[1, 2, 3, 4, 5],
        help="Passes: 1=strip, 2=+humanize, 3=+roughen, 4=+highlight, 5=+proof (default: 5)",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.is_absolute():
        input_path = ROOT / input_path
    if not input_path.exists():
        print(f"File not found: {input_path}", file=sys.stderr)
        return 1

    env = load_all_env()
    endpoint = env.get("AZURE_OPENAI_ENDPOINT")
    api_key = env.get("AZURE_OPENAI_API_KEY")
    deployment = (
        env.get("BLOG_AZURE_DEPLOYMENT")
        or env.get("AZURE_OPENAI_DEPLOYMENT_CHAT")
        or env.get("AZURE_OPENAI_DEPLOYMENT")
        or "trx-gpt-4-1-mini"
    )

    if not all([endpoint, api_key]):
        print("Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY in .env.local", file=sys.stderr)
        return 1

    article = input_path.read_text()
    passes = PASS_NAMES[: args.passes]

    print(f"Input:  {input_path.relative_to(ROOT)} ({len(article)} chars)")
    print(f"Passes: {', '.join(passes)}")

    try:
        result = run_passes(article, passes, endpoint, api_key, deployment)
    except urllib.error.HTTPError as e:
        print(f"API error {e.code}: {e.read().decode()}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = ROOT / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(result + "\n")

    failed = False
    semicolon_count = result.count(";")
    if semicolon_count:
        print(f"  WARNING: {semicolon_count} semicolon(s) found", file=sys.stderr)
        failed = True

    banned = check_banned_phrases(result)
    if banned:
        print(f"  WARNING: banned phrase(s) still present: {', '.join(banned)}", file=sys.stderr)
        failed = True

    print(f"Output: {out_path.relative_to(ROOT)} ({len(result)} chars)")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
