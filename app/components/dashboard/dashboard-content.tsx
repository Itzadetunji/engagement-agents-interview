"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { BackgroundScrapesBanner } from "@/components/dashboard/background-scrapes-banner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardViewTabs } from "@/components/dashboard/dashboard-view-tabs";
import { PromotionsFilters } from "@/components/dashboard/promotions-filters";
import { PromotionDetailDialog } from "@/components/promotion-detail-dialog";
import {
	fetchBrands,
	fetchPromotions,
	fetchScrapeSessions,
	triggerScrape,
} from "@/lib/api";
import { toggleOrderBy } from "@/lib/promotion-sort";
import { toApiDate } from "@/lib/promotion-utils";
import { useScrapeSocket } from "@/lib/scrape-socket";
import { useDebounce } from "@/hooks/use-debounce";
import {
	DEFAULT_PROMOTION_ORDER_BY,
	type PromotionOrderBy,
	type PromotionWithBrand,
} from "@shared/promotion";

type DashboardView = "list" | "brand";

export function DashboardContent() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [brand, setBrand] = useState("");
	const [scrapeSessionId, setScrapeSessionId] = useState<string>("");
	const [page, setPage] = useState(1);
	const [orderBy, setOrderBy] = useState<PromotionOrderBy>(
		DEFAULT_PROMOTION_ORDER_BY,
	);
	const [view, setView] = useState<DashboardView>("list");
	const [selectedPromotion, setSelectedPromotion] =
		useState<PromotionWithBrand | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const openPromotion = (promotion: PromotionWithBrand) => {
		setSelectedPromotion(promotion);
		setDialogOpen(true);
	};

	const scrapeSessionsQuery = useQuery({
		queryKey: ["scrapeSessions"],
		queryFn: fetchScrapeSessions,
		refetchInterval: 30_000,
	});

	const sessions = scrapeSessionsQuery.data?.data ?? [];
	const selectedSession = sessions.find((s) => s.id === scrapeSessionId);

	const handleScrapeStarted = useCallback(
		(payload: { sessionName: string }) => {
			toast.info(`${payload.sessionName} scrape started in the background`);
			queryClient.invalidateQueries({ queryKey: ["scrapeSessions"] });
		},
		[queryClient],
	);

	const handleScrapeCompleted = useCallback(
		(payload: {
			sessionName: string;
			recordsEnriched: number;
			recordsFailed: number;
		}) => {
			toast.success(
				`${payload.sessionName} complete: ${payload.recordsEnriched} saved, ${payload.recordsFailed} failed`,
			);
			queryClient.invalidateQueries({ queryKey: ["scrapeSessions"] });
			queryClient.invalidateQueries({ queryKey: ["promotions"] });
			queryClient.invalidateQueries({ queryKey: ["brands"] });
		},
		[queryClient],
	);

	const handleScrapeFailed = useCallback(
		(payload: { sessionName: string; error: string }) => {
			toast.error(`${payload.sessionName} failed: ${payload.error}`);
			queryClient.invalidateQueries({ queryKey: ["scrapeSessions"] });
		},
		[queryClient],
	);

	const { runningSessionIds } = useScrapeSocket({
		onStarted: handleScrapeStarted,
		onCompleted: handleScrapeCompleted,
		onFailed: handleScrapeFailed,
	});

	useEffect(() => {
		if (sessions.length > 0 && !scrapeSessionId) {
			setScrapeSessionId(sessions[0].id);
		}
	}, [sessions, scrapeSessionId]);

	useEffect(() => {
		setPage(1);
	}, [debouncedSearch]);

	const groupByBrand = view === "brand";

	const promotionsQuery = useQuery({
		queryKey: [
			"promotions",
			scrapeSessionId,
			debouncedSearch,
			dateRange?.from,
			dateRange?.to,
			brand,
			orderBy,
			page,
		],
		queryFn: () =>
			fetchPromotions({
				scrapeSessionId: scrapeSessionId || undefined,
				search: debouncedSearch || undefined,
				startDate: toApiDate(dateRange?.from),
				endDate: toApiDate(dateRange?.to),
				brand: brand || undefined,
				orderBy,
				page,
				pageSize: 10,
			}),
		enabled: !groupByBrand && !!scrapeSessionId,
	});

	const brandsQuery = useQuery({
		queryKey: ["brands", scrapeSessionId],
		queryFn: () => fetchBrands(scrapeSessionId || undefined),
		enabled: groupByBrand && !!scrapeSessionId,
	});

	const scrapeMutation = useMutation({
		mutationFn: triggerScrape,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["scrapeSessions"] });
		},
		onError: () => toast.error("Failed to start scrape"),
	});

	const isLoading =
		scrapeSessionsQuery.isLoading ||
		(groupByBrand ? brandsQuery.isLoading : promotionsQuery.isLoading);

	const pagination = promotionsQuery.data?.meta?.pagination;
	const resetPage = () => setPage(1);

	return (
		<div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
			<DashboardHeader
				isScrapePending={scrapeMutation.isPending}
				onRunScrape={() => scrapeMutation.mutate()}
			/>

			<BackgroundScrapesBanner count={runningSessionIds.size} />

			<PromotionsFilters
				sessions={sessions}
				scrapeSessionId={scrapeSessionId}
				runningSessionIds={runningSessionIds}
				search={search}
				dateRange={dateRange}
				brand={brand}
				onScrapeSessionChange={(value) => {
					setScrapeSessionId(value);
					resetPage();
				}}
				onSearchChange={setSearch}
				onDateRangeChange={(range) => {
					setDateRange(range);
					resetPage();
				}}
				onBrandChange={(value) => {
					setBrand(value);
					resetPage();
				}}
			/>

			<DashboardViewTabs
				view={view}
				onViewChange={setView}
				isLoading={isLoading}
				sessionName={selectedSession?.name}
				debouncedSearch={debouncedSearch}
				dateRange={dateRange}
				brand={brand}
				orderBy={orderBy}
				promotions={promotionsQuery.data?.data ?? []}
				brands={brandsQuery.data?.data ?? []}
				pagination={pagination}
				onSort={(field) => {
					setOrderBy((current) => toggleOrderBy(current, field));
					resetPage();
				}}
				onSelectPromotion={openPromotion}
				onClearSearch={() => setSearch("")}
				onClearDateRange={() => setDateRange(undefined)}
				onClearBrand={() => setBrand("")}
				onPageChange={setPage}
			/>

			<PromotionDetailDialog
				promotion={selectedPromotion}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}
