"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BackgroundScrapesBanner } from "@/components/dashboard/background-scrapes-banner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardViewTabs } from "@/components/dashboard/dashboard-view-tabs";
import { PromotionsFilters } from "@/components/dashboard/promotions-filters";
import { PromotionDetailDialog } from "@/components/promotion-detail-dialog";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import {
	fetchBrands,
	fetchPromotions,
	fetchScrapeSessions,
	triggerScrape,
} from "@/lib/api";
import { toApiDate } from "@/lib/promotion-utils";
import { useScrapeSocket } from "@/lib/scrape-socket";
import {
	useDashboardFilters,
	useDashboardFiltersStore,
} from "@/stores/dashboard-filters.store";
import type { PromotionWithBrand } from "@shared/promotion";
import { ScrapeSession } from "@shared/scrapeSession";

export function DashboardContent() {
	const queryClient = useQueryClient();
	const { dateRange, brand, scrapeSessionId, page, orderBy, isGroupByBrand } =
		useDashboardFilters();
	const debouncedSearch = useDebouncedSearch();
	const setScrapeSession = useDashboardFiltersStore((s) => s.setScrapeSession);
	const resetPage = useDashboardFiltersStore((s) => s.resetPage);

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

	const sessions = scrapeSessionsQuery.data?.data as
		| ScrapeSession[]
		| undefined;

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
		if (sessions && sessions.length > 0 && !scrapeSessionId) {
			setScrapeSession(sessions[0].id, sessions[0].name);
		}
	}, [sessions, scrapeSessionId, setScrapeSession]);

	useEffect(() => {
		resetPage();
	}, [debouncedSearch, resetPage]);

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
		enabled: !isGroupByBrand && !!scrapeSessionId,
	});

	const brandsQuery = useQuery({
		queryKey: ["brands", scrapeSessionId],
		queryFn: () => fetchBrands(scrapeSessionId || undefined),
		enabled: isGroupByBrand && !!scrapeSessionId,
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
		(isGroupByBrand ? brandsQuery.isLoading : promotionsQuery.isLoading);

	const pagination = promotionsQuery.data?.meta?.pagination;

	return (
		<div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-4 p-4 sm:gap-6 sm:p-6">
			<DashboardHeader
				isScrapePending={scrapeMutation.isPending}
				onRunScrape={() => scrapeMutation.mutate()}
			/>

			<BackgroundScrapesBanner count={runningSessionIds.size} />

			<PromotionsFilters runningSessionIds={runningSessionIds} />

			<DashboardViewTabs
				isLoading={isLoading}
				promotions={promotionsQuery.data?.data ?? []}
				brands={brandsQuery.data?.data ?? []}
				pagination={pagination}
				onSelectPromotion={openPromotion}
			/>

			<PromotionDetailDialog
				promotion={selectedPromotion}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}
