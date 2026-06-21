import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const ROW_COUNT = 4;

function PromotionRowSkeleton() {
	return (
		<TableRow className="border-b border-border">
			<TableCell>
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<Skeleton className="size-10 shrink-0 rounded sm:size-12" />
					<div className="min-w-0 flex-1 space-y-1.5">
						<Skeleton className="h-4 w-3/4 max-w-[200px]" />
						<Skeleton className="h-3 w-1/2 max-w-[120px] sm:hidden" />
					</div>
				</div>
			</TableCell>
			<TableCell className="hidden sm:table-cell">
				<Skeleton className="h-4 w-24" />
			</TableCell>
			<TableCell className="hidden md:table-cell">
				<div className="flex gap-1">
					<Skeleton className="h-5 w-14 rounded-full" />
					<Skeleton className="h-5 w-16 rounded-full" />
				</div>
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-20" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-4 w-12" />
			</TableCell>
		</TableRow>
	);
}

export function PromotionsTableSkeleton() {
	return (
		<Card className="overflow-hidden border border-border">
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table className="min-w-[720px] border-collapse">
						<TableHeader>
							<TableRow className="border-b border-border bg-muted/30 hover:bg-muted/30">
								<TableHead className="min-w-[180px]">
									<Skeleton className="h-4 w-20" />
								</TableHead>
								<TableHead className="hidden min-w-[120px] sm:table-cell">
									<Skeleton className="h-4 w-12" />
								</TableHead>
								<TableHead className="hidden min-w-[140px] md:table-cell">
									<Skeleton className="h-4 w-10" />
								</TableHead>
								<TableHead className="min-w-[100px]">
									<Skeleton className="h-4 w-10" />
								</TableHead>
								<TableHead className="min-w-[80px]">
									<Skeleton className="h-4 w-10" />
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: ROW_COUNT }).map((_, i) => (
								<PromotionRowSkeleton key={i} />
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
