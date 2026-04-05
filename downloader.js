const fs = require('fs');
const https = require('https');
const path = require('path');

const jsonPath = 'C:\\Users\\Itzel\\.gemini\\antigravity\\brain\\deb22c50-fa73-49c1-a572-d1c1bfb0a50c\\.system_generated\\steps\\171\\output.txt';
const targetDir = 'C:\\Users\\Itzel\\Downloads\\NOVU360-HUB';
const styleCode = `<link rel="stylesheet" href="style.css">
    <script src="app.js" defer></script>
</head>`;

let rawData = fs.readFileSync(jsonPath, 'utf8');
// remove potential line numbers if they somehow leaked, or just parse
if(rawData.startsWith('1: ')) {
    rawData = rawData.substring(3); // strip "1: "
}
const data = JSON.parse(rawData);

const map = {
    "Novu 360 Login Desktop": "index.html",
    "Novu 360 Agency Admin Dashboard - Pure Black Edition": "dashboard.html",
    "Novu 360 Sales Module - Updated View": "ventas.html",
    "Novu 360 Content Planner Actualizado": "community.html",
    "Novu 360 - Gestión de SEO Local": "seo.html",
    "Novu 360 - Web y Landing Pages (Español)": "web.html",
    "Novu 360 - Administración y Finanzas": "finanzas.html",
    "Novu 360 - Cerebros IA Knowledge Management": "cerebros.html",
    "Novu 360 Academy - Prospección con IA": "onboarding.html",
    "Novu 360 Portal Cliente Actualizado": "portal-cliente.html"
};

let pending = 0;

data.screens.forEach(screen => {
    const title = screen.title;
    const url = screen.htmlCode?.downloadUrl;
    const targetFile = map[title];
    if (targetFile && url) {
        pending++;
        https.get(url, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                // Inyectar style.css y app.js antes de </head>
                body = body.replace('</head>', styleCode);
                
                // Aplicar reemplazos brutos de colores de Tailwind si es necesario para asegurar la paleta
                // Reemplazamos los bg-[#...] por los colores exactos pedidos por el usuario, PERO 
                // para ser seguros, el style.css será dominante y estos archivos se limpian de bordes rígidos.
                body = body.replace(/border(-[a-z]+)?-\[\#?[a-zA-Z0-9]+\]/g, 'border-transparent'); // elimina bordes solidos tailwind
                body = body.replace(/border-gray-[0-9]+/g, 'border-transparent');
                body = body.replace(/border-slate-[0-9]+/g, 'border-transparent');
                
                fs.writeFileSync(path.join(targetDir, targetFile), body);
                console.log(`Downloaded ${targetFile} (${title})`);
                pending--;
                if(pending === 0) console.log('All downloads completed.');
            });
        }).on('error', (e) => {
            console.error(`Error downloading ${title}: ${e.message}`);
            pending--;
        });
    } else {
        console.warn('Skipped or no URL for:', title);
    }
});
