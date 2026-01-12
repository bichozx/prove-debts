// src/debts/dto/debt-summary.dto.ts
// src/debts/interfaces/debt-summary-raw.interface.ts
export interface DebtSummaryRaw {
  totalDebts: string;
  totalAmount: string;
  paidAmount: string;
  pendingAmount: string;
  countPaid: string;
  countPending: string;
}
