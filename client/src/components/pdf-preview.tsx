import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import type { PdfFile, NumberingSettings, PositionSettings, FontSettings } from "@/pages/pdf-numbering";
import { calculateNumberPosition, shouldShowNumber, getDisplayNumber } from "@/lib/pdf-processor";
import { convertToPoints } from "@/lib/unit-converter";

interface PdfPreviewProps {
  pdfFile: PdfFile | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  numberingSettings: NumberingSettings;
  positionSettings: PositionSettings;
  fontSettings: FontSettings;
}

export default function PdfPreview({
  pdfFile,
  currentPage,
  onPageChange,
  numberingSettings,
  positionSettings,
  fontSettings,
}: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(75);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!pdfFile) return;

    const renderPage = async () => {
      try {
        console.log('Rendering page', currentPage, 'with zoom', zoom);
        
        // Import PDF.js dynamically
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        
        // Create a fresh copy of the ArrayBuffer to avoid detached buffer issues
        const arrayBufferCopy = pdfFile.arrayBuffer.slice(0);
        const pdf = await pdfjsLib.getDocument({ data: arrayBufferCopy }).promise;
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('Canvas ref not available');
          return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
          console.error('Canvas context not available');
          return;
        }

        const viewport = page.getViewport({ scale: zoom / 100 });
        setPageSize({ width: viewport.width, height: viewport.height });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
        
        console.log('Page rendered successfully');
      } catch (error) {
        console.error("Error rendering page:", error, error instanceof Error ? error.message : String(error));
      }
    };

    renderPage();
  }, [pdfFile, currentPage, zoom]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pdfFile && currentPage < pdfFile.pageCount) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && pdfFile && page <= pdfFile.pageCount) {
      onPageChange(page);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 25));
  };

  // Calculate if number should be shown and what it should be
  const showNumber = pdfFile ? shouldShowNumber(currentPage, numberingSettings, pdfFile.pageCount) : false;
  const displayNumber = pdfFile ? getDisplayNumber(currentPage, numberingSettings) : 0;

  // Calculate number position
  const numberPosition = pageSize.width > 0 ? calculateNumberPosition(
    currentPage,
    positionSettings,
    pageSize,
    convertToPoints(positionSettings.gutterMargin, positionSettings.units)
  ) : { x: 0, y: 0 };

  if (!pdfFile) {
    return (
      <div className="h-full flex flex-col">
        <div className="bg-card border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Preview</h2>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No PDF loaded</h3>
              <p className="text-sm text-muted-foreground">Upload a PDF file to see the preview with page numbering</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <span>Page</span>
                <Input
                  type="number"
                  min="1"
                  max={pdfFile.pageCount}
                  value={currentPage}
                  onChange={handlePageInput}
                  className="w-16 text-center"
                  data-testid="input-current-page"
                />
                <span>of</span>
                <span data-testid="text-total-pages">{pdfFile.pageCount}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= pdfFile.pageCount}
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} data-testid="button-zoom-out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center" data-testid="text-zoom-level">
              {zoom}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} data-testid="button-zoom-in">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-center h-full">
          <div className="relative inline-block">
            <div className="relative shadow-lg border border-border rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="block"
                data-testid="canvas-pdf-preview"
              />

              {/* Number Overlay */}
              {showNumber && (
                <div
                  className="absolute pointer-events-none bg-black/80 text-white px-2 py-1 rounded text-sm font-medium z-10"
                  style={{
                    left: `${numberPosition.x}px`,
                    bottom: `${pageSize.height - numberPosition.y}px`,
                    fontSize: `${(fontSettings.size * zoom) / 100}px`,
                    color: fontSettings.color,
                    opacity: fontSettings.opacity / 100,
                    fontFamily: fontSettings.family === "inter" ? "Inter" : fontSettings.family,
                    transform: "translate(-50%, 50%)",
                  }}
                  data-testid="overlay-page-number"
                >
                  {displayNumber}
                </div>
              )}

              {/* Gutter Visualization */}
              {positionSettings.gutterMargin > 0 && (
                <div className="absolute inset-0 pointer-events-none" data-testid="visualization-gutter">
                  {/* Gutter guide lines */}
                  <div
                    className="absolute w-0.5 h-16 bg-blue-500/50"
                    style={{
                      left: `${numberPosition.x}px`,
                      bottom: `${pageSize.height - numberPosition.y - 32}px`,
                    }}
                  />
                  <div
                    className="absolute w-6 h-0.5 bg-blue-500/50"
                    style={{
                      left: `${numberPosition.x - 12}px`,
                      bottom: `${pageSize.height - numberPosition.y}px`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Preview Info */}
            <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs" data-testid="info-preview-status">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${showNumber ? "bg-green-500" : "bg-red-500"}`} />
                <span>
                  Page {currentPage} • {showNumber ? "Number visible" : "Number hidden"} • 
                  Gutter: {positionSettings.gutterMargin}{positionSettings.units}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
