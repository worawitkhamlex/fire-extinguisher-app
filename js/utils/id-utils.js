/**
 * ID Utilities
 */

/**
 * Generate a unique inspection ID like INS-20260319-A3F2
 */
export function generateInspectionId() {
  const d = new Date();
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INS-${date}-${rand}`;
}

/**
 * Generate a simple unique key (for IndexedDB auto-increment fallback)
 */
export function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
