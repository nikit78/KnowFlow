export type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  authProvider?: "local" | "google" | "both";
};

export type DocumentStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "failed";

export type DocumentType =
  | "research-paper"
  | "annual-report"
  | "financial-statement"
  | "lecture-notes"
  | "book"
  | "other";

export type KnowledgeDocument = {
  _id: string;
  title: string;
  originalName: string;
  documentType: DocumentType | string;
  fileSize: number;
  mimeType?: string;
  status: DocumentStatus;
  tags: string[];
  isFavorite: boolean;
  extractedText?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type Collection = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  documents?: KnowledgeDocument[] | string[];
  createdAt?: string;
  updatedAt?: string;
};

export type Note = {
  _id: string;
  title: string;
  content: string;
  color?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  tags?: string[];
  collectionId?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
};

export type DashboardStats = {
  totalDocuments: number;
  totalTrashDocuments: number;
  totalStorage: number;
};

export type RagSource = {
  documentId?: string;
  documentTitle?: string;
  originalName?: string;
  title?: string;
  chunkIndex?: number;
  text?: string;
  document?: {
    _id?: string;
    id?: string;
    title?: string;
    originalName?: string;
  } | null;
};
