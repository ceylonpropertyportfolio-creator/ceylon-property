# Design Brief

## Direction

Ceylon Estate Registry — a premium Sri Lankan property portfolio rendered as a warm, editorial real-estate registry: beige paper, white cards, one confident green, one quiet brown.

## Tone

Luxury/refined — generous whitespace, high-contrast serif headlines and a calm sans body give the public site the gravity of a printed property catalogue; the admin console stays a deliberately plain, dense, cool-grey tool.

## Differentiation

The beige "paper" field is the whole identity: every public surface sits on rich beige with white cards floating on it, so the site reads like a physical property register rather than a generic white SaaS page — and the admin console pointedly refuses the beige entirely.

## Color Palette

| Token       | OKLCH            | Role                                              |
| ----------- | ---------------- | ------------------------------------------------- |
| background  | 0.891 0.022 81.3 | Rich beige #E8DDCC — public page field            |
| foreground  | 0.247 0 0        | Dark #1F1F1F — all public text                    |
| card        | 1 0 0            | White #FFFFFF — property cards, panels, header    |
| primary     | 0.5163 0.1307 145.5 | Green #2E7D32 — CTAs, brand, links, admin rail |
| accent      | 0.635 0.0517 60.5 | Light brown #B08968 — price chips, secondary tags |
| secondary   | 0.945 0.016 81.3 | Pale beige — chips, wells, alt sections           |
| muted       | 0.938 0.014 81.3 | Section alternation, disabled surfaces            |
| success     | 0.5163 0.1307 145.5 | PUBLISHED / active status                      |
| warning     | 0.7 0.12 70      | UNPUBLISHED / draft status                        |
| destructive | 0.53 0.185 28    | Delete, validation errors                         |
| sidebar     | 0.215 0.008 250  | Admin console rail — cool neutral, NOT beige      |

## Typography

- Display: Fraunces — public hero, section headings, property titles, prices; `line-height 1.12`, `letter-spacing -0.015em`
- Body: Satoshi — paragraphs, nav, labels, forms, admin UI; `line-height 1.65`, `letter-spacing 0.005em`
- Mono: JetBrains Mono — admin IDs, enquiry counts, tabular prices
- Root `html` font-size raised to `17px`; body `text-base` is now `1.0625rem`
- Scale: hero `text-5xl md:text-7xl font-display font-semibold tracking-tight`, h2 `text-3xl md:text-4xl font-display`, h3 `text-2xl font-display`, label `text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground`, body `text-base md:text-lg`

## Elevation & Depth

Public surfaces layer beige field → white cards, `shadow-subtle` at rest and `shadow-elevated` on hover (neutral ink shadows, never coloured); admin console is flat with hairline `admin-border` and effectively no shadow.

## Structural Zones

| Zone           | Background                        | Border        | Notes                                                     |
| -------------- | --------------------------------- | ------------- | --------------------------------------------------------- |
| Public header  | `bg-card/90` backdrop-blur        | `border-b`    | Sticky, logo lockup left, green Contact pill right         |
| Public hero    | `bg-gradient-subtle` (beige)      | —             | Fraunces headline, brown eyebrow label, white search card  |
| Public content | `bg-background` / `bg-secondary/60` alternate | —  | White cards on beige, sections alternate                   |
| Public footer  | `bg-primary` (green #2E7D32)      | —             | White text, brown link hover, logo lockup repeated         |
| Admin shell    | `bg-sidebar` rail + `admin-surface` main | `admin-border` | Cool neutral rail, dense table area — no beige |
| Admin content  | `--admin-surface` (neutral 250)   | hairline      | Tables, filters, forms, status badges                      |

## Spacing & Rhythm

Public sections breathe at `py-20 md:py-28` with `gap-6 md:gap-8` card grids and `max-w-7xl` containers; admin is dense at `py-4`/`gap-3` with `text-sm` rows and `h-9` controls. Radii: `--radius: 0.875rem` → cards `rounded-2xl`, buttons `rounded-full` (public) / `rounded-md` (admin), inputs `rounded-lg`.

## Component Patterns

- Buttons: public — `rounded-full`, green primary / brown accent, white text, hover lifts to `shadow-elevated`; admin — `rounded-md`, neutral, compact `h-9`
- Cards: public property cards `rounded-2xl bg-card` white with photo top, title in Fraunces, price in Fraunces with a light-brown price chip; admin rows flat with hairline dividers
- Badges: pill `rounded-full` — green PUBLISHED, warning amber UNPUBLISHED, brown for price/category, muted for read
- Inputs: `rounded-lg` public / `rounded-md` admin, white fill on beige, green `ring` on focus

## Motion

- Entrance: `animate-fade-in-up` on hero and card grids, staggered via inline delay
- Hover: `transition-smooth` — cards lift to `shadow-elevated`, images `scale-105` over 0.5s
- Decorative: `animate-fade-in` on admin table rows, `shimmer` on upload progress; all disabled under `prefers-reduced-motion`

## Constraints

- Public and admin are separate routes with separate shells; never share a layout component
- Admin console uses cool neutral `--sidebar`/`--admin-surface` tokens, never the beige `--background`
- Only green `--primary` crosses both ends; beige and brown are public-only
- No raw hex/rgb in components — semantic tokens only; every token mapped with `oklch(var(--x) / <alpha-value>)`
- No horizontal overflow at 360 / 768 / 1280 px; no fixed-width content

## Signature Detail

The price treatment: property prices set in Fraunces over a soft light-brown chip, with the same brown reserved for price and category signals — a single warm thread that ties the beige field, the white cards and the green footer into one premium system.
