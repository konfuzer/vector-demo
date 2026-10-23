import type { State, RequestEntry, Student } from './model';

export function createSeed(): State {
  const first = ['Мария Орлова', 'Артём Лебедев', 'София Миронова', 'Илья Соколов', 'Алиса Белова', 'Даниил Волков'];
  const given = ['Александр', 'Михаил', 'Анна', 'Ева', 'Матвей', 'Вера', 'Тимофей', 'Дарья', 'Максим', 'Арина', 'Лев', 'Кира'];
  const surnames = ['Алексеев', 'Белов', 'Волков', 'Громов', 'Данилов', 'Егоров', 'Жуков', 'Захаров', 'Иванов', 'Крылов', 'Лазарев'];
  const students: Student[] = [];
  const years = [5, 6, 7, 8, 9];
  const counts = [26, 27, 28, 25, 26];
  for (let g = 0; g < years.length; g++) for (let j = 0; j < counts[g]; j++) {
    const i = students.length;
    const name = first[i] || `${given[i % given.length]} ${surnames[Math.floor(i / given.length) % surnames.length]}${['Анна','Ева','Вера','Дарья','Арина','Кира'].includes(given[i % given.length]) ? 'а' : ''}`;
    students.push({ id: i === 0 ? 'У-032' : `У-${String(i + 100).padStart(3, '0')}`, name, year: years[g], active: true, fee: 5_000_000,
      parents: i === 0 ? [{ name: 'Анна Орлова', relation: 'Мама', contact: 'Демонстрационный контакт' }, { name: 'Дмитрий Орлов', relation: 'Папа', contact: 'Демонстрационный контакт' }] : [{ name: `Родитель ${name.split(' ')[0]}`, relation: 'Представитель', contact: 'Демонстрационный контакт' }],
      notes: i === 0 ? 'По организационным вопросам связываться после 18:00' : i % 9 === 0 ? 'Предпочтительный способ связи — сообщение родителю.' : '' });
  }
  // All ledger totals are derived from individual records, including historical periods.
  const charges = students.flatMap(s => ['2026-07','2026-08','2026-09','2026-10','2026-11'].map(period => ({ id: `${s.id}:${period}`, studentId: s.id, period, amount: s.fee, due: `${period}-${period.endsWith('09') || period.endsWith('11') ? '30' : '31'}`, note: '' })));
  const payments: State['payments'] = [];
  for (const [period, full, rest] of [['2026-07', 78, 2_000_000], ['2026-08', 91, 3_000_000], ['2026-09', 97, 1_000_000]] as const) {
    for (let j = 1; j <= full + 1; j++) {
      const amount = j <= full ? 5_000_000 : rest;
      const s = students[j];
      payments.push({ id: `seed:${period}:${j}`, studentId: s.id, amount, date: `${period}-${String(3 + j % 25).padStart(2, '0')}`, method: j % 5 ? 'transfer' : 'cash', comment: 'Демонстрационная оплата обучения', allocations: [{ chargeId: `${s.id}:${period}`, amount }] });
    }
  }
  const expenses: State['expenses'] = [];
  const cats = ['Команда', 'Помещение', 'Питание', 'Материалы', 'Прочее'];
  for (const [period, amounts] of [['2026-07', [2500000,600000,350000,150000,80000]], ['2026-08', [2700000,650000,400000,170000,100000]], ['2026-09', [2800000,650000,420000,170000,80000]]] as const)
    amounts.forEach((rub, i) => expenses.push({ id: `ex:${period}:${i}`, date: `${period}-${10 + i * 3}`, category: cats[i], label: `${cats[i]} · демонстрационные выплаты`, amount: rub * 100 }));
  const makeRequest = (id: string, name: string, source: 'school'|'club', status: RequestEntry['status'], stage = 0): RequestEntry => ({ id, name, source, status, stage, cohort: source === 'school' ? 'school-2026-09' : 'club-2026-09', year: 5, parent: name === 'Марк Власов' ? 'Елена Власова' : 'Демонстрационный родитель', contact: 'Демонстрационный контакт', program: source === 'club' ? 'Робототехника' : 'Обучение в школе', owner: status === 'working' ? 'Мария' : '', nextStep: source === 'club' ? 'Уточнить удобную группу' : 'Связаться с родителем', comment: name === 'Марк Власов' ? 'Родитель просит связаться после 18:00' : '', created: '2026-09-30' });
  const requests: RequestEntry[] = [makeRequest('CL-024','Марк Власов','club','new'), makeRequest('SC-011','Арина Котова','school','working',1), makeRequest('CL-025','Иван Романов','club','new'), makeRequest('SC-012','Кира Соколова','school','new'), makeRequest('CL-026','Лев Орлов','club','working',1), makeRequest('CL-027','Дарья Белова','club','new')];
  for (let i = 0; i < 6; i++) requests.push(makeRequest(`SC-${20+i}`, ['Максим Попов','Вера Тихонова','Егор Смирнов','Полина Зорина','Олег Фомин','Мила Грачева'][i], 'school', 'new'));
  requests.push(makeRequest('SC-031','Демид Рябов','school','working',1), makeRequest('SC-032','Светлана Юдина','school','working',1), makeRequest('CL-028','Никита Морозов','club','new'), makeRequest('CL-029','Алексей Назаров','club','working',1));
  // A separate historical school cohort explains every step of the cumulative funnel.
  const closedCounts = [2,10,5,3,6];
  closedCounts.forEach((n, stage) => { for (let j = 0; j < n; j++) {
    const req = makeRequest(`SC-H${stage}${j}`, `${given[(stage*3+j)%given.length]} ${surnames[(stage+j)%surnames.length]}`, 'school', stage === 4 ? 'enrolled' : 'closed', stage);
    req.created = '2026-09-01'; req.owner = 'Мария'; requests.push(req);
  }});
  return { version: 1, revision: 0, students, requests, charges, payments, expenses,
    files: [{ id: 'seed-contract', studentId: 'У-032', name: 'договор-демо.pdf', type: 'application/pdf', size: 0 }],
    history: [{ id: 'seed-charge-history', entity: 'student', entityId: 'У-032', kind: 'charge.created', label: 'Добавлено начисление за сентябрь', at: '2026-09-01T09:00:00+03:00' }] };
}
