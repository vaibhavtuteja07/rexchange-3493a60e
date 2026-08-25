import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CATEGORIES, findMatches, tierFor, type Listing } from "@/lib/rex";

const schema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120, "Keep the title under 120 characters"),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(5, "Add a little more detail").max(600, "Keep it under 600 characters"),
  posterName: z.string().trim().min(2, "Add your name").max(60),
  posterYear: z.string().trim().min(2, "Add your branch and year").max(60),
  contact: z.string().trim().min(3, "Add a way to reach you").max(120),
});

export function PostForm({ listings }: { listings: Listing[] }) {
  const qc = useQueryClient();
  const [type, setType] = useState<"offer" | "request">("offer");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Item");
  const [description, setDescription] = useState("");
  const [posterName, setPosterName] = useState("");
  const [posterYear, setPosterYear] = useState("");
  const [contact, setContact] = useState("");

  // PHASE 2 — live client-side match suggestions while typing a request.
  const liveMatches = useMemo(
    () => (type === "request" ? findMatches(`${title} ${description}`, listings, 3) : []),
    [type, title, description, listings],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.parse({ title, category, description, posterName, posterYear, contact });
      const exchangeCount = 0;
      const { error } = await supabase.from("listings").insert({
        title: parsed.title,
        category: parsed.category,
        type,
        description: parsed.description,
        poster_name: parsed.posterName,
        poster_year: parsed.posterYear,
        contact: parsed.contact,
        exchange_count: exchangeCount,
        trust_tier: tierFor(exchangeCount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(type === "offer" ? "Your offer is live" : "Your request is on the board");
      setTitle("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
    onError: (err) => {
      toast.error(err instanceof z.ZodError ? err.issues[0].message : "Could not post — try again");
    },
  });

  return (
    <form
      className="card-soft space-y-5 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <div>
        <h2 className="text-xl">Post to the exchange</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No login. Just say what you have or what you need.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-full bg-sand p-1">
        {(["offer", "request"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              type === t
                ? t === "offer"
                  ? "bg-forest text-forest-foreground shadow-soft"
                  : "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "offer" ? "I'm Offering" : "I'm Requesting"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === "offer" ? "Scientific calculator to give away" : "Need a lab coat for tomorrow"}
        />
      </div>

      {liveMatches.length > 0 && (
        <div className="rounded-xl border border-forest/30 bg-forest/8 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-forest">
            <Sparkles className="size-3.5" /> Someone may already have this
          </p>
          <ul className="mt-2 space-y-2">
            {liveMatches.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-medium text-foreground">{m.title}</span>
                <span className="text-muted-foreground"> — {m.poster_name}, {m.poster_year}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                category === c
                  ? "border-transparent bg-secondary-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          maxLength={600}
          rows={3}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Condition, timing, where you can meet…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={posterName} maxLength={60} onChange={(e) => setPosterName(e.target.value)} placeholder="Ananya Rao" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Branch & year</Label>
          <Input id="year" value={posterYear} maxLength={60} onChange={(e) => setPosterYear(e.target.value)} placeholder="CSE, 3rd Year" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact">Contact</Label>
        <Input id="contact" value={contact} maxLength={120} onChange={(e) => setContact(e.target.value)} placeholder="email, handle or phone" />
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Posting…" : type === "offer" ? "Post offer" : "Post request"}
      </Button>
    </form>
  );
}
