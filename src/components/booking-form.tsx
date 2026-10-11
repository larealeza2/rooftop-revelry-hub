import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const occasions = ["Dinner", "Birthday", "Anniversary", "Business", "Celebration", "Other"];

export function BookingForm({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      guest_name: String(data.get("guest_name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      reservation_date: String(data.get("reservation_date") ?? ""),
      reservation_time: String(data.get("reservation_time") ?? ""),
      party_size: Number(data.get("party_size") ?? 0),
      occasion: String(data.get("occasion") ?? "") || null,
      notes: String(data.get("notes") ?? "") || null,
      website: String(data.get("website") ?? ""),
    };
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/public/reservations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail?.error ?? "We could not send your request. Please try again.");
      }
      setState("done");
    } catch (problem) {
      setState("error");
      setError(problem instanceof Error ? problem.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="animate-rise rounded-lg border border-primary/30 bg-primary/5 p-8 text-center warm-shadow">
        <div className="mx-auto grid size-12 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
          <Check className="size-5" />
        </div>
        <h2 className="mt-5 text-3xl font-semibold">Request received</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Thank you. Our team will call you back to confirm the table.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`space-y-4 ${compact ? "" : "sm:space-y-5"}`}>
      <label className="block text-xs font-medium text-muted-foreground">
        Name on the table
        <Input required name="guest_name" minLength={2} maxLength={80} placeholder="Your name" className="mt-2 h-12 bg-card/70" />
      </label>
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2 sm:space-y-0"}>
        <label className="block text-xs font-medium text-muted-foreground">
          Phone number
          <Input required name="phone" type="tel" placeholder="+256 700 000 000" className="mt-2 h-12 bg-card/70" />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Guests
          <Input required name="party_size" type="number" min={1} max={30} defaultValue={2} className="mt-2 h-12 bg-card/70" />
        </label>
      </div>
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2 sm:space-y-0"}>
        <label className="block text-xs font-medium text-muted-foreground">
          Date
          <Input required name="reservation_date" type="date" min={today} defaultValue={today} className="mt-2 h-12 bg-card/70" />
        </label>
        <label className="block text-xs font-medium text-muted-foreground">
          Time
          <Input required name="reservation_time" type="time" defaultValue="19:00" className="mt-2 h-12 bg-card/70" />
        </label>
      </div>
      <label className="block text-xs font-medium text-muted-foreground">
        Occasion
        <select
          name="occasion"
          defaultValue=""
          className="mt-2 h-12 w-full rounded-md border border-input bg-card/70 px-3 text-sm text-foreground"
        >
          <option value="">No special occasion</option>
          {occasions.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-muted-foreground">
        Anything we should know?
        <Textarea name="notes" maxLength={500} rows={compact ? 2 : 3} placeholder="Window table, dietary needs, celebration…" className="mt-2 bg-card/70" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive-foreground">
          {error}
        </p>
      )}
      <Button disabled={state === "sending"} className="h-12 w-full text-sm">
        {state === "sending" ? (
          <>
            <Loader2 className="animate-spin" /> Sending request…
          </>
        ) : (
          "Request a table"
        )}
      </Button>
      <p className="text-xs leading-5 text-foreground/60">
        Requests are held for 24 hours while we call to confirm. For same-day tables, please call the restaurant.
      </p>
    </form>
  );
}
