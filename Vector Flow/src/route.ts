import { useSyncExternalStore } from 'react';
import type { Page, Role } from './model';
const pages: Page[]=['overview','requests','students','payments','economy'];
export function selectedPeriod(){const valid=(p:string|null)=>!!p&&/^\d{4}-(0[1-9]|1[0-2])$/.test(p);const period=new URLSearchParams(location.hash.split('?')[1]).get('period');if(valid(period))return period!;try{const cached=localStorage.getItem('flow:period');return valid(cached)?cached!:'2026-09';}catch{return '2026-09';}}
const subscribe=(fn:()=>void)=>{window.addEventListener('hashchange',fn);return()=>window.removeEventListener('hashchange',fn);};
export function useRoute(){
  const hash=useSyncExternalStore(subscribe,()=>location.hash);
  const [path,query='']=hash.replace(/^#\/?/,'').split('?');const parts=path.split('/');
  const role:Role=parts[0]==='admin'?'admin':'founder';
  let page=pages.includes(parts[1] as Page)?parts[1] as Page:'overview';
  if(role==='admin'&&page==='economy')page='overview';
  return {role,page,params:new URLSearchParams(query),key:hash};
}
export function navigate(role:Role,page:Page,params:Record<string,string>={}){
  if(role==='admin'&&page==='economy')page='overview';
  const period=params.period||selectedPeriod();
  try{localStorage.setItem('flow:period',period);}catch{/* preferences are optional */}
  const qs=new URLSearchParams({...params,period}).toString();
  const target=`#/${role}/${page}${qs?'?'+qs:''}`;
  try{localStorage.setItem(`flow:last:${role}`,target);}catch{/* preferences are optional */}
  location.hash=target;window.dispatchEvent(new HashChangeEvent('hashchange'));
}
export function switchRole(role:Role){let stored='';try{stored=localStorage.getItem(`flow:last:${role}`)||'';}catch{}const parts=stored.split('?');const page=parts[0]?.split('/')[2] as Page;const params=Object.fromEntries(new URLSearchParams(parts[1]));navigate(role,pages.includes(page)?page:role==='admin'?'requests':'overview',{...params,period:selectedPeriod()});}
export const saveCsv=(name:string,rows:(string|number)[][])=>{const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replace(/^[=+@-]/,"'"+'$&').replace(/"/g,'""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
