import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Campus Events — RExchange" },
      {
        name: "description",
        content:
          "Upcoming robotics, career and social events on campus. Mark yourself interested and see who else is going.",
      },
      { property: "og:title", content: "Campus Events — RExchange" },
      {
        property: "og:description",
        content: "Upcoming robotics, career and social events on campus.",
      },
    ],
  }),
  component: EventsPage,
});

interface CampusEvent {
  id: string;
  title: string;
  event_date: string;
  category: string;
  location: string;
  interested_count: number;
}

const INTEREST_KEY = "rex-interested-events";

function EventsPage() {
  const qc = useQueryClient();
  const [interested, setInterested] = useState<string[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(INTEREST_KEY);
    setInterested(raw ? (JSON.parse(raw) as string[]) : []);
  }, []);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CampusEvent[];
    },
  });

  const toggle = useMutation({
    mutationFn: async (event: CampusEvent) => {
      const isOn = interested.includes(event.id);
      const next = isOn
        ? interested.filter((id) => id !== event.id)
        : [...interested, event.id];
      window.localStorage.setItem(INTEREST_KEY, JSON.stringify(next));
      setInterested(next);
      const { error } = await supabase.rpc("adjust_event_interest", {
        _event_id: event.id,
        _delta: isOn ? -1 : 1,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-4xl">Campus Events</h1>
      <p className="mt-3 text-muted-foreground">What's coming up, and who's showing up.</p>

      <div className="mt-8 space-y-4">
        {isLoading
          ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : events.map((ev) => {
              const isOn = interested.includes(ev.id);
              return (
                <article
                  key={ev.id}
                  className="card-soft flex flex-wrap items-center gap-4 p-5"
                >
                  <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-sand text-center">
                    <span className="font-display text-lg leading-none font-semibold">
                      {new Date(ev.event_date).getDate()}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {new Date(ev.event_date).toLocaleString("en-US", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-forest">
                      {ev.category}
                    </span>
                    <h2 className="mt-1.5 text-lg leading-snug">{ev.title}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        {new Date(ev.event_date).toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {ev.location}
                        </span>
                      )}
                      <span>{ev.interested_count} interested</span>
                    </p>
                  </div>
                  <Button
                    variant={isOn ? "default" : "outline"}
                    size="sm"
                    className={cn("shrink-0", isOn && "bg-forest text-forest-foreground")}
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate(ev)}
                  >
                    <Star className={cn("size-4", isOn && "fill-current")} />
                    {isOn ? "Interested" : "I'm interested"}
                  </Button>
                </article>
              );
            })}
      </div>
    </div>
  );
}
