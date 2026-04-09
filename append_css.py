import os

css_to_append = """
#nav-hamburger {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 200;
  height: 56px;
  background: #000;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
#nav-hamburger-logo {
  color: #fff;
  font-family: Manrope, sans-serif;
  font-weight: 900;
  font-size: 18px;
  text-decoration: none;
  letter-spacing: 0.08em;
}
#nav-hamburger-logo span { color: #00C2A8; }
#nav-menu-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}
#nav-drawer-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 210;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
}
#nav-drawer-backdrop.open { display: block; }
#nav-drawer {
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  width: 280px;
  background: #000;
  z-index: 220;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255,255,255,0.05);
  overflow-y: auto;
}
#nav-drawer.open { transform: translateX(0); }
#nav-drawer-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
#nav-drawer-title {
  color: #fff;
  font-family: Manrope, sans-serif;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.08em;
}
#nav-drawer-sub {
  color: #525252;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}
#nav-drawer nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #a3a3a3;
  text-decoration: none;
  font-size: 14px;
  font-family: Inter, sans-serif;
  transition: background 0.15s, color 0.15s;
}
#nav-drawer nav a:hover,
#nav-drawer nav a.nav-active {
  background: rgba(0,194,168,0.1);
  color: #00C2A8;
}
#mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 190;
  height: 65px;
  background: rgba(0,0,0,0.95);
  border-top: 1px solid rgba(255,255,255,0.08);
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  backdrop-filter: blur(16px);
}
.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: #737373;
  text-decoration: none;
  font-size: 10px;
  font-family: Inter, sans-serif;
  font-weight: 700;
  flex: 1;
  padding: 8px 4px;
}
.mobile-nav-item.active,
.mobile-nav-item:hover { color: #00C2A8; }

@media (max-width: 1023px) {
  #nav-hamburger { display: flex; }
  #mobile-bottom-nav { display: flex; }
  main { 
    margin-left: 0 !important; 
    padding-top: 56px;
    padding-bottom: 75px;
  }
  aside#main-sidebar { display: none !important; }
}
"""

with open('style.css', 'a', encoding='utf-8') as f:
    f.write(css_to_append)
print("Styles appended to style.css")
