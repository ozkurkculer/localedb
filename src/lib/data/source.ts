/**
 * Where the site's JSON data is read from. Every file system access in `src/` goes through
 * `./fs.ts`; the rest of the app only sees this interface, so a deployment without a real
 * disk (Cloudflare Workers) can swap in another implementation.
 */
export interface DataSource {
  /** The file's contents, or null when it does not exist. Other failures throw. */
  readText(relativePath: string): Promise<string | null>;
  /** File names in a directory, or [] when it does not exist. Other failures throw. */
  list(relativeDir: string): Promise<string[]>;
}
