import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

// ==========================
// Extract Text From Document
// ==========================
export const extractTextFromDocument = async (
  filePath: string,
  mimeType: string
): Promise<string> => {
  try {
    // ==========================
    // PDF
    // ==========================
    if (mimeType === "application/pdf") {
      const fileBuffer = await fs.readFile(filePath);

      const parser = new PDFParse({
        data: fileBuffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      return result.text.trim();
    }

    // ==========================
    // DOCX
    // ==========================
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      return result.value.trim();
    }

    // ==========================
    // TXT
    // ==========================
    if (mimeType === "text/plain") {
      const text = await fs.readFile(filePath, "utf-8");

      return text.trim();
    }

    throw new Error(
      `Unsupported document type: ${mimeType}`
    );
  } catch (error) {
    console.error(
      "Document text extraction failed:",
      error
    );

    throw error;
  }
};