export const fetcher = async (url: string) => {
    console.log({ url });
    const output = await fetch(url).then((res) => res.json());
    console.log({ output });
    return output;
};
