// client/src/pdfWorker.ts
// Bind worker *on the same module* your app uses: the legacy build.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Create a real Worker (so modern browsers use workerPort)...
import PdfJsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker';

// ...and also expose an explicit URL (so environments that want workerSrc are happy)
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?worker&url';

// Set BOTH for maximum compatibility
pdfjs.GlobalWorkerOptions.workerPort = new PdfJsWorker();
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

