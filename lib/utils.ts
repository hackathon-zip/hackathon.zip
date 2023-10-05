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
            slug: subdomains?.[0]
        }
    });

    if (!hackathon) {
        throw new Error("Hackathon not found");
    }

    return hackathon;
}

export async function getHackathonSlug(slugParameter: string): Promise<string> {
    try {
        const res = await prisma.hackathon.findFirst({
            where: {
                OR: [
                    {
                        slug: slugParameter
                    },
                    {
                        customDomain: slugParameter
                    }
                ]
            },
            select: {
                slug: true
            }
        });

        if (!res) {
            throw new Error("Hackathon not found");
        }

        return res.slug;
    } catch (err) {
        console.error(err);
        throw new Error("Hackathon not found");
    }
}

export function formatPhoneNumber(phoneNumberString: string) {
    var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        var intlCode = match[1] ? "+1 " : "";
        return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join(
            ""
        );
    }
    return null;
}
