import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { State } from './model';
import { freshState, initialize, persist } from './storage';
interface Store { state: State; busy: boolean; commit: (fn:(s:State)=>State,files?:{id:string;blob:Blob}[])=>Promise<State>; reset:()=>Promise<void>; toast:(message:string)=>void }
const Context=createContext<Store|null>(null);
export const useStore=()=>{const ctx=useContext(Context);if(!ctx)throw new Error('Store unavailable');return ctx;};
export function Provider({children}:{children:ReactNode}) {
  const [state,setState]=useState<State|null>(null),[error,setError]=useState(''),[pending,setPending]=useState(0),[notice,setNotice]=useState('');
  const ref=useRef<State|null>(null),queue=useRef<Promise<unknown>>(Promise.resolve()),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  useEffect(()=>{initialize().then(s=>{ref.current=s;setState(s);}).catch(e=>setError(e.message));},[]);
  const toast=(message:string)=>{setNotice(message);clearTimeout(timer.current);timer.current=setTimeout(()=>setNotice(''),6000);};
  async function commit(fn:(s:State)=>State,files:{id:string;blob:Blob}[]=[]) {
    setPending(n=>n+1);
    const task=queue.current.then(async()=>{const before=ref.current!;const next=fn(before);if(next!==before){await persist(next,files);ref.current=next;setState(next);}return next;});
    queue.current=task.then(()=>undefined,()=>undefined);
    try{return await task;}finally{setPending(n=>n-1);}
  }
  async function reset(){setPending(n=>n+1);const task=queue.current.then(async()=>{const s=await freshState();ref.current=s;setState(s);});queue.current=task.then(()=>undefined,()=>undefined);try{await task;toast('Демонстрация возвращена к исходным данным');}finally{setPending(n=>n-1);}}
  if(error)return <main className="loading"><h1>Локальное хранилище недоступно</h1><p>{error}</p><button onClick={()=>location.reload()}>Повторить открытие</button></main>;
  if(!state)return <main className="loading"><span className="loader"/><h1>Открываем Vector Flow</h1><p>Подготавливаем локальный демонстрационный набор</p></main>;
  return <Context.Provider value={{state,busy:pending>0,commit,reset,toast}}>{children}<div role="status" className={`toast ${notice?'show':''}`}>{notice && <><span>✓</span>{notice}<button aria-label="Закрыть уведомление" onClick={()=>setNotice('')}>×</button></>}</div></Context.Provider>;
}
