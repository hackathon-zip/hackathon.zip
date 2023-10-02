import { Hackathon } from "@prisma/client";
import prisma from "./prisma";

export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

type Params = Record<string, unknown>;

export function permitParams<T extends Params>(
    allowedKeys: (keyof T)[],
    params: T
): T {
    const permittedParams = {} as T;

    for (const key of allowedKeys) {
        if (params.hasOwnProperty(key)) {
            permittedParams[key] = params[key];
        }
    }

    return permittedParams;
}

export function getSubdomains(host: string | null): string[] | undefined {
    // supports localhost subdomains
    if (!host) {
        return undefined;
    }
    const parts = host.split(".");

    if (process.env.NODE_ENV === "development" || host.includes("localhost")) {
        return parts.slice(0, parts.length - 1);
    }

    if (parts.length <= 2) {
        return [];
    }

    return parts.slice(0, parts.length - 2);
}

export async function getHackathonBySubdomain(
    host: string
): Promise<Hackathon> {
    const subdomains = getSubdomains(host);
    const hackathon = await prisma.hackathon.findUnique({
        where: {
            slug: subdomains?.[0],
        },
    });

    if (!hackathon) {
        throw new Error("Hackathon not found");
    }

    return hackathon;
}
