"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copyToClipboard: (text: string, label?: string) => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string, label?: string) => {
    if (!navigator?.clipboard) {
      toast.error("Clipboard not supported");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success(label ? `Copied ${label}` : "Copied to clipboard");

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy");
      console.error("Copy failed:", error);
    }
  };

  return { isCopied, copyToClipboard };
}
