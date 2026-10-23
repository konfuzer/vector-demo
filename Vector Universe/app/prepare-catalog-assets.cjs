const sharp=require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=require('node:path');
const fs=require('node:fs/promises');
const root=__dirname;
const concepts=path.resolve(root,'../concepts/2026-10-23/full-set');
const out=path.join(root,'public/assets/catalog');
async function crop(file,name,left,top,width,height){await sharp(path.join(concepts,file)).extract({left,top,width,height}).webp({quality:95}).toFile(path.join(out,name+'.webp'));}
(async()=>{await fs.mkdir(out,{recursive:true});await Promise.all([
crop('02-school-projects.png','book',60,343,369,301),
crop('02-school-projects.png','physics',816,343,372,301),
crop('02-school-projects.png','compass',60,678,369,270),
crop('02-school-projects.png','camera',816,678,372,270),
crop('03-project-brief.png','book-hero',81,266,952,309),
crop('05-exhibition.png','book-site',803,310,347,175),
crop('05-exhibition.png','reflections',1175,310,349,175),
crop('06-exhibition-work.png','bridge-detail',406,820,287,108),
crop('06-exhibition-work.png','bridge-front',720,820,286,108),
]);console.log('9 approved photographic image regions extracted without UI.');})();
