// Concept-material tooling only; not application code.
// The user explicitly requested inserting the actual PNG instead of generated lettering.
const sharp = require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path = require('node:path');
const fs = require('node:fs/promises');
const base = path.resolve(__dirname, '../..');
const brand = path.join(base, 'assets/brand');
async function main() {
  await sharp(path.join(brand,'vektor-official.svg'), {density: 288})
    .trim().png().toFile(path.join(brand,'vektor-official.png'));
  for (let i=2;i<process.argv.length;i+=2) {
    const input = path.resolve(process.argv[i]);
    const output = path.resolve(process.argv[i+1]);
    if (!output.startsWith(base + path.sep)) throw new Error('Output must be inside Club');
    const {width,height} = await sharp(input).metadata();
    const sx=width/1600, sy=height/1000;
    // Replace the entire generated brand area with a clean white label, preserving
    // the navigation. The official logo keeps its original proportions.
    const plateW=width, plateH=Math.round(108*sy);
    const logo=await sharp(path.join(brand,'vektor-official.png'))
      .resize({width:Math.round(185*sx),height:Math.round(78*sy),fit:'inside'})
      .png().toBuffer();
    let plate=await sharp({create:{width:plateW,height:plateH,channels:4,background:'#ffffff'}})
      .composite([
        {input:logo,left:Math.round(42*sx),top:Math.round(14*sy)},
        {input:Buffer.from(`<svg width="${plateW}" height="${plateH}" viewBox="0 0 1600 108"><line x1="250" y1="32" x2="250" y2="77" stroke="#BCD7F7"/><g font-family="Arial,sans-serif" fill="#222222"><text x="275" y="65" font-size="22" letter-spacing="4">CLUB</text><g font-size="17"><text x="610" y="64">Занятия</text><text x="755" y="64">Как записаться</text><text x="965" y="64">Где проходят</text></g></g><rect x="1335" y="28" width="220" height="54" rx="18" fill="#3C8FEF"/><text x="1445" y="62" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="white">Подобрать занятие</text><line x1="0" y1="107" x2="1600" y2="107" stroke="#E4EFFF"/></svg>`),left:0,top:0}
      ]).png().toBuffer();
    if (path.basename(output).startsWith('admin-')) {
      const text=Buffer.from(`<svg width="${plateW}" height="${plateH}" viewBox="0 0 1600 108"><line x1="250" y1="32" x2="250" y2="77" stroke="#BCD7F7"/><g font-family="Arial,sans-serif" fill="#222222"><text x="275" y="65" font-size="22" letter-spacing="4">CLUB</text><text x="430" y="64" font-size="24">Кабинет администратора</text><text x="1050" y="64" font-size="17" fill="#3C8FEF">Родительский сайт</text></g><rect x="1355" y="28" width="200" height="54" rx="18" fill="#E4EFFF"/><text x="1455" y="62" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#222222">Сбросить демо</text><line x1="0" y1="107" x2="1600" y2="107" stroke="#E4EFFF"/></svg>`);
      plate=await sharp({create:{width:plateW,height:plateH,channels:4,background:'#ffffff'}})
        .composite([{input:logo,left:Math.round(42*sx),top:Math.round(14*sy)},{input:text,left:0,top:0}]).png().toBuffer();
    }
    await sharp(input).composite([{input:plate,left:0,top:0}]).png().toFile(output);
    console.log(path.basename(output));
  }
}
main().catch(e=>{console.error(e.message);process.exit(1)});
