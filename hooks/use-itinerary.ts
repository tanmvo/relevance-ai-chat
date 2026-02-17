import useSWR from "swr";
import type { Itinerary, ItineraryItem } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";

export type ItineraryData = {
  itinerary: Itinerary;
  items: ItineraryItem[];
};

export function useItinerary(chatId: string) {
  const { data, error, isLoading, mutate } = useSWR<ItineraryData>(
    chatId ? `/api/itinerary?chatId=${chatId}` : null,
    fetcher
  );

  return {
    itinerary: data?.itinerary ?? null,
    items: data?.items ?? [],
    isLoading,
    error,
    mutate,
  };
}
