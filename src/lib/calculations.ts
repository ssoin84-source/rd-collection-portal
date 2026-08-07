// Core RD (Recurring Deposit) collection calculations.
// These derive Month Due, Pending Amount, Penalty and Total Due Amount
// purely from openingDate, monthPaidUpto and denomination - as required
// by the spec ("Auto-calculate" section).

export const DEFAULT_PENALTY_PER_MONTH = 10; // flat penalty per overdue month, overridable via Settings

function monthsBetween(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  let total = years * 12 + months;
  // If we haven't yet reached the "anniversary day" this month, don't count it
  if (to.getDate() < from.getDate()) total -= 1;
  return Math.max(0, total);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export interface DueDetails {
  monthDue: number;
  monthsPaid: number;
  pendingAmount: number;
  penalty: number;
  totalDueAmount: number;
  nextDueDate: Date;
}

export function computeDueDetails(
  openingDate: Date,
  monthPaidUpto: Date,
  denomination: number,
  penaltyPerMonth: number = DEFAULT_PENALTY_PER_MONTH,
  asOf: Date = new Date()
): DueDetails {
  const monthsElapsed = monthsBetween(openingDate, asOf) + 1; // +1: the opening month itself is payable
  const monthsPaid = monthsBetween(openingDate, monthPaidUpto) + 1;
  const monthDue = Math.max(0, monthsElapsed - monthsPaid);

  const pendingAmount = monthDue * denomination;
  const penalty = monthDue * penaltyPerMonth;
  const totalDueAmount = pendingAmount + penalty;
  const nextDueDate = addMonths(monthPaidUpto, 1);

  return { monthDue, monthsPaid, pendingAmount, penalty, totalDueAmount, nextDueDate };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}