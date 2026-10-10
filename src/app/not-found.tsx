import DefaultNotFound from "next/dist/client/components/builtin/not-found";
import { fontClassName } from "./fonts";

// Requests that never reach `[locale]/layout.tsx` (unknown paths, `notFound()` in a page) end up
// here, outside any locale, so this page renders its own `<html>` with the default locale.
// The content is Next's built-in 404, unchanged from when the root layout rendered `<html>`.
export default function NotFound() {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/flag-icons@7.3.2/css/flag-icons.min.css"
        />
      </head>
      <body className={fontClassName}>
        <DefaultNotFound />
      </body>
    </html>
  );
}
