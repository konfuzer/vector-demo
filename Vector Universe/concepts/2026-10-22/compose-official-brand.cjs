// Artifact composition only. This is not application code.
// NODE_PATH may point to a runtime containing sharp; bundled path is the local fallback.
const path = require('node:path');
const fs = require('node:fs');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }

async function main() {
  const root = __dirname;
  const cleanSource = process.argv[2];
  const patchPath = path.join(root, 'assets/brand-area-background.png');
  const rect = { left: 32, top: 12, width: 388, height: 120 };
  if (cleanSource) await sharp(cleanSource).extract(rect).png().toFile(patchPath);
  const logoPath = path.join(root, 'assets/vektor-official.svg');
  const logo = await sharp(logoPath, { density: 288 }).trim().resize({ width: 176 }).png().toBuffer();
  const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let mass = 0, weightedY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      mass += alpha;
      weightedY += y * alpha;
    }
  }
  const logoTop = Math.round(72 - weightedY / mass);
  const word = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="70"><text x="0" y="46" fill="#0752c9" font-family="Arial, sans-serif" font-size="28" font-weight="500">Universe</text></svg>');
  await sharp(path.join(root, 'concept-b-atelier-v2.png')).composite([
    { input: patchPath, left: rect.left, top: rect.top },
    { input: logo, left: 68, top: logoTop },
    { input: word, left: 281, top: 36 },
  ]).png().toFile(path.join(root, 'concept-b-atelier-v3-official-logo.png'));
  fs.writeFileSync(path.join(root, 'assets/brand-placement.json'), JSON.stringify({
    source: 'vektor-official.svg',
    logo: { left: 68, top: logoTop, width: info.width, height: info.height },
    visibleAlphaCentroidY: weightedY / mass,
    targetOpticalCenterY: 72,
    preservedPixelsOutsideBrandRect: rect,
    note: 'Only transparent outer SVG margins were trimmed. Original paths and colors are unchanged.',
  }, null, 2));
  console.log('Saved official SVG composition; logo top: ' + logoTop);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
