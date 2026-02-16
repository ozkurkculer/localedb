import { getAllUpdates, getAppVersion } from "@/lib/updates";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { UpdatesList } from "@/components/updates/updates-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("updates");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function UpdatesPage() {
  const t = await getTranslations("updates");
  const updates = await getAllUpdates();
  const currentVersion = getAppVersion();

  return (
    <div className="container max-w-4xl py-12 md:py-16">
      {/* Header */}
      <div className="mb-12 space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("currentVersion")}:</span>
          <span className="rounded-md bg-primary/10 px-3 py-1 font-mono font-semibold text-primary">
            v{currentVersion}
          </span>
        </div>
      </div>

      {/* Updates List */}
      <UpdatesList updates={updates} />
    </div>
  );
}
