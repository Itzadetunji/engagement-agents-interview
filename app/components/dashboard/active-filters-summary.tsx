import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatOrderByLabel } from "@/lib/promotion-sort";
import type { PromotionOrderBy } from "@shared/promotion";

interface FilterChip {
	key: string;
	label: string;
	onClear?: () => void;
}

export function ActiveFiltersSummary({
	view,
	sessionName,
	search,
	dateRange,
	brand,
	orderBy,
	onClearSearch,
	onClearDateRange,
	onClearBrand,
}: {
	view: "list" | "brand";
	sessionName?: string;
	search?: string;
	dateRange?: DateRange;
	brand?: string;
	orderBy?: PromotionOrderBy;
	onClearSearch?: () => void;
	onClearDateRange?: () => void;
	onClearBrand?: () => void;
}) {
	const chips: FilterChip[] = [];

	if (sessionName) {
		chips.push({ key: "session", label: `Session: ${sessionName}` });
	}

	if (view === "list") {
		if (search) {
			chips.push({
				key: "search",
				label: `Search: "${search}"`,
				onClear: onClearSearch,
			});
		}

		if (dateRange?.from) {
			const from = format(dateRange.from, "LLL d, yyyy");
			const to = dateRange.to
				? format(dateRange.to, "LLL d, yyyy")
				: "…";
			chips.push({
				key: "date",
				label: `Dates: ${from} – ${to}`,
				onClear: onClearDateRange,
			});
		}

		if (brand) {
			chips.push({
				key: "brand",
				label: `Brand: ${brand}`,
				onClear: onClearBrand,
			});
		}

		if (orderBy) {
			chips.push({
				key: "sort",
				label: `Sort: ${formatOrderByLabel(orderBy)}`,
			});
		}
	}

	if (chips.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 sm:px-4">
			<span className="text-sm font-medium text-muted-foreground">
				Filtering by
			</span>
			{chips.map((chip) => (
				<Badge
					key={chip.key}
					variant="secondary"
					className="gap-1 pr-1 font-normal"
				>
					{chip.label}
					{chip.onClear && (
						<Button
							type="button"
							variant="ghost"
							size="icon-xs"
							className="size-5 hover:bg-background/80"
							onClick={chip.onClear}
							aria-label={`Clear ${chip.key} filter`}
						>
							<X className="size-3" />
						</Button>
					)}
				</Badge>
			))}
		</div>
	);
}
