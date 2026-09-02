import mongoose, { Document as MongooseDocument, Schema } from "mongoose";

export interface IDocument extends MongooseDocument {
  title: string;
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;

  documentType:
    | "research-paper"
    | "annual-report"
    | "financial-statement"
    | "lecture-notes"
    | "book"
    | "other";

  status:
    | "uploaded"
    | "processing"
    | "processed"
    | "failed";

  user: mongoose.Types.ObjectId;

  extractedText?: string;

  tags: string[];

  isFavorite: boolean;

  isDeleted: boolean;

  deletedAt: Date | null;
}

const documentSchema = new Schema<IDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    documentType: {
      type: String,
      enum: [
        "research-paper",
        "annual-report",
        "financial-statement",
        "lecture-notes",
        "book",
        "other",
      ],
      default: "other",
    },

    status: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "processed",
        "failed",
      ],
      default: "uploaded",
    },

    isFavorite: {
  type: Boolean,
  default: false,
},

    extractedText: {
      type: String,
      default: "",
    },

    tags: [
      {
        type: String,
      },
    ],

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Text Search
documentSchema.index({
  title: "text",
  extractedText: "text",
  tags: "text",
});

const Document = mongoose.model<IDocument>(
  "Document",
  documentSchema
);

export default Document;