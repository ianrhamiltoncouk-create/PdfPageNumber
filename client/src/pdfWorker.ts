import { GlobalWorkerOptions } from 'pdfjs-dist';
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Wire the worker Vite bundles to PDF.js
GlobalWorkerOptions.workerPort = new PdfJsWorker();

