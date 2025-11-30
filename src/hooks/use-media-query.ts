
import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      
      // Initial check
      setMatches(media.matches);
      
      // Create listener that triggers on change
      const listener = () => setMatches(media.matches);
      
      // Add the listener to media query
      media.addEventListener("change", listener);
      
      // Clean up
      return () => {
        media.removeEventListener("change", listener);
      };
    }
    
    return undefined;
  }, [query]);

  return matches;
}
