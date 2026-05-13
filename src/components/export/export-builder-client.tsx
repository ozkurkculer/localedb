"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DATASET_SCHEMAS,
  collectDefaultPaths,
  type DatasetKey,
} from "@/lib/export/field-schema";
import type { ExportFormat } from "@/lib/export/serialize";
import { toCsv } from "@/lib/export/csv";
import { DatasetPicker } from "./dataset-picker";
import { EntityGrid, type EntityOption } from "./entity-grid";
import { FieldTree } from "./field-tree";
import { FormatSelector } from "./format-selector";
import { PreviewPane } from "./preview-pane";

interface ExportBuilderClientProps {
  countries: EntityOption[];
  currencies: EntityOption[];
  languages: EntityOption[];
  airports: EntityOption[];
}

const STEPS: { key: string; titleKey: string }[] = [
  { key: "dataset", titleKey: "steps.dataset" },
  { key: "entities", titleKey: "steps.entities" },
  { key: "fields", titleKey: "steps.fields" },
  { key: "format", titleKey: "steps.format" },
];

export function ExportBuilderClient({
  countries,
  currencies,
  languages,
  airports,
}: ExportBuilderClientProps) {
  const t = useTranslations("export");

  const [dataset, setDataset] = useState<DatasetKey>("countries");
  const [entities, setEntities] = useState<Set<string>>(new Set());
  const [fields, setFields] = useState<Set<string>>(() =>
    new Set(collectDefaultPaths(DATASET_SCHEMAS.countries.rootPaths))
  );
  const [format, setFormat] = useState<ExportFormat>("json");
  const [previewJson, setPreviewJson] = useState<string>("");
  const [previewCsv, setPreviewCsv] = useState<string>("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);
  const downloadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const options = useMemo(() => {
    switch (dataset) {
      case "countries":
        return countries;
      case "currencies":
        return currencies;
      case "languages":
        return languages;
      case "airports":
        return airports;
    }
  }, [dataset, countries, currencies, languages, airports]);

  const schema = DATASET_SCHEMAS[dataset];

  const onDatasetChange = useCallback((next: DatasetKey) => {
    setDataset(next);
    setEntities(new Set());
    setFields(new Set(collectDefaultPaths(DATASET_SCHEMAS[next].rootPaths)));
    setPreviewJson("");
    setPreviewCsv("");
  }, []);

  const canProceed = entities.size > 0 && fields.size > 0;

  const handlePreview = async () => {
    if (!canProceed) return;
    setIsPreviewLoading(true);
    setPreviewJson("");
    setPreviewCsv("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          entities: Array.from(entities),
          fields: Array.from(fields),
          format: "json",
          preview: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const first = data.records?.[0] ?? {};
      setPreviewJson(JSON.stringify(first, null, 2));
      setPreviewCsv(toCsv([first]));
    } catch (err) {
      toast.error(t("errors.previewFailed"));
      console.error(err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!canProceed || isDownloading) return;
    setIsDownloading(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          entities: Array.from(entities),
          fields: Array.from(fields),
          format,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? `localedb-${dataset}.bin`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(t("toasts.downloaded", { filename }));
      setJustDownloaded(true);
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
      downloadTimer.current = setTimeout(() => setJustDownloaded(false), 2000);
    } catch (err) {
      toast.error(t("errors.downloadFailed"));
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (downloadTimer.current) clearTimeout(downloadTimer.current);
    };
  }, []);

  const stepCount = STEPS.length;
  const completedSteps =
    (entities.size > 0 ? 1 : 0) +
    (fields.size > 0 ? 1 : 0) +
    1; // dataset always picked
  const progressPct = Math.min(100, (completedSteps / stepCount) * 100);

  return (
    <div className="container max-w-5xl py-12">
      <header className="mb-8 text-center">
        <h1 className="mb-3 bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground">
          {t("subtitle")}
        </p>
      </header>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("progress.label")}</span>
          <span aria-live="polite">{Math.round(progressPct)}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <motion.div
            layout
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <Section index={1} title={t(STEPS[0].titleKey)} done aria-current="step">
          <DatasetPicker value={dataset} onChange={onDatasetChange} />
        </Section>

        <Section
          index={2}
          title={t(STEPS[1].titleKey)}
          done={entities.size > 0}
        >
          <EntityGrid
            options={options}
            selected={entities}
            onChange={setEntities}
          />
        </Section>

        <Section index={3} title={t(STEPS[2].titleKey)} done={fields.size > 0}>
          <FieldTree
            nodes={schema.rootPaths}
            selected={fields}
            onChange={setFields}
          />
        </Section>

        <Section index={4} title={t(STEPS[3].titleKey)} done={canProceed}>
          <div className="space-y-4">
            <FormatSelector value={format} onChange={setFormat} />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={!canProceed || isPreviewLoading}
              >
                {isPreviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {t("actions.preview")}
              </Button>
              <Button
                type="button"
                onClick={handleDownload}
                disabled={!canProceed || isDownloading}
                className={cn(justDownloaded && "bg-green-600 hover:bg-green-600")}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : justDownloaded ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading
                  ? t("actions.downloading")
                  : justDownloaded
                    ? t("actions.downloaded")
                    : t("actions.download")}
              </Button>
              <p
                aria-live="polite"
                className="text-xs text-muted-foreground"
              >
                {t("summary", {
                  entities: entities.size,
                  fields: fields.size,
                })}
              </p>
            </div>
            <PreviewPane
              format={format}
              jsonString={previewJson}
              csvString={previewCsv}
              isEmpty={!previewJson && !previewCsv}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  done,
  children,
  ...rest
}: {
  index: number;
  title: string;
  done: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      {...rest}
      className="rounded-2xl border bg-card/40 p-5 shadow-sm backdrop-blur-sm sm:p-6"
    >
      <header className="mb-4 flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
            done
              ? "border-green-500/30 bg-green-500/10 text-green-600"
              : "border-border bg-muted/50 text-muted-foreground"
          )}
        >
          {done ? <Check className="h-4 w-4" /> : index}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      {children}
    </section>
  );
}
