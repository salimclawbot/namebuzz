// Lightweight helper — no seed-sales data dependency
export function domainToSlug(domain: string): string {
  return domain.toLowerCase().replace(/\./g, "-").replace(/\s+/g, "-");
}
