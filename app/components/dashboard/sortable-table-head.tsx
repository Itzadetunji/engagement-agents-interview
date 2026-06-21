import { UpDownIcon } from "@/components/svg-icons/up-down-icon";
import { TableHead } from "@/components/ui/table";
import { getSortDirection } from "@/lib/promotion-sort";
import type { PromotionOrderBy } from "@shared/promotion";

export function SortableTableHead({
	label,
	field,
	orderBy,
	onSort,
	className,
}: {
	label: string;
	field: string;
	orderBy: PromotionOrderBy;
	onSort: (field: string) => void;
	className?: string;
}) {
	const direction = getSortDirection(orderBy, field);

	return (
		<TableHead className={className}>
			<button
				type="button"
				onClick={() => onSort(field)}
				className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium hover:text-foreground"
			>
				{label}
				<UpDownIcon sortDirection={direction} />
			</button>
		</TableHead>
	);
}
