const sharp = require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');

// Technical display exports of ImageGen-restored source pixels, not native 4K.
// No extra generative detail is implied by the 3200px export dimensions.
async function main() {
  const pairs = process.argv[2] === 'v3' ? [
    ['universe-wireless-v3.png', 'universe-scene-v3.webp'],
    ['universe-background-wireless-v3.png', 'universe-background-v3.webp'],
  ] : [
    ['universe-restored-v2.png', 'universe-scene-v2.webp'],
    ['universe-background-v2.png', 'universe-background-v2.webp'],
  ];
  for (const [source, target] of pairs) {
    const input = path.join(__dirname, '../artwork/2026-10-23', source);
    const output = path.join(__dirname, 'public/assets/artwork', target);
    const native = await sharp(input).metadata();
    const info = await sharp(input)
      .resize(3200, 2006, { fit: 'fill', kernel: 'lanczos3' })
      .webp({ quality: 98, effort: 6, smartSubsample: true })
      .toFile(output);
    console.log(`${target}: source ${native.width}x${native.height}; display export ${info.width}x${info.height}; ${info.size} bytes`);
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
