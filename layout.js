/**
 * layout.js - NOVU360 HUB
 * CSS puro, sin dependencia de Tailwind CDN para elementos dinámicos.
 */
(() => {
  const PRIMARY = '#00C2A8';
 
  const SIDEBAR_ITEMS = [
    { label: 'Dashboard',    href: 'dashboard.html',     icon: 'dashboard' },
    { label: 'Ventas',       href: 'ventas.html',        icon: 'trending_up' },
    { label: 'Ads',          href: 'ads.html',           icon: 'ads_click' },
    { label: 'Community',    href: 'community.html',     icon: 'forum' },
    { label: 'SEO',          href: 'seo.html',           icon: 'search' },
    { label: 'Web',          href: 'web.html',           icon: 'language' },
    { label: 'Clientes',     href: 'portal-cliente.html',icon: 'group' },
    { label: 'Finanzas',     href: 'finanzas.html',      icon: 'payments' },
    { label: 'Aprobaciones', href: 'aprobaciones.html',  icon: 'fact_check' },
    { label: 'Onboarding',   href: 'onboarding.html',    icon: 'rocket_launch' },
    { label: 'Cerebros IA',  href: 'cerebros.html',      icon: 'psychology' },
  ];
 
  const FOOTER_ITEMS = [
    { label: 'Soporte', href: '#', icon: 'help' },
    { label: 'Cuenta',  href: '#', icon: 'person' },
  ];
 
  const TAB_ITEMS = [
    { label: 'Dashboard',  href: 'dashboard.html',      icon: 'dashboard' },
    { label: 'Ventas',     href: 'ventas.html',         icon: 'trending_up' },
    { label: 'Prospector', href: 'prospector-ia.html',  icon: 'auto_awesome' },
    { label: 'Clientes',   href: 'portal-cliente.html', icon: 'group' },
    { label: 'Menú',       href: '#menu',               icon: 'menu', isMenu: true },
  ];
 
  let sidebarOpen = false;
  let sidebar, backdrop, toggleBtn, bottomBar, mainEl;
 
  /* ─── helpers ─── */
  function currentPage() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }
 
  function isActive(href) {
    const p = currentPage();
    if (href === 'dashboard.html' && (p === '' || p === 'index.html')) return true;
    return p === href.toLowerCase();
  }
 
  function isMobile() { return window.innerWidth < 1024; }
 
  /* ─── sidebar ─── */
  function createSidebar() {
    if (document.getElementById('main-sidebar')) {
      sidebar = document.getElementById('main-sidebar');
      // Resetear clases para que JS tenga control total
      sidebar.removeAttribute('class');
      applySidebarBaseStyles();
      return;
    }
 
    sidebar = document.createElement('aside');
    sidebar.id = 'main-sidebar';
    applySidebarBaseStyles();
 
    const navHtml = SIDEBAR_ITEMS.map(item => {
      const active = isActive(item.href);
      return `
        <a href="${item.href}" style="
          display:flex; align-items:center; gap:12px;
          padding:10px 16px; margin:2px 12px;
          border-radius:10px; text-decoration:none;
          font-size:14px; font-family:Inter,sans-serif;
          transition:background 0.15s, color 0.15s;
          background:${active ? 'rgba(0,194,168,0.12)' : 'transparent'};
          color:${active ? PRIMARY : '#a3a3a3'};
          font-weight:${active ? '700' : '400'};
        ">
          <span class="material-symbols-outlined" style="font-size:20px;font-variation-settings:'FILL' ${active ? 1 : 0}">${item.icon}</span>
          ${item.label}
        </a>`;
    }).join('');
 
    const footerHtml = FOOTER_ITEMS.map(item => `
      <a href="${item.href}" style="
        display:flex; align-items:center; gap:12px;
        padding:10px 20px; text-decoration:none;
        font-size:14px; font-family:Inter,sans-serif;
        color:#737373; transition:color 0.15s;
      ">
        <span class="material-symbols-outlined" style="font-size:20px">${item.icon}</span>
        ${item.label}
      </a>`).join('');
 
    sidebar.innerHTML = `
      <div style="padding:0 24px 32px">
        <a href="dashboard.html" style="
          display:block; color:#fff; text-decoration:none;
          font-size:20px; font-weight:900; letter-spacing:0.1em;
          font-family:Manrope,sans-serif;
        ">Novu 360</a>
        <div style="color:#525252;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;font-style:italic">
          INTELIGENCIA DE AGENCIA
        </div>
      </div>
 
      <a href="dashboard.html" style="
        display:flex; align-items:center; justify-content:center; gap:8px;
        margin:0 24px 32px; padding:12px;
        background:linear-gradient(135deg,${PRIMARY},#009984);
        color:#000; font-weight:700; font-size:14px;
        border-radius:10px; text-decoration:none;
        font-family:Inter,sans-serif;
      ">
        <span class="material-symbols-outlined" style="font-size:18px">add</span>
        Nuevo Proyecto
      </a>
 
      <nav style="flex:1;overflow-y:auto">${navHtml}</nav>
 
      <div style="padding-top:16px;border-top:1px solid rgba(255,255,255,0.05)">${footerHtml}</div>
    `;
 
    document.body.prepend(sidebar);
  }
 
  function applySidebarBaseStyles() {
    Object.assign(sidebar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '100vh',
      width: '256px',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: '100',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
      transition: 'transform 0.3s ease',
      transform: isMobile() ? 'translateX(-100%)' : 'translateX(0)',
    });
  }
 
  /* ─── backdrop ─── */
  function createBackdrop() {
    backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    Object.assign(backdrop.style, {
      position: 'fixed', inset: '0',
      zIndex: '90',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(2px)',
      display: 'none',
      opacity: '0',
      transition: 'opacity 0.3s ease',
    });
    backdrop.onclick = () => setOpen(false);
  }
 
  /* ─── toggle button ─── */
  function createToggleBtn() {
    toggleBtn = document.getElementById('sidebar-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'sidebar-toggle';
      toggleBtn.type = 'button';
      toggleBtn.setAttribute('aria-label', 'Abrir menú');
      toggleBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px">menu</span>';
      document.body.appendChild(toggleBtn);
    }
    Object.assign(toggleBtn.style, {
      position: 'fixed',
      top: '12px',
      left: '12px',
      zIndex: '110',
      width: '40px',
      height: '40px',
      display: isMobile() ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      color: '#fff',
      cursor: 'pointer',
      backdropFilter: 'blur(8px)',
    });
    toggleBtn.onclick = () => setOpen(!sidebarOpen);
  }
 
  /* ─── bottom tab bar ─── */
  function createBottomBar() {
    if (currentPage().includes('login')) return;
 
    bottomBar = document.getElementById('bottom-tab-bar');
    if (!bottomBar) {
      bottomBar = document.createElement('nav');
      bottomBar.id = 'bottom-tab-bar';
      document.body.appendChild(bottomBar);
    }
 
    Object.assign(bottomBar.style, {
      position: 'fixed',
      bottom: '0', left: '0', right: '0',
      zIndex: '50',
      height: '65px',
      background: 'rgba(0,0,0,0.95)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: isMobile() ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      paddingBottom: 'env(safe-area-inset-bottom,0px)',
      backdropFilter: 'blur(16px)',
    });
 
    bottomBar.innerHTML = TAB_ITEMS.map(item => {
      const active = !item.isMenu && isActive(item.href);
      const color = active ? PRIMARY : '#737373';
      const tag = item.isMenu ? 'button' : 'a';
      const attr = item.isMenu
        ? 'id="mobile-menu-tab" type="button"'
        : `href="${item.href}"`;
 
      return `
        <${tag} ${attr} style="
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:3px; flex:1; padding:8px 4px;
          background:none; border:none; cursor:pointer;
          text-decoration:none; color:${color};
          font-family:Inter,sans-serif;
        ">
          <span class="material-symbols-outlined" style="
            font-size:22px; color:${color};
            font-variation-settings:'FILL' ${active ? 1 : 0}
          ">${item.icon}</span>
          <span style="font-size:10px; font-weight:700; color:${color}">${item.label}</span>
        </${tag}>`;
    }).join('');
 
    const menuTab = document.getElementById('mobile-menu-tab');
    if (menuTab) menuTab.onclick = () => setOpen(!sidebarOpen);
  }
 
  /* ─── main content margin ─── */
  function adjustMain() {
    mainEl = mainEl || document.querySelector('main');
    if (!mainEl) return;
    Object.assign(mainEl.style, {
      marginLeft: isMobile() ? '0' : '256px',
      minHeight: '100vh',
      paddingBottom: isMobile() ? '75px' : '0',
    });
  }
 
  /* ─── open / close ─── */
  function setOpen(open) {
    sidebarOpen = open;
    if (!sidebar || !backdrop) return;
 
    if (open) {
      sidebar.style.transform = 'translateX(0)';
      backdrop.style.display = 'block';
      setTimeout(() => { backdrop.style.opacity = '1'; }, 10);
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.style.transform = 'translateX(-100%)';
      backdrop.style.opacity = '0';
      setTimeout(() => { backdrop.style.display = 'none'; }, 300);
      document.body.style.overflow = '';
    }
  }
 
  /* ─── resize ─── */
  function onResize() {
    const mobile = isMobile();
 
    if (toggleBtn) toggleBtn.style.display = mobile ? 'flex' : 'none';
    if (bottomBar) bottomBar.style.display = mobile ? 'flex' : 'none';
 
    if (!mobile) {
      sidebar.style.transform = 'translateX(0)';
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
      sidebarOpen = false;
    } else if (!sidebarOpen) {
      sidebar.style.transform = 'translateX(-100%)';
    }
 
    adjustMain();
  }
 
  /* ─── init ─── */
  function init() {
    createSidebar();
    createBackdrop();
    createToggleBtn();
    createBottomBar();
    adjustMain();
 
    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobile()) setOpen(false);
      });
    });
 
    window.addEventListener('resize', onResize);
  }
 
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
