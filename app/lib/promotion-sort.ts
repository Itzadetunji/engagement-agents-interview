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

const ORDER_FIELD_LABELS: Record<string, string> = {
	end_date: "Ends",
	name: "Promotion",
	brand: "Brand",
	tags: "Tags",
};

export function formatOrderByLabel(orderBy: PromotionOrderBy): string {
	const desc = orderBy.startsWith("-");
	const field = desc ? orderBy.slice(1) : orderBy;
	const label = ORDER_FIELD_LABELS[field] ?? field;

	if (field === "end_date") {
		return desc ? `${label} (latest first)` : `${label} (soonest first)`;
	}

	return desc ? `${label} (Z–A)` : `${label} (A–Z)`;
}
