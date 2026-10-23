import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
async function open(path,title){
  await page.goto('http://127.0.0.1:5193/#/'+path);
  await page.getByRole('heading',{name:title,exact:true}).waitFor();
  await page.mouse.move(0,0);
  await page.waitForFunction(()=>Array.from(document.images).every(e=>e.complete&&e.naturalWidth>0));
  if(await page.locator('.money-chart').count())await page.waitForFunction(()=>{const e=document.querySelector('.money-chart');return Math.abs(e.getBoundingClientRect().width-e.querySelector('svg').viewBox.baseVal.width)<1;});
}
for(const [name,path,title] of [['founder','founder/overview','Школа в цифрах'],['requests','admin/requests','Заявки'],['student-before','admin/students?id=%D0%A3-032','Мария Орлова'],['economy','founder/economy','Экономика школы'],['payments','admin/payments','Оплата']]){
  await open(path,title);
  await page.screenshot({path:`qa/review-${name}-1600.png`,fullPage:true});
  console.log(name,await page.evaluate(()=>({width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth})));
}
await open('admin/students?id=%D0%A3-032','Мария Орлова');
await page.getByRole('button',{name:'Отметить оплату',exact:true}).first().click();
const dialog=page.getByRole('dialog',{name:'Отметить оплату',exact:true});
await dialog.getByLabel('Чек или другой файл',{exact:true}).setInputFiles('qa/чек-сентябрь-демо.pdf');
await dialog.getByRole('button',{name:'Сохранить платёж',exact:true}).click();
await dialog.waitFor({state:'detached'});
await page.getByRole('button',{name:'Закрыть уведомление',exact:true}).click();
await page.screenshot({path:'qa/review-student-after-1600.png',fullPage:true});
for(const [name,path,title] of [['founder','founder/overview','Школа в цифрах'],['requests','admin/requests','Заявки'],['student','admin/students?id=%D0%A3-032','Мария Орлова']]){
  await page.setViewportSize({width:1280,height:800});
  await open(path,title);
  await page.screenshot({path:`qa/review-${name}-1280.png`,fullPage:true});
  console.log(name+'-1280',await page.evaluate(()=>({height:innerHeight,scroll:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth})));
}
await browser.close();
