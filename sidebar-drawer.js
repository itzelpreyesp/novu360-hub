(() => {
  const NAV_ITEMS = [
    { label: 'Dashboard', href: 'dashboard.html', icon: 'dashboard', match: ['dashboard.html', 'index.html', ''] },
    { label: 'Ventas', href: 'ventas.html', icon: 'trending_up', match: ['ventas.html'] },
    { label: 'Prospector', href: 'prospector-ia.html', icon: 'auto_awesome', match: ['prospector-ia.html'] },
    { label: 'Clientes', href: 'portal-cliente.html', icon: 'group', match: ['portal-cliente.html', 'clientes.html'] },
  ];

  const MENU_ITEM = { label: 'Menú', href: '#menu', icon: 'menu' };

  let sidebarOpen = false;
  let sidebar = null;
  let backdrop = null;
  let toggleButton = null;
  let bottomBar = null;

  function isMobile() {
    return window.innerWidth < 1024; // Usando 1024 como breakpoint para mayor compatibilidad con tablets
  }

  function currentPath() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.toLowerCase();
  }

  function isActiveItem(item) {
    if (!item.match) return false;
    const path = currentPath();
    return item.match.some(match => path === match || (match === '' && path === 'index.html'));
  }

  function syncBodyPadding() {
    // Aplicar padding al body para que el contenido no quede oculto por la tab bar
    if (isMobile()) {
      document.body.style.paddingBottom = '70px';
    } else {
      document.body.style.paddingBottom = '0px';
    }
  }

  function findSidebar() {
    const candidates = Array.from(document.querySelectorAll('aside'));
    return candidates.find(aside => {
      const nav = aside.querySelector('nav');
      const hasMainNavLinks = aside.querySelector('a[href="dashboard.html"], a[href="ventas.html"], a[href="ads.html"]');
      return Boolean(nav || hasMainNavLinks);
    }) || null;
  }

  function ensureBackdrop() {
    let existing = document.getElementById('sidebar-backdrop');
    if (existing) return existing;

    existing = document.createElement('div');
    existing.id = 'sidebar-backdrop';
    // Estilos según PASO 2: fixed inset-0 z-30 bg-black/50
    existing.className = 'fixed inset-0 z-[60] hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300 opacity-0';
    document.body.appendChild(existing);
    return existing;
  }

  function ensureToggleButton() {
    let existing = document.getElementById('sidebar-toggle');
    if (existing) return existing;

    existing = document.createElement('button');
    existing.id = 'sidebar-toggle';
    existing.type = 'button';
    existing.setAttribute('aria-label', 'Abrir menú');
    existing.className = 'fixed left-4 top-3.5 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-lg bg-black/50 border border-white/10 text-white backdrop-blur-md transition-all active:scale-95 lg:hidden';
    existing.innerHTML = '<span class="material-symbols-outlined text-[24px]">menu</span>';
    document.body.appendChild(existing);
    return existing;
  }

  function ensureBottomBar() {
    if (currentPath().includes('login')) return null;

    let existing = document.getElementById('bottom-tab-bar');
    if (existing) return existing;

    existing = document.createElement('nav');
    existing.id = 'bottom-tab-bar';
    // Estilos según PASO 3: fixed bottom-0 left-0 right-0 z-50 alto 60px
    existing.className = 'fixed bottom-0 left-0 right-0 z-50 h-[65px] border-t border-white/10 bg-black/90 backdrop-blur-xl lg:hidden flex items-center justify-around px-2';
    existing.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';

    const items = [...NAV_ITEMS, MENU_ITEM].map(item => {
      const active = isActiveItem(item);
      const colorClass = active ? 'text-[#00C2A8]' : 'text-neutral-500';
      const isMenu = item.label === 'Menú';
      const tag = isMenu ? 'button' : 'a';
      const hrefAttr = isMenu ? '' : `href="${item.href}"`;
      const extra = isMenu ? 'type="button" id="mobile-menu-tab"' : '';
      
      return `
        <${tag} ${hrefAttr} ${extra} class="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors active:bg-white/5">
          <span class="material-symbols-outlined text-[24px] ${colorClass}" style="font-variation-settings: 'FILL' ${active ? '1' : '0'};">${item.icon}</span>
          <span class="text-[10px] font-bold ${colorClass}">${item.label}</span>
        </${tag}>
      `;
    }).join('');

    existing.innerHTML = items;
    document.body.appendChild(existing);
    return existing;
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

  function initSidebarDrawer() {
    sidebar = document.getElementById('main-sidebar');
    
    if (!sidebar) return;

    if (window.innerWidth < 1024) {
      sidebar.style.cssText += ';display:flex!important;transform:translateX(-100%);transition:transform 0.3s ease;';
    } else {
      sidebar.style.cssText += ';display:flex!important;transform:translateX(0);';
    }

    backdrop = ensureBackdrop();
    toggleButton = ensureToggleButton();
    bottomBar = ensureBottomBar();

    toggleButton.onclick = () => setOpen(!sidebarOpen);
    backdrop.onclick = () => setOpen(false);

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) setOpen(false);
      });
    });

    const menuTab = document.getElementById('mobile-menu-tab');
    if (menuTab) menuTab.onclick = () => setOpen(!sidebarOpen);

    window.addEventListener('resize', () => {
      syncBodyPadding();
      if (window.innerWidth >= 1024) {
        sidebar.style.cssText += ';display:flex!important;transform:translateX(0);';
        sidebarOpen = false;
      } else if (!sidebarOpen) {
        sidebar.style.cssText += ';display:flex!important;transform:translateX(-100%);';
      }
    });

    syncBodyPadding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarDrawer);
  } else {
    initSidebarDrawer();
  }
})();
