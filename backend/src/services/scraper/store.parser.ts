import * as cheerio from "cheerio";
import type { BrandHours, SocialLink } from "@shared/brand.js";
import { buildBrandUniqueId, normalizeName, toAbsoluteUrl } from "./utils.js";

export interface ParsedStore {
  uniqueId: string;
  name: string;
  websiteUrl: string | null;
  hours: BrandHours[];
  socialLinks: SocialLink[];
  phone: string | null;
  location: string | null;
  directoryMapUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  storePath: string;
}

const SOCIAL_PATTERNS: { platform: string; test: RegExp }[] = [
  { platform: "instagram", test: /instagram\.com/i },
  { platform: "facebook", test: /facebook\.com/i },
  { platform: "tiktok", test: /tiktok\.com/i },
  { platform: "x", test: /(?:twitter|x)\.com/i },
  { platform: "youtube", test: /youtube\.com/i },
  { platform: "pinterest", test: /pinterest\.com/i },
];

export function parseStorePage(
  html: string,
  storePath: string,
  baseUrl: string,
): ParsedStore {
  const $ = cheerio.load(html);
  const slug = storePath.replace(/^\//, "").replace(/\/$/, "");
  const uniqueId = buildBrandUniqueId(storePath);

  const name =
    $("h1").first().text().trim() ||
    $("a.store-link").first().text().trim() ||
    slug.split("/").pop()?.replace(/-/g, " ") ||
    "Unknown";

  const description =
    $(".store-description").first().text().replace(/\s+/g, " ").trim() || null;

  const logoUrl =
    $("img.store-logo, header picture img").first().attr("src") ?? null;

  const phone = $('a[itemprop="phone"]').first().text().trim() || null;

  const websiteAnchor = $("a.external_link.ext_retailer").first();
  const websiteUrl = websiteAnchor.attr("href") ?? null;

  const directoryMapPath =
    $(".location-item a.read-more").first().attr("href") ?? null;
  const directoryMapUrl = directoryMapPath
    ? toAbsoluteUrl(baseUrl, directoryMapPath)
    : null;

  const hours: BrandHours[] = [];
  const seenHours = new Set<string>();
  $(".opening-hours li").each((_i, el) => {
    const item = $(el);
    const label = item.find(".label").text().replace(/\s+/g, " ").trim();
    const value = item.find(".value").text().replace(/\s+/g, " ").trim();
    const key = `${label}|${value}`;
    if ((label || value) && !seenHours.has(key)) {
      seenHours.add(key);
      hours.push({ label, value });
    }
  });

  const socialLinks: SocialLink[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("javascript:")) return;
    if (href.includes("share.php") || href.includes("/share?")) return;

    for (const { platform, test } of SOCIAL_PATTERNS) {
      if (test.test(href) && !seen.has(href)) {
        seen.add(href);
        socialLinks.push({ platform, url: href });
      }
    }
  });

  return {
    uniqueId,
    name: name.replace(/\*+/g, "").trim(),
    websiteUrl,
    hours,
    socialLinks,
    phone,
    location: null,
    directoryMapUrl,
    logoUrl,
    description,
    storePath: slug,
  };
}

export function fallbackBrandFromListing(
  brandName: string,
  storeId: string | null,
): ParsedStore {
  const slug = storeId
    ? `stores/${storeId}-${normalizeName(brandName).replace(/_/g, "-")}`
    : `stores/unknown-${normalizeName(brandName)}`;

  return {
    uniqueId: buildBrandUniqueId(`/${slug}/`),
    name: brandName.replace(/\*+/g, "").trim(),
    websiteUrl: null,
    hours: [],
    socialLinks: [],
    phone: null,
    location: null,
    directoryMapUrl: null,
    logoUrl: null,
    description: null,
    storePath: slug,
  };
}
