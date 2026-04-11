# Sowo Design System v1.0

Full UI specification for the Sowo platform.

## Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `--g` | `#085041` | Sowo Green — primary brand, provider colour |
| `--gm` | `#1D9E75` | Craft Teal — CTAs, links, actions |
| `--gl` | `#9FE1CB` | Light Vouch — text on green backgrounds |
| `--gs` | `#E1F5EE` | Provider Surface — provider badges, success |
| `--a` | `#EF9F27` | Sowo Amber — logo accent, consumer colour |
| `--as-bg` | `#FEF3E0` | Consumer Surface — consumer badges, pending |
| `--ad` | `#8B5E0A` | Amber Dark — text on amber surfaces |
| `--bk` | `#0A0A0A` | Near Black — platform base, body text |
| `--cr` | `#F5F0E8` | Warm Cream — hero backgrounds |
| `--t1` | `#0A0A0A` | Text Primary |
| `--t2` | `#555555` | Text Secondary |
| `--t3` | `#999999` | Text Tertiary — labels, timestamps |
| `--bd` | `#E0E0E0` | Border — card borders, dividers |
| `--sf` | `#F5F5F5` | Surface Grey — inputs, chips |

> **Rule:** Flat colours only. No gradients, shadows, blur, or decorative textures anywhere.

---

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Wordmark | Georgia serif | 22–32px | 700 |
| Display | Inter | 28px | 700 |
| H1 Screen title | Inter | 22px | 600 |
| H2 Section header | Inter | 18px | 600 |
| H3 Card title | Inter | 15px | 600 |
| Body strong | Inter | 14px | 500 |
| Body regular | Inter | 14px | 400 |
| Small / caption | Inter | 13px | 400 |
| Label / eyebrow | Inter | 11px | 600 uppercase |
| Vouch quotes | Georgia italic | 13px | 400 |

---

## Spacing Scale (8px base grid)

`4px` · `8px` · `12px` · `16px` · `20px` · `24px` · `32px` · `40px` · `48px` · `56px`

---

## Border Radius

| Token | Value | Used on |
|---|---|---|
| `radius-sm` | `6px` | Tags, small badges |
| `radius-md` | `10px` | Inputs, buttons, small cards |
| `radius-lg` | `14px` | Provider cards, booking cards |
| `radius-xl` | `20px` | Hero panels |
| `radius-full` | `999px` | Pills, filter chips, avatars |

---

## Components

- Primary Button (green, provider actions)
- Consumer Button (amber, booking/payment)
- Ghost Button (secondary actions)
- Destructive Button (cancel, dispute)
- Provider Card
- Vouch Card
- Input Field
- Search Bar
- Filter Chips
- Avatar (5 sizes: 18px–64px)
- Badge / Tag / Pill
- Toggle Switch
- Radio Selector
- Star Rating
- Navigation Bar
- Tab Bar (consumer + provider variants)

---

## User Roles

| | Consumer | Provider |
|---|---|---|
| Colour | `#EF9F27` Amber | `#085041` Green |
| CTA | Book, Pay, Confirm | Accept, Complete, Earn |
| Badge | `#FEF3E0` bg, `#8B5E0A` text | `#E1F5EE` bg, `#085041` text |
| Avatar ring | `2px #EF9F27` | `2px #1D9E75` |
