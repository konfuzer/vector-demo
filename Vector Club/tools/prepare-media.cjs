const sharp=require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const fs=require('node:fs/promises');
const path=require('node:path');
(async()=>{const dir=path.resolve(__dirname,'../public/media');for(const file of await fs.readdir(dir)){if(!file.endsWith('.png')||file.includes('reference'))continue;const out=path.join(dir,file.replace(/\.png$/,'.webp'));await sharp(path.join(dir,file)).resize({width:1600,withoutEnlargement:true}).webp({quality:92}).toFile(out);console.log(path.basename(out));}})().catch(e=>{console.error(e.message);process.exit(1)});
