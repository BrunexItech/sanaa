# Ushanga — Project Overview (handoff brief)

## What this is

**Ushanga** is a digital ecosystem for a real physical initiative: the planned
**Ushanga Empowerment Centre** at **Sekenani Gate**, the main entrance to the
Maasai Mara, Kenya. The physical centre (architecture already designed,
renders exist in a separate PDF proposal) will house Maa women artisans
producing beadwork, with a visitor exhibition, a "Living Craft Studio," and a
premium retail store. This repo is the **digital platform** for it — not a
generic e-commerce demo, but the operating system connecting three things:

1. **Marketing / global commerce** — a premium marketplace selling real
   Kenyan artisan beadwork (necklaces, bracelets, belts, earrings, bags,
   wood/soapstone carvings) to local and international buyers.
2. **Custom design** — buyers who don't see what they want can design a
   custom piece (currently a deterministic preset configurator; **real AI
   image generation via OpenAI is being wired in right now** so people can
   type a prompt like "a red and gold beaded belt" and get an actual
   generated design).
3. **Production** — every order (catalogue or custom) becomes a real,
   trackable work order routed to a named artisan at the Sekenani studio,
   with a visible status pipeline (Confirmed → In Production → Quality Check
   → Ready → Completed) and a shareable customer tracking link.

This was commissioned as a **national-standard government/investor pitch
prototype** — it will be demoed live to a Kenyan Permanent Secretary (Culture)
in person, so visual polish, honesty about what's real vs. simulated, and
"nothing broken on screen" matter enormously.

## The real-world business logic it's modeling

From the client's own blueprint (not invented by me), the full vision is an
**artisan economy operating system**:

- Artisans get unique IDs and belong to **artisan groups** by specialisation
  (not yet built — flagged below).
- A **documentation team** photographs finished products and submits them.
- A **QA team** inspects quality, sets the approved selling price, and
  publishes to the marketplace — products should NOT go live unreviewed
  (not yet built — right now products are seeded directly as published).
- **Sales are attributed** back to the specific artisan(s) who made the
  piece, with earnings tracked separately from the customer price (not yet
  built).
- **Exhibition QR codes** at the physical centre link visitors to one of 5
  digital journeys (this part IS built — see `/admin/qr`).
- Walk-in visitors and remote online buyers use the **same backend**, same
  catalogue, same production pipeline.

## Tech stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**
- **Tailwind v4** (CSS-based tokens in `src/app/globals.css`, no config file)
- **PostgreSQL + Prisma 7** — real database, not mocked. Local dev runs via
  Docker Compose (`docker-compose.yml`, port 5436). Schema: `prisma/schema.prisma`
- **Docker** production build: `Dockerfile` (multi-stage) + `docker-compose.yml`
  `app` service. Deployed live at **`https://ushanga.oqtekal.com`** on a
  shared VPS (`bitafrica@vmi2985677`), behind nginx + Cloudflare, same
  pattern as the user's other projects on that box (hms, sports, etc.)
- **qrcode** npm package for real scannable QR generation

## Deploy loop (already working, used repeatedly this session)

```bash
# locally
cd /home/bruno-sharrix/Downloads/sanaa && git add -A && git commit -m "..." && git push

# on the server
cd ~/sanaa && git pull && docker-compose up -d --build app
docker-compose exec app npx tsx prisma/seed.ts   # re-seed catalogue after schema/data changes
```
Postgres on the server is a separate container (`docker-compose.yml`), data persists in a named volume. GitHub repo: `github.com/BrunexItech/sanaa` (public).

## What's built and working (verified end-to-end, not just "looks right")

- Full public site: Home, Our Story (`/about`), Marketplace, The Centre
  (`/artisans`), Experiences, Contact — premium black/onyx + gold visual
  identity matching a reference design the client supplied
- Real catalogue: **10 real, product-only photos** (sourced from Wikimedia
  Commons, cropped to remove any people — client was explicit: catalogue
  images must show the *product*, not a person) across 7 categories
- Guided custom-design configurator (`/design`) — deterministic, not AI yet
- Real order → production pipeline: `POST /api/orders` creates a DB order,
  `/orders/[reference]` is a live trackable status page, `/production` is the
  staff dashboard that advances orders through stages
- Simulated M-Pesa/card checkout UX (intentionally simulated — no real
  payment provider wired, by design, pending client decision)
- Exhibition QR system: `/admin/qr` generates real scannable QR codes tied to
  5 visitor journeys, `/qr/[code]` is the public scan-landing page with scan
  counting
- Artisan onboarding flow (`/artisan-onboarding`) — county/sub-county
  application form for new artisans to join

## What's explicitly NOT built yet (don't claim it exists)

- **Artisan groups, unique IDs, multi-artisan contribution/earnings
  attribution** — biggest structural gap vs. the client's blueprint
- **Documentation-team upload UI + QA approval gate before publish** —
  products currently skip straight to published
- **Role-based access control** — `/production` and `/admin/qr` have no auth
  gate at all right now; anyone with the URL can reach them
- **Real AI image generation** — in progress as of this handoff. Client
  wants: user types a prompt describing a piece (e.g. "a beaded bracelet
  with ocean colours"), OpenAI generates an actual image, they confirm, it
  becomes a real order. Client uses OpenAI in their other project (`tolkyn`)
  with models `gpt-image-2.5-sunburst` (quality) / `gpt-image-2.5-flare`
  (fast draft) — same convention should be used here for consistency. The
  `OPENAI_API_KEY` env var slot already exists in `.env` (not committed);
  client was about to paste their key in when this handoff was written.
- **Real payment integration** (M-Pesa/card are simulated UX only)
- No automated tests exist

## Client communication patterns worth knowing

- Extremely results-oriented, low tolerance for anything that looks broken
  or generic/AI-cliché ("avoid AI sparkles," wanted the Sparkles icon and
  "AI Mirror" branding removed entirely at one point)
- Wants **honesty over fabrication** — explicitly praised not faking a VR
  video when no real footage existed, and rejected AI-generated "real
  people" photography in favour of real, licensed stock photography
  throughout (Wikimedia Commons, no people in product shots)
- Will say things like "this is pure crap, revert" — take it literally and
  revert via git history rather than trying to guess a fix
- Deploys happen live, mid-conversation, with the client pasting server
  terminal output back for diagnosis — be ready to debug production issues
  interactively (e.g. a Next.js `images.qualities` config bug that only
  manifested in production builds, not dev, was found and fixed this way)
- Final audience is a **government official** — treat every visual detail as
  presentation-critical

## Immediate next step (as of this handoff)

Build `POST /api/designs/generate` (calls OpenAI image API using the prompt
+ selected item type, constrained to stay on-brand — authentic Kenyan
beadwork style, no people, product-photography framing), add a "Describe
your design" mode alongside the existing preset configurator on `/design`,
and wire the generated result into the same `CustomDesign` → `Order` →
production pipeline that already exists.
