import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from './ui';

interface Option { value:string; label:string; detail?:string; icon?:ReactNode }
export function HeaderSelect({label,value,options,onChange,icon,className=''}:{label:string;value:string;options:Option[];onChange:(value:string)=>void;icon?:ReactNode;className?:string}){
  const [open,setOpen]=useState(false),[active,setActive]=useState(0);
  const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
  const selected=Math.max(0,options.findIndex(o=>o.value===value));
  function show(){setActive(selected);setOpen(true);}
  function choose(index:number){onChange(options[index].value);setOpen(false);trigger.current?.focus();}
  useEffect(()=>{function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node))setOpen(false);}document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[]);
  useEffect(()=>{if(open)document.getElementById(`${id}-${active}`)?.scrollIntoView({block:'nearest'});},[open,active,id]);
  return <div className={`header-select ${className}`} ref={root} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setOpen(false);}}>
    <button ref={trigger} className="header-select-trigger" role="combobox" aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} aria-activedescendant={open?`${id}-${active}`:undefined} onClick={()=>open?setOpen(false):show()} onKeyDown={e=>{
      if(e.key==='Escape'){e.preventDefault();setOpen(false);return;}
      if(e.key==='Tab'){setOpen(false);return;}
      if(e.key==='Enter'||e.key===' '){e.preventDefault();open?choose(active):show();return;}
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();if(!open){show();return;}setActive(i=>e.key==='Home'?0:e.key==='End'?options.length-1:(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length);return;}
      if(e.key.length===1){const index=options.findIndex(o=>o.label.toLocaleLowerCase('ru').startsWith(e.key.toLocaleLowerCase('ru')));if(index>=0){setOpen(true);setActive(index);}}
    }}>{icon}<span className="header-select-value">{options[selected]?.label}</span><Icon name="down" size={16}/></button>
    {open&&<div className="header-select-popup"><p className="header-select-caption">{label==='Роль'?'Режим просмотра':'Период отчёта'}</p><div id={id} role="listbox" aria-label={label}>{options.map((option,i)=><button type="button" id={`${id}-${i}`} key={option.value} role="option" aria-selected={option.value===value} tabIndex={-1} className={`${active===i?'highlighted':''} ${option.value===value?'chosen':''}`} onPointerMove={()=>setActive(i)} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(i)}>{option.icon}<span><b>{option.label}</b>{option.detail&&<small>{option.detail}</small>}</span>{option.value===value&&<Icon name="check" size={17}/>}</button>)}</div></div>}
  </div>;
}
