// components/SetHeaderVar.tsx
'use client';
import { useEffect, useLayoutEffect } from 'react';

export default function SetHeaderVar({ headerSelector = '[data-app-header]' }) {
  const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;
  useIso(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const header = document.querySelector<HTMLElement>(headerSelector);
    if (!header) return;
    const set = () =>
      document.documentElement.style.setProperty('--topbar-h', `${header.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(header);
    window.addEventListener('resize', set);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', set);
    };
  }, [headerSelector]);
  return null;
}
