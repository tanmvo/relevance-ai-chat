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
      className="gap-2"
      onClick={handleCopy}
      size={size}
      type="button"
      variant={variant}
    >
      {copied ? (
        <>
          <CheckIcon className="size-4" />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
