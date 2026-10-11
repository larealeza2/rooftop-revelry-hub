import { createFileRoute } from "@tanstack/react-router";
import { json, preflight, readClient } from "@/lib/public-api";

// Public experiences read for the restaurant's own website and the embed widget.
export const Route = createFileRoute("/api/public/experiences")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      GET: async ({ request }) => {
        const supabase = await readClient();
        const { data, error } = await supabase
          .from("experiences")
          .select("id,title,description,image_url,display_order")
          .order("display_order")
          .order("title");
        if (error) return json(request, { error: "Experiences could not be loaded." }, 500);
        return json(request, { items: data });
      },
    },
  },
});
