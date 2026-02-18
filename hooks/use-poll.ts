import useSWR from "swr";
import type { PollWithFullVotes } from "@/lib/db/queries";
import { fetcher } from "@/lib/utils";

export type PollData = {
  poll: PollWithFullVotes;
  tripContext: {
    tripName: string | null;
    destination: string | null;
    startDate: string | null;
    endDate: string | null;
  } | null;
};

export function usePoll(pollId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<PollData>(
    pollId ? `/api/poll/${pollId}/public` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  return {
    poll: data?.poll ?? null,
    tripContext: data?.tripContext ?? null,
    isLoading,
    error,
    mutate,
  };
}
