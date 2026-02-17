"use client";

import { CheckIcon, LinkIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useItinerary } from "@/hooks/use-itinerary";
import { cn } from "@/lib/utils";
import { toast } from "./toast";

export function ShareButton({ chatId, className }: { chatId: string; className?: string }) {
  const { itinerary } = useItinerary(chatId);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!itinerary) {
      return;
    }

    const url = `${window.location.origin}/itinerary/${itinerary.id}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [itinerary]);

  if (!itinerary) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          aria-label={copied ? "Link copied" : "Copy shareable link"}
          className={cn(className)}
          disabled={copied}
          onClick={handleCopy}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          {copied ? (
            <CheckIcon className="size-4" />
          ) : (
            <LinkIcon className="size-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Copy shareable link</TooltipContent>
    </Tooltip>
  );
}
