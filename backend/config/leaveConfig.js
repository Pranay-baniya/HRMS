// Default annual leave entitlements (days per calendar year), per leave type.
// "unpaid" is intentionally omitted — it is not balance-tracked (unlimited, but unpaid).
// The Settings module (Phase 3) can later override these values.
export const LEAVE_ENTITLEMENTS = {
  sick: 12,
  casual: 12,
  annual: 18,
};

// Inclusive number of calendar days between two dates (e.g. same-day leave = 1 day).
export const inclusiveDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
};
