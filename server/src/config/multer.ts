import multer from "multer";
import path from "path";
import fs from "fs";

// ==========================
// Upload Directory
// ==========================

const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// ==========================
// Storage
// ==========================

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

// ==========================
// Allowed File Types
// ==========================

const allowedMimeTypes = [
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "text/plain",

  "text/markdown",
];

// ==========================
// File Filter
// ==========================

const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOCX, TXT and Markdown files are allowed."
      )
    );
  }
};

// ==========================
// Upload Middleware
// ==========================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export default upload;