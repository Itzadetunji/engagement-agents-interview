import { format } from "date-fns";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { formatOrderByLabel } from "@/lib/promotion-sort";
import { useDashboardFiltersStore } from "@/stores/dashboard-filters.store";

interface FilterChip {
	key: string;
	label: string;
	onClear?: () => void;
}

export function ActiveFiltersSummary() {
	const view = useDashboardFiltersStore((s) => s.view);
	const scrapeSessionName = useDashboardFiltersStore((s) => s.scrapeSessionName);
	const dateRange = useDashboardFiltersStore((s) => s.dateRange);
	const brand = useDashboardFiltersStore((s) => s.brand);
	const orderBy = useDashboardFiltersStore((s) => s.orderBy);
	const clearSearch = useDashboardFiltersStore((s) => s.clearSearch);
	const clearDateRange = useDashboardFiltersStore((s) => s.clearDateRange);
	const clearBrand = useDashboardFiltersStore((s) => s.clearBrand);

	const debouncedSearch = useDebouncedSearch();

	const chips: FilterChip[] = [];

	if (scrapeSessionName) {
		chips.push({ key: "session", label: `Session: ${scrapeSessionName}` });
	}

	if (view === "list") {
		if (debouncedSearch) {
			chips.push({
				key: "search",
				label: `Search: "${debouncedSearch}"`,
				onClear: clearSearch,
			});
		}

		if (dateRange?.from) {
			const from = format(dateRange.from, "LLL d, yyyy");
			const to = dateRange.to ? format(dateRange.to, "LLL d, yyyy") : "…";
			chips.push({
				key: "date",
				label: `Dates: ${from} – ${to}`,
				onClear: clearDateRange,
			});
		}

		if (brand) {
			chips.push({
				key: "brand",
				label: `Brand: ${brand}`,
				onClear: clearBrand,
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
