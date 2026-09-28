import type { LocaleDB } from "@localedb/core";

export interface Output {
  write(chunk: string): unknown;
}

export interface Context {
  db: LocaleDB;
  stdout: Output;
  stderr: Output;
  cwd: string;
  /** Whether prompts can be shown (a TTY on both ends). */
  interactive: boolean;
  version: string;
}
