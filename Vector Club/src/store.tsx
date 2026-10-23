import {createContext,useContext,useRef,useState,type ReactNode} from 'react';
import {applyCommand,seedState,hydrateState,STORAGE_KEY,type State,type Command} from './domain';
import {CATALOGUE_REVISION} from './catalogue';
type Store={state:State;run:(cmd:Command)=>{id?:string;unchanged?:boolean}|null;notice:string;clearNotice:()=>void;storageError:string};
const Context=createContext<Store|null>(null);
function persistState(state:State){
 const raw=localStorage.getItem(STORAGE_KEY);
 if(raw){
  const backupKey=STORAGE_KEY+':before-academies';
  let previousRevision:unknown;try{previousRevision=JSON.parse(raw).catalogueRevision;}catch{/* Keep an unreadable original as well. */}
  if(previousRevision!==CATALOGUE_REVISION&&!localStorage.getItem(backupKey))localStorage.setItem(backupKey,raw);
 }
 localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}
export function StoreProvider({children}:{children:ReactNode}){
 const [initial]=useState(()=>{try{
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return{state:seedState(),error:''};
  const saved=JSON.parse(raw),s=hydrateState(saved);
  if(!s)return{state:seedState(),error:'Сохранённые данные повреждены. Показан исходный набор; нажмите «Сбросить демо», чтобы восстановить сохранение.'};
  if(saved.catalogueRevision!==CATALOGUE_REVISION){
   try{persistState(s);}
   catch{return{state:s,error:'Каталог обновлён в этой вкладке, но браузер не позволил сохранить резервную копию или обновление. Исходный набор не сброшен.'};}
  }
  return{state:s as State,error:''};
 }catch{return{state:seedState(),error:'Не удалось прочитать сохранённые данные. Изменения могут не сохраниться.'};}});
 const [state,setState]=useState<State>(initial.state);const ref=useRef(state);const[notice,setNotice]=useState('');const[storageError,setStorageError]=useState(initial.error);
 const run=(cmd:Command)=>{try{const r=applyCommand(ref.current,cmd);ref.current=r.state;setState(r.state);try{persistState(r.state);setStorageError('');}catch{setStorageError('Изменения доступны в этой вкладке, но браузер не позволил их сохранить.');}setNotice(r.unchanged?'Действие уже выполнено':cmd.type==='reset'?'Исходное демо восстановлено':cmd.type==='create'?'Заявка получена':cmd.type==='reserve'?'Место забронировано':cmd.type==='pay'?'Демонстрационная оплата отмечена':cmd.type==='cancel'?'Бронь отменена, место освобождено':'Изменения сохранены');return{id:r.id,unchanged:r.unchanged};}catch(e){setNotice(e instanceof Error?e.message:'Не удалось выполнить действие');return null;}};
 return <Context.Provider value={{state,run,notice,clearNotice:()=>setNotice(''),storageError}}>{children}</Context.Provider>;
}
export function useClub(){const value=useContext(Context);if(!value)throw Error('Store missing');return value;}
