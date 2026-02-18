"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { CheckIcon, CopyIcon, ListChecksIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChatMessage } from "@/lib/types";

type CreatePollInput = {
  question: string;
  options: Array<{ label: string; description?: string }>;
};

type CreatePollOutput = {
  success: true;
  pollId: string;
  question: string;
  options: Array<{ id: string; label: string; description: string | null }>;
  shareUrl: string;
} | {
  success: false;
  error: string;
};

type PollCreationCardProps = {
  state: string;
  input?: CreatePollInput;
  output?: CreatePollOutput;
  approval?: { id: string; approved?: boolean; reason?: string };
  addToolApprovalResponse: UseChatHelpers<ChatMessage>["addToolApprovalResponse"];
};

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${url}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      className="gap-2"
      onClick={handleCopy}
      size="sm"
      type="button"
      variant="outline"
    >
      {copied ? (
        <>
          <CheckIcon className="size-4" />
          Copied!
        </>
      ) : (
        <>
          <CopyIcon className="size-4" />
          Copy share link
        </>
      )}
    </Button>
  );
}

function OptionPreview({ label, description, index }: {
  label: string;
  description?: string | null;
  index: number;
}) {
  return (
    <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {String.fromCharCode(65 + index)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function PollCreationCard({
  state,
  input,
  output,
  approval,
  addToolApprovalResponse,
}: PollCreationCardProps) {
  if (state === "approval-requested" && input && approval) {
    return (
      <Card className="w-full border-primary/20">
        <CardContent className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:size-12">
              <ListChecksIcon className="size-5 text-primary md:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold md:text-base">
                  Create Poll
                </h3>
                <Badge className="text-xs" variant="secondary">
                  Review
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Review the suggested poll before creating
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 md:p-4">
            <p className="font-medium text-sm md:text-base">
              {input.question}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {input.options.map((option, index) => (
              <OptionPreview
                description={option.description}
                index={index}
                key={option.label}
                label={option.label}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() =>
                addToolApprovalResponse({
                  id: approval.id,
                  approved: false,
                  reason: "User wants different options",
                })
              }
              size="sm"
              type="button"
              variant="ghost"
            >
              <XIcon className="mr-1 size-4" />
              Deny
            </Button>
            <Button
              onClick={() =>
                addToolApprovalResponse({
                  id: approval.id,
                  approved: true,
                })
              }
              size="sm"
              type="button"
            >
              <CheckIcon className="mr-1 size-4" />
              Create Poll
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "approval-responded") {
    const wasApproved = approval?.approved;
    if (wasApproved === false) {
      return (
        <Card className="w-full opacity-60">
          <CardContent className="flex items-center gap-3 p-4">
            <XIcon className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Poll creation denied — ask Alfred to suggest different options
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Creating poll...</p>
        </CardContent>
      </Card>
    );
  }

  if (state === "output-denied") {
    return (
      <Card className="w-full opacity-60">
        <CardContent className="flex items-center gap-3 p-4">
          <XIcon className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Poll creation was denied
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === "output-available" && output) {
    if (!output.success) {
      return (
        <Card className="w-full border-destructive/20">
          <CardContent className="flex items-center gap-3 p-4">
            <XIcon className="size-5 text-destructive" />
            <p className="text-sm text-destructive">{output.error}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full border-green-500/20">
        <CardContent className="flex flex-col gap-4 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 md:size-12">
              <CheckIcon className="size-5 text-green-600 md:size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold md:text-base">
                  Poll Created
                </h3>
                <Badge className="bg-green-500/10 text-green-700 text-xs">
                  Live
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Share the link to collect votes
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 md:p-4">
            <p className="font-medium text-sm md:text-base">
              {output.question}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {output.options.map((option, index) => (
              <OptionPreview
                description={option.description}
                index={index}
                key={option.id}
                label={option.label}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <CopyLinkButton url={output.shareUrl} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "output-error") {
    return (
      <Card className="w-full border-destructive/20">
        <CardContent className="flex items-center gap-3 p-4">
          <XIcon className="size-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to create poll. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
