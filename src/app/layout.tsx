import "./globals.css";

// `<html>` and `<body>` live in `[locale]/layout.tsx`, the only place that knows the locale
// (a root layout never receives params from child segments). This layout still has to exist
// because `not-found.tsx` sits at the root; it renders its own `<html>`.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
