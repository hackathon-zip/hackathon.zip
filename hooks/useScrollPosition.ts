import { useEffect, useState } from "react";

interface ScrollPosition {
    scrollX: number;
    scrollY: number;
}

export const useScrollPosition = (): ScrollPosition => {
    const [scrollPositions, setScrollPositions] = useState<ScrollPosition>({
        scrollX: 0,
        scrollY: 0,
    });

    useEffect(() => {
        const handleScroll = () => {
            console.log("handle scroll");
            setScrollPositions({
                scrollX: window.scrollX,
                scrollY: window.scrollY,
            });
        };

        document.body.addEventListener("scroll", handleScroll);

        return () => {
            document.body.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return scrollPositions;
};
