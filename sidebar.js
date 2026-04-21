/**
 * sidebar.js — Novu 360 Hub
 * Inyecta el sidebar de navegación en cualquier página.
 * Uso: <script src="sidebar.js"></script>
 * El sidebar detecta automáticamente la página activa por la URL.
 */

(function() {
  const NAV_ITEMS = [
    { href: 'dashboard.html',        icon: 'dashboard',       label: 'Dashboard' },
    { href: 'clientes.html',         icon: 'group',           label: 'Clientes' },
    { href: 'ventas.html',           icon: 'trending_up',     label: 'Ventas' },
    { href: 'prospector-ia.html',    icon: 'travel_explore',  label: 'Prospector IA', sub: true },
    { href: 'ads.html',              icon: 'ads_click',       label: 'Ads / Meta' },
    { href: 'community.html',        icon: 'forum',           label: 'Community' },
    { href: 'seo.html',              icon: 'search',          label: 'SEO' },
    { href: 'web.html',              icon: 'language',        label: 'Web' },
    { href: 'finanzas.html',         icon: 'payments',        label: 'Finanzas' },
    { href: 'cerebros.html',         icon: 'psychology',      label: 'Cerebros IA' },
    { href: 'aprobaciones.html',     icon: 'fact_check',      label: 'Aprobaciones' },
    { href: 'onboarding.html',       icon: 'rocket_launch',   label: 'Capacitación' },
    { href: 'agencia.html',          icon: 'bar_chart',       label: 'Agencia', divider: true },
    { href: 'empleados.html',        icon: 'badge',           label: 'Equipo' },
  ];

  function getCurrentPage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'dashboard.html';
    return file;
  }

  function isActive(href) {
    const current = getCurrentPage();
    return current === href || current === href.replace('.html', '');
  }

  function buildSidebar() {
    const current = getCurrentPage();

    const navHTML = NAV_ITEMS.map(item => {
      const active = isActive(item.href);
      const divider = item.divider ? '<div class="border-t border-white/5 my-2"></div>' : '';
      const indent = item.sub ? 'pl-8' : '';
      return `${divider}<a href="${item.href}"
        class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${indent}
               ${active
                 ? 'bg-primary/10 text-primary'
                 : 'text-white/60 hover:bg-white/5 hover:text-white'
               }">
        <span class="material-symbols-outlined text-[18px]">${item.icon}</span>
        ${item.label}
      </a>`;
    }).join('');

    const sidebar = document.createElement('aside');
    sidebar.id = 'novu-sidebar';
    sidebar.className = 'hidden lg:flex lg:flex-col w-64 bg-[#080808] border-r border-white/5 px-3 py-5 fixed top-0 left-0 h-full z-40 overflow-y-auto';
    sidebar.innerHTML = `
      <a href="dashboard.html" class="flex items-center gap-2 mb-6 px-1">
        <span class="font-headline text-xl font-extrabold text-primary tracking-tight">Novu</span>
        <span class="font-headline text-xl font-extrabold text-white/30 tracking-tight">360</span>
      </a>
      <nav class="flex flex-col gap-0.5">
        ${navHTML}
      </nav>
      <div class="mt-auto pt-4 border-t border-white/5">
        <button id="sidebar-logout" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all w-full">
          <span class="material-symbols-outlined text-[18px]">logout</span>
          Cerrar sesión
        </button>
      </div>
    `;

    // Agregar al body antes del primer elemento
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Logout
    document.getElementById('sidebar-logout')?.addEventListener('click', async () => {
      if (window.supabaseClient) await window.supabaseClient.auth.signOut();
      window.location.href = 'index.html';
    });
  }

  // Agregar margen al contenedor principal
  function adjustLayout() {
    // Buscar el div que envuelve el contenido principal
    const mainWrapper = document.querySelector('.lg\\:ml-64') || document.querySelector('main') || document.querySelector('.min-h-screen');
    if (mainWrapper && !mainWrapper.classList.contains('lg:ml-64')) {
      mainWrapper.classList.add('lg:ml-64');
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { buildSidebar(); adjustLayout(); });
  } else {
    buildSidebar();
    adjustLayout();
  }
})();
