(function () {
  const isLogin = document.getElementById('login-form') || /(^|\/)index\.html$/i.test(window.location.pathname);
  if (isLogin) return;

  const ensureNavStyles = () => {
    if (document.getElementById('global-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'global-nav-styles';
    style.textContent = `
      #nav-hamburger, #nav-drawer, #nav-drawer-backdrop, #mobile-bottom-nav { box-sizing: border-box; }
      #nav-hamburger { display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #000; z-index: 9980; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 1px solid rgba(0,194,168,0.12); }
      #nav-hamburger-logo { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.1rem; color: #fff; text-decoration: none; letter-spacing: 0.08em; }
      #nav-hamburger-logo span { color: #00C2A8; }
      #nav-menu-btn { width: 40px; height: 40px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      #nav-drawer-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 9981; }
      #nav-drawer-backdrop.open { display: block; }
      #nav-drawer { display: none; position: fixed; top: 0; left: -280px; width: 260px; height: 100dvh; background: #000; z-index: 9982; flex-direction: column; padding: 24px 0; transition: left 0.3s ease; overflow-y: auto; }
      #nav-drawer.open { left: 0; }
      #nav-drawer-header { padding: 0 20px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 12px; }
      #nav-drawer-title { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.15rem; color: #fff; }
      #nav-drawer-sub { font-size: 0.65rem; color: #717976; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
      #nav-drawer nav a { display: flex; align-items: center; gap: 10px; margin: 2px 10px; padding: 10px 12px; border-radius: 10px; color: #a3a3a3; text-decoration: none; font-size: 0.875rem; }
      #nav-drawer nav a.nav-active, #nav-drawer nav a:hover { color: #00C2A8; background: rgba(0,194,168,0.1); }
      #mobile-bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; height: 65px; background: rgba(0,0,0,0.96); border-top: 1px solid rgba(0,194,168,0.12); z-index: 9970; align-items: center; justify-content: space-around; padding: 0 4px; }
      .mobile-nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; color: #737373; text-decoration: none; font-size: 10px; font-family: Inter, sans-serif; font-weight: 700; flex: 1; text-transform: uppercase; }
      .mobile-nav-item.active, .mobile-nav-item:hover { color: #00C2A8; }
      @media (min-width: 1024px) {
        #mobile-bottom-nav { display: none !important; }
        #nav-hamburger { display: none !important; }
        #nav-drawer, #nav-drawer-backdrop { display: none !important; }
      }
      @media (max-width: 1023px) {
        #nav-hamburger { display: flex !important; }
        #mobile-bottom-nav { display: flex !important; }
      }
    `;
    document.head.appendChild(style);
  };

  const links = [
    { href: '/dashboard.html', label: 'Dashboard', icon: 'dashboard' },
    { href: '/ventas.html', label: 'Ventas', icon: 'trending_up' },
    { href: '/prospector-ia.html', label: 'Prospector IA', icon: 'person_search' },
    { href: '/ads.html', label: 'Ads / Meta', icon: 'ads_click' },
    { href: '/community.html', label: 'Community', icon: 'groups' },
    { href: '/seo.html', label: 'SEO', icon: 'search' },
    { href: '/web.html', label: 'Web', icon: 'language' },
    { href: '/finanzas.html', label: 'Finanzas', icon: 'account_balance_wallet' },
    { href: '/cerebros.html', label: 'Cerebros IA', icon: 'psychology' },
    { href: '/aprobaciones.html', label: 'Aprobaciones', icon: 'fact_check' },
    { href: '/onboarding.html', label: 'Onboarding', icon: 'rocket_launch' }
  ];

  const current = (window.location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();

  const getActiveClass = (href) => {
    const file = href.split('/').pop().toLowerCase();
    return file === current ? ' nav-active' : '';
  };

  const createDesktopSidebar = () => {
    const existingSidebar = document.querySelector('aside#main-sidebar, aside#desktop-sidebar, aside.hidden.lg\\:flex, aside[class*="lg:flex"]');
    if (existingSidebar) return false;

    const aside = document.createElement('aside');
    aside.id = 'main-sidebar';
    aside.className = 'hidden lg:flex lg:flex-col w-64 bg-[#1A2235] border-r border-white/10 px-4 py-6';

    const navItems = links
      .map((item) => `<a class="px-3 py-2 rounded-lg text-white/85 hover:bg-[#00C2A8]/15 hover:text-[#00C2A8]${getActiveClass(item.href)}" href="${item.href}">${item.label}</a>`)
      .join('');

    aside.innerHTML = `
      <a class="font-headline text-2xl font-extrabold text-white tracking-tight mb-8" href="/dashboard.html">Novu 360</a>
      <nav class="flex flex-col gap-2 text-sm font-semibold">${navItems}</nav>
    `;

    document.body.prepend(aside);
    document.body.classList.add('novu-has-global-sidebar');
    return true;
  };

  const createMobileNav = () => {
    if (!document.getElementById('nav-hamburger')) {
      const top = document.createElement('div');
      top.id = 'nav-hamburger';
      top.innerHTML = `
        <a id="nav-hamburger-logo" href="/dashboard.html">NOVU<span>360</span></a>
        <button id="nav-menu-btn" type="button" aria-label="Abrir menú"><span class="material-symbols-outlined">menu</span></button>
      `;
      document.body.prepend(top);
    }

    if (!document.getElementById('nav-drawer-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'nav-drawer-backdrop';
      document.body.appendChild(backdrop);
    }

    if (!document.getElementById('nav-drawer')) {
      const drawer = document.createElement('aside');
      drawer.id = 'nav-drawer';
      drawer.className = 'openable';

      const drawerItems = links
        .map((item) => `<a class="${getActiveClass(item.href).trim()}" href="${item.href}"><span class="material-symbols-outlined">${item.icon}</span>${item.label}</a>`)
        .join('');

      drawer.innerHTML = `
        <div id="nav-drawer-header">
          <div id="nav-drawer-title">NOVU 360</div>
          <div id="nav-drawer-sub">Navegación principal</div>
        </div>
        <nav>${drawerItems}</nav>
      `;
      document.body.appendChild(drawer);
    }

    if (!document.getElementById('mobile-bottom-nav')) {
      const bottom = document.createElement('nav');
      bottom.id = 'mobile-bottom-nav';
      const bottomItems = [
        { href: '/dashboard.html', label: 'Inicio', icon: 'home' },
        { href: '/ventas.html', label: 'Ventas', icon: 'trending_up' },
        { href: '/prospector-ia.html', label: 'Leads', icon: 'person_search' },
        { href: '/ads.html', label: 'Ads', icon: 'ads_click' },
        { href: '/cerebros.html', label: 'IA', icon: 'psychology' }
      ];
      bottom.innerHTML = bottomItems
        .map((item) => {
          const file = item.href.split('/').pop().toLowerCase();
          const active = file === current ? ' active' : '';
          return `<a class="mobile-nav-item${active}" href="${item.href}"><span class="material-symbols-outlined">${item.icon}</span><span>${item.label}</span></a>`;
        })
        .join('');
      document.body.appendChild(bottom);
    }

    const btn = document.getElementById('nav-menu-btn');
    const drawer = document.getElementById('nav-drawer');
    const backdrop = document.getElementById('nav-drawer-backdrop');
    if (!btn || !drawer || !backdrop) return;

    const close = () => {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    };

    const open = () => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
    };

    if (!btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        if (drawer.classList.contains('open')) close();
        else open();
      });
    }

    if (!backdrop.dataset.bound) {
      backdrop.dataset.bound = '1';
      backdrop.addEventListener('click', close);
    }

    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', close);
    });
  };

  ensureNavStyles();
  createDesktopSidebar();
  createMobileNav();
})();
