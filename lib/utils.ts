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

function ui$getContrastingColor(hex: string): string {
    // Function to convert hex to RGB
    function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
              }
            : null;
    }

    // Calculate luminance value
    function calculateLuminance(rgb: {
        r: number;
        g: number;
        b: number;
    }): number {
        return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    }

    // Get RGB values from the background color
    let rgb = hexToRgb(hex);

    // Calculate luminance
    let luminance = calculateLuminance(rgb!);

    // Choose foreground color based on the luminance value
    return luminance < 140 ? "#f8f8fa" : "#10151b";
}

export function styledLog(message: string, style: string) {
    console.log("%c" + message, style);
}

export function sl(message: string, color?: string, invert: boolean = false) {
    if (!color) return console.log(message);

    const contrastingColor = ui$getContrastingColor(color);
    const otherStyles = `
        padding: 3px;
        border-radius: 3px;
        font-size: 14px;
    `;

    if (invert)
        return styledLog(
            message,
            `color: ${color}; background-color: ${contrastingColor}; ${otherStyles}`
        );

    styledLog(
        message,
        `color: ${color}; background-color: ${contrastingColor}; ${otherStyles}`
    );
}

type SortFunction<ArrayItem> = (a: ArrayItem, b: ArrayItem) => number;

export type MinimumSize1Array<T> = [T, ...T[]];

export function orderedSort<ArrayItem>(
    array: ArrayItem[],
    ...sortFunctions: MinimumSize1Array<SortFunction<ArrayItem>>
) {
    return array.sort((a, b) => {
        for (const sortFunction of sortFunctions) {
            if (sortFunction) {
                const result = sortFunction(a, b);
                if (result !== 0) return result;
            }
        }
        return 0;
    });
}

export type StateTuple<StatefulType> = [
    StatefulType,
    React.Dispatch<React.SetStateAction<StatefulType>>
];
