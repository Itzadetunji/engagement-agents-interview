export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*'"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function toAbsoluteUrl(baseUrl: string, href: string): string {
  if (href.startsWith("http")) return href;
  return `${baseUrl.replace(/\/$/, "")}/${href.replace(/^\//, "")}`;
}

export function dealPathToKey(dealPath: string): string {
  return dealPath
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .replace(/\//g, "_");
}

export function buildPromotionUniqueId(
  brandName: string,
  dealPath: string,
): string {
  return `${normalizeName(brandName)}_${dealPathToKey(dealPath)}`;
}

export function buildBrandUniqueId(storePath: string): string {
  const slug = storePath.replace(/^\//, "").replace(/^stores\//, "").replace(/\/$/, "");
  return slug.replace(/-/g, "_");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function excelSerialToIso(serial: number): string | null {
  if (!Number.isFinite(serial) || serial <= 0) return null;
  const ms = (serial - 25569) * 86400000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}
