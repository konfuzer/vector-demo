import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useStore } from './context';
import { DomainError, saveRequest, undoRequest } from './domain';
import { type RequestEntry, type Role, initials, statusLabel, day } from './model';
import { Avatar, Badge, Button, Empty, Field, FormError, Icon, Modal, Pager } from './ui';
import { navigate } from './route';
function RequestEditor({request,role,onSaved,newRecord=false}:{request:RequestEntry;role:Role;onSaved:(id:string)=>void;newRecord?:boolean}){
  const {state,commit,busy,toast}=useStore();
  const [draft,setDraft]=useState({...request}),[error,setError]=useState('');
  const ref=useRef<HTMLFormElement>(null),op=useRef(crypto.randomUUID());
  useEffect(()=>{setDraft({...request});setError('');op.current=crypto.randomUUID();},[request]);
  const canEdit=role==='admin'&&request.status!=='enrolled';
  const change=<K extends keyof RequestEntry>(key:K,value:RequestEntry[K])=>setDraft(x=>({...x,[key]:value}));
  const events=state.history.filter(h=>h.entity==='request'&&h.entityId===request.id).slice().reverse();
  const lastUpdate=events.find(h=>h.kind==='request.updated');
  const undoable=lastUpdate?.before&&!events.some(h=>h.undoOf===lastUpdate.id)&&JSON.stringify(request)===JSON.stringify(lastUpdate.after);
  async function submit(e:FormEvent){
    e.preventDefault();setError('');
    try{await commit(s=>saveRequest(s,role,draft,op.current));op.current=crypto.randomUUID();toast('Заявка сохранена. Список и счётчики обновлены');onSaved(draft.id);}
    catch(e){setError((e as Error).message);if(e instanceof DomainError&&e.field)ref.current?.querySelector<HTMLElement>(`[name="${e.field}"]`)?.focus();}
  }
  return <div className={`request-editor ${newRecord?'new-record':'existing-record'}`}>
    <div className="section-head"><h2>{newRecord?'Новая заявка':`Заявка №${request.id}`}</h2><Badge tone={draft.source==='club'?'lime':'blue'}>{draft.source==='club'?'Club':'Школа'}</Badge><Badge tone="blue">{statusLabel[request.status]}</Badge></div>
    {!newRecord&&<div className="request-person"><Avatar text={initials(draft.name)}/><div><h2>{draft.name}</h2><p>Потенциальный ученик</p></div></div>}
    <form ref={ref} noValidate onSubmit={submit}>
      {newRecord&&<div className="form-grid"><Field label="Имя и фамилия ученика"><input name="name" value={draft.name} onChange={e=>change('name',e.target.value)}/></Field><Field label="Направление"><select value={draft.source} onChange={e=>setDraft({...draft,source:e.target.value as RequestEntry['source'],cohort:e.target.value==='school'?'school-2026-09':'club-2026-09',program:e.target.value==='school'?'Обучение в школе':'Робототехника'})}><option value="school">Школа</option><option value="club">Vector Club</option></select></Field></div>}
      <div className="form-grid request-contacts"><Field label="Родитель"><input name="parent" readOnly={!canEdit} value={draft.parent} onChange={e=>change('parent',e.target.value)}/></Field><Field label="Контакт для связи"><input name="contact" readOnly={!canEdit} value={draft.contact} onChange={e=>change('contact',e.target.value)}/></Field></div>
      <hr/>
      <Field label="Программа" hint={draft.source==='club'?'Программа из заявки Vector Club · только просмотр':'Условия и этапы поступления — демонстрационные'}><input name="program" readOnly={draft.source==='club'||!canEdit} value={draft.program} onChange={e=>change('program',e.target.value)}/></Field>
      <div className="form-grid request-status-fields">
        <Field label="Статус"><select disabled={!canEdit} value={draft.status} onChange={e=>change('status',e.target.value as RequestEntry['status'])}><option value="new">Новая</option><option value="working">В работе</option><option value="closed">Закрыта</option>{draft.status==='enrolled'&&<option value="enrolled">Зачислен</option>}</select></Field>
        <Field label="Ответственный" action={canEdit?<button type="button" className="text-button assign-self" onClick={()=>change('owner','Мария')}>Назначить себя</button>:undefined}><select name="owner" disabled={!canEdit} value={draft.owner} onChange={e=>change('owner',e.target.value)}><option value="">Выберите сотрудника</option><option>Мария</option><option>Александр</option></select></Field>
      </div>
      <Field label="Следующий шаг"><input readOnly={!canEdit} value={draft.nextStep} onChange={e=>change('nextStep',e.target.value)}/></Field>
      <Field label="Комментарий"><textarea readOnly={!canEdit} value={draft.comment} onChange={e=>change('comment',e.target.value)}/></Field>
      <section className="inline-history"><div className="section-head"><h3>История</h3>{canEdit&&undoable&&<button type="button" className="text-button" disabled={busy} onClick={async()=>{try{await commit(s=>undoRequest(s,role,request.id,crypto.randomUUID()));toast('Изменение отменено. Счётчики восстановлены');}catch(e){setError((e as Error).message);}}}><Icon name="undo" size={15}/>Отменить последнее изменение</button>}</div>{events.length?events.slice(0,5).map(h=><div className="history-row" key={h.id}><i/>{day(h.at)} · {h.label}</div>):<div className="history-row"><i/>{day(request.created)} · Создана демозаявка</div>}</section>
      <FormError message={error}/>
      {canEdit&&<div className="form-actions"><Button type="submit" disabled={busy}>Сохранить изменения</Button><Button type="button" variant="outline" onClick={()=>{setDraft({...request});setError('');toast('Несохранённые изменения отменены');}}>Отмена</Button></div>}
    </form>
  </div>;
}
export function Requests({role,params}:{role:Role;params:URLSearchParams}){
  const {state}=useStore();const [query,setQuery]=useState(''),[source,setSource]=useState(params.get('source')||'all'),[status,setStatus]=useState(params.get('status')||'open'),[selected,setSelected]=useState(params.get('id')||''),[page,setPage]=useState(0),[create,setCreate]=useState(params.get('create')==='1'&&role==='admin');
  const blankRequest=():RequestEntry=>({id:'RQ-'+crypto.randomUUID().slice(0,5).toUpperCase(),name:'',source:'school',status:'new',stage:0,cohort:'school-2026-09',year:5,parent:'',contact:'',program:'Обучение в школе',owner:'',nextStep:'Связаться с родителем',comment:'',created:'2026-09-30'});
  const [newRequest,setNewRequest]=useState<RequestEntry>(blankRequest);
  const active=state.requests.filter(r=>r.status==='new'||r.status==='working');const cohort=params.has('cohort');const stage=Number(params.get('stage')||0);
  const filtered=state.requests.filter(r=>(!cohort||r.cohort==='school-2026-09'&&r.stage>=stage)&&(source==='all'||r.source===source)&&(status==='all'||status==='open'&&(r.status==='new'||r.status==='working')||r.status===status)&&r.name.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
  const picked=filtered.find(r=>r.id===selected)||filtered[0];const maxPage=Math.max(0,Math.ceil(filtered.length/6)-1);const current=Math.min(page,maxPage);const rows=filtered.slice(current*6,current*6+6);
  useEffect(()=>setPage(0),[query,source,status]);
  return <main className="page requests-layout"><div className="requests-main"><div className="page-head"><div><h1>Заявки</h1><p className="subtitle">Школа и Vector Club</p></div>{role==='admin'&&<Button icon="plus" onClick={()=>{setNewRequest(blankRequest());setCreate(true);}}>Новая заявка</Button>}</div><div className="operational-band"><div><span>Новые</span><strong>{active.filter(r=>r.status==='new').length}</strong></div><div><span>В работе</span><strong>{active.filter(r=>r.status==='working').length}</strong></div><div><span>Открыто всего</span><strong>{active.length}</strong></div></div><section className="panel request-register"><div className="table-tools"><label className="search"><Icon name="search"/><input aria-label="Поиск заявки по имени ученика" placeholder="Поиск по имени ученика" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="chips">{[['all','Все'],['school','Школа'],['club','Club']].map(([value,label])=><button className={source===value?'selected':''} key={value} onClick={()=>setSource(value)}>{label}<span>{active.filter(r=>value==='all'||r.source===value).length}</span></button>)}</div></div>{(cohort||query||source!=='all'||status!=='open')&&<div className="sub-tools">{cohort&&<Badge tone="blue">Когорта сентября · этап {stage+1}</Badge>}{(cohort||query||source!=='all'||status!=='open')&&<button className="text-button" onClick={()=>{setQuery('');setSource('all');setStatus('open');if(cohort)navigate(role,'requests');}}>Сбросить фильтры</button>}</div>}<div className="table-scroll"><table className="request-table"><thead><tr><th>Ученик</th><th>Направление</th><th><select className="table-status-filter" aria-label="Статус заявок" value={status} onChange={e=>setStatus(e.target.value)}><option value="open">Статус</option><option value="all">Все статусы</option><option value="new">Новые</option><option value="working">В работе</option><option value="closed">Закрытые</option><option value="enrolled">Зачисленные</option></select></th><th>Ответственный</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.id} className={picked?.id===r.id?'selected-row':''}><td><button className="person-link" onClick={()=>setSelected(r.id)}><Avatar text={initials(r.name)} green={i%3===1}/><b>{r.name}</b></button></td><td><Badge tone={r.source==='club'?'lime':'blue'}>{r.source==='club'?'Club':'Школа'}</Badge></td><td><Badge tone={r.status==='working'||r.status==='enrolled'?'lime':r.status==='new'?'blue':'neutral'}>{statusLabel[r.status]}</Badge></td><td className="muted">{r.owner||'Не назначен'}</td></tr>)}</tbody></table>{!filtered.length&&<Empty>Заявок по этим условиям нет. Измените фильтры.</Empty>}</div><Pager page={current} total={filtered.length} size={6} onChange={setPage}/></section><div className="panel direction-summary"><b>По направлениям</b>{['school','club'].map(src=><div key={src}><span>{src==='school'?'Школа':'Club'}</span><b>{active.filter(r=>r.source===src&&r.status==='new').length}<small>новых</small></b><b>{active.filter(r=>r.source===src&&r.status==='working').length}<small>в работе</small></b></div>)}</div></div><aside className="panel editor-panel">{picked?<RequestEditor key={picked.id} request={picked} role={role} onSaved={setSelected}/>:<Empty>Выберите заявку из списка</Empty>}</aside>{create&&<Modal title="Новая заявка" wide onClose={()=>setCreate(false)}><RequestEditor request={newRequest} role={role} newRecord onSaved={id=>{setSelected(id);setCreate(false);setSource('all');setStatus('open');}}/></Modal>}</main>;
}



