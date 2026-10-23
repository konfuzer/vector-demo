import type {Program,Group,State} from './domain';

export const CATALOGUE_REVISION=1;
export const catalogueNote='В каталоге — программы с официального сайта и демонстрационные примеры. Цены, расписание и места — демонстрационные';
export const groupConditionsNote='Условия группы демонстрационные';
export const academies:Program[]=[
 {id:'leadership',name:'Академия лидерства',category:'Коммуникация',minAge:12,maxAge:18,description:'Командные задачи и деловые игры: участники обсуждают общие цели, роли в команде и разные подходы к лидерству.',activities:['Разберём личные и общие цели','Попробуем разные роли в команде','Обсудим взаимовыгодное сотрудничество'],image:'leadership.png',light:true,sourceUrl:'https://www.academyvrn.ru/leader'},
 {id:'negotiation',name:'Академия переговоров',category:'Коммуникация',minAge:12,maxAge:18,description:'Знакомство с этапами переговоров и способами разбора конфликтов. Практика общения в деловых играх и переговорных поединках.',activities:['Разберём причины конфликтов','Подготовим аргументы для переговоров','Попрактикуемся в деловых поединках'],image:'negotiation.png',sourceUrl:'https://www.academyvrn.ru/peregovory'},
 {id:'creative',name:'Академия креативного мышления',category:'Творчество',minAge:12,maxAge:18,description:'Практика поиска и развития идей через ассоциации, сочинение историй и знакомство с методами решения изобретательских задач.',activities:['Придумаем истории через ассоциации','Познакомимся с приёмами ТРИЗ','Разовьём идею в замысел проекта'],image:'creative.png',light:true,sourceUrl:'https://www.academyvrn.ru/creative'},
 {id:'critical',name:'Академия критического мышления',category:'Мышление',minAge:12,maxAge:18,description:'Разбор информации, аргументов и источников. На примерах обсуждаются логические ошибки, когнитивные искажения и проверка фактов.',activities:['Сопоставим аргументы и доказательства','Проверим факты и источники','Разберём ошибки в рассуждениях'],image:'critical.png',sourceUrl:'https://www.academyvrn.ru/critical'}
];
export const academyGroups:Group[]=academies.map((p,i)=>({id:'g-'+p.id,programId:p.id,day:[2,4,6,7][i],time:['17:00','18:00','12:00','11:00'][i],minutes:90,capacity:10,price:[480000,500000,460000,440000][i]}));
const legacyIds=new Set(['theatre','chess','english','photo']);
export const publicPrograms=(state:State)=>state.programs.filter(p=>!p.archived).slice(0,7);
export const programOrigin=(p:Program)=>p.archived?'Архив прежнего каталога':p.sourceUrl?(p.contentEdited?'Официальная программа · текст изменён в демо':'Программа с официального сайта'):'Демонстрационная программа';

// New entities get new IDs: historical chess bookings must never become academy bookings.
export function migrateCatalogue(state:State,fromSaved=false):State{
 if(state.catalogueRevision===CATALOGUE_REVISION)return state;
 const next=structuredClone(state);
 const originalOrder=next.programs.map(p=>p.id);
 const existing=next.programs.map(p=>legacyIds.has(p.id)?{...p,archived:true}:p);
 const official=academies.map(p=>{
  const known=existing.find(x=>x.id===p.id&&x.sourceUrl===p.sourceUrl);
  if(known)return known;
  let id=p.id;while(existing.some(x=>x.id===id))id='academy-'+id;
  return {...structuredClone(p),id};
 });
 const promoted=['robotics','design','science'].flatMap(id=>existing.filter(p=>p.id===id));
 const firstIds=new Set([...promoted,...official].map(p=>p.id));
 next.programs=[...promoted,...official,...existing.filter(p=>!firstIds.has(p.id))];
 official.forEach((p,i)=>{
  if(next.groups.some(g=>g.programId===p.id))return;
  let id='g-'+p.id;while(next.groups.some(g=>g.id===id))id='academy-'+id;
  next.groups.push({...academyGroups[i],id,programId:p.id});
 });
 next.catalogueRevision=CATALOGUE_REVISION;
 if(fromSaved){next.previousCatalogueOrder=originalOrder;next.catalogueMigrationNotice='Каталог обновлён: на главной семь карточек. Прежние программы и ваши правки сохранены в редакторе, старые обращения, брони и оплаты — со своими программами. Четыре заменённых направления перенесены в архив. Дополнительные программы доступны в редакторе. Перед сохранением обновления создаётся резервная копия исходного набора в этом браузере.';}
 return next;
}
