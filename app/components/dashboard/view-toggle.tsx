import { Button } from "@/components/ui/button";

export function ViewToggle({
	groupByBrand,
	onListView,
	onGroupByBrand,
}: {
	groupByBrand: boolean;
	onListView: () => void;
	onGroupByBrand: () => void;
}) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row">
			<Button
				variant={groupByBrand ? "outline" : "default"}
				onClick={onListView}
				className="w-full sm:w-auto"
			>
				List view
			</Button>
			<Button
				variant={groupByBrand ? "default" : "outline"}
				onClick={onGroupByBrand}
				className="w-full sm:w-auto"
			>
				Group by brand
			</Button>
		</div>
	);
}
