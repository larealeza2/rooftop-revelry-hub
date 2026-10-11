import { createFileRoute } from "@tanstack/react-router";
import { json, preflight, readClient } from "@/lib/public-api";

// Public menu read for the restaurant's own website and the embed widget.
// Anonymous visitors only ever see dishes the kitchen has marked available.
export const Route = createFileRoute("/api/public/menu")({
  server: {
    handlers: {
      OPTIONS: ({ request }) => preflight(request),
      GET: async ({ request }) => {
        const supabase = await readClient();
        const { data, error } = await supabase
          .from("menu_items")
          .select("id,name,description,price,category,image_url")
          .eq("available", true)
          .order("category")
          .order("name");
        if (error) return json(request, { error: "Menu could not be loaded." }, 500);
        return json(request, { items: data });
      },
    },
  },
});
