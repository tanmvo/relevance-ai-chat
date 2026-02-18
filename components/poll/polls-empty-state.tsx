import { BarChart3Icon } from "lucide-react";

export function PollsEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <BarChart3Icon className="size-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold">No polls yet</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          Create a poll by asking in the Chat. The AI will help you set up
          polls to gather input from your guests.
        </p>
      </div>
    </div>
  );
}
