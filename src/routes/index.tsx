import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { PostForm } from "@/components/PostForm";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Listing } from "@/lib/rex";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RExchange — Campus Trust & Resource Network" },
      {
        name: "description",
        content:
          "Borrow, lend, share notes and find help on campus with visible trust signals on every listing. No login needed.",
      },
      { property: "og:title", content: "RExchange — Campus Trust & Resource Network" },
      {
        property: "og:description",
        content:
          "Borrow, lend, share notes and find help on campus with visible trust signals on every listing.",
      },
    ],
  }),
  component: Home,
});

const FILTERS = ["All", ...CATEGORIES] as const;

function Home() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const visible = useMemo(
    () => (filter === "All" ? listings : listings.filter((l) => l.category === filter)),
    [listings, filter],
  );

  const trustedCount = listings.filter((l) => l.trust_tier !== "New").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
          <Sparkles className="size-3.5" /> Campus trust network
        </span>
        <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">
          Everything worth sharing on campus, from people you can actually trust.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Notes, gear, skills and small favours — each listing carries a trust tier earned through
          real exchanges, so you know who you're dealing with before you ask.
        </p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4 text-clay" /> {listings.length} live listings
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="size-4 text-forest" /> {trustedCount} trusted posters
          </span>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  filter === f
                    ? "border-transparent bg-forest text-forest-foreground shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="card-soft p-8 text-center text-sm text-muted-foreground">
              Nothing in {filter} yet — be the first to post one.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {visible.map((l) => (
                <ListingCard key={l.id} listing={l} allListings={listings} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <PostForm listings={listings} />
        </div>
      </div>
    </div>
  );
}
