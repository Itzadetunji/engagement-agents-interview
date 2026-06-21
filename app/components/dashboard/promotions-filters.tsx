"use client";

import { useQuery } from "@tanstack/react-query";
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
import { fetchScrapeSessions } from "@/lib/api";
import { useDashboardFiltersStore } from "@/stores/dashboard-filters.store";

export function PromotionsFilters({
	runningSessionIds,
}: {
	runningSessionIds: Set<string>;
}) {
	const search = useDashboardFiltersStore((s) => s.search);
	const dateRange = useDashboardFiltersStore((s) => s.dateRange);
	const brand = useDashboardFiltersStore((s) => s.brand);
	const scrapeSessionId = useDashboardFiltersStore((s) => s.scrapeSessionId);
	const setSearch = useDashboardFiltersStore((s) => s.setSearch);
	const setDateRange = useDashboardFiltersStore((s) => s.setDateRange);
	const setBrand = useDashboardFiltersStore((s) => s.setBrand);
	const setScrapeSession = useDashboardFiltersStore((s) => s.setScrapeSession);

	const { data: sessionsResponse } = useQuery({
		queryKey: ["scrapeSessions"],
		queryFn: fetchScrapeSessions,
	});
	const sessions = sessionsResponse?.data ?? [];

	return (
		<Card>
			<CardHeader className="px-4 py-4 sm:px-6">
				<CardTitle className="text-base">Filters</CardTitle>
			</CardHeader>
			<CardContent className="grid gap-4 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-4">
				<FilterField label="Scrape session" htmlFor="filter-scrape-session">
					<Select
						value={scrapeSessionId || undefined}
						onValueChange={(value) => {
							const session = sessions.find((s) => s.id === value);
							setScrapeSession(value, session?.name ?? "");
						}}
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
						onChange={(e) => setSearch(e.target.value)}
					/>
				</FilterField>

				<FilterField label="Date range" htmlFor="filter-date-range">
					<DateRangePicker
						id="filter-date-range"
						range={dateRange}
						onRangeChange={(range: DateRange | undefined) =>
							setDateRange(range)
						}
						placeholder="Pick a date range"
					/>
				</FilterField>

				<FilterField label="Brand" htmlFor="filter-brand">
					<Input
						id="filter-brand"
						placeholder="Brand name"
						value={brand}
						onChange={(e) => setBrand(e.target.value)}
					/>
				</FilterField>
			</CardContent>
		</Card>
	);
}
