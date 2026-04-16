import { promises as fs } from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { embeddedArchive } from "../../lib/seed";

type ArchiveRecordWithRaw = (typeof embeddedArchive)[number] & {
  rawAvailable: boolean;
};

type ArchiveResponse = {
  records: ArchiveRecordWithRaw[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ArchiveResponse | { error: string }>) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const records = await Promise.all(
      embeddedArchive.map(async (item) => {
        let rawAvailable = false;
        try {
          const fullPath = path.join(process.cwd(), item.rawPathReference);
          await fs.access(fullPath);
          rawAvailable = true;
        } catch {
          rawAvailable = false;
        }
        return { ...item, rawAvailable };
      })
    );

    res.status(200).json({ records });
  } catch {
    res.status(500).json({ error: "Failed to load archive records" });
  }
}
