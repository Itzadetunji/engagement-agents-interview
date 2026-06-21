"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink, Globe, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/date-picker";
import { UpDownIcon } from "@/components/svg-icons/up-down-icon";
import {
	PromotionDetailDialog,
	SocialLinks,
	tagLabel,
} from "@/components/promotion-detail-dialog";
import { Providers } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	fetchBrands,
	fetchPromotions,
	fetchScrapeSessions,
	triggerScrape,
} from "@/lib/api";
import { useScrapeSocket } from "@/lib/scrape-socket";
import type { BrandWithCount } from "@shared/brand";
import {
	DEFAULT_PROMOTION_ORDER_BY,
	type Promotion,
	type PromotionOrderBy,
	type PromotionWithBrand,
} from "@shared/promotion";

function getSortDirection(
	orderBy: PromotionOrderBy,
	field: string,
): "asc" | "desc" | null {
	if (orderBy === field) return "asc";
	if (orderBy === `-${field}`) return "desc";
	return null;
}

function toggleOrderBy(
	current: PromotionOrderBy,
	field: string,
): PromotionOrderBy {
	if (current === field) return `-${field}` as PromotionOrderBy;
	if (current === `-${field}`) return field as PromotionOrderBy;
	return field as PromotionOrderBy;
}

function SortableTableHead({
	label,
	field,
	orderBy,
	onSort,
}: {
	label: string;
	field: string;
	orderBy: PromotionOrderBy;
	onSort: (field: string) => void;
}) {
	const direction = getSortDirection(orderBy, field);

	return (
		<TableHead>
			<button
				type="button"
				onClick={() => onSort(field)}
				className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
			>
				{label}
				<UpDownIcon sortDirection={direction} />
			</button>
		</TableHead>
	);
}

function toApiDate(date: Date | undefined): string | undefined {
	return date ? format(date, "yyyy-MM-dd") : undefined;
}

function FilterField({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
		</div>
	);
}

function toPromotionWithBrand(
	promotion: Promotion,
	brand: BrandWithCount,
): PromotionWithBrand {
	return {
		...promotion,
		brand: {
			id: brand.id,
			uniqueId: brand.uniqueId,
			name: brand.name,
			websiteUrl: brand.websiteUrl,
			hours: brand.hours,
			socialLinks: brand.socialLinks,
			phone: brand.phone,
			location: brand.location,
			directoryMapUrl: brand.directoryMapUrl,
			logoUrl: brand.logoUrl,
			description: brand.description,
		},
	};
}

function DashboardContent() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [dateRange, setDateRange] = useState<DateRange | undefined>();
	const [brand, setBrand] = useState("");
	const [scrapeSessionId, setScrapeSessionId] = useState<string>("");
	const [page, setPage] = useState(1);
	const [orderBy, setOrderBy] = useState<PromotionOrderBy>(
		DEFAULT_PROMOTION_ORDER_BY,
	);
	const [groupByBrand, setGroupByBrand] = useState(false);
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

	const promotionsQuery = useQuery({
		queryKey: [
			"promotions",
			scrapeSessionId,
			search,
			dateRange?.from,
			dateRange?.to,
			brand,
			orderBy,
			page,
		],
		queryFn: () =>
			fetchPromotions({
				scrapeSessionId: scrapeSessionId || undefined,
				search: search || undefined,
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

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Promotions Dashboard</h1>
					<p className="text-sm text-muted-foreground">
						Briargate mall promotions — scrape, filter, and browse by brand
					</p>
				</div>
				<Button
					onClick={() => scrapeMutation.mutate()}
					disabled={scrapeMutation.isPending}
				>
					{scrapeMutation.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<RefreshCw className="size-4" />
					)}
					Run Scrape
				</Button>
			</div>

			{runningSessionIds.size > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base">Background scrapes</CardTitle>
						<CardDescription>
							{runningSessionIds.size} scrape
							{runningSessionIds.size === 1 ? "" : "s"} in progress. You can
							keep browsing other sessions while they run.
						</CardDescription>
					</CardHeader>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Filters</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<FilterField
						label="Scrape session"
						htmlFor="filter-scrape-session"
					>
						<Select
							value={scrapeSessionId || undefined}
							onValueChange={(value) => {
								setScrapeSessionId(value);
								setPage(1);
							}}
							disabled={sessions.length === 0}
						>
							<SelectTrigger
								id="filter-scrape-session"
								className="w-full"
							>
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
										<SelectItem
											key={session.id}
											value={session.id}
										>
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

					<FilterField
						label="Search"
						htmlFor="filter-search"
					>
						<Input
							id="filter-search"
							placeholder="Search name or brand"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
						/>
					</FilterField>

					<FilterField
						label="Date range"
						htmlFor="filter-date-range"
					>
						<DateRangePicker
							id="filter-date-range"
							range={dateRange}
							onRangeChange={(range) => {
								setDateRange(range);
								setPage(1);
							}}
							placeholder="Pick a date range"
						/>
					</FilterField>

					<FilterField
						label="Brand"
						htmlFor="filter-brand"
					>
						<Input
							id="filter-brand"
							placeholder="Brand name"
							value={brand}
							onChange={(e) => {
								setBrand(e.target.value);
								setPage(1);
							}}
						/>
					</FilterField>
				</CardContent>
			</Card>

			<div className="flex gap-2">
				<Button
					variant={groupByBrand ? "outline" : "default"}
					onClick={() => setGroupByBrand(false)}
				>
					List view
				</Button>
				<Button
					variant={groupByBrand ? "default" : "outline"}
					onClick={() => setGroupByBrand(true)}
				>
					Group by brand
				</Button>
			</div>

			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton
							key={i}
							className="h-16 w-full"
						/>
					))}
				</div>
			) : groupByBrand ? (
				<BrandGroupedView
					brands={brandsQuery.data?.data ?? []}
					onSelectPromotion={openPromotion}
				/>
			) : (
				<>
					<PromotionsTable
						items={promotionsQuery.data?.data ?? []}
						orderBy={orderBy}
						onSort={(field) => {
							setOrderBy((current) => toggleOrderBy(current, field));
							setPage(1);
						}}
						onSelectPromotion={openPromotion}
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

			<PromotionDetailDialog
				promotion={selectedPromotion}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
			/>
		</div>
	);
}

function PromotionsTable({
	items,
	orderBy,
	onSort,
	onSelectPromotion,
}: {
	items: PromotionWithBrand[];
	orderBy: PromotionOrderBy;
	onSort: (field: string) => void;
	onSelectPromotion: (promotion: PromotionWithBrand) => void;
}) {
	if (items.length === 0) {
		return (
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground">
					No promotions found. Run a scrape to load data.
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<Table>
					<TableHeader>
						<TableRow>
							<SortableTableHead
								label="Promotion"
								field="name"
								orderBy={orderBy}
								onSort={onSort}
							/>
							<SortableTableHead
								label="Brand"
								field="brand"
								orderBy={orderBy}
								onSort={onSort}
							/>
							<SortableTableHead
								label="Tags"
								field="tags"
								orderBy={orderBy}
								onSort={onSort}
							/>
							<SortableTableHead
								label="Ends"
								field="end_date"
								orderBy={orderBy}
								onSort={onSort}
							/>
							<TableHead>Link</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{items.map((item) => (
							<TableRow
								key={item.id}
								className="cursor-pointer"
								onClick={() => onSelectPromotion(item)}
							>
								<TableCell>
									<div className="flex items-center gap-3">
										{item.imageUrl && (
											<Image
												src={item.imageUrl}
												alt={item.name}
												width={48}
												height={48}
												className="size-12 rounded object-cover"
												unoptimized
											/>
										)}
										<span className="font-medium">{item.name}</span>
									</div>
								</TableCell>
								<TableCell>{item.brand.name}</TableCell>
								<TableCell>
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
								<TableCell>{item.endDate ?? "—"}</TableCell>
								<TableCell>
									<a
										href={item.sourceUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-primary hover:underline"
										onClick={(e) => e.stopPropagation()}
									>
										View <ExternalLink className="size-3" />
									</a>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

function BrandGroupedView({
	brands,
	onSelectPromotion,
}: {
	brands: Array<
		BrandWithCount & { promotions: Promotion[] | PromotionWithBrand[] }
	>;
	onSelectPromotion: (promotion: PromotionWithBrand) => void;
}) {
	if (brands.length === 0) {
		return (
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground">
					No brands found. Run a scrape to load data.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{brands.map((brand) => (
				<Card key={brand.id}>
					<CardHeader>
						<div className="flex items-start gap-4">
							{brand.logoUrl ? (
								<Image
									src={brand.logoUrl}
									alt={brand.name}
									width={72}
									height={72}
									className="h-[72px] w-[72px] rounded-lg border border-border bg-muted object-contain p-2"
									unoptimized
								/>
							) : (
								<div className="flex h-[72px] w-[72px] min-w-[72px] items-center justify-center rounded-lg border border-border bg-muted text-xl font-semibold">
									{brand.name.charAt(0)}
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-2">
								<div>
									<CardTitle>{brand.name}</CardTitle>
									<CardDescription>
										{brand.promotionCount} promotion
										{brand.promotionCount === 1 ? "" : "s"}
									</CardDescription>
								</div>
								{brand.description && (
									<p className="text-sm text-muted-foreground line-clamp-2">
										{brand.description}
									</p>
								)}
								<div className="flex flex-wrap items-center gap-3">
									{brand.websiteUrl && (
										<a
											href={brand.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
										>
											<Globe className="size-4" />
											Website
										</a>
									)}
									<SocialLinks links={brand.socialLinks} />
								</div>
								{brand.hours.length > 0 && (
									<div className="text-sm text-muted-foreground">
										{brand.hours.map((h) => (
											<div key={`${h.label}-${h.value}`}>
												{h.label} {h.value}
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Promotion</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>Ends</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{brand.promotions.map((p) => (
									<TableRow
										key={p.id}
										className="cursor-pointer"
										onClick={() =>
											onSelectPromotion(
												"brand" in p && p.brand
													? (p as PromotionWithBrand)
													: toPromotionWithBrand(p, brand),
											)
										}
									>
										<TableCell className="font-medium">{p.name}</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1">
												{p.tags.map((tag) => (
													<Badge
														key={tag}
														variant="secondary"
													>
														{tagLabel(tag)}
													</Badge>
												))}
											</div>
										</TableCell>
										<TableCell>{p.endDate ?? "—"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Providers>
			<DashboardContent />
		</Providers>
	);
}
