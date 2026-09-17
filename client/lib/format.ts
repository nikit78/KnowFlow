export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDocumentType(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "FILE") : "FILE";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export type StatusTone = "success" | "warning" | "error" | "info";

export function getDocumentStatusTone(
  status: "uploaded" | "processing" | "processed" | "failed",
): StatusTone {
  switch (status) {
    case "processed":
      return "success";
    case "processing":
      return "warning";
    case "failed":
      return "error";
    default:
      return "info";
  }
}

export function getDocumentStatusLabel(
  status: "uploaded" | "processing" | "processed" | "failed",
): string {
  switch (status) {
    case "processed":
      return "Processed";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    default:
      return "Uploaded";
  }
}
