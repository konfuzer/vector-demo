import {migrateCatalogue} from './catalogue';
export type Category = 'Технологии'|'Творчество'|'Наука'|'Языки'|'Мышление'|'Коммуникация';
export interface Program {id:string;name:string;category:Category;minAge:number;maxAge:number;description:string;activities:string[];image:string;light?:boolean;cardHeading?:string;sourceUrl?:string;contentEdited?:boolean;archived?:boolean;}
export interface Group {id:string;programId:string;day:number;time:string;minutes:number;capacity:number;price:number;}
export type Stage='new'|'working'|'proposed'|'chosen'|'reserved'|'paid'|'closed';
export type ContactChannel='telegram'|'max'|'phone'|'email';
export const contactNames:Record<ContactChannel,string>={telegram:'Telegram',max:'MAX',phone:'Телефон',email:'Email'};
export interface Request {id:string;submissionId:string;kind:'selection'|'group';source:string;parent:string;contact:string;contactChannel?:ContactChannel;callRequested?:boolean;age:number;interests:string[];days:number[];comment:string;groupId:string|null;proposed:string[];stage:Stage;createdAt:string;reason?:string;}
export interface Enrollment {id:string;requestId:string;groupId:string;status:'reserved'|'paid'|'cancelled';price:number;}
export interface Payment {id:string;enrollmentId:string;amount:number;date:string;}
export interface Event {id:string;requestId:string;date:string;text:string;}
export interface OpeningDay {day:number;open:boolean;from:string;to:string;}
export interface State {version:2;catalogueRevision?:number;previousCatalogueOrder?:string[];catalogueMigrationNotice?:string;programs:Program[];groups:Group[];requests:Request[];enrollments:Enrollment[];payments:Payment[];events:Event[];openingHours:OpeningDay[];}
export const defaultOpeningHours=():OpeningDay[]=>Array.from({length:7},(_,i)=>({day:i+1,open:i!==0,from:'09:00',to:'20:00'}));
export const programImage=(program:Program)=>program.image.startsWith('data:image/')?program.image:'/media/'+program.image;
export const STORAGE_KEY='vector-club-demo:v1';
export const days=['','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
export const shortDays=['','Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
export const stageNames:Record<Stage,string>={new:'Новая',working:'В работе',proposed:'Предложены варианты',chosen:'Группа выбрана',reserved:'Бронь',paid:'Оплачено',closed:'Закрыто'};
export const money=(kopecks:number)=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(kopecks/100)+' ₽';
export function occupancy(state:State,groupId:string){const g=state.groups.find(x=>x.id===groupId);if(!g)throw Error('Группа не найдена');const all=state.enrollments.filter(x=>x.groupId===groupId);const paid=all.filter(x=>x.status==='paid').length;const reserved=all.filter(x=>x.status==='reserved').length;return{paid,reserved,free:g.capacity-paid-reserved,capacity:g.capacity};}
export function receipts(state:State,month:string){return state.payments.filter(x=>x.date.startsWith(month)).reduce((sum,x)=>sum+x.amount,0);}
export function activeEnrollment(state:State,requestId:string){return state.enrollments.find(x=>x.requestId===requestId&&x.status!=='cancelled');}
export function seedState():State{
 const programs:Program[]=[
 {id:'robotics',name:'Робототехника',category:'Технологии',minAge:8,maxAge:12,description:'Собираем механизмы, знакомимся с датчиками и учимся управлять движением. Начать можно без опыта.',activities:['Соберём простые механизмы','Разберёмся с датчиками','Запрограммируем движение'],image:'robotics.webp'},
 {id:'design',name:'Дизайн и анимация',category:'Творчество',minAge:10,maxAge:14,description:'Превращаем идеи в изображения и короткие анимации. Исследуем цвет, композицию и движение.',activities:['Создадим свою композицию','Разработаем персонажа','Оживим историю в анимации'],image:'design.webp',light:true},
 {id:'science',name:'Научная мастерская',category:'Наука',minAge:7,maxAge:10,description:'Исследуем привычные вещи с помощью опытов, задаём вопросы и проверяем свои предположения.',activities:['Проведём простые опыты','Посмотрим в микроскоп','Соберём оптическую модель'],image:'science.webp'},
 {id:'theatre',name:'Театральная студия',category:'Творчество',minAge:8,maxAge:13,description:'Пробуем сценические этюды, работаем с голосом и придумываем небольшие истории вместе.',activities:['Попробуем сценические этюды','Поработаем с голосом','Придумаем короткую постановку'],image:'theatre.webp',light:true},
 {id:'chess',name:'Шахматная лаборатория',category:'Мышление',minAge:7,maxAge:12,description:'Разбираем позиции, замечаем возможности и учимся объяснять свои решения за шахматной доской.',activities:['Научимся читать позиции','Решим тактические задачи','Сыграем учебные партии'],image:'chess.webp'},
 {id:'english',name:'Английский через истории',category:'Языки',minAge:8,maxAge:12,description:'Обсуждаем знакомые сюжеты и разыгрываем диалоги на английском в небольшой группе.',activities:['Прочитаем короткую историю','Разыграем диалоги','Придумаем своё продолжение'],image:'english.webp',light:true},
 {id:'photo',name:'Фотография и свет',category:'Творчество',minAge:11,maxAge:16,description:'Изучаем свет и ракурс, собираем визуальную историю и обсуждаем свои кадры.',activities:['Поймаем естественный свет','Попробуем разные ракурсы','Соберём небольшую серию'],image:'photo.webp'}];
 const groups:Group[]=[{id:'g-robotics',programId:'robotics',day:2,time:'17:00',minutes:60,capacity:12,price:480000},{id:'g-design',programId:'design',day:6,time:'12:00',minutes:60,capacity:10,price:520000},{id:'g-science',programId:'science',day:4,time:'16:00',minutes:60,capacity:10,price:440000},{id:'g-theatre',programId:'theatre',day:3,time:'17:30',minutes:75,capacity:8,price:460000},{id:'g-chess',programId:'chess',day:6,time:'11:00',minutes:60,capacity:6,price:360000},{id:'g-english',programId:'english',day:1,time:'17:00',minutes:60,capacity:8,price:500000},{id:'g-photo',programId:'photo',day:5,time:'17:30',minutes:90,capacity:6,price:560000}];
 const state:State={version:2,programs,groups,requests:[],enrollments:[],payments:[],events:[],openingHours:defaultOpeningHours()};let n=0;
 for(const [groupId,paid,reserved] of [['g-robotics',7,2],['g-design',6,1],['g-science',8,2],['g-chess',5,0]] as const){
  const group=groups.find(g=>g.id===groupId)!;const p=programs.find(p=>p.id===group.programId)!;
  for(let j=0;j<paid+reserved;j++){n++;const id=`C-${String(n).padStart(3,'0')}`;const e:Enrollment={id:`en-${n}`,requestId:id,groupId,status:j<paid?'paid':'reserved',price:group.price};state.requests.push({id,submissionId:`seed-${n}`,kind:'group',source:'Каталог',parent:`Семья ${String(n).padStart(3,'0')}`,contact:`family${n}@example.test`,age:Math.min(p.minAge+1,p.maxAge),interests:[p.category],days:[group.day],comment:'Демонстрационное обращение',groupId,proposed:[],stage:e.status==='paid'?'paid':'reserved',createdAt:'2026-10-12T10:00:00.000Z'});state.enrollments.push(e);if(e.status==='paid')state.payments.push({id:`pay-${n}`,enrollmentId:e.id,amount:e.price,date:'2026-10-13T10:00:00.000Z'});}
 }
 state.requests.unshift({id:'C-032',submissionId:'seed-selection',kind:'selection',source:'Форма подбора',parent:'Семья 032',contact:'parent@example.test',age:9,interests:['Конструирование','Опыты'],days:[2,4],comment:'Хотим попробовать занятие для начинающих.',groupId:null,proposed:[],stage:'new',createdAt:'2026-10-23T10:00:00.000Z'},{id:'C-033',submissionId:'seed-direct',kind:'group',source:'Каталог',parent:'Семья 033',contact:'parent033@example.test',age:9,interests:[],days:[2],comment:'Первое знакомство с робототехникой.',groupId:'g-robotics',proposed:[],stage:'new',createdAt:'2026-10-23T09:00:00.000Z'});
 return migrateCatalogue(state);
}
export interface RequestInput {submissionId:string;kind:'selection'|'group';source:string;parent:string;contact:string;contactChannel?:ContactChannel;callRequested?:boolean;age:number;interests:string[];days:number[];comment:string;groupId:string|null;}
export type Command = {type:'create';input:RequestInput}|{type:'contact';id:string}|{type:'propose';id:string;groups:string[]}|{type:'choose';id:string;groupId:string}|{type:'reserve';id:string}|{type:'pay';id:string}|{type:'cancel';id:string}|{type:'close';id:string;reason:string}|{type:'updateGroup';id:string;capacity:number;price:number;day?:number;time?:string;minutes?:number}|{type:'updateProgram';id:string;description:string}|{type:'saveProgram';program:Program;groups:Group[]}|{type:'moveProgram';id:string;position:number}|{type:'openingHours';hours:OpeningDay[]}|{type:'reset'};
export class DomainError extends Error{}
function fail(message:string):never{throw new DomainError(message);}
const validTime=(time:string)=>/^([01]\d|2[0-3]):[0-5]\d$/.test(time);
function checkGroup(g:Group){if(!Number.isInteger(g.day)||g.day<1||g.day>7||!validTime(g.time))fail('Проверьте день и время группы');if(!Number.isInteger(g.minutes)||g.minutes<15||g.minutes>240)fail('Продолжительность — от 15 до 240 минут');if(!Number.isInteger(g.capacity)||g.capacity<1||g.capacity>100)fail('Количество мест — от 1 до 100');if(!Number.isInteger(g.price)||g.price<100)fail('Укажите положительную стоимость');}
function checkHours(hours:OpeningDay[]){if(hours.length!==7||new Set(hours.map(h=>h.day)).size!==7||hours.some(h=>h.day<1||h.day>7||!Number.isInteger(h.day)||typeof h.open!=='boolean'||!validTime(h.from)||!validTime(h.to)||h.open&&h.from>=h.to))fail('Проверьте рабочие дни и время: окончание должно быть позже начала');}
export function applyCommand(previous:State,cmd:Command,now=new Date().toISOString()):{state:State;id?:string;unchanged?:boolean}{
 if(cmd.type==='reset')return{state:seedState()};
 const s=structuredClone(previous);const event=(id:string,text:string)=>s.events.push({id:crypto.randomUUID(),requestId:id,date:now,text});
 const compatible=(groupId:string,age:number)=>{const g=s.groups.find(x=>x.id===groupId)??fail('Группа не найдена');const p=s.programs.find(x=>x.id===g.programId)!;if(age<p.minAge||age>p.maxAge)fail(`Группа рассчитана на возраст ${p.minAge}–${p.maxAge} лет`);return g;};
 if(cmd.type==='create'){
  const existing=s.requests.find(x=>x.submissionId===cmd.input.submissionId);if(existing)return{state:previous,id:existing.id,unchanged:true};
  const input=cmd.input;if(!input.parent.trim()||!input.contact.trim())fail('Укажите имя родителя и контакт для ответа');
  const channel=input.contactChannel||'email',contact=input.contact.trim();const phone=/^\+?[\d\s()\-]+$/.test(contact)&&contact.replace(/\D/g,'').length>=10&&contact.replace(/\D/g,'').length<=15;
  if(!contactNames[channel])fail('Выберите способ связи');
  if(channel==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))fail('Проверьте адрес электронной почты');
  if(channel==='telegram'&&!phone&&!/^@[A-Za-z0-9_]{5,32}$/.test(contact)&&!/^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/.test(contact))fail('Укажите Telegram @username или номер телефона');
  if((channel==='max'||channel==='phone')&&!phone)fail('Укажите номер телефона: от 10 до 15 цифр');
  if(channel==='phone'&&!input.callRequested)fail('Подтвердите «Позвоните мне» или выберите другой способ связи');
  if(!Number.isInteger(input.age)||input.age<5||input.age>18)fail('Укажите возраст от 5 до 18 лет');
  if(input.kind==='group'){if(!input.groupId)fail('Выберите группу');const selectedGroup=compatible(input.groupId,input.age);if(s.programs.find(p=>p.id===selectedGroup.programId)?.archived)fail('Программа в архиве: выберите программу из нового каталога');if(occupancy(s,input.groupId).free<1)fail('В группе больше нет свободных мест. Можно оставить обращение на подбор.');}
  const next=Math.max(33,...s.requests.map(r=>Number(r.id.slice(2))||0))+1;const id=`C-${String(next).padStart(3,'0')}`;
  s.requests.unshift({...input,parent:input.parent.trim(),contact:input.contact.trim(),groupId:input.kind==='group'?input.groupId:null,id,stage:'new',proposed:[],createdAt:now});event(id,'Заявка получена. Место не забронировано.');return{state:s,id};
 }
 if(cmd.type==='openingHours'){checkHours(cmd.hours);s.openingHours=structuredClone(cmd.hours).sort((a,b)=>a.day-b.day);return{state:s};}
 if(cmd.type==='moveProgram'){const index=s.programs.findIndex(p=>p.id===cmd.id);if(index<0)fail('Программа не найдена');if(!Number.isInteger(cmd.position)||cmd.position<0||cmd.position>=s.programs.length)fail('Позиция программы не найдена');const [program]=s.programs.splice(index,1);s.programs.splice(cmd.position,0,program);return{state:s};}
 if(cmd.type==='saveProgram'){
  const p=structuredClone(cmd.program);p.name=p.name.trim();p.description=p.description.trim();p.activities=p.activities.map(a=>a.trim());p.cardHeading=(p.cardHeading||p.name).trim();
  if(!p.id||p.name.length<3||p.name.length>80)fail('Название программы — от 3 до 80 символов');
  if(!['Технологии','Творчество','Наука','Языки','Мышление','Коммуникация'].includes(p.category))fail('Выберите категорию программы');
  if(!Number.isInteger(p.minAge)||!Number.isInteger(p.maxAge)||p.minAge<5||p.maxAge>18||p.minAge>p.maxAge)fail('Проверьте возраст: от 5 до 18 лет, начало не позже окончания');
  if(p.description.length<20)fail('Добавьте описание не короче 20 символов');
  if(!p.activities.length||p.activities.length>6||p.activities.some(a=>a.length<3||a.length>120))fail('Добавьте от 1 до 6 пунктов «Чем займёмся», от 3 до 120 символов');
  if(!p.image||(!/^[a-zA-Z0-9_-]+\.(webp|png|jpg|jpeg)$/.test(p.image)&&!/^data:image\/(png|jpeg|webp);base64,/.test(p.image)))fail('Выберите обложку программы');
  if(p.image.length>900000)fail('Обложка слишком большая. Выберите другое изображение');
  if(p.cardHeading.length>120||p.cardHeading.split('\n').length>3)fail('Заголовок карточки — не более 120 символов и трёх строк');
  if(!cmd.groups.length||new Set(cmd.groups.map(g=>g.id)).size!==cmd.groups.length)fail('Нужна хотя бы одна группа, без повторов');
  const previousGroups=s.groups.filter(g=>g.programId===p.id);
  for(const g of cmd.groups){checkGroup(g);if(!g.id||g.programId!==p.id||s.groups.some(old=>old.id===g.id&&old.programId!==p.id))fail('Некорректная принадлежность группы');if(s.groups.some(old=>old.id===g.id)){const o=occupancy(s,g.id);if(g.capacity<o.paid+o.reserved)fail('Ёмкость не может быть меньше числа занятых мест');}}
  for(const old of previousGroups){if(!cmd.groups.some(g=>g.id===old.id)&&(s.requests.some(r=>r.groupId===old.id||r.proposed.includes(old.id))||s.enrollments.some(e=>e.groupId===old.id)))fail('Группу с обращениями или записями нельзя удалить');}
  if(s.requests.some(r=>r.stage!=='closed'&&previousGroups.some(g=>g.id===r.groupId)&&(r.age<p.minAge||r.age>p.maxAge)))fail('Новый возраст исключает ребёнка из действующего обращения этой программы');
  const oldProgram=s.programs.find(old=>old.id===p.id);
  if(oldProgram?.sourceUrl){p.sourceUrl=oldProgram.sourceUrl;p.contentEdited=oldProgram.contentEdited||(['name','description','activities','minAge','maxAge'] as const).some(key=>JSON.stringify(p[key])!==JSON.stringify(oldProgram[key]));}
  const index=s.programs.findIndex(old=>old.id===p.id);if(index<0)s.programs.push(p);else s.programs[index]=p;
  const existingIds=new Set(s.groups.map(g=>g.id));const updates=structuredClone(cmd.groups);s.groups=s.groups.flatMap(g=>g.programId!==p.id?[g]:updates.filter(next=>next.id===g.id)).concat(updates.filter(g=>!existingIds.has(g.id)));return{state:s,id:p.id};
 }
 if(cmd.type==='updateProgram'){const p=s.programs.find(x=>x.id===cmd.id)??fail('Программа не найдена');if(cmd.description.trim().length<20)fail('Добавьте описание не короче 20 символов');p.description=cmd.description.trim();return{state:s};}
 if(cmd.type==='updateGroup'){const g=s.groups.find(x=>x.id===cmd.id)??fail('Группа не найдена');const o=occupancy(s,g.id);if(!Number.isInteger(cmd.capacity)||cmd.capacity<o.paid+o.reserved||cmd.capacity<1)fail('Ёмкость не может быть меньше числа занятых мест');const updated={...g,capacity:cmd.capacity,price:cmd.price,day:cmd.day??g.day,time:cmd.time??g.time,minutes:cmd.minutes??g.minutes};checkGroup(updated);Object.assign(g,updated);return{state:s};}
 const r=s.requests.find(x=>x.id===cmd.id)??fail('Обращение не найдено');const enrollment=activeEnrollment(s,r.id);
 if(cmd.type==='contact'){if(r.stage==='closed'||r.stage==='paid')fail('Это обращение уже завершено');if(r.stage==='new')r.stage='working';event(r.id,'Администратор отметил контакт с родителем (демонстрация).');}
 if(cmd.type==='propose'){
  if(enrollment||r.stage==='closed')fail('Сначала завершите действующую бронь');const ids=[...new Set(cmd.groups)];if(!ids.length)fail('Выберите хотя бы одну группу');ids.forEach(id=>{const offeredGroup=compatible(id,r.age);if(s.programs.find(p=>p.id===offeredGroup.programId)?.archived)fail('Архивную программу нельзя предложить для новой записи');if(occupancy(s,id).free<1)fail('Нельзя предложить заполненную группу');});r.proposed=ids;r.groupId=null;r.stage='proposed';event(r.id,'Предложены варианты. Сообщения не отправлялись.');
 }
 if(cmd.type==='choose'){
  if(enrollment||r.stage==='closed')fail('Нельзя изменить действующую запись');if(!r.proposed.includes(cmd.groupId))fail('Выберите один из предложенных вариантов');compatible(cmd.groupId,r.age);if(occupancy(s,cmd.groupId).free<1)fail('Места в этой группе закончились. Уточните другой вариант.');r.groupId=cmd.groupId;r.stage='chosen';event(r.id,'Родитель выбрал предложенную группу. Место ещё не забронировано.');
 }
 if(cmd.type==='reserve'){
  if(enrollment)return{state:previous,unchanged:true};if(r.stage==='closed')fail('Обращение закрыто');if(!r.groupId)fail('Сначала родитель должен выбрать группу');const g=compatible(r.groupId,r.age);if(occupancy(s,g.id).free<1)fail('Свободных мест больше нет. Предложите другую группу.');s.enrollments.push({id:crypto.randomUUID(),requestId:r.id,groupId:g.id,status:'reserved',price:g.price});r.stage='reserved';event(r.id,'Место забронировано администратором.');
 }
 if(cmd.type==='pay'){
  if(!enrollment)fail('Сначала оформите бронь');if(enrollment.status==='paid')return{state:previous,unchanged:true};enrollment.status='paid';r.stage='paid';s.payments.push({id:crypto.randomUUID(),enrollmentId:enrollment.id,amount:enrollment.price,date:now});event(r.id,'Отмечена демонстрационная оплата. Настоящего платежа нет.');
 }
 if(cmd.type==='cancel'){
  if(!enrollment)return{state:previous,unchanged:true};if(enrollment.status==='paid')fail('Оплаченную запись нельзя отменить как неоплаченную бронь');enrollment.status='cancelled';r.stage='working';event(r.id,'Неоплаченная бронь отменена. Место освобождено.');
 }
 if(cmd.type==='close'){
  if(enrollment)fail('Сначала отмените неоплаченную бронь. Оплаченную запись закрыть нельзя.');if(!cmd.reason.trim())fail('Укажите причину закрытия');r.reason=cmd.reason.trim();r.stage='closed';event(r.id,`Обращение закрыто: ${r.reason}`);
 }
 return{state:s,id:r.id};
}
export function validState(value:unknown):value is State{
 try{const s=value as State;if(s.version!==2||![s.programs,s.groups,s.requests,s.enrollments,s.payments,s.events,s.openingHours].every(Array.isArray))return false;
 checkHours(s.openingHours);
 if(!s.programs.length||s.programs.some(p=>typeof p.name!=='string'||typeof p.description!=='string'||!Array.isArray(p.activities)||p.activities.some(a=>typeof a!=='string')||typeof p.image!=='string'||!Number.isInteger(p.minAge)||!Number.isInteger(p.maxAge)))return false;
 if(new Set(s.programs.map(p=>p.id)).size!==s.programs.length||new Set(s.groups.map(g=>g.id)).size!==s.groups.length)return false;
 s.groups.forEach(checkGroup);
 const ids=new Set(s.requests.map(x=>x.id));if(ids.size!==s.requests.length)return false;
 if(s.groups.some(g=>!Number.isInteger(g.capacity)||g.capacity<1||!Number.isInteger(g.price)||g.price<100||!s.programs.some(p=>p.id===g.programId)))return false;
 if(s.enrollments.some(e=>!ids.has(e.requestId)||!s.groups.some(g=>g.id===e.groupId)||!['reserved','paid','cancelled'].includes(e.status)))return false;
 if(s.groups.some(g=>occupancy(s,g.id).free<0))return false;
 const active=s.enrollments.filter(e=>e.status!=='cancelled');if(new Set(active.map(e=>e.requestId)).size!==active.length)return false;
 if(s.payments.some(p=>!s.enrollments.some(e=>e.id===p.enrollmentId&&e.status==='paid')||!Number.isInteger(p.amount)||p.amount<0||!Number.isFinite(Date.parse(p.date))))return false;
 if(new Set(s.payments.map(p=>p.enrollmentId)).size!==s.payments.length)return false;
 if(s.requests.some(r=>!stageNames[r.stage]||!Array.isArray(r.days)||!Array.isArray(r.interests)||!Array.isArray(r.proposed)||typeof r.age!=='number'||(r.groupId!==null&&!s.groups.some(g=>g.id===r.groupId))))return false;
 return true;}catch{return false;}
}
export function hydrateState(value:unknown):State|null{
 try{if(!value||typeof value!=='object')return null;const saved=structuredClone(value) as {version?:number;openingHours?:OpeningDay[]};if(saved.version!==1&&saved.version!==2)return null;const migrated={...saved,version:2,openingHours:saved.openingHours||defaultOpeningHours()};return validState(migrated)?migrateCatalogue(migrated,true):null;}catch{return null;}
}
