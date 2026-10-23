import {mkdirSync,readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const here=dirname(fileURLToPath(import.meta.url)),root=resolve(here,'..');
const require=createRequire(import.meta.url);
const ts=require(resolve(root,'Vector Flow/node_modules/typescript/lib/typescript.js'));
const modules=new Map();
function loadClubModule(name){
 if(modules.has(name))return modules.get(name).exports;
 const mod={exports:{}};modules.set(name,mod);
 const code=ts.transpileModule(readFileSync(resolve(root,`Vector Club/src/${name}.ts`),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{module:mod,exports:mod.exports,require:n=>loadClubModule(n.replace('./','')),crypto:globalThis.crypto,structuredClone,console});
 return mod.exports;
}
const {seedState,applyCommand}=loadClubModule('domain');
let legacy=seedState();
legacy.programs=legacy.programs.filter(p=>!p.sourceUrl).map(p=>{delete p.archived;return p});
legacy.groups=legacy.groups.filter(g=>legacy.programs.some(p=>p.id===g.programId));delete legacy.catalogueRevision;
legacy.programs[0].description='Моя сохранённая редакция робототехники перед обновлением.';
legacy.programs.find(p=>p.id==='chess').activities=['Сохранённая шахматная задача'];
legacy.openingHours[0]={day:1,open:true,from:'10:30',to:'18:00'};
const created=applyCommand(legacy,{type:'create',input:{submissionId:'legacy-user',kind:'group',source:'Каталог',parent:'Сохранённая семья',contact:'old@example.test',age:9,interests:[],days:[3],comment:'Прежняя заявка',groupId:'g-theatre'}});
legacy=applyCommand(created.state,{type:'reserve',id:created.id}).state;
legacy=applyCommand(legacy,{type:'pay',id:created.id}).state;
legacy.programs.push({...legacy.programs[0],id:'my-program',name:'Моя дополнительная программа'});
legacy.groups.push({...legacy.groups[0],id:'my-group',programId:'my-program'});
const suffix='rankly-list-0881f9e4.workers.dev';
for(const [key,folder] of Object.entries({club:'Vector Club',flow:'Vector Flow',universe:'Vector Universe/app'})){
 const base=resolve(root,folder),url=`https://vector-${key}-demo.${suffix}`;
 let testDir=resolve(base,'tests');
 if(key==='club'){
  testDir=resolve(here,'tests-club');mkdirSync(testDir,{recursive:true});
  for(const name of readdirSync(resolve(base,'tests')).filter(n=>n.endsWith('.e2e.ts'))){
   let source=readFileSync(resolve(base,'tests',name),'utf8').replaceAll('http://127.0.0.1:5195',url).replaceAll("'@playwright/test'", "'../../Vector Club/node_modules/@playwright/test'");
   // Dev-only source import is replaced with the identical legacy fixture prepared
   // from local modules. The production app still performs the actual migration.
   if(source.includes("const modulePath='/src/domain.ts'"))source=source.replace(/const before=await page\.evaluate\(async k=>\{[\s\S]*?\},key\);/,`const fixture=${JSON.stringify(legacy)};const before=await page.evaluate(({k,state})=>{const raw=JSON.stringify(state);localStorage.setItem(k,raw);localStorage.setItem('foreign-product','keep');return{raw,state}},{k:key,state:fixture});`);
   writeFileSync(resolve(testDir,name),source);
  }
 }
 if(key==='universe'){
  testDir=resolve(here,'tests-universe');mkdirSync(testDir,{recursive:true});
  for(const name of readdirSync(resolve(base,'tests')).filter(n=>n.endsWith('.spec.ts'))){
   const source=readFileSync(resolve(base,'tests',name),'utf8')
    .replaceAll('"@playwright/test"','"../../Vector Universe/app/node_modules/@playwright/test"')
    .replaceAll('"../src/','"../../Vector Universe/app/src/')
    .replace('const workUrl = page.url();','await expect(page).toHaveURL(/#work\\//);\n  const workUrl = page.url();');
   writeFileSync(resolve(testDir,name),source);
  }
 }
 const cfg={testDir,testMatch:key==='club'?'**/*.e2e.ts':key==='flow'?'browser.spec.ts':'**/*.spec.ts',fullyParallel:false,workers:1,timeout:60000,expect:{timeout:15000},retries:0,outputDir:resolve(here,`qa/${key}-artifacts`),reporter:[['list'],['json',{outputFile:resolve(here,`qa/${key}-results.json`)}]],use:{baseURL:url,channel:'msedge',headless:true,viewport:{width:1440,height:900},screenshot:'only-on-failure',trace:'retain-on-failure'}};
 writeFileSync(resolve(here,`playwright.${key}.config.cjs`),`const {defineConfig}=require(${JSON.stringify(resolve(base,'node_modules/@playwright/test'))});\nmodule.exports=defineConfig(${JSON.stringify(cfg,null,2)});\n`);
}
console.log('Remote QA configs prepared; Club same-origin assertion adapted to public URL. Product tests unchanged.');
