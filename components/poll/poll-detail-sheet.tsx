"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PollSummaryCard } from "./poll-summary-card";

type PollDetailSheetProps = {
  pollId: string | null;
  onClose: () => void;
};

export function PollDetailSheet({ pollId, onClose }: PollDetailSheetProps) {
  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={pollId !== null}>
      <SheetContent
        className="max-h-[85dvh] overflow-y-auto rounded-t-2xl px-4 pb-8 pt-6"
        side="bottom"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Poll Details</SheetTitle>
          <SheetDescription>
            View poll results and vote breakdown
          </SheetDescription>
        </SheetHeader>

        {pollId && <PollSummaryCard pollId={pollId} />}
      </SheetContent>
    </Sheet>
  );
}
