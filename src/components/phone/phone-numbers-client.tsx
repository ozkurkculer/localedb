"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Search, ArrowUpDown, Globe, Phone } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

export interface PhoneNumberEntry {
    countryCode: string
    name: string
    flagEmoji: string
    callingCode: string
    pattern: string
    exampleFormat: string
    exampleNumber: string
    region: string
}

interface PhoneNumbersClientProps {
    data: PhoneNumberEntry[]
}

export function PhoneNumbersClient({ data }: PhoneNumbersClientProps) {
    const [search, setSearch] = React.useState("")
    const [sortField, setSortField] = React.useState<keyof PhoneNumberEntry>("name")
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
    const params = useParams()
    const router = useRouter()
    const locale = params.locale as string

    const t = useTranslations();

    const filteredData = React.useMemo(() => {
        const q = search.toLowerCase()
        return data
            .filter((item) => {
                return (
                    item.name.toLowerCase().includes(q) ||
                    item.countryCode.toLowerCase().includes(q) ||
                    item.callingCode.includes(q) ||
                    item.region.toLowerCase().includes(q)
                )
            })
            .sort((a, b) => {
                const aValue = a[sortField]
                const bValue = b[sortField]
                if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
                if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
                return 0
            })
    }, [data, search, sortField, sortDirection])

    const handleSort = (field: keyof PhoneNumberEntry) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const SortIcon = ({ field }: { field: keyof PhoneNumberEntry }) => {
        if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />
        return <ArrowUpDown className={cn("ml-2 h-4 w-4", sortDirection === "desc" && "rotate-180")} />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("phoneNumbers.title")}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t("phoneNumbers.subtitle")}
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t("phoneNumbers.search")}
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">
                                <Button variant="ghost" onClick={() => handleSort("name")} className="-ml-3 h-8 data-[state=open]:bg-accent">
                                    {t("phoneNumbers.table.country")}
                                    <SortIcon field="name" />
                                </Button>
                            </TableHead>
                            <TableHead className="w-[100px]">
                                <Button variant="ghost" onClick={() => handleSort("callingCode")} className="-ml-3 h-8">
                                    {t("phoneNumbers.table.code")}
                                    <SortIcon field="callingCode" />
                                </Button>
                            </TableHead>
                            <TableHead className="hidden md:table-cell">{t("phoneNumbers.table.pattern")}</TableHead>
                            <TableHead className="hidden sm:table-cell">{t("phoneNumbers.table.example")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    {t("phoneNumbers.noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow
                                    key={item.countryCode}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => router.push(`/${locale}/countries/${item.countryCode.toUpperCase()}`)}
                                >
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl leading-none">{item.flagEmoji}</span>
                                            <div className="flex flex-col">
                                                <span>{item.name}</span>
                                                <span className="text-xs text-muted-foreground md:hidden">{item.callingCode}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono">{item.callingCode}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-[300px]">
                                        {item.pattern ? (
                                            <div className="flex items-center gap-2 group/regex" onClick={(e) => e.stopPropagation()}>
                                                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm truncate max-w-[250px] inline-block">
                                                    {item.pattern}
                                                </code>
                                                <CopyButton
                                                    value={item.pattern}
                                                    className="h-6 w-6 opacity-0 group-hover/regex:opacity-100 focus:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-sm">{t("phoneNumbers.table.noPattern")}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        {item.exampleFormat ? (
                                            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-2 group/ex">
                                                    <span className="text-sm font-medium">{item.exampleFormat}</span>
                                                    <CopyButton
                                                        value={item.exampleFormat}
                                                        className="h-6 w-6 opacity-0 group-hover/ex:opacity-100 focus:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground font-mono">{item.exampleNumber}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic text-sm">{t("phoneNumbers.table.noExample")}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-muted-foreground text-center">
                {t("phoneNumbers.resultsCount", { count: filteredData.length, total: data.length })}
            </div>
        </div>
    )
}
