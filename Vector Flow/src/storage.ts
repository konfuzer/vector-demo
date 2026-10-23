import type { State } from './model';
import { createSeed } from './seed';
const DB_NAME = 'vector-flow-demo-v1';
let dbPromise: Promise<IDBDatabase> | undefined;
function database() {
  return dbPromise ||= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('app'); req.result.createObjectStore('files'); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Закройте другую вкладку Flow и повторите открытие.'));
  });
}
const read = <T,>(req: IDBRequest<T>) => new Promise<T>((resolve,reject) => { req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); });
export async function persist(state: State, blobs: { id: string; blob: Blob }[] = [], reset = false) {
  const db = await database();
  await new Promise<void>((resolve,reject) => {
    const tx = db.transaction(['app','files'], 'readwrite');
    tx.oncomplete=()=>resolve(); tx.onerror=()=>reject(tx.error || new Error('Не удалось сохранить данные.')); tx.onabort=()=>reject(tx.error || new Error('Хранилище недоступно. Изменения не сохранены.'));
    if(reset) tx.objectStore('files').clear();
    for(const file of blobs) tx.objectStore('files').put(file.blob, file.id);
    tx.objectStore('app').put(state, 'state');
  });
}
export async function freshState() {
  const state = createSeed();
  const response = await fetch('/demo-contract.pdf');
  if(!response.ok) throw new Error('Не удалось загрузить демонстрационное вложение.');
  const blob = await response.blob();
  state.files[0].size = blob.size;
  await persist(state,[{id:'seed-contract',blob}],true);
  return state;
}
export async function initialize() {
  const db=await database();
  const state=await read<State|undefined>(db.transaction('app','readonly').objectStore('app').get('state'));
  if(!state) return freshState();
  if(state.version!==1 || !Array.isArray(state.students) || !Array.isArray(state.payments)) throw new Error('Этот локальный набор несовместим с текущей версией Flow.');
  return state;
}
export async function getFile(id:string) {
  const db=await database();
  const blob=await read<Blob|undefined>(db.transaction('files','readonly').objectStore('files').get(id));
  if(!blob) throw new Error('Файл не найден в локальном хранилище.');
  return blob;
}
