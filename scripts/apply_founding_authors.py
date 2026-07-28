from __future__ import annotations

import base64
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CHUNKS = ROOT / ".asset-chunks"
BANNER = ROOT / "assets" / "img" / "founding-authors-banner.webp"
PUBLISHED = ROOT / "published-work" / "index.html"
STYLES = ROOT / "assets" / "css" / "styles.css"


def assemble_banner() -> None:
    parts = sorted(CHUNKS.glob("founding-authors-banner.part*"))
    if len(parts) != 9:
        raise RuntimeError(f"Expected 9 banner chunks; found {len(parts)}")
    encoded = "".join(part.read_text(encoding="utf-8").strip() for part in parts)
    data = base64.b64decode(encoded, validate=True)
    if not data.startswith(b"RIFF") or b"WEBP" not in data[:16]:
        raise RuntimeError("Reassembled banner is not a valid WebP file")
    BANNER.parent.mkdir(parents=True, exist_ok=True)
    BANNER.write_bytes(data)


def founding_slot(number: int) -> str:
    return f'''   <article class="founding-slot is-open">
    <span class="founding-number">{number:02d}</span>
    <span class="founding-star" aria-hidden="true">☆</span>
    <p class="founding-state">Available</p>
    <h3>Founding Author No. {number:02d}</h3>
    <p>Reserved for a future qualifying published Voice to Legacy™ author.</p>
   </article>'''


def update_published_page() -> None:
    text = PUBLISHED.read_text(encoding="utf-8")
    text = text.replace("boys-to-men-front.webp", "boys-to-men-front-web.webp")
    text = text.replace("boys-to-men-back.webp", "boys-to-men-back-web.webp")

    marker = '<section class="section section-dark">'
    if "founding-authors-section" not in text:
        open_slots = "\n".join(founding_slot(number) for number in range(2, 11))
        section = f'''<section class="section founding-authors-section" aria-labelledby="founding-authors-title">
 <div class="container">
  <img class="founding-authors-banner reveal" src="assets/img/founding-authors-banner.webp" alt="The Founding Authors — The Inaugural Ten, honoring the first ten published Voice to Legacy authors">
  <div class="founding-authors-intro reveal">
   <div>
    <p class="section-kicker">A permanent Voice to Legacy™ distinction</p>
    <h2 id="founding-authors-title" class="display">The first ten published authors become <span class="gold-text">The Founding Authors™.</span></h2>
    <p class="lead">The Founding Authors™ are the first ten authors whose projects are accepted, fully developed, approved, and published through Voice to Legacy™. Their place in the inaugural group becomes part of the permanent publishing record.</p>
   </div>
   <aside class="founding-status" aria-label="Founding Authors availability">
    <span class="founding-count">1 of 10</span>
    <strong>Founding Author places filled</strong>
    <p>Nine inaugural distinctions remain for future qualifying published authors.</p>
   </aside>
  </div>
  <div class="founding-grid" aria-label="The ten Founding Author positions">
   <article class="founding-slot is-filled">
    <span class="founding-number">01</span>
    <span class="founding-star" aria-hidden="true">★</span>
    <p class="founding-state">Published</p>
    <h3>Bernard Shell Jr.</h3>
    <p><em>Boys to Men</em></p>
    <a href="#boys-to-men-title">View the first Founding Author</a>
   </article>
{open_slots}
  </div>
  <div class="founding-cta reveal">
   <div>
    <p class="section-kicker">Nine inaugural distinctions remain</p>
    <h3>Could your published work become part of the founding ten?</h3>
    <p>Begin with an intake and project-fit review. Founding Author recognition is conferred only after acceptance, completed development, author approval, and publication.</p>
   </div>
   <a class="button button-gold" href="start/">Request Founding Author Consideration</a>
  </div>
  <p class="founding-disclaimer">Submitting an intake does not guarantee project acceptance, publication, timing, sales, royalties, or Founding Author recognition.</p>
 </div>
</section>
'''
        if marker not in text:
            raise RuntimeError("Published Work insertion marker was not found")
        text = text.replace(marker, section + marker, 1)

    PUBLISHED.write_text(text, encoding="utf-8")


def update_styles() -> None:
    css = STYLES.read_text(encoding="utf-8")
    marker = "/* FOUNDING AUTHORS — INAUGURAL TEN */"
    if marker not in css:
        css += r'''

/* FOUNDING AUTHORS — INAUGURAL TEN */
.founding-authors-section{background:linear-gradient(180deg,#030913,#071426 48%,#020711);border-block:1px solid var(--line)}
.founding-authors-banner{display:block;width:100%;height:auto;object-fit:contain;border:1px solid rgba(247,200,90,.42);border-radius:28px;box-shadow:0 28px 80px rgba(0,0,0,.58);margin:0 auto 52px}
.founding-authors-intro{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.55fr);gap:42px;align-items:center}
.founding-status{padding:28px;border:1px solid rgba(247,200,90,.45);border-radius:24px;background:linear-gradient(145deg,rgba(245,200,90,.13),rgba(7,20,39,.92));box-shadow:var(--shadow)}
.founding-count{display:block;font-family:var(--display);font-size:clamp(2.8rem,6vw,5.4rem);line-height:1;color:var(--gold-1)}
.founding-status strong{display:block;margin-top:10px;color:#fff}
.founding-status p{margin-bottom:0;color:var(--muted)}
.founding-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin-top:48px}
.founding-slot{min-height:235px;padding:22px 18px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(150deg,rgba(16,42,68,.72),rgba(3,10,22,.94));position:relative;overflow:hidden}
.founding-slot::after{content:"";position:absolute;width:130px;height:130px;border-radius:50%;right:-65px;bottom:-65px;background:rgba(245,200,90,.05)}
.founding-slot.is-filled{border-color:rgba(255,225,132,.72);box-shadow:0 18px 55px rgba(201,139,36,.18)}
.founding-slot.is-open{border-style:dashed}
.founding-number{font-family:var(--display);font-size:2.2rem;color:rgba(245,200,90,.48)}
.founding-star{position:absolute;right:18px;top:18px;color:var(--gold-2);font-size:1.45rem}
.founding-state{margin:18px 0 6px;text-transform:uppercase;letter-spacing:.16em;font-size:.68rem;font-weight:800;color:var(--gold-2)}
.founding-slot h3{margin:0 0 8px;font-size:1.05rem}
.founding-slot p:last-of-type{color:var(--muted);font-size:.86rem}
.founding-slot a{position:relative;z-index:1;color:var(--gold-1);font-weight:800;font-size:.84rem}
.founding-cta{display:flex;justify-content:space-between;align-items:center;gap:32px;margin-top:36px;padding:34px;border:1px solid var(--line);border-radius:24px;background:rgba(5,16,32,.88)}
.founding-cta h3{font-size:clamp(1.4rem,2.6vw,2.15rem);margin:0 0 8px}
.founding-cta p:last-child{color:var(--muted);margin-bottom:0}
.founding-cta .button{flex:0 0 auto}
.founding-disclaimer{margin:16px auto 0;max-width:900px;text-align:center;color:var(--muted);font-size:.82rem}
@media(max-width:980px){.founding-authors-intro{grid-template-columns:1fr}.founding-grid{grid-template-columns:repeat(3,1fr)}.founding-cta{align-items:flex-start;flex-direction:column}}
@media(max-width:680px){.founding-authors-banner{border-radius:18px;margin-bottom:36px}.founding-grid{grid-template-columns:repeat(2,1fr)}.founding-slot{min-height:220px}.founding-cta{padding:26px 22px}}
@media(max-width:430px){.founding-grid{grid-template-columns:1fr}.founding-slot{min-height:auto}}
'''
    STYLES.write_text(css, encoding="utf-8")


def remove_obsolete_files() -> None:
    obsolete = [
        ROOT / "BOYS-TO-MEN-ASSET-UPLOAD.md",
        ROOT / "CONTENT-UPDATE-VERIFICATION.md",
        ROOT / "assets" / "img" / "README-Boys-to-Men-covers.txt",
        ROOT / "assets" / "img" / "UPLOAD-REQUIRED.txt",
        ROOT / "assets" / "img" / ".cover-upload-required",
        ROOT / "assets" / "img" / ".gitkeep-boys-to-men",
        ROOT / "assets" / "img" / ".gitkeep-v2l-proof",
    ]
    for path in obsolete:
        if path.exists():
            path.unlink()


if __name__ == "__main__":
    assemble_banner()
    update_published_page()
    update_styles()
    remove_obsolete_files()
    print(f"Created {BANNER.relative_to(ROOT)} ({BANNER.stat().st_size} bytes)")
