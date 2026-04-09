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
    return window.innerWidth < 768;
  }

  function currentPath() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.toLowerCase();
  }

  function isActiveItem(item) {
    const path = currentPath();
    return item.match.some(match => path === match);
  }

  function syncBodyPadding() {
    document.body.style.paddingBottom = isMobile() ? '60px' : '';
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
    existing.className = 'fixed inset-0 z-30 hidden bg-black/50 md:hidden';
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
    existing.setAttribute('aria-expanded', 'false');
    existing.className = 'fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-black/80 text-white backdrop-blur transition hover:border-primary hover:text-primary md:hidden';
    existing.innerHTML = '<span class="material-symbols-outlined text-[22px]">menu</span>';
    document.body.appendChild(existing);
    return existing;
  }

  function ensureBottomBar() {
    let existing = document.getElementById('bottom-tab-bar');
    if (existing) return existing;

    existing = document.createElement('nav');
    existing.id = 'bottom-tab-bar';
    existing.className = 'fixed bottom-0 left-0 right-0 z-50 h-[60px] border-t border-white/10 bg-black/95 shadow-[0_-10px_30px_rgba(0,0,0,0.55)] md:hidden';
    existing.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';

    const items = [...NAV_ITEMS, MENU_ITEM].map(item => {
      const active = isActiveItem(item);
      const iconColor = active ? 'text-primary' : 'text-neutral-500';
      const labelColor = active ? 'text-primary' : 'text-neutral-500';
      const href = item.href;
      const isMenu = item.label === 'Menú';
      const tag = isMenu ? 'button' : 'a';
      const hrefAttr = isMenu ? '' : `href="${href}"`;
      const extra = isMenu ? 'type="button" data-sidebar-menu="true"' : '';
      return `
        <${tag} ${hrefAttr} ${extra} class="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-t-xl px-2 text-center transition active:bg-white/5">
          <span class="material-symbols-outlined text-[22px] ${iconColor}" style="font-variation-settings: 'FILL' ${active ? '1' : '0'};">${item.icon}</span>
          <span class="text-[10px] font-medium leading-none ${labelColor}" style="font-family: Inter, sans-serif;">${item.label}</span>
        </${tag}>
      `;
    }).join('');

    existing.innerHTML = `<div class="flex h-full items-stretch">${items}</div>`;
    document.body.appendChild(existing);
    return existing;
  }

  function setOpen(open) {
    sidebarOpen = open;
    window.sidebarOpen = sidebarOpen;

    if (!sidebar || !backdrop || !toggleButton) return;

    if (!isMobile()) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
      backdrop.classList.add('hidden');
      backdrop.classList.remove('block');
      document.body.classList.remove('overflow-hidden');
      toggleButton.setAttribute('aria-expanded', 'false');
      return;
    }

    sidebar.classList.toggle('-translate-x-full', !open);
    sidebar.classList.toggle('translate-x-0', open);
    backdrop.classList.toggle('hidden', !open);
    backdrop.classList.toggle('block', open);
    document.body.classList.toggle('overflow-hidden', open);
    toggleButton.setAttribute('aria-expanded', String(open));
  }

  function closeOnNavigation() {
    if (isMobile()) setOpen(false);
  }

  function initSidebarDrawer() {
    sidebar = findSidebar();
    if (sidebar) {
      sidebar.dataset.drawerReady = '1';
      sidebar.classList.remove('hidden');
      sidebar.classList.add(
        'flex',
        'flex-col',
        'fixed',
        'inset-y-0',
        'left-0',
        'z-40',
        'w-64',
        'transform',
        'transition-transform',
        'duration-300',
        'ease-out',
        '-translate-x-full',
        'md:translate-x-0'
      );
      sidebar.style.willChange = 'transform';
      sidebar = sidebar;
    }

    backdrop = ensureBackdrop();
    toggleButton = ensureToggleButton();
    bottomBar = ensureBottomBar();

    if (sidebar) {
      toggleButton.addEventListener('click', () => setOpen(!sidebarOpen));
      backdrop.addEventListener('click', () => setOpen(false));
      sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeOnNavigation);
      });
    } else {
      toggleButton.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
      });
    }

    if (bottomBar) {
      bottomBar.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', closeOnNavigation);
      });
      bottomBar.querySelector('[data-sidebar-menu="true"]')?.addEventListener('click', () => {
        if (sidebar) {
          setOpen(!sidebarOpen);
        } else {
          window.location.href = 'dashboard.html';
        }
      });
    }

    window.addEventListener('resize', () => {
      syncBodyPadding();
      if (!sidebar) return;
      if (!isMobile()) {
        setOpen(false);
      } else {
        setOpen(false);
      }
    });

    syncBodyPadding();
    setOpen(false);

    window.openSidebarDrawer = () => setOpen(true);
    window.closeSidebarDrawer = () => setOpen(false);
    window.toggleSidebarDrawer = () => setOpen(!sidebarOpen);
    window.sidebarOpen = sidebarOpen;
  }

  document.addEventListener('DOMContentLoaded', initSidebarDrawer);
})();
