import mongoose, {
  Document as MongooseDocument,
  Schema,
} from "mongoose";

export interface IDocumentChunk extends MongooseDocument {
  document: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  chunkIndex: number;
  text: string;

  // Embedding vector
  embedding: number[];
}

const documentChunkSchema =
  new Schema<IDocumentChunk>(
    {
      // ==========================
      // Parent Document
      // ==========================
      document: {
        type: Schema.Types.ObjectId,
        ref: "Document",
        required: true,
      },

      // ==========================
      // User
      // ==========================
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // ==========================
      // Chunk Number
      // ==========================
      chunkIndex: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==========================
      // Chunk Text
      // ==========================
      text: {
        type: String,
        required: true,
        trim: true,
      },

      // ==========================
      // Embedding Vector
      // ==========================
      embedding: {
        type: [Number],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

// ==========================
// Indexes
// ==========================

// Find chunks belonging to a document
documentChunkSchema.index({
  document: 1,
  chunkIndex: 1,
});

// Find user's chunks
documentChunkSchema.index({
  user: 1,
  document: 1,
});

// Text Search
documentChunkSchema.index({
  text: "text",
});

const DocumentChunk =
  mongoose.model<IDocumentChunk>(
    "DocumentChunk",
    documentChunkSchema
  );

export default DocumentChunk;