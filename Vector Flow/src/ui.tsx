import { cloneElement, isValidElement, useEffect, useId, useRef, type ReactElement, type ReactNode, type ButtonHTMLAttributes } from 'react';
export function Icon({name,size=20}:{name:string;size?:number}) {
  const paths:Record<string,ReactNode>={
    plus:<path d="M12 5v14M5 12h14"/>,arrow:<path d="M4 12h15m-6-6 6 6-6 6"/>,chevron:<path d="m9 5 7 7-7 7"/>,down:<path d="m6 9 6 6 6-6"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,calendar:<><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18"/></>,
    users:<><circle cx="9" cy="7" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 4v2"/></>,
    file:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8m-8 4h6"/></>,
    clip:<path d="m9 12 7-7a3 3 0 0 1 4 4L10 19a5 5 0 0 1-7-7L13 2m-7 13 9-9"/>,check:<path d="m4 12 5 5L20 6"/>,
    edit:<><path d="m16 3 5 5L9 20l-6 1 1-6zM13 6l5 5"/></>,undo:<><path d="M4 4v6h6M4 10a8 8 0 1 1 1 8"/></>,
    upload:<><path d="M12 15V2m-5 5 5-5 5 5M4 16v5h16v-5"/></>,download:<><path d="M12 2v13m-5-5 5 5 5-5M4 16v5h16v-5"/></>,school:<><path d="m3 10 9-7 9 7v11H3zM9 21v-7h6v7M9 9h6"/></>,
    list:<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></>,
    more:<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.file}</svg>;
}
export function Button({children,variant='primary',icon,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:string;icon?:string}){return <button className={`button ${variant}`} {...props}>{icon&&<Icon name={icon}/>}<span>{children}</span></button>;}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>;}
export function Avatar({text,green=false}:{text:string;green?:boolean}){return <span className={`avatar ${green?'lime':''}`}>{text}</span>;}
export function Empty({children}:{children:ReactNode}){return <div className="empty"><Icon name="file" size={30}/><p>{children}</p></div>;}
export function Modal({title,children,onClose,wide=false,className=''}:{title:string;children:ReactNode;onClose:()=>void;wide?:boolean;className?:string}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const old=document.activeElement as HTMLElement;ref.current?.showModal();return()=>{ref.current?.close();if(old?.isConnected)old.focus();};},[]);
  return <dialog ref={ref} className={`modal ${wide?'wide':''} ${className}`} aria-label={title} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current){const bounds=e.currentTarget.getBoundingClientRect();if(e.clientX<bounds.left||e.clientX>bounds.right||e.clientY<bounds.top||e.clientY>bounds.bottom)onClose();}}}><div className="modal-head"><h2>{title}</h2><button type="button" className="icon-button" aria-label="Закрыть окно" onClick={onClose}><Icon name="close"/></button></div>{children}</dialog>;
}
export function Field({label,children,hint,action}:{label:string;children:ReactNode;hint?:string;action?:ReactNode}){const id=useId();const control=isValidElement(children)?cloneElement(children as ReactElement<{id?:string;'aria-describedby'?:string}>,{id,'aria-describedby':hint?id+'-hint':undefined}):children;return <div className={`field ${action?'with-action':''}`}><label htmlFor={id}>{label}</label>{action?<div className="field-control">{control}{action}</div>:control}{hint&&<small id={id+'-hint'}>{hint}</small>}</div>;}
export function FormError({message}:{message:string}){return message?<div className="form-error" role="alert">{message}</div>:null;}
export function Pager({page,total,size=12,onChange}:{page:number;total:number;size?:number;onChange:(n:number)=>void}){const max=Math.max(0,Math.ceil(total/size)-1);const current=Math.min(page,max);return <div className="pager"><span>{total?`${current*size+1}–${Math.min(total,(current+1)*size)} из ${total}`:'Нет записей'}</span><div><button className="icon-button" aria-label="Предыдущая страница" disabled={!current} onClick={()=>onChange(current-1)}>←</button><button className="icon-button" aria-label="Следующая страница" disabled={current>=max} onClick={()=>onChange(current+1)}>→</button></div></div>;}

