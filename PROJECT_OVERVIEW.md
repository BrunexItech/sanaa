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
2. **Custom design** — buyers who don't see what they want describe a
   custom piece in their own words on `/design` (e.g. "a red and gold
   beaded belt with a brass buckle") and get a **real AI-generated concept
   image** back via OpenAI — this is live and working in production, not
   simulated. The old deterministic preset configurator ("pick a
   colourway/pattern") has been removed; AI prompting is now the only way
   to create a custom design.
3. **Production** — every order (catalogue or custom) becomes a real,
   trackable work order. It first lands on a staff **Incoming Orders** desk
   (`/incoming-orders`) for acceptance, then moves through a visible status
   pipeline on `/production` (In Production → Quality Check → Ready →
   Completed), and the customer gets a shareable, live-updating tracking
   link (`/orders/[reference]`).
4. **Cataloguing** — a documentation team can photograph a finished piece
   and publish it straight to the live marketplace via `/documentation`
   (no QA gate yet — publish is immediate).

This was commissioned as a **national-standard government/investor pitch
prototype** — it will be demoed live to a Kenyan Permanent Secretary (Culture)
in person, so visual polish, honesty about what's real vs. simulated, and
"nothing broken on screen" matter enormously.

## The real-world business logic it's modeling

From the client's own blueprint (not invented by me), the full vision is an
**artisan economy operating system**:

- Artisans get unique IDs and belong to **artisan groups** by specialisation
  (not yet built — flagged below).
- A **documentation team** photographs finished products and submits them
  (built — `/documentation` — but publishes immediately, no QA gate yet).
- A **QA team** inspects quality, sets the approved selling price, and
  publishes to the marketplace — products should NOT go live unreviewed
  (not yet built — `/documentation` publishes straight to live).
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

Server uses **`docker-compose`** (hyphenated, not the `docker compose` plugin).

```bash
# locally
cd /home/bruno-sharrix/Downloads/sanaa && git add -A && git commit -m "..." && git push

# on the server, one command at a time
cd ~/sanaa
git pull
docker-compose build app
docker-compose up -d
docker-compose logs app --tail 40   # confirm migrations applied + "Ready"
```

**If the live site still shows old content after this** (confirmed by
checking `curl http://127.0.0.1:8093/<page>` directly on the server, not
through Cloudflare — rules out CDN caching): verify `git log -1 --oneline`
on the server matches the latest commit, and that the relevant source file
on disk actually has the new text (`grep` for a distinctive string in it).
If both check out but the container still serves the old page, the Docker
build cache is the suspect — force a clean rebuild:

```bash
docker-compose build --no-cache app
docker-compose up -d
sleep 3
curl -s http://127.0.0.1:8093/<page> | grep "<distinctive new text>"
```

Note the running container does **not** contain `src/` (the multi-stage
Dockerfile's runner stage only copies `.next`, `public`, `node_modules`,
`prisma`, and `src/generated` — see `Dockerfile`), so
`docker-compose exec app grep ... src/...` will always 404 with "No such
file or directory" even on a correct deploy; that's expected, not a bug.

Postgres on the server is a separate container (`docker-compose.yml`), data
persists in a named volume. GitHub repo: `github.com/BrunexItech/sanaa`
(public). Live at **`https://ushanga.oqtekal.com`**, app container bound to
`127.0.0.1:8093`, postgres to `127.0.0.1:5438` — both **remapped directly on
the server, not committed to git**, to avoid port clashes with other
projects sharing that VPS. If you ever edit `docker-compose.yml` locally and
push, expect `git pull` on the server to conflict with those uncommitted
port lines — resolve in favour of keeping the server's port mapping.

New `OPENAI_API_KEY` / `OPENAI_IMAGE_MODEL` env vars are injected into the
`app` service via `${VAR}` substitution in `docker-compose.yml`, sourced
from a server-local `.env` file (not in git) sitting next to it.

**Gotcha hit once already**: if a Prisma migration adds a required column
to a table with existing rows, `migrate deploy` fails with P3018 inside the
container and the app container exits (command is
`migrate deploy && npm run start`, so a failed migration means no server).
Fix: `docker-compose run --rm app npx prisma migrate resolve --rolled-back <name>`,
clear/fix the blocking rows via `docker-compose exec postgres psql -U ushanga -d ushanga -c "..."`,
then `docker-compose up -d` again. If a prior failed attempt partially
applied DDL (e.g. created an enum type) before failing on a later
statement, you may need to manually `DROP TYPE "X";` before retrying.

## What's built and working (verified end-to-end, not just "looks right")

- Full public site: Home, Our Story (`/about`), Marketplace, The Centre
  (`/artisans`), Experiences, Contact — premium black/onyx + gold visual
  identity matching a reference design the client supplied
- Real catalogue: **10 real, product-only photos** (sourced from Wikimedia
  Commons, cropped to remove any people — client was explicit: catalogue
  images must show the *product*, not a person) across 7 categories
- **Real AI custom-design generation** (`/design`) — customer picks a piece
  via an icon-based category tile grid (Necklace, Bracelet, Belt, Earrings,
  Bag Strap), picks a size, describes it in free text, and
  `POST /api/designs/generate` calls OpenAI (`gpt-image-2.5-sunburst`, same
  convention as the client's other project `tolkyn`) to produce an actual
  product-photo-style concept image, stored as a `CustomDesign` row
  (`source: AI_PROMPT`) with a computed bespoke price (base item price ×
  1.2). The old preset configurator (pick a colourway/pattern, no AI) has
  been **removed entirely** — AI prompting is the only path now. UI shows a
  live circular percentage progress ring during the 15–20s generation
  (eased toward 92%, only hits 100% when the real image lands), a large
  "design in progress" stage, a trust-badge row (artisan review, delivery
  timeline, cooperative impact), and a price + "Add to Cart & Checkout" bar.
  Deliberately does **not** include a "see it on you" model-wearing photo —
  that needs fabricated AI human photography, which conflicts with the
  no-fabricated-people rule below. Verified end-to-end against the real
  OpenAI account, both locally and in production, including a scripted
  Playwright run confirming the desktop and mobile layouts render correctly
  with a real generated image. Checkout page renders the AI photo directly
  (not the old abstract SVG bead preview, which only applies to legacy
  preset-era designs still in the DB).
- Real order → production pipeline, now in two stages:
  - `/incoming-orders` — newly confirmed orders (not yet accepted by staff),
    auto-polls every 8s, shows a toast + chime + "New" badge the instant an
    order arrives, product/AI-design thumbnail shown inline. "Accept into
    production" moves it to the next stage.
  - `/production` — accepted orders only, also auto-polling, advances
    In Production → Quality Check → Ready → Completed.
  - `/orders/[reference]` — customer-facing live tracking page, polls every 8s.
  - All three verified end-to-end via real API calls: order created →
    appears in incoming-orders → accepted → appears in production →
    disappears from incoming-orders.
- **Documentation / catalogue publishing** (`/documentation`) — staff upload
  a photo + name + category + price + artisan (materials/dimensions/
  description/days are optional, collapsed by default — kept deliberately
  short per client feedback that the form had too many required fields for
  a live demo). Publish creates a real `Product` row, live on the
  marketplace immediately. Verified by publishing a test product and
  confirming it appeared in `/api/products` and its `/product/[id]` page.
- **`/staff`** — a single hub linking all four staff tools (incoming orders,
  production, documentation, exhibition QR). Gated by a lightweight
  client-side-only sign-in (`/staff/login` — name + role, stored in
  `localStorage`, no password). This is **not real auth/RBAC** — it exists
  only so staff actions are attributed to a name in the activity log and the
  demo looks intentional, not so anyone is actually locked out. Real RBAC is
  still on the not-built list below.
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
- **QA approval gate before publish** — `/documentation` publishes a new
  product immediately, live, with no review step
- **Real role-based access control** — the `/staff/login` name+role picker is
  client-side only (`localStorage`, no password, no server-side check);
  anyone with the URL can still reach every staff screen. Real RBAC with
  actual auth is still not built.
- **Real payment integration** (M-Pesa/card are simulated UX only)
- **"See it on you" model-wearing preview** on `/design` — explicitly
  skipped, see above
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

AI design generation (with its richer tile-based UI), the Incoming
Orders → Production pipeline, the Documentation photo-upload-to-catalogue
flow, and a lightweight staff sign-in are all done, deployed, and verified
live. **Currently mid-deploy**: the last push (commit introducing the
redesigned `/design` page) was showing stale content on the live server
even after `git pull` + `docker-compose build app` + `up -d` — confirmed via
direct `curl` to the container (bypassing Cloudflare) and confirmed the
source file on disk was correct, so the Docker build cache was the likely
culprit. Was about to run `docker-compose build --no-cache app` to force a
clean rebuild when this handoff was written — **verify that resolved it
first**, and if not, dig further into why Docker's layer cache didn't
invalidate on a changed `COPY . .` source file.

Next pieces from the client's full vision, not yet started:

1. **QA approval gate** — `/documentation` publishes immediately; needs a
   review/approve step before a new product goes live.
2. **Real RBAC** — replace the client-side-only `/staff/login` name+role
   picker with actual server-side auth, so staff screens are genuinely
   gated, not just self-reported.
3. **Artisan groups/unique IDs + earnings attribution**, and **real payment
   integration** — both still open from before.
