"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { DocumentType } from "@/lib/types";
import { formatBytes, getFileExtension } from "@/lib/format";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconUpload,
} from "@/components/icons";

const documentTypes: {
  value: DocumentType;
  label: string;
}[] = [
  { value: "research-paper", label: "Research Paper" },
  { value: "annual-report", label: "Annual Report" },
  { value: "financial-statement", label: "Financial Statement" },
  { value: "lecture-notes", label: "Lecture Notes" },
  { value: "book", label: "Book" },
  { value: "other", label: "Other" },
];

const allowedExtensions = [
  ".pdf",
  ".docx",
  ".txt",
  ".md",
  ".markdown",
];

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) return "";

  return fileName.slice(lastDot).toLowerCase();
}

export default function UploadDocumentPage() {
  useDashboard();

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] =
    useState<DocumentType>("other");
  const [tags, setTags] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleFile(file: File) {
    setError("");
    setSuccess("");

    const extension = getExtension(file.name);

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);
      setError(
        "Unsupported file type. Please upload PDF, DOCX, TXT, or Markdown.",
      );
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  }

  function removeFile() {
    setSelectedFile(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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
      formData.append("documentType", documentType);
      formData.append("tags", tags.trim());

      await apiFetch("/documents/upload", {
        method: "POST",
        formData,
      });

      setSuccess(
        "Document uploaded and processed successfully.",
      );

      setSelectedFile(null);
      setTitle("");
      setDocumentType("other");
      setTags("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 900);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/documents")
            }
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-kf-muted transition hover:text-kf-accent-ink"
          >
            <IconArrowLeft size={14} />
            Documents
          </button>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Knowledge library
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Add a document
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-kf-muted">
            Upload a document to your workspace. KnowFlow will
            extract its text and prepare it for search and
            knowledge retrieval.
          </p>
        </div>

        <Button
          variant="secondary"
          href="/dashboard/documents"
        >
          Cancel
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        {/* File upload */}
        <section className="kf-card overflow-hidden">
          <div className="border-b border-kf-border px-6 py-5 sm:px-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
                <IconUpload size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-kf-ink">
                  Document file
                </h2>

                <p className="mt-1 text-sm text-kf-muted">
                  Choose a file or drag it into the upload area.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-7">
            {!selectedFile ? (
              <>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                  }}
                  className={`group flex min-h-[330px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition ${
                    dragActive
                      ? "border-kf-accent bg-kf-accent-soft"
                      : "border-kf-border bg-kf-surface-muted/45 hover:border-kf-accent/50 hover:bg-kf-accent-soft/35"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl transition ${
                      dragActive
                        ? "bg-kf-surface text-kf-accent-ink"
                        : "bg-kf-accent-soft text-kf-accent-ink group-hover:scale-105"
                    }`}
                  >
                    <IconUpload size={27} />
                  </div>

                  <p className="mt-5 text-sm font-semibold text-kf-ink">
                    {dragActive
                      ? "Drop your document here"
                      : "Drop your document here"}
                  </p>

                  <p className="mt-1.5 text-sm text-kf-muted">
                    or click to browse your files
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {["PDF", "DOCX", "TXT", "MD"].map(
                      (type) => (
                        <span
                          key={type}
                          className="rounded-lg border border-kf-border bg-kf-surface px-2.5 py-1 text-[11px] font-semibold text-kf-muted"
                        >
                          {type}
                        </span>
                      ),
                    )}
                  </div>

                  <p className="mt-4 text-[11px] text-kf-faint">
                    Supported: PDF, DOCX, TXT and Markdown
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.markdown"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </>
            ) : (
              <div>
                <div className="rounded-2xl border border-kf-border bg-kf-surface-muted/45 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border border-kf-border bg-kf-surface text-xs font-bold uppercase text-kf-accent-ink">
                      {getFileExtension(
                        selectedFile.name,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-kf-ink">
                        {selectedFile.name}
                      </p>

                      <p className="mt-1 text-xs text-kf-muted">
                        {formatBytes(selectedFile.size)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={uploading}
                      className="rounded-lg p-2 text-kf-faint transition hover:bg-kf-surface hover:text-kf-error disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Remove selected file"
                    >
                      <IconClose size={17} />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 border-t border-kf-border pt-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kf-success-soft text-kf-success">
                      <IconCheck size={14} />
                    </span>

                    <div>
                      <p className="text-xs font-semibold text-kf-success">
                        File ready for upload
                      </p>
                      <p className="mt-0.5 text-[11px] text-kf-muted">
                        Your document will be processed after
                        submission.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={uploading}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-kf-accent-ink transition hover:gap-2 hover:underline disabled:opacity-50"
                >
                  Choose a different file
                  <IconArrowRight size={14} />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.markdown"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </section>

        {/* Details */}
        <section className="kf-card overflow-hidden">
          <div className="border-b border-kf-border px-6 py-5 sm:px-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Organization
            </p>

            <h2 className="mt-1 text-base font-semibold text-kf-ink">
              Document details
            </h2>

            <p className="mt-1 text-sm text-kf-muted">
              Add information to keep your knowledge library
              organized.
            </p>
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            <Input
              id="title"
              label="Title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Machine Learning Notes"
              disabled={uploading}
            />

            <div>
              <label
                htmlFor="documentType"
                className="mb-2 block text-sm font-medium text-kf-ink-soft"
              >
                Document type
              </label>

              <select
                id="documentType"
                value={documentType}
                onChange={(event) =>
                  setDocumentType(
                    event.target.value as DocumentType,
                  )
                }
                disabled={uploading}
                className="h-11 w-full rounded-xl border border-kf-border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {documentTypes.map((type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="tags"
              label="Tags"
              hint="Separate multiple tags with commas."
              value={tags}
              onChange={(event) =>
                setTags(event.target.value)
              }
              placeholder="ai, machine-learning, notes"
              disabled={uploading}
            />

            {/* Processing info */}
            <div className="rounded-2xl border border-kf-border bg-kf-surface-muted/45 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kf-accent-soft text-kf-accent-ink">
                  <IconCheck size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-kf-ink">
                    Ready for knowledge retrieval
                  </p>

                  <p className="mt-1 text-xs leading-5 text-kf-muted">
                    After upload, KnowFlow extracts the document
                    text and creates searchable knowledge chunks
                    automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-kf-error/20 bg-kf-error-soft px-4 py-3 text-sm leading-5 text-kf-error"
              >
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div
                role="status"
                className="rounded-xl border border-kf-success/20 bg-kf-success-soft px-4 py-3 text-sm leading-5 text-kf-success"
              >
                {success}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={uploading}
              className="w-full"
            >
              <IconUpload size={16} />

              {uploading
                ? "Uploading document..."
                : "Upload document"}

              {!uploading && (
                <IconArrowRight size={15} />
              )}
            </Button>

            <p className="text-center text-[11px] leading-5 text-kf-faint">
              Your document stays associated with your KnowFlow
              workspace.
            </p>
          </div>
        </section>
      </form>
    </div>
  );
}