(() => {
  'use strict';

  const ENDPOINT = 'https://cywudaqttafinhujonvu.supabase.co/functions/v1/submit-voice-to-legacy-lead';
  const button = document.querySelector('[data-run-vtl-suite]');
  const results = document.querySelector('[data-vtl-suite-results]');
  if (!button || !results) return;

  const params = new URLSearchParams(location.search);
  const basePayload = {
    full_name: 'Backend Test Lead',
    email: 'backend.test@example.com',
    phone: '502-555-0188',
    city: 'Louisville',
    state: 'Kentucky',
    project_concept: 'A controlled backend validation record for the Voice to Legacy prospective-author intake system.',
    intended_audience: 'Internal validation only.',
    desired_impact: 'Verify secure storage, attribution, duplicate handling, and response behavior.',
    existing_materials: 'None.',
    preferred_contact_method: 'email',
    best_contact_time: 'Afternoon',
    consent_to_contact: true,
    privacy_acknowledged: true,
    consent_text_version: 'v1.0-test-suite',
    source_page: '/backend-test/',
    referrer: document.referrer,
    landing_page_url: location.href,
    utm_source: params.get('utm_source') || 'google',
    utm_medium: params.get('utm_medium') || 'cpc',
    utm_campaign: params.get('utm_campaign') || 'backend_validation',
    utm_term: params.get('utm_term') || 'publish_my_story',
    utm_content: params.get('utm_content') || 'test_ad',
    gclid: params.get('gclid') || 'TEST-GCLID-VTL-001',
    device_information: {
      language: navigator.language,
      platform: navigator.platform,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      test_mode: true,
      automated_suite: true,
    },
    website: '',
  };

  const request = async (payload) => {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': 'vtl-backend-suite-1.0',
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    return { status: response.status, body };
  };

  const addResult = (name, passed, detail) => {
    const item = document.createElement('li');
    item.textContent = `${passed ? 'PASS' : 'FAIL'} — ${name}: ${detail}`;
    item.dataset.state = passed ? 'success' : 'error';
    item.style.margin = '.65rem 0';
    results.appendChild(item);
    return passed;
  };

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = 'Running validation…';
    results.replaceChildren();
    let passedCount = 0;

    const tests = [
      {
        name: 'Duplicate handling',
        run: async () => {
          const stamp = Date.now();
          const duplicatePayload = {
            ...basePayload,
            full_name: 'Duplicate Backend Test Lead',
            email: `duplicate.test.${stamp}@example.com`,
            project_concept: `A unique duplicate-handling validation record for the Voice to Legacy secure prospective-author system ${stamp}.`,
          };
          const seed = await request(duplicatePayload);
          if (!(seed.status === 201 && seed.body.ok === true && Boolean(seed.body.submission_id) && seed.body.duplicate === false)) {
            return [false, `seed HTTP ${seed.status}; duplicate=${String(seed.body.duplicate)}`];
          }
          const duplicate = await request(duplicatePayload);
          return [duplicate.status === 200 && duplicate.body.ok === true && duplicate.body.duplicate === true && Boolean(duplicate.body.submission_id), `seed HTTP ${seed.status}; duplicate HTTP ${duplicate.status}; duplicate=${String(duplicate.body.duplicate)}`];
        },
      },
      {
        name: 'Invalid email rejection',
        run: async () => {
          const { status, body } = await request({ ...basePayload, email: 'not-an-email' });
          return [status === 422 && body.error === 'validation_failed' && Boolean(body.fields?.email), `HTTP ${status}; ${body.error || 'no error code'}`];
        },
      },
      {
        name: 'Missing consent rejection',
        run: async () => {
          const { status, body } = await request({ ...basePayload, consent_to_contact: false });
          return [status === 422 && Boolean(body.fields?.consent_to_contact), `HTTP ${status}; consent field=${Boolean(body.fields?.consent_to_contact)}`];
        },
      },
      {
        name: 'Missing privacy acknowledgment rejection',
        run: async () => {
          const { status, body } = await request({ ...basePayload, privacy_acknowledged: false });
          return [status === 422 && Boolean(body.fields?.privacy_acknowledged), `HTTP ${status}; privacy field=${Boolean(body.fields?.privacy_acknowledged)}`];
        },
      },
      {
        name: 'Short project concept rejection',
        run: async () => {
          const { status, body } = await request({ ...basePayload, project_concept: 'Too short' });
          return [status === 422 && Boolean(body.fields?.project_concept), `HTTP ${status}; concept field=${Boolean(body.fields?.project_concept)}`];
        },
      },
      {
        name: 'Honeypot handling',
        run: async () => {
          const { status, body } = await request({ ...basePayload, website: 'spam.example' });
          return [status === 200 && body.ok === true && body.submission_id === null, `HTTP ${status}; silent discard=${body.submission_id === null}`];
        },
      },
      {
        name: 'Allowed Codespaces origin',
        run: async () => {
          const { status, body } = await request({ ...basePayload, email: 'origin.check@example.com', project_concept: 'A unique allowed-origin verification record for the secure Voice to Legacy intake endpoint.' });
          return [(status === 201 || (status === 200 && body.duplicate === true)) && body.ok === true, `HTTP ${status}; endpoint accepted current origin`];
        },
      },
      {
        name: 'Mobile-width submission metadata',
        run: async () => {
          const mobilePayload = {
            ...basePayload,
            full_name: 'Mobile Backend Test Lead',
            email: `mobile.test.${Date.now()}@example.com`,
            project_concept: 'A unique mobile-width validation submission for the Voice to Legacy secure prospective-author system.',
            device_information: { ...basePayload.device_information, viewport_width: 390, viewport_height: 844, simulated_mobile: true },
          };
          const { status, body } = await request(mobilePayload);
          return [status === 201 && body.ok === true && Boolean(body.submission_id), `HTTP ${status}; submission=${body.submission_id || 'none'}`];
        },
      },
    ];

    for (const test of tests) {
      try {
        const [passed, detail] = await test.run();
        if (addResult(test.name, passed, detail)) passedCount += 1;
      } catch (error) {
        addResult(test.name, false, error.message || 'Network error');
      }
    }

    const summary = document.createElement('li');
    summary.style.marginTop = '1rem';
    summary.style.fontWeight = '700';
    summary.textContent = `${passedCount}/${tests.length} backend validation gates passed.`;
    summary.dataset.state = passedCount === tests.length ? 'success' : 'error';
    results.appendChild(summary);

    button.disabled = false;
    button.textContent = 'Run Complete Validation Suite';
  });
})();
