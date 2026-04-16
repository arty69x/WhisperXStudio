import type { EmbeddedRecord, NormalizedKind, NormalizedRecord, RenderType } from "./types";

function inferKind(ext: string, mime: string): NormalizedKind {
  const normalizedExt = ext.toLowerCase();
  const normalizedMime = mime.toLowerCase();
  if (["md", "txt", "ts", "tsx", "js", "json", "css"].includes(normalizedExt)) return "text";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(normalizedExt) || normalizedMime.startsWith("image/")) return "image";
  if (normalizedExt === "pdf" || normalizedMime === "application/pdf") return "pdf";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(normalizedExt)) return "office";
  if (["zip", "tar", "gz", "7z"].includes(normalizedExt)) return "archive";
  return "binary";
}

function inferRenderType(kind: NormalizedKind, ext: string): RenderType {
  if (kind === "image") return "image";
  if (kind === "pdf") return "pdf";
  if (kind === "text" && ext === "md") return "markdown";
  if (kind === "text" && ["ts", "tsx", "js", "json", "css"].includes(ext)) return "code";
  if (kind === "text") return "text";
  return "metadata";
}

export function normalizeEmbeddedRecords(records: EmbeddedRecord[]): NormalizedRecord[] {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map((record) => {
    const ext = record.ext.toLowerCase();
    const kind = inferKind(ext, record.mime);
    const renderType = inferRenderType(kind, ext);
    const text = record.parsedText || record.searchableText;

    return {
      id: record.id,
      name: record.name,
      ext,
      mime: record.mime,
      size: record.size,
      kind,
      renderType,
      text,
      base64: record.base64Fallback ?? "",
      arrayBuffer: "",
      previewUrl: "",
      summary: record.summary,
      analysis: `Record ${record.name} is normalized for ${kind} workflows.`,
      routingHints: ["reader", "summary", "forge", "docs", "slides"],
      sourceReferences: [record.rawPathReference],
      capabilities: {
        previewable: renderType !== "metadata",
        searchable: text.length > 0,
        sendToForge: true,
        sendToReader: true,
        sendToSummary: true
      }
    };
  });
}
