// Compose the exact official SVG into a static concept; no application is created.
const path = require('node:path');
const fs = require('node:fs');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
async function main() {
  const root = __dirname;
  const input = process.argv[2];
  if (!input) throw new Error('Pass the generated concept PNG path.');
  const plate = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="426" height="134"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#BCD7F7"/><stop offset="1" stop-color="#E4EFFF"/></linearGradient></defs><rect x="0" y="0" width="426" height="134" rx="32" fill="url(#g)"/><rect x="8" y="8" width="410" height="118" rx="25" fill="#FFFFFF" stroke="#88BAF3" stroke-width="1.5"/><text x="255" y="78" font-family="Arial, sans-serif" font-size="28" font-weight="500" fill="#0752c9">Universe</text></svg>');
  const logo = await sharp(path.join(root, 'assets/vektor-official.svg'), { density: 288 }).trim().resize({ width: 208 }).png().toBuffer();
  const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let mass=0, sy=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const a=data[(y*info.width+x)*4+3];mass+=a;sy+=y*a;
  }
  const top=Math.round(74-sy/mass);
  const final=path.join(root, 'concept-b-atelier-v4-student-world.png');
  await sharp(input).composite([
    { input: plate, left: 28, top: 8 },
    { input: logo, left: 58, top },
  ]).png().toFile(final);
  fs.writeFileSync(path.join(root,'assets/brand-placement-v4.json'),JSON.stringify({
    source:'vektor-official.svg', logo:{left:58,top,width:info.width,height:info.height},
    opticalCenterY:74, officialPathsUnchanged:true, headerBrandArea:{left:28,top:8,width:426,height:134}
  },null,2));
  console.log(final);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
