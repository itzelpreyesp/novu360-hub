const PROSPECTOR_STORAGE_KEY = 'novu360.prospector-ia.draft.v1';
const CAPTURE_SOURCES = ['IG', 'TikTok', 'FB', 'Maps', 'Web'];
const LEAD_STATUSES = ['Nuevo', 'Contactado', 'Propuesta', 'Calificado', 'Cerrado'];

const state = {
  step: 1,
  business: {
    name: '',
    type: 'Restaurante',
    city: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    maps: '',
    web: ''
  },
  captures: [],
  analysis: {
    good: '',
    missing: '',
    opportunity: ''
  },
  message: '',
  timeline: [],
  leadStatus: 'Nuevo',
  savedLeadId: null,
  savedAt: null,
  audit: '',
  dossier: '',
  sourceLead: null
};

const els = {};

function waitForSupabase(timeoutMs = 5000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (window.supabaseClient) return resolve(window.supabaseClient);
      if (Date.now() - started > timeoutMs) {
        return reject(new Error('Supabase no está listo'));
      }
      setTimeout(tick, 50);
    };
    tick();
  });
}

function safeText(value, fallback = '') {
  const text = (value ?? '').toString().trim();
  return text || fallback;
}

function escapeHtml(value) {
  return safeText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTitle(value) {
  return safeText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function loadState() {
  try {
    const raw = localStorage.getItem(PROSPECTOR_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state.business, saved.business || {});
    state.step = saved.step || 1;
    state.analysis = Object.assign(state.analysis, saved.analysis || {});
    state.message = saved.message || '';
    state.timeline = Array.isArray(saved.timeline) ? saved.timeline : [];
    state.leadStatus = saved.leadStatus || 'Nuevo';
    state.savedLeadId = saved.savedLeadId || null;
    state.savedAt = saved.savedAt || null;
    state.audit = saved.audit || '';
    state.dossier = saved.dossier || '';
    state.sourceLead = saved.sourceLead || null;
  } catch (error) {
    console.warn('No se pudo cargar el borrador de Prospector IA:', error);
  }
}

function persistState() {
  try {
    localStorage.setItem(PROSPECTOR_STORAGE_KEY, JSON.stringify({
      step: state.step,
      business: state.business,
      analysis: state.analysis,
      message: state.message,
      timeline: state.timeline,
      leadStatus: state.leadStatus,
      savedLeadId: state.savedLeadId,
      savedAt: state.savedAt,
      audit: state.audit,
      dossier: state.dossier,
      sourceLead: state.sourceLead
    }));
  } catch (error) {
    console.warn('No se pudo persistir el borrador de Prospector IA:', error);
  }
}

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(value);
}

function slugify(value) {
  return safeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decorateShell() {
  document.body.classList.add('selection:bg-primary/30');

  document.querySelectorAll('.step-card').forEach(card => {
    card.classList.add('rounded-xl', 'border', 'border-white/5', 'bg-surface-2/95', 'p-5', 'shadow-xl', 'shadow-black/20', 'sm:p-6');
  });

  document.querySelectorAll('.step-chip').forEach((chip, index) => {
    chip.classList.add(
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'gap-1.5',
      'rounded-md',
      'border',
      'border-border-soft',
      'bg-black/70',
      'px-3',
      'py-2.5',
      'text-center',
      'text-[10px]',
      'font-bold',
      'uppercase',
      'tracking-[0.25em]',
      'text-on-surface-2',
      'transition'
    );
    chip.dataset.index = String(index + 1);
    const badge = chip.querySelector('span');
    if (badge) {
      badge.className = 'grid h-7 w-7 place-items-center rounded-full border border-border-soft bg-surface-2 text-[11px] font-black text-white transition';
    }
    const label = chip.querySelector('small');
    if (label) {
      label.className = 'text-[9px] font-bold tracking-[0.22em] text-inherit';
    }
  });

  [
    'business-name',
    'business-type',
    'business-city',
    'business-ig',
    'business-tiktok',
    'business-fb',
    'business-maps',
    'business-web',
    'capture-input',
    'followup-input',
    'lead-status'
  ].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.classList.add('font-body');
  });
}

function cacheElements() {
  els.stepLabel = document.getElementById('step-label');
  els.stepProgress = document.getElementById('step-progress');
  els.stepChips = Array.from(document.querySelectorAll('[data-step-chip]'));
  els.stepSections = [1, 2, 3, 4].map(step => document.getElementById(`step-${step}`));

  els.business = {
    name: document.getElementById('business-name'),
    type: document.getElementById('business-type'),
    city: document.getElementById('business-city'),
    instagram: document.getElementById('business-ig'),
    tiktok: document.getElementById('business-tiktok'),
    facebook: document.getElementById('business-fb'),
    maps: document.getElementById('business-maps'),
    web: document.getElementById('business-web')
  };

  els.captureInput = document.getElementById('capture-input');
  els.capturePreviews = document.getElementById('capture-previews');
  els.sidebarTitle = document.getElementById('sidebar-title');
  els.sidebarCaptures = document.getElementById('sidebar-captures');
  els.sidebarState = document.getElementById('sidebar-state');
  els.sidebarTimeline = document.getElementById('sidebar-timeline');
  els.analysisGood = document.getElementById('analysis-good');
  els.analysisMissing = document.getElementById('analysis-missing');
  els.analysisOpportunity = document.getElementById('analysis-opportunity');
  els.generatedMessage = document.getElementById('generated-message');
  els.copyMessage = document.getElementById('copy-message');
  els.saveLead = document.getElementById('save-lead');
  els.auditSuggestion = document.getElementById('audit-suggestion');
  els.dossierSummary = document.getElementById('dossier-summary');
  els.timeline = document.getElementById('timeline');
  els.followupInput = document.getElementById('followup-input');
  els.addFollowup = document.getElementById('add-followup');
  els.status = document.getElementById('lead-status');
  els.statusBadge = document.getElementById('status-badge');
}

function syncFormToState() {
  Object.entries(els.business).forEach(([key, input]) => {
    if (input) state.business[key] = input.value.trim();
  });
  if (els.status) state.leadStatus = els.status.value;
}

function syncStateToForm() {
  Object.entries(els.business).forEach(([key, input]) => {
    if (input) input.value = state.business[key] || '';
  });
  if (els.status) els.status.value = state.leadStatus || 'Nuevo';
}

function setStep(step) {
  state.step = Math.max(1, Math.min(4, step));
  const progress = ((state.step - 1) / 3) * 100;
  if (els.stepProgress) els.stepProgress.style.width = `${Math.max(25, Math.round(progress || 25))}%`;
  if (els.stepLabel) els.stepLabel.textContent = `Paso ${state.step} de 4`;

  els.stepSections.forEach((section, index) => {
    if (!section) return;
    section.classList.toggle('hidden', index + 1 !== state.step);
  });

  els.stepChips.forEach((chip, index) => {
    const active = index + 1 <= state.step;
    chip.classList.toggle('border-primary/50', active);
    chip.classList.toggle('bg-primary/10', active);
    chip.classList.toggle('text-primary', active);
    chip.classList.toggle('shadow-[0_0_0_1px_rgba(0,194,168,0.2)]', active);
    chip.querySelector('span')?.classList.toggle('bg-primary', active);
    chip.querySelector('span')?.classList.toggle('text-black', active);
  });

  renderSidebar();
  persistState();
}

function getCaptureCounts() {
  return state.captures.reduce((acc, capture) => {
    acc[capture.label] = (acc[capture.label] || 0) + 1;
    return acc;
  }, {});
}

function renderCaptures() {
  if (!els.capturePreviews) return;
  if (!state.captures.length) {
    els.capturePreviews.innerHTML = `
      <div class="col-span-full rounded-md border border-dashed border-border-soft bg-black/40 p-6 text-center text-sm text-on-surface-2">
        Las capturas aparecerán aquí con su etiqueta por red o canal.
      </div>
    `;
    return;
  }

  els.capturePreviews.innerHTML = state.captures.map(capture => `
    <div class="rounded-md border border-border-soft bg-black/70 p-3">
      <div class="relative overflow-hidden rounded-md border border-border-soft bg-surface-2">
        <img src="${capture.url}" alt="${escapeHtml(capture.label)}" class="h-32 w-full object-cover" />
      </div>
      <div class="mt-3 space-y-2">
        <input data-capture-note="${capture.id}" value="${escapeHtml(capture.note || '')}" class="w-full rounded-md border border-border-soft bg-surface-2 px-3 py-2 text-xs text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/40" placeholder="Nota rápida" />
        <label class="block text-[10px] uppercase tracking-[0.25em] text-on-surface-2">Origen</label>
        <select data-capture-label="${capture.id}" class="w-full rounded-md border border-border-soft bg-surface-2 px-3 py-2 text-xs text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary/40">
          ${CAPTURE_SOURCES.map(option => `<option ${option === capture.label ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
        <button data-remove-capture="${capture.id}" type="button" class="w-full rounded-md border border-border-soft bg-black px-3 py-2 text-xs font-semibold text-on-surface-2 transition hover:border-primary hover:text-primary">Eliminar</button>
      </div>
    </div>
  `).join('');

  els.capturePreviews.querySelectorAll('[data-capture-label]').forEach(select => {
    select.addEventListener('change', event => {
      const capture = state.captures.find(item => item.id === event.currentTarget.dataset.captureLabel);
      if (!capture) return;
      capture.label = event.currentTarget.value;
      persistState();
      renderSidebar();
    });
  });

  els.capturePreviews.querySelectorAll('[data-capture-note]').forEach(input => {
    input.addEventListener('input', event => {
      const capture = state.captures.find(item => item.id === event.currentTarget.dataset.captureNote);
      if (!capture) return;
      capture.note = event.currentTarget.value;
      persistState();
    });
  });

  els.capturePreviews.querySelectorAll('[data-remove-capture]').forEach(button => {
    button.addEventListener('click', event => {
      const id = event.currentTarget.dataset.removeCapture;
      const index = state.captures.findIndex(item => item.id === id);
      if (index >= 0) {
        URL.revokeObjectURL(state.captures[index].url);
        state.captures.splice(index, 1);
        renderCaptures();
        renderSidebar();
        persistState();
      }
    });
  });
}

function analyzeBusiness() {
  const business = state.business;
  const captures = state.captures;
  const profileLinks = ['instagram', 'tiktok', 'facebook', 'web', 'maps']
    .filter(key => business[key]);

  const strongPoints = [];
  if (business.instagram) strongPoints.push('tiene presencia activa en Instagram');
  if (business.tiktok) strongPoints.push('ya explora contenido en TikTok');
  if (business.web) strongPoints.push('cuenta con sitio web para convertir tráfico');
  if (business.maps) strongPoints.push('está visible en Google Maps');
  if (!strongPoints.length) strongPoints.push('podemos construir una presencia digital más sólida desde cero');

  const missingPoints = [];
  if (!business.instagram) missingPoints.push('Instagram');
  if (!business.tiktok) missingPoints.push('TikTok');
  if (!business.facebook) missingPoints.push('Facebook');
  if (!business.web) missingPoints.push('sitio web');
  if (!business.maps) missingPoints.push('Google Maps');
  if (captures.length < 3) missingPoints.push('más capturas visuales');

  const opportunity = `${business.type || 'el negocio'} en ${business.city || 'su ciudad'} puede mejorar respuesta y captación con un sistema de prospección que convierta intención en conversación.`;

  state.analysis.good = `El negocio ${business.name || 'analizado'} ${strongPoints.join(', ')}. Capturas revisadas: ${captures.length}.`;
  state.analysis.missing = missingPoints.length
    ? `Falta reforzar: ${missingPoints.join(', ')}.`
    : 'La presencia base está bastante completa; el siguiente nivel es optimizar el mensaje y el seguimiento.';
  state.analysis.opportunity = opportunity;

  const greeting = business.name ? `Hola ${business.name},` : 'Hola,';
  const cityLine = business.city ? `vi que operan en ${business.city}` : 'revisé su presencia digital';
  const channelLine = profileLinks.length
    ? `Noté que ya tienen presencia en ${profileLinks.map(item => item === 'web' ? 'web' : item.toUpperCase()).join(', ')}.`
    : 'No vi una presencia multicanal clara todavía.';

  state.message = `${greeting}\n\n${cityLine} y ${channelLine} Por lo que vi en tus capturas, hay una oportunidad clara para atraer más clientes con un sistema simple de contenido, seguimiento y conversión.\n\nSi te parece, te comparto una auditoría rápida con los 3 ajustes que más impacto te van a dar esta semana.`;

  const labels = captures.reduce((acc, item) => {
    acc[item.label] = (acc[item.label] || 0) + 1;
    return acc;
  }, {});

  state.audit = `Auditoría IA: ${captures.length} capturas revisadas (${Object.entries(labels).map(([label, count]) => `${label}: ${count}`).join(', ') || 'sin capturas'}). Siguiente paso recomendado: ${state.leadStatus === 'Nuevo' ? 'enviar mensaje de apertura y registrar respuesta' : 'retomar seguimiento con prueba social y una propuesta concreta'}.`;
  state.timeline = [
    {
      source: 'IA',
      direction: 'sent',
      text: 'Se generó el diagnóstico inicial y el primer mensaje personalizado.',
      when: formatDate()
    }
  ];
  state.dossier = buildDossierSummary();

  renderAnalysis();
  renderTimeline();
  renderSidebar();
  persistState();
  setStep(3);
}

function buildDossierSummary() {
  const c = state.business;
  const captures = state.captures.map(item => `${item.label}${item.note ? ` (${item.note})` : ''}`).join(', ') || 'Sin capturas';
  return [
    `Negocio: ${c.name || 'Sin nombre'}`,
    `Tipo: ${c.type || 'Sin tipo'}`,
    `Ciudad: ${c.city || 'Sin ciudad'}`,
    `Instagram: ${c.instagram || '—'}`,
    `TikTok: ${c.tiktok || '—'}`,
    `Facebook: ${c.facebook || '—'}`,
    `Maps: ${c.maps || '—'}`,
    `Web: ${c.web || '—'}`,
    `Capturas: ${captures}`,
    '',
    `Análisis IA:`,
    `- ${state.analysis.good || 'Pendiente'}`,
    `- ${state.analysis.missing || 'Pendiente'}`,
    `- ${state.analysis.opportunity || 'Pendiente'}`,
    '',
    `Mensaje inicial:`,
    state.message || 'Pendiente'
  ].join('\n');
}

function renderAnalysis() {
  if (els.analysisGood) els.analysisGood.textContent = state.analysis.good || 'Analiza para ver fortalezas.';
  if (els.analysisMissing) els.analysisMissing.textContent = state.analysis.missing || 'Analiza para ver vacíos.';
  if (els.analysisOpportunity) els.analysisOpportunity.textContent = state.analysis.opportunity || 'Analiza para ver el ángulo de venta.';
  if (els.generatedMessage) els.generatedMessage.textContent = state.message || 'El mensaje aparecerá aquí.';
  if (els.auditSuggestion) els.auditSuggestion.textContent = state.audit || 'El auditor sugerirá el siguiente paso después de guardar el expediente.';
  if (els.dossierSummary) els.dossierSummary.textContent = state.dossier || buildDossierSummary();
}

function renderTimeline() {
  if (!els.timeline) return;
  if (!state.timeline.length) {
    els.timeline.innerHTML = `
      <div class="rounded-md border border-dashed border-border-soft bg-black/50 p-4 text-sm text-on-surface-2">
        Todavía no hay seguimientos. Agrega el primer mensaje o guarda el lead.
      </div>
    `;
    return;
  }

  els.timeline.innerHTML = state.timeline.map(item => `
    <div class="rounded-md border border-border-soft bg-surface-2/90 p-3">
      <div class="flex items-center justify-between gap-3">
        <span class="text-[10px] uppercase tracking-[0.25em] ${item.direction === 'received' ? 'text-primary' : 'text-on-surface-2'}">${escapeHtml(item.source)}</span>
        <span class="text-[10px] uppercase tracking-[0.25em] text-on-surface-2">${escapeHtml(item.when)}</span>
      </div>
      <p class="mt-2 whitespace-pre-wrap text-sm leading-6 text-on-surface-2">${escapeHtml(item.text)}</p>
    </div>
  `).join('');
}

function renderSidebar() {
  if (els.sidebarTitle) els.sidebarTitle.textContent = state.business.name || 'Sin negocio aún';
  if (els.sidebarCaptures) els.sidebarCaptures.textContent = String(state.captures.length);
  if (els.sidebarState) els.sidebarState.textContent = state.leadStatus || 'Nuevo';
  if (els.sidebarTimeline) els.sidebarTimeline.textContent = String(state.timeline.length);
  if (els.statusBadge) {
    els.statusBadge.textContent = state.leadStatus || 'Nuevo';
    els.statusBadge.className = 'rounded-full border px-3 py-1 text-xs font-bold';
    const palette = {
      Nuevo: 'border-blue-400/25 bg-blue-400/10 text-blue-300',
      Contactado: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
      Propuesta: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
      Calificado: 'border-primary/25 bg-primary/10 text-primary',
      Cerrado: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
    };
    els.statusBadge.classList.add(...(palette[state.leadStatus] || palette.Nuevo).split(' '));
  }
}

function copyMessage() {
  if (!state.message) return;
  navigator.clipboard.writeText(state.message).then(() => {
    if (els.copyMessage) {
      const original = els.copyMessage.textContent;
      els.copyMessage.textContent = 'Copiado';
      setTimeout(() => {
        if (els.copyMessage) els.copyMessage.textContent = original;
      }, 1500);
    }
  });
}

async function insertLeadRow(sb, payload) {
  const leadRow = {
    nombre_negocio: payload.nombre_negocio,
    giro: payload.giro,
    ciudad: payload.ciudad,
    contacto: payload.contacto,
    telefono: payload.telefono,
    etapa: payload.etapa,
    notas: payload.notas
  };
  const { data, error } = await sb.from('leads').insert(leadRow).select('id').single();
  if (error) throw error;
  return data;
}

async function saveLead() {
  syncFormToState();
  if (!state.business.name) {
    alert('El nombre del negocio es obligatorio.');
    return;
  }

  const payload = {
    nombre_negocio: state.business.name,
    giro: state.business.type,
    ciudad: state.business.city,
    contacto: state.business.instagram || state.business.facebook || state.business.tiktok || '',
    telefono: '',
    etapa: slugify(state.leadStatus || 'Nuevo') || 'nuevo',
    notas: JSON.stringify({
      business: state.business,
      captures: state.captures.map(({ id, url, ...capture }) => capture),
      analysis: state.analysis,
      message: state.message,
      timeline: state.timeline,
      audit: state.audit,
      savedAt: new Date().toISOString()
    })
  };

  try {
    const sb = await waitForSupabase();
    const lead = await insertLeadRow(sb, payload);
    state.savedLeadId = lead?.id || null;
    state.savedAt = new Date().toISOString();
    state.timeline.unshift({
      source: 'Sistema',
      direction: 'received',
      text: `Lead guardado en pipeline${state.savedLeadId ? ` (#${state.savedLeadId})` : ''}.`,
      when: formatDate()
    });
    state.audit = `Lead guardado correctamente. Siguiente paso: enviar mensaje inicial, esperar respuesta y moverlo a ${state.leadStatus === 'Nuevo' ? 'Contactado' : state.leadStatus}.`;
    state.dossier = buildDossierSummary();
    setStep(4);
    renderAnalysis();
    renderTimeline();
    renderSidebar();
    persistState();
  } catch (error) {
    console.error('No se pudo guardar el lead en Supabase:', error);
    state.savedAt = new Date().toISOString();
    state.timeline.unshift({
      source: 'Sistema',
      direction: 'received',
      text: 'No se pudo confirmar el guardado en Supabase, pero el expediente quedó listo en el navegador.',
      when: formatDate()
    });
    state.dossier = buildDossierSummary();
    setStep(4);
    renderAnalysis();
    renderTimeline();
    renderSidebar();
    persistState();
  }
}

function addFollowup() {
  const text = state.sourceLead
    ? `${safeText(els.followupInput?.value)}`
    : safeText(els.followupInput?.value);
  if (!text) return;
  state.timeline.unshift({
    source: 'Seguimiento',
    direction: 'sent',
    text,
    when: formatDate()
  });
  if (els.followupInput) els.followupInput.value = '';
  state.dossier = buildDossierSummary();
  renderTimeline();
  renderAnalysis();
  renderSidebar();
  persistState();
}

function hydrateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const leadName = params.get('name');
  const leadStatus = params.get('status');
  const leadUser = params.get('user');
  const leadId = params.get('lead') || params.get('id');

  if (leadName) state.business.name = leadName;
  if (leadStatus && LEAD_STATUSES.includes(leadStatus)) state.leadStatus = leadStatus;
  if (leadUser) state.business.instagram = leadUser.startsWith('@') ? leadUser : `@${leadUser}`;
  if (leadId) state.sourceLead = leadId;
}

function bindEvents() {
  els.stepChips.forEach(chip => {
    chip.addEventListener('click', () => setStep(Number(chip.dataset.stepChip || chip.dataset.index || 1)));
  });

  Object.values(els.business).forEach(input => {
    input?.addEventListener('input', () => {
      syncFormToState();
      state.dossier = buildDossierSummary();
      renderSidebar();
      persistState();
    });
  });

  els.status?.addEventListener('change', event => {
    state.leadStatus = event.currentTarget.value;
    renderSidebar();
    state.dossier = buildDossierSummary();
    persistState();
  });

  els.captureInput?.addEventListener('change', event => {
    const files = Array.from(event.currentTarget.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      state.captures.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        fileName: file.name,
        label: CAPTURE_SOURCES[0],
        note: '',
        url
      });
    });
    event.currentTarget.value = '';
    renderCaptures();
    renderSidebar();
    persistState();
  });

  document.getElementById('step-1-next')?.addEventListener('click', () => {
    syncFormToState();
    if (!state.business.name) {
      alert('Escribe el nombre del negocio para continuar.');
      return;
    }
    setStep(2);
  });

  document.getElementById('step-2-back')?.addEventListener('click', () => setStep(1));
  document.getElementById('step-3-back')?.addEventListener('click', () => setStep(2));
  document.getElementById('step-4-back')?.addEventListener('click', () => setStep(3));
  document.getElementById('analyze-ai')?.addEventListener('click', analyzeBusiness);
  els.copyMessage?.addEventListener('click', copyMessage);
  els.saveLead?.addEventListener('click', saveLead);
  els.addFollowup?.addEventListener('click', addFollowup);
}

async function init() {
  loadState();
  hydrateFromUrl();
  cacheElements();
  decorateShell();
  syncStateToForm();
  bindEvents();
  renderCaptures();
  renderAnalysis();
  renderTimeline();
  renderSidebar();
  setStep(state.step || 1);
  state.dossier = buildDossierSummary();
  renderAnalysis();

  try {
    if (window.checkAuth) await window.checkAuth();
  } catch (error) {
    console.warn('checkAuth no pudo ejecutarse en Prospector IA:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  init().catch(error => {
    console.error('Prospector IA no pudo inicializarse:', error);
  });
});
