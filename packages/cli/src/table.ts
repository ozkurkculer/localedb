import pc from "picocolors";
import type { Output } from "./context";

/** Prints rows as padded columns, header dimmed. */
export function printTable(out: Output, headers: string[], rows: (string | number | undefined)[][]): void {
  const cells = rows.map((row) => row.map((cell) => String(cell ?? "")));
  const widths = headers.map((header, i) => Math.max(header.length, ...cells.map((row) => [...row[i]].length)));
  const line = (row: string[]) =>
    row.map((cell, i) => (i === row.length - 1 ? cell : cell + " ".repeat(widths[i] - [...cell].length))).join("  ");
  out.write(`${pc.dim(line(headers))}\n`);
  for (const row of cells) out.write(`${line(row)}\n`);
}
