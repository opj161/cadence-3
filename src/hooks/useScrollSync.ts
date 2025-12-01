import { useLayoutEffect, RefObject } from 'react';

/**
 * Synchronizes the scroll position of multiple elements.
 * 
 * @param sourceRef - The element triggering the scroll (usually textarea)
 * @param targetRefs - Array of elements to sync (gutter, backdrop)
 */
export const useScrollSync = (
  sourceRef: RefObject<HTMLElement | null>,
  targetRefs: RefObject<HTMLElement | null>[]
) => {
  useLayoutEffect(() => {
    const source = sourceRef.current;
    if (!source) return;

    const handleScroll = () => {
      // Using requestAnimationFrame for smoother rendering matching the refresh rate
      requestAnimationFrame(() => {
        const scrollTop = source.scrollTop;
        const scrollLeft = source.scrollLeft;

        targetRefs.forEach(ref => {
          if (ref.current) {
            ref.current.scrollTop = scrollTop;
            ref.current.scrollLeft = scrollLeft;
          }
        });
      });
    };

    source.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      source.removeEventListener('scroll', handleScroll);
    };
  }, [sourceRef, targetRefs]);
};
