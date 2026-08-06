import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_app/news")({
  component: News,
});

const STORIES = [
  { t: "Apple unveils new iPhone lineup", s: "AAPL", time: "3h ago", tag: "Tech" },
  { t: "Tesla stock jumps after strong earnings beat", s: "TSLA", time: "4h ago", tag: "Autos" },
  { t: "Bitcoin hits new monthly high above $67K", s: "BTC", time: "6h ago", tag: "Crypto" },
  { t: "NVIDIA announces next-gen AI chip", s: "NVDA", time: "8h ago", tag: "Tech" },
  { t: "Fed signals steady rates through year-end", s: "SPY", time: "12h ago", tag: "Macro" },
];

function News() {
  return (
    <div className="mx-auto max-w-md px-5 pt-6">
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">News</h1>
      </div>
      <ul className="mt-6 space-y-3">
        {STORIES.map((n) => (
          <li key={n.t} className="card-elevated flex gap-3 p-3">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 text-primary font-bold">
              {n.s}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">{n.tag}</div>
              <div className="mt-0.5 font-semibold leading-snug">{n.t}</div>
              <div className="mt-1 text-xs text-muted-foreground">{n.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
