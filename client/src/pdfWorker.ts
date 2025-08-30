// client/src/pdfWorker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist';
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Make the PDF.js worker match the library version bundled by Vite
GlobalWorkerOptions.workerPort = new PdfJsWorker();
