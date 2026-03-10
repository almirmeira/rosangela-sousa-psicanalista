/**
 * ============================================================
 * ROSANGELA SOUSA PSICANALISTA — JavaScript Principal
 * Versão: 1.0
 * Funcionalidades: Navbar, Smooth Scroll, Animações,
 *   Accordion FAQ, Formulário, WhatsApp, Counter
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────
   CONFIGURAÇÃO GLOBAL
───────────────────────────────────────── */
const CONFIG = {
  whatsappNumber: '5511999999999',
  whatsappMessage: 'Olá, Rosangela! Gostaria de agendar uma sessão de descoberta gratuita.',
  scrollThreshold: 100,
  counterDuration: 2000,
};

/* ─────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────── */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

/**
 * Cria link do WhatsApp com mensagem pré-definida
 */
function getWhatsAppLink(message = CONFIG.whatsappMessage) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}`;
}

/**
 * Detecta a página atual pelo pathname
 */
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('sobre'))    return 'sobre';
  if (path.includes('servicos')) return 'servicos';
  if (path.includes('cursos'))   return 'cursos';
  if (path.includes('contato'))  return 'contato';
  return 'home';
}

/* ─────────────────────────────────────────
   1. NAVBAR — SCROLL + HAMBURGUER
───────────────────────────────────────── */
function initNavbar() {
  const navbar = $('.navbar');
  const toggle = $('.navbar-toggle');
  const menu   = $('.navbar-menu');

  if (!navbar) return;

  // Marca link ativo com base na página atual
  const currentPage = getCurrentPage();
  $$('.navbar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (
      (currentPage === 'home'     && (href === '../index.html' || href === 'index.html' || href === '/')) ||
      (currentPage === 'sobre'    && href.includes('sobre'))   ||
      (currentPage === 'servicos' && href.includes('servicos'))||
      (currentPage === 'cursos'   && href.includes('cursos'))  ||
      (currentPage === 'contato'  && href.includes('contato'))
    ) {
      link.classList.add('active');
    }
  });

  // Scroll da navbar
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > CONFIG.scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  }, { passive: true });

  // Hamburguer menu
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      menu.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fechar ao clicar em link
    $$('.navbar-link', menu).forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') &&
          !navbar.contains(e.target)) {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ─────────────────────────────────────────
   2. SMOOTH SCROLL
───────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height')
      ) || 80;

      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────
   3. ANIMAÇÕES DE ENTRADA (INTERSECTION OBSERVER)
───────────────────────────────────────── */
function initAnimations() {
  const elements = $$('.fade-in, .fade-in-left, .fade-in-right');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Delay escalonado para grupos de elementos
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Number(delay));
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  // Adiciona delays escalonados para elementos dentro do mesmo pai
  const groups = {};
  elements.forEach(el => {
    const parent = el.parentElement;
    const key = parent ? parent.dataset.animGroup || '' : '';
    if (key) {
      groups[key] = (groups[key] || 0);
      el.dataset.delay = groups[key] * 120;
      groups[key]++;
    }
    observer.observe(el);
  });
}

/* ─────────────────────────────────────────
   4. ACORDEÃO FAQ
───────────────────────────────────────── */
function initAccordion() {
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);

    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Fecha todos os outros
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const otherAnswer = $('.faq-answer', other);
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
        }
      });

      // Toggle atual
      if (isOpen) {
        item.classList.remove('open');
        answer.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // Acessibilidade: Enter e Space
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.setAttribute('aria-expanded', 'false');
  });
}

/* ─────────────────────────────────────────
   5. BOTÃO VOLTAR AO TOPO
───────────────────────────────────────── */
function initBackToTop() {
  const btn = $('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────────────────────────
   6. LINKS WHATSAPP
───────────────────────────────────────── */
function initWhatsApp() {
  // Botão flutuante
  const floatBtn = $('.whatsapp-btn');
  if (floatBtn) {
    floatBtn.href = getWhatsAppLink();
  }

  // Todos os links marcados com data-whatsapp
  $$('[data-whatsapp]').forEach(el => {
    const msg = el.dataset.whatsapp || CONFIG.whatsappMessage;
    el.href = getWhatsAppLink(msg);
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  });
}

/* ─────────────────────────────────────────
   7. CONTADOR ANIMADO DE ESTATÍSTICAS
───────────────────────────────────────── */
function animateCounter(el, target, duration = CONFIG.counterDuration) {
  const start = performance.now();
  const suffix = el.dataset.suffix || '';

  const update = (currentTime) => {
    const elapsed = currentTime - start;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = current.toLocaleString('pt-BR') + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = $$('.stat-number[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCounter(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(counter => observer.observe(counter));
}

/* ─────────────────────────────────────────
   8. VALIDAÇÃO DE FORMULÁRIO
───────────────────────────────────────── */
function validateField(field) {
  const group = field.closest('.form-group');
  const errorEl = group ? $('.form-error', group) : null;

  let isValid = true;
  let message = '';

  // Required
  if (field.required && !field.value.trim()) {
    isValid = false;
    message = 'Este campo é obrigatório.';
  }

  // Email
  if (isValid && field.type === 'email' && field.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      isValid = false;
      message = 'Insira um e-mail válido.';
    }
  }

  // Telefone (mínimo de dígitos)
  if (isValid && field.type === 'tel' && field.value) {
    const digits = field.value.replace(/\D/g, '');
    if (digits.length < 10) {
      isValid = false;
      message = 'Insira um telefone com DDD válido.';
    }
  }

  if (group) {
    group.classList.toggle('error', !isValid);
    if (errorEl) errorEl.textContent = message;
  }

  return isValid;
}

function initForms() {
  $$('.contact-form, .newsletter-form-el').forEach(form => {
    // Validação em tempo real (blur)
    $$('input, select, textarea', form).forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.closest('.form-group')?.classList.contains('error')) {
          validateField(field);
        }
      });
    });

    // Submissão
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let allValid = true;
      $$('input[required], select[required], textarea[required]', form).forEach(field => {
        if (!validateField(field)) allValid = false;
      });

      if (!allValid) {
        // Scroll para primeiro erro
        const firstError = $('.form-group.error', form);
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Simula envio e redireciona ao WhatsApp
      const submitBtn = $('[type="submit"]', form);
      const originalText = submitBtn?.textContent || 'Enviar';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      setTimeout(() => {
        // Mostra mensagem de sucesso
        const successMsg = $('.form-success-msg', form.closest('section') || form.parentElement);
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Constrói mensagem do WhatsApp com dados do formulário
        const nome = ($('[name="nome"]', form) || {}).value || '';
        const servico = ($('[name="servico"]', form) || {}).value || '';
        const dificuldade = ($('[name="dificuldade"]', form) || {}).value || '';

        const msg = nome
          ? `Olá, Rosangela! Meu nome é ${nome}${servico ? `, tenho interesse em ${servico}` : ''}${dificuldade ? `. Minha principal dificuldade: ${dificuldade}` : ''}. Gostaria de agendar uma conversa.`
          : CONFIG.whatsappMessage;

        // Abre WhatsApp após 2 segundos
        setTimeout(() => {
          window.open(getWhatsAppLink(msg), '_blank');
        }, 1500);

        form.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }, 800);
    });
  });

  // Máscara de telefone
  $$('input[type="tel"]').forEach(input => {
    input.addEventListener('input', () => {
      let val = input.value.replace(/\D/g, '').substring(0, 11);
      if (val.length >= 11) {
        val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (val.length >= 7) {
        val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (val.length >= 3) {
        val = val.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      }
      input.value = val;
    });
  });
}

/* ─────────────────────────────────────────
   9. HIGHLIGHT DE NAVEGAÇÃO ATUAL
───────────────────────────────────────── */
function highlightCurrentSection() {
  if (getCurrentPage() !== 'home') return;

  const sections = $$('section[id]');
  const navLinks = $$('.navbar-link[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px',
    }
  );

  sections.forEach(section => observer.observe(section));
}

/* ─────────────────────────────────────────
   10. EFEITO PARALLAX SUAVE NO HERO
───────────────────────────────────────── */
function initParallax() {
  const heroBg = $('.hero-bg');
  if (!heroBg) return;

  // Desativa em mobile para performance
  if (window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.35}px)`;
  }, { passive: true });
}

/* ─────────────────────────────────────────
   11. ADICIONAR CLASSES DE ANIMAÇÃO
        (às seções que não têm ainda)
───────────────────────────────────────── */
function assignAnimationClasses() {
  // Cards em grid recebem fade-in com delay
  const gridSelectors = [
    '.servico-card',
    '.depoimento-card',
    '.passo-card',
    '.valor-card',
    '.timeline-item',
    '.stat-item',
  ];

  gridSelectors.forEach(sel => {
    $$(sel).forEach((el, i) => {
      if (!el.classList.contains('fade-in') &&
          !el.classList.contains('fade-in-left') &&
          !el.classList.contains('fade-in-right')) {
        el.classList.add('fade-in');
        el.dataset.delay = i * 100;
      }
    });
  });

  // Títulos de seção
  $$('.section-header').forEach(el => {
    if (!el.classList.contains('fade-in')) {
      el.classList.add('fade-in');
    }
  });

  // Curso cards
  $$('.curso-card, .curso-full-card').forEach((el, i) => {
    if (!el.classList.contains('fade-in')) {
      el.classList.add('fade-in');
      el.dataset.delay = i * 150;
    }
  });
}

/* ─────────────────────────────────────────
   12. TOOLTIP DE DISPONIBILIDADE (AGENDAMENTO)
───────────────────────────────────────── */
function initScheduleTooltip() {
  const scheduleEl = $('.schedule-info');
  if (!scheduleEl) return;

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const today = new Date().getDay();

  $$('.schedule-day', scheduleEl).forEach((el, index) => {
    if (index === today) {
      el.classList.add('today');
    }
  });
}

/* ─────────────────────────────────────────
   13. TABS (para serviços e cursos)
───────────────────────────────────────── */
function initTabs() {
  $$('.tabs-container').forEach(container => {
    const tabBtns  = $$('.tab-btn', container);
    const tabPanes = $$('.tab-pane', container);

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const pane = $(`#${target}`, container);
        if (pane) pane.classList.add('active');
      });
    });
  });
}

/* ─────────────────────────────────────────
   INICIALIZAÇÃO GERAL
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  assignAnimationClasses();
  initNavbar();
  initSmoothScroll();
  initAnimations();
  initAccordion();
  initBackToTop();
  initWhatsApp();
  initCounters();
  initForms();
  highlightCurrentSection();
  initParallax();
  initScheduleTooltip();
  initTabs();

  // Log discreto
  console.log(
    '%cRosangela Sousa Psicanalista%c\nSite profissional v1.0',
    'color: #2D6A4F; font-size: 18px; font-weight: bold; font-family: serif;',
    'color: #5F5F5F; font-size: 12px;'
  );
});

/* Expõe função getWhatsAppLink globalmente para uso inline */
window.getWhatsAppLink = getWhatsAppLink;
