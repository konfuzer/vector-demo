import { capacities, type State, type Role, type RequestEntry, type Payment, type FileMeta, type Student, money } from './model';

export class DomainError extends Error { constructor(message: string, public field?: string) { super(message); } }
const admin = (role: Role) => { if (role !== 'admin') throw new DomainError('Изменять записи может администратор.'); };
const stamp = (s: State) => ({ ...s, revision: s.revision + 1 });
export const activeRequests = (s: State) => s.requests.filter(r => r.status === 'new' || r.status === 'working');
export const paid = (s: State, chargeId: string) => s.payments.filter(p => !p.voided).reduce((sum, p) => sum + p.allocations.filter(a => a.chargeId === chargeId).reduce((n, a) => n + a.amount, 0), 0);
export const remaining = (s: State, chargeId: string) => Math.max(0, (s.charges.find(c => c.id === chargeId)?.amount || 0) - paid(s, chargeId));
export const receipts = (s: State, period: string) => s.payments.filter(p => !p.voided && p.date.startsWith(period)).reduce((n, p) => n + p.amount, 0);
export const outgoing = (s: State, period: string) => s.expenses.filter(e => e.date.startsWith(period)).reduce((n,e) => n+e.amount, 0);
export const funnel = (s: State) => [0,1,2,3,4].map(stage => s.requests.filter(r => r.cohort === 'school-2026-09' && r.stage >= stage).length);
export const credit = (s: State, id: string) => s.payments.filter(p => p.studentId === id && !p.voided).reduce((n,p) => n + p.amount - p.allocations.reduce((v,a) => v+a.amount,0),0);
export const parseAmount = (value: string) => { const normalized = value.replace(/\s/g, '').replace(',', '.'); if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new DomainError('Укажите сумму больше нуля, до двух знаков после запятой.', 'amount'); const cents = Math.round(Number(normalized) * 100); if (!Number.isSafeInteger(cents) || cents <= 0) throw new DomainError('Укажите сумму больше нуля.', 'amount'); return cents; };
function validateDate(value: string) { const d = new Date(value + 'T12:00:00Z'); if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(d.getTime()) || d.toISOString().slice(0,10) !== value) throw new DomainError('Укажите корректную дату.', 'date'); }

export function saveRequest(s: State, role: Role, draft: RequestEntry, operationId: string): State {
  admin(role);
  if (s.history.some(e => e.id === operationId)) return s;
  if (draft.name.trim().length < 2) throw new DomainError('Укажите имя потенциального ученика.', 'name');
  if (!draft.parent.trim() || !draft.contact.trim()) throw new DomainError('Укажите родителя и контакт для связи.', !draft.parent.trim() ? 'parent' : 'contact');
  if (draft.status === 'working' && !draft.owner) throw new DomainError('Выберите ответственного.', 'owner');
  if (draft.source === 'club' && !draft.program.trim()) throw new DomainError('Выберите программу.', 'program');
  const old = s.requests.find(r => r.id === draft.id);
  if(old?.source==='club'&&old.program!==draft.program)throw new DomainError('Программа Vector Club доступна только для просмотра.', 'program');
  if (old?.status === 'enrolled') throw new DomainError('Зачисленная заявка доступна для просмотра. Измените карточку ученика.');
  const clean = { ...draft, name: draft.name.trim(), parent: draft.parent.trim(), contact: draft.contact.trim() };
  if (old && JSON.stringify(old) === JSON.stringify(clean)) return s;
  return stamp({ ...s, requests: old ? s.requests.map(r => r.id === clean.id ? clean : r) : [clean, ...s.requests], history: [...s.history, { id: operationId, entity: 'request', entityId: clean.id, kind: old ? 'request.updated' : 'request.created', label: old ? 'Мария · Обновлена заявка' : 'Мария · Создана заявка', at: new Date().toISOString(), before: old, after: clean }] });
}
export function undoRequest(s: State, role: Role, id: string, operationId: string): State {
  admin(role);
  if (s.history.some(h => h.id === operationId)) return s;
  const h = s.history.findLast(h => h.entityId === id && h.kind === 'request.updated');
  if (!h?.before || s.history.some(x => x.undoOf === h.id)) throw new DomainError('Нет изменения, которое можно отменить.');
  if (JSON.stringify(s.requests.find(r => r.id === id)) !== JSON.stringify(h.after)) throw new DomainError('Запись уже изменилась. Отмените более позднее действие.');
  return stamp({ ...s, requests: s.requests.map(r => r.id === id ? h.before! : r), history: [...s.history, { id: operationId, entity: 'request', entityId: id, kind: 'request.restored', undoOf: h.id, label: 'Мария · Изменение заявки отменено', at: new Date().toISOString() }] });
}
export interface PaymentDraft { id: string; studentId: string; chargeId: string; amount: number; date: string; method: string; comment: string; file?: FileMeta }
export function addPayment(s: State, role: Role, draft: PaymentDraft): State {
  admin(role);
  if (s.payments.some(p => p.id === draft.id)) return s;
  if (!Number.isSafeInteger(draft.amount) || draft.amount <= 0) throw new DomainError('Укажите сумму больше нуля.', 'amount');
  validateDate(draft.date);
  if (!['cash','transfer'].includes(draft.method)) throw new DomainError('Выберите способ оплаты.', 'method');
  const target = s.charges.find(c => c.id === draft.chargeId && c.studentId === draft.studentId);
  if (!target || !s.students.some(x => x.id === draft.studentId)) throw new DomainError('Начисление или ученик не найден.');
  if (draft.file && (draft.file.studentId !== draft.studentId || draft.file.paymentId !== draft.id)) throw new DomainError('Файл не соответствует платежу.');
  let left = draft.amount;
  const allocations: Payment['allocations'] = [];
  for (const charge of s.charges.filter(c => c.studentId === draft.studentId && c.period >= target.period).sort((a,b) => a.period.localeCompare(b.period))) {
    const amount = Math.min(left, remaining(s, charge.id));
    if (amount > 0) { allocations.push({ chargeId: charge.id, amount }); left -= amount; }
    if (!left) break;
  }
  const p: Payment = { id: draft.id, studentId: draft.studentId, date: draft.date, amount: draft.amount, method: draft.method as Payment['method'], comment: draft.comment, allocations, fileId: draft.file?.id };
  return stamp({ ...s, payments: [...s.payments, p], files: draft.file ? [...s.files, draft.file] : s.files, history: [...s.history, { id: draft.id + ':history', entity: 'student', entityId: draft.studentId, kind: 'payment.created', label: `Мария · Внесена оплата ${money(draft.amount)}`, at: new Date().toISOString() }] });
}
export function voidPayment(s: State, role: Role, id: string, reason: string): State {
  admin(role);
  const old = s.payments.find(p => p.id === id);
  if (!old) throw new DomainError('Платёж не найден.');
  if (old.voided) return s;
  if (!reason.trim()) throw new DomainError('Укажите причину исправления.', 'reason');
  return stamp({ ...s, payments: s.payments.map(p => p.id === id ? { ...p, voided: true, voidReason: reason.trim() } : p), history: [...s.history, { id: id + ':void', entity: 'student', entityId: old.studentId, kind: 'payment.voided', label: `Мария · Аннулирована запись ${money(old.amount)}: ${reason.trim()}`, at: new Date().toISOString() }] });
}
export function saveStudent(s: State, role: Role, draft: Student, operationId: string): State {
  admin(role);
  if (s.history.some(h => h.id === operationId)) return s;
  if (draft.name.trim().length < 2) throw new DomainError('Укажите имя ученика.', 'name');
  if (!capacities[draft.year]) throw new DomainError('Выберите класс.', 'year');
  if (draft.active && s.students.filter(x => x.id !== draft.id && x.active && x.year === draft.year).length >= capacities[draft.year]) throw new DomainError('В этой параллели нет свободных мест. Выберите другую.', 'year');
  if (!draft.parents.length || draft.parents.some(p => !p.name.trim() || !p.contact.trim())) throw new DomainError('Заполните имя родителя и контакт.', 'parent');
  if (!Number.isSafeInteger(draft.fee) || draft.fee <= 0) throw new DomainError('Укажите положительную стоимость обучения.', 'fee');
  const exists = s.students.some(x => x.id === draft.id);
  const clean = { ...draft, name: draft.name.trim() };
  const charges = exists ? s.charges : [...s.charges, ...['2026-09','2026-10','2026-11'].map(period => ({ id: `${draft.id}:${period}`, studentId: draft.id, period, amount: draft.fee, due: `${period}-${period === '2026-10' ? '31' : '30'}`, note: '' }))];
  return stamp({ ...s, students: exists ? s.students.map(x => x.id === draft.id ? clean : x) : [...s.students, clean], charges, history: [...s.history, { id: operationId, entity: 'student', entityId: draft.id, kind: 'student.updated', label: exists ? 'Мария · Обновлена карточка ученика' : 'Мария · Создана карточка ученика', at: new Date().toISOString() }] });
}
export function addFile(s: State, role: Role, meta: FileMeta): State { admin(role); if (s.files.some(f => f.id === meta.id)) return s; return stamp({ ...s, files: [...s.files, meta], history: [...s.history, { id: meta.id + ':history', entity: 'student', entityId: meta.studentId, kind: 'file.added', label: `Мария · Прикреплён файл ${meta.name}`, at: new Date().toISOString() }] }); }
export function editCharge(s: State, role: Role, id: string, due: string, note: string, operationId: string): State { admin(role); validateDate(due); if(s.history.some(h=>h.id===operationId)) return s; const charge=s.charges.find(c=>c.id===id); if(!charge) throw new DomainError('Начисление не найдено.'); return stamp({...s,charges:s.charges.map(c=>c.id===id?{...c,due,note}:c),history:[...s.history,{id:operationId,entity:'student',entityId:charge.studentId,kind:'charge.updated',label:'Мария · Обновлены срок и примечание к начислению',at:new Date().toISOString()}]}); }
export function createCharge(s:State,role:Role,studentId:string,period:string,amount:number,due:string,note:string,operationId:string):State{admin(role);if(s.history.some(h=>h.id===operationId))return s;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))throw new DomainError('Выберите период.','period');validateDate(due);if(!Number.isSafeInteger(amount)||amount<=0)throw new DomainError('Укажите сумму больше нуля.','amount');if(!s.students.some(x=>x.id===studentId))throw new DomainError('Ученик не найден.');if(s.charges.some(c=>c.studentId===studentId&&c.period===period))throw new DomainError('Начисление за этот месяц уже существует.','period');return stamp({...s,charges:[...s.charges,{id:`${studentId}:${period}`,studentId,period,amount,due,note}],history:[...s.history,{id:operationId,entity:'student',entityId:studentId,kind:'charge.created',label:'Мария · Добавлено начисление',at:new Date().toISOString()}]});}
