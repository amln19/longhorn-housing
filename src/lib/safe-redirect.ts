/**
 * Same-origin relative path only. Blocks scheme-relative URLs and obvious open redirects.
 */
export function safeAuthRedirectPath(next: string | null | undefined): string {
  const fallback = "/dashboard";
  if (next == null || next === "") return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://") || trimmed.includes("\\")) return fallback;
  return trimmed;
}
