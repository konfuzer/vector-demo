import { addPayment, DomainError, parseAmount } from './domain';
import type { Role, State } from './model';

export const paymentHeaders=['ID платежа','ID ученика','Ученик','Период начисления','Дата оплаты','Сумма, ₽','Способ оплаты','Комментарий'];
const normalize=(value:string)=>value.trim().toLocaleLowerCase('ru');
export function parseCsv(text:string):string[][]{
  const source=text.replace(/^\uFEFF/,'');
  const first=source.split(/\r?\n/,1)[0];
  let quoted=false,semicolons=0,commas=0;
  for(let i=0;i<first.length;i++){if(first[i]==='"')quoted=!quoted;else if(!quoted){if(first[i]===';')semicolons++;if(first[i]===',')commas++;}}
  const separator=semicolons>=commas?';':',';
  const rows:string[][]=[];let row:string[]=[],cell='',inside=false,closed=false;
  for(let i=0;i<source.length;i++){
    const char=source[i];
    if(inside){if(char==='"'){if(source[i+1]==='"'){cell+='"';i++;}else{inside=false;closed=true;}}else cell+=char;continue;}
    if(char===separator){row.push(cell);cell='';closed=false;continue;}
    if(char==='\n'||char==='\r'){if(char==='\r'&&source[i+1]==='\n')i++;row.push(cell);if(row.some(c=>c.trim()))rows.push(row);row=[];cell='';closed=false;continue;}
    if(char==='"'){if(cell.trim()||closed)throw new DomainError('Некорректные кавычки в CSV. Сохраните файл по шаблону.');cell='';inside=true;continue;}
    if(closed&&char.trim())throw new DomainError('После закрывающей кавычки ожидается разделитель CSV.');
    if(!closed)cell+=char;
  }
  if(inside)throw new DomainError('В CSV не закрыта кавычка.');
  row.push(cell);if(row.some(c=>c.trim()))rows.push(row);
  if(rows.length>2001)throw new DomainError('В одном файле допускается до 2000 строк оплат.');
  return rows;
}
export interface ImportRow { line:number; student:string; studentId:string; period:string; date:string; amount:number; method:string; comment:string; id:string; fingerprint:string; status:'ready'|'duplicate'|'empty'|'error'; message:string }
export interface ImportPreview { rows:ImportRow[]; ready:number; duplicates:number; empty:number; errors:number; total:number }
function dateValue(raw:string){const text=raw.trim();const match=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text);const result=match?`${match[3]}-${match[2]}-${match[1]}`:text;const date=new Date(result+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(result)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==result)throw new DomainError('Некорректная дата оплаты. Используйте ГГГГ-ММ-ДД или ДД.ММ.ГГГГ.');return result;}
export function previewPayments(state:State,text:string):ImportPreview{
  const [headers,...data]=parseCsv(text);if(!headers)throw new DomainError('CSV пуст. Скачайте шаблон для заполнения.');
  const keys=headers.map(normalize);if(new Set(keys).size!==keys.length)throw new DomainError('В CSV повторяются названия столбцов.');
  for(const header of paymentHeaders.filter(h=>h!=='Ученик'&&h!=='Комментарий'))if(!keys.includes(normalize(header)))throw new DomainError(`Нет столбца «${header}». Используйте шаблон оплат.`);
  const seenIds=new Map<string,string>(),seenFingerprints=new Set<string>();
  const rows=data.map((cells,index):ImportRow=>{
    const get=(label:string)=>cells[keys.indexOf(normalize(label))]?.trim()||'';
    const item:ImportRow={line:index+2,student:get('Ученик'),studentId:get('ID ученика'),period:get('Период начисления'),date:get('Дата оплаты'),amount:0,method:get('Способ оплаты'),comment:get('Комментарий'),id:get('ID платежа'),fingerprint:'',status:'ready',message:'Будет добавлен'};
    if(!get('Сумма, ₽'))return {...item,status:'empty',message:'Сумма не заполнена — пропустим'};
    try{
      if(cells.length>headers.length)throw new DomainError('Лишние столбцы: проверьте разделитель и кавычки.');
      if(!item.id||item.id.length>120)throw new DomainError('Заполните ID платежа (до 120 символов).');
      item.id='csv:'+item.id;
      const student=state.students.find(s=>s.id===item.studentId);if(!student)throw new DomainError(`Не найден ученик с ID «${item.studentId}».`);item.student=student.name;
      const period=/^(\d{2})\.(\d{4})$/.exec(item.period);if(period)item.period=`${period[2]}-${period[1]}`;
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(item.period))throw new DomainError('Некорректный период начисления. Используйте ГГГГ-ММ.');
      if(!state.charges.some(c=>c.studentId===item.studentId&&c.period===item.period))throw new DomainError('За этот период нет начисления. Сначала добавьте его в карточке ученика.');
      item.date=dateValue(item.date);item.amount=parseAmount(get('Сумма, ₽'));
      const method=normalize(item.method);if(!['перевод','наличные','transfer','cash'].includes(method))throw new DomainError('Способ оплаты: «Перевод» или «Наличные».');item.method=method==='cash'||method==='наличные'?'cash':'transfer';
      item.fingerprint=JSON.stringify([item.studentId,item.period,item.date,item.amount,item.method,item.comment]);
      const previous=state.payments.find(p=>p.id===item.id);
      if(previous&&previous.importFingerprint!==item.fingerprint)throw new DomainError('Этот ID уже принадлежит другому платежу. Проверьте данные.');
      if(seenIds.has(item.id)&&seenIds.get(item.id)!==item.fingerprint)throw new DomainError('В файле один ID используется для разных платежей.');
      const same=state.payments.find(p=>p.importFingerprint===item.fingerprint||(!p.voided&&p.studentId===item.studentId&&p.amount===item.amount&&p.date===item.date&&p.method===item.method&&p.allocations.some(a=>state.charges.find(c=>c.id===a.chargeId)?.period===item.period)));
      if(previous||same||seenFingerprints.has(item.fingerprint)){item.status='duplicate';item.message=previous?.voided||same?.voided?'Есть в истории, аннулирован — пропустим':'Такая оплата уже есть — пропустим';}
      seenIds.set(item.id,item.fingerprint);seenFingerprints.add(item.fingerprint);
    }catch(error){item.status='error';item.message=(error as Error).message;}
    return item;
  });
  return {rows,ready:rows.filter(r=>r.status==='ready').length,duplicates:rows.filter(r=>r.status==='duplicate').length,empty:rows.filter(r=>r.status==='empty').length,errors:rows.filter(r=>r.status==='error').length,total:rows.filter(r=>r.status==='ready').reduce((n,r)=>n+r.amount,0)};
}
export function importPayments(state:State,role:Role,text:string):State{
  if(role!=='admin')throw new DomainError('Загружать оплаты может администратор.');
  const preview=previewPayments(state,text);if(preview.errors)throw new DomainError('В файле есть ошибки. Исправьте их и загрузите CSV снова. Ни один платёж не добавлен.');
  let next=state;
  for(const row of preview.rows.filter(r=>r.status==='ready')){
    const charge=next.charges.find(c=>c.studentId===row.studentId&&c.period===row.period)!;
    next=addPayment(next,role,{id:row.id,studentId:row.studentId,chargeId:charge.id,date:row.date,amount:row.amount,method:row.method,comment:row.comment});
    next={...next,payments:next.payments.map(p=>p.id===row.id?{...p,importFingerprint:row.fingerprint,importPeriod:row.period}:p)};
  }
  return next;
}
export function templateRows(state:State,period:string):(string|number)[][]{
  const [year,month]=period.split('-').map(Number),date=`${period}-${new Date(year,month,0).getDate()}`;
  return [[...paymentHeaders,'Начислено, ₽','Оплачено, ₽','Осталось, ₽'],...state.students.filter(s=>s.active).map(student=>{
    const charge=state.charges.find(c=>c.studentId===student.id&&c.period===period);
    const paid=charge?state.payments.filter(p=>!p.voided).flatMap(p=>p.allocations).filter(a=>a.chargeId===charge.id).reduce((n,a)=>n+a.amount,0):0;
    const last=state.payments.findLast(p=>p.studentId===student.id&&!p.voided);
    return [crypto.randomUUID(),student.id,student.name,period,date,'',last?.method==='cash'?'Наличные':'Перевод','',charge?charge.amount/100:'',paid/100,charge?Math.max(0,charge.amount-paid)/100:''];
  })];
}
