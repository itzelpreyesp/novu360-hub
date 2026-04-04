const fs = require('fs');
const path = require('path');

const keysToRedact = [
    '[REDACTED]',
    '[REDACTED]',
    '[REDACTED]',
    '[REDACTED]'
];

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            if (file === '.git') continue;
            processDir(fullPath);
        } else {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            for (const key of keysToRedact) {
                // simple global replace for these specific strings
                let re = new RegExp(key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
                content = content.replace(re, '[REDACTED]');
            }
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Redacted keys in: ${fullPath}`);
            }
        }
    }
}

processDir('.');
