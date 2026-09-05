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
- Guided six-prompt browser voice recorder with separate local clips, playback, re-recording, and explicit capability consent
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

This repository is public-site code only. The guided recorder uses `MediaDevices` and `MediaRecorder` to hold separate clips in browser memory for the current page session. It contains the frontend contract for secure upload, but does not enable it until a backend base URL is configured on the recorder. Secure private uploads, voice-discovery session/answer tables, transcription, agreement execution, manuscript drafts, royalty records, and persistent client-status data require a separate secure application/backend. Do not represent browser-held clips as received submissions.

### VTL-MARPC-002 backend activation requirement

The public recorder is **READY / PROVIDER ACTIVATION REQUIRED** for backend integration. Configure its `data-voice-api-base` with the approved same-origin or Edge Function gateway. The gateway must expose these JSON endpoints:

- `POST /voice-discovery/session`: accepts contact identity, `discovery_mode`, consent flags, source page, and prompt version; returns `voice_discovery_session_id` and optional `reference_id`.
- `POST /voice-discovery/upload-authorize`: accepts session ID, prompt key/version, MIME type, duration, and both voice consents; returns `answer_id`, randomized private `object_path`, short-lived `signed_upload_url`, optional `upload_method` and `upload_headers`, and the current `transcription_status`.
- `POST /voice-discovery/upload-complete`: accepts session ID, answer ID, prompt key, object path, and upload status; returns authoritative `recording_status` and `transcription_status`.
- `POST /voice-discovery/session-complete`: accepts the session ID, consent flags, and stored answer IDs/statuses; returns the final `reference_id` only after persistence succeeds.

The browser uploads each Blob directly to the returned signed URL, never constructs a public storage URL, and retries only answers that are not `stored`. The backend must validate origin, session ownership, rate limits, consent, prompt version, MIME type, and object path rather than trusting browser-supplied identifiers. It must keep audio and transcripts private, and the browser must never receive a service-role or transcription-provider secret. Automatic transcription remains **READY / PROVIDER ACTIVATION REQUIRED**; no new paid provider or financial commitment is activated by this repository.

## Public contact

- Phone/Text: 502-270-8828
- Email: elijah@divinityxenterprises.com
- Program: Voice to Legacy™
- Publisher: Divinityx Publishing Company


## GitHub Pages preview compatibility

The pages dynamically select `/VoiceToLegacy.org/` as the base path on `github.io` and `/` on the final custom domain. This allows the same commit to work for both the GitHub Pages preview and VoiceToLegacy.org without rebuilding.
