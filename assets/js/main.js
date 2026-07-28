(() => {
  const PHONE_DISPLAY = '502-270-8828';
  const PHONE_TEL = '+15022708828';
  const EMAIL = 'elijah@divinityxenterprises.com';
  const baseUrl = document.baseURI;

  const showToast = (message) => {
    let toast = document.querySelector('[data-site-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.setAttribute('data-site-toast', '');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      Object.assign(toast.style, {
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: '9999',
        maxWidth: '360px',
        padding: '14px 18px',
        borderRadius: '14px',
        border: '1px solid rgba(247,200,90,.45)',
        background: '#071427',
        color: '#fffdf7',
        boxShadow: '0 18px 55px rgba(0,0,0,.45)',
        fontWeight: '700',
        opacity: '0',
        transform: 'translateY(12px)',
        transition: 'opacity .2s ease, transform .2s ease'
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
    }, 4200);
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

  /* Make Home and logo links deterministic on both GitHub Pages and VoiceToLegacy.org. */
  document.querySelectorAll('a.brand').forEach(link => {
    link.href = baseUrl;
  });
  document.querySelectorAll('nav a').forEach(link => {
    if (link.textContent.trim() === 'Home') link.href = baseUrl;
  });

  /* Correct the About-page image path even when a dynamic <base> element is active. */
  document.querySelectorAll('img.about-brand-emblem').forEach(image => {
    image.src = new URL('assets/img/book-emblem.webp', baseUrl).href;
  });

  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const closeMenu = () => {
    menu?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    const label = toggle?.querySelector('.sr-only');
    if (label) label.textContent = 'Open menu';
  };

  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });
  document.addEventListener('click', event => {
    if (!menu?.classList.contains('open')) return;
    if (!menu.contains(event.target) && !toggle?.contains(event.target)) closeMenu();
  });

  document.querySelectorAll('[data-year]').forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  /* Keep the elegant reveal effect, but never leave sections permanently blank. */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px 100px 0px' });
    reveals.forEach(element => observer.observe(element));
    setTimeout(() => reveals.forEach(element => element.classList.add('visible')), 1400);
  } else {
    reveals.forEach(element => element.classList.add('visible'));
  }

  document.querySelectorAll('[data-faq]').forEach((item, index) => {
    const button = item.querySelector('button');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;
    const answerId = answer.id || `faq-answer-${index + 1}`;
    answer.id = answerId;
    button.setAttribute('aria-controls', answerId);
    button.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  });

  /* Phone links copy the number as a desktop fallback before opening the dialer. */
  document.querySelectorAll(`a[href="tel:${PHONE_TEL}"]`).forEach(link => {
    link.addEventListener('click', () => {
      copyText(PHONE_DISPLAY);
      showToast(`Phone number copied: ${PHONE_DISPLAY}`);
    });

    const text = link.textContent.trim().toLowerCase();
    if (text.includes('call or text')) {
      link.textContent = `Call ${PHONE_DISPLAY}`;
    }

    const parent = link.parentElement;
    if (!parent || parent.querySelector('[data-sms-link]')) return;
    if (!link.classList.contains('button') && !link.closest('.footer-grid')) return;

    const smsLink = document.createElement('a');
    smsLink.href = `sms:${PHONE_TEL}`;
    smsLink.setAttribute('data-sms-link', '');
    smsLink.textContent = `Text ${PHONE_DISPLAY}`;
    if (link.classList.contains('button')) {
      smsLink.className = 'button button-outline';
    }
    smsLink.addEventListener('click', () => {
      copyText(PHONE_DISPLAY);
      showToast(`Phone number copied: ${PHONE_DISPLAY}`);
    });
    link.insertAdjacentElement('afterend', smsLink);
  });

  /* Email links copy the address first so there is always a fallback. */
  document.querySelectorAll(`a[href^="mailto:${EMAIL}"]`).forEach(link => {
    link.addEventListener('click', () => {
      copyText(EMAIL);
      showToast(`Email address copied: ${EMAIL}`);
    });
  });

  /* Phone/Zoom request buttons select the correct method before scrolling. */
  const requestForm = document.querySelector('[data-intake-request]');
  const methodField = requestForm?.querySelector('[name="method"]');
  document.querySelectorAll('a[href="#live-intake"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const method = link.textContent.toLowerCase().includes('zoom') ? 'Zoom' : 'Phone';
      if (methodField) methodField.value = method;
      requestForm?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => requestForm?.querySelector('[name="name"]')?.focus(), 550);
      showToast(`${method} intake selected. Complete the request form below.`);
    });
  });

  /* Build a complete intake request, copy it, and open the visitor's email app. */
  if (requestForm) {
    const status = document.createElement('div');
    status.className = 'notice';
    status.hidden = true;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    requestForm.appendChild(status);

    requestForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (!requestForm.reportValidity()) return;

      const data = new FormData(requestForm);
      const subjectText = `Voice to Legacy ${data.get('method')} Intake Request`;
      const bodyText = [
        'VOICE TO LEGACY™ INTAKE REQUEST',
        '',
        `Name: ${data.get('name')}`,
        `Email: ${data.get('email')}`,
        `Phone: ${data.get('phone')}`,
        `Preferred method: ${data.get('method')}`,
        `First preferred time: ${data.get('time1')}`,
        `Second preferred time: ${data.get('time2')}`,
        `Time zone: ${data.get('timezone')}`,
        `Notes: ${data.get('notes') || 'None'}`
      ].join('\n');

      const copied = await copyText(bodyText);
      status.hidden = false;
      status.replaceChildren();

      const message = document.createElement('p');
      message.textContent = copied
        ? 'Your complete request has been copied. Your email app should open next. Paste the request into the message if it does not appear automatically.'
        : 'Your email app should open next. If it does not, use the email and copy buttons below.';
      status.appendChild(message);

      const actions = document.createElement('div');
      actions.className = 'button-row';

      const emailLink = document.createElement('a');
      emailLink.className = 'button button-gold';
      emailLink.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(bodyText)}`;
      emailLink.textContent = 'Open Email Request';
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

      status.appendChild(actions);
      showToast(copied ? 'Intake request copied and ready to email.' : 'Intake request prepared.');

      window.setTimeout(() => {
        window.location.href = emailLink.href;
      }, 250);
    });
  }
})();
