import { Globe } from "lucide-react";
import Image from "next/image";
import { SocialLinks, tagLabel } from "@/components/promotion-detail-dialog";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toPromotionWithBrand } from "@/lib/promotion-utils";
import type { BrandWithCount } from "@shared/brand";
import type { Promotion, PromotionWithBrand } from "@shared/promotion";

export function BrandGroupedView({
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
			<Card className="border border-border">
				<CardContent className="px-4 py-10 text-center text-muted-foreground sm:px-6">
					No brands found. Run a scrape to load data.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{brands.map((brand) => (
				<Card key={brand.id} className="overflow-hidden border border-border">
					<CardHeader className="px-4 py-4 sm:px-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
							{brand.logoUrl ? (
								<Image
									src={brand.logoUrl}
									alt={brand.name}
									width={72}
									height={72}
									className="h-16 w-16 shrink-0 rounded-lg border border-border bg-muted object-contain p-2 sm:h-[72px] sm:w-[72px]"
									unoptimized
								/>
							) : (
								<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xl font-semibold sm:h-[72px] sm:w-[72px]">
									{brand.name.charAt(0)}
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-2">
								<div>
									<CardTitle className="text-lg sm:text-xl">
										{brand.name}
									</CardTitle>
									<CardDescription>
										{brand.promotionCount} promotion
										{brand.promotionCount === 1 ? "" : "s"}
									</CardDescription>
								</div>
								{brand.description && (
									<p className="line-clamp-2 text-sm text-muted-foreground">
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
					<CardContent className="p-0 pb-4 sm:pb-6">
						<div className="overflow-x-auto border-t border-border">
							<Table className="min-w-[480px] border-collapse">
								<TableHeader>
									<TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
										<TableHead>Promotion</TableHead>
										<TableHead className="hidden sm:table-cell">Tags</TableHead>
										<TableHead>Ends</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{brand.promotions.map((p) => (
										<TableRow
											key={p.id}
											className="cursor-pointer border-b border-border"
											onClick={() =>
												onSelectPromotion(
													"brand" in p && p.brand
														? (p as PromotionWithBrand)
														: toPromotionWithBrand(p, brand),
												)
											}
										>
											<TableCell className="font-medium">
												<span className="block truncate">{p.name}</span>
												<div className="mt-1 flex flex-wrap gap-1 sm:hidden">
													{p.tags.map((tag) => (
														<Badge key={tag} variant="secondary">
															{tagLabel(tag)}
														</Badge>
													))}
												</div>
											</TableCell>
											<TableCell className="hidden sm:table-cell">
												<div className="flex flex-wrap gap-1">
													{p.tags.map((tag) => (
														<Badge key={tag} variant="secondary">
															{tagLabel(tag)}
														</Badge>
													))}
												</div>
											</TableCell>
											<TableCell className="whitespace-nowrap">
												{p.endDate ?? "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
