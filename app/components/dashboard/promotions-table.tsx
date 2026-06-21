import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { SortableTableHead } from "@/components/dashboard/sortable-table-head";
import { tagLabel } from "@/components/promotion-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { PromotionWithBrand } from "@shared/promotion";
import { useDashboardFiltersStore } from "@/stores/dashboard-filters.store";

export function PromotionsTable({
	items,
	onSelectPromotion,
}: {
	items: PromotionWithBrand[];
	onSelectPromotion: (promotion: PromotionWithBrand) => void;
}) {
	const orderBy = useDashboardFiltersStore((s) => s.orderBy);
	const sortBy = useDashboardFiltersStore((s) => s.sortBy);
	if (items.length === 0) {
		return (
			<Card className="border border-border">
				<CardContent className="px-4 py-10 text-center text-muted-foreground sm:px-6">
					No promotions found. Run a scrape to load data.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="overflow-hidden border border-border">
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table className="min-w-[720px] border-collapse">
						<TableHeader>
							<TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
								<SortableTableHead
									label="Promotion"
									field="name"
								orderBy={orderBy}
								onSort={sortBy}
									className="min-w-[180px]"
								/>
								<SortableTableHead
									label="Brand"
									field="brand"
								orderBy={orderBy}
								onSort={sortBy}
									className="hidden min-w-[120px] sm:table-cell"
								/>
								<SortableTableHead
									label="Tags"
									field="tags"
								orderBy={orderBy}
								onSort={sortBy}
									className="hidden min-w-[140px] md:table-cell"
								/>
								<SortableTableHead
									label="Ends"
									field="end_date"
								orderBy={orderBy}
								onSort={sortBy}
									className="min-w-[100px] whitespace-nowrap"
								/>
								<TableHead className="min-w-[80px]">Link</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.map((item) => (
								<TableRow
									key={item.id}
									className="cursor-pointer border-b border-border"
									onClick={() => onSelectPromotion(item)}
								>
									<TableCell>
										<div className="flex min-w-0 items-center gap-2 sm:gap-3">
											{item.imageUrl && (
												<Image
													src={item.imageUrl}
													alt={item.name}
													width={48}
													height={48}
													className="size-10 shrink-0 rounded object-cover sm:size-12"
													unoptimized
												/>
											)}
											<div className="min-w-0">
												<span className="block truncate font-medium">
													{item.name}
												</span>
												<span className="mt-0.5 block truncate text-xs text-muted-foreground sm:hidden">
													{item.brand.name}
												</span>
											</div>
										</div>
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<span className="block truncate">{item.brand.name}</span>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<div className="flex flex-wrap gap-1">
											{item.tags.map((tag) => (
												<Badge
													key={tag}
													variant="secondary"
													className="capitalize"
												>
													{tagLabel(tag)}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="whitespace-nowrap">
										{item.endDate ?? "—"}
									</TableCell>
									<TableCell>
										<a
											href={item.sourceUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 whitespace-nowrap text-primary hover:underline"
											onClick={(e) => e.stopPropagation()}
										>
											View <ExternalLink className="size-3" />
										</a>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
