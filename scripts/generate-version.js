const fs = require('fs');
const path = require('path');

function safeNowVersion() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`;
}

const payload = {
  version: safeNowVersion(),
  generatedAt: new Date().toISOString()
};

const outPath = path.join(process.cwd(), 'version.json');
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Generated ${outPath} with version ${payload.version}`);
