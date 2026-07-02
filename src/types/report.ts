export type ReportPeriod = {
  fromDate?: string;
  toDate?: string;
};

export type ReportGenerator = {
  name: string;
  role: "admin" | "cashier" | "manager" | "owner";
  branchName?: string | null;
};

export type PdfReportOptions = {
  title: string;
  period?: ReportPeriod;
  generatedBy: ReportGenerator;
};

export type ReportFilters = ReportPeriod & {
  branchId?: string;
  status?: string;
};
