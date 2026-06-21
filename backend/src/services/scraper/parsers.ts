import * as cheerio from "cheerio";
import { COLLECTION_TAGS } from "../../config.js";
import type { PromotionTag } from "@shared/promotion.js";
import { parseExpiryText, parseStartDate } from "./date.parser.js";
import {
  buildPromotionUniqueId,
  toAbsoluteUrl,
} from "./utils.js";

export interface ListingItem {
  name: string;
  brandName: string;
  imageUrl: string | null;
  dealPath: string;
  storeId: string | null;
  tag: PromotionTag;
  expiryText: string | null;
  dataStart: string | null;
  dataEnd: string | null;
  uniqueId: string;
  sourceUrl: string;
}

export function parseListingPage(html: string, baseUrl: string): ListingItem[] {
  const $ = cheerio.load(html);
  const items: ListingItem[] = [];

  $(".deal-row").each((_i, el) => {
    const row = $(el);
    const collectionId = row.attr("data-collection-id") ?? "";
    const tag = COLLECTION_TAGS[collectionId];
    if (!tag) return;

    const link = row.find("a[href]").first();
    const dealPath = link.attr("href") ?? "";
    if (!dealPath.includes("/deals/")) return;

    const brandName =
      row.attr("data-alpha")?.trim() ||
      row.find(".deal-meta .minor").last().text().trim() ||
      "unknown";

    const name = row.find(".deal-meta .major").first().text().trim() || brandName;
    const imageUrl = row.find("img").first().attr("src") ?? null;
    const expiryText =
      row.find(".notice, .motice").first().text().trim() || null;

    items.push({
      name,
      brandName,
      imageUrl,
      dealPath,
      storeId: row.attr("data-store-id") ?? null,
      tag,
      expiryText,
      dataStart: row.attr("data-start") ?? null,
      dataEnd: row.attr("data-end") ?? null,
      uniqueId: buildPromotionUniqueId(brandName, dealPath),
      sourceUrl: toAbsoluteUrl(baseUrl, dealPath),
    });
  });

  return items;
}

export interface DetailItem {
  name: string;
  description: string | null;
  imageUrl: string | null;
  brandName: string | null;
  storePath: string | null;
  expiryText: string | null;
  endDate: string | null;
  startDate: string | null;
}

export function parseDetailPage(
  html: string,
  listing: ListingItem,
): DetailItem {
  const $ = cheerio.load(html);

  const name = $("h1.head1").first().text().trim() || listing.name;
  const description = $(".deal-detail-info .deal-detail-description")
    .first()
    .text()
    .replace(/\s+/g, " ")
    .trim() || null;

  const detailImage = $(".image-deal").first().attr("src") ?? null;
  const expiryText =
    $(".deal-detail-flyer .notice, .deal-detail-info .notice")
      .first()
      .text()
      .trim() ||
    listing.expiryText;

  const storePath = $("a.store-link").first().attr("href") ?? null;
  const brandName =
    $("a.store-link").first().text().trim() || listing.brandName;

  const endDate = parseExpiryText(expiryText, listing.dataEnd);
  const startDate = parseStartDate(listing.dataStart);

  return {
    name,
    description,
    imageUrl: detailImage ?? listing.imageUrl,
    brandName,
    storePath,
    expiryText,
    endDate,
    startDate,
  };
}
