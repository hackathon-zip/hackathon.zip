import { Hackathon } from "@prisma/client";
import useSWR from "swr";

export function useMyHackathons(): DataHookOutput<{ hackathons: Hackathon[] }> {
    const { data, error, isLoading } = useSWR("/api/hackathons/list", {});

    console.log({ data, error, isLoading });

    return {
        hackathons: data ?? [],
        isLoading,
        isError: error,
    };
}

export function useHackathon(
    slug: string,
): DataHookOutput<{ hackathon: Hackathon }> {
    const { data, error, isLoading } = useSWR(`/api/hackathons/${slug}`, {});

    return {
        hackathon: data,
        isLoading,
        isError: error,
    };
}
