import { useEffect, useState } from "react";

/** Hook media query an toàn khi render lần đầu / không có window. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Desktop layout chính thức (không phải tablet). */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1200px)");
}

/** Console nổi bên phải: tablet/fold/duo đủ rộng và đủ cao. */
export function useIsConsole(): boolean {
  return useMediaQuery("(min-width: 900px) and (min-height: 640px)");
}

export function useIsWide(): boolean {
  return useMediaQuery("(min-width: 1600px)");
}
