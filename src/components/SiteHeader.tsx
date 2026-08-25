import { Link } from "@tanstack/react-router";
import { Repeat2 } from "lucide-react";
import { NotificationBell } from "./NotificationBell";

const NAV = [
  { to: "/", label: "Exchange" },
  { to: "/needs", label: "Need Board" },
  { to: "/events", label: "Events" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-forest text-forest-foreground">
            <Repeat2 className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">RExchange</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 rounded-full bg-sand p-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-card text-foreground shadow-soft" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <NotificationBell />
      </div>
    </header>
  );
}
