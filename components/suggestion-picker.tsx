"use client";

import {
  BedDoubleIcon,
  CarIcon,
  CheckIcon,
  CircleDotIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  TagIcon,
  UtensilsIcon,
} from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useChatActions } from "./chat-actions-context";

type Suggestion = {
  title: string;
  description?: string;
  type?: "activity" | "meal" | "accommodation" | "transport" | "experience";
  estimatedPrice?: string;
  duration?: string;
};

type SuggestionPickerCardProps = {
  state: string;
  toolCallId: string;
  input?: {
    context: string;
    suggestions: Suggestion[];
  };
  output?: {
    context: string;
    suggestions: Suggestion[];
  };
};

const typeConfig: Record<
  string,
  { icon: ReactNode; label: string; color: string }
> = {
  activity: {
    icon: <MapPinIcon className="size-3.5" />,
    label: "Activity",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  meal: {
    icon: <UtensilsIcon className="size-3.5" />,
    label: "Meal",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  accommodation: {
    icon: <BedDoubleIcon className="size-3.5" />,
    label: "Stay",
    color: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  },
  transport: {
    icon: <CarIcon className="size-3.5" />,
    label: "Transport",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  experience: {
    icon: <SparklesIcon className="size-3.5" />,
    label: "Experience",
    color: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  },
};

function SuggestionOption({
  suggestion,
  index,
  isSelected,
  isDisabled,
  onSelect,
}: {
  suggestion: Suggestion;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  const config = suggestion.type ? typeConfig[suggestion.type] : null;

  return (
    <button
      className={cn(
        "group/option flex w-full gap-3 rounded-xl border p-3 text-left transition-all md:p-4",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border bg-background hover:border-primary/30 hover:bg-muted/50",
        isDisabled && !isSelected && "pointer-events-none opacity-50"
      )}
      disabled={isDisabled && !isSelected}
      onClick={onSelect}
      type="button"
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground group-hover/option:bg-primary/10 group-hover/option:text-primary"
        )}
      >
        {isSelected ? (
          <CheckIcon className="size-4" />
        ) : (
          String.fromCharCode(65 + index)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm leading-tight md:text-base">
            {suggestion.title}
          </p>
          {config && (
            <Badge
              className={cn(
                "hidden gap-1 px-1.5 py-0 text-[10px] sm:inline-flex",
                config.color
              )}
              variant="secondary"
            >
              {config.icon}
              {config.label}
            </Badge>
          )}
        </div>

        {suggestion.description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
            {suggestion.description}
          </p>
        )}

        {(suggestion.estimatedPrice ?? suggestion.duration) && (
          <div className="mt-1.5 flex items-center gap-3">
            {suggestion.estimatedPrice && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <TagIcon className="size-3" />
                {suggestion.estimatedPrice}
              </span>
            )}
            {suggestion.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ClockIcon className="size-3" />
                {suggestion.duration}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

export function SuggestionPickerCard({
  state,
  toolCallId,
  input,
  output,
}: SuggestionPickerCardProps) {
  const chatActions = useChatActions();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const data = output ?? input;
  const isInteractive =
    state === "output-available" && selectedIndex === null;

  const handleSelect = useCallback(
    (index: number) => {
      if (!isInteractive || !data) {
        return;
      }

      const suggestion = data.suggestions.at(index);
      if (!suggestion) {
        return;
      }

      setSelectedIndex(index);

      const message = `I'd like "${suggestion.title}"`;
      chatActions?.sendMessage({
        role: "user",
        parts: [{ type: "text", text: message }],
      });
    },
    [isInteractive, data, chatActions]
  );

  const isLoading = useMemo(
    () =>
      state === "input-streaming" ||
      state === "input-available" ||
      (!data && state !== "output-error"),
    [state, data]
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Preparing suggestions...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state === "output-error") {
    return null;
  }

  if (!data) {
    return null;
  }

  return (
    <Card
      className="w-full border-border/60"
      data-testid={`suggestion-picker-${toolCallId}`}
    >
      <CardContent className="flex flex-col gap-3 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 md:size-12">
            <CircleDotIcon className="size-5 text-primary md:size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold md:text-base">
              {data.context}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {selectedIndex !== null
                ? "Selection made"
                : "Tap an option to choose"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {data.suggestions.map((suggestion, index) => (
            <SuggestionOption
              index={index}
              isDisabled={selectedIndex !== null}
              isSelected={selectedIndex === index}
              key={`${toolCallId}-${suggestion.title}`}
              onSelect={() => handleSelect(index)}
              suggestion={suggestion}
            />
          ))}
        </div>

        {isInteractive && (
          <p className="text-center text-xs text-muted-foreground">
            Select your preference and I&apos;ll take it from there
          </p>
        )}
      </CardContent>
    </Card>
  );
}
