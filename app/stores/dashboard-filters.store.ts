import type { DateRange } from "react-day-picker";
import { create } from "zustand";
import { toggleOrderBy } from "@/lib/promotion-sort";
import {
	DEFAULT_PROMOTION_ORDER_BY,
	type PromotionOrderBy,
} from "@shared/promotion";

export type DashboardView = "list" | "brand";

interface DashboardFiltersState {
	search: string;
	dateRange: DateRange | undefined;
	brand: string;
	scrapeSessionId: string;
	scrapeSessionName: string;
	page: number;
	orderBy: PromotionOrderBy;
	view: DashboardView;

	setSearch: (search: string) => void;
	setDateRange: (dateRange: DateRange | undefined) => void;
	setBrand: (brand: string) => void;
	setScrapeSession: (id: string, name: string) => void;
	setPage: (page: number) => void;
	resetPage: () => void;
	setOrderBy: (orderBy: PromotionOrderBy) => void;
	sortBy: (field: string) => void;
	setView: (view: DashboardView) => void;
	clearSearch: () => void;
	clearDateRange: () => void;
	clearBrand: () => void;
}

export const useDashboardFiltersStore = create<DashboardFiltersState>(
	(set, get) => ({
		search: "",
		dateRange: undefined,
		brand: "",
		scrapeSessionId: "",
		scrapeSessionName: "",
		page: 1,
		orderBy: DEFAULT_PROMOTION_ORDER_BY,
		view: "list",

		setSearch: (search) => set({ search }),
		setDateRange: (dateRange) => {
			set({ dateRange });
			get().resetPage();
		},
		setBrand: (brand) => {
			set({ brand });
			get().resetPage();
		},
		setScrapeSession: (id, name) => {
			set({ scrapeSessionId: id, scrapeSessionName: name });
			get().resetPage();
		},
		setPage: (page) => set({ page }),
		resetPage: () => set({ page: 1 }),
		setOrderBy: (orderBy) => set({ orderBy }),
		sortBy: (field) => {
			set({ orderBy: toggleOrderBy(get().orderBy, field) });
			get().resetPage();
		},
		setView: (view) => set({ view }),
		clearSearch: () => set({ search: "" }),
		clearDateRange: () => {
			set({ dateRange: undefined });
			get().resetPage();
		},
		clearBrand: () => {
			set({ brand: "" });
			get().resetPage();
		},
	}),
);

export function useDashboardFilters() {
	const search = useDashboardFiltersStore((s) => s.search);
	const dateRange = useDashboardFiltersStore((s) => s.dateRange);
	const brand = useDashboardFiltersStore((s) => s.brand);
	const scrapeSessionId = useDashboardFiltersStore((s) => s.scrapeSessionId);
	const scrapeSessionName = useDashboardFiltersStore((s) => s.scrapeSessionName);
	const page = useDashboardFiltersStore((s) => s.page);
	const orderBy = useDashboardFiltersStore((s) => s.orderBy);
	const view = useDashboardFiltersStore((s) => s.view);

	return {
		search,
		dateRange,
		brand,
		scrapeSessionId,
		scrapeSessionName,
		page,
		orderBy,
		view,
		isGroupByBrand: view === "brand",
	};
}
