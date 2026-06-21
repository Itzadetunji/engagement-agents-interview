"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Globe, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  fetchBrands,
  fetchPromotions,
  fetchScrapeJob,
  triggerScrape,
} from "@/lib/api";
import type { BrandWithCount } from "@shared/brand";
import type { Promotion, PromotionWithBrand } from "@shared/promotion";

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [brand, setBrand] = useState("");
  const [page, setPage] = useState(1);
  const [groupByBrand, setGroupByBrand] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionWithBrand | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openPromotion = (promotion: PromotionWithBrand) => {
    setSelectedPromotion(promotion);
    setDialogOpen(true);
  };

  const promotionsQuery = useQuery({
    queryKey: ["promotions", search, startDate, endDate, brand, page],
    queryFn: () =>
      fetchPromotions({
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        brand: brand || undefined,
        page,
        pageSize: 10,
      }),
    enabled: !groupByBrand,
  });

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    enabled: groupByBrand,
  });

  const scrapeJobQuery = useQuery({
    queryKey: ["scrapeJob", activeJobId],
    queryFn: () => fetchScrapeJob(activeJobId!),
    enabled: !!activeJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.data.status;
      return status === "pending" || status === "running" ? 2000 : false;
    },
  });

  const scrapeMutation = useMutation({
    mutationFn: triggerScrape,
    onSuccess: (res) => {
      setActiveJobId(res.data.jobId);
      toast.success("Scrape started");
    },
    onError: () => toast.error("Failed to start scrape"),
  });

  useEffect(() => {
    const job = scrapeJobQuery.data?.data;
    if (!job) return;
    if (job.status === "done") {
      toast.success(
        `Scrape complete: ${job.recordsEnriched} saved, ${job.recordsFailed} failed`,
      );
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setActiveJobId(null);
    }
    if (job.status === "failed") {
      toast.error(job.error ?? "Scrape failed");
      setActiveJobId(null);
    }
  }, [scrapeJobQuery.data, queryClient]);

  const isLoading = groupByBrand
    ? brandsQuery.isLoading
    : promotionsQuery.isLoading;

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
          disabled={scrapeMutation.isPending || !!activeJobId}
        >
          {scrapeMutation.isPending || activeJobId ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {activeJobId ? "Scraping…" : "Run Scrape"}
        </Button>
      </div>

      {scrapeJobQuery.data?.data && activeJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scrape progress</CardTitle>
            <CardDescription>
              Status: {scrapeJobQuery.data.data.status} — found{" "}
              {scrapeJobQuery.data.data.recordsFound}, enriched{" "}
              {scrapeJobQuery.data.data.recordsEnriched}, failed{" "}
              {scrapeJobQuery.data.data.recordsFailed}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            placeholder="Search name or brand"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
          />
          <Input
            placeholder="Brand name"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
          />
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
            <Skeleton key={i} className="h-16 w-full" />
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
  onSelectPromotion,
}: {
  items: PromotionWithBrand[];
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
              <TableHead>Promotion</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Ends</TableHead>
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
                      <Badge key={tag} variant="secondary">
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
                          <Badge key={tag} variant="secondary">
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
