'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
export function AnalyticsEvents() {
  useEffect(() => {
    track('page_view', {
      device:
        innerWidth < 640 ? 'mobile' : innerWidth < 900 ? 'tablet' : 'desktop',
    });
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        'a[data-placement]',
      );
      if (anchor) {
        const placement = anchor.dataset.placement || 'unknown';
        document.documentElement.dataset.lastCta = placement;
        track('cta_clicked', { placement });
        setTimeout(
          () =>
            document
              .querySelector<HTMLInputElement>(
                '#early-access input:not([type=hidden])',
              )
              ?.focus({ preventScroll: true }),
          300,
        );
      }
    };
    document.addEventListener('click', click);
    const details = Array.from(document.querySelectorAll('details'));
    const listeners = details.map((detail, faq_id) => {
      const listener = () => {
        if (detail.open) track('faq_opened', { faq_id });
      };
      detail.addEventListener('toggle', listener);
      return () => detail.removeEventListener('toggle', listener);
    });
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            track('section_viewed', { section_id: entry.target.id });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    document
      .querySelectorAll('section[id]')
      .forEach((section) => observer.observe(section));
    return () => {
      document.removeEventListener('click', click);
      observer.disconnect();
      listeners.forEach((cleanup) => cleanup());
    };
  }, []);
  return null;
}
