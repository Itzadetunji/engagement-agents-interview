import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader({
	isScrapePending,
	onRunScrape,
}: {
	isScrapePending: boolean;
	onRunScrape: () => void;
}) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-xl font-semibold sm:text-2xl">Promotions Dashboard</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Briargate mall promotions — scrape, filter, and browse by brand
				</p>
			</div>
			<Button
				onClick={onRunScrape}
				disabled={isScrapePending}
				className="w-full shrink-0 sm:w-auto"
			>
				{isScrapePending ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<RefreshCw className="size-4" />
				)}
				Run Scrape
			</Button>
		</div>
	);
}
