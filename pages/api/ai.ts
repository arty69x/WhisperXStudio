import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result?: string;
  error?: string;
  readiness?: "ready" | "fallback";
};

function safeBody(input: unknown): { prompt: string; selection: string; moduleName: string; context: string[] } {
  const value = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  return {
    prompt: typeof value.prompt === "string" ? value.prompt : "",
    selection: typeof value.selection === "string" ? value.selection : "none",
    moduleName: typeof value.moduleName === "string" ? value.moduleName : "Workspace",
    context: Array.isArray(value.context) ? value.context.filter((item): item is string => typeof item === "string") : []
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { prompt, selection, moduleName, context } = safeBody(req.body);
    if (!prompt.trim()) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
    if (!hasApiKey) {
      res.status(200).json({
        readiness: "fallback",
        result: `Fallback mode: OPENAI_API_KEY missing. Module=${moduleName}; Selection=${selection}; Context=${context.join(", ") || "none"}. Suggested next action: open Summary + Reader split and capture findings.`
      });
      return;
    }

    res.status(200).json({
      readiness: "ready",
      result: `AI route ready. Module=${moduleName}; Selection=${selection}. Suggested flow: route selected sources through Forge, then generate Docs + Slides updates and commit to history.`
    });
  } catch {
    res.status(500).json({ error: "Safe AI handler failure." });
  }
}
