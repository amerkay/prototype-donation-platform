#!/usr/bin/env python3
"""
Extract Claude Code prompts and AskUserQuestion Q&A from session files.

Usage:
    python scripts/extract-prompts.py          # last 3 sessions (default)
    python scripts/extract-prompts.py 10       # last 10 sessions
    python scripts/extract-prompts.py --all    # all sessions

Outputs chronologically to stdout — pipe to less, grep, or redirect to file.
"""

import json
import os
import re
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path

CLAUDE_DIR = Path.home() / ".claude"
PROJECT_PATH = os.getcwd()
MANGLED = PROJECT_PATH.replace("/", "-")
PROJECT_DIR = CLAUDE_DIR / "projects" / MANGLED


def parse_args() -> int | None:
    """Parse CLI arg: number of sessions, or None for --all."""
    if len(sys.argv) < 2:
        return 3
    arg = sys.argv[1]
    if arg in ("--all", "-a"):
        return None
    try:
        n = int(arg)
        if n < 1:
            raise ValueError
        return n
    except ValueError:
        print(f"Usage: {sys.argv[0]} [NUM_SESSIONS | --all]", file=sys.stderr)
        sys.exit(1)


def parse_ts(ts: str | int | float) -> datetime | None:
    if not ts:
        return None
    if isinstance(ts, (int, float)):
        return datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None


def fmt_ts(dt: datetime) -> str:
    return dt.astimezone().strftime("%Y-%m-%d %H:%M")


def extract_user_prompt(text: str) -> str | None:
    """Strip XML tags, collapse whitespace, return None if not a real prompt."""
    clean = re.sub(r"<[^>]+>", "", text).strip()
    clean = re.sub(r"\s+", " ", clean).strip()
    if not clean or len(clean) < 3:
        return None
    if clean in ("clear", "/clear clear", "/exit exit"):
        return None
    if clean.startswith("This session is being continued from a previous conversation"):
        return None
    if clean.startswith("Compacted Tip:") or clean == "compact":
        return None
    stripped = re.sub(r"\[[\d;]*m", "", clean).strip()
    if stripped.startswith("Compacted") or stripped == "compact":
        return None
    # Skip /model output noise and plan implementation blobs
    if stripped.startswith("Set model to"):
        return None
    if stripped.startswith("Implement the following plan"):
        return None
    if len(clean) > 10000:
        return None
    # Skip slash commands that just echo their name
    if re.match(r"^/\w+ \w+$", stripped) and stripped.split()[0] == "/" + stripped.split()[1]:
        return None
    return clean


def extract_ask_questions(input_data: dict) -> list[str]:
    questions = input_data.get("questions", [])
    return [q.get("question", "") for q in questions if q.get("question")]


def get_session_start_ts(fp: Path) -> datetime:
    """Get the earliest timestamp from a session file for sorting."""
    with open(fp) as f:
        for raw in f:
            try:
                d = json.loads(raw)
                ts = parse_ts(d.get("timestamp", ""))
                if ts:
                    return ts
            except Exception:
                continue
    return datetime.min.replace(tzinfo=timezone.utc)


def process_session(fp: Path) -> list[dict]:
    """Extract entries from a single session file."""
    session_id = fp.stem
    entries = []
    ask_questions: dict[str, list[str]] = {}

    with open(fp) as f:
        for raw in f:
            try:
                d = json.loads(raw)
            except Exception:
                continue

            msg_type = d.get("type")
            ts = parse_ts(d.get("timestamp", ""))

            # Collect AskUserQuestion tool calls from assistant
            if msg_type == "assistant":
                content = d.get("message", {}).get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if (
                            isinstance(block, dict)
                            and block.get("type") == "tool_use"
                            and block.get("name") == "AskUserQuestion"
                        ):
                            tid = block.get("id", "")
                            qs = extract_ask_questions(block.get("input", {}))
                            if tid and qs:
                                ask_questions[tid] = qs

            if msg_type != "user" or d.get("isMeta"):
                continue

            content = d.get("message", {}).get("content", "")

            # String content — typed prompt
            if isinstance(content, str):
                prompt = extract_user_prompt(content)
                if prompt and ts:
                    entries.append(
                        {"ts": ts, "type": "prompt", "text": prompt, "session": session_id}
                    )

            # List content — tool results (AskUserQuestion answers)
            elif isinstance(content, list):
                for block in content:
                    if not isinstance(block, dict) or block.get("type") != "tool_result":
                        continue
                    rc = block.get("content", "")
                    if isinstance(rc, str) and rc.startswith("User has answered your questions:"):
                        if ts:
                            tid = block.get("tool_use_id", "")
                            q_texts = ask_questions.get(tid, [])
                            entries.append(
                                {
                                    "ts": ts,
                                    "type": "answer",
                                    "text": rc,
                                    "questions": q_texts,
                                    "session": session_id,
                                }
                            )

    return entries


def format_answer(entry: dict) -> str:
    raw = entry["text"]
    pairs = re.findall(r'"([^"]+)"="([^"]*)"', raw)
    if not pairs:
        return raw
    lines = []
    for q, a in pairs:
        lines.append(f"  Q: {q}")
        lines.append(f"  A: {a}")
    return "\n".join(lines)


def main():
    num_sessions = parse_args()

    if not PROJECT_DIR.exists():
        print(f"Project dir not found: {PROJECT_DIR}", file=sys.stderr)
        sys.exit(1)

    # Get all session files, sorted by their first timestamp (most recent last)
    session_files = list(PROJECT_DIR.glob("*.jsonl"))
    session_files.sort(key=get_session_start_ts)

    # Take the last N sessions
    if num_sessions is not None:
        session_files = session_files[-num_sessions:]

    # Filter to sessions that have actual content (prompts or answers)
    all_entries = []
    session_count = 0
    for fp in session_files:
        entries = process_session(fp)
        if entries:
            all_entries.extend(entries)
            session_count += 1

    if not all_entries:
        label = f"last {num_sessions}" if num_sessions else "any"
        print(f"No prompts found in {label} sessions", file=sys.stderr)
        sys.exit(0)

    all_entries.sort(key=lambda e: e["ts"])

    label = f"last {num_sessions} sessions" if num_sessions else "all sessions"
    print(f"# {len(all_entries)} entries from {session_count} sessions ({label})\n")

    current_session = None
    for entry in all_entries:
        if entry["session"] != current_session:
            current_session = entry["session"]
            print(f"\n{'─' * 60}")
            print(f"Session: {current_session}")
            print(f"{'─' * 60}")

        ts_str = fmt_ts(entry["ts"])

        if entry["type"] == "prompt":
            print(f"\n[{ts_str}] PROMPT")
            print(entry["text"])
        elif entry["type"] == "answer":
            print(f"\n[{ts_str}] Q&A")
            print(format_answer(entry))


if __name__ == "__main__":
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    main()
