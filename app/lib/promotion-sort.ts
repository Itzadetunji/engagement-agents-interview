import type { PromotionOrderBy } from "@shared/promotion";

export function getSortDirection(
	orderBy: PromotionOrderBy,
	field: string,
): "asc" | "desc" | null {
	if (orderBy === field) return "asc";
	if (orderBy === `-${field}`) return "desc";
	return null;
}

export function toggleOrderBy(
	current: PromotionOrderBy,
	field: string,
): PromotionOrderBy {
	if (current === field) return `-${field}` as PromotionOrderBy;
	if (current === `-${field}`) return field as PromotionOrderBy;
	return field as PromotionOrderBy;
}
