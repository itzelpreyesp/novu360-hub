import os
import re

files = [
    'dashboard.html', 'ventas.html', 'prospector-ia.html', 'ads.html', 
    'aprobaciones.html', 'cerebros.html', 'community.html', 'finanzas.html', 
    'seo.html', 'web.html', 'onboarding.html'
]

def remove_layout_script(f):
    if not os.path.exists(f): return
    
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove layout.js script
    content = re.sub(r'<script src="layout\.js"></script>', '', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Removed layout.js script from {f}")

for f in files:
    remove_layout_script(f)
