import { Link } from "@/i18n/routing";
import { Globe2, Code2, Coins, Languages, Plane } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  variant?: "default" | "gold" | "green" | "blue" | "red";
  animationDelay?: string;
}

function FeatureCard({ icon, title, description, href, disabled, variant = "default", animationDelay = "" }: FeatureCardProps) {
  const variants = {
    default: {
      icon: "text-primary",
      iconBg: "bg-primary/10",
      title: "text-foreground",
      borderHover: "hover:border-primary/50",
    },
    gold: {
      icon: "text-amber-500",
      iconBg: "bg-amber-500/10",
      title: "bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent",
      borderHover: "hover:border-amber-500/50",
    },
    green: {
      icon: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
      title: "bg-gradient-to-br from-emerald-400 to-green-600 bg-clip-text text-transparent",
      borderHover: "hover:border-emerald-500/50",
    },
    blue: {
      icon: "text-blue-500",
      iconBg: "bg-blue-500/10",
      title: "bg-gradient-to-br from-blue-400 to-indigo-600 bg-clip-text text-transparent",
      borderHover: "hover:border-blue-500/50",
    },
    red: {
      icon: "text-red-500",
      iconBg: "bg-red-500/10",
      title: "bg-gradient-to-br from-red-500 to-rose-600 bg-clip-text text-transparent",
      borderHover: "hover:border-red-500/50",
    },
  };

  const styles = variants[variant];

  const Content = (
    <div className={`group relative h-full overflow-hidden rounded-lg border border-border/40 bg-background p-6 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : `hover:border-border hover:shadow-md hover:scale-[1.02] ${styles.borderHover}`}`}>
      {icon && (
        <div className={`mb-4 inline-flex rounded-lg p-3 ${styles.icon} ${styles.iconBg}`}>
          {icon}
        </div>
      )}
      <h2 className={`mb-2 text-xl font-bold ${styles.title}`}>{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href}>
        <div className={`h-full ${animationDelay}`}>
          {Content}
        </div>
      </Link>
    );
  }

  return (
    <div className={`h-full ${animationDelay}`}>
      {Content}
    </div>
  );
}

export async function FeatureCards() {
  const t = await getTranslations();

  return (
    <section className="mx-auto max-w-5xl pb-24 md:pb-32">
      <div className="grid gap-6 sm:grid-cols-2">
        <FeatureCard
          icon={<Globe2 className="h-10 w-10" />}
          title={t("home.features.countries.title")}
          description={t("home.features.countries.description")}
          href="/countries"
          variant="blue"
          animationDelay="animate-fade-in-up-delay-4"
        />
        <FeatureCard
          icon={<Languages className="h-10 w-10" />}
          title={t("home.features.languages.title")}
          description={t("home.features.languages.description")}
          href="/languages"
          variant="green"
          animationDelay="animate-fade-in-up-delay-5"
        />
        <FeatureCard
          icon={<Coins className="h-10 w-10" />}
          title={t("home.features.currencies.title")}
          description={t("home.features.currencies.description")}
          href="/currencies"
          variant="gold"
          animationDelay="animate-fade-in-up-delay-6"
        />
        <FeatureCard
           icon={<Plane className="h-10 w-10" />}
          title={t("home.features.airports.title")}
          description={t("home.features.airports.description")}
          href="/airports"
          variant="red"
          animationDelay="animate-fade-in-up-delay-7"
        />
        <FeatureCard
           icon={<Code2 className="h-10 w-10" />}
          title={t("home.features.localeCodes.title")}
          description={t("home.features.localeCodes.description")}
          href="/locale-codes"
          variant="default"
          animationDelay="animate-fade-in-up-delay-8"
        />
      </div>
    </section>
  );
}
