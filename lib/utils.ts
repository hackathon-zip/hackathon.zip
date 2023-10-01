export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

type Params = Record<string, unknown>;

export function permitParams<T extends Params>(
    allowedKeys: (keyof T)[],
    params: T,
): T {
    const permittedParams = {} as T;

    for (const key of allowedKeys) {
        if (params.hasOwnProperty(key)) {
            permittedParams[key] = params[key];
        }
    }

    return permittedParams;
}
