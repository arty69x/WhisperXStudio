import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  result?: string;
  error?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = (typeof req.body === "object" && req.body !== null ? req.body : {}) as {
      prompt?: unknown;
      selected?: unknown;
      moduleName?: unknown;
    };

    const prompt = typeof body.prompt === "string" ? body.prompt : "";
    const selected = typeof body.selected === "string" ? body.selected : "none";
    const moduleName = typeof body.moduleName === "string" ? body.moduleName : "Workspace";

    if (!prompt.trim()) {
      res.status(400).json({ error: "Prompt is required." });
      return;
    }

    const apiKeyPresent = Boolean(process.env.OPENAI_API_KEY);

    const result = apiKeyPresent
      ? `AI route ready. Module: ${moduleName}. Selected: ${selected}. Suggested action: summarize selected context and open a Summary panel.`
      : `Missing OPENAI_API_KEY. Fallback mode active. Module: ${moduleName}. Selected: ${selected}. Suggested next step: configure env and retry.`;

    res.status(200).json({ result });
  } catch {
    res.status(500).json({ error: "Safe handler failure." });
  }
}
