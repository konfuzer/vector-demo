import {test,expect,type Page} from '@playwright/test';
const key='vector-club-demo:v1';
const names=['Робототехника','Дизайн и анимация','Научная мастерская','Академия лидерства','Академия переговоров','Академия креативного мышления','Академия критического мышления'];
const ids=['robotics','design','science','leadership','negotiation','creative','critical'];
async function choose(page:Page,label:string,option:string){await page.getByRole('combobox',{name:label,exact:true}).click();await page.getByRole('option',{name:option,exact:true}).click();}
async function stored(page:Page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)||'null'),key);}
async function images(page:Page){await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluateAll(imgs=>{imgs.forEach(i=>i.loading="eager");return Promise.all(imgs.map(i=>i.decode().catch(()=>{})));});}

test('семь карточек 3+4, происхождение, обложки, все страницы и возрастные фильтры',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('.course-grid>.course-card')).toHaveCount(3);await expect(page.locator('.more-grid>.course-card')).toHaveCount(4);
 expect(await page.locator('.course-card h2').allTextContents()).toEqual(names.map((n,i)=>i===1?'Дизайни анимация':i===2?'Научнаямастерская':n));
 await expect(page.locator('.course-grid .program-origin')).toHaveText(Array(3).fill('Демонстрационная программа'));
 await expect(page.locator('.more-grid .program-origin')).toHaveText(Array(4).fill('Программа с официального сайта'));
 await expect(page.locator('.catalog-toolbar>.demo-note')).toHaveText('В каталоге — программы с официального сайта и демонстрационные примеры. Цены, расписание и места — демонстрационные');
 expect(await page.locator('.course-card .cover').evaluateAll(imgs=>imgs.map(i=>(i as HTMLImageElement).getAttribute('src')))).toEqual(ids.map((id,i)=>'/media/'+id+(i<3?'.webp':'.png')));
 await page.locator('.more-courses').scrollIntoViewIfNeeded();await images(page);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'qa/catalogue-review-04/home.png',fullPage:true});
 for(const [index,id] of ids.entries()){
  await page.goto('/#/program/'+id);await expect(page.getByRole('heading',{level:1})).toHaveText(names[index]);await images(page);await expect(page.locator('.activity-grid>div')).toHaveCount(3);await expect(page.locator('.group-picker')).toContainText('Условия группы демонстрационные');
  if(index>=3){await expect(page.locator('.lead')).toHaveText('Для детей 12–18 лет');await expect(page.getByRole('link',{name:'О программе на официальном сайте'})).toHaveAttribute('href',/^https:\/\/www.academyvrn.ru\//);expect((await page.locator('.program-description,.activity-grid').allTextContents()).join(' ')).not.toMatch(/шахмат|английск|фотограф|сценическ/);}
  if(id==='creative')await page.screenshot({path:'qa/catalogue-review-04/academy.png',fullPage:true});
 }
 await page.goto('/');await choose(page,'Возраст','11 лет');await expect(page.locator('.course-card')).toHaveCount(2);await expect(page.locator('.course-card .program-origin')).toHaveText(Array(2).fill('Демонстрационная программа'));
 await choose(page,'Возраст','18 лет');await expect(page.locator('.course-card')).toHaveCount(4);await expect(page.locator('.course-card .program-origin')).toHaveText(Array(4).fill('Программа с официального сайта'));
 await choose(page,'Интересы','Коммуникация');await expect(page.locator('.course-card')).toHaveCount(2);await choose(page,'Удобный день','Вторник');await expect(page.locator('.course-card')).toHaveCount(1);await expect(page.locator('.course-card h2')).toHaveText('Академия лидерства');
 expect(errors).toEqual([]);
});

test('реальная академия: заявка, администратор, бронь, отдельная оплата и перезагрузка',async({page})=>{
 await page.goto('/#/program/creative');await page.getByRole('button',{name:'Оставить заявку в группу'}).click();await expect(page.getByRole('combobox',{name:'Возраст ребёнка',exact:true})).toHaveText('13 лет');await page.getByLabel('Как к вам обращаться').fill('Демо-семья академии');await page.getByRole('button',{name:'Создать демо-заявку'}).click();await expect(page.locator('.status-summary')).toContainText('Академия креативного мышления');
 let s=await stored(page);const r=s.requests[0];expect(r.groupId).toBe('g-creative');expect(s.enrollments.some((e:any)=>e.requestId===r.id)).toBe(false);const before=s.payments.length;
 await page.getByRole('link',{name:'Показать в админке'}).click();await expect(page.locator('.inspector')).toContainText('Демо-семья академии');await expect(page.locator('.inspector')).toContainText('Условия группы демонстрационные');await page.getByRole('button',{name:'Забронировать место',exact:true}).click();
 s=await stored(page);expect(s.payments).toHaveLength(before);expect(s.enrollments.find((e:any)=>e.requestId===r.id)).toMatchObject({status:'reserved',groupId:'g-creative'});await page.reload();await expect(page.locator('.inspector .stage-reserved')).toBeVisible();
 await page.getByRole('button',{name:'Отметить демо-оплату',exact:true}).click();await page.getByRole('button',{name:'Подтвердить демо-оплату'}).click();await page.reload();await expect(page.locator('.inspector .stage-paid')).toBeVisible();s=await stored(page);expect(s.payments).toHaveLength(before+1);expect(s.enrollments.filter((e:any)=>e.requestId===r.id)).toHaveLength(1);await page.screenshot({path:'qa/catalogue-review-04/academy-admin-paid.png',fullPage:true});
});

test('без группы: подбор академии по возрасту, выбор родителем и бронь',async({page})=>{
 await page.goto('/#/apply?draft=academy-consultation');await choose(page,'Возраст ребёнка','18 лет');await page.getByRole('button',{name:'Создать демо-заявку'}).click();await page.getByRole('link',{name:'Показать в админке'}).click();await page.getByLabel('Показать другие дни').check();await expect(page.locator('.offer')).toHaveCount(4);await page.locator('.offer').filter({hasText:'Академия критического мышления'}).getByRole('checkbox').check();await page.getByRole('button',{name:'Предложить варианты',exact:true}).click();await page.getByRole('link',{name:'Перейти к выбору родителя'}).click();await page.getByRole('button',{name:'Выбрать эту группу'}).click();await page.getByRole('link',{name:'Показать в админке'}).click();await page.getByRole('button',{name:'Забронировать место',exact:true}).click();await page.reload();await expect(page.locator('.inspector .stage-reserved')).toBeVisible();await expect(page.locator('.selected-group')).toContainText('Академия критического мышления');
});

test('использованный браузер: резервная копия, правки и исторические связи сохраняются',async({page})=>{
 await page.goto('/');
 const before=await page.evaluate(async k=>{
  const modulePath='/src/domain.ts';const {seedState,applyCommand}=await import(/* @vite-ignore */ modulePath);let s=seedState();
  s.programs=s.programs.filter((p:any)=>!p.sourceUrl).map((p:any)=>{delete p.archived;return p;});s.groups=s.groups.filter((g:any)=>s.programs.some((p:any)=>p.id===g.programId));delete s.catalogueRevision;
  s.programs[0].description='Моя сохранённая редакция робототехники перед обновлением.';s.programs.find((p:any)=>p.id==='chess').activities=['Сохранённая шахматная задача'];s.openingHours[0]={day:1,open:true,from:'10:30',to:'18:00'};
  const created=applyCommand(s,{type:'create',input:{submissionId:'legacy-user',kind:'group',source:'Каталог',parent:'Сохранённая семья',contact:'old@example.test',age:9,interests:[],days:[3],comment:'Прежняя заявка',groupId:'g-theatre'}});s=applyCommand(created.state,{type:'reserve',id:created.id}).state;s=applyCommand(s,{type:'pay',id:created.id}).state;
  s.programs.push({...s.programs[0],id:'my-program',name:'Моя дополнительная программа'});s.groups.push({...s.groups[0],id:'my-group',programId:'my-program'});
  const raw=JSON.stringify(s);localStorage.setItem(k,raw);localStorage.setItem('foreign-product','keep');return{raw,state:s};
 },key);
 await page.reload();await expect(page.locator('.course-card')).toHaveCount(7);await expect(page.locator('.migration-info summary')).toBeVisible();let s=await stored(page);
 expect(s.requests).toEqual(before.state.requests);expect(s.enrollments).toEqual(before.state.enrollments);expect(s.payments).toEqual(before.state.payments);expect(s.events).toEqual(before.state.events);expect(s.openingHours).toEqual(before.state.openingHours);expect(s.programs.find((p:any)=>p.id==='my-program').name).toBe('Моя дополнительная программа');expect(s.programs[0].description).toBe(before.state.programs[0].description);
 expect(await page.evaluate(k=>localStorage.getItem(k+':before-academies'),key)).toBe(before.raw);expect(await page.evaluate(()=>localStorage.getItem('foreign-product'))).toBe('keep');
 await page.goto('/#/admin/programs');await expect(page.locator('.admin-program').filter({hasText:'Шахматная лаборатория'})).toContainText('Архив');await expect(page.locator('.admin-program').filter({hasText:'Моя дополнительная программа'})).toContainText('Вне семи карточек');
 const old=before.state.requests.find((r:any)=>r.parent==='Сохранённая семья');await page.goto('/#/request/'+old.id);await expect(page.locator('.status-summary')).toContainText('Театральная студия');await page.reload();expect((await stored(page)).payments).toEqual(before.state.payments);
});

test('редактор академии сохраняет источник и содержание, мобильная компоновка цела',async({page})=>{
 await page.goto('/#/admin/programs');await page.locator('.admin-program').filter({hasText:'Академия переговоров'}).getByRole('button',{name:'Редактировать программу'}).click();await expect(page.getByLabel('Возраст до',{exact:true})).toHaveValue('18');await expect(page.getByRole('link',{name:'О программе на официальном сайте'})).toHaveAttribute('href','https://www.academyvrn.ru/peregovory');await page.getByLabel('Занятие 1',{exact:true}).fill('Обсудим аргументы в игровой ситуации');await page.getByRole('button',{name:'Сохранить программу',exact:true}).click();await page.reload();await page.goto('/#/program/negotiation');await expect(page.getByRole('heading',{name:'Обсудим аргументы в игровой ситуации'})).toBeVisible();await expect(page.locator('.breadcrumb')).toContainText('текст изменён в демо');
 await page.setViewportSize({width:390,height:844});for(const url of ['/', '/#/program/critical']){await page.goto(url);await images(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}await page.screenshot({path:'qa/catalogue-review-04/academy-mobile.png',fullPage:true});
});
