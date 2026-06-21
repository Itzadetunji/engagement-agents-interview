import { format } from "date-fns";
import type { BrandWithCount } from "@shared/brand";
import type { Promotion, PromotionWithBrand } from "@shared/promotion";

export function toApiDate(date: Date | undefined): string | undefined {
	return date ? format(date, "yyyy-MM-dd") : undefined;
}

export function toPromotionWithBrand(
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
