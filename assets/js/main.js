(() => {
  'use strict';

  const PHONE_DISPLAY = '502-270-8828';
  const PHONE_TEL = '+15022708828';
  const EMAIL = 'accounting@divinityxenterprises.com';
  const GITHUB_PROJECT_PATH = '/VoiceToLegacy.org/';
  const SITE_ROOT_PATH = location.hostname.endsWith('github.io') ? GITHUB_PROJECT_PATH : '/';
  const SITE_ROOT_URL = new URL(SITE_ROOT_PATH, location.origin);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const siteUrl = (path = '') => {
    const cleanPath = String(path).replace(/^\/+/, '');
    return new URL(cleanPath, SITE_ROOT_URL).href;
  };

  const showToast = (message) => {
    let toast = document.querySelector('[data-site-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('data-site-toast', '');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 4200);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      return copied;
    }
  };

  const downloadTextFile = (filename, text) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* Normalize every site route for both the custom domain and GitHub Pages preview. */
  document.querySelectorAll('a[href]').forEach((link) => {
    const rawHref = link.getAttribute('href')?.trim() ?? '';
    if (!rawHref || rawHref === '.') {
      link.href = SITE_ROOT_URL.href;
      return;
    }
    if (
      rawHref.startsWith('#') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('sms:') ||
      rawHref.startsWith('javascript:')
    ) {
      return;
    }
    try {
      const resolved = new URL(rawHref, SITE_ROOT_URL);
      if (resolved.origin === location.origin) link.href = resolved.href;
    } catch (_) {
      /* Leave malformed or unsupported protocols untouched. */
    }
  });

  document.querySelectorAll('a.brand').forEach((link) => {
    link.href = SITE_ROOT_URL.href;
  });

  document.querySelectorAll('nav a').forEach((link) => {
    if (link.textContent.trim() === 'Home') link.href = SITE_ROOT_URL.href;
  });

  document.querySelectorAll('img.about-brand-emblem').forEach((image) => {
    image.src = siteUrl('assets/img/book-emblem.webp');
  });

  document.querySelectorAll('a[download]').forEach((link) => {
    const rawHref = link.getAttribute('href') || '';
    if (!/^(https?:|mailto:|tel:|sms:|#)/i.test(rawHref)) link.href = siteUrl(rawHref);
    if (!link.getAttribute('download')) link.setAttribute('download', 'Voice_to_Legacy_Prospective_Author_Intake_Form.pdf');
    link.addEventListener('click', () => {
      showToast('Your fillable Voice to Legacy intake form is downloading.');
    });
  });

  /* External links open safely in a separate tab. */
  document.querySelectorAll('a[href^="http://"], a[href^="https://"]').forEach((link) => {
    const targetUrl = new URL(link.href, location.href);
    if (targetUrl.origin === location.origin) return;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    if (!link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', `${link.textContent.trim()} (opens in a new tab)`);
    }
  });

  /* Keep active navigation accurate after custom-domain routing. */
  const normalizedPath = location.pathname
    .replace(/^\/VoiceToLegacy\.org\/?/, '/')
    .replace(/index\.html$/, '')
    .replace(/\/+$/, '/') || '/';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a:not(.button)').forEach((link) => {
    const linkPath = new URL(link.href, location.href).pathname
      .replace(/^\/VoiceToLegacy\.org\/?/, '/')
      .replace(/index\.html$/, '')
      .replace(/\/+$/, '/') || '/';
    const isActive = linkPath === normalizedPath;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  let lastFocusedElement = null;

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = 'Open menu';
    if (restoreFocus) (lastFocusedElement || toggle).focus();
  };

  if (menu && toggle) {
    menu.setAttribute('aria-hidden', 'true');
    toggle.addEventListener('click', () => {
      const willOpen = !menu.classList.contains('open');
      if (!willOpen) {
        closeMenu({ restoreFocus: true });
        return;
      }
      lastFocusedElement = document.activeElement;
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      const label = toggle.querySelector('.sr-only');
      if (label) label.textContent = 'Close menu';
      menu.querySelector('a')?.focus();
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu({ restoreFocus: true });
    });
    document.addEventListener('click', (event) => {
      if (!menu.classList.contains('open')) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100 && menu.classList.contains('open')) closeMenu();
    });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  /* Reveal sections, with a guaranteed fallback so content never stays blank. */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 100px 0px' });
    reveals.forEach((element) => observer.observe(element));
    window.setTimeout(() => reveals.forEach((element) => element.classList.add('visible')), 1400);
  } else {
    reveals.forEach((element) => element.classList.add('visible'));
  }

  /* Accessible FAQ controls: one answer at a time, correct ARIA, and visible state icon. */
  const faqItems = [...document.querySelectorAll('[data-faq]')];
  faqItems.forEach((item, index) => {
    const button = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');
    const stateIcon = button?.querySelector('span:last-child');
    if (!button || !answer) return;
    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    answer.hidden = true;
    button.setAttribute('aria-controls', answerId);
    button.setAttribute('aria-expanded', 'false');
    if (stateIcon) stateIcon.textContent = '+';

    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('open');
      faqItems.forEach((otherItem) => {
        const otherButton = otherItem.querySelector('button');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        const otherIcon = otherButton?.querySelector('span:last-child');
        otherItem.classList.remove('open');
        otherButton?.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.hidden = true;
        if (otherIcon) otherIcon.textContent = '+';
      });
      if (willOpen) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        if (stateIcon) stateIcon.textContent = '−';
      }
    });
  });

  /* Same-page anchor scrolling respects the fixed header and preserves keyboard focus. */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    if (link.getAttribute('href') === '#') return;
    link.addEventListener('click', (event) => {
      const selector = link.getAttribute('href');
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, reducedMotion ? 0 : 450);
      history.replaceState(null, '', selector);
    });
  });

  const createContactDialog = () => {
    let dialog = document.querySelector('[data-contact-dialog]');
    if (dialog) return dialog;

    dialog = document.createElement('dialog');
    dialog.className = 'contact-action-dialog';
    dialog.setAttribute('data-contact-dialog', '');
    dialog.innerHTML = `
      <form method="dialog" class="contact-action-card">
        <button class="contact-dialog-close" value="cancel" aria-label="Close contact options">×</button>
        <p class="section-kicker">Contact Voice to Legacy™</p>
        <h2>Call, text, or copy the number.</h2>
        <p>Choose the action supported by your device.</p>
        <div class="contact-action-buttons">
          <a class="button button-gold" href="tel:${PHONE_TEL}">Call ${PHONE_DISPLAY}</a>
          <a class="button button-outline" href="sms:${PHONE_TEL}">Text ${PHONE_DISPLAY}</a>
          <button class="button button-outline" type="button" data-copy-phone>Copy Number</button>
        </div>
      </form>`;
    document.body.appendChild(dialog);
    dialog.querySelector('[data-copy-phone]')?.addEventListener('click', async () => {
      await copyText(PHONE_DISPLAY);
      showToast(`Phone number copied: ${PHONE_DISPLAY}`);
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    return dialog;
  };

  /* Combined “Call or Text” controls open a clear chooser instead of failing on desktop. */
  document.querySelectorAll(`a[href="tel:${PHONE_TEL}"]`).forEach((link) => {
    const contextText = `${link.textContent} ${link.closest('.option-card')?.querySelector('h2')?.textContent || ''}`.toLowerCase();
    const isCombinedControl = contextText.includes('text');
    if (isCombinedControl) {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const dialog = createContactDialog();
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else {
          copyText(PHONE_DISPLAY);
          showToast(`Phone number copied: ${PHONE_DISPLAY}`);
        }
      });
      return;
    }
    link.addEventListener('click', () => {
      copyText(PHONE_DISPLAY);
      showToast(`Phone number copied: ${PHONE_DISPLAY}`);
    });
  });

  /* Email links always copy the address as a fallback before opening the email application. */
  document.querySelectorAll(`a[href^="mailto:${EMAIL}"]`).forEach((link) => {
    link.addEventListener('click', () => {
      copyText(EMAIL);
      showToast(`Email copied: ${EMAIL}`);
    });
  });

  /* Phone/Zoom cards select the method before scrolling to the request form. */
  const requestForm = document.querySelector('[data-intake-request]');
  const methodField = requestForm?.querySelector('[name="method"]');
  document.querySelectorAll('a[href="#live-intake"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const method = link.textContent.toLowerCase().includes('zoom') ? 'Zoom' : 'Phone';
      if (methodField) methodField.value = method;
      requestForm?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => requestForm?.querySelector('[name="name"]')?.focus(), reducedMotion ? 0 : 450);
      showToast(`${method} intake selected. Complete the request form below.`);
    });
  });

  if (requestForm) {
    requestForm.setAttribute('novalidate', '');
    const status = document.createElement('div');
    status.className = 'notice form-status';
    status.hidden = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    requestForm.appendChild(status);

    const phoneField = requestForm.querySelector('[name="phone"]');
    phoneField?.setAttribute('inputmode', 'tel');
    phoneField?.setAttribute('autocomplete', 'tel');

    requestForm.querySelectorAll('input, select, textarea').forEach((field) => {
      field.addEventListener('input', () => field.removeAttribute('aria-invalid'));
      field.addEventListener('change', () => field.removeAttribute('aria-invalid'));
    });

    requestForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const requiredFields = [...requestForm.querySelectorAll('[required]')];
      const invalidFields = requiredFields.filter((field) => !field.checkValidity());
      requiredFields.forEach((field) => field.toggleAttribute('aria-invalid', !field.checkValidity()));
      if (invalidFields.length) {
        invalidFields[0].focus();
        requestForm.reportValidity();
        showToast('Please complete the required fields before preparing your request.');
        return;
      }

      const data = new FormData(requestForm);
      const method = String(data.get('method') || '').trim();
      const fullName = String(data.get('name') || '').trim();
      const subjectText = `Voice to Legacy ${method} Intake Request — ${fullName}`;
      const bodyText = [
        'VOICE TO LEGACY™ INTAKE REQUEST',
        '',
        `Name: ${fullName}`,
        `Email: ${String(data.get('email') || '').trim()}`,
        `Phone: ${String(data.get('phone') || '').trim()}`,
        `Preferred method: ${method}`,
        `First preferred time: ${String(data.get('time1') || '').trim()}`,
        `Second preferred time: ${String(data.get('time2') || '').trim()}`,
        `Time zone: ${String(data.get('timezone') || '').trim()}`,
        `Notes: ${String(data.get('notes') || '').trim() || 'None'}`,
        '',
        'I understand this request is not confirmed until Divinityx Publishing Company responds in writing.'
      ].join('\n');

      const copied = await copyText(bodyText);
      status.hidden = false;
      status.replaceChildren();

      const heading = document.createElement('h3');
      heading.textContent = 'Your intake request is ready.';
      status.appendChild(heading);

      const message = document.createElement('p');
      message.textContent = copied
        ? 'The complete request was copied. Use one of the actions below to email it, copy it again, or save a text-file backup.'
        : 'Use one of the actions below to email the request or save a text-file backup.';
      status.appendChild(message);

      const actions = document.createElement('div');
      actions.className = 'button-row';

      const emailLink = document.createElement('a');
      emailLink.className = 'button button-gold';
      emailLink.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
      emailLink.textContent = 'Open Email Request';
      emailLink.addEventListener('click', () => copyText(bodyText));
      actions.appendChild(emailLink);

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'button button-outline';
      copyButton.textContent = 'Copy Request Again';
      copyButton.addEventListener('click', async () => {
        await copyText(bodyText);
        showToast('Intake request copied.');
      });
      actions.appendChild(copyButton);

      const downloadButton = document.createElement('button');
      downloadButton.type = 'button';
      downloadButton.className = 'button button-outline';
      downloadButton.textContent = 'Save Request Backup';
      downloadButton.addEventListener('click', () => {
        const safeName = fullName.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'prospective-author';
        downloadTextFile(`voice-to-legacy-intake-request-${safeName}.txt`, bodyText);
        showToast('Request backup downloaded.');
      });
      actions.appendChild(downloadButton);

      status.appendChild(actions);
      status.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      showToast(copied ? 'Intake request copied and ready.' : 'Intake request prepared.');
    });
  }
})();
