import mongoose from "mongoose";
import DocumentChunk from "../models/DocumentChunk.js";

export const getDocumentChunks = async (
  userId: mongoose.Types.ObjectId,
  documentId: mongoose.Types.ObjectId
) => {
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(documentId)
  ) {
    return [];
  }

  const chunks = await DocumentChunk.find({
    user: userId,
    document: documentId,
  })
    .select("document chunkIndex text embedding")
    .sort({ chunkIndex: 1 })
    .lean();

  return chunks;
};