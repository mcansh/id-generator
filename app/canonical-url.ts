export let CANONICAL_ORIGIN = "https://id.mcan.sh";

export function canonicalHref(pathname: string): string {
  return new URL(pathname, CANONICAL_ORIGIN).href;
}
