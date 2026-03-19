/**
 * Export / Import Service
 * -----------------------
 * JSON and CSV export, JSON import for backup/restore.
 */

import * as repo from '../storage/repository.js';
import { CHECKLIST_ITEMS, RESULT_LABELS } from '../config/checklist-config.js';

/**
 * Export all data as JSON file download.
 */
export async function exportJSON() {
  const data = await repo.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `fire-inspection-backup-${dateStamp()}.json`);
}

/**
 * Export inspections as CSV file download.
 */
export async function exportCSV() {
  const inspections = await repo.getAllInspections();
  if (!inspections.length) return;

  const checklistHeaders = CHECKLIST_ITEMS.map(i => i.label);
  const headers = [
    'inspection_id',
    'inspection_month',
    'inspection_date_time',
    'inspector_name',
    'extinguisher_code',
    'location_snapshot',
    ...checklistHeaders,
    'overall_result',
    'remarks',
  ];

  const rows = inspections.map(ins => {
    const checklistVals = CHECKLIST_ITEMS.map(item => {
      const v = ins.checklist_answers?.[item.id];
      return v || '';
    });
    return [
      ins.inspection_id,
      ins.inspection_month,
      ins.inspection_date_time,
      ins.inspector_name,
      ins.extinguisher_code,
      ins.location_snapshot,
      ...checklistVals,
      RESULT_LABELS[ins.overall_result] || ins.overall_result || '',
      ins.remarks || '',
    ];
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Add BOM for Thai characters in Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `fire-inspection-${dateStamp()}.csv`);
}

/**
 * Import JSON backup file.
 */
export async function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.extinguishers && !data.inspections) {
          reject(new Error('ไฟล์ไม่ถูกต้อง: ไม่พบข้อมูล extinguishers หรือ inspections'));
          return;
        }
        await repo.importAll(data);
        resolve(data);
      } catch (err) {
        reject(new Error('ไฟล์ JSON ไม่ถูกต้อง'));
      }
    };
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่ได้'));
    reader.readAsText(file);
  });
}

// ─── Helpers ───

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateStamp() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
}
