# Flow Design System

Source: Shared by Colin Reed (2026-03-20). These are the design and data rules used in the Flow Intranet. Apply when producing any Flow-branded HTML, UI mockups, or dashboard output.

---

## Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Moonlight | `#F3EDDF` | Backgrounds, cards, muted surfaces |
| Midnight | `#3D3D3D` | Primary text, headers (dark charcoal, NOT blue) |
| Sunlight | `#E89700` | CTAs, highlights, accent, pill badges |
| Heart | `#F99AA9` | Soft warm pink accent |
| Ocean Swell | `#7DADBB` | Secondary accent, cool balance |
| Olive | `#767317` | Earthy accent, totals in charts |
| Roots | `#8C4500` | Warm brown, negative values, hover states |

- Page background: `#EDE8DA` with subtle radial gradients
- No generic "tech" blue anywhere
- Text: Midnight on light backgrounds, never pure black

## Fonts

- **Roughwell** — display headlines (~28–34px)
- **Generation 1970** — subheaders, card titles, section labels
- **Poppins** — body text, all other UI

## Tone

- First-person plural (we, us). No exclamation points. No emojis. Oxford comma.
- Positive, approachable, elevated, authentic.
- Negatives always in parentheses: ($3.2M) not -$3.2M.

## Component Conventions

### Cards

```
rounded-xl border border-border bg-card text-card-foreground
shadow-[0_1px_3px_rgba(61,61,61,0.04),0_8px_32px_rgba(61,61,61,0.06)]
```

- CardTitle uses Generation 1970 font
- Hover: `hover:border-primary hover:shadow-[0_2px_8px_rgba(232,151,0,0.12)]`
- Accent strips: `h-[2px] bg-primary/25 rounded-full`

### Buttons

- default: sunlight background, white text, roots hover
- outline: white card with border, fills sunlight on hover
- ghost: transparent, moonlight hover

### Badges

- Base: `rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider`
- Variants: default (sunlight), secondary (moonlight), ocean (teal), muted, outline, destructive

## Page Layout

- Max width: `max-w-[1400px] mx-auto px-4 sm:px-6`
- Sticky header: `sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border`
- Page title: Roughwell, 28–34px
- Section titles: Generation 1970, 15px, muted-foreground, tracking-wide
- Content grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Section spacing: `space-y-6` or `py-6`

## Table Styling

- Header background: `#F0EBE0` (warm cream, NOT dark/solid)
- Header bottom border: `1.5px solid rgba(61,61,61,0.15)`
- Alternating rows: `rgba(243, 237, 223, 0.3)` on even rows
- Total rows: bold, `rgba(232, 151, 0, 0.06)` background, `1.5px solid rgba(61,61,61,0.2)` top border
- Negative values: `color: #8C4500` (Roots)
- Sticky first column for row labels on wide tables
- Cell padding: 6–7px 12–14px

## Chart Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Sunlight | `#E89700` | Positive values, highlights |
| Olive | `#767317` | Totals (beginning/ending bars in waterfalls) |
| Ocean Swell | `#7DADBB` | Primary data series |
| Roots | `#8C4500` | Negatives, decreases |
| Heart | `#F99AA9` | Secondary accent series |
| Midnight | `#3D3D3D` | Neutral bars, axis text |

Chart conventions:
- Hide value axis on bar/waterfall charts; show data labels directly on bars
- Negatives in parentheses on labels

## Motion & Transitions

- Entering elements: `cubic-bezier(0.25, 1, 0.5, 1)` (quart-out)
- Leaving elements: `cubic-bezier(0.7, 0, 0.84, 0)` (ease-in)
- State toggles: `cubic-bezier(0.65, 0, 0.35, 1)` (ease-in-out)
- Only animate `transform` and `opacity`
- Always respect `prefers-reduced-motion`
- Stagger lists: `animation-delay: calc(var(--i, 0) * 50ms)`, cap at 500ms total

## Accessibility

- Focus ring: sunlight color, 2px thick, 2px offset via `:focus-visible`
- Minimum 44px touch targets
- Never rely on color alone — pair with icons, labels, or patterns
- `font-variant-numeric: tabular-nums` on all numeric columns

## Design Principles

- Warm, elevated, calm — not corporate or techy
- Subtle borders define cards more than shadows
- White cards on cream background, not the other way around
- Mobile-responsive on all pages
- Flow IS: Welcoming, Elevated, Authentic, Calm, Soulful
- Flow is NOT: Pretentious, Cheesy, Overbearing

## Package Manager (flow-intranet)

- **pnpm v10** exclusively. Never npm, npx, or yarn.
- `pnpm add` to install, `pnpm dev` / `pnpm build` to run
- `pnpm dlx` instead of `npx`
