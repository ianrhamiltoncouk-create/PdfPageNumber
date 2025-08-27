import type { NumberingSettings, PositionSettings, FontSettings } from "@/pages/pdf-numbering";
import { convertToPoints } from "./unit-converter";

/**
 * Process PDF with page numbering
 * This function uses pdf-lib to add page numbers to a PDF document
 */
export async function processPdf(
  pdfArrayBuffer: ArrayBuffer,
  numberingSettings: NumberingSettings,
  positionSettings: PositionSettings,
  fontSettings: FontSettings,
  onProgress: (page: number, total: number) => void
): Promise<Uint8Array> {
  try {
    // Import pdf-lib dynamically
    const PDFLib = await import('pdf-lib');
    
    console.log('Loading PDF document...');
    const pdfDoc = await PDFLib.PDFDocument.load(pdfArrayBuffer);
    const pages = pdfDoc.getPages();
    console.log(`PDF loaded with ${pages.length} pages`);

    // Embed font
    let font;
    try {
      switch (fontSettings.family) {
        case "helvetica":
          font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          break;
        case "times":
          font = await pdfDoc.embedFont(PDFLib.StandardFonts.TimesRoman);
          break;
        default:
          font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          break;
      }
    } catch (error) {
      console.error("Error embedding font:", error);
      font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    }

    const fontSize = fontSettings.size;
    const opacity = fontSettings.opacity / 100;
    const gutterPt = convertToPoints(positionSettings.gutterMargin, positionSettings.units);

    // Parse skip pattern
    const skipPages = parseSkipPattern(numberingSettings.skipPattern);

    for (let i = 0; i < pages.length; i++) {
      const pageNum = i + 1;
      onProgress(pageNum, pages.length);

      // Check if this page should have a number
      if (!shouldShowNumber(pageNum, numberingSettings, pages.length)) {
        continue;
      }

      // Check if this page is in skip pattern
      if (skipPages.has(pageNum)) {
        continue;
      }

      const page = pages[i];
      const { width, height } = page.getSize();
      const displayNumber = getDisplayNumber(pageNum, numberingSettings);

      // Calculate position
      const position = calculateNumberPosition(
        pageNum,
        positionSettings,
        { width, height },
        gutterPt
      );

      // Convert hex color to RGB
      const rgb = hexToRgb(fontSettings.color);

      // Draw the number
      page.drawText(displayNumber.toString(), {
        x: position.x,
        y: position.y,
        size: fontSize,
        font: font,
        color: PDFLib.rgb(rgb.r / 255, rgb.g / 255, rgb.b / 255),
        opacity: opacity,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error in processPdf:', error);
    throw error;
  }
}

/**
 * Calculate the position for page numbers based on settings
 */
export function calculateNumberPosition(
  pageNum: number,
  positionSettings: PositionSettings,
  pageSize: { width: number; height: number },
  gutterPt: number
): { x: number; y: number } {
  const { preset, customX, customY, mirroredGutter } = positionSettings;
  const { width, height } = pageSize;

  // Base margins (24pt from edges)
  const baseMargin = 24;
  let x: number, y: number;

  if (preset === "custom") {
    x = convertToPoints(customX, positionSettings.units);
    y = convertToPoints(customY, positionSettings.units);
  } else {
    // Calculate base position from preset
    switch (preset) {
      case "bottom-center":
        x = width / 2;
        y = baseMargin;
        break;
      case "bottom-outer":
        x = width - baseMargin;
        y = baseMargin;
        break;
      case "bottom-inner":
        x = baseMargin;
        y = baseMargin;
        break;
      case "top-center":
        x = width / 2;
        y = height - baseMargin;
        break;
      case "top-outer":
        x = width - baseMargin;
        y = height - baseMargin;
        break;
      case "top-inner":
        x = baseMargin;
        y = height - baseMargin;
        break;
      default:
        x = width / 2;
        y = baseMargin;
    }

    // Apply gutter adjustment for inner/outer positions
    if (mirroredGutter && gutterPt > 0) {
      const isOddPage = pageNum % 2 === 1;
      
      if (preset.includes("inner")) {
        // Inner edge: left for odd pages (right-hand), right for even pages (left-hand)
        if (isOddPage) {
          x += gutterPt; // Move away from left edge (inner edge for odd pages)
        } else {
          x -= gutterPt; // Move away from right edge (inner edge for even pages)
        }
      } else if (preset.includes("outer")) {
        // Outer edge: right for odd pages (right-hand), left for even pages (left-hand)
        if (isOddPage) {
          x -= gutterPt; // Move away from right edge (outer edge for odd pages)
        } else {
          x += gutterPt; // Move away from left edge (outer edge for even pages)
        }
      }
      // Center positions don't get gutter adjustment unless specifically configured
    }
  }

  return { x, y };
}

/**
 * Determine if a page should show a number
 */
export function shouldShowNumber(
  pageNum: number,
  settings: NumberingSettings,
  totalPages: number
): boolean {
  // Check if page is before visible start
  if (pageNum < settings.visibleFromPage) {
    return false;
  }

  // Check custom range
  if (settings.customRange) {
    if (pageNum < settings.rangeFrom || pageNum > settings.rangeTo) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate the display number for a page
 */
export function getDisplayNumber(
  pageNum: number,
  settings: NumberingSettings
): number {
  // Formula: display = startNumber + (pageNum - visibleFromPage)
  return settings.startNumber + (pageNum - settings.visibleFromPage);
}

/**
 * Parse skip pattern string into a Set of page numbers
 */
function parseSkipPattern(pattern: string): Set<number> {
  const skipPages = new Set<number>();
  
  if (!pattern.trim()) {
    return skipPages;
  }

  const parts = pattern.split(",").map(p => p.trim());
  
  for (const part of parts) {
    if (part.includes("-")) {
      // Range like "10-12"
      const [start, end] = part.split("-").map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          skipPages.add(i);
        }
      }
    } else {
      // Single page like "1"
      const pageNum = parseInt(part);
      if (!isNaN(pageNum)) {
        skipPages.add(pageNum);
      }
    }
  }

  return skipPages;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}