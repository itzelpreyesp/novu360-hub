(function () {
  const state = {
    userId: null,
    userName: 'Usuario',
    userRole: 'Cuenta',
    schema: {},
    clients: [],
    leads: [],
    tasks: [],
    approvals: [],
    payments: [],
    notifications: [],
    metrics: []
  };

  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const $ = (id) => document.getElementById(id);
  const text = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const show = (id, visible) => { const el = $(id); if (el) el.classList.toggle('hidden', !visible); };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const normalize = (value) => String(value ?? '').trim();
  const initials = (name) => normalize(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'N';
  const avatarSvg = (name) => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#00C2A8"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient></defs><rect width="96" height="96" rx="48" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#000" font-family="Arial, sans-serif" font-size="34" font-weight="700">' + initials(name) + '</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  };
  const toDate = (value) => { if (!value) return null; const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; };
  const formatDate = (value) => { const d = toDate(value); return d ? new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(d) : 'Sin fecha'; };

  function getValue(row, fields) {
    for (const field of fields) {
      if (row && row[field] !== undefined && row[field] !== null && row[field] !== '') return row[field];
    }
    return null;
  }

  function detectSchema(rows, fallback = 'v2') {
    const row = rows && rows[0];
    if (!row) return fallback;
    const keys = Object.keys(row);
    if (keys.includes('nombre_negocio') || keys.includes('estado') || keys.includes('vendedor_id') || keys.includes('account_id')) return 'v2';
    if (keys.includes('nombre') || keys.includes('status') || keys.includes('assigned_to')) return 'v1';
    return fallback;
  }

  async function waitForSupabase() {
    for (let i = 0; i < 40; i += 1) {
      if (window.supabaseClient) return window.supabaseClient;
      await delay(100);
    }
    throw new Error('Supabase no esta listo');
  }

  async function loadTable(sb, table) {
    const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false });
    if (error) throw error;
    state.schema[table] = detectSchema(data || [], table === 'clientes' ? 'v2' : 'v2');
    return data || [];
  }

  const isActiveClient = (row) => {
    const status = normalize(getValue(row, ['estado', 'status'])).toLowerCase();
    return !status || ['active', 'activo', 'activa'].includes(status);
  };

  const isOpenLead = (row) => {
    const status = normalize(getValue(row, ['estado', 'status'])).toLowerCase();
    return !['cerrado', 'perdido', 'closed', 'won'].includes(status);
  };

  const isTaskOpen = (row) => {
    const status = normalize(getValue(row, ['estado', 'status'])).toLowerCase();
    return !['done', 'completed', 'completado', 'completada', 'aprobado', 'rechazado'].includes(status);
  };

  const isOverdueTask = (row) => {
    const d = toDate(getValue(row, ['fecha_limite', 'due_date']));
    return Boolean(d && d < new Date() && isTaskOpen(row));
  };

  async function loadProfile(sb) {
    const { data: sessionData } = await sb.auth.getSession();
    const session = sessionData?.session;
    if (!session) return null;
    state.userId = session.user.id;

    try {
      const { data } = await sb.from('usuarios').select('*').eq('id', state.userId).maybeSingle();
      if (data) return data;
    } catch (e) {}

    try {
      const { data } = await sb.from('usuarios').select('*').eq('email', session.user.email).maybeSingle();
      if (data) return data;
    } catch (e) {}

    try {
      const { data: roles } = await sb.from('usuario_roles').select('*').limit(20);
      const roleRow = (roles || []).find((row) => row.usuario_id === state.userId || row.user_id === state.userId);
      return { nombre: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario', rol: roleRow?.rol || 'Cuenta', avatar_url: session.user.user_metadata?.avatar_url || '' };
    } catch (e) {
      return { nombre: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuario', rol: 'Cuenta', avatar_url: session.user.user_metadata?.avatar_url || '' };
    }
  }

  function renderProfile(profile) {
    const name = getValue(profile, ['nombre', 'full_name']) || 'Usuario';
    const role = normalize(getValue(profile, ['rol', 'role'])) || 'Cuenta';
    state.userName = name;
    state.userRole = role;
    text('dashboard-user-name', name);
    text('dashboard-user-role', role);
    const avatar = $('dashboard-user-avatar');
    if (avatar) avatar.src = profile?.avatar_url ? profile.avatar_url : avatarSvg(name);
  }

  const clientName = (row) => getValue(row, ['nombre_negocio', 'nombre', 'full_name']) || 'Cliente sin nombre';
  const clientSubtitle = (row) => normalize(row.giro || row.empresa || row.email || row.email_contacto || row.telefono || 'Sin detalles');

  function progressForClient(client, tasks) {
    const related = tasks.filter((task) => task.cliente_id === client.id);
    if (!related.length) return isActiveClient(client) ? 100 : 0;
    const done = related.filter((task) => !isTaskOpen(task)).length;
    return Math.round((done / related.length) * 100);
  }

  const metricSummary = (metrics, area) => metrics.find((row) => normalize(row.area || row.modulo || '').toLowerCase() === area);

  function renderClients(clients, tasks) {
    const container = $('clients-list');
    if (!container) return;
    const activeClients = clients.filter(isActiveClient);
    if (!activeClients.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = activeClients.slice(0, 6).map((client) => {
      const progress = progressForClient(client, tasks);
      const label = progress >= 90 ? 'Listo' : progress >= 60 ? 'En avance' : progress >= 30 ? 'En curso' : 'En riesgo';
      const icon = normalize(client.giro || client.empresa || client.area || '').toLowerCase().includes('web') ? 'web' : normalize(client.giro || client.empresa || '').toLowerCase().includes('ads') ? 'ads_click' : normalize(client.giro || client.empresa || '').toLowerCase().includes('seo') ? 'search' : 'location_on';
      const teamName = client.account_id || client.assigned_to || client.responsable_id || state.userName;
      const due = client.fecha_inicio || client.created_at || client.updated_at;
      const relatedCount = tasks.filter((task) => task.cliente_id === client.id).length;
      return `
        <div class="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-white/5 flex items-center gap-6 group hover:border-primary/40 transition-all">
          <div class="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center"><span class="material-symbols-outlined text-primary text-3xl">${esc(icon)}</span></div>
          <div class="flex-1 grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-3"><h3 class="font-bold text-on-surface">${esc(clientName(client))}</h3><p class="text-xs text-neutral-500 mt-1">${esc(clientSubtitle(client))}</p></div>
            <div class="col-span-12 md:col-span-3"><p class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Progreso</p><div class="flex items-center gap-2 mt-1"><div class="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden"><div class="bg-primary h-full" style="width:${progress}%"></div></div><span class="text-xs font-bold" style="color:${progress >= 70 ? '#00C2A8' : progress >= 40 ? '#ffb6a0' : '#ffb4ab'}">${label}</span></div></div>
            <div class="col-span-6 md:col-span-2"><p class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Entrega</p><p class="text-xs font-medium mt-1">${esc(formatDate(due))}</p></div>
            <div class="col-span-6 md:col-span-2"><p class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Equipo</p><div class="flex -space-x-2 mt-1"><div class="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center border-2 border-black">${esc(initials(teamName))}</div>${relatedCount > 1 ? '<div class="w-6 h-6 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center border-2 border-black">+' + (relatedCount - 1) + '</div>' : ''}</div></div>
            <div class="col-span-12 md:col-span-2 flex justify-end items-center"><button class="p-2 hover:bg-white/5 rounded-lg transition-colors" type="button" data-open-client="${esc(client.id || '')}"><span class="material-symbols-outlined text-neutral-500">more_vert</span></button></div>
          </div>
        </div>`;
    }).join('');
  }

  function renderCriticalFeed({ leads, approvals, tasks, notifications, payments }) {
    const items = [];
    const overdueTask = tasks.find(isOverdueTask);
    if (overdueTask) items.push({ tone: 'error', title: getValue(overdueTask, ['descripcion', 'title']) || 'Tarea vencida', meta: formatDate(getValue(overdueTask, ['fecha_limite', 'due_date'])), body: normalize(overdueTask.area || overdueTask.description || overdueTask.descripcion || 'Requiere seguimiento inmediato.') });
    const pendingApproval = approvals.find((row) => !['aprobado', 'approved'].includes(normalize(getValue(row, ['estado', 'status'])).toLowerCase()));
    if (pendingApproval) items.push({ tone: 'yellow', title: getValue(pendingApproval, ['tipo_entregable', 'titulo']) || 'Aprobacion pendiente', meta: formatDate(pendingApproval.created_at), body: normalize(pendingApproval.notas_rechazo || pendingApproval.descripcion || 'Esperando feedback del cliente.') });
    const openLead = leads.find(isOpenLead);
    if (openLead) items.push({ tone: 'primary', title: getValue(openLead, ['nombre_negocio', 'nombre']) || 'Lead activo', meta: formatDate(openLead.created_at), body: normalize(openLead.notas || openLead.instagram || openLead.fuente || 'Sigue en seguimiento.') });
    const pendingPayment = payments.find((row) => !['pagado', 'paid'].includes(normalize(getValue(row, ['estado', 'status'])).toLowerCase()));
    if (pendingPayment) items.push({ tone: 'error', title: `Cobro ${money.format(Number(pendingPayment.monto || 0))}`, meta: formatDate(pendingPayment.created_at || pendingPayment.fecha_pago || pendingPayment.due_date), body: normalize(pendingPayment.estado || pendingPayment.status || 'Pendiente de cobro.') });
    const unreadNotification = notifications.find((row) => !Boolean(row.leida ?? row.is_read));
    if (unreadNotification) items.push({ tone: 'primary', title: getValue(unreadNotification, ['titulo', 'mensaje']) || 'Notificacion', meta: formatDate(unreadNotification.created_at), body: normalize(unreadNotification.mensaje || unreadNotification.contenido || 'Nueva alerta del sistema.') });
    const container = $('critical-feed');
    if (!container) return;
    if (!items.length) { container.innerHTML = '<div class="bg-black/30 p-4 rounded-lg border border-white/5 text-sm text-neutral-400">No hay alertas criticas por ahora.</div>'; return; }
    container.innerHTML = items.slice(0, 4).map((item) => `<div class="bg-black/30 p-4 rounded-lg border border-white/5"><div class="flex items-start gap-3"><div class="w-2 h-2 mt-1.5 rounded-full ${item.tone === 'error' ? 'animate-pulse' : ''}" style="background-color:${item.tone === 'yellow' ? '#facc15' : item.tone === 'primary' ? '#00C2A8' : '#ffb4ab'}"></div><div class="flex-1"><div class="flex justify-between items-start gap-3"><p class="text-sm font-bold text-white">${esc(item.title)}</p><span class="text-[9px] font-medium text-neutral-500">${esc(item.meta)}</span></div><p class="text-xs text-neutral-400 mt-1">${esc(item.body)}</p></div></div></div>`).join('');
  }

  function renderHealth({ clients, leads, tasks, approvals, payments, metrics }) {
    const activeClients = clients.filter(isActiveClient).length;
    const openLeads = leads.filter(isOpenLead).length;
    const overdueTasks = tasks.filter(isOverdueTask).length;
    const paidPayments = payments.filter((row) => ['pagado', 'paid'].includes(normalize(getValue(row, ['estado', 'status'])).toLowerCase()));
    const revenue = paidPayments.reduce((sum, row) => sum + Number(row.monto || 0), 0);
    const pendingApprovals = approvals.filter((row) => !['aprobado', 'approved'].includes(normalize(getValue(row, ['estado', 'status'])).toLowerCase())).length;
    const adsMetric = metricSummary(metrics, 'ads');
    const seoMetric = metricSummary(metrics, 'seo');
    const webMetric = metricSummary(metrics, 'web');
    text('metric-active-clients', String(activeClients));
    text('metric-active-clients-trend', activeClients ? 'Activos' : 'Sin actividad');
    text('metric-active-clients-note', `Total registrado: ${clients.length}`);
    text('metric-month-revenue', revenue ? money.format(revenue) : '--');
    text('metric-month-revenue-trend', revenue ? 'Cobranza real' : 'Sin cobros');
    text('metric-month-revenue-note', revenue ? 'Pagos marcados como pagados' : 'Todavia no hay pagos cobrados');
    text('metric-pipeline-leads', String(openLeads));
    text('metric-pipeline-leads-trend', openLeads ? 'En seguimiento' : 'Sin pipeline');
    text('metric-pipeline-leads-note', 'Leads abiertos en la base de datos');
    text('metric-overdue-tasks', String(overdueTasks));
    text('metric-overdue-tasks-trend', overdueTasks ? 'Requieren atencion' : 'Sin atrasos');
    text('metric-overdue-tasks-note', overdueTasks ? 'Tareas con fecha limite vencida' : 'Ninguna tarea vencida detectada');
    text('health-ventas', `${openLeads} leads abiertos, ${activeClients} clientes activos`);
    text('health-ads', adsMetric ? `Metricas registradas${adsMetric.metric_name ? `: ${adsMetric.metric_name}` : ''}` : `Sin metricas de ads, ${paidPayments.length} pagos cobrados`);
    text('health-community', `${pendingApprovals} pendientes operativos`);
    text('health-seo', seoMetric ? `Metricas SEO registradas${seoMetric.metric_name ? `: ${seoMetric.metric_name}` : ''}` : 'Sin metricas de SEO');
    text('health-web', webMetric ? `Actualizado ${formatDate(webMetric.created_at || webMetric.recorded_at)}` : 'Sin metricas web');
  }

  function renderNotifications(notifications) {
    const unread = notifications.filter((row) => !Boolean(row.leida ?? row.is_read));
    const badge = $('dashboard-notifications-badge');
    if (badge) {
      if (unread.length) { badge.textContent = String(unread.length); badge.classList.remove('hidden'); badge.classList.add('flex'); }
      else { badge.classList.add('hidden'); badge.classList.remove('flex'); }
    }
    const list = $('dashboard-notifications-list');
    if (!list) return;
    if (!notifications.length) { list.innerHTML = '<div class="px-4 py-4 text-sm text-neutral-400">Sin notificaciones.</div>'; return; }
    list.innerHTML = notifications.slice(0, 5).map((note) => `<button type="button" class="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0" data-notification-id="${esc(note.id || '')}"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-white">${esc(getValue(note, ['titulo', 'mensaje']) || 'Notificacion')}</p><span class="text-[10px] text-neutral-500">${esc(formatDate(note.created_at))}</span></div><p class="text-xs text-neutral-400 mt-1">${esc(note.mensaje || note.contenido || 'Sin detalles')}</p></button>`).join('');
  }
  async function insertWithFallback(sb, table, primaryPayload, fallbackPayload) {
    let result = await sb.from(table).insert([primaryPayload]);
    if (result.error && fallbackPayload) result = await sb.from(table).insert([fallbackPayload]);
    if (result.error) throw result.error;
  }

  async function createClient(sb) {
    const name = prompt('Nombre del nuevo cliente o proyecto');
    if (!name) return;
    const detail = prompt('Giro o descripcion breve', '') || '';
    const schema = state.schema.clientes || 'v2';
    const primary = schema === 'v1'
      ? { nombre: name.trim(), status: 'active', assigned_to: state.userId || null, created_at: new Date().toISOString() }
      : { nombre_negocio: name.trim(), giro: detail || null, estado: 'activo', account_id: state.userId || null, fecha_inicio: new Date().toISOString().slice(0, 10), created_at: new Date().toISOString() };
    const fallback = schema === 'v1'
      ? { nombre_negocio: name.trim(), giro: detail || null, estado: 'activo', account_id: state.userId || null, fecha_inicio: new Date().toISOString().slice(0, 10), created_at: new Date().toISOString() }
      : { nombre: name.trim(), status: 'active', assigned_to: state.userId || null, created_at: new Date().toISOString() };
    await insertWithFallback(sb, 'clientes', primary, fallback);
    alert('Cliente creado correctamente.');
  }

  async function createLead(sb) {
    const name = prompt('Nombre del lead o negocio');
    if (!name) return;
    const detail = prompt('Instagram, empresa o nota breve', '') || '';
    const schema = state.schema.leads || 'v2';
    const primary = schema === 'v1'
      ? { nombre: name.trim(), empresa: detail || null, status: 'nuevo', assigned_to: state.userId || null, created_at: new Date().toISOString() }
      : { nombre_negocio: name.trim(), instagram: detail || null, estado: 'nuevo', vendedor_id: state.userId || null, created_at: new Date().toISOString() };
    const fallback = schema === 'v1'
      ? { nombre_negocio: name.trim(), instagram: detail || null, estado: 'nuevo', vendedor_id: state.userId || null, created_at: new Date().toISOString() }
      : { nombre: name.trim(), empresa: detail || null, status: 'nuevo', assigned_to: state.userId || null, created_at: new Date().toISOString() };
    await insertWithFallback(sb, 'leads', primary, fallback);
    alert('Lead creado correctamente.');
  }

  async function createTask(sb) {
    const description = prompt('Descripcion de la tarea');
    if (!description) return;
    const due = prompt('Fecha limite (YYYY-MM-DD)', '') || '';
    const schema = state.schema.tareas || 'v2';
    const primary = schema === 'v1'
      ? { title: description.trim(), description: description.trim(), status: 'todo', prioridad: 'media', due_date: due ? new Date(due).toISOString() : null, assigned_to: state.userId || null, created_at: new Date().toISOString() }
      : { descripcion: description.trim(), area: 'general', estado: 'pendiente', responsable_id: state.userId || null, fecha_limite: due || null, created_at: new Date().toISOString() };
    const fallback = schema === 'v1'
      ? { descripcion: description.trim(), area: 'general', estado: 'pendiente', responsable_id: state.userId || null, fecha_limite: due || null, created_at: new Date().toISOString() }
      : { title: description.trim(), description: description.trim(), status: 'todo', prioridad: 'media', due_date: due ? new Date(due).toISOString() : null, assigned_to: state.userId || null, created_at: new Date().toISOString() };
    await insertWithFallback(sb, 'tareas', primary, fallback);
    alert('Tarea creada correctamente.');
  }

  async function markAllNotificationsRead(sb) {
    const unread = state.notifications.filter((row) => !Boolean(row.leida ?? row.is_read)).map((row) => row.id);
    if (!unread.length) return;
    const column = (state.schema.notificaciones || 'v2') === 'v1' ? 'is_read' : 'leida';
    const { error } = await sb.from('notificaciones').update({ [column]: true }).in('id', unread);
    if (error) throw error;
  }

  function ensureNotificationsPanel() {
    if ($('dashboard-notifications-panel')) return;
    const button = $('dashboard-notifications-btn');
    if (!button || !button.parentElement) return;
    const panel = document.createElement('div');
    panel.id = 'dashboard-notifications-panel';
    panel.className = 'hidden absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-surface-container-low shadow-2xl overflow-hidden z-50';
    panel.innerHTML = `
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <p class="text-sm font-bold text-white">Notificaciones</p>
        <button id="dashboard-notifications-markread" class="text-[10px] font-bold uppercase tracking-widest text-primary" type="button">Marcar leidas</button>
      </div>
      <div id="dashboard-notifications-list" class="max-h-80 overflow-y-auto"></div>
    `;
    button.parentElement.appendChild(panel);
  }

  function toggleNotifications(force) {
    const panel = $('dashboard-notifications-panel');
    const button = $('dashboard-notifications-btn');
    if (!panel || !button) return;
    const visible = typeof force === 'boolean' ? force : panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !visible);
    button.setAttribute('aria-expanded', visible ? 'true' : 'false');
  }

  function attachCardActions() {
    document.querySelectorAll('[data-open-client]').forEach((button) => {
      button.addEventListener('click', () => {
        const clientId = button.getAttribute('data-open-client');
        window.location.href = clientId ? `portal-cliente.html?cliente=${encodeURIComponent(clientId)}` : 'portal-cliente.html';
      });
    });
    document.querySelectorAll('[data-notification-id]').forEach((button) => {
      button.addEventListener('click', async () => {
        const sb = await waitForSupabase();
        const id = button.getAttribute('data-notification-id');
        if (!id) return;
        try {
          const column = (state.schema.notificaciones || 'v2') === 'v1' ? 'is_read' : 'leida';
          await sb.from('notificaciones').update({ [column]: true }).eq('id', id);
          await refreshData();
        } catch (error) {
          alert(error.message || 'No se pudo actualizar la notificacion.');
        }
      });
    });
  }

  async function refreshData() {
    const sb = await waitForSupabase();
    const profile = await loadProfile(sb);
    const [clients, leads, tasks, approvals, payments, notifications, metrics] = await Promise.all([
      loadTable(sb, 'clientes').catch(() => []),
      loadTable(sb, 'leads').catch(() => []),
      loadTable(sb, 'tareas').catch(() => []),
      loadTable(sb, 'aprobaciones').catch(() => []),
      loadTable(sb, 'pagos').catch(() => []),
      loadTable(sb, 'notificaciones').catch(() => []),
      loadTable(sb, 'metricas').catch(() => [])
    ]);

    state.clients = clients;
    state.leads = leads;
    state.tasks = tasks;
    state.approvals = approvals;
    state.payments = payments;
    state.notifications = notifications;
    state.metrics = metrics;

    renderProfile(profile || { nombre: state.userName, rol: state.userRole, avatar_url: '' });
    renderClients(clients, tasks);
    renderCriticalFeed({ leads, approvals, tasks, notifications, payments });
    renderHealth({ clients, leads, tasks, approvals, payments, metrics });
    renderNotifications(notifications);
    attachCardActions();
  }

  function attachEvents() {
    $('dashboard-new-project')?.addEventListener('click', async () => {
      try {
        const sb = await waitForSupabase();
        await createClient(sb);
        await refreshData();
      } catch (error) {
        alert(error.message || 'No se pudo crear el proyecto.');
      }
    });

    $('quick-new-lead')?.addEventListener('click', async () => {
      try {
        const sb = await waitForSupabase();
        await createLead(sb);
        await refreshData();
      } catch (error) {
        alert(error.message || 'No se pudo crear el lead.');
      }
    });

    $('quick-new-task')?.addEventListener('click', async () => {
      try {
        const sb = await waitForSupabase();
        await createTask(sb);
        await refreshData();
      } catch (error) {
        alert(error.message || 'No se pudo crear la tarea.');
      }
    });

    $('quick-approvals')?.addEventListener('click', () => { window.location.href = 'aprobaciones.html'; });
    $('quick-cerebros')?.addEventListener('click', () => { window.location.href = 'cerebros.html'; });
    $('dashboard-view-all-clients')?.addEventListener('click', () => { window.location.href = 'portal-cliente.html'; });
    $('dashboard-notifications-btn')?.addEventListener('click', () => toggleNotifications());

    const markRead = $('dashboard-notifications-markread');
    if (markRead && !markRead.dataset.bound) {
      markRead.dataset.bound = '1';
      markRead.addEventListener('click', async () => {
        try {
          const sb = await waitForSupabase();
          await markAllNotificationsRead(sb);
          await refreshData();
          toggleNotifications(false);
        } catch (error) {
          alert(error.message || 'No se pudieron marcar como leidas.');
        }
      });
    }

    $('dashboard-search')?.addEventListener('input', () => {
      const query = normalize($('dashboard-search').value).toLowerCase();
      document.querySelectorAll('#clients-list > div').forEach((card) => {
        const match = card.textContent.toLowerCase().includes(query);
        card.classList.toggle('hidden', Boolean(query) && !match);
      });
    });

    document.addEventListener('click', (event) => {
      const panel = $('dashboard-notifications-panel');
      const button = $('dashboard-notifications-btn');
      if (!panel || !button) return;
      if (!panel.contains(event.target) && !button.contains(event.target)) toggleNotifications(false);
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    ensureNotificationsPanel();
    attachEvents();
    try {
      await refreshData();
      attachEvents();
    } catch (error) {
      console.error('Dashboard load error:', error);
      text('metric-active-clients-note', 'No se pudo cargar Supabase');
      text('metric-month-revenue-note', 'Error al consultar pagos');
      text('metric-pipeline-leads-note', 'Error al consultar leads');
      text('metric-overdue-tasks-note', 'Error al consultar tareas');
      const feed = $('critical-feed');
      if (feed) feed.innerHTML = '<div class="bg-black/30 p-4 rounded-lg border border-white/5 text-sm text-error">No se pudieron cargar los datos reales desde Supabase.</div>';
    }
  });
})();
