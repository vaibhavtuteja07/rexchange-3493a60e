import { Sprout, ShieldCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { tierFor } from "@/lib/rex";

const TIERS = {
  New: {
    label: "New",
    icon: Sprout,
    className: "bg-tier-new text-tier-new-foreground border-transparent",
  },
  Trusted: {
    label: "Trusted",
    icon: ShieldCheck,
    className: "bg-tier-trusted text-tier-trusted-foreground border-transparent",
  },
  "Campus Regular": {
    label: "Campus Regular",
    icon: Flame,
    className: "bg-tier-regular text-tier-regular-foreground border-transparent",
  },
} as const;

export function TrustBadge({
  exchangeCount,
  tier,
  className,
}: {
  exchangeCount: number;
  tier?: string;
  className?: string;
}) {
  const key = (tier && tier in TIERS ? tier : tierFor(exchangeCount)) as keyof typeof TIERS;
  const t = TIERS[key];
  const Icon = t.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        t.className,
        className,
      )}
      title={`${exchangeCount} completed exchange${exchangeCount === 1 ? "" : "s"}`}
    >
      <Icon className="size-3.5" />
      {t.label}
      <span className="opacity-70">· {exchangeCount}</span>
    </span>
  );
}
