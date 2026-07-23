// Payroll computation config. Simplified, configurable defaults — the Settings
// module (Phase 3) can later override these. Monetary values are per-month.

// Employee provident-fund contribution as a fraction of base salary.
export const PROVIDENT_FUND_RATE = 0.1;

// Progressive monthly income-tax slabs (illustrative, Nepal-style tiers).
// Each slab taxes the portion of monthly gross within [upTo of previous, upTo].
export const TAX_SLABS = [
  { upTo: 50000, rate: 0 },
  { upTo: 70000, rate: 0.1 },
  { upTo: 200000, rate: 0.2 },
  { upTo: Infinity, rate: 0.3 },
];

// Progressive tax on a monthly gross amount.
export const computeTax = (monthlyGross) => {
  let tax = 0;
  let lower = 0;
  for (const slab of TAX_SLABS) {
    if (monthlyGross <= lower) break;
    const taxable = Math.min(monthlyGross, slab.upTo) - lower;
    tax += taxable * slab.rate;
    lower = slab.upTo;
  }
  return Math.round(tax);
};

// Days in a given month (month is 1-12).
export const daysInMonth = (month, year) => new Date(year, month, 0).getDate();
