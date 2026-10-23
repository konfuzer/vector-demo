// Static concept finishing and review montage. This is not application code.
const fs = require('node:fs');
const path = require('node:path');
let sharp;
try { sharp = require('sharp'); }
catch { sharp = require('C:/Users/ivana/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'); }
const root=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'build-manifest.json'),'utf8'));
const assetDir=path.join(root,'assets');
fs.mkdirSync(assetDir,{recursive:true});
const postPath=path.join(root,'post-edits.json');
const postEdits=fs.existsSync(postPath)?JSON.parse(fs.readFileSync(postPath,'utf8')):{};
const materialDir=path.resolve(root,'../../../materials/history/libretexts-ancient-egypt');
const officialLogo=path.resolve(root,'../../2026-10-22/assets/vektor-official.svg');

function svg(w,h,body){return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);}
function xml(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}
async function crop(p,rect){return sharp(p).extract(rect).png().toBuffer();}
async function fit(input,w,h,mode='cover'){
  return sharp(input).resize(w,h,{fit:mode,background:'#ffffff'}).png().toBuffer();
}
async function finish(){
  const logo=await sharp(officialLogo,{density:288}).trim().resize({width:208}).png().toBuffer();
  const word=svg(170,70,'<text x="0" y="46" font-family="Arial,sans-serif" font-size="30" font-weight="500" fill="#0752c9">Universe</text>');
  // Preserve every original generator output inside the product-owned folder.
  for(const screen of manifest.screens){
    const raw=path.join(assetDir,screen.id+'-generated.png');
    if(path.resolve(screen.generatedPath)!==path.resolve(raw))fs.copyFileSync(screen.generatedPath,raw);
    screen.generatedPath=raw;
  }
  const navRaw=path.join(assetDir,'00-home-nav-generated.png');
  if(path.resolve(manifest.mainNavPath)!==path.resolve(navRaw))fs.copyFileSync(manifest.mainNavPath,navRaw);
  manifest.mainNavPath=navRaw;
  const byId=Object.fromEntries(manifest.screens.map(s=>[s.id,s]));

  let prism=await crop(byId['04-add-work'].generatedPath,{left:1005,top:546,width:490,height:222});
  if(postEdits.prism){
    const local=path.join(assetDir,'prism-clean-generated.png');
    if(path.resolve(postEdits.prism.path)!==path.resolve(local))fs.copyFileSync(postEdits.prism.path,local);
    postEdits.prism.path=local;
    const normalized=await sharp(local).resize(490,222,{fit:'fill'}).png().toBuffer();
    const corner=await sharp(normalized).extract({left:424,top:0,width:66,height:65}).png().toBuffer();
    prism=await sharp(prism).composite([{input:corner,left:424,top:0}]).png().toBuffer();
  }
  const website=await crop(byId['01-portfolio'].generatedPath,{left:1050,top:311,width:466,height:219});
  const film=await crop(byId['01-portfolio'].generatedPath,{left:73,top:648,width:461,height:198});
  const bridge=await crop(byId['06-exhibition-work'].generatedPath,{left:66,top:315,width:978,height:485});
  const realCover=path.join(materialDir,'page-001.png');
  fs.writeFileSync(path.join(assetDir,'prism-preview.png'),prism);
  fs.writeFileSync(path.join(assetDir,'website-preview.png'),website);
  fs.writeFileSync(path.join(assetDir,'bridge-preview.png'),bridge);

  for(const screen of manifest.screens){
    const overlays=[{input:logo,left:54,top:8},{input:word,left:289,top:28}];
    if(screen.id==='01-portfolio'){
      overlays.push({input:await fit(realCover,462,220,'contain'),left:73,top:311});
      overlays.push({input:await fit(prism,457,220),left:564,top:311});
    }
    if(screen.id==='04-add-work'){
      overlays.push({input:svg(113,33,'<rect width="113" height="33" fill="#eaf3ff"/><text x="2" y="23" font-family="Arial,sans-serif" font-size="16" fill="#14295c">Иван · автор</text>'),left:259,top:786});
    }
    if(screen.id==='05-exhibition')overlays.push({input:await fit(bridge,720,377),left:61,top:310});
    if(screen.id==='07-parent-view'){
      overlays.push({input:await fit(prism,916,507),left:57,top:267});
      overlays.push({input:await fit(website,518,254),left:1011,top:269});
      overlays.push({input:await fit(film,518,200),left:1011,top:639});
      overlays.push({input:svg(36,36,'<circle cx="18" cy="18" r="17" fill="#5b9df7"/><path d="M11 18h14m-6-6 6 6-6 6" stroke="white" stroke-width="2" fill="none"/>'),left:1023,top:567});
    }
    if(screen.id==='08-real-history-work'){
      overlays.push({input:await fit(realCover,977,480,'contain'),left:67,top:315});
      const pages=[1,2,7,30];
      const xs=[136,346,559,773];
      for(let i=0;i<pages.length;i++)overlays.push({
        input:await fit(path.join(materialDir,`page-${String(pages[i]).padStart(3,'0')}.png`),188,103,'contain'),left:xs[i],top:820
      });
    }
    if(postEdits[screen.id]){
      const edit=postEdits[screen.id];
      const local=path.join(assetDir,screen.id+'-heading-edit.png');
      if(path.resolve(edit.path)!==path.resolve(local))fs.copyFileSync(edit.path,local);
      edit.path=local;
      const meta=await sharp(screen.generatedPath).metadata();
      const normalized=await sharp(local).resize(meta.width,meta.height,{fit:'fill'}).png().toBuffer();
      const patch=await sharp(normalized).extract(edit.rect).png().toBuffer();
      overlays.push({input:patch,left:edit.rect.left,top:edit.rect.top});
    }
    const out=path.join(root,screen.id+'.png');
    await sharp(screen.generatedPath).composite(overlays).png().toFile(out);
    const meta=await sharp(out).metadata();
    screen.output=out;screen.width=meta.width;screen.height=meta.height;
  }

  // The approved home art is preserved; only navigation and the three card previews change.
  const approvedHome=path.resolve(root,'../concept-b-v6-independent-arch.png');
  const home=path.join(root,'00-home.png');
  const nav=await crop(navRaw,{left:480,top:0,width:660,height:106});
  await sharp(approvedHome).composite([
    {input:nav,left:480,top:0},
    {input:await fit(realCover,266,159,'contain'),left:1265,top:183},
    {input:await fit(prism,266,153),left:1265,top:420},
    {input:await fit(website,266,148),left:1265,top:650},
    {input:svg(222,24,'<rect width="222" height="24" fill="white"/><text x="0" y="18" font-family="Arial,sans-serif" font-size="15" fill="#65749f">Материал · История</text>'),left:1271,top:378},
  ]).png().toFile(home);
  const ordered=[{id:'00-home',title:'Мой мир',output:home},...manifest.screens];

  const tileW=800,tileH=502,labelH=46,gap=24,headH=76;
  const width=tileW*3+gap*4,height=headH+(tileH+labelH)*3+gap*4;
  const items=[{input:svg(width,headH,'<text x="24" y="43" font-family="Arial,sans-serif" font-size="31" font-weight="600" fill="#14295c">Vector Universe · все экраны</text><text x="24" y="69" font-family="Arial,sans-serif" font-size="17" fill="#60749c">Визуальные концепты · 23 октября 2026</text>'),left:0,top:0}];
  for(let i=0;i<ordered.length;i++){
    const s=ordered[i],left=gap+(i%3)*(tileW+gap),top=headH+gap+Math.floor(i/3)*(tileH+labelH+gap);
    items.push({input:svg(tileW,labelH,`<rect width="${tileW}" height="${labelH}" fill="white"/><text x="12" y="31" font-family="Arial,sans-serif" font-size="23" fill="#14295c">${String(i).padStart(2,'0')} · ${xml(s.title)}</text>`),left,top});
    items.push({input:await fit(s.output,tileW,tileH,'contain'),left,top:top+labelH});
  }
  await sharp({create:{width,height,channels:4,background:'#e9f1fd'}}).composite(items).png().toFile(path.join(root,'ALL_SCREENS.png'));
  const gallery=['# Vector Universe — полный набор экранов','','23 октября 2026. Это визуальные концепты, не приложение. Одобренный стиль главной сохранён; новые экраны предложены для общей приёмки. Реальная презентация по истории встроена как внешний учебный материал, а не работа Ивана.','',
    '![Все экраны](<'+path.join(root,'ALL_SCREENS.png').replaceAll('\\','/')+'>)','','## Полный размер',''];
  for(const s of ordered){const p=s.output.replaceAll('\\','/');gallery.push('### '+s.title,'','!['+s.title+'](<'+p+'>)','','[Открыть изображение](<'+p+'>)','');}
  gallery.push('## Настоящая презентация','','Art History Ancient Egypt — Michael Leonard, Humanities LibreTexts / University of the Pacific. 132 страницы, английский язык. Исходный PDF сохранён без изменений. Автор и лицензия CC BY 4.0 указаны на странице источника.','',
    '[Страница источника](https://human.libretexts.org/Courses/University_of_the_Pacific/Art_History_-_Prehistoric_through_Gothic/05:_Ancient_Egypt/5.01:_Ancient_Egypt_PowerPoint)',
    '','[Локальный PDF](<'+path.join(materialDir,'Art_History_Ancient_Egypt.pdf').replaceAll('\\','/')+'>)','','[Промпты](PROMPTS.md)','');
  fs.writeFileSync(path.join(root,'ALL_SCREENS.md'),gallery.join('\n'));
  manifest.finishedAt='2026-10-23';manifest.home=home;manifest.overview=path.join(root,'ALL_SCREENS.png');
  fs.writeFileSync(path.join(root,'build-manifest.json'),JSON.stringify(manifest,null,2));
  if(Object.keys(postEdits).length)fs.writeFileSync(postPath,JSON.stringify(postEdits,null,2));
  console.log(JSON.stringify({screens:ordered.length,overview:manifest.overview,outputs:ordered.map(s=>s.output)}));
}
finish().catch(e=>{console.error(e);process.exitCode=1;});
