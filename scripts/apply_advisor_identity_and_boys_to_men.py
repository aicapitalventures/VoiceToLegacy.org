from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OLD_EMAIL = "elijah@divinityxenterprises.com"
NEW_EMAIL = "accounting@divinityxenterprises.com"

for path in ROOT.rglob("*.html"):
    text = path.read_text(encoding="utf-8")
    replacements = (
        (OLD_EMAIL, NEW_EMAIL),
        ("Email Elijah", "Email an Advisor Today"),
        ("Speak directly with Elijah L. Cooley.", "Speak directly with a Certified Voice to Legacy™ Advisor."),
        ("Speak with Elijah during a guided introductory intake.", "Speak with a Certified Voice to Legacy™ Advisor during a guided introductory intake."),
        ("email Elijah before completing an intake", "email a Voice to Legacy™ Advisor before completing an intake"),
    )
    for old, new in replacements:
        text = text.replace(old, new)
    path.write_text(text, encoding="utf-8")

js_path = ROOT / "assets" / "js" / "main.js"
js = js_path.read_text(encoding="utf-8")
js = js.replace(
    "const EMAIL = 'elijah@divinityxenterprises.com';",
    "const EMAIL = 'accounting@divinityxenterprises.com';",
)
js_path.write_text(js, encoding="utf-8")

published = ROOT / "published-work" / "index.html"
text = published.read_text(encoding="utf-8")
text = text.replace(
    "View examples of books developed and published through Divinityx Publishing Company and the Voice to Legacy publishing model.",
    "View published books developed through the Voice to Legacy™ author-development and publishing system.",
)
text = text.replace(
    '<meta property="og:image" content="assets/img/legacy-mosaic.webp">',
    '<meta property="og:image" content="assets/img/boys-to-men-front.webp">',
)
start = text.index('<section class="section section-dark">')
end = text.index('<section class="section section-cosmic">')
replacement = '''<section class="section section-dark">
 <div class="container">
  <article class="featured-book reveal" aria-labelledby="boys-to-men-title">
   <div class="book-cover-gallery" aria-label="Boys to Men front and back covers">
    <figure class="book-cover book-cover-front">
     <img src="assets/img/boys-to-men-front.webp" alt="Front cover of Boys to Men by Bernard Shell Jr." loading="eager">
     <figcaption>Front cover</figcaption>
    </figure>
    <figure class="book-cover book-cover-back">
     <img src="assets/img/boys-to-men-back.webp" alt="Back cover of Boys to Men by Bernard Shell Jr." loading="lazy">
     <figcaption>Back cover</figcaption>
    </figure>
   </div>
   <div class="book-details">
    <p class="label">First Voice to Legacy™ author project</p>
    <h2 id="boys-to-men-title" class="display book-title">Boys to Men</h2>
    <p class="book-subtitle"><em>Helping Young Boys Understand What It Really Means to Be a Man</em></p>
    <p class="book-credit">By Bernard Shell Jr. <span aria-hidden="true">·</span> Edited by Elijah L. Cooley</p>
    <p class="book-formats"><strong>Available formats:</strong> Hardcover, Paperback, and eBook. <strong>Audiobook coming soon.</strong></p>
    <div class="book-description">
     <p>Boys are growing up in a world that expects them to become men, but too many of them are never clearly taught what manhood really means.</p>
     <p><em>Boys to Men</em> is a direct, heartfelt, and practical mentorship book for young boys, young men, fathers, mothers, mentors, and communities who understand that boys should not have to guess their way into manhood.</p>
     <p>Written by Bernard Shell Jr., this book speaks plainly about responsibility, respect, self-control, work, family, survival, pressure, role models, and the danger of false manhood. It challenges the belief that getting older automatically makes a boy a man and explains that real manhood must be taught, modeled, corrected, and lived.</p>
     <p>This book is not written to shame young men. It is written to guide them.</p>
     <h3>Inside, readers will find lessons on:</h3>
     <ul class="book-lessons">
      <li>What it really means to become a man</li>
      <li>Why boys need responsible role models</li>
      <li>The difference between respect and fear</li>
      <li>Why responsibility is the foundation of manhood</li>
      <li>How false manhood can lead young men toward destruction</li>
      <li>How to survive pressure without surrendering to the streets</li>
      <li>Why work, knowledge, family, and older men matter</li>
      <li>What fathers must teach their sons</li>
      <li>How mothers raising sons deserve support and respect</li>
      <li>Why older men must step up and reach back</li>
     </ul>
     <p><em>Boys to Men</em> is a call to responsibility for the whole community. It speaks to the young boy who needs direction, the father who needs to be present, the mother carrying the weight of raising a son, and the older man who has wisdom that should not die with him.</p>
     <blockquote class="book-closing">A boy does not become a man just because time passes. He becomes a man when he learns how to carry responsibility, respect life, control himself, receive wisdom, and take care of what has been placed in his hands. <strong>That is what it really means to be a man.</strong></blockquote>
    </div>
    <div class="button-row">
     <a class="button button-gold" href="https://a.co/d/0eOCNUlF" target="_blank" rel="noopener noreferrer">View Boys to Men on Amazon</a>
    </div>
   </div>
  </article>
  <div class="catalog-note reveal">
   <p class="section-kicker">Growing the Voice to Legacy™ catalog</p>
   <p>Bernard Shell Jr. is the first published Voice to Legacy™ author. Additional accepted author projects will be added here after publication and final release authorization.</p>
  </div>
 </div>
</section>
'''
text = text[:start] + replacement + text[end:]
published.write_text(text, encoding="utf-8")

css_path = ROOT / "assets" / "css" / "styles.css"
css = css_path.read_text(encoding="utf-8")
marker = "/* VOICE TO LEGACY PUBLISHED BOOK PRESENTATION */"
if marker not in css:
    css += '''

/* VOICE TO LEGACY PUBLISHED BOOK PRESENTATION */
.featured-book{display:grid;grid-template-columns:minmax(310px,.82fr) minmax(0,1.35fr);gap:clamp(38px,6vw,78px);align-items:start;padding:clamp(28px,5vw,58px);border:1px solid var(--line);border-radius:34px;background:linear-gradient(145deg,rgba(15,42,67,.72),rgba(3,10,22,.96));box-shadow:var(--shadow)}
.book-cover-gallery{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.62fr);gap:18px;align-items:end;position:sticky;top:120px}
.book-cover{margin:0}.book-cover img{width:100%;height:auto;border-radius:10px;border:1px solid rgba(247,200,90,.38);box-shadow:0 24px 60px rgba(0,0,0,.58)}.book-cover-back{transform:translateY(28px)}.book-cover figcaption{text-align:center;margin-top:10px;color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.12em}
.book-details .label{color:var(--gold-2);font-size:.76rem;text-transform:uppercase;letter-spacing:.16em;font-weight:800}.book-title{font-size:clamp(2.55rem,5vw,5rem)!important;margin-bottom:10px}.book-subtitle{font-family:var(--display);font-size:clamp(1.2rem,2.2vw,1.65rem);color:var(--gold-1);line-height:1.35;margin:0 0 12px}.book-credit{font-weight:800;color:#fff;margin:0 0 8px}.book-formats{padding:14px 16px;border-left:3px solid var(--gold-2);background:rgba(245,200,90,.08);color:#dfe6ef}.book-description{color:#c7cfda}.book-description h3{margin-top:30px;color:var(--gold-1)}
.book-lessons{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;padding:0;list-style:none}.book-lessons li{position:relative;padding-left:24px}.book-lessons li::before{content:"✓";position:absolute;left:0;color:var(--gold-2);font-weight:900}.book-closing{margin:30px 0 0;padding:24px;border:1px solid var(--line);border-radius:18px;background:rgba(2,7,17,.65);font-family:var(--display);font-size:1.08rem;color:var(--cream)}.catalog-note{margin-top:34px;padding:24px 28px;border:1px solid var(--line);border-radius:20px;background:rgba(7,20,39,.68);color:var(--muted)}.catalog-note p:last-child{margin-bottom:0}
@media(max-width:900px){.featured-book{grid-template-columns:1fr}.book-cover-gallery{position:static;max-width:620px;margin-inline:auto}.book-lessons{grid-template-columns:1fr}}@media(max-width:520px){.featured-book{padding:22px 18px;border-radius:24px}.book-cover-gallery{grid-template-columns:1fr 1fr;gap:12px}.book-cover-back{transform:none}.book-cover figcaption{font-size:.68rem}}
'''
css_path.write_text(css, encoding="utf-8")
