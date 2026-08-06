import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { SiteFooter } from "@/components/SiteFooter";

export type LegalSection = { heading: string; paragraphs: string[]; bullets?: string[] };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <img src={BRAND.logo} alt="" className="h-8 w-8 rounded-xl" />
            <span className="text-base font-extrabold tracking-tight">Robinhood</span>
          </Link>
          <Link
            to="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-semibold hover:bg-surface"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-12 pb-16">
        <p className="text-sm font-semibold text-primary">Legal</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Last updated {updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-bold tracking-tight">{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              {s.bullets?.length ? (
                <ul className="mt-4 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px] text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Questions about this page? Reach our team from the{" "}
          <Link to="/support" className="font-semibold text-primary">
            Support
          </Link>{" "}
          page and we'll get back to you.
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
