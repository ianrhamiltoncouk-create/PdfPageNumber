// client/src/pdfWorker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist';
import PdfJsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker';

// Wire the worker bundled by Vite (legacy build = safest in browsers)
GlobalWorkerOptions.workerPort = new PdfJsWorker();
