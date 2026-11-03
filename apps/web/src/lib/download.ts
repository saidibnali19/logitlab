/** Saves text as a file in the visitor's browser. Nothing is uploaded anywhere. */
export function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Released on the next tick, once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** A file-safe name, e.g. "Framingham Heart Study" becomes "framingham-heart-study". */
export function slug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "logitlab"
  );
}
