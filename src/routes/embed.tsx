import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookingForm } from "@/components/booking-form";

const SECTIONS = ["menu", "experiences", "gallery", "book"] as const;
type Section = (typeof SECTIONS)[number];

type MenuItem = { id: string; name: string; description: string; price: number; category: string; image_url: string | null };
type Experience = { id: string; title: string; description: string; image_url: string | null; display_order: number };
type GalleryImage = { id: string; image_url: string; alt_text: string };

export const Route = createFileRoute("/embed")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { section: Section } => ({
    section: SECTIONS.includes(search["section"] as Section) ? (search["section"] as Section) : "menu",
  }),
  head: () => ({
    meta: [
      { title: "Rooftop Restaurant & Lounge — Website Widget" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Embed,
});

function Embed() {
  const { section } = Route.useSearch();
  const [items, setItems] = useState<unknown[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (section === "book") return;
    let alive = true;
    setFailed(false);
    fetch(`/api/public/${section}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("failed"))))
      .then((body) => {
        if (alive) setItems(Array.isArray(body?.items) ? body.items : []);
      })
      .catch(() => {
        if (alive) {
          setItems([]);
          setFailed(true);
        }
      });
    return () => {
      alive = false;
    };
  }, [section]);

  useEffect(() => {
    if (window.parent === window) return;
    // The widget script passes the host page's origin in; without it (e.g. a
    // local file) fall back to "*" — the message carries only a height number.
    const parentOrigin = new URLSearchParams(window.location.search).get("parent");
    const target = parentOrigin && /^https?:/i.test(parentOrigin) ? parentOrigin : "*";
    const report = () =>
      window.parent.postMessage({ type: "rooftop-embed:height", height: document.body.scrollHeight }, target);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(document.body);
    return () => observer.disconnect();
  });

  return (
    <div className="min-h-screen bg-background px-5 py-6 text-foreground">
      {section === "menu" && <MenuPanel items={items as MenuItem[]} failed={failed} />}
      {section === "experiences" && <ExperiencePanel items={items as Experience[]} failed={failed} />}
      {section === "gallery" && <GalleryPanel items={items as GalleryImage[]} failed={failed} />}
      {section === "book" && (
        <div className="mx-auto max-w-md">
          <Heading eyebrow="Reservations" title="Book a table" />
          <BookingForm compact />
        </div>
      )}
      <p className="mt-7 border-t border-border pt-4 text-[10px] uppercase text-muted-foreground">
        Rooftop · K Hotels Entebbe
      </p>
    </div>
  );
}

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold uppercase text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-3xl font-semibold">{title}</h2>
    </div>
  );
}

function Notice({ failed }: { failed: boolean }) {
  if (!failed) return null;
  return <p className="rounded-md border border-border bg-card/60 p-4 text-xs text-muted-foreground">This panel could not be loaded right now. Please refresh the page.</p>;
}

function MenuPanel({ items, failed }: { items: MenuItem[]; failed: boolean }) {
  const categories = [...new Set(items.map((i) => i.category))];
  return (
    <section>
      <Heading eyebrow="From the kitchen" title="Menu" />
      <Notice failed={failed} />
      {!failed && !items.length && <p className="text-xs text-muted-foreground">The menu is being prepared.</p>}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="mb-2 text-xl font-semibold text-primary">{category}</h3>
            <ul className="space-y-3">
              {items
                .filter((i) => i.category === category)
                .map((i) => (
                  <li key={i.id} className="border-b border-border/60 pb-3 last:border-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold">{i.name}</p>
                      <p className="shrink-0 text-xs font-semibold text-primary">UGX {Number(i.price).toLocaleString()}</p>
                    </div>
                    {i.description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{i.description}</p>}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExperiencePanel({ items, failed }: { items: Experience[]; failed: boolean }) {
  return (
    <section>
      <Heading eyebrow="Signature moments" title="Experiences" />
      <Notice failed={failed} />
      {!failed && !items.length && <p className="text-xs text-muted-foreground">Experiences are being prepared.</p>}
      <div className="space-y-4">
        {items.map((x) => (
          <article key={x.id} className="overflow-hidden rounded-lg border border-border bg-card">
            {x.image_url && <img src={x.image_url} alt={x.title} loading="lazy" className="h-40 w-full object-cover" />}
            <div className="p-4">
              <h3 className="text-2xl font-semibold">{x.title}</h3>
              {x.description && <p className="mt-2 text-xs leading-5 text-muted-foreground">{x.description}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GalleryPanel({ items, failed }: { items: GalleryImage[]; failed: boolean }) {
  return (
    <section>
      <Heading eyebrow="Visual archive" title="Gallery" />
      <Notice failed={failed} />
      {!failed && !items.length && <p className="text-xs text-muted-foreground">Photographs are on their way.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((i) => (
          <img key={i.id} src={i.image_url} alt={i.alt_text} loading="lazy" className="aspect-square w-full rounded-md border border-border object-cover" />
        ))}
      </div>
    </section>
  );
}
