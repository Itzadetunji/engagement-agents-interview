export interface SocialLink {
  platform: string;
  url: string;
}

export interface BrandHours {
  label: string;
  value: string;
}

export interface Brand {
  id: string;
  uniqueId: string;
  name: string;
  websiteUrl: string | null;
  hours: BrandHours[];
  socialLinks: SocialLink[];
  phone: string | null;
  location: string | null;
  directoryMapUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandWithCount extends Brand {
  promotionCount: number;
}
