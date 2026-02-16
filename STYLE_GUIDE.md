# GeoJournal Style Guide

A visual design system for the GeoJournal app — a geographical journal with an earthy, oceanic aesthetic.

**Live preview:** run `npm run dev` and visit `/styleGuide`.

---

## Styling Setup

We use **Tailwind CSS v4** with a single global CSS file. All styling configuration lives in two files:

| File | What it does |
|---|---|
| `src/index.css` | Imports Tailwind, defines the design tokens (colors, fonts), and sets base styles. This is the single source of truth. |
| `postcss.config.js` | Wires the Tailwind PostCSS plugin into Vite's build. You should not need to touch this. |

All component styling is done with **Tailwind utility classes directly in JSX** — no per-component `.css` files.

### `src/index.css` Structure

The file has three sections:

**1. Imports** — loads Tailwind and Google Fonts (Inter + Merriweather).

**2. `@theme { ... }`** — defines design tokens as CSS variables. Each variable automatically generates Tailwind utility classes:

| You write in `@theme` | You get in JSX |
|---|---|
| `--color-ocean-600: #2478A0` | `bg-ocean-600`, `text-ocean-600`, `border-ocean-600`, etc. |
| `--font-heading: "Merriweather", ...` | `font-heading` |

**3. `@layer base { ... }`** — sets global defaults (page background, heading fonts) that apply everywhere unless overridden by a utility class.

### How to Extend

**Add a color** — add a `--color-{name}-{shade}` variable inside `@theme`:

```css
@theme {
  --color-sunset-400: #E87040;
}
```

Then use `bg-sunset-400`, `text-sunset-400`, etc. immediately. No restart needed.

**Add a font** — add the Google Fonts `@import` at the top, then add `--font-{name}` inside `@theme`.

---

## Color Palette

### Ocean (Primary)

Navigation, buttons, links, interactive elements.

| Token | Hex | Use |
|---|---|---|
| `ocean-50` | `#EBF5FB` | Lightest backgrounds, subtle tints |
| `ocean-100` | `#D1EAF5` | Card backgrounds, hover states |
| `ocean-200` | `#A3D5EB` | Borders, focus rings |
| `ocean-400` | `#4BA3C7` | Links, interactive elements |
| `ocean-600` | `#2478A0` | Primary buttons, navbar |
| `ocean-800` | `#14506E` | Button hover, dark accents |
| `ocean-900` | `#0B3345` | Headings, strong text |

### Sand (Warm Neutral)

Page backgrounds, borders, muted UI.

| Token | Hex | Use |
|---|---|---|
| `sand-50` | `#FDF8F0` | Main page background |
| `sand-100` | `#F5EDDE` | Secondary card fills, warning backgrounds |
| `sand-200` | `#E8D9C0` | Input/card borders, dividers |
| `sand-300` | `#D4BF9A` | Placeholder text |
| `sand-500` | `#B09468` | Icon accents, muted labels |

### Forest (Success)

Success states, confirmations, "visited" badges.

| Token | Hex | Use |
|---|---|---|
| `forest-50` | `#EEF5F0` | Alert background |
| `forest-100` | `#D4E8D9` | Banner fill |
| `forest-400` | `#5B9E6F` | Body text |
| `forest-600` | `#3D7A50` | Buttons, badges |
| `forest-800` | `#2A5738` | Heading text |

### Earth (Warm Accent)

Secondary buttons, tags, decorative highlights.

| Token | Hex | Use |
|---|---|---|
| `earth-400` | `#A67C52` | "Favorite" badge, icon accents |
| `earth-600` | `#7A5A3A` | Secondary button border/text |

### Coral (Error)

Error messages, alerts, destructive actions.

| Token | Hex | Use |
|---|---|---|
| `coral-400` | `#D96B5A` | Error body text |
| `coral-600` | `#B8453A` | Delete buttons, error headings |

---

## Typography

| Role | Font | Tailwind Class | Weight |
|---|---|---|---|
| Headings (h1-h4) | Merriweather (serif) | `font-heading` | `font-bold` or `font-semibold` |
| Body / UI | Inter (sans-serif) | `font-body` | `font-normal` or `font-medium` |

### Scale

| Element | Classes |
|---|---|
| Page title (h1) | `text-3xl md:text-4xl font-bold` |
| Section heading (h2) | `text-2xl font-semibold` |
| Subsection (h3) | `text-xl font-semibold` |
| Body | `text-base font-normal` |
| Small / Caption | `text-sm text-neutral-500` |
| Label | `text-sm font-medium` |
| Button text | `text-sm font-semibold` |

---

## Component Patterns

### Buttons

```jsx
{/* Primary */}
<button className="bg-ocean-600 hover:bg-ocean-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
  Save Entry
</button>

{/* Secondary */}
<button className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
  Cancel
</button>

{/* Success */}
<button className="bg-forest-600 hover:bg-forest-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
  Mark as Visited
</button>

{/* Destructive */}
<button className="bg-coral-600 hover:bg-coral-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
  Delete Entry
</button>

{/* Disabled (any variant) — add opacity-50 cursor-not-allowed */}
```

### Form Inputs

```jsx
<label className="block text-sm font-medium text-neutral-800 mb-1.5">
  Location Name
</label>
<input
  className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white
             placeholder-sand-300 text-neutral-800
             focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400
             transition-colors"
  placeholder="e.g. Kyoto, Japan"
/>
```

### Cards

```jsx
<div className="bg-white border border-sand-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
  <h3 className="text-lg font-semibold mb-2">Kyoto, Japan</h3>
  <p className="text-sm text-neutral-500 mb-4">Journal entry text...</p>
  <span className="text-xs bg-forest-50 text-forest-600 px-2.5 py-1 rounded-full font-medium">
    Visited
  </span>
</div>
```

### Badges

```jsx
<span className="text-xs bg-forest-50 text-forest-600 px-3 py-1.5 rounded-full font-medium">Visited</span>
<span className="text-xs bg-ocean-50 text-ocean-600 px-3 py-1.5 rounded-full font-medium">Planned</span>
<span className="text-xs bg-earth-400/15 text-earth-600 px-3 py-1.5 rounded-full font-medium">Favorite</span>
<span className="text-xs bg-coral-400/10 text-coral-600 px-3 py-1.5 rounded-full font-medium">Cancelled</span>
```

### Alerts

```jsx
{/* Success */}
<div className="flex items-start gap-3 bg-forest-50 border border-forest-100 rounded-lg p-4">
  <span className="text-forest-600 text-lg">&#10003;</span>
  <div>
    <p className="text-sm font-semibold text-forest-800">Entry saved</p>
    <p className="text-sm text-forest-600">Your journal entry has been saved.</p>
  </div>
</div>

{/* Error */}
<div className="flex items-start gap-3 bg-coral-400/10 border border-coral-400/20 rounded-lg p-4">
  <span className="text-coral-600 text-lg">&#10007;</span>
  <div>
    <p className="text-sm font-semibold text-coral-600">Login failed</p>
    <p className="text-sm text-coral-400">Invalid email or password.</p>
  </div>
</div>
```

### Navbar

```jsx
<nav className="bg-ocean-600 shadow-md">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <span className="text-white font-heading text-xl font-bold">GeoJournal</span>
    <div className="flex items-center gap-6">
      <a className="text-ocean-100 hover:text-white text-sm font-medium transition-colors">Home</a>
      <a className="text-white text-sm font-medium border-b-2 border-sand-200 pb-0.5">Journal</a>
    </div>
  </div>
</nav>
```

---

## Spacing & Border Radius

| Element | Border Radius | Padding |
|---|---|---|
| Buttons | `rounded-lg` (8px) | `px-5 py-2.5` |
| Inputs | `rounded-lg` (8px) | `px-4 py-2.5` |
| Cards | `rounded-xl` (12px) | `p-5` or `p-6` |
| Modals / Panels | `rounded-2xl` (16px) | `p-6` or `p-8` |
| Badges | `rounded-full` | `px-2.5 py-1` |

Page container pattern:

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* page content */}
</div>
```

---

## Editor Note

Your editor may show a warning on `@theme` (e.g. "Unknown at rule @theme"). This is not an error — the build handles it correctly. Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension to suppress it and get autocomplete for your custom tokens.
