import { useEffect, useState } from 'react';
import { useLifeStore } from '@/store/lifeStore';

export function useReducedMotion() {
  const settingsMotion = useLifeStore((state) => state.settings.reducedMotion);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  if (settingsMotion === 'on') return true;
  if (settingsMotion === 'off') return false;
  return prefersReduced;
}
