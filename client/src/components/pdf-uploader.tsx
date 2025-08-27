import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import type { PdfFile } from "@/pages/pdf-numbering";

interface PdfUploaderProps {
  onFileUpload: (file: File) => void;
  currentFile: PdfFile | null;
}

export default function PdfUploader({ onFileUpload, currentFile }: PdfUploaderProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.currentTarget.classList.remove("border-primary", "bg-muted");

      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === "application/pdf") {
        onFileUpload(files[0]);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-muted");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-muted");
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && files[0].type === "application/pdf") {
        onFileUpload(files[0]);
      }
      // Reset input
      e.target.value = "";
    },
    [onFileUpload]
  );

  const handleRemoveFile = useCallback(() => {
    // This would need to be implemented in the parent component
    // For now, we'll just show the uploader again
  }, []);

  if (currentFile) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-filename">
              {currentFile.file.name}
            </p>
            <p className="text-xs text-muted-foreground" data-testid="text-fileinfo">
              {currentFile.pageCount} pages • {(currentFile.file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveFile}
            data-testid="button-remove-file"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div
        data-testid="dropzone-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById("fileInput")?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-2">Drag & drop your PDF here</p>
        <p className="text-xs text-muted-foreground mb-3">or</p>
        <Button variant="secondary" size="sm" data-testid="button-choose-file">
          Choose File
        </Button>
      </div>
      <input
        type="file"
        id="fileInput"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file"
      />
    </>
  );
}
