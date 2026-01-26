"use client";

export interface SensorReportRow {
  timestamp: string;
  value: number;
  sensorId?: string;
  location?: string | null;
}

export interface PdfDateRange {
  start?: Date | null;
  end?: Date | null;
}

interface ExportOptions {
  projectName?: string;
  dateRange?: PdfDateRange;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
}

function formatRange(range?: PdfDateRange) {
  if (!range?.start && !range?.end) return "All data";
  const startText = range?.start ? formatDateTime(range.start) : "Start";
  const endText = range?.end ? formatDateTime(range.end) : "Now";
  return `${startText} → ${endText}`;
}

export async function exportSensorReportPdf(rows: SensorReportRow[], options?: ExportOptions) {
  if (!rows.length) {
    throw new Error("No data available to export");
  }

  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const projectName = options?.projectName ?? "TynysAi";
  const dateRange = options?.dateRange;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(projectName, 14, 18);

  doc.setFontSize(11);
  doc.text(`Date range: ${formatRange(dateRange)}`, 14, 26);

  doc.setFontSize(10);
  doc.text(`Generated ${formatDateTime(new Date())}`, 14, 32);

  autoTable(doc, {
    startY: 38,
    head: [["#", "Timestamp", "Sensor", "Value", "Location"]],
    body: rows.map((row, idx) => [
      idx + 1,
      formatDateTime(row.timestamp),
      row.sensorId ?? "—",
      row.value.toFixed(2),
      row.location ?? "—",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [55, 65, 81] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  const rangeSlug = formatRange(dateRange).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
  const filename = rangeSlug ? `tynysai-analytics-${rangeSlug}.pdf` : "tynysai-analytics.pdf";
  doc.save(filename);
}
