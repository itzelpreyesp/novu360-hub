import os
import re

files = [
    'dashboard.html', 'ventas.html', 'prospector-ia.html', 'ads.html', 
    'aprobaciones.html', 'cerebros.html', 'community.html', 'finanzas.html', 
    'seo.html', 'web.html', 'portal-cliente.html', 'onboarding.html'
]

def clean_html(f):
    if not os.path.exists(f):
        print(f"Skipping {f}, not found.")
        return
    
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Remove the aside element (multiline support)
    content = re.sub(r'<!-- SideNavBar.*?-->(?:\s*<aside.*?</aside>)?', '', content, flags=re.DOTALL)
    content = re.sub(r'<aside id="main-sidebar".*?</aside>', '', content, flags=re.DOTALL)
    
    # 2. Remove old sidebar script
    content = re.sub(r'<script src="sidebar-drawer.js"></script>', '', content)
    
    # 3. Handle redundant mobile toggles if any inside the main content (header)
    # The header usually has a menu toggle button which we might want to keep or remove
    # since layout.js adds its own. Usually it's better to keep the header one if it's styled differently,
    # or layout.js can just hook into it. 
    # But layout.js creates #sidebar-toggle. 
    # Let's see if we should remove the hardcoded ones.
    
    # 4. Cleanup layout.js script if exists (to avoid duplicates)
    content = re.sub(r'<script src="layout.js"></script>', '', content)
    
    # 5. Add layout.js before </body>
    content = content.replace('</body>', '<script src="layout.js"></script>\n</body>')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Cleaned {f}")

for f in files:
    clean_html(f)
