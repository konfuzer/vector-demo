import { useMemo, useState } from 'react';
import { useStore } from './context';
import { importPayments, previewPayments, templateRows } from './payment-csv';
import { money, month, type Role } from './model';
import { saveCsv } from './route';
import { Badge, Button, Field, FormError, Modal, Pager } from './ui';

export function PaymentImport({role,period,onClose}:{role:Role;period:string;onClose:()=>void}){
  const {state,commit,busy,toast}=useStore();
  const [text,setText]=useState(''),[name,setName]=useState(''),[error,setError]=useState(''),[reading,setReading]=useState(false),[showEmpty,setShowEmpty]=useState(false),[page,setPage]=useState(0);
  const result=useMemo(()=>{if(!text)return null;try{return {preview:previewPayments(state,text),error:''};}catch(e){return {preview:null,error:(e as Error).message};}},[state,text]);
  const preview=result?.preview,rows=preview?.rows.filter(r=>showEmpty||r.status!=='empty')||[];
  async function read(file:File|undefined){setText('');setError('');setPage(0);setName(file?.name||'');if(!file)return;setReading(true);try{if(file.size>2*1024*1024)throw new Error('CSV должен быть не больше 2 МБ.');const bytes=await file.arrayBuffer();let content='';try{content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{content=new TextDecoder('windows-1251').decode(bytes);}if(!content.trim())throw new Error('Файл пуст. Заполните шаблон и загрузите его снова.');setText(content);}catch(e){setError((e as Error).message);}finally{setReading(false);}}
  async function save(){setError('');try{let count=0;await commit(s=>{const next=importPayments(s,role,text);count=next.payments.length-s.payments.length;return next;});toast(`Загружено платежей: ${count}. Остатки и показатели обновлены`);onClose();}catch(e){setError((e as Error).message);}}
  return <Modal title="Загрузить оплаты из CSV" className="csv-import-modal" onClose={onClose}>
    <p className="modal-copy">Скачайте шаблон со списком учеников за <b className="capitalize">{month(period)}</b>. Заполните сумму только для новых оплат; пустые строки пропустим. Начисленные и ранее оплаченные суммы — справочные поля.</p>
    <div className="import-file-tools"><Field label="CSV с оплатами" hint="UTF-8 или Windows-1251, до 2 МБ. Файл обрабатывается в этом браузере."><input type="file" accept=".csv,text/csv" disabled={reading||busy} onChange={e=>void read(e.target.files?.[0])}/></Field><Button variant="outline" icon="download" onClick={()=>saveCsv(`flow-шаблон-оплат-${period}.csv`,templateRows(state,period))}>Шаблон CSV</Button></div>
    {reading&&<p role="status" className="info-note">Читаем файл…</p>}
    <FormError message={error||result?.error||''}/>
    {preview&&<>
      <div className="import-preview-heading"><div><h3>Предпросмотр</h3><p>{name}</p></div><Badge tone={preview.errors?'neutral':'blue'}>{preview.errors?'Нужно исправить файл':'Готово к проверке'}</Badge></div>
      <div className="import-summary"><div><span>Новых оплат</span><b>{preview.ready}</b><small>{money(preview.total)}</small></div><div><span>Совпадений</span><b>{preview.duplicates}</b><small>Пропустим</small></div><div className={preview.errors?'has-errors':''}><span>Ошибок</span><b>{preview.errors}</b><small>{preview.errors?'Ничего не сохраним':'Данные проверены'}</small></div><div><span>Без суммы</span><b>{preview.empty}</b><small>Пропустим</small></div></div>
      <p className="import-rule">Совпадения по ID или данным оплаты не добавляются повторно. При наличии ошибок весь импорт остаётся несохранённым. Сумма распределяется на указанный и следующие начисленные месяцы.</p>
      {preview.empty>0&&<button className="text-button import-toggle" onClick={()=>{setShowEmpty(!showEmpty);setPage(0);}}>{showEmpty?'Скрыть строки без суммы':`Показать строки без суммы (${preview.empty})`}</button>}
      {rows.length>0?<div className="table-scroll import-table-wrap"><table className="import-table"><thead><tr><th>№</th><th>Ученик / ID</th><th>За период</th><th>Дата оплаты</th><th>Сумма</th><th>Способ</th><th>Результат проверки</th></tr></thead><tbody>{rows.slice(page*8,page*8+8).map((r,i)=><tr key={`${r.line}-${i}`} className={r.status==='error'?'import-error-row':''}><td>{r.line-1}</td><td><b>{r.student||'Неизвестный ученик'}</b><small>{r.studentId||'ID не заполнен'}</small></td><td>{r.period}</td><td>{r.date}</td><td>{r.amount?money(r.amount):'—'}</td><td>{r.method==='cash'?'Наличные':r.method==='transfer'?'Перевод':r.method}</td><td><span className={`import-row-status ${r.status}`}>{r.message}</span></td></tr>)}</tbody></table><Pager page={page} total={rows.length} size={8} onChange={setPage}/></div>:<p className="info-note">Нет новых оплат. Заполните суммы в нужных строках шаблона.</p>}
      {preview.errors>0&&<p className="form-error">Исправьте строки с ошибками и выберите файл заново. Ни одна оплата пока не добавлена.</p>}
      {!preview.errors&&!preview.ready&&preview.duplicates>0&&<p className="info-note">Все заполненные оплаты уже есть в истории. Повторная загрузка не изменит суммы.</p>}
    </>}
    <div className="modal-actions"><Button disabled={!preview?.ready||!!preview.errors||busy||reading} onClick={()=>void save()}>{busy?'Сохраняем…':`Добавить оплаты${preview?.ready?` (${preview.ready})`:''}`}</Button><Button variant="outline" disabled={busy} onClick={onClose}>Отмена</Button><small>Записи появятся после подтверждения.</small></div>
  </Modal>;
}
