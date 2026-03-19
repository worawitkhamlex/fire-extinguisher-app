/**
 * Inspection Service
 * ------------------
 * Business logic for creating and saving inspection records.
 */

import * as repo from '../storage/repository.js';
import { generateInspectionId } from '../utils/id-utils.js';
import { getCurrentMonth } from '../utils/date-utils.js';
import { CHECKLIST_ITEMS } from '../config/checklist-config.js';

/**
 * Create a new blank inspection record (not yet saved).
 */
export function createBlankInspection(extinguisher, inspectorName) {
  const now = new Date().toISOString();
  const answers = {};
  for (const item of CHECKLIST_ITEMS) {
    answers[item.id] = null; // unanswered
  }

  return {
    inspection_id: generateInspectionId(),
    inspection_month: getCurrentMonth(),
    inspection_date_time: now,
    inspector_name: inspectorName || '',
    extinguisher_code: extinguisher.extinguisher_code,
    location_snapshot: extinguisher.location,
    checklist_answers: answers,
    remarks: '',
    overall_result: null,
    photos: [], // placeholder for future camera feature
    created_at: now,
    updated_at: now,
  };
}

/**
 * Save an inspection record to storage.
 */
export async function saveInspection(record) {
  record.updated_at = new Date().toISOString();
  return repo.saveInspection(record);
}

/**
 * Validate that required checklist items are answered and overall result is set.
 */
export function validateInspection(record) {
  const errors = [];

  if (!record.inspector_name || !record.inspector_name.trim()) {
    errors.push('กรุณาระบุชื่อผู้ตรวจ');
  }

  // Check required checklist items
  const unanswered = CHECKLIST_ITEMS.filter(
    item => item.required && !record.checklist_answers[item.id]
  );
  if (unanswered.length > 0) {
    errors.push(`มี ${unanswered.length} รายการที่ยังไม่ได้ตรวจ`);
  }

  if (!record.overall_result) {
    errors.push('กรุณาเลือกผลสรุปการตรวจ');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Auto-determine overall result based on checklist answers.
 */
export function suggestOverallResult(answers) {
  const vals = Object.values(answers).filter(v => v !== null);
  if (vals.length === 0) return null;
  if (vals.some(v => v === 'fail')) return 'fail';
  if (vals.every(v => v === 'pass' || v === 'na')) return 'pass';
  return 'needs_action';
}
