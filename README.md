# Rooftop Command Center

Build an admin dashboard for "Rooftop Restaurant & Lounge" (K Hotels, Entebbe) — 

a fine-dining rooftop restaurant. This is an internal tool for restaurant staff, 

connected to Supabase, and it must NOT look like a generic SaaS admin panel. 

Match the visual identity of a moody, upscale rooftop lounge — think dark, 

cinematic, editorial — not a bright corporate dashboard.



DESIGN DIRECTION (be strict about this):

- Dark theme: deep charcoal/near-black background (#0D0A07 as base), warm 

  gold/amber accent color for highlights, buttons, active states

- Elegant serif font for headings (something like Playfair Display or Cormorant), 

  clean sans-serif for body text and data — same pairing a luxury hotel brand 

  would use, not default system fonts

- Generous whitespace, soft card shadows with a subtle warm glow, rounded 

  corners but not overly soft/bubbly

- Subtle motion: numbers count up on load, cards fade/slide in, smooth hover 

  states on interactive elements — should feel premium, not static

- No default purple/blue SaaS gradients, no generic dashboard templates, 

  no cookie-cutter sidebar-with-emoji-icons look



STRUCTURE — build these sections:



1. OVERVIEW (landing page of the dashboard)

   - Large stat cards: Today's Reservations, This Week's Reservations, 

     Pending Requests, Upcoming Special Events

   - A recent activity feed: latest reservations submitted



2. RESERVATIONS

   - Table/list of all reservations: name, phone, date, time, party size, 

     occasion, notes, status

   - Status badges: Pending / Confirmed / Cancelled, changeable via dropdown 

     or buttons

   - Filter by date range (today / this week / upcoming)



3. MENU MANAGEMENT

   - List menu items grouped by category (Indian, Continental, East African, 

     Asian, Fast Food, Desserts)

   - Add / edit / delete a dish: name, description, price, category, image, 

     available toggle (on/off)



4. EXPERIENCES MANAGEMENT

   - Edit the three themed experience cards (Mongolian Night, Sunset Sessions, 

     Private Hire): title, description, image



5. GALLERY MANAGEMENT

   - Grid of current gallery images with delete option, and an upload button 

     to add new ones



DATA:

- Connect to Supabase. Create tables: reservations, menu_items, experiences, 

  gallery_images

- Dashboard requires a simple admin login (Supabase Auth, email/password) — 

  no public sign-up, just a login screen



Do not simplify the visual style to a generic template halfway through — 

keep the dark/gold fine-dining aesthetic consistent across every single 

screen, including the login page.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rooftop-revelry-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/539961af-922f-4484-8704-2a0ebbaf091f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
