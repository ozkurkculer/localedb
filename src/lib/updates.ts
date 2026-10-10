import { readUpdateFiles } from "@/lib/data/build";
import packageJson from "../../package.json";

export interface UpdateEntry {
  version: string;
  fileName: string;
  releaseDate: string;
  previousVersion: string;
  totalCommits: string;
  content: string;
  rawContent: string;
}

export async function getAllUpdates(): Promise<UpdateEntry[]> {
  try {
    const files = await readUpdateFiles();

    const updates = await Promise.all(
      files.map(async ({ fileName, rawContent }) => {
        // Extract version from filename: v0.2.0.md -> 0.2.0
        const version = fileName.replace("v", "").replace(".md", "");

        // Parse metadata from first lines
        const lines = rawContent.split("\n");
        const releaseDateMatch = lines.find((l) => l.includes("**Release Date:**"));
        const previousVersionMatch = lines.find((l) =>
          l.includes("**Previous Version:**")
        );
        const totalCommitsMatch = lines.find((l) =>
          l.includes("**Total Commits:**")
        );

        const releaseDate =
          releaseDateMatch?.split("**Release Date:**")[1]?.trim() || "";
        const previousVersion =
          previousVersionMatch?.split("**Previous Version:**")[1]?.trim() || "";
        const totalCommits =
          totalCommitsMatch?.split("**Total Commits:**")[1]?.trim() || "";

        // Extract content after first separator (---)
        const separatorIndex = rawContent.indexOf("---");
        const content =
          separatorIndex >= 0 ? rawContent.substring(separatorIndex + 3).trim() : rawContent;

        return {
          version,
          fileName,
          releaseDate,
          previousVersion,
          totalCommits,
          content,
          rawContent,
        };
      })
    );

    // Sort by semver descending (latest first)
    updates.sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.version.split(".").map(Number);
      const [bMajor, bMinor, bPatch] = b.version.split(".").map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      if (aMinor !== bMinor) return bMinor - aMinor;
      return bPatch - aPatch;
    });

    return updates;
  } catch (error) {
    console.error("Error reading updates:", error);
    return [];
  }
}

export async function getUpdate(version: string): Promise<UpdateEntry | null> {
  const updates = await getAllUpdates();
  return updates.find((u) => u.version === version) || null;
}

export function getAppVersion(): string {
  return packageJson.version;
}
