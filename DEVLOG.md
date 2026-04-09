# 🧠 Novu360 Hub — Contexto de Sesiones

## 📌 Stack
- Frontend: HTML + CSS + JS vanilla
- Backend: Supabase (PostgreSQL + Auth)
- IA: Gemini API + Claude API (6 Cerebros)
- Deploy: GitHub → Vercel (`novu360-hub.vercel.app`)
- Herramientas: Antigravity + Codex

---

## ✅ Estado General
**Avance estimado:** ~75%

| Módulo | Estado |
|---|---|
| 12 pantallas HTML | ✅ Construidas |
| 15 tablas Supabase | ✅ Creadas y funcionando |
| Login Supabase Auth | ✅ Funcionando |
| Deploy GitHub → Vercel | ✅ Activo con secrets |
| 11 Cerebros IA (8 notebooks NotebookLM) | ✅ Documentados |
| Menú móvil (hamburguesa) | ✅ Resuelto (ver sesión 1) |

---

## 📋 Registro de Sesiones

---

### 🗓️ Sesión 1
**Problema resuelto:** Menú hamburguesa invisible en móvil

**Diagnóstico:**
- `app.js` creaba el `#nav-drawer-backdrop` dinámicamente (correcto)
- El CSS tenía `display: none !important` en `#nav-drawer-backdrop` sin regla `.open` correcta
- Eso impedía que el backdrop y el drawer aparecieran al hacer click

**Fix aplicado en `style.css`:**
```css
#nav-drawer-backdrop {
  display: none;
}

#nav-drawer-backdrop.open {
  display: block;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}
```

**Archivos modificados:** `style.css`
**Estado:** ✅ Resuelto y en producción

---

## 🔜 Pendientes Identificados

- [ ] Error `auth.js:141` — `Cannot read properties of null (reading 'auth')` en dashboard
- [ ] Error `rateUs.js:1` — `addEventListener` sobre elemento null
- [ ] Tailwind en producción — cambiar CDN por instalación local o Tailwind CLI
- [ ] Pipeline de ventas — funcionalidad de alta prioridad
- [ ] Módulos de entrenamiento móvil — alta prioridad
- [ ] Documentación schema Supabase (pendiente desde NotebookLM)

---

## 📝 Notas de Arquitectura

- El menú móvil es generado 100% por `app.js` (funciones `buildTopBar`, `buildDrawer`, `buildBottomNav`)
- NO deben existir elementos `#nav-drawer-backdrop` hardcodeados en HTML
- El backdrop usa clase `.open` para mostrarse — nunca `!important` en esa regla
- `auth.js` y `app.js` deben cargarse en orden correcto en cada HTML

---

*Última actualización: Sesión 1*
*Próxima sesión: continuar con errores de auth.js o nuevas funcionalidades*
