import { Response } from "express";
import mongoose from "mongoose";
import fs from "fs/promises";
import Document from "../models/Document.js";
import DocumentChunk from "../models/DocumentChunk.js";
import SearchHistory from "../models/SearchHistory.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { extractTextFromDocument } from "../services/documentExtractionService.js";
import { createDocumentChunks } from "../services/documentChunkService.js";
import { getDocumentChunks as retrieveDocumentChunks } from "../services/documentRetrievalService.js";
import { searchDocumentChunks } from "../services/documentSearchService.js";
import { retrieveRagContext } from "../services/ragRetrievalService.js";
import { generateRagAnswer } from "../services/ragAnswerService.js";

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

type DocumentType =
  | "research-paper"
  | "annual-report"
  | "financial-statement"
  | "lecture-notes"
  | "book"
  | "other";

// ==========================
// Upload Document
// With Text Extraction
// ==========================
export const uploadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // ==========================
    // Check File
    // ==========================
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    // ==========================
    // Get Body Data
    // ==========================
    const {
      title,
      documentType,
      tags,
    } = req.body;

    // ==========================
    // Create Document
    // Initially Processing
    // ==========================
    let document;

try {
  document = await Document.create({
    title:
      title || req.file.originalname,

    originalName:
      req.file.originalname,

    fileName:
      req.file.filename,

    filePath:
      req.file.path,

    fileSize:
      req.file.size,

    mimeType:
      req.file.mimetype,

    documentType:
      documentType || "other",

    status: "processing",

    extractedText: "",

    tags: tags
      ? tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      : [],

    user: req.user!._id,
  });
} catch (databaseError) {
  console.error(
    "Failed to create document record:",
    databaseError
  );

  try {
    await fs.unlink(req.file.path);
  } catch (fileError) {
    const error = fileError as NodeJS.ErrnoException;

    if (error.code !== "ENOENT") {
      console.error(
        "Failed to delete uploaded file after database error:",
        fileError
      );
    }
  }

  res.status(500).json({
    success: false,
    message: "Failed to save document",
  });

  return;
}

    // ==========================
    // Extract Text
    // ==========================
    try {
      const extractedText =
        await extractTextFromDocument(
          req.file.path,
          req.file.mimetype
        );

      // ==========================
      // Update Document
      // ==========================
      document.extractedText =
        extractedText;

      document.status = "processed";

      await document.save();

      // ==========================
// Create Document Chunks
// ==========================

const chunks = await createDocumentChunks(
  document._id,
  document.user,
  extractedText
);

console.log(
  `Created ${chunks.length} chunks for document ${document._id}`
);

      // ==========================
      // Success Response
      // ==========================
      res.status(201).json({
        success: true,
        message:
          "Document uploaded and processed successfully",
        document,
      });
   } catch (processingError) {
  console.error(
    "Document processing failed:",
    processingError
  );

  // ==========================
  // Mark As Failed
  // ==========================
  document.status = "failed";

  await document.save();

  // ==========================
  // Cleanup Uploaded File
  // ==========================
  try {
    await fs.unlink(document.filePath);
  } catch (fileError) {
    const error = fileError as NodeJS.ErrnoException;

    // Ignore file-not-found errors
    if (error.code !== "ENOENT") {
      console.error(
        "Failed to delete uploaded file after processing failure:",
        fileError
      );
    }
  }

  res.status(500).json({
    success: false,
    message:
      "Document uploaded but processing failed",
    documentId: document._id,
  });
}
  } catch (error) {
    console.error(
      "Upload document error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get All Documents
// With Filters + Pagination + Sorting
// ==========================
export const getDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type, status, tag } = req.query;

    // ==========================
    // Pagination
    // ==========================

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    // ==========================
    // Filters
    // ==========================

    const filter: Record<string, unknown> = {
      user: req.user!._id,
      isDeleted: false,
    };

    // Filter by document type
    if (typeof type === "string" && type.trim()) {
      filter.documentType = type.trim();
    }

    // Filter by document status
    if (typeof status === "string" && status.trim()) {
      filter.status = status.trim();
    }

    // Filter by tag
    if (typeof tag === "string" && tag.trim()) {
      filter.tags = {
        $regex: tag.trim(),
        $options: "i",
      };
    }

    // ==========================
    // Sorting
    // ==========================

    const sortBy =
      typeof req.query.sortBy === "string"
        ? req.query.sortBy
        : "createdAt";

    const sortOrder =
      req.query.order === "asc" ? 1 : -1;

    const allowedSortFields = [
      "createdAt",
      "title",
      "fileSize",
      "updatedAt",
    ];

    const finalSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    const sortOptions: Record<string, 1 | -1> = {
      [finalSortBy]: sortOrder,
    };

    // ==========================
    // Total Documents
    // ==========================

    const totalDocuments = await Document.countDocuments(filter);

    // ==========================
    // Get Documents
    // ==========================

    const documents = await Document.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // ==========================
    // Pagination Information
    // ==========================

    const totalPages = Math.ceil(
      totalDocuments / limit
    );

    res.status(200).json({
      success: true,

      count: documents.length,

      pagination: {
        page,
        limit,
        totalDocuments,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },

      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Single Document
// ==========================
export const getDocumentById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getDocumentChunks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const chunks = await retrieveDocumentChunks(
      req.user!._id,
      id as unknown as mongoose.Types.ObjectId
    );

    res.status(200).json({
      success: true,
      chunks,
    });
  } catch (error) {
    console.error("Get document chunks error:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Delete Document (Soft Delete)
// ==========================
export const deleteDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    document.isDeleted = true;
    document.deletedAt = new Date();

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document moved to trash successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Trash Documents
// ==========================
export const getTrashDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: true,
    }).sort({
      deletedAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Restore Document
// ==========================
export const restoreDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: true,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found in trash",
      });
      return;
    }

    document.isDeleted = false;
    document.deletedAt = null;

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document restored successfully",
      document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Permanent Delete Document
// ==========================
export const permanentDeleteDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: true,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found in trash",
      });
      return;
    }

    // Delete physical file if it exists
    try {
      await fs.unlink(document.filePath);
    } catch (fileError) {
      const error = fileError as NodeJS.ErrnoException;

      // Ignore "file not found" because the database
      // record can still be permanently deleted.
      if (error.code !== "ENOENT") {
        throw fileError;
      }
    }

    // Delete all chunks belonging to this document
    // and the currently authenticated user
    await DocumentChunk.deleteMany({
      document: document._id,
      user: req.user!._id,
    });

    // Delete MongoDB document
    await Document.deleteOne({
      _id: document._id,
    });

    res.status(200).json({
      success: true,
      message: "Document permanently deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// ==========================
// Search Documents
// ==========================
export const searchDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const safeQuery = escapeRegex(query);

    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      $or: [
        {
          title: {
            $regex: safeQuery,
            $options: "i",
          },
        },
        {
          originalName: {
           $regex: safeQuery,
            $options: "i",
          },
        },
        {
          documentType: {
            $regex: safeQuery,
            $options: "i",
          },
        },
        {
          tags: {
            $regex: safeQuery,
            $options: "i",
          },
        },
      ],
    }).sort({
      createdAt: -1,
    });

    // Save search query in search history
    await SearchHistory.updateOne(
      {
        user: req.user!._id,
        query,
      },
      {
        $setOnInsert: {
          user: req.user!._id,
          query,
        },
      },
      {
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Document Search Suggestions
// ==========================
export const getDocumentSearchSuggestions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const query = (req.query.q as string)?.trim();

    if (!query) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const safeQuery = escapeRegex(query);

    const suggestions = await SearchHistory.find({
      user: req.user!._id,
      query: {
       $regex: safeQuery,
        $options: "i",
      },
    })
      .select("_id query")
      .sort({
        updatedAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Document Statistics
// ==========================
export const getDocumentStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    // ==========================
    // Total Active Documents
    // ==========================

    const totalDocuments = await Document.countDocuments({
      user: userId,
      isDeleted: false,
    });

    // ==========================
    // Total Trash Documents
    // ==========================

    const totalTrashDocuments = await Document.countDocuments({
      user: userId,
      isDeleted: true,
    });

    // ==========================
    // Total Storage Used
    // ==========================

    const storageResult = await Document.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalSize: {
            $sum: "$fileSize",
          },
        },
      },
    ]);

    const totalStorage =
      storageResult.length > 0
        ? storageResult[0].totalSize
        : 0;

    // ==========================
    // Documents By Type
    // ==========================

    const documentsByType = await Document.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$documentType",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // ==========================
    // Documents By Status
    // ==========================

    const documentsByStatus = await Document.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // ==========================
    // Response
    // ==========================

    res.status(200).json({
      success: true,
      stats: {
        totalDocuments,
        totalTrashDocuments,
        totalStorage,
        documentsByType,
        documentsByStatus,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Download Document
// ==========================
export const downloadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    // Check whether physical file exists
    try {
      await fs.access(document.filePath);
    } catch {
      res.status(404).json({
        success: false,
        message: "File not found on server",
      });
      return;
    }

    // Set original filename for download
    res.download(
      document.filePath,
      document.originalName,
      (error) => {
        if (error) {
          console.error("Download error:", error);

          // Avoid sending another response
          // if headers have already been sent.
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "Failed to download document",
            });
          }
        }
      }
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Preview Document
// ==========================
export const previewDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    // Check whether physical file exists
    try {
      await fs.access(document.filePath);
    } catch {
      res.status(404).json({
        success: false,
        message: "File not found on server",
      });
      return;
    }

    // Set correct MIME type
    res.setHeader(
      "Content-Type",
      document.mimeType
    );

    // Display file in browser instead of downloading
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.originalName}"`
    );

    res.sendFile(document.filePath);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Update Document
// ==========================
export const updateDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
   const {
  title,
  documentType,
  tags,
} = req.body || {};

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    if (title !== undefined) {
      document.title = title;
    }

    if (documentType !== undefined) {
      document.documentType = documentType;
    }

    if (tags !== undefined) {
      document.tags = Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean);
    }

    await document.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Toggle Document Favorite
// PATCH /api/documents/:id/favorite
// ==========================
export const toggleDocumentFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user!._id,
      isDeleted: false,
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: "Document not found",
      });
      return;
    }

    document.isFavorite = !document.isFavorite;

    await document.save();

    res.status(200).json({
      success: true,
      message: document.isFavorite
        ? "Document added to favorites"
        : "Document removed from favorites",
      isFavorite: document.isFavorite,
      document,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Favorite Documents
// GET /api/documents/favorites
// ==========================
export const getFavoriteDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      isFavorite: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Documents By Tag
// GET /api/documents/tags?tag=
// ==========================
export const getDocumentsByTag = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const tag = (req.query.tag as string)?.trim();

    if (!tag) {
      res.status(400).json({
        success: false,
        message: "Tag is required",
      });
      return;
    }

    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      tags: {
        $regex: `^${escapeRegex(tag)}$`,
        $options: "i",
      },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      tag,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Documents By Type
// GET /api/documents/type?type=
// ==========================
export const getDocumentsByType = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const documentType = (req.query.type as string)?.trim();

    if (!documentType) {
      res.status(400).json({
        success: false,
        message: "Document type is required",
      });
      return;
    }

    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      documentType: {
        $regex: `^${escapeRegex(documentType)}$`,
        $options: "i",
      },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documentType,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



// ==========================
// Get Documents By Multiple Types
// GET /api/documents/types?types=
// ==========================
export const getDocumentsByTypes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const typesQuery = (req.query.types as string)?.trim();

    if (!typesQuery) {
      res.status(400).json({
        success: false,
        message: "Document types are required",
      });
      return;
    }

    const types = typesQuery
      .split(",")
      .map((type: string) => type.trim())
      .filter(Boolean);

    if (types.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one document type is required",
      });
      return;
    }

    const allowedTypes: DocumentType[] = [
      "research-paper",
      "annual-report",
      "financial-statement",
      "lecture-notes",
      "book",
      "other",
    ];

    const invalidTypes = types.filter(
      (type) => !allowedTypes.includes(type as DocumentType)
    );

    if (invalidTypes.length > 0) {
      res.status(400).json({
        success: false,
        message: "Invalid document type",
        invalidTypes,
        allowedTypes,
      });
      return;
    }

    const validTypes = types as DocumentType[];

    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      documentType: {
        $in: validTypes,
      },
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      documentTypes: validTypes,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Get Documents By Status
// GET /api/documents/status?status=
// ==========================
export const getDocumentsByStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const status = (req.query.status as string)?.trim();

    if (!status) {
      res.status(400).json({
        success: false,
        message: "Document status is required",
      });
      return;
    }

    const validStatuses = [
      "uploaded",
      "processing",
      "processed",
      "failed",
    ] as const;

    if (
      !validStatuses.includes(
        status as (typeof validStatuses)[number]
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid document status",
      });
      return;
    }

    const documentStatus =
      status as (typeof validStatuses)[number];

    const documents = await Document.find({
      user: req.user!._id,
      isDeleted: false,
      status: documentStatus,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      status: documentStatus,
      documents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// Search Document Chunks
// GET /api/documents/chunks/search?q=
// ==========================

export const searchDocumentChunksApi = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || !q.trim()) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const chunks = await searchDocumentChunks(
      req.user!._id,
      q.trim()
    );

    res.status(200).json({
      success: true,
      query: q.trim(),
      count: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error(
      "Search document chunks error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// RAG Retrieval API
// ==========================

export const retrieveRagContextApi = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { q } = req.query;

    if (
      !q ||
      typeof q !== "string" ||
      !q.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Search query is required",
      });
      return;
    }

    const result = await retrieveRagContext(
      req.user!._id,
      q.trim()
    );

    res.status(200).json({
      success: true,
      query: q.trim(),
      count: result.chunks.length,
      context: result.context,
      chunks: result.chunks,
    });
  } catch (error) {
    console.error(
      "RAG retrieval error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================
// RAG Question Answer API
// ==========================

export const askRagQuestion = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Question is required",
      });
      return;
    }

    const result = await generateRagAnswer({
      userId: req.user!._id,
      question: question.trim(),
    });

   res.status(200).json({
  success: true,
  question: question.trim(),
  answer: result.answer,
  context: result.context,
  chunks: result.chunks,
  sources: result.sources,
});
  } catch (error: any) {
    console.error(
      "RAG question error:",
      error
    );

    if (
      error?.message ===
      "No relevant document context found"
    ) {
      res.status(404).json({
        success: false,
        message:
          "No relevant information found in your documents",
      });
      return;
    }

    if (
      error?.message ===
      "OpenAI API credits are exhausted. AI answer generation is currently unavailable."
    ) {
      res.status(503).json({
        success: false,
        message:
          "AI answer generation is currently unavailable",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};