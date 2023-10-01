import { useRouter } from "next/router";

export default function useUrlState (fragmentsToFind: Array<string | null>): { [key: string]: string } {
    const { asPath } = useRouter();

    const fragments = asPath.substring(1).split('/');
    const output: { [key: string]: string } = {};

    fragmentsToFind.forEach((fragment, index) => {
        if (fragment) {
            output[fragment] = fragments[index];
        }
    });

    return output;
}
