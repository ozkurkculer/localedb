"use client"

import * as React from "react"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative size-[18px] shrink-0 rounded-[5px] border border-zinc-400 bg-card shadow-sm dark:border-zinc-600",
        "transition-colors duration-150 ease-out",
        "hover:border-indigo-500/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-indigo-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
        "data-[state=indeterminate]:border-indigo-600 data-[state=indeterminate]:bg-indigo-600 data-[state=indeterminate]:text-white",
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current data-[state=indeterminate]:[&_svg.check]:hidden data-[state=checked]:[&_svg.dash]:hidden"
      >
        <CheckIcon className="check size-3.5 stroke-[3]" />
        <MinusIcon className="dash size-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
