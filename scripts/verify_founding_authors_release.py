from __future__ import annotations

import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "FOUNDING-AUTHORS-RELEASE-REPORT.md"
OLD_EMAIL = "elijah@divinityxenterprises.com"
NEW_EMAIL = "accounting@divinityxenterprises.com"

passes: list[str] = []
failures: list[str] = []


def check(condition: bool, pass_message: str, fail_message: str | None = None) -> None:
    if condition:
        passes.append(pass_message)
    else:
        failures.append(fail_message or pass_message)


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for attr in ("href", "src"):
            value = values.get(attr)
            if value is not None:
                self.references.append((tag, attr, value))
        if tag == "meta" and values.get("property") == "og:image" and values.get("content"):
            self.references.append((tag, "content", values["content"] or ""))


def local_target_exists(value: str) -> bool:
    split = urlsplit(value)
    if split.scheme or split.netloc:
        return True
    raw_path = unquote(split.path)
    if not raw_path:
        return True
    relative = raw_path.lstrip("/")
    target = ROOT / relative
    if raw_path.endswith("/"):
        return (target / "index.html").is_file()
    return target.is_file() or (target / "index.html").is_file()


html_files = sorted(ROOT.rglob("*.html"))
check(bool(html_files), "HTML files were discovered for validation.")

broken_local: list[str] = []
external_blank_issues: list[str] = []
for html_file in html_files:
    parser = LinkParser()
    text = html_file.read_text(encoding="utf-8")
    parser.feed(text)
    for tag, attr, value in parser.references:
        split = urlsplit(value)
        if split.scheme in {"http", "https"}:
            if 'target="_blank"' in text and value in text:
                anchor_pattern = re.compile(
                    r'<a\b(?=[^>]*href=["\']' + re.escape(value) + r'["\'])([^>]*)>',
                    re.IGNORECASE,
                )
                match = anchor_pattern.search(text)
                if match and 'target="_blank"' in match.group(0):
                    rel_match = re.search(r'rel=["\']([^"\']+)["\']', match.group(0), re.IGNORECASE)
                    rel_values = set((rel_match.group(1) if rel_match else "").lower().split())
                    if "noopener" not in rel_values:
                        external_blank_issues.append(f"{html_file.relative_to(ROOT)}: {value}")
            continue
        if split.scheme in {"mailto", "tel", "sms", "data", "javascript"}:
            continue
        if not local_target_exists(value):
            broken_local.append(f"{html_file.relative_to(ROOT)} — {attr}=\"{value}\"")

check(not broken_local, "Every local navigation, CTA, document, image, and metadata path resolves.", "Broken local references: " + "; ".join(broken_local))
check(not external_blank_issues, "External new-tab links include opener protection.", "Unsafe external links: " + "; ".join(external_blank_issues))

published = (ROOT / "published-work" / "index.html").read_text(encoding="utf-8")
css = (ROOT / "assets" / "css" / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "assets" / "js" / "main.js").read_text(encoding="utf-8")
all_public_text = "\n".join(path.read_text(encoding="utf-8") for path in html_files) + "\n" + js

check(OLD_EMAIL not in all_public_text, "The retired Elijah-specific public email address is absent from HTML and JavaScript.")
check(NEW_EMAIL in all_public_text, "The advisor contact email is accounting@divinityxenterprises.com.")
check(published.count('class="founding-slot ') == 10, "The Founding Authors register contains exactly ten positions.")
check(published.count('class="founding-slot is-filled"') == 1, "Exactly one Founding Author position is filled.")
check(published.count('class="founding-slot is-open"') == 9, "Exactly nine Founding Author positions remain available.")
check("Bernard Shell Jr." in published and "Boys to Men" in published, "Bernard Shell Jr. and Boys to Men occupy Founding Author position 01.")
check("https://a.co/d/0eOCNUlF" in published, "The Boys to Men Amazon destination is the approved listing.")
check("Request Founding Author Consideration" in published and 'href="start/"' in published, "The Founding Author consideration CTA routes to the intake page.")
check("Submitting an intake does not guarantee" in published, "The Founding Authors offer includes a clear non-guarantee disclosure.")
check("How to Build Business Credit and Get Business Funding" not in published, "The unrelated business-credit title remains excluded from Voice to Legacy published work.")
check("boys-to-men-front.webp" not in published and "boys-to-men-back.webp" not in published, "Obsolete cover paths are absent.")
check("boys-to-men-front-web.webp" in published and "boys-to-men-back-web.webp" in published, "The Published Work page references the existing approved cover assets.")
check("founding-authors-banner.webp" in published, "The approved Founding Authors banner is referenced.")
check("/* FOUNDING AUTHORS — INAUGURAL TEN */" in css, "Responsive Founding Authors presentation styles are present.")

required_images = {
    "Founding Authors banner": ROOT / "assets" / "img" / "founding-authors-banner.webp",
    "Boys to Men front cover": ROOT / "assets" / "img" / "boys-to-men-front-web.webp",
    "Boys to Men back cover": ROOT / "assets" / "img" / "boys-to-men-back-web.webp",
}
for label, path in required_images.items():
    valid = path.is_file() and path.stat().st_size > 1000 and path.read_bytes()[:4] == b"RIFF" and b"WEBP" in path.read_bytes()[:16]
    check(valid, f"{label} exists as a non-empty WebP asset.")

node_result = subprocess.run(["node", "--check", str(ROOT / "assets" / "js" / "main.js")], capture_output=True, text=True)
check(node_result.returncode == 0, "Site JavaScript passes Node syntax validation.", "JavaScript syntax failure: " + node_result.stderr.strip())

status = "PASS" if not failures else "FAIL"
lines = [
    "# VoiceToLegacy.org Founding Authors Release Verification",
    "",
    f"**Overall status:** {status}",
    "",
    "## Verified controls",
    "",
]
lines.extend(f"- [x] {message}" for message in passes)
if failures:
    lines.extend(["", "## Failures", ""])
    lines.extend(f"- [ ] {message}" for message in failures)
lines.extend([
    "",
    "## Release boundary",
    "",
    "This verification confirms repository structure, public contact identity, local path resolution, external-link safety, required assets, Founding Author position counts, key publishing copy, Amazon routing, and JavaScript syntax. Final browser review must still confirm visual appearance at desktop and mobile widths after deployment.",
])
REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")

if failures:
    raise SystemExit("Release verification failed: " + " | ".join(failures))

print(f"Release verification passed with {len(passes)} checks.")
