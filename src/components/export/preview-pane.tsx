"use client";

import { useTranslations } from "next-intl";
import { FileJson, FileSpreadsheet, FileArchive } from "lucide-react";
import { JsonHighlight } from "./json-highlight";
import { CsvTable } from "./csv-table";
import type { ExportFormat } from "@/lib/export/serialize";

interface PreviewPaneProps {
  format: ExportFormat;
  jsonString: string;
  csvString: string;
  isEmpty: boolean;
}

export function PreviewPane({
  format,
  jsonString,
  csvString,
  isEmpty,
}: PreviewPaneProps) {
  const t = useTranslations("export.preview");

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-dashed bg-card/30 py-10 text-center text-sm text-muted-foreground">
        {t("empty")}
      </div>
    );
  }

  if (format === "zip") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-card/40 p-4 text-sm">
        <FileArchive className="h-5 w-5 text-rose-500" aria-hidden />
        <span className="text-muted-foreground">{t("zipNote")}</span>
      </div>
    );
  }

  const isCsv = format === "csv";
  const Icon = isCsv ? FileSpreadsheet : FileJson;
  const tone = isCsv ? "text-emerald-500" : "text-indigo-500";

  return (
    <div className="overflow-hidden rounded-lg border bg-card/40">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Icon className={`h-3.5 w-3.5 ${tone}`} aria-hidden />
          {t("label")}
        </span>
        <span className="font-mono text-muted-foreground">
          {t("firstRecordOnly")}
        </span>
      </div>
      {isCsv ? (
        <div className="max-h-[420px] overflow-auto">
          <CsvTable csv={csvString} />
        </div>
      ) : (
        <pre className="max-h-[420px] overflow-auto p-3 text-xs leading-relaxed">
          <code>
            <JsonHighlight value={jsonString} />
          </code>
        </pre>
      )}
    </div>
  );
}
