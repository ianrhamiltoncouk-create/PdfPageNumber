import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { PDFDocument } from "pdf-lib";

// set up multer for file uploads (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/stamp — add page numbers to uploaded PDF
  app.post("/api/stamp", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Load uploaded PDF
      const pdfDoc = await PDFDocument.load(req.file.buffer);
      const pages = pdfDoc.getPages();

      // Add page numbers
      pages.forEach((page, i) => {
        page.drawText(`Page ${i + 1}`, {
          x: 50,
          y: 50,
          size: 12,
        });
      });

      const pdfBytes = await pdfDoc.save();

      // Send modified PDF back
      res.setHeader("Content-Type", "application/pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to process PDF" });
    }
  });

  // return HTTP server with Express app
  const httpServer = createServer(app);
  return httpServer;
}
