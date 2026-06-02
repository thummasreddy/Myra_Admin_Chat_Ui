const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
};

export function sanitizeText(value: string) {
  return value.trim().replace(/[&<>"']/g, (char) => HTML_ENTITY_MAP[char]);
}

export function sanitizePayload<T>(value: T): T {
  if (typeof value === "string") return sanitizeText(value) as T;
  if (Array.isArray(value)) return value.map((item) => sanitizePayload(item)) as T;
  if (value && typeof value === "object" && !(value instanceof File) && !(value instanceof FormData)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizePayload(item)])
    ) as T;
  }
  return value;
}
