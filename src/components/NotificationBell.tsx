import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getDeviceId, textMatchesKeywords, timeAgo, type Listing } from "@/lib/rex";
import {
  addWatchKeyword,
  listWatchKeywords,
  removeWatchKeyword,
} from "@/lib/rex.functions";

// Real push notifications are designed for a future upgrade — this is an in-app
// watchlist badge only.
const SEEN_KEY = "rex-watch-last-seen";

interface WatchKeyword {
  id: string;
  keyword: string;
}

export function NotificationBell() {
  const qc = useQueryClient();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [lastSeen, setLastSeen] = useState<number>(0);

  useEffect(() => {
    setDeviceId(getDeviceId());
    const stored = window.localStorage.getItem(SEEN_KEY);
    setLastSeen(stored ? Number(stored) : Date.now() - 1000 * 60 * 60 * 24 * 7);
  }, []);

  const { data: keywords = [] } = useQuery({
    queryKey: ["watch-keywords", deviceId],
    enabled: !!deviceId,
    queryFn: async () => {
      return (await listWatchKeywords({ data: { deviceId: deviceId! } })) as WatchKeyword[];
    },
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(
          "id, title, category, type, description, poster_name, poster_year, exchange_count, trust_tier, created_at",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Listing[];
    },
  });

  const words = useMemo(() => keywords.map((k) => k.keyword), [keywords]);

  const hits = useMemo(() => {
    if (words.length === 0) return [];
    return listings.filter(
      (l) =>
        new Date(l.created_at).getTime() > lastSeen &&
        textMatchesKeywords(`${l.title} ${l.description} ${l.category}`, words),
    );
  }, [listings, words, lastSeen]);

  const addKeyword = useMutation({
    mutationFn: async (keyword: string) => {
      const clean = keyword.trim().slice(0, 40);
      if (clean.length < 2) throw new Error("too short");
      await addWatchKeyword({ data: { deviceId: getDeviceId(), keyword: clean } });
    },
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["watch-keywords"] });
    },
  });

  const removeKeyword = useMutation({
    mutationFn: async (id: string) => {
      await removeWatchKeyword({ data: { deviceId: getDeviceId(), id } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watch-keywords"] }),
  });

  function markSeen() {
    const now = Date.now();
    window.localStorage.setItem(SEEN_KEY, String(now));
    setLastSeen(now);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative rounded-full border border-border bg-card p-2.5 text-foreground shadow-soft transition-colors hover:border-primary"
          aria-label="Watchlist notifications"
        >
          <Bell className="size-4" />
          {hits.length > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {hits.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div>
          <p className="font-display text-base font-semibold">Watchlist</p>
          <p className="text-xs text-muted-foreground">
            Get flagged when a new post mentions your keyword.
          </p>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addKeyword.mutate(draft);
          }}
        >
          <Input
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. calculator"
            className="h-9"
          />
          <Button type="submit" size="sm" className="h-9 shrink-0" disabled={addKeyword.isPending}>
            <Plus className="size-4" />
          </Button>
        </form>

        {words.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {keywords.map((k) => (
              <span
                key={k.id}
                className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs text-foreground"
              >
                {k.keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword.mutate(k.id)}
                  aria-label={`Remove ${k.keyword}`}
                >
                  <X className="size-3 text-muted-foreground hover:text-destructive" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          {hits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing new matching your keywords.</p>
          ) : (
            <>
              {hits.slice(0, 5).map((h) => (
                <div key={h.id} className="text-sm">
                  <span className="font-medium">{h.title}</span>{" "}
                  <span className="text-xs text-muted-foreground">{timeAgo(h.created_at)}</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full" onClick={markSeen}>
                Mark all as read
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
