import { useEffect, useRef } from 'react';

/**
 * Sets the document title and restores the previous title on unmount.
 * @param {string} title - The page title to set (will be appended with " | ApexBuild").
 * @param {boolean} [restoreOnUnmount=true] - Whether to restore the previous title when the component unmounts.
 */
export function useDocumentTitle(title, restoreOnUnmount = true) {
  const previousTitle = useRef(document.title);

  useEffect(() => {
    if (title) {
      document.title = `${title} | ApexBuild`;
    }
  }, [title]);

  useEffect(() => {
    const prev = previousTitle.current;
    return () => {
      if (restoreOnUnmount) {
        document.title = prev;
      }
    };
  }, [restoreOnUnmount]);
}
