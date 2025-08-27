import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import PdfUploader from "@/components/pdf-uploader";
import NumberingControls from "@/components/numbering-controls";
import PositionControls from "@/components/position-controls";
import FontControls from "@/components/font-controls";
import PdfPreview from "@/components/pdf-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { FileText, Loader2 } from "lucide-react";
import { processPdf } from "@/lib/pdf-processor";

export interface PdfFile {
  file: File;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export interface NumberingSettings {
  visibleFromPage: number;
  startNumber: number;
  customRange: boolean;
  rangeFrom: number;
  rangeTo: number;
  skipPattern: string;
}

export interface PositionSettings {
  preset: string;
  customX: number;
  customY: number;
  units: "pt" | "mm" | "in";
  gutterMargin: number;
  gutterPreset: string;
  mirroredGutter: boolean;
}

export interface FontSettings {
  family: string;
  size: number;
  color: string;
  opacity: number;
}

export default function PdfNumberingPage() {
  const [pdfFile, setPdfFile] = useState<PdfFile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingPage, setProcessingPage] = useState(0);
  const { toast } = useToast();

  const [numberingSettings, setNumberingSettings] = useState<NumberingSettings>({
    visibleFromPage: 1,
    startNumber: 1,
    customRange: false,
    rangeFrom: 1,
    rangeTo: 1,
    skipPattern: "",
  });

  const [positionSettings, setPositionSettings] = useState<PositionSettings>({
    preset: "bottom-center",
    customX: 36,
    customY: 24,
    units: "pt",
    gutterMargin: 18,
    gutterPreset: "custom",
    mirroredGutter: false,
  });

  const [fontSettings, setFontSettings] = useState<FontSettings>({
    family: "inter",
    size: 12,
    color: "#000000",
    opacity: 100,
  });

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      console.log('Starting PDF upload...', file.name);
      const arrayBuffer = await file.arrayBuffer();
      
      // Import PDF.js dynamically
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      
      console.log('Loading PDF with PDF.js...');
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded successfully, pages:', pdfDoc.numPages);
      
      setPdfFile({
        file,
        pageCount: pdfDoc.numPages,
        arrayBuffer,
      });
      
      setCurrentPage(1);
      setNumberingSettings(prev => ({ ...prev, rangeTo: pdfDoc.numPages }));
      
      toast({
        title: "PDF loaded successfully",
        description: `${file.name} • ${pdfDoc.numPages} pages`,
      });
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast({
        title: "Error loading PDF",
        description: error instanceof Error ? error.message : "Please ensure the file is a valid PDF document.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleProcess = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingPage(0);

    try {
      const progressCallback = (page: number, total: number) => {
        setProcessingPage(page);
        setProcessingProgress((page / total) * 100);
      };

      const processedPdf = await processPdf(
        pdfFile.arrayBuffer,
        numberingSettings,
        positionSettings,
        fontSettings,
        progressCallback
      );

      // Download the processed PDF
      const blob = new Blob([processedPdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pdfFile.file.name.replace(".pdf", "")}_numbered.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF processed successfully!",
        description: "Your numbered PDF has been downloaded.",
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Error processing PDF",
        description: "An error occurred while adding page numbers.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingPage(0);
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">PDF Numbering</h1>
            </div>

            {/* Upload Section */}
            <div className="border-b border-border pb-6 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                Upload
              </h3>
              <PdfUploader onFileUpload={handleFileUpload} currentFile={pdfFile} />
            </div>

            {/* Numbering Controls */}
            <div className="border-b border-border pb-6 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Numbering
              </h3>
              <NumberingControls
                settings={numberingSettings}
                onSettingsChange={setNumberingSettings}
                totalPages={pdfFile?.pageCount || 1}
              />
            </div>

            {/* Position Controls */}
            <div className="border-b border-border pb-6 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Position
              </h3>
              <PositionControls
                settings={positionSettings}
                onSettingsChange={setPositionSettings}
              />
            </div>

            {/* Font Controls */}
            <div className="border-b border-border pb-6 mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                Font
              </h3>
              <FontControls
                settings={fontSettings}
                onSettingsChange={setFontSettings}
              />
            </div>

            {/* Process Button */}
            <Button
              data-testid="button-process"
              onClick={handleProcess}
              disabled={!pdfFile || isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Numbers & Download"
              )}
            </Button>
          </div>
        </aside>

        {/* Main Preview */}
        <main className="flex-1 bg-muted/30 overflow-hidden">
          <PdfPreview
            pdfFile={pdfFile}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            numberingSettings={numberingSettings}
            positionSettings={positionSettings}
            fontSettings={fontSettings}
          />
        </main>
      </div>

      {/* Processing Modal */}
      <Dialog open={isProcessing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">Processing PDF</DialogTitle>
            <DialogDescription className="sr-only">Adding page numbers to your document</DialogDescription>
          </DialogHeader>
          <div className="text-center p-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Processing PDF</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adding page numbers to your document...
            </p>
            <Progress value={processingProgress} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              Processing page {processingPage} of {pdfFile?.pageCount || 0}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
