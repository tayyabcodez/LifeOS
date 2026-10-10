import { useSyncExternalStore } from 'react';
import { useLifeStore } from '@/store/lifeStore';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerSnapshot = () => false;

export function useReducedMotion() {
  const settingsMotion = useLifeStore((state) => state.settings.reducedMotion);
  const prefersReduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (settingsMotion === 'on') return true;
  if (settingsMotion === 'off') return false;
  return prefersReduced;
}
