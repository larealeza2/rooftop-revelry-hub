import { createFileRoute } from "@tanstack/react-router";
import { json, preflight, readClient } from "@/lib/public-api";

// Public gallery read for the restaurant's own website and the embed widget.
export const Route = createFileRoute("/api/public/gallery")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      GET: async ({ request }) => {
        const supabase = await readClient();
        const { data, error } = await supabase
          .from("gallery_images")
          .select("id,image_url,alt_text")
          .order("created_at", { ascending: false })
          .limit(60);
        if (error) return json(request, { error: "Gallery could not be loaded." }, 500);
        return json(request, { items: data });
      },
    },
  },
});
