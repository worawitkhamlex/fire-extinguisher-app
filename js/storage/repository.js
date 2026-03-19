/**
 * Repository Layer
 * ----------------
 * Business-facing data access. All screens call repo, never db.js directly.
 * When migrating to API sync, replace implementations here.
 */

import * as db from './db.js';

// ─── Extinguishers ───

export async function getAllExtinguishers() {
  return db.getAll('extinguishers');
}

export async function getExtinguisherByCode(code) {
  return db.getOneByIndex('extinguishers', 'code', code);
}

export async function searchExtinguishers(query) {
  const all = await db.getAll('extinguishers');
  if (!query) return all;
  const q = query.toLowerCase().trim();
  return all.filter(e =>
    e.extinguisher_code.toLowerCase().includes(q) ||
    e.location.toLowerCase().includes(q) ||
    e.department.toLowerCase().includes(q) ||
    (e.serial_no && e.serial_no.toLowerCase().includes(q))
  );
}

export async function saveExtinguisher(ext) {
  return db.put('extinguishers', ext);
}

export async function countExtinguishers() {
  return db.count('extinguishers');
}

// ─── Inspections ───

export async function getAllInspections() {
  return db.getAll('inspections');
}

export async function getInspectionById(id) {
  return db.getById('inspections', id);
}

export async function getInspectionByInspectionId(inspectionId) {
  return db.getOneByIndex('inspections', 'inspection_id', inspectionId);
}

export async function getInspectionsByMonth(month) {
  return db.getByIndex('inspections', 'inspection_month', month);
}

export async function getInspectionsByCode(code) {
  return db.getByIndex('inspections', 'extinguisher_code', code);
}

export async function saveInspection(record) {
  return db.put('inspections', record);
}

export async function countInspections() {
  return db.count('inspections');
}

/**
 * Get latest inspection for a given extinguisher in a given month.
 */
export async function getLatestInspection(extCode, month) {
  const all = await getInspectionsByCode(extCode);
  const inMonth = all.filter(i => i.inspection_month === month);
  if (!inMonth.length) return null;
  inMonth.sort((a, b) => new Date(b.inspection_date_time) - new Date(a.inspection_date_time));
  return inMonth[0];
}

/**
 * Get dashboard stats for a given month.
 */
export async function getDashboardStats(month) {
  const extinguishers = await getAllExtinguishers();
  const inspections = await getInspectionsByMonth(month);

  // Deduplicate: only latest per extinguisher
  const latestMap = {};
  for (const ins of inspections) {
    const existing = latestMap[ins.extinguisher_code];
    if (!existing || new Date(ins.inspection_date_time) > new Date(existing.inspection_date_time)) {
      latestMap[ins.extinguisher_code] = ins;
    }
  }

  const inspected = Object.keys(latestMap);
  const passed = inspected.filter(c => latestMap[c].overall_result === 'pass');
  const failed = inspected.filter(c => latestMap[c].overall_result === 'fail');
  const needsAction = inspected.filter(c => latestMap[c].overall_result === 'needs_action');

  return {
    total: extinguishers.length,
    inspected: inspected.length,
    notInspected: extinguishers.length - inspected.length,
    passed: passed.length,
    failed: failed.length,
    needsAction: needsAction.length,
    latestMap,
  };
}

// ─── Settings ───

export async function getSetting(key) {
  const item = await db.getById('settings', key);
  return item ? item.value : null;
}

export async function setSetting(key, value) {
  return db.put('settings', { key, value });
}

// ─── Data Management ───

export async function exportAll() {
  const extinguishers = await db.getAll('extinguishers');
  const inspections = await db.getAll('inspections');
  const settings = await db.getAll('settings');
  return { extinguishers, inspections, settings, exportedAt: new Date().toISOString() };
}

export async function importAll(data) {
  // Clear existing
  await db.clearStore('extinguishers');
  await db.clearStore('inspections');
  await db.clearStore('settings');

  // Import
  for (const ext of (data.extinguishers || [])) {
    await db.put('extinguishers', ext);
  }
  for (const ins of (data.inspections || [])) {
    await db.put('inspections', ins);
  }
  for (const s of (data.settings || [])) {
    await db.put('settings', s);
  }
}

export async function clearAllData() {
  await db.clearStore('extinguishers');
  await db.clearStore('inspections');
  await db.clearStore('settings');
}
