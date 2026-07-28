
(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));
  } else reveals.forEach(el => el.classList.add('visible'));

  document.querySelectorAll('[data-faq]').forEach(item => {
    item.querySelector('button')?.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      item.querySelector('button')?.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const requestForm = document.querySelector('[data-intake-request]');
  requestForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(requestForm);
    const subject = encodeURIComponent(`Voice to Legacy ${data.get('method')} Intake Request`);
    const body = encodeURIComponent(
`Name: ${data.get('name')}
Email: ${data.get('email')}
Phone: ${data.get('phone')}
Preferred method: ${data.get('method')}
First preferred time: ${data.get('time1')}
Second preferred time: ${data.get('time2')}
Time zone: ${data.get('timezone')}
Notes: ${data.get('notes') || 'None'}`
    );
    window.location.href = `mailto:elijah@divinityxenterprises.com?subject=${subject}&body=${body}`;
  });
})();
