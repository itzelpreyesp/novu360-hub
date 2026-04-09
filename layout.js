/**
 * Layout.js - Centralizado para NOVU360 HUB
 * Maneja la inyección dinámica del Sidebar, Tab Bar inferior y Backdrop.
 */
(() => {
  const SIDEBAR_ITEMS = [
    { label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
    { label: 'Ventas', href: 'ventas.html', icon: 'trending_up' },
    { label: 'Ads', href: 'ads.html', icon: 'ads_click' },
    { label: 'Community', href: 'community.html', icon: 'forum' },
    { label: 'SEO', href: 'seo.html', icon: 'search' },
    { label: 'Web', href: 'web.html', icon: 'language' },
    { label: 'Clientes', href: 'portal-cliente.html', icon: 'group' },
    { label: 'Finanzas', href: 'finanzas.html', icon: 'payments' },
    { label: 'Aprobaciones', href: 'aprobaciones.html', icon: 'fact_check' },
    { label: 'Onboarding', href: 'onboarding.html', icon: 'rocket_launch' },
    { label: 'Cerebros IA', href: 'cerebros.html', icon: 'psychology' },
  ];

  const FOOTER_ITEMS = [
    { label: 'Soporte', href: '#', icon: 'help' },
    { label: 'Cuenta', href: '#', icon: 'person' },
  ];

  const TAB_ITEMS = [
    { label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard' },
    { label: 'Ventas', href: 'ventas.html', icon: 'trending_up' },
    { label: 'Prospector', href: 'prospector-ia.html', icon: 'auto_awesome' },
    { label: 'Clientes', href: 'portal-cliente.html', icon: 'group' },
    { label: 'Menú', href: '#menu', icon: 'menu', isMenu: true },
  ];

  let sidebarOpen = false;
  let sidebar = null;
  let backdrop = null;
  let toggleButton = null;
  let bottomBar = null;

  function currentPath() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.toLowerCase();
  }

  function isActive(href) {
    const path = currentPath();
    if (href === 'dashboard.html' && (path === 'index.html' || path === '')) return true;
    return path === href.toLowerCase();
  }

  function createSidebar() {
    if (document.getElementById('main-sidebar')) return;

    sidebar = document.createElement('aside');
    sidebar.id = 'main-sidebar';
    sidebar.style.cssText = 'display:flex; flex-direction:column; background:#000; height:100vh; width:256px; position:fixed; left:0; top:0; z-index:100; padding:1.5rem 0; border-right:1px solid rgba(255,255,255,0.05); transition:transform 0.3s ease;';
    sidebar.className = '';
    
    // Initial mobile state
    if (window.innerWidth < 1024) {
      sidebar.style.transform = 'translateX(-100%)';
    } else {
      sidebar.style.transform = 'translateX(0)';
    }

    const navItemsHtml = SIDEBAR_ITEMS.map(item => {
      const active = isActive(item.href);
      const baseClass = "mx-3 flex items-center px-4 py-3 gap-3 transition-all rounded-lg";
      const activeClass = "bg-[#00C2A8]/10 text-[#00C2A8] font-bold";
      const inactiveClass = "text-neutral-400 hover:text-white hover:bg-white/5";
      
      return `
        <a class="${baseClass} ${active ? activeClass : inactiveClass}" href="${item.href}">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${active ? '1' : '0'}">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `;
    }).join('');

    const footerItemsHtml = FOOTER_ITEMS.map(item => `
      <a class="text-neutral-400 hover:text-white px-7 py-3 flex items-center gap-3 transition-all hover:bg-white/5" href="${item.href}">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `).join('');

    sidebar.innerHTML = `
      <div class="px-6 mb-8">
        <a href="dashboard.html" class="text-white font-black tracking-widest text-xl block" style="color:#fff;text-decoration:none">Novu 360</a>
        <div class="text-neutral-500 text-xs uppercase tracking-tighter mt-1 italic">INTELIGENCIA DE AGENCIA</div>
      </div>
      
      <button onclick="window.location.href='dashboard.html'" class="mx-6 mb-8 py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 duration-150" style="background:linear-gradient(135deg,#00C2A8,#009984);color:#000">
        <span class="material-symbols-outlined text-sm font-bold">add</span>
        Nuevo Proyecto
      </button>

      <nav class="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        ${navItemsHtml}
      </nav>

      <div class="mt-auto pt-4 space-y-1" style="border-top:1px solid rgba(255,255,255,0.05)">
        ${footerItemsHtml}
      </div>
    `;

    document.body.prepend(sidebar);
  }

  function createBackdrop() {
    if (document.getElementById('sidebar-backdrop')) return;
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'fixed inset-0 z-[60] hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    document.body.appendChild(backdrop);

    backdrop.onclick = () => setOpen(false);
  }

  function createToggleButton() {
    if (document.getElementById('sidebar-toggle')) return;
    toggleButton = document.createElement('button');
    toggleButton.id = 'sidebar-toggle';
    toggleButton.className = 'fixed left-4 top-3.5 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 border border-white/10 text-white backdrop-blur-md lg:hidden';
    toggleButton.innerHTML = '<span class="material-symbols-outlined">menu</span>';
    document.body.appendChild(toggleButton);

    toggleButton.onclick = () => setOpen(!sidebarOpen);
  }

  function createBottomBar() {
    if (currentPath().includes('login')) return;
    if (document.getElementById('bottom-tab-bar')) return;

    bottomBar = document.createElement('nav');
    bottomBar.id = 'bottom-tab-bar';
    bottomBar.style.cssText = 'position:fixed; bottom:0; left:0; right:0; z-index:50; height:65px; background:rgba(0,0,0,0.9); border-top:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:space-around; padding:0 8px;';
    bottomBar.className = '';
    bottomBar.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';

    bottomBar.innerHTML = TAB_ITEMS.map(item => {
      const active = !item.isMenu && isActive(item.href);
      const colorClass = active ? 'text-[#00C2A8]' : 'text-neutral-500';
      const tag = item.isMenu ? 'button' : 'a';
      const attr = item.isMenu ? 'id="mobile-menu-tab" type="button"' : `href="${item.href}"`;
      
      return `
        <${tag} ${attr} class="flex flex-col items-center justify-center gap-1 flex-1 py-2">
          <span class="material-symbols-outlined text-[24px] ${colorClass}" style="font-variation-settings: 'FILL' ${active ? '1' : '0'}">${item.icon}</span>
          <span class="text-[10px] font-bold ${colorClass}">${item.label}</span>
        </${tag}>
      `;
    }).join('');

    document.body.appendChild(bottomBar);
    
    const menuTab = document.getElementById('mobile-menu-tab');
    if (menuTab) menuTab.onclick = () => setOpen(!sidebarOpen);
  }

  function setOpen(open) {
    sidebarOpen = open;
    if (!sidebar || !backdrop) return;

    if (open) {
      sidebar.style.transform = 'translateX(0)';
      backdrop.classList.remove('hidden');
      setTimeout(() => backdrop.classList.add('opacity-100'), 10);
      document.body.classList.add('overflow-hidden');
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      backdrop.classList.remove('opacity-100');
      setTimeout(() => backdrop.classList.add('hidden'), 300);
      document.body.classList.remove('overflow-hidden');
    }
  }

  function syncLayout() {
    const isLarge = window.innerWidth >= 1024;
    const main = document.querySelector('main');
    
    if (main) {
      main.style.marginLeft = isLarge ? '256px' : '0';
    }

    if (isLarge) {
      if (sidebar) sidebar.style.transform = 'translateX(0)';
      if (backdrop) backdrop.classList.add('hidden');
      document.body.style.paddingBottom = '0';
      sidebarOpen = false;
    } else {
      if (sidebar && !sidebarOpen) sidebar.style.transform = 'translateX(-100%)';
      document.body.style.paddingBottom = '70px';
    }
  }

  function init() {
    createSidebar();
    createBackdrop();
    createToggleButton();
    createBottomBar();
    syncLayout();

    window.addEventListener('resize', syncLayout);

    // Auto-close on link click (mobile)
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) setOpen(false);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
