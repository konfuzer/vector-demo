import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
const results=[];
for(const size of [{width:2091,height:1150},{width:1600,height:1000},{width:1440,height:900},{width:1280,height:800}]){
 await page.setViewportSize(size);await page.goto('http://127.0.0.1:5193/#/founder/overview?period=2026-09');await page.getByRole('heading',{name:'Школа в цифрах',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('.brand img').complete);await page.mouse.move(0,200);
 const geometry=await page.evaluate(()=>{
  const rect=s=>document.querySelector(s).getBoundingClientRect();const center=s=>{const r=rect(s);return r.y+r.height/2;};
  const image=rect('.brand img');const scale=Math.min(image.width/382,image.height/180);
  const logoBody=image.y+(image.height-scale*180)/2+(164-40)*scale;
  const flow=center('.brand>span'),nav=center('.app-header nav button'),period=center('.period-menu .header-select-trigger'),role=center('.role-menu .header-select-trigger');
  return {header:center('.app-header'),logoBody,flow,nav,period,role,overflow:document.documentElement.scrollWidth>innerWidth};
 });
 results.push({width:size.width,height:size.height,...geometry});
 if(Math.max(...[geometry.logoBody,geometry.flow,geometry.nav,geometry.period,geometry.role])-Math.min(...[geometry.logoBody,geometry.flow,geometry.nav,geometry.period,geometry.role])>2||geometry.overflow)throw new Error('Header alignment differs: '+JSON.stringify(geometry));
 const header=await page.locator('.app-header').boundingBox();await page.screenshot({path:`qa/header-aligned-${size.width}.png`,clip:{x:0,y:0,width:size.width,height:Math.ceil(header.height)}});
 if(size.width===1600)await page.screenshot({path:'qa/overview-header-aligned-1600.png',fullPage:true});
}
console.log(JSON.stringify(results,null,2));await browser.close();
