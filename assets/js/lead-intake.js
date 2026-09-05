(() => {
  'use strict';

  const ENDPOINT = 'https://cywudaqttafinhujonvu.supabase.co/functions/v1/submit-voice-to-legacy-lead';
  const form = document.querySelector('[data-vtl-lead-form]');
  const status = document.querySelector('[data-vtl-form-status]');
  if (!form || !status) return;

  const params = new URLSearchParams(location.search);
  const attribution = {
    utm_source: params.get('utm_source') || sessionStorage.getItem('vtl_utm_source') || '',
    utm_medium: params.get('utm_medium') || sessionStorage.getItem('vtl_utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || sessionStorage.getItem('vtl_utm_campaign') || '',
    utm_term: params.get('utm_term') || sessionStorage.getItem('vtl_utm_term') || '',
    utm_content: params.get('utm_content') || sessionStorage.getItem('vtl_utm_content') || '',
    gclid: params.get('gclid') || sessionStorage.getItem('vtl_gclid') || '',
  };

  Object.entries(attribution).forEach(([key, value]) => {
    if (value) sessionStorage.setItem(`vtl_${key}`, value);
  });

  const setStatus = (message, isError = false) => {
    status.hidden = false;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'success';
    status.focus?.({ preventScroll: true });
  };

  const clearErrors = () => {
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
  };

  const markServerErrors = (fields = {}) => {
    Object.entries(fields).forEach(([name, message]) => {
      const field = form.elements.namedItem(name);
      if (field && 'setAttribute' in field) {
        field.setAttribute('aria-invalid', 'true');
        field.setCustomValidity(String(message));
      }
    });
  };

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.removeAttribute('aria-invalid');
      field.setCustomValidity('');
    });
    field.addEventListener('change', () => {
      field.removeAttribute('aria-invalid');
      field.setCustomValidity('');
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.hidden = true;
    clearErrors();

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus('Please complete every required field before submitting.', true);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting…';

    const data = new FormData(form);
    const isTest = form.dataset.testMode === 'true';
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
      discovery_mode: form.dataset.discoveryMode || 'written',
      best_contact_time: String(data.get('best_contact_time') || ''),
      consent_to_contact: data.get('consent_to_contact') === 'on',
      privacy_acknowledged: data.get('privacy_acknowledged') === 'on',
      consent_text_version: isTest ? 'v1.0-test' : 'v1.0-production',
      source_page: location.pathname,
      referrer: document.referrer,
      landing_page_url: location.href,
      ...attribution,
      device_information: {
        language: navigator.language,
        platform: navigator.platform,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight,
        test_mode: isTest,
      },
      website: String(data.get('website') || ''),
    };

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client-Version': isTest ? 'vtl-backend-test-2.0' : 'vtl-production-form-1.0' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        if (result.fields) markServerErrors(result.fields);
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setStatus(result.duplicate
        ? `Your voice discovery was already received. Reference ID: ${result.submission_id}`
        : `Your voice discovery was received. Reference ID: ${result.submission_id}`);
      form.dataset.lastSubmissionId = result.submission_id || '';
      window.dispatchEvent(new CustomEvent('vtl:lead-submitted', { detail: result }));

      const successUrl = form.dataset.successUrl;
      if (successUrl && !isTest) {
        sessionStorage.setItem('vtl_submission_id', result.submission_id || '');
        sessionStorage.setItem('vtl_submission_duplicate', result.duplicate ? 'true' : 'false');
        window.setTimeout(() => {
          location.assign(new URL(successUrl, document.baseURI).href);
        }, 500);
      }
    } catch (error) {
      console.error(error);
      const friendly = error.message === 'validation_failed'
        ? 'Please review the highlighted fields and submit again.'
        : error.message === 'rate_limited'
          ? 'Too many attempts were received. Please wait and try again later.'
          : 'We could not securely submit your information. Please try again or use the phone and email options below.';
      setStatus(friendly, true);
      form.querySelector('[aria-invalid="true"]')?.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
})();
