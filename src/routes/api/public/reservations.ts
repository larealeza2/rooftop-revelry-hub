import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, preflight, readClient } from "@/lib/public-api";

// Guest bookings arriving from the restaurant's own website.
// There is no signed-in admin here, so the handler validates everything,
// throttles by visitor, and inserts as the anonymous role so the insert-only
// row level security policy on reservations decides what is allowed.
const bookingSchema = z.object({
  guest_name: z.string().trim().min(2, "Please give us a name to hold the table under.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,24}$/, "Please give us a phone number we can call you back on."),
  reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date."),
  reservation_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please choose a time."),
  party_size: z.coerce.number().int().min(1, "A table needs at least one guest.").max(30),
  occasion: z.string().trim().max(60).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
  // Honeypot: real guests never see or fill this, bots do.
  website: z.string().max(0).optional(),
});

const WINDOW_MINUTES = 10;
const MAX_PER_WINDOW = 5;

export const Route = createFileRoute("/api/public/reservations")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json(request, { error: "We could not read that request." }, 400);
        }

        const parsed = bookingSchema.safeParse(body);
        if (!parsed.success) {
          const first = parsed.error.issues[0];
          return json(request, { error: first?.message ?? "Please check the details and try again." }, 422);
        }

        const booking = parsed.data;
        if (booking.website) return json(request, { ok: true });

        const today = new Date().toISOString().slice(0, 10);
        if (booking.reservation_date < today) {
          return json(request, { error: "Please choose a date from today onwards." }, 422);
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
        const { count } = await supabaseAdmin
          .from("booking_throttle")
          .select("id", { count: "exact", head: true })
          .eq("ip", ip)
          .gte("created_at", windowStart);
        if ((count ?? 0) >= MAX_PER_WINDOW) {
          return json(request, { error: "Too many requests from here. Please try again in a few minutes." }, 429);
        }

        const supabase = await readClient();
        const { error } = await supabase.from("reservations").insert({
          guest_name: booking.guest_name,
          phone: booking.phone,
          reservation_date: booking.reservation_date,
          reservation_time: booking.reservation_time,
          party_size: booking.party_size,
          occasion: booking.occasion ?? null,
          notes: booking.notes ?? null,
          status: "pending",
        });
        if (error) {
          return json(request, { error: "We could not send your request. Please try again." }, 500);
        }

        await supabaseAdmin.from("booking_throttle").insert({ ip });
        await supabaseAdmin
          .from("booking_throttle")
          .delete()
          .lt("created_at", new Date(Date.now() - 86_400_000).toISOString());

        return json(request, { ok: true }, 201);
      },
    },
  },
});
