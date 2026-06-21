import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-picker";
import { FilterField } from "@/components/dashboard/filter-field";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ScrapeSession } from "@shared/scrapeSession";

export function PromotionsFilters({
	sessions,
	scrapeSessionId,
	runningSessionIds,
	search,
	dateRange,
	brand,
	onScrapeSessionChange,
	onSearchChange,
	onDateRangeChange,
	onBrandChange,
}: {
	sessions: ScrapeSession[];
	scrapeSessionId: string;
	runningSessionIds: Set<string>;
	search: string;
	dateRange: DateRange | undefined;
	brand: string;
	onScrapeSessionChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	onDateRangeChange: (range: DateRange | undefined) => void;
	onBrandChange: (value: string) => void;
}) {
	return (
		<Card>
			<CardHeader className="px-4 py-4 sm:px-6">
				<CardTitle className="text-base">Filters</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-4">
				<FilterField label="Scrape session" htmlFor="filter-scrape-session">
					<Select
						value={scrapeSessionId || undefined}
						onValueChange={onScrapeSessionChange}
						disabled={sessions.length === 0}
					>
						<SelectTrigger id="filter-scrape-session" className="w-full">
							<SelectValue
								placeholder={
									sessions.length === 0 ? "No scrapes yet" : "Select a scrape"
								}
							/>
						</SelectTrigger>
						<SelectContent>
							{sessions.map((session) => {
								const isRunning = runningSessionIds.has(session.id);
								return (
									<SelectItem key={session.id} value={session.id}>
										{session.name}
										{isRunning
											? " (scraping…)"
											: ` (${session.promotionCount ?? 0} promos)`}
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</FilterField>

				<FilterField label="Search" htmlFor="filter-search">
					<Input
						id="filter-search"
						placeholder="Search name or brand"
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</FilterField>

				<FilterField label="Date range" htmlFor="filter-date-range">
					<DateRangePicker
						id="filter-date-range"
						range={dateRange}
						onRangeChange={onDateRangeChange}
						placeholder="Pick a date range"
					/>
				</FilterField>

				<FilterField label="Brand" htmlFor="filter-brand">
					<Input
						id="filter-brand"
						placeholder="Brand name"
						value={brand}
						onChange={(e) => onBrandChange(e.target.value)}
					/>
				</FilterField>
			</CardContent>
		</Card>
	);
}
