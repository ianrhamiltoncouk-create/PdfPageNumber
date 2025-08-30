import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs/promises";
import path from "path";

// Use Render's ephemeral disk for uploads
const UPLOAD_DIR = "/tmp/uploads";

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

// Store files on disk (not RAM) and cap size (e.g., 8 MB)
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || ".pdf") || ".pdf";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    },
  }),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  await ensureUploadDir();

  app.post("/api/stamp", upload.single("file"), async (req, res) => {
    let tempPath: string | undefined;

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      tempPath = req.file.path; // /tmp/uploads/...
      const inputBytes = await fs.readFile(tempPath);

      const pdfDoc = await PDFDocument.load(inputBytes);
      const pages = pdfDoc.getPages();

      pages.forEach((page, i) => {
        page.drawText(`Page ${i + 1}`, {
          x: 50,
          y: 50,
          size: 12,
        });
      });

      const outBytes = await pdfDoc.save();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="stamped.pdf"');
      return res.status(200).send(Buffer.from(outBytes));
    } catch (err: any) {
      if (err && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({ message: "PDF too large (max 8 MB on free plan)" });
      }
      console.error(err);
      return res.status(500).json({ message: "Failed to process PDF" });
    } finally {
      if (tempPath) {
        try {
          await fs.unlink(tempPath);
        } catch {}
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
