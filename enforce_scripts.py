import os
import re

files = [
    'dashboard.html', 'ventas.html', 'prospector-ia.html', 'ads.html', 
    'aprobaciones.html', 'cerebros.html', 'community.html', 'finanzas.html', 
    'seo.html', 'web.html', 'onboarding.html'
]

def enforce_layout_script(f):
    if not os.path.exists(f): return
    
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 1. Remove old scripts
    content = re.sub(r'<script src="sidebar-drawer\.js"></script>', '', content)
    content = re.sub(r'<script src="layout\.js"></script>', '', content)
    
    # 2. Add layout.js before </body>
    content = content.replace('</body>', '<script src="layout.js"></script>\n</body>')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Enforced layout.js in {f}")

for f in files:
    enforce_layout_script(f)
