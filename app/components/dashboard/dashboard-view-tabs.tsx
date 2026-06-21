"use client";

import { ActiveFiltersSummary } from "@/components/dashboard/active-filters-summary";
import { BrandGroupedSkeleton } from "@/components/dashboard/brand-grouped-skeleton";
import { BrandGroupedView } from "@/components/dashboard/brand-grouped-view";
import { PromotionsTable } from "@/components/dashboard/promotions-table";
import { PromotionsTableSkeleton } from "@/components/dashboard/promotions-table-skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toggleOrderBy } from "@/lib/promotion-sort";
import type { PaginationMeta } from "@shared/response";
import type { PromotionOrderBy, PromotionWithBrand } from "@shared/promotion";
import type { BrandWithCount } from "@shared/brand";
import type { Promotion } from "@shared/promotion";
import type { DateRange } from "react-day-picker";

type DashboardView = "list" | "brand";

export function DashboardViewTabs({
	view,
	onViewChange,
	isLoading,
	sessionName,
	debouncedSearch,
	dateRange,
	brand,
	orderBy,
	promotions,
	brands,
	pagination,
	onSort,
	onSelectPromotion,
	onClearSearch,
	onClearDateRange,
	onClearBrand,
	onPageChange,
}: {
	view: DashboardView;
	onViewChange: (view: DashboardView) => void;
	isLoading: boolean;
	sessionName?: string;
	debouncedSearch: string;
	dateRange?: DateRange;
	brand: string;
	orderBy: PromotionOrderBy;
	promotions: PromotionWithBrand[];
	brands: Array<
		BrandWithCount & { promotions: Promotion[] | PromotionWithBrand[] }
	>;
	pagination?: PaginationMeta;
	onSort: (field: string) => void;
	onSelectPromotion: (promotion: PromotionWithBrand) => void;
	onClearSearch: () => void;
	onClearDateRange: () => void;
	onClearBrand: () => void;
	onPageChange: (page: number) => void;
}) {
	return (
		<Tabs
			value={view}
			onValueChange={(value) => onViewChange(value as DashboardView)}
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

			<ActiveFiltersSummary
				view={view}
				sessionName={sessionName}
				search={debouncedSearch}
				dateRange={dateRange}
				brand={brand}
				orderBy={view === "list" ? orderBy : undefined}
				onClearSearch={onClearSearch}
				onClearDateRange={onClearDateRange}
				onClearBrand={onClearBrand}
			/>

			<TabsContent value="list" className="mt-0 flex min-w-0 flex-col gap-4">
				{isLoading ? (
					<PromotionsTableSkeleton />
				) : (
					<>
						<PromotionsTable
							items={promotions}
							orderBy={orderBy}
							onSort={onSort}
							onSelectPromotion={onSelectPromotion}
						/>
						{pagination && pagination.total_pages > 1 && (
							<Pagination
								currentPage={pagination.current_page}
								totalPages={pagination.total_pages}
								onPageChange={onPageChange}
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
