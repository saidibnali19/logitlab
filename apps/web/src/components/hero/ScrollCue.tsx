import { ChevronDown } from "lucide-react";

export function ScrollCue() {
  return (
    <a
      href="#report-outline"
      aria-label="Scroll to the report outline"
      className="nav-link mt-auto self-center p-2"
    >
      <ChevronDown className="size-6 motion-safe:animate-bounce" />
    </a>
  );
}
