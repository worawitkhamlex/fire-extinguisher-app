/**
 * Checklist Configuration
 * -----------------------
 * Config-driven checklist items for monthly fire extinguisher inspection.
 * Based on FM-SD-04-05 Rev.01 inspection form.
 *
 * To add/remove/reorder items, edit this array only — the UI renders dynamically.
 *
 * Each item:
 *   id       — unique key stored in inspection record
 *   label    — display name (Thai)
 *   desc     — optional short description (pass/fail criteria)
 *   category — grouping label for visual separation
 *   required — whether it must be answered before saving
 */

export const CHECKLIST_ITEMS = [
  // ─── หมวด: สายฉีด / หัวฉีด (Hose / Nozzle) ───
  {
    id: 'hose_condition',
    label: 'สายฉีด',
    desc: 'ผ่าน: สายไม่แตก ไม่ฉีก ไม่เปื่อย / ไม่ผ่าน: สายแตก บาง เปื่อย',
    category: 'สายฉีด / หัวฉีด',
    required: true,
  },
  {
    id: 'nozzle_condition',
    label: 'หัวฉีด',
    desc: 'ผ่าน: ไม่บุบ สมบูรณ์ / ไม่ผ่าน: หัวฉีดหาย หรือแตก',
    category: 'สายฉีด / หัวฉีด',
    required: true,
  },
  {
    id: 'hose_surface',
    label: 'สภาพผิวสายฉีด/หัวฉีด',
    desc: 'ผ่าน: ไม่มีสนิม / ไม่ผ่าน: สนิมเขรอะ',
    category: 'สายฉีด / หัวฉีด',
    required: true,
  },

  // ─── หมวด: เกจ์ / ขาตั้ง ───
  {
    id: 'bracket_position',
    label: 'ขาตั้ง / ชั้นวาง',
    desc: 'ผ่าน: อยู่ตำแหน่งถูกต้อง สภาพดี / ไม่ผ่าน: ผิดตำแหน่ง ชำรุด',
    category: 'เกจ์ / ขาตั้ง',
    required: true,
  },
  {
    id: 'gauge_condition',
    label: 'เกจ์วัดแรงดัน',
    desc: 'ผ่าน: ไม่มีรอยร้าว เข็มชี้ในโซนเขียว / ไม่ผ่าน: เสียหาย แตกร้าว',
    category: 'เกจ์ / ขาตั้ง',
    required: true,
  },

  // ─── หมวด: ตัวถัง ───
  {
    id: 'body_dent_rust',
    label: 'สภาพตัวถัง',
    desc: 'ผ่าน: ไม่บุบ ไม่เป็นสนิม / ไม่ผ่าน: ตัวถังบุบ หรือสนิมมาก',
    category: 'ตัวถัง',
    required: true,
  },
  {
    id: 'body_surface',
    label: 'สภาพผิวถัง / สี',
    desc: 'ผ่าน: สภาพดี / ไม่ผ่าน: เป็นสนิมมาก สีลอกร่อน',
    category: 'ตัวถัง',
    required: true,
  },
  {
    id: 'blockage',
    label: 'สิ่งอุดตัน',
    desc: 'ผ่าน: ไม่มีสิ่งอุดตัน / ไม่ผ่าน: มีสิ่งอุดตัน',
    category: 'ตัวถัง',
    required: true,
  },
  {
    id: 'leakage',
    label: 'การรั่วไหล',
    desc: 'ผ่าน: ไม่มีรั่วไหลผิดปกติ / ไม่ผ่าน: มีรั่วไหล ใช้งานไม่ได้',
    category: 'ตัวถัง',
    required: true,
  },

  // ─── หมวด: ป้าย / การเข้าถึง ───
  {
    id: 'label_visible',
    label: 'ป้าย / ฉลาก',
    desc: 'ผ่าน: มองเห็นชัดเจน / ไม่ผ่าน: ซีดจาง หลุดหาย',
    category: 'ป้าย / การเข้าถึง',
    required: true,
  },
  {
    id: 'accessibility',
    label: 'การเข้าถึง',
    desc: 'ผ่าน: ไม่มีสิ่งกีดขวาง / ไม่ผ่าน: มีสิ่งขวางบัง เข้าถึงไม่ได้',
    category: 'ป้าย / การเข้าถึง',
    required: true,
  },
  {
    id: 'pin_seal',
    label: 'สลัก / ซีล',
    desc: 'ผ่าน: สมบูรณ์ ไม่ชำรุด / ไม่ผ่าน: หลุด ฉีกขาด ชำรุด',
    category: 'ป้าย / การเข้าถึง',
    required: true,
  },
  {
    id: 'expiry_maintenance',
    label: 'วันหมดอายุ / กำหนดบำรุงรักษา',
    desc: 'ผ่าน: ยังไม่หมดอายุ / ไม่ผ่าน: หมดอายุ หรือต้องส่งบำรุงรักษา',
    category: 'ป้าย / การเข้าถึง',
    required: true,
  },
];

/**
 * Possible answer values for each checklist item
 */
export const CHECKLIST_ANSWERS = {
  PASS: 'pass',
  FAIL: 'fail',
  NA: 'na',
};

/**
 * Overall result options
 */
export const OVERALL_RESULTS = {
  PASS: 'pass',
  FAIL: 'fail',
  NEEDS_ACTION: 'needs_action',
};

export const RESULT_LABELS = {
  pass: 'ผ่าน',
  fail: 'ไม่ผ่าน',
  needs_action: 'ต้องแก้ไข',
};

export const ANSWER_LABELS = {
  pass: '✓',
  fail: '✗',
  na: 'N/A',
};
