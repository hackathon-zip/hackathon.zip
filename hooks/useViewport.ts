import { useEffect, useId, useState } from "react";

export default function useViewport(update?: boolean) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const id = useId();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleWindowResize = () => {
                if (
                    update ||
                    !(window as any)["viewportAlreadyCalculated" + id]
                ) {
                    setWidth(window.innerWidth);
                    setHeight(window.innerHeight);
                    (window as any)["viewportAlreadyCalculated" + id] = true;
                }
            };

            window.addEventListener("resize", handleWindowResize);

            handleWindowResize();

            return () =>
                window.removeEventListener("resize", handleWindowResize);
        }
    }, []);

    return { width, height };
}
