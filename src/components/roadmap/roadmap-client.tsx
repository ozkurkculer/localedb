"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type Status = "completed" | "in-progress" | "planned";

interface RoadmapItem {
    id: string;
    title: string;
    description?: string;
    status: Status;
    date?: string;
}

const statusConfig: Record<Status, any> = {
    completed: {
        labelKey: "completed",
        icon: CheckCircle2,
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
    },
    "in-progress": {
        labelKey: "inProgress",
        icon: Loader2,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
    },
    planned: {
        labelKey: "planned",
        icon: Circle,
        color: "text-muted-foreground",
        bg: "bg-muted/50",
        border: "border-border/50",
    },
};

export function RoadmapClient() {
    const t = useTranslations("roadmap");

    const roadmapData: RoadmapItem[] = [
        {
            id: "1",
            title: t("items.1.title"),
            description: t("items.1.description"),
            status: "completed",
            date: t("items.1.date"),
        },
        {
            id: "2",
            title: t("items.2.title"),
            description: t("items.2.description"),
            status: "in-progress",
            date: t("items.2.date"),
        },
        {
            id: "3",
            title: t("items.3.title"),
            description: t("items.3.description"),
            status: "planned",
            date: t("items.3.date"),
        },
        {
            id: "4",
            title: t("items.4.title"),
            description: t("items.4.description"),
            status: "planned",
            date: t("items.4.date"),
        },
        {
            id: "5",
            title: t("items.5.title"),
            description: t("items.5.description"),
            status: "planned",
            date: t("items.5.date"),
        },
    ];

    return (
        <div className="container max-w-4xl py-12">
            <div className="mb-12 text-center">
                <h1 className="mb-4 text-4xl font-bold bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    {t("title")}
                </h1>
                <p className="text-xl text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {roadmapData.map((item, index) => {
                    const config = statusConfig[item.status];
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                        >
                            {/* Icon Marker */}
                            <div className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10",
                                config.color,
                                config.border
                            )}>
                                <Icon className={cn("w-5 h-5", item.status === "in-progress" && "animate-spin")} />
                            </div>

                            {/* Content Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:bg-card">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        config.bg,
                                        config.color,
                                        config.border
                                    )}>
                                        {t(`status.${config.labelKey}`)}
                                    </span>
                                    {item.date && (
                                        <span className="flex items-center text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {item.date}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold leading-tight">
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p className="mt-2 text-muted-foreground text-sm">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
