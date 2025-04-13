'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook that observes the size of a referenced element using ResizeObserver.
 * 
 * @param {React.RefObject<Element>} ref - A ref object pointing to the element to observe.
 * @returns {{ width: number, height: number } | null} - An object containing the width and height of the observed element, or null if not available.
 */
export function useResizeObserver(ref) {
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    const observeTarget = ref.current;
    if (!observeTarget) {
      return;
    }

    const resizeObserver = new ResizeObserver(entries => {
      // Usually, we only observe one element.
      const entry = entries[0];
      if (entry) {
        // Use contentRect for dimensions, fallback to boundingClientRect if needed
        const { width, height } = entry.contentRect || entry.target.getBoundingClientRect();
        // Update state only if dimensions have changed to avoid infinite loops
        setDimensions(prevDimensions => {
          const newWidth = Math.round(width);
          const newHeight = Math.round(height);
          if (prevDimensions && prevDimensions.width === newWidth && prevDimensions.height === newHeight) {
            return prevDimensions;
          }
          return { width: newWidth, height: newHeight };
        });
      }
    });

    resizeObserver.observe(observeTarget);

    // Cleanup function to disconnect the observer when the component unmounts or ref changes.
    return () => {
      resizeObserver.unobserve(observeTarget);
      resizeObserver.disconnect();
    };
  }, [ref]); // Re-run effect if the ref changes

  return dimensions;
} 