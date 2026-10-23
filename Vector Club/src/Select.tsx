import {Children,isValidElement,useEffect,useId,useLayoutEffect,useRef,useState,type ReactNode,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronDown} from 'lucide-react';

type Option={value:string;label:ReactNode;disabled:boolean};
type Props={value:string|number;onChange:(value:string)=>void;children:ReactNode;'aria-label':string;id?:string;className?:string;disabled?:boolean};

export function Select({value,onChange,children,'aria-label':label,id,className='',disabled=false}:Props){
 const options:Option[]=[];
 Children.forEach(children,child=>{if(isValidElement<{value?:string|number;children:ReactNode;disabled?:boolean}>(child))options.push({value:String(child.props.value??child.props.children),label:child.props.children,disabled:!!child.props.disabled});});
 const [open,setOpen]=useState(false),[active,setActive]=useState(0);
 const [box,setBox]=useState({top:0,left:0,width:0,maxHeight:300});
 const trigger=useRef<HTMLButtonElement>(null),popup=useRef<HTMLDivElement>(null),listId=useId();
 const selected=options.findIndex(o=>o.value===String(value));
 const start=()=>{setActive(Math.max(0,selected));setOpen(true);};
 useLayoutEffect(()=>{
  if(!open)return;
  const place=()=>{const r=(trigger.current?.closest('.select-wrap')??trigger.current)?.getBoundingClientRect();if(!r)return;const gap=8,padding=12;const below=innerHeight-r.bottom-padding-gap;const above=r.top-padding-gap;const up=below<200&&above>below;const height=Math.min(320,Math.max(120,up?above:below));const estimated=Math.min(height,options.length*42+12);const width=Math.min(Math.max(r.width,190),innerWidth-24);setBox({top:up?r.top-estimated-gap:r.bottom+gap,left:Math.max(12,Math.min(r.left,innerWidth-width-12)),width,maxHeight:height});};
  place();addEventListener('resize',place);addEventListener('scroll',place,true);
  return()=>{removeEventListener('resize',place);removeEventListener('scroll',place,true);};
 },[open,options.length]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!trigger.current?.contains(e.target as Node)&&!popup.current?.contains(e.target as Node))setOpen(false);};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside);},[open]);
 useEffect(()=>{if(open)popup.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({block:'nearest'});},[open,active]);
 const choose=(index:number)=>{const o=options[index];if(!o||o.disabled)return;onChange(o.value);setOpen(false);trigger.current?.focus();};
 const key=(e:KeyboardEvent<HTMLButtonElement>)=>{
  if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);return;}
  if(e.key==='Tab'){setOpen(false);return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!open){start();return;}const direction=e.key==='ArrowDown'?1:-1;let i=active;for(let count=0;count<options.length;count++){i=(i+direction+options.length)%options.length;if(!options[i].disabled){setActive(i);break;}}return;}
  if(e.key==='Home'&&open){e.preventDefault();setActive(0);return;}
  if(e.key==='End'&&open){e.preventDefault();setActive(options.length-1);return;}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();open?choose(active):start();return;}
  if(e.key.length===1&&!e.ctrlKey&&!e.metaKey){const found=options.findIndex((o,i)=>i>active&&!o.disabled&&String(o.label).toLocaleLowerCase().startsWith(e.key.toLocaleLowerCase()));const wrap=found<0?options.findIndex(o=>!o.disabled&&String(o.label).toLocaleLowerCase().startsWith(e.key.toLocaleLowerCase())):found;if(wrap>=0){e.preventDefault();if(!open)start();setActive(wrap);}}
 };
 return <><button id={id} ref={trigger} type="button" role="combobox" aria-label={label} aria-expanded={open} aria-haspopup="listbox" aria-controls={open?listId:undefined} aria-activedescendant={open?`${listId}-${active}`:undefined} disabled={disabled} className={`club-select ${open?'is-open':''} ${className}`} onClick={()=>open?setOpen(false):start()} onKeyDown={key}><span>{options[selected]?.label??'Выберите'}</span><ChevronDown size={16}/></button>{open&&createPortal(<div ref={popup} id={listId} role="listbox" aria-label={label} className="select-menu" style={{top:box.top,left:box.left,width:box.width,maxHeight:box.maxHeight}}>{options.map((o,i)=><div role="option" id={`${listId}-${i}`} key={o.value} aria-selected={o.value===String(value)} aria-disabled={o.disabled||undefined} data-index={i} className={`select-option ${active===i?'is-active':''} ${o.value===String(value)?'is-selected':''} ${o.disabled?'is-disabled':''}`} onMouseDown={e=>e.preventDefault()} onMouseMove={()=>!o.disabled&&setActive(i)} onClick={()=>choose(i)}><span>{o.label}</span>{o.value===String(value)&&<Check size={16}/>}</div>)}</div>,document.body)}</>;
}
