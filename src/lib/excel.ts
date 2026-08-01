import ExcelJS from "exceljs";

// Shared column template used for BOTH import and export, per spec:
// "Export: Same template as import"
export const CUSTOMER_TEMPLATE_COLUMNS = [
  { header: "Customer Name", key: "customerName", width: 28 },
  { header: "Account Number", key: "accountNumber", width: 20 },
  { header: "Denomination", key: "denomination", width: 16 },
  { header: "Opening Date", key: "openingDate", width: 16 },
  { header: "Month Paid Upto", key: "monthPaidUpto", width: 18 },
] as const;

export interface ParsedCustomerRow {
  rowNumber: number;
  customerName: string;
  accountNumber: string;
  denomination: number;
  openingDate: string; // ISO
  monthPaidUpto: string; // ISO
  errors: string[];
}

function excelDateToISO(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  if (typeof value === "number") {
    // Excel serial date
    const d = new Date(Math.round((value - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

export async function parseCustomerWorkbook(buffer: Buffer): Promise<ParsedCustomerRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  const rows: ParsedCustomerRow[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const values = row.values as unknown[];
    const customerName = String(values[1] ?? "").trim();
    const accountNumber = String(values[2] ?? "").trim();
    const denomination = Number(values[3] ?? 0);
    const openingDate = excelDateToISO(values[4]);
    const monthPaidUpto = excelDateToISO(values[5]);

    if (!customerName && !accountNumber) return; // skip fully blank rows

    const errors: string[] = [];
    if (!customerName) errors.push("Customer Name is required");
    if (!accountNumber) errors.push("Account Number is required");
    if (!denomination || denomination <= 0) errors.push("Denomination must be a positive number");
    if (!openingDate) errors.push("Opening Date is invalid or missing");
    if (!monthPaidUpto) errors.push("Month Paid Upto is invalid or missing");

    rows.push({
      rowNumber,
      customerName,
      accountNumber,
      denomination,
      openingDate: openingDate ?? "",
      monthPaidUpto: monthPaidUpto ?? "",
      errors,
    });
  });

  // Duplicate validation within the file itself
  const seen = new Map<string, number>();
  rows.forEach((r) => {
    if (!r.accountNumber) return;
    if (seen.has(r.accountNumber)) {
      r.errors.push(`Duplicate Account Number in file (also row ${seen.get(r.accountNumber)})`);
    } else {
      seen.set(r.accountNumber, r.rowNumber);
    }
  });

  return rows;
}

export async function buildCustomerWorkbook(
  customers: {
    customerName: string;
    accountNumber: string;
    denomination: number;
    openingDate: Date;
    monthPaidUpto: Date;
  }[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Customers");
  sheet.columns = CUSTOMER_TEMPLATE_COLUMNS as unknown as ExcelJS.Column[];
  sheet.getRow(1).font = { bold: true };

  customers.forEach((c) => {
    sheet.addRow({
      customerName: c.customerName,
      accountNumber: c.accountNumber,
      denomination: c.denomination,
      openingDate: c.openingDate.toISOString().slice(0, 10),
      monthPaidUpto: c.monthPaidUpto.toISOString().slice(0, 10),
    });
  });

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
