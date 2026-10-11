import { createFileRoute } from "@tanstack/react-router";
import { BookingForm } from "@/components/booking-form";
import rooftopImage from "@/assets/rooftop-lounge.jpg";

export const Route = createFileRoute("/book")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Book a Table — Rooftop Restaurant & Lounge" },
      { name: "description", content: "Request a table at Rooftop Restaurant & Lounge, K Hotels Entebbe. Tell us the date, time and party size and we will call to confirm." },
      { property: "og:title", content: "Book a Table — Rooftop Restaurant & Lounge" },
      { property: "og:description", content: "Request a table above the city at K Hotels Entebbe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden lg:block">
        <img
          src={rooftopImage}
          width={1600}
          height={1000}
          alt="Rooftop Restaurant overlooking Lake Victoria at dusk"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
        <div className="absolute bottom-0 max-w-xl p-14 xl:p-20">
          <p className="mb-5 text-xs font-semibold uppercase text-primary">K Hotels · Entebbe</p>
          <h1 className="text-6xl font-semibold leading-[.9] xl:text-7xl">
            Hold your
            <br />
            <span className="italic text-primary">evening.</span>
          </h1>
          <p className="mt-6 text-sm leading-7 text-foreground/70">
            Tell us when you would like to join us and we will call to confirm the table.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen items-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md animate-rise">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary">
              <span className="font-serif text-2xl">R</span>
            </div>
            <div>
              <p className="font-serif text-xl font-semibold">Rooftop</p>
              <p className="text-[10px] uppercase text-muted-foreground">Restaurant &amp; Lounge</p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase text-primary">Reservations</p>
          <h2 className="mt-3 text-4xl font-semibold lg:hidden">Book a table.</h2>
          <h2 className="mt-3 hidden text-4xl font-semibold lg:block">Request a table.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Send your details and our team will call you back to confirm.
          </p>
          <div className="mt-8">
            <BookingForm />
          </div>
        </div>
      </section>
    </main>
  );
}
