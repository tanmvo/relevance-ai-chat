"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type CopyLinkButtonProps = {
  pollId: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost";
  label?: string;
};

export function CopyLinkButton({
  pollId,
  size = "sm",
  variant = "outline",
  label = "Share link",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}/poll/${pollId}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      className="h-7 gap-1.5 px-2.5 text-xs"
      onClick={handleCopy}
      size={size}
      type="button"
      variant={variant}
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5" />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon className="size-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
