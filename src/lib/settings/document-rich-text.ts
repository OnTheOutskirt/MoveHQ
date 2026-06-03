/** True when content looks like HTML rather than plain / markdown text. */
export function looksLikeHtml(text: string): boolean {
  return /<(?:p|br|ul|ol|li|strong|em|b|i|u|h[1-6]|div|span|a)[\s>/]/i.test(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convert legacy plain / **markdown** content to HTML for the visual editor. */
export function plainTextToHtml(text: string): string {
  if (!text.trim()) return "";
  if (looksLikeHtml(text)) return text;
  return text
    .split(/\n\n+/)
    .map((block) => {
      const inner = escapeHtml(block)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
      return `<p>${inner}</p>`;
    })
    .join("");
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "h2",
  "h3",
  "span",
  "div",
]);

/** Strip scripts and disallowed tags from admin-authored HTML. */
export function sanitizeRichHtml(html: string): string {
  if (typeof document === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: Node) => {
    const children = [...node.childNodes];
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          el.replaceWith(...el.childNodes);
          continue;
        }
        for (const attr of [...el.attributes]) {
          if (attr.name.startsWith("on") || attr.name === "style") {
            el.removeAttribute(attr.name);
          }
        }
        if (tag === "a") {
          const href = el.getAttribute("href") ?? "";
          if (!/^https?:|^mailto:|^tel:|^#|^$/.test(href)) {
            el.removeAttribute("href");
          }
        }
      }
      walk(child);
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

/** Render stored content (HTML or legacy plain) with merge fields applied. */
export function renderDocumentRichHtml(text: string, vars: Record<string, string>): string {
  const merged = text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
  const html = looksLikeHtml(merged) ? merged : plainTextToHtml(merged);
  return sanitizeRichHtml(html);
}
