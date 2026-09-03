# Voice to Legacy™ Lead System Operations Record

## Canonical Infrastructure

- System: Voice to Legacy Lead Funnel
- Platform: Supabase
- Organization: aicapitalventures's Org
- Project ID: `cywudaqttafinhujonvu`
- Region: `us-east-1`
- GitHub repository: `aicapitalventures/VoiceToLegacy.org`
- Development branch: `build/ads-lead-conversion-funnel`
- Production domain: `https://voicetolegacy.org`
- Primary landing page: `https://voicetolegacy.org/start/`
- Confirmation page: `https://voicetolegacy.org/thank-you/`
- Lead table: `public.voice_to_legacy_leads`
- Submission audit table: `public.voice_to_legacy_submission_attempts`
- Edge Function: `submit-voice-to-legacy-lead`
- Edge Function endpoint: `https://cywudaqttafinhujonvu.supabase.co/functions/v1/submit-voice-to-legacy-lead`

## Security Boundaries

- Anonymous and authenticated browser roles have no direct table access.
- Row-level security is enabled on both tables.
- Public submissions must pass through the Edge Function.
- Service-role credentials must never be committed to GitHub or exposed in browser JavaScript.
- Raw IP addresses are not stored; only cryptographic hashes are retained.
- Consent to contact and privacy acknowledgment are mandatory.
- The Edge Function enforces origin validation, payload limits, field validation, honeypot rejection, duplicate checks, rate limiting, and controlled error responses.
- The public `website` field name is reserved exclusively for the hidden anti-spam honeypot and must remain empty for legitimate submissions.
- Sensitive story boundaries are not collected in the preliminary public form. Prospective authors are instructed to share those boundaries during advisor follow-up so they can be documented in the appropriate private project workflow.

## Lead Status Definitions

### lead_status
- `new`: Newly received and not yet actioned.
- `contact_attempted`: At least one contact attempt has been made.
- `contacted`: Two-way communication has occurred.
- `nurturing`: Lead remains active but is not ready for immediate intake or agreement.
- `closed`: Lead is no longer active.

### qualification_status
- `unreviewed`: No qualification decision has been made.
- `qualified`: Appropriate for the next Voice to Legacy stage.
- `conditionally_qualified`: Potentially suitable pending stated conditions.
- `needs_information`: More information is required.
- `not_qualified`: Not presently suitable.
- `on_hold`: Review paused without final disposition.

### follow_up_status
- `pending`: Follow-up is required.
- `scheduled`: Follow-up has been scheduled.
- `completed`: Required follow-up is complete.
- `no_response`: Reasonable attempts produced no response.
- `do_not_contact`: Contact must stop.

## Operating Routine

### Daily while advertising is active
1. Review new records in `voice_to_legacy_leads`.
2. Contact new leads promptly.
3. Update lead, qualification, and follow-up statuses.
4. Preserve relevant notes without entering unnecessary sensitive information.
5. Compare lead submissions with Google Ads conversion reporting.

### Weekly
1. Review Edge Function logs for failed requests.
2. Reconcile Google Ads conversions against stored lead records.
3. Review UTM and GCLID attribution completeness.
4. Review duplicate and rate-limit records.
5. Export an operational backup when appropriate.

### Monthly
1. Review Supabase usage and billing status.
2. Run security and performance advisors.
3. Review data nearing `retention_review_at`.
4. Audit users with access to Supabase and GitHub.
5. Review cost per lead, qualification rate, contact rate, and signed-author conversion rate.

## Troubleshooting

### No lead appears after submission
- Check the browser response and console.
- Check the Edge Function logs.
- Confirm the request originated from an allowed domain.
- Confirm required consent fields were true.
- Confirm the payload used JSON and remained under the size limit.
- Confirm the anti-spam `website` honeypot was empty for the legitimate submission.
- Confirm Supabase reports the Edge Function as active.

### Submission returns `origin_not_allowed`
- Verify the request came from `voicetolegacy.org`, `www.voicetolegacy.org`, or the approved GitHub Pages preview origin.
- Update the Edge Function allowlist only through a reviewed deployment.

### Submission returns `validation_failed`
- Review the returned field map.
- Correct the input rather than weakening database constraints.
- The public Voice Discovery form requires the core `project_concept` response and applies client-side minimum-length validation before submission.

### Submission returns `rate_limited`
- Wait for the rate-limit window to expire.
- Confirm the traffic is legitimate before changing thresholds.

### Duplicate response
- A matching lead was submitted within the duplicate window.
- Use the returned existing submission ID.
- Do not create unnecessary duplicate records.

## Secret-Handling Prohibitions

Never commit or publish:
- Supabase service-role keys
- Database passwords
- Private API tokens
- SMTP credentials
- Google Ads private credentials
- Administrative session tokens

Public browser code may contain only the Edge Function URL and other explicitly publishable configuration.

## Deployment Gates

- Backend schema deployed: PASSED
- RLS and direct-access lock: PASSED
- Edge Function deployed: PASSED
- Development-form connection: IMPLEMENTED
- Guided Voice Discovery `/start/` rebuild: IMPLEMENTED IN PR #4
- Confirmation `/thank-you/` flow: IMPLEMENTED IN PR #4
- Static JavaScript syntax validation: PASSED
- Broken public Voice Discovery Guide reference: REMOVED
- Real browser submission against the deployed Edge Function: PENDING FINAL LIVE VERIFICATION
- Invalid-data browser verification: PENDING FINAL LIVE VERIFICATION
- Duplicate-handling browser verification: PENDING FINAL LIVE VERIFICATION
- Mobile-width browser submission verification: PENDING FINAL LIVE VERIFICATION
- Production merge: LOCKED UNTIL THE FOUR FINAL LIVE VERIFICATIONS ABOVE PASS
- Production deployment: NOT AUTHORIZED BY PR #4 REVIEW ALONE
- Google Ads funding: LOCKED UNTIL PRODUCTION MERGE/DEPLOYMENT AND FOUNDER AUTHORIZATION
