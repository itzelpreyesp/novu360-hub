const fs = require('fs');
const path = require('path');

const BASE = 'C:\\Users\\Itzel\\Downloads\\NOVU360-HUB';
const STITCH = path.join(BASE, 'stitch_novu_360_dashboard');

// Map: folder name → { outputFile, activeNav, title, hasSidebar }
const screens = [
  { folder: 'index',          out: 'index.html',         active: '',            title: 'Novu 360 · Login',                  hasSidebar: false },
  { folder: 'dashboard',      out: 'dashboard.html',     active: 'Dashboard',   title: 'Novu 360 · Panel de Control',       hasSidebar: true  },
  { folder: 'ventas',         out: 'ventas.html',        active: 'Ventas',      title: 'Novu 360 · Ventas & Prospector IA', hasSidebar: true  },
  { folder: 'community',      out: 'community.html',     active: 'Community',   title: 'Novu 360 · Community Manager',      hasSidebar: true  },
  { folder: 'seo',            out: 'seo.html',           active: 'SEO',         title: 'Novu 360 · SEO Local',              hasSidebar: true  },
  { folder: 'web',            out: 'web.html',           active: 'Web',         title: 'Novu 360 · Web & Landing Pages',    hasSidebar: true  },
  { folder: 'finanzas',       out: 'finanzas.html',      active: 'Finanzas',    title: 'Novu 360 · Finanzas',               hasSidebar: true  },
  { folder: 'cerebros',       out: 'cerebros.html',      active: 'Cerebros IA', title: 'Novu 360 · Cerebros IA',            hasSidebar: true  },
  { folder: 'onboarding',     out: 'onboarding.html',    active: 'Onboarding',  title: 'Novu 360 · Academy & Onboarding',   hasSidebar: true  },
  { folder: 'portal-cliente', out: 'portal-cliente.html',active: 'Clientes',    title: 'Novu 360 · Portal del Cliente',     hasSidebar: true  },
  { folder: 'ads',            out: 'ads.html',           active: 'Ads',         title: 'Novu 360 · Ads Meta',               hasSidebar: true  },
  { folder: 'aprobacion',     out: 'aprobaciones.html',  active: 'Aprobaciones',title: 'Novu 360 · Aprobaciones',           hasSidebar: true  },
];

// Full sidebar HTML to inject (replaces any existing sidebar or adds after <body>)
function buildSidebar(activeLabel) {
  const navItems = [
    { label: 'Dashboard',   icon: 'dashboard',      href: 'dashboard.html'      },
    { label: 'Ventas',      icon: 'trending_up',    href: 'ventas.html'         },
    { label: 'Ads',         icon: 'ads_click',      href: 'ads.html'            },
    { label: 'Community',   icon: 'forum',          href: 'community.html'      },
    { label: 'SEO',         icon: 'search',         href: 'seo.html'            },
    { label: 'Web',         icon: 'language',       href: 'web.html'            },
    { label: 'Clientes',    icon: 'group',          href: 'portal-cliente.html' },
    { label: 'Finanzas',    icon: 'payments',       href: 'finanzas.html'       },
    { label: 'Aprobaciones',icon: 'fact_check',     href: 'aprobaciones.html'   },
    { label: 'Onboarding',  icon: 'rocket_launch',  href: 'onboarding.html'     },
    { label: 'Cerebros IA', icon: 'psychology',     href: 'cerebros.html'       },
  ];

  const items = navItems.map(item => {
    const isActive = item.label === activeLabel;
    const cls = isActive
      ? 'bg-primary text-black rounded-lg mx-3 flex items-center px-4 py-3 gap-3 transition-all font-bold nav-active'
      : 'text-neutral-400 hover:text-white px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/5 rounded-lg mx-3';
    return `<a class="${cls}" href="${item.href}">
      <span class="material-symbols-outlined">${item.icon}</span>
      <span>${item.label}</span>
    </a>`;
  }).join('\n');

  return `<!-- SideNavBar - Novu 360 -->
<aside class="bg-black antialiased h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-20" style="box-shadow: 4px 0 24px rgba(0,0,0,0.6)">
  <div class="px-6 mb-8">
    <a href="dashboard.html" class="text-white font-black tracking-widest text-xl block" style="color:#fff;text-decoration:none">Novu 360</a>
    <div class="text-neutral-500 text-xs uppercase tracking-tighter mt-1 italic">INTELIGENCIA DE AGENCIA</div>
  </div>
  <button onclick="window.location.href='dashboard.html'" class="mx-6 mb-8 py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 duration-150" style="background:linear-gradient(135deg,#00C2A8,#009984);color:#000">
    <span class="material-symbols-outlined text-sm font-bold">add</span>
    Nuevo Proyecto
  </button>
  <nav class="flex-1 space-y-1 overflow-y-auto">
    ${items}
  </nav>
  <div class="mt-auto pt-4 space-y-1" style="border-top:1px solid rgba(255,255,255,0.05)">
    <a class="text-neutral-400 hover:text-white px-7 py-3 flex items-center gap-3 transition-all hover:bg-white/5" href="#">
      <span class="material-symbols-outlined">help</span>
      <span>Soporte</span>
    </a>
    <a class="text-neutral-400 hover:text-white px-7 py-3 flex items-center gap-3 transition-all hover:bg-white/5" href="#">
      <span class="material-symbols-outlined">person</span>
      <span>Cuenta</span>
    </a>
  </div>
</aside>`;
}

// Back to Dashboard button (for screens without sidebar)
const BACK_BTN = `<a href="dashboard.html" style="position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#00C2A8,#009984);color:#000;font-family:'Manrope',sans-serif;font-weight:700;padding:12px 20px;border-radius:12px;text-decoration:none;display:flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,194,168,0.35);z-index:9999">
  <span class="material-symbols-outlined" style="font-size:18px">arrow_back</span>
  Volver al Dashboard
</a>`;

// Shared head injections (fonts + our shared CSS/JS)
const HEAD_INJECT = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
<script src="novu-client.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>`;

const BODY_END_INJECT = `<script src="app.js" defer></script>`;

screens.forEach(screen => {
  const srcFile = path.join(STITCH, screen.folder, 'code.html');
  if (!fs.existsSync(srcFile)) {
    console.warn(`⚠️  Missing: ${srcFile}`);
    return;
  }

  let html = fs.readFileSync(srcFile, 'utf8');

  // Strip arbitrary <style> block from raw Stitch export so we only use style.css
  html = html.replace(/<style>[\s\S]*?<\/style>/i, '');

  // 1. Inject title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${screen.title}</title>`);
  if (!/<title>/i.test(html)) {
    html = html.replace('</head>', `<title>${screen.title}</title>\n</head>`);
  }

  // 2. Inject shared CSS & fonts before </head>
  html = html.replace('</head>', `${HEAD_INJECT}\n</head>`);

  // 3. Inject shared app.js or auth.js before </body>
  if (screen.folder === 'index') {
    html = html.replace('</body>', `<script src="auth.js" defer></script>\n</body>`);
    // Also inject ID to login form for auth.js
    html = html.replace(/<form\b([^>]*class="[^"]*space-y-6[^"]*")([^>]*)>/i, '<form $1 id="login-form" $2>');
  } else {
    html = html.replace('</body>', `${BODY_END_INJECT}\n</body>`);
  }

  if (screen.hasSidebar) {
    // 4a. Replace existing <aside> if found, otherwise inject after <body ...>
    const sidebar = buildSidebar(screen.active);
    if (/<aside\b[^>]*>/i.test(html)) {
      // Replace from first <aside to its matching </aside>
      html = html.replace(/<aside\b[\s\S]*?<\/aside>/i, sidebar);
    } else {
      // Inject right after opening <body> tag
      html = html.replace(/(<body[^>]*>)/i, `$1\n${sidebar}`);
    }

    // 5. Ensure main content has ml-64 offset so it doesn't hide behind sidebar
    // Update existing ml-64 or add it. Find `<main` and add class if needed.
    html = html.replace(/(<main\b[^>]*class=")([^"]*)(")/i, (match, p1, p2, p3) => {
      if (!p2.includes('ml-64')) {
        return `${p1}${p2} ml-64${p3}`;
      }
      return match;
    });
    // If <main> has no class attribute at all, add one
    html = html.replace(/(<main)(\s+(?!class)[^>]*)?(>)/i, (match, p1, p2, p3) => {
      if (match.includes('class=')) return match;
      return `${p1}${p2 || ''} class="ml-64"${p3}`;
    });

  } else if (screen.folder !== 'index') {
    // 4b. No sidebar - add Back to Dashboard floating button
    html = html.replace('</body>', `${BACK_BTN}\n</body>`);
  }

  const outPath = path.join(BASE, screen.out);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✅ ${screen.out} [${screen.active || 'login'}]`);
});

console.log('\n🚀 All screens processed!');
