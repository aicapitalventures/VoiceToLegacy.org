# VoiceToLegacy.org

A new, independent, static-first VoiceToLegacy.org starter build for GitHub Pages.

## What is included

- Cinematic Celestial Legacy visual system derived from founder-supplied assets
- Responsive multi-page website
- Permanent `/start/` intake route
- Public fillable-PDF download
- Static phone and Zoom intake request workflow
- Published-work proof
- FAQ, contact, privacy, terms, and accessibility pages
- No package manager or build process required
- GitHub Pages ready

## Local preview

From the repository root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

Do not open the HTML files directly from the filesystem because root-relative links expect a local web server or root-domain deployment.

## GitHub Pages deployment

1. Use the repository `aicapitalventures/VoiceToLegacy.org`.
2. Keep the complete contents of this folder at the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.
7. GitHub will provide the public Pages URL.

## Custom domain

After the GitHub Pages preview is approved:

1. Add `VoiceToLegacy.org` in **Settings → Pages → Custom domain**.
2. Follow GitHub's displayed DNS requirements.
3. Enable **Enforce HTTPS** after DNS is verified.
4. Add a `CNAME` file containing only:

```text
VoiceToLegacy.org
```

Do not add the CNAME before the preview site is approved and DNS is ready.

## Important starter boundary

This repository is public-site code only. It does not provide secure accounts, private uploads, agreement execution, audio/video recording, transcripts, manuscript drafts, royalty records, or persistent client-status data. Those require a separate secure application/backend.

## Public contact

- Phone/Text: 502-270-8828
- Email: elijah@divinityxenterprises.com
- Program: Voice to Legacy™
- Publisher: Divinityx Publishing Company

## GitHub Pages preview compatibility

The pages dynamically select `/VoiceToLegacy.org/` as the base path on `github.io` and `/` on the final custom domain. This allows the same commit to work for both the GitHub Pages preview and VoiceToLegacy.org without rebuilding.
