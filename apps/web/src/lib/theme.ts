/**
 * The visitor's colour scheme. By default the page follows the system. The
 * header toggle can pin light or dark for this browser: the choice is kept in
 * localStorage and shown as data-theme on <html>. With no stored choice the
 * page simply follows the system, which needs no script at all (see
 * styles/theme.css), so nothing breaks if JavaScript never runs.
 */

export const THEME_KEY = "logitlab-theme";

export type Scheme = "light" | "dark";

/** Runs in <head> before the first paint, so a pinned scheme never flashes the wrong one. */
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function systemScheme(): Scheme {
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The scheme on screen now: the pinned one if there is one, otherwise the system's. */
function renderedScheme(): Scheme {
  const pinned = document.documentElement.dataset.theme;
  return pinned === "light" || pinned === "dark" ? pinned : systemScheme();
}

/** Shows a stored choice on the page, or goes back to following the system when there is none. */
export function applyStored(value: string | null) {
  const root = document.documentElement;
  if (value === "light" || value === "dark") root.dataset.theme = value;
  else delete root.dataset.theme;
}

/**
 * Switches to the opposite of what is on screen. Landing back on the system's
 * own scheme removes the stored choice, so the page follows the system again.
 * A stored choice is never removed later just because the system catches up
 * with it: many systems switch by time of day, and that would make pinning
 * impossible.
 */
export function toggleScheme() {
  const target: Scheme = renderedScheme() === "dark" ? "light" : "dark";
  const pinned = target === systemScheme() ? null : target;
  applyStored(pinned);
  try {
    if (pinned) localStorage.setItem(THEME_KEY, pinned);
    else localStorage.removeItem(THEME_KEY);
  } catch {
    // Storage can be blocked. The page still switches for this visit.
  }
}
