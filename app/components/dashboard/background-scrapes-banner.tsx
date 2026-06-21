import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function BackgroundScrapesBanner({ count }: { count: number }) {
	if (count === 0) return null;

	return (
		<Card>
			<CardHeader className="px-4 py-4 sm:px-6">
				<CardTitle className="text-base">Background scrapes</CardTitle>
				<CardDescription>
					{count} scrape{count === 1 ? "" : "s"} in progress. You can keep
					browsing other sessions while they run.
				</CardDescription>
			</CardHeader>
		</Card>
	);
}
