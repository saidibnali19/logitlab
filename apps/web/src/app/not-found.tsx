import Link from "next/link";

import { SiteHeader } from "@/components/layout/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6"
      >
        <p className="text-brand font-mono text-sm">404</p>
        <h1 className="text-display mt-1">Page not found</h1>
        <p className="text-lead text-ink-muted mt-4">
          There is nothing at this address. The analysis lives on the home page.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to LogitLab
        </Link>
      </main>
    </>
  );
}
