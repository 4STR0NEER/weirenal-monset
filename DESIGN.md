# Design: Calm clinical

Light blue gradient + white, airy and serene, readable at a glance between patients. Tokens live in `src/styles.css` (`:root`); never hard-code a color.

## Color (oklch, restrained)
- Ground `--ground` near-white blue; surfaces pure white; `--surface-2` for hovers and quiet fills.
- Ink `--ink` (text), `--ink-2` (secondary, still ≥4.5:1). Hairlines `--line`, `--line-strong`.
- One accent family: `--brand`, `--brand-strong` (hover, links), `--brand-soft` (active nav, selected), `--brand-tint` (selection, borders).
- Meaning only: `--ok` (done, PhilHealth-covered), `--warn` (no-show, near cap, low stock, self-pay), `--danger` (hepatitis flags, errors). Each has a `-soft` fill.
- `--wash` is the brand gradient: landing hero, featured plan, auth, top of app content. Nowhere else.

## Type
Onest Variable (self-hosted via @fontsource). Display 650 weight, tracking -0.03em; body 15px/1.5; tables use tabular numerals.

## Shape and depth
Radii 10 (controls), 14 (rows/chips), 20 (cards), 28 (hero/auth), pills 999. Shadows always offset + soft blur (`--shadow-1`, `--shadow-2`). No colored left borders, no gradient text, no glyph icons: Lucide only.

## Components
- Buttons: pill, brand fill or ghost; `:active` scale 0.97; hover gated to fine pointers.
- Stat strip: one surface with dividers (`.stats` > `.stat`), never a grid of identical cards. Figures roll via `AnimatedNumber`.
- Status pills: dot + label, soft fill by meaning.
- Scheduler slots: soft fill + 1px border by status.
- Add-on quantities: Kokonut `QuantityStepper` (Add → − n +).
- Landing FAQ: adapted Vengeance `FaqAccordion`.

## Motion
Ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Page entrance 220ms fade + 6px rise, once per page. One hero moment: the year card's 156 sessions fill week by week. Everything respects `prefers-reduced-motion`.

## Third-party components (MIT)
`src/components/kokonutui/quantity-stepper.jsx` (Kokonut UI cart-button), `src/components/vengeance/animated-number.jsx` and `faq-accordion.jsx` (VengeanceUI). Tailwind v4 utilities only (no preflight) exist for these; app styles are plain CSS.
