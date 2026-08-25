# Campus Connect Hub

Build: RExchange

Campus Trust & Resource Network

Concept

A campus platform solving a trust problem, not just a discovery problem. Students already know WHERE to post things (WhatsApp groups, noticeboards) — what's missing is a reason to trust a stranger, a way to find what they need before asking, and a place to get help fast. RExchange combines resource exchange, visible trust signals, community help, and event awareness in one campus-first platform.

Build Priority (STRICT ORDER — build and verify each phase before starting the next)

PHASE 1 — CORE (must be fully working before anything else)

1. Listing Feed — card grid: title, category tag/icon, description, poster name, branch/year, trust tier badge (New / Trusted / Campus Regular based on a demo exchangeCount field).

2. Post Form — toggle "I'm Offering" / "I'm Requesting". Fields: title, category (Item/Service/Notes/Lend/Request), description, name, branch/year, contact. On submit, appears in feed immediately.

3. Category Filters — All / Item / Service / Notes / Lend / Request.

4. Offer vs Request visual distinction — Offers: solid card style. Requests: dashed border, "Looking for" framing.

5. Seed data — 8-10 pre-populated listings, mixed types and trust tiers, so the app looks alive immediately.

Data model: Firebase Firestore, `listings` collection — title, category, type (offer/request), description, posterName, posterYear, exchangeCount, trustTier, timestamp. No auth required.

PHASE 2 — SMART MATCHING (build only after Phase 1 is confirmed working)

6. Live match suggestions — as a user types a Request (in the post form or on Request cards), show existing Offers that share keywords (client-side string matching, no external API — keep this fast and dependency-free).

PHASE 3 — COMMUNITY (build only after Phase 2 is confirmed working)

7. Need Board — a separate tab: flat community help thread. Students post open asks (e.g. "Need extension help"), others reply inline (no nesting). Simple, functional over decorative.

8. Notification bell — users add keywords to a personal watchlist (Firestore); badge count increments when a new listing/post matches a watched keyword.

PHASE 4 — EVENTS (stretch — only if time/generation budget allows)

9. Events tab — simple list/calendar of upcoming campus events (title, date, category like Robotics/Career/Social) with an "I'm interested" button per event.

OUT OF SCOPE for this build (note as "designed for future upgrade" in a comment, do not attempt)

- Image upload / Firebase Storage

- Real-time chat / AI-powered chat assistant

- Multi-party barter chain matching (A→B→C loops)

- Real push notifications

- Full auth/login system

Design Direction

- Premium, warm, community-driven feel — not a generic marketplace clone or plain student project.

- Palette: warm terracotta/sand tones, deep forest green accent.

- Card-based grid, rounded corners, soft shadows, generous whitespace, fully mobile-responsive.

- Trust tier badges and offer/request card distinction are the two visual signatures — make them unmissable.

Critical Build Instructions

- Build and confirm each phase works before moving to the next — do not attempt all phases simultaneously.

- If a phase fails or times out, stop there — leave all previously completed phases untouched and working.

- Prioritize a fully functional Phase 1+2 over a broken Phase 3+4.

- Use Firestore for all persistent data. No hardcoded API keys — use environment variables.

Build now, starting with Phase 1.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rexchange.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/273a6d65-8ea9-417b-a171-30cb8a27ff0f).

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
