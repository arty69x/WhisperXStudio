import type { EmbeddedRecord } from "../lib/types";

const now = "2026-04-16T00:00:00.000Z";

export const embeddedRecords: EmbeddedRecord[] = [
  {
    id: "src-readme",
    name: "README.md",
    title: "WhisperXStudio Overview",
    ext: "md",
    mime: "text/markdown",
    size: 1840,
    tags: ["project", "overview", "legacy"],
    sourceCategory: "repo-doc",
    origin: "repository",
    summary: "Project overview and baseline notes for runtime expectations.",
    searchableText: "WhisperXStudio canvas modules architecture",
    parsedText: "Repository readme content embedded for archive and reader availability.",
    rawPathReference: "README.md",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "src-index",
    name: "pages/index.tsx",
    title: "Workspace Runtime",
    ext: "tsx",
    mime: "text/typescript",
    size: 4500,
    tags: ["runtime", "canvas", "app-shell"],
    sourceCategory: "source-code",
    origin: "repository",
    summary: "Primary app shell and canvas workspace runtime.",
    searchableText: "canvas workspace module inspector dock",
    parsedText: "Typescript source for app shell and interactive workspace.",
    rawPathReference: "pages/index.tsx",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "src-ai-route",
    name: "pages/api/ai.ts",
    title: "AI Service Route",
    ext: "ts",
    mime: "text/typescript",
    size: 1600,
    tags: ["api", "ai", "service"],
    sourceCategory: "server-route",
    origin: "repository",
    summary: "Server-only AI orchestration endpoint with fallback behavior.",
    searchableText: "openai route fallback json",
    parsedText: "API route for AI requests.",
    rawPathReference: "pages/api/ai.ts",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "src-blueprint",
    name: "WhisperXStudio v.final.txt",
    title: "Final Blueprint",
    ext: "txt",
    mime: "text/plain",
    size: 6100,
    tags: ["requirements", "blueprint", "legacy"],
    sourceCategory: "brief",
    origin: "repository",
    summary: "Embedded planning blueprint with module-level targets.",
    searchableText: "overview workspace forge vault archive reader summary",
    parsedText: "Final system blueprint preserved as embedded data.",
    rawPathReference: "WhisperXStudio v.final.txt",
    createdAt: now,
    updatedAt: now
  }
];
