"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

import { THEME_KEY, applyStored, toggleScheme } from "@/lib/theme";

/**
 * Both actions are in the markup, and CSS shows the one that leaves the scheme
 * now on screen (see .theme-to-dark in components.css). So the button is right
 * before any script runs, and it stays right when the system changes scheme.
 */
export function ThemeToggle() {
  // Another tab changed the choice: follow it.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== THEME_KEY && event.key !== null) return;
      try {
        applyStored(localStorage.getItem(THEME_KEY));
      } catch {
        // Storage can be blocked; there is nothing to follow.
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleScheme}
      className="nav-link size-8 justify-center"
    >
      <span className="theme-to-dark">
        <Moon className="size-4" aria-hidden="true" />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="theme-to-light">
        <Sun className="size-4" aria-hidden="true" />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}
