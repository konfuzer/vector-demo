import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const errors=new WeakMap<Page,string[]>();
test.beforeEach(async({page})=>{const e:string[]=[];errors.set(page,e);page.on('pageerror',err=>e.push(err.message));page.on('console',m=>{if(m.type()==='error')e.push(m.text());});await page.goto('/');await expect(page.getByRole('heading',{name:'Школа в цифрах',exact:true})).toBeVisible();});
test.afterEach(async({page})=>{expect(errors.get(page)||[],'Ошибки выполнения браузера').toEqual([]);});
const nav=(page:Page,name:string)=>page.getByRole('navigation',{name:'Основная навигация'}).getByRole('button',{name,exact:true});
async function chooseRole(page:Page,value:string){await page.getByRole('combobox',{name:'Роль',exact:true}).click();await page.getByRole('option').filter({hasText:value==='admin'?'Мария · Администратор':'Учредитель'}).click();}
async function admin(page:Page){await chooseRole(page,'admin');await expect(page.getByRole('combobox',{name:'Роль',exact:true})).toHaveText(/Мария/);await expect(nav(page,'Экономика')).toHaveCount(0);}
async function card(page:Page){await admin(page);await nav(page,'Ученики').click();await page.getByRole('button',{name:'Открыть карточку Мария Орлова',exact:true}).click();await expect(page.getByRole('heading',{name:'Мария Орлова',exact:true})).toBeVisible();}
async function payment(page:Page,amount='50000',file=false){await page.getByRole('button',{name:'Отметить оплату',exact:true}).first().click();const d=page.getByRole('dialog',{name:'Отметить оплату',exact:true});await d.getByLabel('Сумма, ₽',{exact:true}).fill(amount);if(file)await d.getByLabel('Чек или другой файл',{exact:true}).setInputFiles(resolve('qa/чек-сентябрь-демо.pdf'));await d.getByRole('button',{name:'Сохранить платёж',exact:true}).click();await expect(d).not.toBeVisible();}

test('обзор совпадает с моделью и не содержит акцента на просрочках',async({page})=>{await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*860\s*000/);await expect(page.getByTestId('overview-net')).toHaveText(/740\s*000/);await expect(page.getByRole('heading',{name:'132 / 144 ученика'})).toBeVisible();await expect(page.getByText('Просрочено',{exact:true})).toHaveCount(0);await page.screenshot({path:'qa/browser-founder-1440.png',fullPage:true});});

test('редактирование заявки: отказ, сохранение, повтор и отмена',async({page})=>{await admin(page);const editor=page.locator('.request-editor');await expect(editor.getByRole('heading',{name:'Марк Власов',exact:true})).toBeVisible();await editor.getByLabel('Статус',{exact:true}).selectOption('working');await editor.getByRole('button',{name:'Сохранить изменения',exact:true}).click();await expect(editor.getByRole('alert')).toHaveText('Выберите ответственного.');await expect(editor.getByLabel('Ответственный',{exact:true})).toBeFocused();await editor.getByRole('button',{name:'Назначить себя',exact:true}).click();await editor.getByRole('button',{name:'Сохранить изменения',exact:true}).click();await expect(page.locator('.operational-band>div').nth(0).locator('strong')).toHaveText('10');await expect(page.locator('.operational-band>div').nth(1).locator('strong')).toHaveText('6');const count=await editor.locator('.history-row').count();await editor.getByRole('button',{name:'Сохранить изменения',exact:true}).click();await expect(editor.locator('.history-row')).toHaveCount(count);await editor.getByRole('button',{name:'Отменить последнее изменение',exact:true}).click();await expect(page.locator('.operational-band>div').nth(0).locator('strong')).toHaveText('11');await expect(editor.getByLabel('Ответственный',{exact:true})).toHaveValue('');await page.reload();await expect(page.locator('.operational-band>div').nth(0).locator('strong')).toHaveText('11');});

test('две новые заявки создаются раздельно и увеличивают общие числа',async({page})=>{await admin(page);for(const name of ['Тестовый Первый','Тестовый Второй']){await page.getByRole('button',{name:'Новая заявка',exact:true}).first().click();const d=page.getByRole('dialog',{name:'Новая заявка',exact:true});await d.getByLabel('Имя и фамилия ученика',{exact:true}).fill(name);await d.getByLabel('Родитель',{exact:true}).fill('Демонстрационный родитель');await d.getByLabel('Контакт для связи',{exact:true}).fill('Демо-контакт');await d.getByRole('button',{name:'Сохранить изменения',exact:true}).click();await expect(d).not.toBeVisible();}await expect(page.locator('.operational-band>div').nth(2).locator('strong')).toHaveText('18');await page.getByLabel('Поиск заявки по имени ученика').fill('Тестовый');await expect(page.locator('tbody tr')).toHaveCount(2);});

test('администратор видит и редактирует заявку Club',async({page})=>{await admin(page);await page.getByRole('button',{name:'Club 6',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(6);await page.locator('.request-editor').getByLabel('Комментарий',{exact:true}).fill('Демонстрационный комментарий администратора');await page.locator('.request-editor').getByRole('button',{name:'Сохранить изменения'}).click();await page.reload();await expect(page.locator('.request-editor').getByLabel('Комментарий',{exact:true})).toHaveValue('Демонстрационный комментарий администратора');await page.screenshot({path:'qa/browser-admin-requests-1440.png',fullPage:true});});

test('полная оплата, PDF-вложение и сохранение после перезагрузки',async({page})=>{await card(page);await page.screenshot({path:'qa/browser-student-before-1440.png',fullPage:true});await payment(page,'50000',true);await expect(page.getByTestId('student-paid')).toHaveText(/50\s*000/);await expect(page.getByTestId('student-remaining')).toHaveText(/^0\s*₽$/);await expect(page.locator('.student-payments .payment-row')).toHaveCount(1);await page.screenshot({path:'qa/browser-student-after-1440.png',fullPage:true});await page.reload();await expect(page.getByTestId('student-paid')).toHaveText(/50\s*000/);await page.getByRole('button',{name:'чек-сентябрь-демо.pdf',exact:true}).first().click();const d=page.getByRole('dialog',{name:'чек-сентябрь-демо.pdf',exact:true});const download=page.waitForEvent('download');await d.getByRole('link',{name:'Скачать файл'}).click();const file=await download;expect(file.suggestedFilename()).toBe('чек-сентябрь-демо.pdf');const buffer=await readFile((await file.path())!);expect(buffer.subarray(0,5).toString()).toBe('%PDF-');await d.getByRole('button',{name:'Закрыть',exact:true}).click();await chooseRole(page,'founder');await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*910\s*000/);await expect(page.getByTestId('overview-net')).toHaveText(/790\s*000/);});

test('нулевая сумма отклоняется, форма сохраняет введённые данные',async({page})=>{await card(page);await page.getByRole('button',{name:'Отметить оплату',exact:true}).first().click();const d=page.getByRole('dialog',{name:'Отметить оплату',exact:true});await d.getByLabel('Сумма, ₽',{exact:true}).fill('0');await d.getByLabel('Комментарий',{exact:true}).fill('Проверка отказа');await d.getByRole('button',{name:'Сохранить платёж',exact:true}).click();await expect(d.getByRole('alert')).toContainText('больше нуля');await expect(d.getByLabel('Комментарий',{exact:true})).toHaveValue('Проверка отказа');await expect(page.getByTestId('student-paid')).toHaveText(/^0\s*₽$/);await d.getByRole('button',{name:'Отмена',exact:true}).click();});

test('частичная оплата и последующий платёж распределяются по месяцам',async({page})=>{await card(page);await payment(page,'20000');await expect(page.getByTestId('student-remaining')).toHaveText(/30\s*000/);await payment(page,'80000');await expect(page.getByTestId('student-paid')).toHaveText(/50\s*000/);const rows=page.locator('.schedule-table tbody tr');await expect(rows.nth(1)).toContainText('Оплачено');await expect(rows.nth(1).locator('td').nth(2)).toHaveText(/50\s*000/);await expect(rows.nth(2).locator('td').nth(2)).toHaveText(/^0\s*₽$/);await chooseRole(page,'founder');await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*960\s*000/);});

test('аннулирование платежа возвращает остаток и финансовую сводку',async({page})=>{await card(page);await payment(page);await page.getByRole('button',{name:/Аннулировать платёж/}).click();const d=page.getByRole('dialog',{name:'Аннулировать запись платежа',exact:true});await d.getByLabel('Причина',{exact:true}).fill('Демонстрационная ошибка');await d.getByRole('button',{name:'Аннулировать запись',exact:true}).click();await expect(d).not.toBeVisible();await expect(page.getByTestId('student-remaining')).toHaveText(/50\s*000/);await expect(page.locator('.student-payments .voided')).toHaveCount(1);await chooseRole(page,'founder');await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*860\s*000/);});

test('карточка редактируется, контакты и примечание сохраняются',async({page})=>{await card(page);await page.getByRole('button',{name:'Редактировать',exact:true}).click();const d=page.getByRole('dialog',{name:'Редактировать карточку',exact:true});await d.getByLabel('Примечания',{exact:true}).fill('Новое демонстрационное примечание');await d.getByRole('button',{name:'Сохранить карточку',exact:true}).click();await expect(d).not.toBeVisible();await page.reload();await expect(page.locator('.note-panel')).toContainText('Новое демонстрационное примечание');});

test('новый ученик связан с начислениями и заполняемостью',async({page})=>{await admin(page);await nav(page,'Ученики').click();await page.getByRole('button',{name:'Новый ученик',exact:true}).click();const d=page.getByRole('dialog',{name:'Новый ученик',exact:true});await d.getByLabel('Имя и фамилия ученика',{exact:true}).fill('Тестовый Новый');await d.getByLabel('Родитель 1',{exact:true}).fill('Родитель Новый');await d.getByLabel('Контакт для связи',{exact:true}).fill('Демо-контакт');await d.getByRole('button',{name:'Сохранить карточку',exact:true}).click();await expect(page.getByRole('heading',{name:'Тестовый Новый',exact:true})).toBeVisible();await expect(page.locator('.schedule-table tbody tr')).toHaveCount(3);await chooseRole(page,'founder');await expect(page.getByRole('heading',{name:'133 / 144 ученика'})).toBeVisible();});

test('добавление начисления и защита от повторного месяца',async({page})=>{await card(page);await page.getByRole('button',{name:'Начисление',exact:true}).click();const d=page.getByRole('dialog',{name:'Новое начисление',exact:true});await d.getByLabel('Период',{exact:true}).fill('2026-09');await d.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(d.getByRole('alert')).toContainText('уже существует');await d.getByLabel('Период',{exact:true}).fill('2026-12');await d.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(d).not.toBeVisible();await expect(page.locator('.schedule-table')).toContainText(/декабрь 2026/i);});

test('отдельное вложение остаётся в браузере и скачивается',async({page})=>{await card(page);await page.getByRole('button',{name:'Прикрепить файл',exact:true}).click();const d=page.getByRole('dialog',{name:'Прикрепить файл',exact:true});await d.getByLabel('Файл',{exact:true}).setInputFiles({name:'заметка-демо.txt',mimeType:'text/plain',buffer:Buffer.from('DEMO attachment, no real personal data')});await d.getByRole('button',{name:'Прикрепить',exact:true}).click();await page.reload();await page.getByRole('button',{name:'заметка-демо.txt',exact:true}).click();await expect(page.getByRole('dialog',{name:'заметка-демо.txt',exact:true})).toContainText('DEMO attachment');});

test('переключение ролей и прямой маршрут не показывают экономику администратору',async({page})=>{await nav(page,'Экономика').click();for(let i=0;i<6;i++)await chooseRole(page,i%2?'founder':'admin');await chooseRole(page,'admin');await expect(nav(page,'Экономика')).toHaveCount(0);await page.goto('/#/admin/economy');await expect(page.getByRole('heading',{name:'Добрый день, Мария'})).toBeVisible();await expect(page.getByText('Денежный результат',{exact:true})).toHaveCount(0);await expect(page).toHaveURL(/admin\/overview/);});

test('переходы из графиков и выгрузка содержат реальные записи модели',async({page})=>{await page.getByRole('button',{name:/Поступления, сентябрь:/}).click();await expect(page.getByRole('heading',{name:'Оплата',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Поступления',exact:true})).toHaveClass(/active/);const download=page.waitForEvent('download');await page.getByRole('button',{name:'Выгрузить CSV',exact:true}).click();const file=await download;const text=await readFile((await file.path())!,'utf8');expect(text).toContain('Перевод');await nav(page,'Обзор').click();await page.getByRole('button',{name:'Зачислены: 6',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(6);await nav(page,'Обзор').click();await page.getByRole('button',{name:'5-е классы, 26 из 28'}).click();await expect(page.getByLabel('Класс',{exact:true})).toHaveValue('5');await expect(page.locator('.pager')).toContainText('из 26');});

test('Escape закрывает форму и возвращает фокус к кнопке',async({page})=>{await card(page);const button=page.getByRole('button',{name:'Отметить оплату',exact:true}).first();await button.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(button).toBeFocused();});

test('сброс восстанавливает связанные платежи, файлы и показатели',async({page})=>{await card(page);await payment(page,'50000',true);await page.getByRole('button',{name:'Действия демо',exact:true}).click();await page.getByRole('button',{name:'Сбросить демо',exact:true}).click();const d=page.getByRole('dialog',{name:'Сбросить демонстрацию?',exact:true});await d.getByRole('button',{name:'Сбросить демо',exact:true}).click();await chooseRole(page,'founder');await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*860\s*000/);await card(page);await expect(page.getByTestId('student-paid')).toHaveText(/^0\s*₽$/);await expect(page.getByRole('button',{name:'чек-сентябрь-демо.pdf',exact:true})).toHaveCount(0);});

test('экраны читаемы на 16:10 без горизонтального переполнения страницы',async({page})=>{for(const viewport of [{width:1600,height:1000},{width:1280,height:800}]){await page.setViewportSize(viewport);for(const path of ['/#/founder/overview','/#/admin/requests','/#/admin/students?id=%D0%A3-032']){await page.goto(path);await expect(page.locator('main h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);} }await page.setViewportSize({width:1600,height:1000});await page.goto('/#/founder/overview');await page.screenshot({path:'qa/browser-founder-1600.png',fullPage:true});});


test('отказ локального хранилища не оставляет ложную оплату, повтор сохраняется один раз',async({page})=>{
  await card(page);
  await page.evaluate(`window.__flowTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=window.__flowTransaction.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>tx.abort());return tx;}`);
  await page.getByRole('button',{name:'Отметить оплату',exact:true}).first().click();
  const d=page.getByRole('dialog',{name:'Отметить оплату',exact:true});
  await d.getByRole('button',{name:'Сохранить платёж',exact:true}).click();
  await expect(d.getByRole('alert')).toContainText('Не удалось сохранить данные');
  await expect(page.getByTestId('student-paid')).toHaveText(/^0\s*₽$/);
  await expect(d.getByLabel('Сумма, ₽',{exact:true})).toHaveValue('50000');
  await page.evaluate(`IDBDatabase.prototype.transaction=window.__flowTransaction;delete window.__flowTransaction;`);
  await d.getByRole('button',{name:'Сохранить платёж',exact:true}).click();
  await expect(d).not.toBeVisible();
  await page.reload();
  await expect(page.getByTestId('student-paid')).toHaveText(/50\s*000/);
  await expect(page.locator('.student-payments .payment-row')).toHaveCount(1);
});



const csvHeader='ID платежа;ID ученика;Ученик;Период начисления;Дата оплаты;Сумма, ₽;Способ оплаты;Комментарий';
const csv=(rows:string[])=>Buffer.from('\uFEFF'+csvHeader+'\r\n'+rows.join('\r\n'),'utf8');
async function importFile(page:Page,content:Buffer){
 await nav(page,'Оплата').click();await page.getByRole('button',{name:'Загрузить CSV',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Загрузить оплаты из CSV',exact:true});
 await dialog.getByLabel('CSV с оплатами',{exact:true}).setInputFiles({name:'оплаты-демо.csv',mimeType:'text/csv',buffer:content});
 await expect(dialog.getByRole('heading',{name:'Предпросмотр',exact:true})).toBeVisible();return dialog;
}

test('CSV: шаблон содержит учеников и справочные суммы, заполненных оплат нет',async({page})=>{
 await admin(page);await nav(page,'Оплата').click();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Шаблон CSV',exact:true}).click();
 const file=await download;const content=await readFile((await file.path())!,'utf8');
 expect(content).toContain('ID платежа');expect(content).toContain('У-032');expect(content).toContain('Мария Орлова');expect(content).toContain('Осталось, ₽');
 await page.getByRole('button',{name:'Загрузить CSV',exact:true}).click();const d=page.getByRole('dialog',{name:'Загрузить оплаты из CSV',exact:true});
 await d.getByLabel('CSV с оплатами',{exact:true}).setInputFiles({name:'шаблон.csv',mimeType:'text/csv',buffer:Buffer.from(content)});
 await expect(d.getByRole('button',{name:/Добавить оплаты/})).toBeDisabled();await expect(d.getByText('Нет новых оплат.',{exact:false})).toBeVisible();
});

test('CSV: предпросмотр, связанные итоги, перезагрузка и повтор без дублей',async({page})=>{
 await admin(page);const content=csv(['demo-1;У-032;Мария Орлова;2026-09;2026-09-29;20000;Наличные;Первая часть','demo-2;У-032;Мария Орлова;2026-09;2026-09-30;30000;Перевод;Вторая часть']);
 let d=await importFile(page,content);await expect(d.getByRole('button',{name:'Добавить оплаты (2)',exact:true})).toBeEnabled();
 await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*860\s*000/);
 await page.screenshot({path:'qa/feedback-csv-preview.png',fullPage:true});
 await d.getByRole('button',{name:'Добавить оплаты (2)',exact:true}).click();await expect(d).not.toBeVisible();
 await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*910\s*000/);
 await page.reload();d=await importFile(page,content);await expect(d.getByRole('button',{name:/Добавить оплаты/})).toBeDisabled();await expect(d.getByText('Все заполненные оплаты уже есть в истории.',{exact:false})).toBeVisible();await d.getByRole('button',{name:'Отмена',exact:true}).click();
 await nav(page,'Ученики').click();await page.getByRole('button',{name:'Открыть карточку Мария Орлова',exact:true}).click();await expect(page.getByTestId('student-paid')).toHaveText(/50\s*000/);await expect(page.locator('.student-payments .payment-row')).toHaveCount(2);
 await chooseRole(page,'founder');await expect(page.getByTestId('overview-receipts')).toHaveText(/4\s*910\s*000/);
});

test('CSV: ошибка одной строки запрещает весь импорт и отмена не меняет суммы',async({page})=>{
 await admin(page);const d=await importFile(page,csv(['valid;У-032;Мария;2026-09;30.09.2026;50000;Перевод;Демо','invalid;У-несуществующий;Нет ученика;2026-09;2026-09-30;1000;Наличные;Демо']));
 await expect(d.getByText('Не найден ученик с ID',{exact:false})).toBeVisible();await expect(d.getByRole('button',{name:/Добавить оплаты/})).toBeDisabled();await d.getByRole('button',{name:'Отмена',exact:true}).click();
 await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*860\s*000/);await page.reload();await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*860\s*000/);
});

test('меню периода и роли: клавиатура, закрытие и сохранение месяца между разделами',async({page})=>{
 const period=page.getByRole('combobox',{name:'Период',exact:true});await period.click();await expect(page.getByRole('listbox',{name:'Период',exact:true})).toBeVisible();await page.screenshot({path:'qa/feedback-period-menu.png',fullPage:true});
 await period.press('Escape');await expect(page.getByRole('listbox')).toHaveCount(0);await expect(period).toBeFocused();
 await period.click();await page.getByRole('option').filter({hasText:'ноябрь 2026'}).click();await nav(page,'Оплата').click();await expect(period).toHaveText(/ноябрь 2026/i);
 await page.getByRole('combobox',{name:'Роль',exact:true}).click();await page.screenshot({path:'qa/feedback-role-menu.png',fullPage:true});await page.getByRole('option').filter({hasText:'Мария · Администратор'}).click();await nav(page,'Оплата').click();await expect(period).toHaveText(/ноябрь 2026/i);
 await page.reload();await expect(period).toHaveText(/ноябрь 2026/i);await chooseRole(page,'founder');await nav(page,'Экономика').click();await expect(period).toHaveText(/ноябрь 2026/i);
 await period.press('Enter');await period.press('Home');await period.press('ArrowDown');await period.press('ArrowDown');await period.press('Enter');await expect(period).toHaveText(/сентябрь 2026/i);await expect(page.locator('.economics-metrics')).toContainText(/4\s*860\s*000/);
});

test('Club: программа только для просмотра, рабочие поля доступны',async({page})=>{
 await admin(page);await expect(page.locator('.request-editor').getByLabel('Программа',{exact:true})).toHaveAttribute('readonly','');
 await page.locator('.request-editor').getByLabel('Комментарий',{exact:true}).fill('Комментарий доступен');await page.locator('.request-editor').getByRole('button',{name:'Сохранить изменения',exact:true}).click();await page.reload();await expect(page.locator('.request-editor').getByLabel('Программа',{exact:true})).toHaveValue('Робототехника');
 await nav(page,'Обзор').click();await expect(page.getByText('Всё связано',{exact:true})).toBeVisible();await page.screenshot({path:'qa/feedback-admin-home.png',fullPage:true});
});

test('CSV: сбой записи не сохраняет часть пакета, повтор добавляет весь пакет один раз',async({page})=>{
 await admin(page);const content=csv(['atomic-1;У-032;Мария;2026-09;2026-09-29;20000;Наличные;Часть 1','atomic-2;У-032;Мария;2026-09;2026-09-30;30000;Перевод;Часть 2']);const d=await importFile(page,content);
 await page.evaluate(`window.__flowTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=window.__flowTransaction.apply(this,args);if(args[1]==='readwrite')queueMicrotask(()=>tx.abort());return tx;}`);
 await d.getByRole('button',{name:'Добавить оплаты (2)',exact:true}).click();await expect(d.getByRole('alert')).toContainText('Не удалось сохранить данные');await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*860\s*000/);
 await page.evaluate(`IDBDatabase.prototype.transaction=window.__flowTransaction;delete window.__flowTransaction;`);
 await d.getByRole('button',{name:'Добавить оплаты (2)',exact:true}).click();await expect(d).not.toBeVisible();await page.reload();await expect(page.locator('.finance-summary>div').nth(2)).toContainText(/4\s*910\s*000/);
 const again=await importFile(page,content);await expect(again.getByRole('button',{name:/Добавить оплаты/})).toBeDisabled();
});
