/**
 * Date Utilities
 */

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

export function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(yyyymm) {
  const [y, m] = yyyymm.split('-');
  const mi = parseInt(m, 10) - 1;
  return `${THAI_MONTHS[mi]} ${parseInt(y, 10) + 543}`;
}

export function formatMonthShort(yyyymm) {
  const [y, m] = yyyymm.split('-');
  const mi = parseInt(m, 10) - 1;
  return `${THAI_MONTHS_SHORT[mi]} ${parseInt(y, 10) + 543}`;
}

export function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  const day = d.getDate();
  const mi = d.getMonth();
  const year = d.getFullYear() + 543;
  return `${day} ${THAI_MONTHS_SHORT[mi]} ${year}`;
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  const day = d.getDate();
  const mi = d.getMonth();
  const year = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${THAI_MONTHS_SHORT[mi]} ${year} ${hh}:${mm}`;
}

export function prevMonth(yyyymm) {
  let [y, m] = yyyymm.split('-').map(Number);
  m--;
  if (m < 1) { m = 12; y--; }
  return `${y}-${String(m).padStart(2, '0')}`;
}

export function nextMonth(yyyymm) {
  let [y, m] = yyyymm.split('-').map(Number);
  m++;
  if (m > 12) { m = 1; y++; }
  return `${y}-${String(m).padStart(2, '0')}`;
}
