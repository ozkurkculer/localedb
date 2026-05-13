"use client";

import { Fragment, type ReactNode } from "react";

const tokenRegex =
  /("(?:\\.|[^"\\])*"\s*:?)|("(?:\\.|[^"\\])*")|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false)\b|\b(null)\b|([{}\[\],])/g;

export function JsonHighlight({ value }: { value: string }) {
  if (!value) return null;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = tokenRegex.exec(value)) !== null) {
    if (m.index > lastIndex) {
      parts.push(<Fragment key={key++}>{value.slice(lastIndex, m.index)}</Fragment>);
    }
    const [match, keyMatch, strMatch, numMatch, boolMatch, nullMatch, punctMatch] = m;
    if (keyMatch) {
      const isKey = keyMatch.trimEnd().endsWith(":");
      if (isKey) {
        const colonIdx = keyMatch.lastIndexOf(":");
        parts.push(
          <Fragment key={key++}>
            <span className="text-sky-600 dark:text-sky-400">{keyMatch.slice(0, colonIdx).trim()}</span>
            <span className="text-muted-foreground">{keyMatch.slice(colonIdx)}</span>
          </Fragment>
        );
      } else {
        parts.push(
          <span key={key++} className="text-emerald-600 dark:text-emerald-400">
            {match}
          </span>
        );
      }
    } else if (strMatch) {
      parts.push(
        <span key={key++} className="text-emerald-600 dark:text-emerald-400">
          {match}
        </span>
      );
    } else if (numMatch) {
      parts.push(
        <span key={key++} className="text-amber-600 dark:text-amber-400">
          {match}
        </span>
      );
    } else if (boolMatch) {
      parts.push(
        <span key={key++} className="text-rose-600 dark:text-rose-400 font-semibold">
          {match}
        </span>
      );
    } else if (nullMatch) {
      parts.push(
        <span key={key++} className="text-muted-foreground italic">
          {match}
        </span>
      );
    } else if (punctMatch) {
      parts.push(
        <span key={key++} className="text-muted-foreground">
          {match}
        </span>
      );
    }
    lastIndex = m.index + match.length;
  }
  if (lastIndex < value.length) {
    parts.push(<Fragment key={key++}>{value.slice(lastIndex)}</Fragment>);
  }
  return <>{parts}</>;
}
