const fs = require('fs');

// We don't have the whole app context, so let's mock it.
const VACCINE_SCHEDULE = [];
for (let i = 0; i < 50; i++) {
  VACCINE_SCHEDULE.push({ id: `vax-${i}`, group: `group-${i%5}` });
}

const S = { users: [] };
for (let i = 0; i < 1000; i++) {
  const u = { children: [] };
  for (let j = 0; j < 5; j++) {
    const c = { vaccines: [] };
    for (let k = 0; k < 40; k++) {
      c.vaccines.push({ id: `vax-${k}`, completedDate: Math.random() > 0.5 ? '2023-01-01' : null });
    }
    u.children.push(c);
  }
  S.users.push(u);
}

function runOriginal() {
  let totalChildren = 0, totalVaccinesGiven = 0, totalVaccines = 0;
  const vaccineData = {};

  S.users.forEach(u => {
    (u.children||[]).forEach(child => {
      totalChildren++;
      (child.vaccines||[]).forEach(v => {
        totalVaccines++;
        if (v.completedDate) totalVaccinesGiven++;
        const sched = VACCINE_SCHEDULE.find(s => s.id === v.id);
        const label = sched ? sched.group : 'other';
        if (!vaccineData[label]) vaccineData[label] = { done:0, total:0 };
        vaccineData[label].total++;
        if (v.completedDate) vaccineData[label].done++;
      });
    });
  });
  return totalVaccines;
}

function runOptimized() {
  let totalChildren = 0, totalVaccinesGiven = 0, totalVaccines = 0;
  const vaccineData = {};
  const schedMap = new Map();
  for (let i = 0; i < VACCINE_SCHEDULE.length; i++) {
      schedMap.set(VACCINE_SCHEDULE[i].id, VACCINE_SCHEDULE[i]);
  }

  S.users.forEach(u => {
    (u.children||[]).forEach(child => {
      totalChildren++;
      (child.vaccines||[]).forEach(v => {
        totalVaccines++;
        if (v.completedDate) totalVaccinesGiven++;
        const sched = schedMap.get(v.id);
        const label = sched ? sched.group : 'other';
        if (!vaccineData[label]) vaccineData[label] = { done:0, total:0 };
        vaccineData[label].total++;
        if (v.completedDate) vaccineData[label].done++;
      });
    });
  });
  return totalVaccines;
}

const start1 = performance.now();
for (let i=0; i<100; i++) runOriginal();
const end1 = performance.now();
console.log(`Original: ${end1 - start1} ms`);

const start2 = performance.now();
for (let i=0; i<100; i++) runOptimized();
const end2 = performance.now();
console.log(`Optimized: ${end2 - start2} ms`);
