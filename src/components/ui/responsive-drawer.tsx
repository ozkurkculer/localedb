"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"

interface ResponsiveDrawerProps {
    children: React.ReactNode
    trigger: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    side?: "top" | "bottom" | "left" | "right"
    className?: string
}

export function ResponsiveDrawer({
    children,
    trigger,
    open,
    onOpenChange,
    side = "right",
    className,
}: ResponsiveDrawerProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (isDesktop) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>
                    {trigger}
                </SheetTrigger>
                <SheetContent side={side} className={className}>
                    {children}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                {trigger}
            </DrawerTrigger>
            <DrawerContent className={className}>
                {children}
            </DrawerContent>
        </Drawer>
    )
}
