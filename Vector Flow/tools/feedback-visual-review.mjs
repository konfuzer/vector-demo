import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:1});
const page=await context.newPage();
async function open(path,title){await page.goto('http://127.0.0.1:5193/#/'+path);await page.getByRole('heading',{name:title,exact:true}).waitFor();await page.waitForFunction(()=>Array.from(document.images).every(e=>e.complete&&e.naturalWidth>0));await page.mouse.move(0,0);}
for(const width of [1600,1280]){
 await page.setViewportSize({width,height:width===1600?1000:800});
 await open('admin/overview','Добрый день, Мария');await page.screenshot({path:`qa/feedback-home-${width}.png`,fullPage:true});
 await open('admin/payments','Оплата');if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error('Payment header overflow');
 await page.getByRole('button',{name:'Загрузить CSV',exact:true}).click();const d=page.getByRole('dialog',{name:'Загрузить оплаты из CSV',exact:true});await d.getByLabel('CSV с оплатами',{exact:true}).setInputFiles('qa/пример-оплат-демо.csv');await d.getByRole('heading',{name:'Предпросмотр',exact:true}).waitFor();
 await page.screenshot({path:`qa/feedback-import-${width}.png`,fullPage:false});await d.getByRole('button',{name:'Отмена',exact:true}).click();
 await page.getByRole('combobox',{name:'Период',exact:true}).click();await page.screenshot({path:`qa/feedback-month-${width}.png`,fullPage:false});await page.getByRole('combobox',{name:'Период',exact:true}).press('Escape');
 await page.getByRole('combobox',{name:'Роль',exact:true}).click();await page.screenshot({path:`qa/feedback-role-${width}.png`,fullPage:false});await page.getByRole('combobox',{name:'Роль',exact:true}).press('Escape');
 console.log('Visual feedback verified at',width);
}
await browser.close();
