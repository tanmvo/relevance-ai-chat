import Link from "next/link";

export default function PublicPollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <span className="text-sm font-semibold tracking-tight">
          Trip Planner
        </span>
        <Link
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href="/"
        >
          Plan your own trip
        </Link>
      </header>
      <main className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
