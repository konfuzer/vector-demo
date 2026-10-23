import {cpSync,mkdirSync,readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'..');
for(const [key,source] of Object.entries({club:'Vector Club/dist',flow:'Vector Flow/dist',universe:'Vector Universe/app/dist'})){
 const target=resolve(here,'assets',key);mkdirSync(target,{recursive:true});cpSync(resolve(root,source),target,{recursive:true});
 writeFileSync(resolve(here,`wrangler.${key}.jsonc`),JSON.stringify({name:`vector-${key}-demo`,compatibility_date:'2026-10-23',workers_dev:true,assets:{directory:`./assets/${key}`,not_found_handling:'single-page-application'}},null,2));
}
mkdirSync(resolve(here,'assets/hub'),{recursive:true});
cpSync(resolve(root,'Demo Hub/index.html'),resolve(here,'assets/hub/index.html'));
writeFileSync(resolve(here,'wrangler.hub.jsonc'),JSON.stringify({name:'vector-digital-demo',compatibility_date:'2026-10-23',workers_dev:true,assets:{directory:'./assets/hub'}},null,2));
console.log('Prepared four static sites from production builds. Original sources unchanged.');
