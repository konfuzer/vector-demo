export type Role = 'founder' | 'admin';
export type Page = 'overview' | 'requests' | 'students' | 'payments' | 'economy';
export type RequestStatus = 'new' | 'working' | 'closed' | 'enrolled';
export interface Parent { name: string; relation: string; contact: string }
export interface Student { id: string; name: string; year: number; active: boolean; parents: Parent[]; notes: string; fee: number }
export interface RequestEntry { id: string; name: string; source: 'school' | 'club'; status: RequestStatus; stage: number; cohort: string; year: number; parent: string; contact: string; program: string; owner: string; nextStep: string; comment: string; created: string; studentId?: string }
export interface Charge { id: string; studentId: string; period: string; amount: number; due: string; note: string }
export interface Allocation { chargeId: string; amount: number }
export interface Payment { id: string; studentId: string; date: string; amount: number; method: 'transfer' | 'cash'; comment: string; allocations: Allocation[]; fileId?: string; voided?: boolean; voidReason?: string; importFingerprint?:string; importPeriod?:string }
export interface Expense { id: string; date: string; category: string; label: string; amount: number }
export interface FileMeta { id: string; studentId: string; name: string; type: string; size: number; paymentId?: string }
export interface HistoryEntry { id: string; entity: 'student' | 'request'; entityId: string; kind: string; label: string; at: string; before?: RequestEntry; after?: RequestEntry; undoOf?: string }
export interface State { version: 1; revision: number; students: Student[]; requests: RequestEntry[]; charges: Charge[]; payments: Payment[]; expenses: Expense[]; files: FileMeta[]; history: HistoryEntry[] }
export const capacities: Record<number, number> = { 5: 28, 6: 28, 7: 30, 8: 28, 9: 30 };
export const periods = ['2026-07', '2026-08', '2026-09'];
export const statusLabel: Record<RequestStatus, string> = { new: 'Новая', working: 'В работе', closed: 'Закрыта', enrolled: 'Зачислен' };
export const month = (p: string) => new Intl.DateTimeFormat('ru', { month: 'long', year: 'numeric' }).format(new Date(p + '-01T12:00:00')).replace(' г.', '');
export const money = (n: number) => new Intl.NumberFormat('ru', { style: 'currency', currency: 'RUB', maximumFractionDigits: n % 100 ? 2 : 0 }).format(n / 100);
export const shortMoney = (n: number) => `${new Intl.NumberFormat('ru', { maximumFractionDigits: 2 }).format(n / 100_000_000)} млн ₽`;
export const day = (date: string) => new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', ...(date.length > 10 ? { hour: '2-digit', minute: '2-digit' } : {}) }).format(new Date(date.length === 10 ? date + 'T12:00:00' : date));
export const initials = (name: string) => name.split(' ').slice(0, 2).map(x => x[0]).join('');
