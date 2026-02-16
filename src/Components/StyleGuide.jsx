import { useState } from "react";

const COLOR_GROUPS = [
  {
    name: "Ocean",
    description: "Primary brand color — navigation, buttons, links, interactive elements",
    shades: [
      { name: "50", hex: "#EBF5FB", textDark: true },
      { name: "100", hex: "#D1EAF5", textDark: true },
      { name: "200", hex: "#A3D5EB", textDark: true },
      { name: "400", hex: "#4BA3C7", textDark: false },
      { name: "600", hex: "#2478A0", textDark: false },
      { name: "800", hex: "#14506E", textDark: false },
      { name: "900", hex: "#0B3345", textDark: false },
    ],
  },
  {
    name: "Sand",
    description: "Warm neutral — page backgrounds, card fills, borders, muted UI",
    shades: [
      { name: "50", hex: "#FDF8F0", textDark: true },
      { name: "100", hex: "#F5EDDE", textDark: true },
      { name: "200", hex: "#E8D9C0", textDark: true },
      { name: "300", hex: "#D4BF9A", textDark: true },
      { name: "500", hex: "#B09468", textDark: false },
    ],
  },
  {
    name: "Forest",
    description: "Success, positive states — visited badges, confirmations",
    shades: [
      { name: "50", hex: "#EEF5F0", textDark: true },
      { name: "100", hex: "#D4E8D9", textDark: true },
      { name: "400", hex: "#5B9E6F", textDark: false },
      { name: "600", hex: "#3D7A50", textDark: false },
      { name: "800", hex: "#2A5738", textDark: false },
    ],
  },
  {
    name: "Earth",
    description: "Warm accent — secondary buttons, tags, decorative elements",
    shades: [
      { name: "400", hex: "#A67C52", textDark: false },
      { name: "600", hex: "#7A5A3A", textDark: false },
    ],
  },
  {
    name: "Coral",
    description: "Error, destructive — error messages, alerts, delete actions",
    shades: [
      { name: "400", hex: "#D96B5A", textDark: false },
      { name: "600", hex: "#B8453A", textDark: false },
    ],
  },
];

function ColorSwatch({ shade, groupName }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-xl shadow-sm border border-sand-200/50 transition-transform hover:scale-105"
        style={{ backgroundColor: shade.hex }}
      />
      <p className="mt-2 text-sm font-medium text-neutral-800">
        {shade.name}
      </p>
      <p className="text-xs text-neutral-500 font-mono">{shade.hex}</p>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      {description && (
        <p className="text-neutral-500 mb-6 text-sm">{description}</p>
      )}
      {children}
    </section>
  );
}

export default function StyleGuide() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-semibold text-ocean-600 tracking-wide uppercase mb-2">
          Design System
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">
          GeoJournal Style Guide
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl">
          A visual reference for all design tokens, typography, and UI
          components used across the GeoJournal application. Earthy tones meet
          ocean blues.
        </p>
      </div>

      {/* ─── Colors ─── */}
      <Section
        title="Color Palette"
        description="Custom semantic color tokens defined in tailwind.config.js"
      >
        <div className="space-y-10">
          {COLOR_GROUPS.map((group) => (
            <div key={group.name}>
              <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
              <p className="text-sm text-neutral-500 mb-4">
                {group.description}
              </p>
              <div className="flex flex-wrap gap-4">
                {group.shades.map((shade) => (
                  <ColorSwatch
                    key={shade.name}
                    shade={shade}
                    groupName={group.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── Typography ─── */}
      <Section
        title="Typography"
        description='Headings use Merriweather (serif), body uses Inter (sans-serif)'
      >
        <div className="space-y-6 bg-white rounded-2xl border border-sand-200 p-8">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              h1 &middot; font-heading &middot; text-3xl md:text-4xl &middot; bold
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              Explore the World, One Entry at a Time
            </h1>
          </div>
          <hr className="border-sand-100" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              h2 &middot; font-heading &middot; text-2xl &middot; semibold
            </p>
            <h2 className="text-2xl font-semibold">Your Travel Journal</h2>
          </div>
          <hr className="border-sand-100" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              h3 &middot; font-heading &middot; text-xl &middot; semibold
            </p>
            <h3 className="text-xl font-semibold">Recent Destinations</h3>
          </div>
          <hr className="border-sand-100" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              Body &middot; font-body &middot; text-base &middot; normal
            </p>
            <p className="text-base font-body">
              GeoJournal helps you document the places you have visited, write
              journal entries about your experiences, and build a personal map
              of your travels across the globe.
            </p>
          </div>
          <hr className="border-sand-100" />
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
              Small / Caption &middot; font-body &middot; text-sm
            </p>
            <p className="text-sm text-neutral-500">
              Last updated 3 days ago &middot; 12 entries
            </p>
          </div>
        </div>
      </Section>

      {/* ─── Buttons ─── */}
      <Section
        title="Buttons"
        description="Primary, secondary, success, and destructive button variants"
      >
        <div className="bg-white rounded-2xl border border-sand-200 p-8 space-y-8">
          {/* Primary */}
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Primary &middot; bg-ocean-600 hover:bg-ocean-800
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-ocean-600 hover:bg-ocean-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
                Save Entry
              </button>
              <button className="bg-ocean-600 hover:bg-ocean-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm">
                Log In
              </button>
              <button
                className="bg-ocean-600 text-white font-semibold px-5 py-2.5 rounded-lg opacity-50 cursor-not-allowed"
                disabled
              >
                Disabled
              </button>
            </div>
          </div>

          {/* Secondary */}
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Secondary &middot; border-earth-600 text-earth-600
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
                Cancel
              </button>
              <button className="border-2 border-earth-600 text-earth-600 hover:bg-earth-600 hover:text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm">
                Go Back
              </button>
            </div>
          </div>

          {/* Success */}
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Success &middot; bg-forest-600 hover:bg-forest-800
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-forest-600 hover:bg-forest-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
                Mark as Visited
              </button>
            </div>
          </div>

          {/* Destructive */}
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wide mb-3">
              Destructive &middot; bg-coral-600 hover:bg-coral-400
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-coral-600 hover:bg-coral-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200">
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Form Elements ─── */}
      <Section
        title="Form Elements"
        description="Inputs, labels, and field states"
      >
        <div className="bg-white rounded-2xl border border-sand-200 p-8 max-w-md space-y-6">
          {/* Text input */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Location Name
            </label>
            <input
              type="text"
              placeholder="e.g. Kyoto, Japan"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
            />
          </div>

          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
            />
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-sm font-medium text-neutral-800 mb-1.5">
              Journal Entry
            </label>
            <textarea
              rows={4}
              placeholder="Write about your experience..."
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors resize-y"
            />
          </div>

          {/* Disabled input */}
          <div>
            <label className="block text-sm font-medium text-neutral-500 mb-1.5">
              Disabled Field
            </label>
            <input
              type="text"
              value="Cannot edit"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-sand-50 text-neutral-400 cursor-not-allowed"
            />
          </div>
        </div>
      </Section>

      {/* ─── Cards ─── */}
      <Section
        title="Cards"
        description="Containers for journal entries, location info, and features"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Standard Card */}
          <div className="bg-white border border-sand-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold mb-2">Kyoto, Japan</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Visited the golden pavilion and walked through the bamboo forest.
              A truly magical experience.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-forest-50 text-forest-600 px-2.5 py-1 rounded-full font-medium">
                Visited
              </span>
              <span className="text-xs text-neutral-400">Dec 2025</span>
            </div>
          </div>

          {/* Ocean-tinted Card */}
          <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold mb-2">Santorini, Greece</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Blue-domed churches against the sunset. The caldera views were
              breathtaking.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-ocean-100 text-ocean-600 px-2.5 py-1 rounded-full font-medium">
                Planned
              </span>
              <span className="text-xs text-neutral-400">Spring 2026</span>
            </div>
          </div>

          {/* Earth-accent Card */}
          <div className="bg-sand-50 border border-sand-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h3 className="text-lg font-semibold mb-2">
              Marrakech, Morocco
            </h3>
            <p className="text-sm text-neutral-500 mb-4">
              The souks, the riads, the Atlas Mountains in the distance. An
              adventure for all senses.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-earth-400/15 text-earth-600 px-2.5 py-1 rounded-full font-medium">
                Favorite
              </span>
              <span className="text-xs text-neutral-400">Nov 2024</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Badges ─── */}
      <Section
        title="Badges & Tags"
        description="Status indicators for locations and entries"
      >
        <div className="bg-white rounded-2xl border border-sand-200 p-8">
          <div className="flex flex-wrap gap-3">
            <span className="text-xs bg-forest-50 text-forest-600 px-3 py-1.5 rounded-full font-medium">
              Visited
            </span>
            <span className="text-xs bg-ocean-50 text-ocean-600 px-3 py-1.5 rounded-full font-medium">
              Planned
            </span>
            <span className="text-xs bg-earth-400/15 text-earth-600 px-3 py-1.5 rounded-full font-medium">
              Favorite
            </span>
            <span className="text-xs bg-coral-400/10 text-coral-600 px-3 py-1.5 rounded-full font-medium">
              Cancelled
            </span>
            <span className="text-xs bg-sand-100 text-sand-500 px-3 py-1.5 rounded-full font-medium">
              Draft
            </span>
            <span className="text-xs bg-ocean-100 text-ocean-800 px-3 py-1.5 rounded-full font-medium">
              Country
            </span>
            <span className="text-xs bg-forest-100 text-forest-800 px-3 py-1.5 rounded-full font-medium">
              State
            </span>
            <span className="text-xs bg-sand-100 text-earth-600 px-3 py-1.5 rounded-full font-medium">
              City
            </span>
          </div>
        </div>
      </Section>

      {/* ─── Alerts ─── */}
      <Section
        title="Alerts & Feedback"
        description="Success, error, warning, and info messages"
      >
        <div className="space-y-4 max-w-xl">
          {/* Success */}
          <div className="flex items-start gap-3 bg-forest-50 border border-forest-100 rounded-lg p-4">
            <span className="text-forest-600 text-lg leading-none mt-0.5">
              &#10003;
            </span>
            <div>
              <p className="text-sm font-semibold text-forest-800">
                Entry saved
              </p>
              <p className="text-sm text-forest-600">
                Your journal entry for Kyoto has been saved successfully.
              </p>
            </div>
          </div>

          {/* Error */}
          <div className="flex items-start gap-3 bg-coral-400/10 border border-coral-400/20 rounded-lg p-4">
            <span className="text-coral-600 text-lg leading-none mt-0.5">
              &#10007;
            </span>
            <div>
              <p className="text-sm font-semibold text-coral-600">
                Login failed
              </p>
              <p className="text-sm text-coral-400">
                Invalid email or password. Please try again.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 bg-ocean-50 border border-ocean-200 rounded-lg p-4">
            <span className="text-ocean-600 text-lg leading-none mt-0.5">
              &#9432;
            </span>
            <div>
              <p className="text-sm font-semibold text-ocean-800">
                Did you know?
              </p>
              <p className="text-sm text-ocean-600">
                You have visited 12 countries so far. Keep exploring!
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-sand-100 border border-sand-200 rounded-lg p-4">
            <span className="text-earth-400 text-lg leading-none mt-0.5">
              &#9888;
            </span>
            <div>
              <p className="text-sm font-semibold text-earth-600">
                Unsaved changes
              </p>
              <p className="text-sm text-sand-500">
                You have unsaved changes. Are you sure you want to leave?
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Navbar Preview ─── */}
      <Section
        title="Navbar"
        description="Top navigation bar — bg-ocean-600, white text, shadow-md"
      >
        <div className="rounded-2xl overflow-hidden border border-sand-200">
          <nav className="bg-ocean-600 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
              <span className="text-white font-heading text-xl font-bold">
                GeoJournal
              </span>
              <div className="flex items-center gap-6">
                <a
                  href="#"
                  className="text-ocean-100 hover:text-white text-sm font-medium transition-colors"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-white text-sm font-medium border-b-2 border-sand-200 pb-0.5"
                >
                  Journal
                </a>
                <a
                  href="#"
                  className="text-ocean-100 hover:text-white text-sm font-medium transition-colors"
                >
                  Map
                </a>
                <a
                  href="#"
                  className="text-ocean-100 hover:text-white text-sm font-medium transition-colors"
                >
                  Leaderboard
                </a>
              </div>
            </div>
          </nav>
        </div>
      </Section>

      {/* ─── Login Card Preview ─── */}
      <Section
        title="Login Card"
        description="Centered auth form — white card, rounded-2xl, shadow-lg on sand-50"
      >
        <div className="flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-sand-200 p-8">
            <h2 className="text-2xl font-bold text-center mb-6">
              Welcome Back
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-lg border border-sand-200 bg-white placeholder-sand-300 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ocean-200 focus:border-ocean-400 transition-colors"
                />
              </div>
              <button className="w-full bg-ocean-600 hover:bg-ocean-800 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200">
                Log In
              </button>
            </div>
            <p className="text-center text-sm text-neutral-500 mt-4">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-ocean-400 hover:text-ocean-600 font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </Section>

      {/* ─── Spacing & Radius ─── */}
      <Section
        title="Spacing & Border Radius"
        description="Visual reference for consistent spacing and corner rounding"
      >
        <div className="bg-white rounded-2xl border border-sand-200 p-8">
          <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
          <div className="flex flex-wrap items-end gap-6 mb-8">
            {[
              { label: "rounded-lg (8px)", cls: "rounded-lg" },
              { label: "rounded-xl (12px)", cls: "rounded-xl" },
              { label: "rounded-2xl (16px)", cls: "rounded-2xl" },
              { label: "rounded-full", cls: "rounded-full" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 bg-ocean-100 border-2 border-ocean-400 ${item.cls}`}
                />
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mb-4">Usage Map</h3>
          <div className="overflow-x-auto">
            <table className="text-sm w-full text-left">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="py-2 pr-4 font-semibold text-neutral-800">
                    Element
                  </th>
                  <th className="py-2 pr-4 font-semibold text-neutral-800">
                    Radius
                  </th>
                  <th className="py-2 font-semibold text-neutral-800">
                    Padding
                  </th>
                </tr>
              </thead>
              <tbody className="text-neutral-600">
                <tr className="border-b border-sand-100">
                  <td className="py-2 pr-4">Buttons</td>
                  <td className="py-2 pr-4 font-mono text-xs">rounded-lg</td>
                  <td className="py-2 font-mono text-xs">px-5 py-2.5</td>
                </tr>
                <tr className="border-b border-sand-100">
                  <td className="py-2 pr-4">Inputs</td>
                  <td className="py-2 pr-4 font-mono text-xs">rounded-lg</td>
                  <td className="py-2 font-mono text-xs">px-4 py-2.5</td>
                </tr>
                <tr className="border-b border-sand-100">
                  <td className="py-2 pr-4">Cards</td>
                  <td className="py-2 pr-4 font-mono text-xs">rounded-xl</td>
                  <td className="py-2 font-mono text-xs">p-5 or p-6</td>
                </tr>
                <tr className="border-b border-sand-100">
                  <td className="py-2 pr-4">Modals / Panels</td>
                  <td className="py-2 pr-4 font-mono text-xs">rounded-2xl</td>
                  <td className="py-2 font-mono text-xs">p-6 or p-8</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">Badges</td>
                  <td className="py-2 pr-4 font-mono text-xs">rounded-full</td>
                  <td className="py-2 font-mono text-xs">px-2.5 py-1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="mt-8 pt-8 border-t border-sand-200 text-center">
        <p className="text-sm text-neutral-400">
          GeoJournal Design System &middot; Built with Tailwind CSS
        </p>
      </footer>
    </div>
  );
}
