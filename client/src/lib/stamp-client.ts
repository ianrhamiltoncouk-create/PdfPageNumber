// client/src/lib/stamp-client.ts
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type {
  NumberingSettings,
  PositionSettings,
  FontSettings,
} from "@/pages/pdf-numbering";
import {
  calculateNumberPosition,
  shouldShowNumber,
  getDisplayNumber,
} from "@/lib/pdf-processor";
import { convertToPoints } from "@/lib/unit-converter";

/**
 * Stamp page numbers on the client and return a Blob(PDF)
 * @param file the uploaded PDF File
 * @param numbering settings that decide which pages show numbers and the display value
 * @param position where to draw (we’ll reuse your preview calculations)
 * @param font font settings (size/color/family/opacity)
 */
export async function stampPdfClientSide(
  file: File,
  numbering: NumberingSettings,
  position: PositionSettings,
  font: FontSettings
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Use a built-in font if a custom one isn’t embedded
  const fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];

    // Decide if this page should show a number
    if (!shouldShowNumber(i + 1, numbering, totalPages)) continue;

    // What number text to render
    const text = String(getDisplayNumber(i + 1, numbering));

    // Page size in PDF points
    const { width, height } = page.getSize();

    // Calculate position (re-using your existing helper)
    const pos = calculateNumberPosition(
      i + 1,
      position,
      { width, height },
      convertToPoints(position.gutterMargin, position.units)
    );

    // Translate preview “y from bottom” logic to pdf-lib’s coords
    const x = pos.x; // already in points
    const y = pos.y; // helper should already give a point value from bottom

    // Font setup (fallback to Helvetica)
    const fontSize = font.size; // in points
    const color = parseCssColor(font.color, font.opacity / 100);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font: fallbackFont,
      color,
    });
  }

  const out = await pdfDoc.save();
  return new Blob([out], { type: "application/pdf" });
}

// Minimal CSS color parser -> pdf-lib rgb()
function parseCssColor(hexOrCss: string, alpha: number) {
  // Handle hex like "#rrggbb"
  if (/^#?[0-9a-f]{6}$/i.test(hexOrCss)) {
    const hex = hexOrCss.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    // pdf-lib doesn’t support alpha in rgb(); opacity is often handled elsewhere.
    return rgb(r, g, b);
  }
  // Fallback black
  return rgb(0, 0, 0);
}
