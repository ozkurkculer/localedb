"use client";

import { useMemo } from "react";

interface CsvTableProps {
  csv: string;
}

function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"' && raw[i + 1] === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function colLabel(index: number): string {
  let s = "";
  let n = index;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

export function CsvTable({ csv }: CsvTableProps) {
  const rows = useMemo(() => parseCsv(csv), [csv]);
  if (rows.length === 0) return null;

  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div className="overflow-auto">
      <table className="w-full border-separate border-spacing-0 font-mono text-[11px]">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="sticky left-0 z-20 w-10 border-b border-r border-border/60 bg-muted/80 px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground"></th>
            {headers.map((_, i) => (
              <th
                key={i}
                className="border-b border-r border-border/60 bg-muted/80 px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground"
              >
                {colLabel(i)}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky left-0 z-20 w-10 border-b border-r border-border/60 bg-muted/40 px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground">
              1
            </th>
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap border-b border-r border-border/60 bg-muted/40 px-2 py-1.5 text-left font-semibold text-foreground"
                title={h}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r, ri) => (
            <tr key={ri} className="group">
              <td className="sticky left-0 z-10 w-10 border-b border-r border-border/60 bg-muted/40 px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground group-hover:bg-muted/70">
                {ri + 2}
              </td>
              {headers.map((_, ci) => {
                const v = r[ci] ?? "";
                return (
                  <td
                    key={ci}
                    className="max-w-[220px] truncate border-b border-r border-border/60 px-2 py-1.5 text-foreground/90 group-hover:bg-muted/30"
                    title={v}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
