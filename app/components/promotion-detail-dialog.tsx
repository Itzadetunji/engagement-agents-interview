import type { ComponentType, SVGProps } from "react";
import { Clock, ExternalLink, Globe, Link2, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { FacebookIcon } from "@/components/svg-icons/facebook-icon";
import { InstagramIcon } from "@/components/svg-icons/instagram-icon";
import { XIcon } from "@/components/svg-icons/x-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { PromotionWithBrand } from "@shared/promotion";

function tagLabel(tag: string) {
	return tag.replace(/_/g, " ");
}

type SocialIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

function socialIcon(platform: string): SocialIconComponent {
	switch (platform.toLowerCase()) {
		case "facebook":
			return FacebookIcon;
		case "instagram":
			return InstagramIcon;
		case "x":
		case "twitter":
			return XIcon;
		default:
			return Link2;
	}
}

interface PromotionDetailDialogProps {
	promotion: PromotionWithBrand | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PromotionDetailDialog({
	promotion,
	open,
	onOpenChange,
}: PromotionDetailDialogProps) {
	if (!promotion) return null;

	const { brand } = promotion;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{promotion.name}</DialogTitle>
					<DialogDescription>{brand.name}</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{promotion.imageUrl && (
						<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
							<Image
								src={promotion.imageUrl}
								alt={promotion.name}
								fill
								className="object-contain"
								unoptimized
							/>
						</div>
					)}

					<section className="space-y-2">
						<h3 className="text-sm font-medium">Promotion details</h3>
						{promotion.description ? (
							<p className="text-sm text-muted-foreground">
								{promotion.description}
							</p>
						) : (
							<p className="text-sm text-muted-foreground italic">
								No description available
							</p>
						)}
						<div className="flex flex-wrap gap-1">
							{promotion.tags.map((tag) => (
								<Badge
									key={tag}
									variant="secondary"
								>
									{tagLabel(tag)}
								</Badge>
							))}
						</div>
						<dl className="grid gap-1 text-sm sm:grid-cols-2">
							<div>
								<dt className="text-muted-foreground">Start date</dt>
								<dd>{promotion.startDate ?? "—"}</dd>
							</div>
							<div>
								<dt className="text-muted-foreground">End date</dt>
								<dd>{promotion.endDate ?? "—"}</dd>
							</div>
							<div>
								<dt className="text-muted-foreground">Scraped at</dt>
								<dd>{new Date(promotion.scrapedAt).toLocaleString()}</dd>
							</div>
							<div>
								<dt className="text-muted-foreground">Source</dt>
								<dd className="truncate">{promotion.sourcePortal}</dd>
							</div>
						</dl>
						<Button
							variant="outline"
							size="sm"
							asChild
						>
							<a
								href={promotion.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
							>
								View on mall site
								<ExternalLink className="size-3.5" />
							</a>
						</Button>
					</section>

					<section className="space-y-3 rounded-lg border border-border p-4">
						<div className="flex items-start gap-4">
							{brand.logoUrl ? (
								<Image
									src={brand.logoUrl}
									alt={brand.name}
									width={64}
									height={64}
									className="size-16 rounded-lg object-contain bg-muted p-1"
									unoptimized
								/>
							) : (
								<div className="flex size-16 items-center justify-center rounded-lg bg-muted text-lg font-semibold">
									{brand.name.charAt(0)}
								</div>
							)}
							<div className="min-w-0 flex-1 space-y-1">
								<h3 className="font-medium">{brand.name}</h3>
								{brand.description && (
									<p className="text-sm text-muted-foreground line-clamp-3">
										{brand.description}
									</p>
								)}
							</div>
						</div>

						<dl className="grid gap-2 text-sm">
							{brand.phone && (
								<div className="flex items-center gap-2">
									<Phone className="size-4 shrink-0 text-muted-foreground" />
									<dd>{brand.phone}</dd>
								</div>
							)}
							{brand.location && (
								<div className="flex items-center gap-2">
									<MapPin className="size-4 shrink-0 text-muted-foreground" />
									<dd>{brand.location}</dd>
								</div>
							)}
							{brand.websiteUrl && (
								<div className="flex items-center gap-2">
									<Globe className="size-4 shrink-0 text-muted-foreground" />
									<dd>
										<a
											href={brand.websiteUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											{brand.websiteUrl}
										</a>
									</dd>
								</div>
							)}
							{brand.directoryMapUrl && (
								<div className="flex items-center gap-2">
									<MapPin className="size-4 shrink-0 text-muted-foreground" />
									<dd>
										<a
											href={brand.directoryMapUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary hover:underline"
										>
											Directory map
										</a>
									</dd>
								</div>
							)}
						</dl>

						{brand.hours.length > 0 && (
							<div className="space-y-1">
								<div className="flex items-center gap-2 text-sm font-medium">
									<Clock className="size-4 text-muted-foreground" />
									Hours
								</div>
								<ul className="space-y-0.5 pl-6 text-sm text-muted-foreground">
									{brand.hours.map((h) => (
										<li key={`${h.label}-${h.value}`}>
											{h.label} {h.value}
										</li>
									))}
								</ul>
							</div>
						)}

						{brand.socialLinks.length > 0 && (
							<div className="flex flex-wrap gap-2">
								{brand.socialLinks.map((link) => {
									const Icon = socialIcon(link.platform);
									return (
										<a
											key={link.url}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											title={link.platform}
											className="grid size-9 place-content-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
										>
											<Icon className="size-5" />
											<span className="sr-only">{link.platform}</span>
										</a>
									);
								})}
							</div>
						)}
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export function SocialLinks({
	links,
}: {
	links: Array<{ platform: string; url: string }>;
}) {
	if (links.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{links.map((link) => {
				const Icon = socialIcon(link.platform);
				return (
					<a
						key={link.url}
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						title={link.platform}
						className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<Icon className="size-4" />
						<span className="sr-only">{link.platform}</span>
					</a>
				);
			})}
		</div>
	);
}

export { tagLabel, socialIcon };
