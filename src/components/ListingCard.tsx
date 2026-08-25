import { Package, Wrench, NotebookPen, HandHeart, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrustBadge } from "./TrustBadge";
import { findMatches, timeAgo, type Listing } from "@/lib/rex";

const CATEGORY_ICON: Record<string, typeof Package> = {
  Item: Package,
  Service: Wrench,
  Notes: NotebookPen,
  Lend: HandHeart,
  Request: Search,
};

export function ListingCard({
  listing,
  allListings = [],
}: {
  listing: Listing;
  allListings?: Listing[];
}) {
  const isRequest = listing.type === "request";
  const Icon = CATEGORY_ICON[listing.category] ?? Package;
  const matches = isRequest
    ? findMatches(`${listing.title} ${listing.description}`, allListings, 2)
    : [];

  return (
    <article
      className={cn(
        "flex flex-col gap-4 p-5 transition-all duration-200",
        isRequest ? "card-dashed hover:border-clay" : "card-soft hover:shadow-lift hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
            isRequest
              ? "bg-clay/15 text-clay"
              : "bg-forest/10 text-forest",
          )}
        >
          <Icon className="size-3.5" />
          {listing.category}
        </span>
        <span className="text-xs text-muted-foreground">{timeAgo(listing.created_at)}</span>
      </div>

      <div>
        {isRequest && (
          <p className="mb-1 font-display text-sm italic text-clay">Looking for</p>
        )}
        <h3 className="text-lg leading-snug text-foreground">{listing.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
      </div>

      {matches.length > 0 && (
        <div className="rounded-xl border border-forest/25 bg-forest/8 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-forest">
            Possible match{matches.length > 1 ? "es" : ""} on campus
          </p>
          <ul className="mt-2 space-y-1.5">
            {matches.map((m) => (
              <li key={m.id} className="flex items-start gap-1.5 text-sm text-foreground">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-forest" />
                <span>
                  {m.title} <span className="text-muted-foreground">— {m.poster_name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{listing.poster_name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {listing.poster_year}
            {listing.contact ? ` · ${listing.contact}` : ""}
          </p>
        </div>
        <TrustBadge exchangeCount={listing.exchange_count} tier={listing.trust_tier} />
      </div>
    </article>
  );
}
