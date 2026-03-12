/**
 * ============================================================
 * AGENDA DE AGENDAMENTO — Rosangela Sousa Psicanalista
 * Versão: 1.0
 * Integração: Google Calendar (URL), Outlook (ICS download), WhatsApp
 * ============================================================
 */

'use strict';

/* ─────────────────────────────────────────
   CONFIGURAÇÃO
───────────────────────────────────────── */
const AGENDA_CONFIG = {
  whatsappNumber: '5511994673421',
  workingHours: {
    1: { start: 8,  end: 19 },
    2: { start: 8,  end: 19 },
    3: { start: 8,  end: 19 },
    4: { start: 8,  end: 19 },
    5: { start: 8,  end: 19 },
    6: { start: 8,  end: 13 },
  },
  sessionDuration: 50,
  breakBetween:    10,
  maxMonthsAhead:  2,
};

/* ─────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────── */
const agendaState = {
  currentStep:   1,
  totalSteps:    4,
  service:       null,  // { id, nome, duracao, preco }
  date:          null,  // Date object
  dateStr:       null,  // 'YYYY-MM-DD'
  time:          null,  // 'HH:MM'
  userData:      {},
  calendarYear:  null,
  calendarMonth: null,
  blockedSlots:  {},
};

/* ─────────────────────────────────────────
   UTILITÁRIOS DE DATA
───────────────────────────────────────── */
function padZ(n) { return String(n).padStart(2, '0'); }

function formatDateStr(date) {
  return `${date.getFullYear()}-${padZ(date.getMonth() + 1)}-${padZ(date.getDate())}`;
}

function formatDateBR(date) {
  const days   = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

function formatDateShortBR(date) {
  return `${padZ(date.getDate())}/${padZ(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

/* ─────────────────────────────────────────
   GERAÇÃO DE SLOTS BLOQUEADOS (DEMO)
   Simula uma agenda real com ~35% dos slots ocupados.
   Usa função pseudo-aleatória determinística baseada
   na data para que os dados sejam consistentes entre reloads.
───────────────────────────────────────── */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function generateDemoBlockedSlots() {
  const blocked = {};
  const today   = new Date();

  for (let d = 0; d <= 60; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);

    const dow = date.getDay();
    if (!AGENDA_CONFIG.workingHours[dow]) continue; // domingo

    const dateStr = formatDateStr(date);
    const slots   = getAllSlotsForDay(date);
    const seed    = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    blocked[dateStr] = slots
      .filter((_, i) => seededRand(seed + i * 17) < 0.38)
      .map(s => s.time);
  }

  return blocked;
}

function getAllSlotsForDay(date) {
  const dow   = date.getDay();
  const hours = AGENDA_CONFIG.workingHours[dow];
  if (!hours) return [];

  const slots    = [];
  const step     = AGENDA_CONFIG.sessionDuration + AGENDA_CONFIG.breakBetween;
  let   minuteT  = hours.start * 60;
  const endMin   = (hours.end  * 60) - AGENDA_CONFIG.sessionDuration;

  while (minuteT <= endMin) {
    const h = Math.floor(minuteT / 60);
    const m = minuteT % 60;
    slots.push({ time: `${padZ(h)}:${padZ(m)}` });
    minuteT += step;
  }

  return slots;
}

function getAvailableSlotsForDay(date) {
  const dateStr = formatDateStr(date);
  const all     = getAllSlotsForDay(date);
  const busy    = agendaState.blockedSlots[dateStr] || [];

  // Para hoje, bloqueia horários já passados
  const now = new Date();
  const isToday = isSameDay(date, now);

  return all.map(s => {
    const [h, m] = s.time.split(':').map(Number);
    const pastToday = isToday && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()));
    return {
      time:      s.time,
      available: !busy.includes(s.time) && !pastToday,
    };
  });
}

function countAvailableSlots(date) {
  return getAvailableSlotsForDay(date).filter(s => s.available).length;
}

/* ─────────────────────────────────────────
   RENDERIZAÇÃO DO CALENDÁRIO
───────────────────────────────────────── */
const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function renderCalendar() {
  const grid  = document.getElementById('calendarGrid');
  const title = document.getElementById('calMonthYear');
  if (!grid || !title) return;

  const year  = agendaState.calendarYear;
  const month = agendaState.calendarMonth;

  title.textContent = `${MONTH_NAMES[month]} ${year}`;

  const today     = new Date();
  const firstDay  = new Date(year, month, 1);
  const lastDay   = new Date(year, month + 1, 0);
  const startDow  = firstDay.getDay(); // 0=Dom

  // Limites: não deixar navegar para o passado além do mês atual
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + AGENDA_CONFIG.maxMonthsAhead + 1, 0);

  // Botões prev/next
  const prevBtn = document.getElementById('calPrev');
  const nextBtn = document.getElementById('calNext');
  if (prevBtn) prevBtn.disabled = (year === minDate.getFullYear() && month <= minDate.getMonth());
  if (nextBtn) nextBtn.disabled = (year > maxDate.getFullYear() || (year === maxDate.getFullYear() && month >= maxDate.getMonth()));

  grid.innerHTML = '';

  // Células vazias antes do primeiro dia
  for (let i = 0; i < startDow; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day other-month';
    empty.setAttribute('aria-hidden', 'true');
    grid.appendChild(empty);
  }

  // Dias do mês
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date    = new Date(year, month, day);
    const dow     = date.getDay();
    const dateStr = formatDateStr(date);

    const btn = document.createElement('button');
    btn.textContent = day;
    btn.type = 'button';
    btn.setAttribute('aria-label', formatDateBR(date));

    const isPast    = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday   = isSameDay(date, today);
    const isClosed  = !AGENDA_CONFIG.workingHours[dow];
    const available = !isPast && !isClosed ? countAvailableSlots(date) : 0;

    let cls = 'cal-day';

    if (isPast || isClosed || date > maxDate) {
      cls += ' disabled';
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    } else if (available === 0) {
      cls += ' full disabled';
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    } else if (available <= 2) {
      cls += ' limited';
    } else {
      cls += ' available';
    }

    if (isToday) cls += ' today';

    if (agendaState.dateStr === dateStr) cls += ' selected';

    btn.className = cls;

    if (!btn.disabled) {
      btn.addEventListener('click', () => {
        agendaState.date    = date;
        agendaState.dateStr = dateStr;
        agendaState.time    = null; // limpa horário se mudar data

        // Atualiza visual de seleção
        document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });
    }

    grid.appendChild(btn);
  }
}

/* ─────────────────────────────────────────
   RENDERIZAÇÃO DOS HORÁRIOS
───────────────────────────────────────── */
function renderTimeSlots() {
  const grid  = document.getElementById('timeGrid');
  const label = document.getElementById('selectedDateLabel');
  const durEl = document.getElementById('sessionDurationLabel');

  if (!grid || !agendaState.date) return;

  if (label) label.textContent = formatDateShortBR(agendaState.date) + ' (' + ['dom','seg','ter','qua','qui','sex','sáb'][agendaState.date.getDay()] + ')';
  if (durEl && agendaState.service) durEl.textContent = agendaState.service.duracao;

  const slots = getAvailableSlotsForDay(agendaState.date);
  grid.innerHTML = '';

  if (!slots.length) {
    grid.innerHTML = '<p style="color:var(--color-text-light);grid-column:1/-1;text-align:center;padding:2rem;">Nenhum horário encontrado para este dia.</p>';
    return;
  }

  slots.forEach(slot => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = slot.time;

    let cls = 'time-slot';
    if (!slot.available) {
      cls += ' busy';
      btn.disabled = true;
      btn.title = 'Horário indisponível';
      btn.setAttribute('aria-disabled', 'true');
    } else {
      cls += ' available';
      if (agendaState.time === slot.time) cls += ' selected';
      btn.addEventListener('click', () => {
        agendaState.time = slot.time;
        document.querySelectorAll('.time-slot.selected').forEach(el => el.classList.remove('selected'));
        btn.classList.add('selected');
      });
    }

    btn.className = cls;
    btn.setAttribute('aria-label', `Horário ${slot.time}${!slot.available ? ' — ocupado' : ''}`);
    grid.appendChild(btn);
  });
}

/* ─────────────────────────────────────────
   RESUMO DO AGENDAMENTO
───────────────────────────────────────── */
function renderSummaryMini() {
  const el = document.getElementById('bookingSummaryMini');
  if (!el || !agendaState.service || !agendaState.date || !agendaState.time) return;

  el.innerHTML = `
    <div class="summary-row"><span>📋 Serviço</span><strong>${agendaState.service.nome}</strong></div>
    <div class="summary-row"><span>📅 Data</span><strong>${formatDateShortBR(agendaState.date)} · ${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][agendaState.date.getDay()]}</strong></div>
    <div class="summary-row"><span>🕐 Horário</span><strong>${agendaState.time} (${agendaState.service.duracao} min)</strong></div>
    <div class="summary-row"><span>💰 Valor</span><strong>${agendaState.service.preco}</strong></div>
  `;
}

function renderSummaryFull() {
  const el = document.getElementById('bookingSummaryFull');
  if (!el) return;

  const u = agendaState.userData;
  el.innerHTML = `
    <div class="summary-row"><span>📋 Serviço</span><strong>${agendaState.service?.nome || '—'}</strong></div>
    <div class="summary-row"><span>📅 Data</span><strong>${agendaState.date ? formatDateShortBR(agendaState.date) + ' · ' + ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][agendaState.date.getDay()] : '—'}</strong></div>
    <div class="summary-row"><span>🕐 Horário</span><strong>${agendaState.time || '—'} (${agendaState.service?.duracao || 50} min)</strong></div>
    <div class="summary-row"><span>💰 Valor</span><strong>${agendaState.service?.preco || '—'}</strong></div>
    <div class="summary-row"><span>👤 Nome</span><strong>${u.nome || '—'}</strong></div>
    <div class="summary-row"><span>📧 E-mail</span><strong>${u.email || '—'}</strong></div>
    <div class="summary-row"><span>📱 WhatsApp</span><strong>${u.telefone || '—'}</strong></div>
    <div class="summary-row"><span>🖥 Modalidade</span><strong>${u.modalidade === 'online' ? 'Online (videochamada)' : 'Presencial — São Paulo/SP'}</strong></div>
  `;
}

/* ─────────────────────────────────────────
   INTEGRAÇÃO — GOOGLE CALENDAR
───────────────────────────────────────── */
function generateGoogleCalendarLink() {
  if (!agendaState.date || !agendaState.time || !agendaState.service) return '#';

  const [h, m] = agendaState.time.split(':').map(Number);
  const start  = new Date(agendaState.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + parseInt(agendaState.service.duracao));

  const fmt = (d) =>
    `${d.getFullYear()}${padZ(d.getMonth() + 1)}${padZ(d.getDate())}` +
    `T${padZ(d.getHours())}${padZ(d.getMinutes())}00`;

  const title   = encodeURIComponent(`Sessão com Rosangela Sousa — ${agendaState.service.nome}`);
  const dates   = `${fmt(start)}/${fmt(end)}`;
  const details = encodeURIComponent(
    `Tipo: ${agendaState.service.nome}\nModalidade: ${agendaState.userData.modalidade === 'online' ? 'Online (link será enviado por e-mail)' : 'Presencial — Pinheiros ou Consolação, São Paulo/SP'}\n\nPsicanalista Rosangela Sousa\nContato: rosangela@exemplo.com.br`
  );
  const location = encodeURIComponent(
    agendaState.userData.modalidade === 'online'
      ? 'Online — link enviado por e-mail'
      : 'Pinheiros / Consolação — São Paulo/SP (endereço confirmado após agendamento)'
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

/* ─────────────────────────────────────────
   INTEGRAÇÃO — OUTLOOK / ICS
───────────────────────────────────────── */
function generateICSContent() {
  if (!agendaState.date || !agendaState.time || !agendaState.service) return '';

  const [h, m] = agendaState.time.split(':').map(Number);
  const start  = new Date(agendaState.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + parseInt(agendaState.service.duracao));

  const fmtICS = (d) =>
    `${d.getFullYear()}${padZ(d.getMonth() + 1)}${padZ(d.getDate())}` +
    `T${padZ(d.getHours())}${padZ(d.getMinutes())}00`;

  const uid = `rosangela-${Date.now()}@rosangelasousa.com.br`;
  const now = fmtICS(new Date());

  const modalidade = agendaState.userData.modalidade === 'online'
    ? 'Online — link enviado por e-mail'
    : 'Presencial — Pinheiros/Consolação\\, São Paulo/SP';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Rosangela Sousa Psicanalista//Agenda v1.0//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${fmtICS(start)}`,
    `DTEND:${fmtICS(end)}`,
    `SUMMARY:Sessão com Rosangela Sousa — ${agendaState.service.nome}`,
    `DESCRIPTION:Tipo: ${agendaState.service.nome}\\nModalidade: ${modalidade}\\nValor: ${agendaState.service.preco}\\n\\nPsicanalista Rosangela Sousa\\nContato: (11) 99467-3421`,
    `LOCATION:${modalidade}`,
    'STATUS:TENTATIVE',
    'BEGIN:VALARM',
    'TRIGGER:-PT60M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: Sessão com Rosangela Sousa em 1 hora',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS() {
  const content  = generateICSContent();
  if (!content) return;

  const blob     = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = `sessao-rosangela-${agendaState.dateStr}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────
   INTEGRAÇÃO — WHATSAPP
───────────────────────────────────────── */
function generateWhatsAppMessage() {
  const u   = agendaState.userData;
  const srv = agendaState.service;
  const d   = agendaState.date ? formatDateShortBR(agendaState.date) : '—';
  const dow = agendaState.date ? ['dom','seg','ter','qua','qui','sex','sáb'][agendaState.date.getDay()] : '';

  return (
    `Olá, Rosangela! Fiz um agendamento pelo site.\n\n` +
    `📋 *Serviço:* ${srv?.nome || '—'}\n` +
    `📅 *Data:* ${d} (${dow})\n` +
    `🕐 *Horário:* ${agendaState.time || '—'}\n` +
    `🖥 *Modalidade:* ${u.modalidade === 'online' ? 'Online' : 'Presencial'}\n\n` +
    `👤 *Nome:* ${u.nome || '—'}\n` +
    `📧 *E-mail:* ${u.email || '—'}\n\n` +
    `Aguardo a confirmação. Obrigado(a)! 😊`
  );
}

/* ─────────────────────────────────────────
   NAVEGAÇÃO ENTRE ETAPAS
───────────────────────────────────────── */
function goToStep(step) {
  const current = document.getElementById(`agendaStep${agendaState.currentStep}`);
  const next    = document.getElementById(`agendaStep${step}`);
  const prevBtn = document.getElementById('agendaBtnPrev');
  const nextBtn = document.getElementById('agendaBtnNext');

  if (current) current.classList.add('hidden');
  if (next)    next.classList.remove('hidden');

  agendaState.currentStep = step;

  // Atualiza barra de progresso
  const pct = Math.min(((step - 1) / agendaState.totalSteps) * 100, 100);
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = `${pct}%`;

  // Atualiza indicadores de etapa
  document.querySelectorAll('.progress-step').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (s === step)  el.classList.add('active');
    if (s < step)    el.classList.add('completed');
  });

  // Botões nav
  if (prevBtn) prevBtn.style.display = step > 1 && step <= agendaState.totalSteps ? '' : 'none';

  // Na etapa 5 (confirmação), esconde navegação
  const nav = document.getElementById('bookingNav');
  if (nav)    nav.style.display = step > agendaState.totalSteps ? 'none' : '';

  if (nextBtn) {
    if (step === agendaState.totalSteps) {
      nextBtn.textContent = 'Confirmar Agendamento ✓';
    } else {
      nextBtn.textContent = 'Continuar →';
    }
  }

  // Scroll suave para o widget
  const widget = document.querySelector('.booking-widget');
  if (widget) {
    const offset = widget.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }

  // Ações específicas por etapa
  if (step === 2) renderCalendar();
  if (step === 3) renderTimeSlots();
  if (step === 4) renderSummaryMini();
  if (step === 5) {
    renderSummaryFull();
    setupConfirmation();
  }
}

/* ─────────────────────────────────────────
   CONFIGURAÇÃO DA TELA DE CONFIRMAÇÃO
───────────────────────────────────────── */
function setupConfirmation() {
  const gcalBtn   = document.getElementById('googleCalBtn');
  const icsBtn    = document.getElementById('outlookCalBtn');
  const waBtn     = document.getElementById('whatsappConfirmBtn');

  if (gcalBtn) gcalBtn.href = generateGoogleCalendarLink();
  if (icsBtn)  icsBtn.addEventListener('click', downloadICS, { once: true });
  if (waBtn) {
    const msg = generateWhatsAppMessage();
    waBtn.href = `https://wa.me/${AGENDA_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }
}

/* ─────────────────────────────────────────
   VALIDAÇÃO POR ETAPA
───────────────────────────────────────── */
function validateCurrentStep() {
  switch (agendaState.currentStep) {
    case 1:
      if (!agendaState.service) {
        shakeWidget('agendaStep1');
        showToast('Por favor, selecione um tipo de atendimento.');
        return false;
      }
      return true;

    case 2:
      if (!agendaState.date) {
        showToast('Por favor, selecione uma data no calendário.');
        return false;
      }
      return true;

    case 3:
      if (!agendaState.time) {
        showToast('Por favor, selecione um horário disponível.');
        return false;
      }
      return true;

    case 4:
      return validateStep4();

    default:
      return true;
  }
}

function validateStep4() {
  const nome      = document.getElementById('agendaNome');
  const email     = document.getElementById('agendaEmail');
  const telefone  = document.getElementById('agendaTelefone');
  const modalidade= document.getElementById('agendaModalidade');
  const lgpd      = document.getElementById('agendaLgpd');
  const lgpdError = document.getElementById('lgpdError');

  let valid = true;

  [nome, email, telefone, modalidade].forEach(field => {
    if (!field) return;
    const grp = field.closest('.form-group');
    const err = grp?.querySelector('.form-error');
    let ok = true;

    if (!field.value.trim()) ok = false;
    if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) ok = false;
    if (field.type === 'tel'   && field.value && field.value.replace(/\D/g, '').length < 10) ok = false;

    if (grp) grp.classList.toggle('error', !ok);
    if (!ok) valid = false;
  });

  if (lgpd && !lgpd.checked) {
    if (lgpdError) lgpdError.style.display = 'block';
    valid = false;
  } else if (lgpdError) {
    lgpdError.style.display = 'none';
  }

  if (valid) {
    agendaState.userData = {
      nome:       nome?.value.trim() || '',
      email:      email?.value.trim() || '',
      telefone:   telefone?.value.trim() || '',
      modalidade: modalidade?.value || '',
      obs:        document.getElementById('agendaObs')?.value.trim() || '',
    };
  }

  return valid;
}

/* ─────────────────────────────────────────
   UTILITÁRIOS UI
───────────────────────────────────────── */
function shakeWidget(stepId) {
  const el = document.getElementById(stepId);
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 600);
}

function showToast(message) {
  const existing = document.querySelector('.agenda-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'agenda-toast';
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ─────────────────────────────────────────
   INICIALIZAÇÃO
───────────────────────────────────────── */
function initAgenda() {
  // Só inicializa se o widget existir na página
  const widget = document.querySelector('.booking-widget');
  if (!widget) return;

  // Gera slots bloqueados de demonstração
  agendaState.blockedSlots = generateDemoBlockedSlots();

  // Define mês inicial como mês atual
  const today = new Date();
  agendaState.calendarYear  = today.getFullYear();
  agendaState.calendarMonth = today.getMonth();

  // Inicializa progresso
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = '0%';

  /* ── Seleção de serviço ── */
  document.querySelectorAll('.servico-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.servico-option').forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');

      agendaState.service = {
        id:      btn.dataset.id,
        nome:    btn.dataset.nome,
        duracao: btn.dataset.duracao,
        preco:   btn.dataset.preco,
      };
    });
  });

  /* ── Navegação do calendário ── */
  const prevCal = document.getElementById('calPrev');
  const nextCal = document.getElementById('calNext');

  if (prevCal) {
    prevCal.addEventListener('click', () => {
      agendaState.calendarMonth--;
      if (agendaState.calendarMonth < 0) {
        agendaState.calendarMonth = 11;
        agendaState.calendarYear--;
      }
      renderCalendar();
    });
  }

  if (nextCal) {
    nextCal.addEventListener('click', () => {
      agendaState.calendarMonth++;
      if (agendaState.calendarMonth > 11) {
        agendaState.calendarMonth = 0;
        agendaState.calendarYear++;
      }
      renderCalendar();
    });
  }

  /* ── Botão Continuar ── */
  const btnNext = document.getElementById('agendaBtnNext');
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (!validateCurrentStep()) return;

      const next = agendaState.currentStep + 1;
      if (next > agendaState.totalSteps) {
        // Vai para confirmação
        goToStep(5);
      } else {
        goToStep(next);
      }
    });
  }

  /* ── Botão Voltar ── */
  const btnPrev = document.getElementById('agendaBtnPrev');
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (agendaState.currentStep > 1) {
        goToStep(agendaState.currentStep - 1);
      }
    });
  }

  /* ── Máscara de telefone ── */
  const telInput = document.getElementById('agendaTelefone');
  if (telInput) {
    telInput.addEventListener('input', () => {
      let val = telInput.value.replace(/\D/g, '').substring(0, 11);
      if (val.length >= 11)      val = val.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (val.length >= 7)  val = val.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      else if (val.length >= 3)  val = val.replace(/(\d{2})(\d{0,5})/, '($1) $2');
      telInput.value = val;
    });
  }

  /* ── Limpa erro LGPD ao clicar ── */
  const lgpd = document.getElementById('agendaLgpd');
  const lgpdErr = document.getElementById('lgpdError');
  if (lgpd && lgpdErr) {
    lgpd.addEventListener('change', () => {
      if (lgpd.checked) lgpdErr.style.display = 'none';
    });
  }
}

/* ─────────────────────────────────────────
   EXECUTA AO CARREGAR
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initAgenda);
