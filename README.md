# Sowo — Trusted hands, near you.

> Connecting people with skilled, vouched-for craftspeople in their community. No algorithms. No fake reviews. Just trusted hands.

**Live site → [usesowo.com](https://usesowo.com)**

---

## What is Sowo?

Sowo (pronounced *"Soh-wo"*) is inspired by the Yoruba concept *Ise Owo* — meaning skilled work, craftsmanship, and practical services done by trusted hands. Sowo is a skills marketplace built for diaspora communities, replacing anonymous star ratings with a real community vouch system.

---

## Repo Structure

```
sowo/
├── frontend/               # All client-side code
│   ├── index.html          # Main website
│   ├── css/
│   │   └── styles.css      # All styles and design tokens
│   ├── js/
│   │   └── main.js         # Interactions, animations, nav
│   └── assets/
│       ├── images/         # Photography and illustrations
│       └── icons/          # SVG icons
├── backend/                # API and server (v2.0)
│   └── README.md           # Planned API endpoints and stack
├── docs/                   # Documentation
│   ├── DESIGN_SYSTEM.md    # Colours, typography, components
│   └── ROADMAP.md          # Product roadmap
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Hosting | Vercel |
| Domain | usesowo.com |
| Design system | Sowo UI Specification v1.0 |
| Backend (planned) | Node.js, Express, PostgreSQL |
| Payments (planned) | Stripe escrow |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/usesowo/sowo.git
cd sowo

# Open locally — no build step needed
open frontend/index.html
```

---

## Deployment

The site deploys automatically via **Vercel** on every push to `main`.

Vercel root directory is set to `frontend/`.

---

## Design System

See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) for the full colour tokens, typography scale, spacing system, and component specs.

| Token | Value | Role |
|---|---|---|
| Primary green | `#085041` | Provider colour, brand |
| Amber | `#EF9F27` | Consumer colour, logo accent |
| Near black | `#0A0A0A` | Base, headlines |
| Warm cream | `#F5F0E8` | Hero backgrounds |

> Flat colours only — no gradients, shadows, or blur anywhere.

---

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full product roadmap.

- ✅ v1.0 — Marketing site live
- ⬜ v1.5 — Waitlist and onboarding
- ⬜ v2.0 — Core platform MVP
- ⬜ v3.0 — Mobile app
- ⬜ v4.0 — Growth and community features

---

## Brand Values

| Value | In the product |
|---|---|
| Trust over transaction | Vouching replaces anonymous ratings |
| Craft deserves dignity | Zero commission, first 3 months |
| Community is the product | Social discovery, not algorithmic |
| Practical, not performative | No fake urgency, no inflated ratings |
| Globally minded, locally rooted | Built for diaspora communities |

---

*Committed by [teetohdev](https://github.com/teetohdev).*
