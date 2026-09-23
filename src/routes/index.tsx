import { createFileRoute, redirect } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/auth" }); },
  head: () => ({ meta: [
    { title: "Rooftop Restaurant & Lounge — Staff Access" },
    { name: "description", content: "Secure staff access for Rooftop Restaurant & Lounge at K Hotels Entebbe." },
    { property: "og:title", content: "Rooftop Restaurant & Lounge — Staff Access" },
    { property: "og:description", content: "Secure staff access for Rooftop Restaurant & Lounge." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: () => null,
});
