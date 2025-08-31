// client/src/pdfWorker.ts
import { GlobalWorkerOptions } from 'pdfjs-dist';

// 1) A real Worker instance for browsers
import PdfJsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker';

// 2) Also provide an explicit URL for environments that require workerSrc
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker&url';

// Set BOTH: some versions check workerSrc, others use workerPort
GlobalWorkerOptions.workerPort = new PdfJsWorker();
GlobalWorkerOptions.workerSrc = workerUrl;
