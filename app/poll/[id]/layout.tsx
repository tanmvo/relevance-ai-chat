import { ButlerIcon } from "@/components/icons";

export default function PublicPollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center border-b bg-background px-4 py-3">
        <span className="flex items-center gap-1.5 text-sm font-semibold tracking-tight">
          <ButlerIcon size={18} />
          Butler
        </span>
      </header>
      <main className="flex flex-1 justify-center">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
