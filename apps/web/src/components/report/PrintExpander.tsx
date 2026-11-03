"use client";

import { useEffect } from "react";

/**
 * Browsers leave closed <details> out of a printout, which would drop every
 * "Why", every table fallback and the decision log. This opens them all just
 * before printing and closes the same ones again afterwards.
 */
export function PrintExpander() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];

    const open = () => {
      opened = [
        ...document.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
      ];
      for (const details of opened) details.open = true;
    };
    const restore = () => {
      for (const details of opened) details.open = false;
      opened = [];
    };

    window.addEventListener("beforeprint", open);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", open);
      window.removeEventListener("afterprint", restore);
    };
  }, []);

  return null;
}
