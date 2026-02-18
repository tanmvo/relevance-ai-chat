import useSWR from "swr";
import type { PollWithOptionsAndCounts } from "@/lib/db/queries";
import { fetcher } from "@/lib/utils";

export function usePolls(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR<PollWithOptionsAndCounts[]>(
    chatId ? `/api/poll?chatId=${chatId}` : null,
    fetcher
  );

  return {
    polls: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
