"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type DocumentType =
  | "research-paper"
  | "annual-report"
  | "financial-statement"
  | "lecture-notes"
  | "book"
  | "other";

const documentTypes: {
  value: DocumentType;
  label: string;
}[] = [
  {
    value: "research-paper",
    label: "Research Paper",
  },
  {
    value: "annual-report",
    label: "Annual Report",
  },
  {
    value: "financial-statement",
    label: "Financial Statement",
  },
  {
    value: "lecture-notes",
    label: "Lecture Notes",
  },
  {
    value: "book",
    label: "Book",
  },
  {
    value: "other",
    label: "Other",
  },
];

const allowedExtensions = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return fileName.slice(lastDot).toLowerCase();
}

function getFileIcon(fileName: string) {
  const extension = getExtension(fileName);

  if (extension === ".pdf") {
    return "PDF";
  }

  if (extension === ".docx") {
    return "DOC";
  }

  if (
    extension === ".md" ||
    extension === ".markdown"
  ) {
    return "MD";
  }

  return "TXT";
}

export default function DocumentsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] =
    useState<DocumentType>("other");
  const [tags, setTags] = useState("");

  const [dragActive, setDragActive] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const handleFile = (file: File) => {
    setError("");
    setSuccess("");

    const extension = getExtension(file.name);

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);

      setError(
        "Unsupported file type. Please upload PDF, DOCX, TXT, or Markdown."
      );

      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      const fileNameWithoutExtension =
        file.name.replace(/\.[^/.]+$/, "");

      setTitle(fileNameWithoutExtension);
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();
    setDragActive(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("document", selectedFile);
      formData.append("title", title.trim());
      formData.append(
        "documentType",
        documentType
      );
      formData.append("tags", tags.trim());

      const response = await fetch(
        `${API_URL}/documents/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to upload document."
        );
      }

      setSuccess(
        "Document uploaded and processed successfully."
      );

      setSelectedFile(null);
      setTitle("");
      setDocumentType("other");
      setTags("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      /*
       * Give the user a short success state before
       * returning to the dashboard.
       */
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while uploading."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 h-[78px] border-b border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Dashboard
            </button>

            <span className="text-zinc-700">/</span>

            <span className="text-sm font-medium text-zinc-200">
              Documents
            </span>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/[0.14] hover:bg-white/[0.03] hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-32 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-blue-400">
            Knowledge workspace
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Add a document
          </h1>

          <p className="mt-3 text-base leading-7 text-zinc-500">
            Upload a document to your workspace. KnowFlow
            will extract its text and prepare it for search
            and knowledge retrieval.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          {/* Upload area */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-zinc-100">
                Document file
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Choose a file from your computer or drag it
                into the area below.
              </p>
            </div>

            {!selectedFile ? (
              <div
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center transition ${
                  dragActive
                    ? "border-blue-500/60 bg-blue-500/[0.06]"
                    : "border-white/[0.12] bg-[#09090b] hover:border-white/[0.2] hover:bg-white/[0.015]"
                }`}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.08] text-blue-400">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      d="M12 16V4"
                      strokeLinecap="round"
                    />

                    <path
                      d="M8 8l4-4 4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="text-sm font-medium text-zinc-200">
                  Drop your document here
                </p>

                <p className="mt-2 text-sm text-zinc-600">
                  or click to browse your files
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {["PDF", "DOCX", "TXT", "MD"].map(
                    (type) => (
                      <span
                        key={type}
                        className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[11px] font-medium text-zinc-500"
                      >
                        {type}
                      </span>
                    )
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.markdown"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col justify-center">
                <div className="rounded-xl border border-white/[0.08] bg-[#09090b] p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.08] text-xs font-semibold text-blue-400">
                      {getFileIcon(
                        selectedFile.name
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-sm text-zinc-600">
                        {formatFileSize(
                          selectedFile.size
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
                      aria-label="Remove file"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-6 border-t border-white/[0.06] pt-5">
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M5 12l4 4L19 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      File ready for upload
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-4 text-sm text-blue-400 transition hover:text-blue-300"
                >
                  Choose a different file
                </button>
              </div>
            )}
          </section>

          {/* Metadata */}
          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-zinc-100">
                Document details
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Add information to keep your knowledge
                workspace organized.
              </p>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Machine Learning Notes"
                  className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#09090b] px-3.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor="documentType"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Document type
                </label>

                <select
                  id="documentType"
                  value={documentType}
                  onChange={(event) =>
                    setDocumentType(
                      event.target.value as DocumentType
                    )
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-white/[0.09] bg-[#09090b] px-3.5 text-sm text-zinc-200 outline-none transition focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                >
                  {documentTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                      className="bg-[#09090b]"
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Tags
                  <span className="ml-2 font-normal text-zinc-600">
                    optional
                  </span>
                </label>

                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(event) =>
                    setTags(event.target.value)
                  }
                  placeholder="ai, machine-learning, notes"
                  className="h-11 w-full rounded-lg border border-white/[0.09] bg-[#09090b] px-3.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Separate multiple tags with commas.
                </p>
              </div>

              {/* Info */}
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-zinc-500">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        d="M12 11v5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 8h.01"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-xs leading-5 text-zinc-600">
                    After upload, KnowFlow extracts the
                    document text and creates searchable
                    knowledge chunks automatically.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-400">
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Uploading document...
                  </>
                ) : (
                  <>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M12 16V4"
                        strokeLinecap="round"
                      />

                      <path
                        d="M8 8l4-4 4 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4"
                        strokeLinecap="round"
                      />
                    </svg>

                    Upload document
                  </>
                )}
              </button>
            </div>
          </section>
        </form>
      </main>
    </div>
  );
}