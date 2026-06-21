"use client";

import { ActiveFiltersSummary } from "@/components/dashboard/active-filters-summary";
import { BrandGroupedSkeleton } from "@/components/dashboard/brand-grouped-skeleton";
import { BrandGroupedView } from "@/components/dashboard/brand-grouped-view";
import { PromotionsTable } from "@/components/dashboard/promotions-table";
import { PromotionsTableSkeleton } from "@/components/dashboard/promotions-table-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardFiltersStore } from "@/stores/dashboard-filters.store";
import type { PaginationMeta } from "@shared/response";
import type { PromotionWithBrand } from "@shared/promotion";
import type { BrandWithCount } from "@shared/brand";
import type { Promotion } from "@shared/promotion";
import type { DashboardView } from "@/stores/dashboard-filters.store";

export function DashboardViewTabs({
	isLoading,
	promotions,
	brands,
	pagination,
	onSelectPromotion,
}: {
	isLoading: boolean;
	promotions: PromotionWithBrand[];
	brands: Array<
		BrandWithCount & { promotions: Promotion[] | PromotionWithBrand[] }
	>;
	pagination?: PaginationMeta;
	onSelectPromotion: (promotion: PromotionWithBrand) => void;
}) {
	const view = useDashboardFiltersStore((s) => s.view);
	const setView = useDashboardFiltersStore((s) => s.setView);
	const setPage = useDashboardFiltersStore((s) => s.setPage);

	return (
		<Tabs
			value={view}
			onValueChange={(value) => setView(value as DashboardView)}
			className="flex min-w-0 flex-col gap-4"
		>
			<TabsList className="w-full sm:w-fit">
				<TabsTrigger value="list" className="flex-1 sm:flex-none">
					List view
				</TabsTrigger>
				<TabsTrigger value="brand" className="flex-1 sm:flex-none">
					Group by brand
				</TabsTrigger>
			</TabsList>

			<ActiveFiltersSummary />

			<TabsContent value="list" className="mt-0 flex min-w-0 flex-col gap-4">
				{isLoading ? (
					<PromotionsTableSkeleton />
				) : (
					<>
						<PromotionsTable
							items={promotions}
							onSelectPromotion={onSelectPromotion}
						/>
						{pagination && pagination.total_pages > 1 && (
							<Pagination
								currentPage={pagination.current_page}
								totalPages={pagination.total_pages}
								onPageChange={setPage}
							/>
						)}
					</>
				)}
			</TabsContent>

			<TabsContent value="brand" className="mt-0">
				{isLoading ? (
					<BrandGroupedSkeleton />
				) : (
					<BrandGroupedView
						brands={brands}
						onSelectPromotion={onSelectPromotion}
					/>
				)}
			</TabsContent>
		</Tabs>
	);
}
