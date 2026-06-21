import { useDebounce } from "@/hooks/use-debounce";
import { useDashboardFiltersStore } from "@/stores/dashboard-filters.store";

export function useDebouncedSearch(delayMs = 300) {
	const search = useDashboardFiltersStore((s) => s.search);
	return useDebounce(search, delayMs);
}
