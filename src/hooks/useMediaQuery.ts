import { createSignal, onCleanup } from "solid-js"

const queries = {
  'sm': '(max-width: 640px)',
  'md': '(min-width: 768px) and (max-width: 1023px)',
  'lg': '(min-width: 1024px) and (max-width: 1279px)',
  'xl': '(min-width: 1280px) and (max-width: 1535px)',
  '2xl': '(min-width: 1536px)',
}

export default function useMediaQuery() {
  const [matches, setMatches] = createSignal('sm');
  const cleanMediaQuery: any[] = [];


  if (typeof window !== 'undefined') {
    Object.entries(queries).forEach(([name, query]) => {
      const mediaQuery = window.matchMedia(query);

      const listener = (meidaQuery: MediaQueryList | MediaQueryListEvent, name: string) => {
        if (meidaQuery.matches) setMatches(name);
      }

      listener(mediaQuery, name);

      const handle = (e: MediaQueryListEvent) => listener(e, name);

      mediaQuery.addEventListener('change', handle);
      cleanMediaQuery.push(() => mediaQuery.removeEventListener('change', handle));
    });
  }

  onCleanup(() => cleanMediaQuery.forEach((clean) => clean()));

  return matches
}