/* ============================================================
   NOVU 360 · app.js
   - Demo Mode Auth Bypass (Login → Dashboard)
   - Demo interactivity (AI responses, form confirms, card modals)
   - NO nav mapping needed: sidebar hrefs are now hardcoded in HTML
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. DEMO AUTH: Login page bypass ──────────────────────────────────
  const isLogin = window.location.pathname.endsWith('index.html') ||
                  window.location.pathname === '/' ||
                  window.location.pathname.endsWith('/');

  if (isLogin) {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        window.location.href = 'dashboard.html';
      });
    });
    document.querySelectorAll('button, a').forEach(el => {
      const t = (el.innerText || '').toLowerCase();
      if (t.includes('iniciar') || t.includes('google') || t.includes('acceder') || t.includes('entrar')) {
        el.addEventListener('click', e => {
          e.preventDefault();
          window.location.href = 'dashboard.html';
        });
      }
    });
    return; // nothing else needed on login page
  }

  // ── 2. TOAST helper ──────────────────────────────────────────────────
  function showToast(title, body) {
    let toast = document.getElementById('novu-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'novu-toast';
      toast.className = 'novu-toast';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<div class="novu-toast-title">✨ ${title}</div><div>${body}</div>`;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 4500);
  }

  // ── 3. DEMO FORMS: confirmation ──────────────────────────────────────
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Acción Guardada', 'El formulario fue procesado correctamente en modo demo. Conecta Supabase para persistencia real.');
    });
  });

  // ── 4. BOTONES IA / Acciones principales ─────────────────────────────
  const aiKeywords = ['ia', 'generar', 'auditar', 'analizar', 'crear con ia', 'consultar', 'cerebros', 'prospector', 'marketerito', 'juanjo'];
  document.querySelectorAll('button, [role="button"]').forEach(btn => {
    // Skip nav-related buttons already wired
    if (btn.closest('aside')) return;

    const txt = (btn.innerText || btn.title || '').toLowerCase();
    const isAI = aiKeywords.some(k => txt.includes(k));

    if (isAI) {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        showToast(
          'Cerebros IA · Respuesta Demo',
          'Motor de inteligencia iniciado. Esta respuesta es de ejemplo. Conecta tu agente NotebookLM o GPT para producción real.'
        );
      });
    }
  });

  // ── 5. CARDS CLICKEABLES: modal de detalle ───────────────────────────
  document.querySelectorAll('[class*="rounded-xl"], [class*="rounded-2xl"]').forEach(card => {
    // Only leaf-ish cards with meaningful content, not huge wrappers
    if (card.tagName === 'BODY' || card.tagName === 'MAIN' || card.tagName === 'ASIDE') return;
    if (card.closest('aside') || card.closest('header')) return;
    if (card.offsetWidth > 900) return;

    const txt = (card.innerText || '').trim();
    if (txt.length < 10) return;
    if (card.dataset.wired) return;

    // Only cards that contain actual content blocks (not just nav items)
    const hasContentBlock = card.querySelector('h2, h3, p, span[class*="text-4xl"]');
    if (!hasContentBlock) return;

    card.dataset.wired = '1';
    card.style.cursor = 'pointer';
    card.addEventListener('click', e => {
      // Don't fire if they clicked a button inside the card
      if (e.target.closest('button, a, input')) return;
      const title = card.querySelector('h2, h3, h4')?.innerText || 'Detalle';
      showToast(
        `📋 ${title}`,
        'Vista de detalle disponible en producción. Aquí se abrirá el modal lateral o la pantalla de desglose completo.'
      );
    });
  });

  // ── 6. Número animados ───────────────────────────────────────────────
  document.querySelectorAll('[class*="text-4xl"], [class*="text-5xl"]').forEach(el => {
    const raw = el.innerText.trim();
    if (raw.startsWith('$')) return;
    const val = parseInt(raw.replace(/\D/g, ''));
    if (isNaN(val) || val === 0 || val > 9999) return;
    const isPct = raw.includes('%');
    let cur = 0;
    const step = val / 24;
    const t = setInterval(() => {
      cur += step;
      if (cur >= val) { cur = val; clearInterval(t); }
      el.innerText = Math.floor(cur) + (isPct ? '%' : '');
    }, 40);
  });

});

/* ============================================================
   NOVU 360 · CEREBROS IA CHAT MODULE
   - Detects active role from URL or nav-active link
   - 6 Cerebros: Admin, Ventas, Ads, Community, SEO, Web
   - Demo mode with realistic typed responses
   - Ready for Gemini API integration
   ============================================================ */
(function CerebrosChat() {

  // ── Initialize Supabase client globally ──────────────────────────
  const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);


  // ── Cerebro config per role ──────────────────────────────────────────
  const CEREBROS = {
    admin: {
      name: 'Marketerito',
      role: 'Diagnóstico Estratégico',
      icon: 'psychology',
      desc: 'Analizo el estado global de la agencia y genero diagnósticos estratégicos en tiempo real.',
      welcome: '¡Hola! Soy **Marketerito**, tu cerebro de diagnóstico estratégico. ¿Qué área quieres revisar hoy?',
      chips: ['📊 Diagnóstico general', '🎯 Estrategia del mes', '⚠️ Áreas en riesgo', '💡 Oportunidades'],
      responses: [
        'Analizando el dashboard actual... Los ingresos están al 85% de la meta mensual. Te recomiendo activar la estrategia de upsell en los 3 clientes con menor engagement.',
        'Basado en los datos de esta semana: el área de SEO muestra rezago. Sugiero reasignar 2 horas de equipo al cliente Global Logistics para recuperar el ritmo.',
        'El pipeline de ventas tiene 12 leads activos. Con tu tasa de cierre actual del 28%, proyectamos 3-4 nuevos clientes este mes. ¡Buen momento para apretar seguimiento!',
        'Diagnóstico estratégico completado ✅ Fortalezas: Ads y Community. Áreas de mejora: SEO y facturación. ¿Quieres el plan de acción detallado?',
      ]
    },
    ventas: {
      name: 'Appointment Setter + Diego SRI',
      role: 'Ventas & Prospección',
      icon: 'record_voice_over',
      desc: 'Te ayudo a calificar leads, preparar guiones de venta y cerrar citas con prospectos.',
      welcome: '¡Listo para vender! Soy tu equipo de ventas IA. ¿Con qué prospecto o estrategia te ayudo hoy?',
      chips: ['📞 Preparar llamada', '✍️ Script de venta', '🎯 Calificar lead', '💬 Manejo de objeciones'],
      responses: [
        'Para ese prospecto te recomiendo el script SRI: Situación → Reto → Impacto. Empieza preguntando: "¿Cuánto tiempo llevas intentando resolver esto sin resultados concretos?"',
        'Objeción "está caro" → Responde: "Entiendo tu perspectiva. ¿Qué pasaría si te dijera que nuestros clientes recuperan la inversión en promedio en 6 semanas?"',
        'He analizado el perfil del lead: PYME con 2-5 empleados, dolor principal en visibilidad digital. Calificación: 7/10. Vale la pena agendar una demo de 20 minutos.',
        '¡Excelente presentación! Para el seguimiento: envía el resumen en las próximas 2 horas, agenda call de cierre para el jueves. Nunca dejes más de 24h sin contacto.',
      ]
    },
    ads: {
      name: 'Calculadora de Rentabilidad',
      role: 'Optimización de Ads',
      icon: 'calculate',
      desc: 'Calculo ROAS, CPA, presupuestos óptimos y te digo exactamente qué ajustar en tus campañas.',
      welcome: '¡Hola! Soy tu calculadora de rentabilidad IA. Dame los números de tus campañas y te digo qué optimizar.',
      chips: ['📈 Calcular ROAS', '💰 CPA objetivo', '🎯 Presupuesto recomendado', '🔍 Analizar campaña'],
      responses: [
        'Con un presupuesto de $500 USD y CPC promedio de $0.45, puedes generar ~1,111 clics. Con conversión al 2.5%, son ~28 leads. Si tu ticket es $800, el ROAS proyectado es 4.5x 🔥',
        'Tu CPA actual de $32 está por encima del objetivo de $20. Recomiendo: segmentar por audiencias similares a tus compradores top, pausar los creativos con CTR <1%, y aumentar presupuesto en el horario 18-22h.',
        'Análisis de campaña completado: Creativos A y B tienen rendimiento similar. El Creativo C está gastando 30% del presupuesto con 0 conversiones → pausarlo ahora y redirigir a Creativo A.',
        'Para Meta Ads con ticket de $1,200: mantén ROAS mínimo de 3x. Eso significa que cada $1 invertido debe generar $3 en ventas. Actualmente estás en 2.1x → necesitas optimizar landing o audiencia.',
      ]
    },
    community: {
      name: 'Generador de Copies',
      role: 'Community Manager IA',
      icon: 'edit_note',
      desc: 'Genero copies virales, respondo comentarios difíciles y planifico tu contenido para redes sociales.',
      welcome: '¡Creatividad al máximo! Soy tu generador de copies IA. ¿Qué tipo de contenido necesitas hoy?',
      chips: ['📱 Post para IG', '🎬 Hook para reels', '💬 Responder comentario', '📅 Planear contenido'],
      responses: [
        '🔥 Copy para Instagram:\n"La diferencia entre los negocios que crecen y los que desaparecen no es el producto... es su presencia digital. ¿Dónde está la tuya? 👇"\n\nHashtags sugeridos: #MarketingDigital #Negocios #Crecimiento',
        'Hook para Reel (primeros 3 segundos):\n"Este error le cuesta $5,000 al mes a la mayoría de restaurantes... y probablemente tú también lo estás cometiendo."',
        'Respuesta al comentario negativo:\n"Gracias por compartir tu experiencia. Entendemos tu frustración y queremos resolverlo. ¿Puedes enviarnos un DM con los detalles? Nuestro equipo te contactará en menos de 2 horas 🤝"',
        'Plan de contenido semanal:\nLunes: Valor educativo | Martes: Caso de éxito | Miércoles: Behind the scenes | Jueves: Tip rápido | Viernes: Oferta/CTA | Sábado: UGC/Testimonio | Domingo: Inspiración',
      ]
    },
    seo: {
      name: 'Respuesta de Reseñas IA',
      role: 'SEO Local & Reputación',
      icon: 'star',
      desc: 'Respondo reseñas de Google, optimizo tu perfil GMB y mejoro tu posicionamiento local.',
      welcome: '¡Hola! Soy tu especialista en reputación digital. ¿Tienes reseñas que responder o quieres optimizar tu SEO local?',
      chips: ['⭐ Responder reseña 5★', '😤 Responder reseña negativa', '📍 Optimizar GMB', '🔎 Análisis de palabras clave'],
      responses: [
        'Respuesta para reseña 5 estrellas:\n"¡Muchísimas gracias por tus palabras, [Nombre]! Es un placer trabajar contigo y ver los resultados que hemos logrado juntos. ¡Seguiremos dando lo mejor para superar tus expectativas! 🙏✨"',
        'Respuesta para reseña negativa (1★):\n"Lamentamos que tu experiencia no haya sido la esperada. Nos tomamos todos los comentarios muy en serio. ¿Podrías contactarnos directamente en [email] para entender mejor la situación y encontrar una solución? Tu satisfacción es nuestra prioridad."',
        'Optimización GMB sugerida: Actualiza horarios, agrega 5 fotos nuevas esta semana, responde las últimas 3 reseñas pendientes, y publica 2 posts en GMB sobre servicios. Esto mejorará tu ranking local en ~15 días.',
        'Palabras clave locales para tu negocio: "[servicio] + [ciudad]" es tu principal oportunidad. Volumen: 480 búsquedas/mes | Competencia: media. Optimiza tu página de inicio y ficha GMB con esta keyword.',
      ]
    },
    web: {
      name: 'Juanjo',
      role: 'Landing Pages & Web',
      icon: 'web',
      desc: 'Diseño landing pages de alta conversión, reviso tu sitio web y sugiero mejoras de UX/UI.',
      welcome: '¡Qué onda! Soy Juanjo, tu cerebro de landing pages. ¿Qué web o landing necesita amor hoy?',
      chips: ['🖥️ Revisar landing', '✍️ Copy para héroe', '📊 Tasa de conversión', '🎨 Feedback de diseño'],
      responses: [
        'He analizado tu landing page. Los 3 cambios de mayor impacto: 1) Mueve el CTA principal above the fold, 2) Agrega un contador de urgencia, 3) Reemplaza el formulario de 7 campos por uno de 3. Estimado de mejora en conversión: +35%.',
        'Copy para sección héroe:\nH1: "Más clientes. Menos esfuerzo. Resultados reales."\nSubhead: "Somos la agencia que hace crecer tu negocio digital con estrategia, datos y ejecución impecable."\nCTA: "Habla con un experto hoy →"',
        'Análisis de velocidad: Tu landing carga en 4.2 segundos (debería ser <2s). Principales problemas: imágenes sin comprimir (74% del peso) y 3 scripts bloqueantes. ¿Quieres el plan de optimización técnica?',
        'Para mejorar tu tasa de conversión del 1.8% al 4%+: Agrega testimonios con fotos reales, un video de caso de éxito de 60 segundos, y una garantía visible. El social proof aumenta conversiones hasta 3x.',
      ]
    }
  };

  // ── Detect current role from URL or active nav ──────────────────────
  function detectRole() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('ventas'))    return 'ventas';
    if (path.includes('ads'))       return 'ads';
    if (path.includes('community')) return 'community';
    if (path.includes('seo'))       return 'seo';
    if (path.includes('web'))       return 'web';
    // fallback: check nav-active link text
    const activeNav = document.querySelector('.nav-active span:last-child');
    if (activeNav) {
      const t = activeNav.innerText.toLowerCase();
      if (t.includes('ventas'))    return 'ventas';
      if (t.includes('ads'))       return 'ads';
      if (t.includes('community')) return 'community';
      if (t.includes('seo'))       return 'seo';
      if (t.includes('web'))       return 'web';
    }
    return 'admin'; // default
  }

  // ── Don't inject on login page ───────────────────────────────────────
  const isLogin = window.location.pathname.endsWith('index.html') ||
                  window.location.pathname === '/' ||
                  window.location.pathname.endsWith('/');
  if (isLogin) return;

  // ── State ──────────────────────────────────────────────────────────
  let role = detectRole();
  let cerebro = CEREBROS[role];
  let isOpen = false;
  let isTyping = false;
  let responseIndex = 0;

  // ── Build DOM ──────────────────────────────────────────────────────
  function buildUI() {
    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'cerebro-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    // FAB Button
    const fab = document.createElement('button');
    fab.id = 'cerebro-fab';
    fab.setAttribute('aria-label', 'Abrir Cerebros IA Chat');
    fab.setAttribute('title', 'Cerebros IA – Click para chatear');
    fab.innerHTML = `<span class="material-symbols-outlined cerebro-fab-icon">psychology</span>`;

    // Panel
    const panel = document.createElement('div');
    panel.id = 'cerebro-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat con Cerebro IA');
    panel.innerHTML = `
      <div id="cerebro-panel-header">
        <div class="cerebro-header-top">
          <div class="cerebro-avatar">
            <span class="material-symbols-outlined" id="cerebro-hdr-icon">${cerebro.icon}</span>
          </div>
          <div class="cerebro-title-block">
            <div class="cerebro-name" id="cerebro-hdr-name">${cerebro.name}</div>
            <div class="cerebro-role-badge" id="cerebro-hdr-role">${cerebro.role}</div>
          </div>
          <button id="cerebro-close-btn" aria-label="Cerrar chat">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <p class="cerebro-desc" id="cerebro-hdr-desc">${cerebro.desc}</p>
      </div>
      <div id="cerebro-messages" aria-live="polite" aria-label="Historial de chat"></div>
      <div id="cerebro-input-area">
        <div class="cerebro-input-row">
          <textarea
            id="cerebro-input"
            placeholder="Escríbele a ${cerebro.name}..."
            rows="1"
            aria-label="Mensaje para el cerebro IA"
          ></textarea>
          <button id="cerebro-send-btn" aria-label="Enviar mensaje">
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
        <p class="cerebro-powered">Modo Demo · <a href="#">Conectar Gemini API</a></p>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    return { fab, panel, backdrop };
  }

  const { fab, panel, backdrop } = buildUI();
  const messagesEl   = document.getElementById('cerebro-messages');
  const inputEl      = document.getElementById('cerebro-input');
  const sendBtn      = document.getElementById('cerebro-send-btn');
  const closeBtn     = document.getElementById('cerebro-close-btn');

  // ── Helpers ────────────────────────────────────────────────────────
  function getTime() {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  function renderMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function addMessage(text, type = 'ai', showChips = false) {
    const div = document.createElement('div');
    div.className = `cerebro-msg ${type === 'user' ? 'user-msg' : 'ai-msg'}`;

    const avatarIcon = type === 'user' ? 'person' : cerebro.icon;
    const avatarClass = type === 'user' ? 'user-av' : 'ai-av';

    div.innerHTML = `
      <div class="cerebro-msg-avatar ${avatarClass}">
        <span class="material-symbols-outlined" style="font-size:15px;font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24">${avatarIcon}</span>
      </div>
      <div>
        <div class="cerebro-bubble">${renderMarkdown(text)}</div>
        <div class="cerebro-msg-time">${getTime()}</div>
        ${showChips && cerebro.chips ? `
          <div class="cerebro-chips">
            ${cerebro.chips.map(c => `<button class="cerebro-chip">${c}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // Wire chips
    if (showChips) {
      div.querySelectorAll('.cerebro-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          sendMessage(chip.textContent);
        });
      });
    }

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'cerebro-typing';
    div.id = 'cerebro-typing-indicator';
    div.innerHTML = `
      <div class="cerebro-msg-avatar ai-av">
        <span class="material-symbols-outlined" style="font-size:15px;font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24">${cerebro.icon}</span>
      </div>
      <div class="cerebro-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const indicator = document.getElementById('cerebro-typing-indicator');
    if (indicator) indicator.remove();
  }

  async function sendMessage(text) {
    const msg = (text || inputEl.value).trim();
    if (!msg || isTyping) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    addMessage(msg, 'user');

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      // ── Connect to Gemini API ─────────────────────────────────────
      const systemPrompt = `Eres ${cerebro.name}, un asistente experto en ${cerebro.role}. 
      Contexto de Novu 360: Eres parte de una plataforma de gestión de agencias. 
      Instrucciones: ${cerebro.desc}. Responde de forma concisa, profesional y usa markdown para resaltar puntos clave.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [
                  { role: "user", parts: [{ text: systemPrompt }] },
                  { role: "user", parts: [{ text: msg }] }
              ]
          })
      });

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta. Revisa tu API Key.";

      removeTyping();
      addMessage(aiText, 'ai', false);
      
    } catch (error) {
      console.error('Gemini Error:', error);
      removeTyping();
      addMessage(`Error técnico: ${error.message}. Asegúrate de que tu API Key sea válida.`, 'ai');
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // ── Panel open/close ───────────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    backdrop.classList.add('visible');
    fab.classList.add('panel-open');
    fab.setAttribute('aria-expanded', 'true');
    // Welcome message on first open
    if (messagesEl.children.length === 0) {
      setTimeout(() => {
        addMessage(cerebro.welcome, 'ai', true);
      }, 300);
    }
    setTimeout(() => inputEl.focus(), 420);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    backdrop.classList.remove('visible');
    fab.classList.remove('panel-open');
    fab.setAttribute('aria-expanded', 'false');
  }

  // ── Events ─────────────────────────────────────────────────────────
  fab.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  backdrop.addEventListener('click', closePanel);
  closeBtn.addEventListener('click', closePanel);

  sendBtn.addEventListener('click', () => sendMessage());

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + 'px';
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  // ── Update cerebro when nav changes (SPA-style) ────────────────────
  document.querySelectorAll('aside nav a').forEach(link => {
    link.addEventListener('click', () => {
      // Role will re-detect on next page load
    });
  });

  // ── Keyboard shortcut: Ctrl+Shift+A → open chat ────────────────────
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      isOpen ? closePanel() : openPanel();
    }
  });

  console.log(`✅ Cerebros IA Chat initialized → Cerebro: ${cerebro.name} (${role})`);

})();

/* ============================================================
   NOVU 360 · MOBILE RESPONSIVE MODULE
   - Hamburger top bar + slide-in drawer
   - Bottom tab navigation bar
   - Table → Card data-label injection
   - Swipe-to-close gesture
   ============================================================ */
(function MobileNav() {

  // ── Skip login page ────────────────────────────────────────────────
  const isLogin = window.location.pathname.endsWith('index.html') ||
                  window.location.pathname === '/' ||
                  window.location.pathname.endsWith('/');
  if (isLogin) return;

  // ── Nav items (mirrors sidebar) ────────────────────────────────────
  const NAV_ITEMS = [
    { label: 'Dashboard',    icon: 'dashboard',     href: 'dashboard.html'       },
    { label: 'Ventas',       icon: 'trending_up',   href: 'ventas.html'          },
    { label: 'Ads',          icon: 'ads_click',     href: 'ads.html'             },
    { label: 'Community',    icon: 'forum',         href: 'community.html'       },
    { label: 'SEO',          icon: 'search',        href: 'seo.html'             },
    { label: 'Web',          icon: 'language',      href: 'web.html'             },
    { label: 'Clientes',     icon: 'group',         href: 'portal-cliente.html'  },
    { label: 'Finanzas',     icon: 'payments',      href: 'finanzas.html'        },
    { label: 'Aprobaciones', icon: 'fact_check',    href: 'aprobaciones.html'    },
    { label: 'Onboarding',   icon: 'rocket_launch', href: 'onboarding.html'      },
    { label: 'Cerebros IA',  icon: 'psychology',    href: 'cerebros.html'        },
  ];

  // Bottom bar shows only the 5 most-used sections
  const BOTTOM_ITEMS = [
    { label: 'Home',      icon: 'dashboard',    href: 'dashboard.html'      },
    { label: 'Ventas',    icon: 'trending_up',  href: 'ventas.html'         },
    { label: 'Community', icon: 'forum',        href: 'community.html'      },
    { label: 'SEO',       icon: 'search',       href: 'seo.html'            },
    { label: 'Cerebros',  icon: 'psychology',   href: 'cerebros.html'       },
  ];

  // ── Detect active page ─────────────────────────────────────────────
  function isActivePage(href) {
    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    return current === href || (href === 'dashboard.html' && current === '');
  }

  // ── Build Hamburger Top Bar ────────────────────────────────────────
  function buildTopBar() {
    const bar = document.createElement('div');
    bar.id = 'nav-hamburger';
    bar.setAttribute('aria-label', 'Barra de navegación móvil');
    bar.innerHTML = `
      <a id="nav-hamburger-logo" href="dashboard.html">
        Novu <span>360</span>
      </a>
      <button id="nav-menu-btn" aria-label="Abrir menú" aria-expanded="false">
        <span class="material-symbols-outlined">menu</span>
      </button>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
    return bar;
  }

  // ── Build Slide Drawer ─────────────────────────────────────────────
  function buildDrawer() {
    const backdrop = document.createElement('div');
    backdrop.id = 'nav-drawer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    const drawer = document.createElement('div');
    drawer.id = 'nav-drawer';
    drawer.setAttribute('role', 'navigation');
    drawer.setAttribute('aria-label', 'Menú principal');

    const navLinks = NAV_ITEMS.map(item => {
      const active = isActivePage(item.href);
      return `
        <a href="${item.href}" ${active ? 'class="nav-active"' : ''}>
          <span class="material-symbols-outlined">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    drawer.innerHTML = `
      <div id="nav-drawer-header">
        <div id="nav-drawer-title">Novu 360</div>
        <div id="nav-drawer-sub">Inteligencia de Agencia</div>
      </div>
      <nav>${navLinks}</nav>
      <div style="margin-top:auto;padding:16px 20px;border-top:1px solid rgba(255,255,255,0.05);">
        <a href="#" style="display:flex;align-items:center;gap:10px;color:#525252;text-decoration:none;font-size:0.8rem;padding:10px 0;">
          <span class="material-symbols-outlined" style="font-size:18px">help</span>
          Soporte
        </a>
        <a href="#" style="display:flex;align-items:center;gap:10px;color:#525252;text-decoration:none;font-size:0.8rem;padding:10px 0;">
          <span class="material-symbols-outlined" style="font-size:18px">person</span>
          Mi Cuenta
        </a>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    return { backdrop, drawer };
  }

  // ── Build Bottom Nav Bar ───────────────────────────────────────────
  function buildBottomNav() {
    const nav = document.createElement('div');
    nav.id = 'mobile-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Navegación rápida');

    nav.innerHTML = BOTTOM_ITEMS.map(item => {
      const active = isActivePage(item.href);
      return `
        <a href="${item.href}" class="mobile-nav-item ${active ? 'active' : ''}" aria-label="${item.label}">
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' ${active ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' 24">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    document.body.appendChild(nav);
    return nav;
  }

  // ── Drawer open/close logic ────────────────────────────────────────
  function openDrawer(drawer, backdrop, menuBtn) {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer(drawer, backdrop, menuBtn) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    document.body.style.overflow = '';
  }

  // ── Table → Cards: inject data-label from headers ─────────────────
  function injectTableLabels() {
    document.querySelectorAll('table').forEach(table => {
      const headers = [...table.querySelectorAll('thead th')].map(th => th.innerText.trim());
      if (!headers.length) return;
      table.querySelectorAll('tbody tr').forEach(row => {
        [...row.querySelectorAll('td')].forEach((td, i) => {
          if (!td.dataset.label && headers[i]) {
            td.dataset.label = headers[i];
          }
        });
      });
    });
  }

  // ── Swipe to close drawer ──────────────────────────────────────────
  function addSwipeToClose(drawer, backdrop, menuBtn) {
    let startX = null;
    drawer.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });
    drawer.addEventListener('touchmove', e => {
      if (startX === null) return;
      const dx = e.touches[0].clientX - startX;
      if (dx < -30) { // swipe left
        closeDrawer(drawer, backdrop, menuBtn);
        startX = null;
      }
    }, { passive: true });
  }

  // ── Init ───────────────────────────────────────────────────────────
  const topBar = buildTopBar();
  const { backdrop, drawer } = buildDrawer();
  buildBottomNav();
  injectTableLabels();

  const menuBtn = document.getElementById('nav-menu-btn');
  addSwipeToClose(drawer, backdrop, menuBtn);

  // Toggle on hamburger click
  menuBtn.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('open');
    isOpen ? closeDrawer(drawer, backdrop, menuBtn) : openDrawer(drawer, backdrop, menuBtn);
  });

  // Close on backdrop click
  backdrop.addEventListener('click', () => closeDrawer(drawer, backdrop, menuBtn));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer(drawer, backdrop, menuBtn);
    }
  });

  // Close drawer when a link inside it is clicked (navigation)
  drawer.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer(drawer, backdrop, menuBtn);
    });
  });

  console.log('✅ Mobile navigation module initialized');

})();


