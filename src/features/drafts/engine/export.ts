import type Konva from "konva";

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function exportStagePng(
  stage: Konva.Stage,
  filename = "tailor-draft.png",
): string {
  const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  downloadDataUrl(dataUrl, filename);
  return dataUrl;
}

export async function exportStagePdf(
  stage: Konva.Stage,
  filename = "tailor-draft.pdf",
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  const width = stage.width();
  const height = stage.height();

  // A4 portrait in mm
  const pdf = new jsPDF({
    orientation: height >= width ? "portrait" : "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2 - 14;

  const scale = Math.min(maxW / width, maxH / height);
  const drawW = width * scale;
  const drawH = height * scale;
  const x = (pageW - drawW) / 2;
  const y = margin + 10;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text("Tailor — Drafting Engine", margin, margin + 4);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(`Exported ${new Date().toLocaleString()}`, margin, margin + 8);

  pdf.addImage(dataUrl, "PNG", x, y, drawW, drawH);
  pdf.save(filename);
}

/**
 * Opens a print-friendly layout with the draft image and a measurements table.
 */
export function openPrintLayout(
  stage: Konva.Stage,
  rows: Array<{ label: string; formula: string; value: string }>,
): void {
  const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  const tableRows = rows
    .map(
      (row) =>
        `<tr><td>${row.label}</td><td>${row.formula}</td><td style="text-align:right;font-variant-numeric:tabular-nums">${row.value}</td></tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Tailor — Print Layout</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body { font-family: Georgia, "Times New Roman", serif; color: #1a1f24; margin: 0; }
    h1 { font-size: 18pt; margin: 0 0 4px; letter-spacing: -0.02em; }
    .meta { font-size: 9pt; color: #5c6670; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; align-items: start; }
    img { width: 100%; border: 1px solid #d7dde3; border-radius: 8px; background: oklch(0.97 0.01 230); }
    table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    th, td { border-bottom: 1px solid #e3e8ee; padding: 6px 4px; text-align: left; }
    th { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.08em; color: #5c6670; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="margin:12px;padding:8px 14px;border-radius:8px;border:0;background:#1a6b5a;color:#fff;font:600 12px system-ui">Print</button>
  <h1>Tailor — Intelligent Draft</h1>
  <p class="meta">Print layout · ${new Date().toLocaleString()}</p>
  <div class="grid">
    <img src="${dataUrl}" alt="Draft board" />
    <table>
      <thead><tr><th>Measurement</th><th>Formula</th><th>Value</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new Error("Pop-up blocked — allow pop-ups to open the print layout.");
  }
  printWindow.document.write(html);
  printWindow.document.close();
}
