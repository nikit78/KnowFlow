import { extractTextFromDocument } from "./services/documentExtractionService.js";

const filePath =
  "C:\\projects\\Knowflow\\server\\uploads\\1786274199559-679155175.pdf";

const mimeType = "application/pdf";

const runTest = async () => {
  try {
    console.log("Starting document extraction test...");

    const text = await extractTextFromDocument(
      filePath,
      mimeType
    );

    console.log("=================================");
    console.log("Extraction successful!");
    console.log("=================================");

    console.log("Extracted text length:", text.length);

    console.log("=================================");
    console.log("First 1000 characters:");
    console.log("=================================");

    console.log(text.slice(0, 1000));
  } catch (error) {
    console.error("Extraction test failed:", error);
  }
};

runTest();