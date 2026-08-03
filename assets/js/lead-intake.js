(() => {
  'use strict';

  const ENDPOINT = 'https://cywudaqttafinhujonvu.supabase.co/functions/v1/submit-voice-to-legacy-lead';
  const form = document.querySelector('[data-vtl-lead-form]');
  const status = document.querySelector('[data-vtl-form-status]');
  if (!form || !status) return;

  const params = new URLSearchParams(location.search);
  const attribution = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
    gclid: params.get('gclid') || '',
  };

  const setStatus = (message, isError = false) => {
    status.hidden = false;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'success';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Complete every required field before submitting the test.', true);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';

    const data = new FormData(form);
    const payload = {
      full_name: String(data.get('full_name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      city: String(data.get('city') || ''),
      state: String(data.get('state') || ''),
      project_concept: String(data.get('project_concept') || ''),
      intended_audience: String(data.get('intended_audience') || ''),
      desired_impact: String(data.get('desired_impact') || ''),
      existing_materials: String(data.get('existing_materials') || ''),
      preferred_contact_method: String(data.get('preferred_contact_method') || ''),
      best_contact_time: String(data.get('best_contact_time') || ''),
      consent_to_contact: data.get('consent_to_contact') === 'on',
      privacy_acknowledged: data.get('privacy_acknowledged') === 'on',
      consent_text_version: 'v1.0-test',
      source_page: location.pathname,
      referrer: document.referrer,
      landing_page_url: location.href,
      ...attribution,
      device_information: {
        language: navigator.language,
        platform: navigator.platform,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        test_mode: true,
      },
      website: String(data.get('website') || ''),
    };

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Version': 'vtl-backend-test-1.0' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || `HTTP ${response.status}`);

      setStatus(result.duplicate
        ? `Duplicate handling passed. Existing submission ID: ${result.submission_id}`
        : `Storage passed. Submission ID: ${result.submission_id}`);
      form.dataset.lastSubmissionId = result.submission_id || '';
      window.dispatchEvent(new CustomEvent('vtl:lead-submitted', { detail: result }));
    } catch (error) {
      console.error(error);
      setStatus(`Submission failed: ${error.message}. Review the Edge Function logs before proceeding.`, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Test Lead';
    }
  });
})();
