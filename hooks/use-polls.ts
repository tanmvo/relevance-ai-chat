import useSWR from "swr";
import type { PollWithOptionsAndCounts } from "@/lib/db/queries";
import { fetcher } from "@/lib/utils";

export function usePolls(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR<PollWithOptionsAndCounts[]>(
    chatId ? `/api/poll?chatId=${chatId}` : null,
    fetcher,
    {
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (err.statusCode === 403 || err.statusCode === 404) {
          return;
        }
        if (retryCount >= 3) {
          return;
        }
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return {
    polls: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
