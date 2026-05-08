#!/usr/bin/env python3
"""
Bulk-download public Instagram media from a curated CSV for internal asset review.

Usage:
  1. Install dependencies:
       python -m pip install -r requirements.txt

  2. Prepare a CSV with these columns:
       post_url,date,caption_summary,what_it_shows,why_useful_for_website,permission_note

     An example file is included as instagram_assets.csv.

  3. Run:
       python download_instagram_assets.py --csv instagram_assets.csv --skip-existing
       python download_instagram_assets.py --csv instagram_assets.csv --only-category official
       python download_instagram_assets.py --csv instagram_assets.csv --dry-run

Notes:
  - This tool only processes public Instagram post/reel URLs that yt-dlp can access.
  - It does not try to bypass private content, login walls, or platform restrictions.
  - If Instagram blocks some public downloads, you may need to pass cookies exported
    from your logged-in browser to yt-dlp manually or by extending build_ytdlp_command().
    This script intentionally does not add brittle browser automation by default.
  - Downloaded media is organized under:
       downloads/official/
       downloads/third_party/
       downloads/unknown/
  - Each asset folder gets a metadata.json sidecar.
  - Consolidated outputs:
       downloads/assets_index.csv
       downloads/failures.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


REQUIRED_COLUMNS = [
    "post_url",
    "date",
    "caption_summary",
    "what_it_shows",
    "why_useful_for_website",
    "permission_note",
]

MEDIA_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".mp4",
    ".mov",
    ".m4v",
    ".webm",
}

OFFICIAL_ACCOUNT_HINTS = (
    "@vipcoucoubeach",
    "@vipcocobeach",
    "vip coco beach",
    "vip coucou beach",
)


@dataclass
class AssetRow:
    """A validated row from instagram_assets.csv."""

    row_number: int
    post_url: str
    date: str
    caption_summary: str
    what_it_shows: str
    why_useful_for_website: str
    permission_note: str


@dataclass
class DownloadResult:
    """Result of one attempted asset download."""

    row: AssetRow
    category: str
    shortcode: str
    target_dir: Path
    status: str
    downloaded_files: list[Path]
    attempts: int
    error: str = ""
    stdout_tail: str = ""
    stderr_tail: str = ""


class InstagramAssetError(Exception):
    """Base exception for expected script errors."""


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""

    parser = argparse.ArgumentParser(
        description="Download public Instagram media listed in a curated CSV.",
    )
    parser.add_argument(
        "--csv",
        default="instagram_assets.csv",
        help="Input CSV path. Defaults to instagram_assets.csv.",
    )
    parser.add_argument(
        "--output-dir",
        default="downloads",
        help="Download output directory. Defaults to downloads.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned work without downloading media or writing outputs.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Process at most N matching rows.",
    )
    parser.add_argument(
        "--only-category",
        choices=["official", "third_party", "unknown"],
        default=None,
        help="Only process assets in this detected permission category.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip rows whose target folder already contains downloaded media.",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=2,
        help="Retry failed downloads this many times. Defaults to 2.",
    )
    return parser.parse_args()


def sanitize_filename(value: str, fallback: str = "asset", max_length: int = 90) -> str:
    """Return a filesystem-safe ASCII-ish filename segment."""

    cleaned = value.strip().lower()
    cleaned = cleaned.replace("&", " and ")
    cleaned = re.sub(r"[^a-z0-9._-]+", "-", cleaned)
    cleaned = re.sub(r"-{2,}", "-", cleaned).strip("-._")
    if not cleaned:
        cleaned = fallback
    return cleaned[:max_length].rstrip("-._") or fallback


def extract_shortcode(url: str) -> str:
    """Extract an Instagram shortcode from a post/reel URL."""

    match = re.search(
        r"instagram\.com/(?:p|reel|reels|tv)/([^/?#]+)/?",
        url,
        flags=re.IGNORECASE,
    )
    if match:
        return sanitize_filename(match.group(1), fallback="instagram-post")
    return sanitize_filename(url, fallback="instagram-post")


def detect_category(permission_note: str) -> str:
    """Classify the asset as official, third_party, or unknown from its notes."""

    note = permission_note.lower()

    if "official" in note:
        return "official"

    if "owned by" in note and any(hint in note for hint in OFFICIAL_ACCOUNT_HINTS):
        return "official"

    if (
        "third-party" in note
        or "third party" in note
        or "creator" in note
        or "license" in note
    ):
        return "third_party"

    return "unknown"


def read_assets_csv(csv_path: Path) -> list[AssetRow]:
    """Read and validate the input CSV."""

    if not csv_path.exists():
        raise InstagramAssetError(f"CSV not found: {csv_path}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise InstagramAssetError(f"CSV is empty: {csv_path}")

        missing_columns = [
            column for column in REQUIRED_COLUMNS if column not in reader.fieldnames
        ]
        if missing_columns:
            missing = ", ".join(missing_columns)
            raise InstagramAssetError(f"CSV is missing required columns: {missing}")

        rows: list[AssetRow] = []
        for row_number, row in enumerate(reader, start=2):
            post_url = (row.get("post_url") or "").strip()
            if not post_url:
                print(f"[warn] Row {row_number}: missing post_url, skipping")
                continue
            if "instagram.com/" not in post_url.lower():
                print(f"[warn] Row {row_number}: not an Instagram URL, skipping")
                continue

            rows.append(
                AssetRow(
                    row_number=row_number,
                    post_url=post_url,
                    date=(row.get("date") or "").strip(),
                    caption_summary=(row.get("caption_summary") or "").strip(),
                    what_it_shows=(row.get("what_it_shows") or "").strip(),
                    why_useful_for_website=(
                        row.get("why_useful_for_website") or ""
                    ).strip(),
                    permission_note=(row.get("permission_note") or "").strip(),
                )
            )

    return rows


def ensure_ytdlp_available() -> None:
    """Raise a friendly error if yt-dlp is unavailable."""

    if shutil.which("yt-dlp"):
        return

    python = sys.executable
    try:
        subprocess.run(
            [python, "-m", "yt_dlp", "--version"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        raise InstagramAssetError(
            "yt-dlp is not available. Install it with: "
            "python -m pip install -r requirements.txt"
        )


def ytdlp_executable() -> list[str]:
    """Return the safest command prefix for running yt-dlp."""

    if shutil.which("yt-dlp"):
        return ["yt-dlp"]
    return [sys.executable, "-m", "yt_dlp"]


def build_ytdlp_command(url: str, target_dir: Path) -> list[str]:
    """Build a yt-dlp command for the current backend."""

    resolved_target_dir = target_dir.resolve()
    output_template = str(
        resolved_target_dir / "%(playlist_index|001)s-%(id)s.%(ext)s"
    )
    archive_path = str(resolved_target_dir / ".download-archive.txt")

    return [
        *ytdlp_executable(),
        "--ignore-errors",
        "--no-overwrites",
        "--no-progress",
        "--restrict-filenames",
        "--write-info-json",
        "--download-archive",
        archive_path,
        "--output",
        output_template,
        "--format",
        "best",
        url,
    ]


def existing_media_files(target_dir: Path) -> list[Path]:
    """Return media files already present in an asset folder."""

    if not target_dir.exists():
        return []

    return sorted(
        path
        for path in target_dir.rglob("*")
        if path.is_file() and path.suffix.lower() in MEDIA_EXTENSIONS
    )


def list_downloaded_files(target_dir: Path, before: set[Path]) -> list[Path]:
    """Return media files present after a download, preferring newly added files."""

    current = set(existing_media_files(target_dir))
    new_files = sorted(current - before)
    if new_files:
        return new_files
    return sorted(current)


def tail_text(value: str, max_chars: int = 4000) -> str:
    """Keep command output short enough for metadata files."""

    if len(value) <= max_chars:
        return value
    return value[-max_chars:]


def row_metadata(row: AssetRow, category: str, shortcode: str) -> dict[str, str | int]:
    """Return source metadata for sidecar JSON."""

    return {
        "row_number": row.row_number,
        "post_url": row.post_url,
        "shortcode": shortcode,
        "category": category,
        "date": row.date,
        "caption_summary": row.caption_summary,
        "what_it_shows": row.what_it_shows,
        "why_useful_for_website": row.why_useful_for_website,
        "permission_note": row.permission_note,
    }


def write_sidecar_metadata(result: DownloadResult) -> None:
    """Write one metadata.json file in the asset folder."""

    result.target_dir.mkdir(parents=True, exist_ok=True)
    metadata = {
        **row_metadata(result.row, result.category, result.shortcode),
        "status": result.status,
        "attempts": result.attempts,
        "error": result.error,
        "downloaded_files": [
            str(path.relative_to(result.target_dir)) for path in result.downloaded_files
        ],
        "stdout_tail": result.stdout_tail,
        "stderr_tail": result.stderr_tail,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    metadata_path = result.target_dir / "metadata.json"
    with metadata_path.open("w", encoding="utf-8") as handle:
        json.dump(metadata, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def run_download(
    row: AssetRow,
    output_dir: Path,
    skip_existing: bool,
    max_retries: int,
) -> DownloadResult:
    """Download media for one CSV row using yt-dlp."""

    category = detect_category(row.permission_note)
    shortcode = extract_shortcode(row.post_url)
    folder_name = shortcode or sanitize_filename(row.caption_summary, fallback="asset")
    target_dir = output_dir / category / folder_name
    target_dir.mkdir(parents=True, exist_ok=True)

    if skip_existing:
        files = existing_media_files(target_dir)
        if files:
            result = DownloadResult(
                row=row,
                category=category,
                shortcode=shortcode,
                target_dir=target_dir,
                status="skipped",
                downloaded_files=files,
                attempts=0,
                error="Existing media found; skipped due to --skip-existing.",
            )
            write_sidecar_metadata(result)
            return result

    attempts = 0
    last_stdout = ""
    last_stderr = ""
    last_error = ""
    before = set(existing_media_files(target_dir))

    for attempt in range(1, max_retries + 2):
        attempts = attempt
        command = build_ytdlp_command(row.post_url, target_dir)
        try:
            completed = subprocess.run(
                command,
                cwd=target_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=300,
            )
        except subprocess.TimeoutExpired as exc:
            last_stdout = exc.stdout or ""
            last_stderr = exc.stderr or ""
            last_error = "yt-dlp timed out after 300 seconds."
        except OSError as exc:
            last_error = f"Could not run yt-dlp: {exc}"
        else:
            last_stdout = completed.stdout
            last_stderr = completed.stderr
            if completed.returncode != 0:
                last_error = f"yt-dlp exited with code {completed.returncode}."
            else:
                last_error = ""

        downloaded_files = list_downloaded_files(target_dir, before)
        if downloaded_files and not last_error:
            result = DownloadResult(
                row=row,
                category=category,
                shortcode=shortcode,
                target_dir=target_dir,
                status="success",
                downloaded_files=downloaded_files,
                attempts=attempts,
                stdout_tail=tail_text(last_stdout),
                stderr_tail=tail_text(last_stderr),
            )
            write_sidecar_metadata(result)
            return result

        if downloaded_files:
            # Some extractors return a non-zero status after partial playlist success.
            result = DownloadResult(
                row=row,
                category=category,
                shortcode=shortcode,
                target_dir=target_dir,
                status="success",
                downloaded_files=downloaded_files,
                attempts=attempts,
                error=last_error,
                stdout_tail=tail_text(last_stdout),
                stderr_tail=tail_text(last_stderr),
            )
            write_sidecar_metadata(result)
            return result

        if attempt <= max_retries:
            print(f"    retrying after failure ({attempt}/{max_retries})")

    result = DownloadResult(
        row=row,
        category=category,
        shortcode=shortcode,
        target_dir=target_dir,
        status="failed",
        downloaded_files=[],
        attempts=attempts,
        error=last_error or "Download finished but no media files were found.",
        stdout_tail=tail_text(last_stdout),
        stderr_tail=tail_text(last_stderr),
    )
    write_sidecar_metadata(result)
    return result


def relative_paths(paths: Iterable[Path], base_dir: Path) -> str:
    """Serialize paths relative to the downloads directory for CSV output."""

    values = []
    for path in paths:
        try:
            values.append(path.relative_to(base_dir).as_posix())
        except ValueError:
            values.append(path.as_posix())
    return "|".join(values)


def write_assets_index(results: list[DownloadResult], output_dir: Path) -> None:
    """Write consolidated downloads/assets_index.csv."""

    output_dir.mkdir(parents=True, exist_ok=True)
    index_path = output_dir / "assets_index.csv"
    fields = [
        "status",
        "category",
        "shortcode",
        "post_url",
        "date",
        "caption_summary",
        "what_it_shows",
        "why_useful_for_website",
        "permission_note",
        "asset_folder",
        "downloaded_files",
        "attempts",
        "error",
    ]

    with index_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for result in results:
            writer.writerow(
                {
                    "status": result.status,
                    "category": result.category,
                    "shortcode": result.shortcode,
                    "post_url": result.row.post_url,
                    "date": result.row.date,
                    "caption_summary": result.row.caption_summary,
                    "what_it_shows": result.row.what_it_shows,
                    "why_useful_for_website": result.row.why_useful_for_website,
                    "permission_note": result.row.permission_note,
                    "asset_folder": result.target_dir.relative_to(output_dir).as_posix(),
                    "downloaded_files": relative_paths(
                        result.downloaded_files,
                        output_dir,
                    ),
                    "attempts": result.attempts,
                    "error": result.error,
                }
            )


def write_failures(results: list[DownloadResult], output_dir: Path) -> None:
    """Write downloads/failures.csv with failed rows."""

    output_dir.mkdir(parents=True, exist_ok=True)
    failures_path = output_dir / "failures.csv"
    fields = [
        "row_number",
        "category",
        "shortcode",
        "post_url",
        "date",
        "caption_summary",
        "permission_note",
        "attempts",
        "error",
    ]

    with failures_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for result in results:
            if result.status != "failed":
                continue
            writer.writerow(
                {
                    "row_number": result.row.row_number,
                    "category": result.category,
                    "shortcode": result.shortcode,
                    "post_url": result.row.post_url,
                    "date": result.row.date,
                    "caption_summary": result.row.caption_summary,
                    "permission_note": result.row.permission_note,
                    "attempts": result.attempts,
                    "error": result.error,
                }
            )


def filter_rows(
    rows: list[AssetRow],
    only_category: str | None,
    limit: int | None,
) -> list[AssetRow]:
    """Apply category and limit filters."""

    filtered: list[AssetRow] = []
    for row in rows:
        category = detect_category(row.permission_note)
        if only_category and category != only_category:
            continue
        filtered.append(row)
        if limit is not None and len(filtered) >= limit:
            break
    return filtered


def print_summary(results: list[DownloadResult], total_rows: int) -> None:
    """Print a compact run summary."""

    success_count = sum(result.status == "success" for result in results)
    failed_count = sum(result.status == "failed" for result in results)
    skipped_count = sum(result.status == "skipped" for result in results)

    print("")
    print("Summary")
    print("-------")
    print(f"total rows:    {total_rows}")
    print(f"success count: {success_count}")
    print(f"failed count:  {failed_count}")
    print(f"skipped count: {skipped_count}")


def run_dry_run(rows: list[AssetRow], output_dir: Path) -> None:
    """Print planned work without creating files."""

    print("Dry run: no downloads or output files will be written.")
    for index, row in enumerate(rows, start=1):
        category = detect_category(row.permission_note)
        shortcode = extract_shortcode(row.post_url)
        target_dir = output_dir / category / shortcode
        print(
            f"[{index}/{len(rows)}] {shortcode} | {category} | "
            f"{row.post_url} -> {target_dir}"
        )
    print_summary([], total_rows=len(rows))


def main() -> int:
    """CLI entrypoint."""

    args = parse_args()
    csv_path = Path(args.csv)
    output_dir = Path(args.output_dir)

    try:
        rows = read_assets_csv(csv_path)
        rows_to_process = filter_rows(rows, args.only_category, args.limit)
        if args.dry_run:
            run_dry_run(rows_to_process, output_dir)
            return 0

        ensure_ytdlp_available()
    except InstagramAssetError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 2

    output_dir.mkdir(parents=True, exist_ok=True)
    results: list[DownloadResult] = []

    if not rows_to_process:
        print("No matching rows to process.")
        write_assets_index(results, output_dir)
        write_failures(results, output_dir)
        print_summary(results, total_rows=0)
        return 0

    print(f"Processing {len(rows_to_process)} row(s)")
    print(f"Output directory: {output_dir.resolve()}")

    for index, row in enumerate(rows_to_process, start=1):
        category = detect_category(row.permission_note)
        shortcode = extract_shortcode(row.post_url)
        print(f"[{index}/{len(rows_to_process)}] {shortcode} ({category})")

        result = run_download(
            row=row,
            output_dir=output_dir,
            skip_existing=args.skip_existing,
            max_retries=max(args.retries, 0),
        )
        results.append(result)

        if result.status == "success":
            print(f"    success: {len(result.downloaded_files)} file(s)")
        elif result.status == "skipped":
            print("    skipped: existing media found")
        else:
            print(f"    failed: {result.error}")

    write_assets_index(results, output_dir)
    write_failures(results, output_dir)
    print_summary(results, total_rows=len(rows_to_process))

    return 1 if any(result.status == "failed" for result in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())
