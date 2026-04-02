/* =============================================
   TROUV CHAUFFEURS — Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Sticky Header ----------
  const header = document.querySelector('.site-header');
  const scrollThreshold = 60;

  function handleScroll() {
    if (!header) return;
    if (window.scrollY > scrollThreshold) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on load

  // ---------- Mobile Navigation ----------
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Scroll Reveal Animations ----------
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');

  const revealObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          {
            threshold: 0.08,
            rootMargin: '0px 0px 0px 0px',
          }
        )
      : null;

  const markRevealVisibleIfInView = (el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.95 && rect.bottom > 0;
  };

  revealElements.forEach((el) => {
    if (!revealObserver) {
      el.classList.add('visible');
      return;
    }
    if (markRevealVisibleIfInView(el)) {
      el.classList.add('visible');
    } else {
      revealObserver.observe(el);
    }
  });

  // ---------- Smooth Scroll for In-Page Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // ---------- Contact form → POST /api/contact (Resend, see env.example) ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const statusEl = document.getElementById('contact-form-status');
    let sending = false;

    const clearStatusStyle = () => {
      if (!statusEl) return;
      statusEl.classList.remove('is-error', 'is-success');
    };

    const showStatusError = (text) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      clearStatusStyle();
      statusEl.classList.add('is-error');
    };

    const showStatusSuccess = (text) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      clearStatusStyle();
      statusEl.classList.add('is-success');
    };

    const showStatusNeutral = (text) => {
      if (!statusEl) return;
      statusEl.textContent = text;
      clearStatusStyle();
    };

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;

      const name = contactForm.querySelector('#name');
      const email = contactForm.querySelector('#email');
      const phone = contactForm.querySelector('#phone');
      const service = contactForm.querySelector('#service');
      const message = contactForm.querySelector('#message');
      const companyField = contactForm.querySelector('#contact-company');

      let isValid = true;

      [name, email, phone, message].forEach((field) => {
        if (field && !field.value.trim()) {
          field.style.borderColor = '#cc0000';
          isValid = false;
        } else if (field) {
          field.style.borderColor = '';
        }
      });

      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.style.borderColor = '#cc0000';
        isValid = false;
      }

      if (!isValid) {
        showStatusError('Please complete all required fields.');
        return;
      }

      if (companyField && companyField.value.trim() !== '') {
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      sending = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      showStatusNeutral('Sending your request…');

      const serviceLabel =
        service && service.selectedOptions[0]
          ? service.selectedOptions[0].textContent.trim()
          : '';

      const payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        service: service && service.value ? service.value : '',
        service_label: serviceLabel,
        message: message.value.trim(),
        company: companyField ? companyField.value : '',
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 503) {
          showStatusError(
            'This quote form is not connected to email yet. Please use info@trouv.co.uk or call +44 203 835 5338 while we finish setup.'
          );
          return;
        }

        if (!res.ok || data.success !== true) {
          const msg =
            (data && data.error) ||
            'Could not send your message. Please try again or email info@trouv.co.uk.';
          throw new Error(msg);
        }

        showStatusSuccess('Thank you. We have received your request and will reply shortly.');
        contactForm.reset();
      } catch (err) {
        const msg =
          err && err.message
            ? err.message
            : 'Something went wrong. Please email info@trouv.co.uk.';
        showStatusError(msg);
      } finally {
        sending = false;
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // ---------- Active Navigation ----------
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---------- FAQ accordion ----------
  const faqRoot = document.querySelector('.faq-accordion');
  if (faqRoot) {
    faqRoot.querySelectorAll('.faq-item__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const panelId = trigger.getAttribute('aria-controls');
        const panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        const isOpen = item.classList.contains('is-open');

        faqRoot.querySelectorAll('.faq-item').forEach(other => {
          if (other === item) return;
          other.classList.remove('is-open');
          const t = other.querySelector('.faq-item__trigger');
          const pId = t && t.getAttribute('aria-controls');
          const p = pId ? document.getElementById(pId) : null;
          if (t) t.setAttribute('aria-expanded', 'false');
          if (p) p.hidden = true;
        });

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          panel.hidden = true;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });
    });
  }
});
