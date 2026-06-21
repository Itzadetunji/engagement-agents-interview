import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const BRAND_COUNT = 2;
const PROMOTIONS_PER_BRAND = 3;

function BrandCardSkeleton() {
	return (
		<Card className="overflow-hidden border border-border">
			<CardHeader className="px-4 py-4 sm:px-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
					<Skeleton className="h-16 w-16 shrink-0 rounded-lg sm:h-[72px] sm:w-[72px]" />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="space-y-1.5">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-4 w-28" />
						</div>
						<Skeleton className="h-4 w-full max-w-md" />
						<Skeleton className="h-4 w-3/4 max-w-sm" />
						<div className="flex gap-3 pt-1">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="size-4 rounded-full" />
							<Skeleton className="size-4 rounded-full" />
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0 pb-4 sm:pb-6">
				<div className="overflow-x-auto border-t border-border">
					<Table className="min-w-[480px] border-collapse">
						<TableHeader>
							<TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
								<TableHead>
									<Skeleton className="h-4 w-20" />
								</TableHead>
								<TableHead className="hidden sm:table-cell">
									<Skeleton className="h-4 w-10" />
								</TableHead>
								<TableHead>
									<Skeleton className="h-4 w-10" />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: PROMOTIONS_PER_BRAND }).map((_, i) => (
								<TableRow key={i} className="border-b border-border">
									<TableCell>
										<Skeleton className="h-4 w-48 max-w-full" />
										<div className="mt-2 flex gap-1 sm:hidden">
											<Skeleton className="h-5 w-14 rounded-full" />
										</div>
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<Skeleton className="h-5 w-16 rounded-full" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-20" />
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

export function BrandGroupedSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: BRAND_COUNT }).map((_, i) => (
				<BrandCardSkeleton key={i} />
			))}
		</div>
	);
}
