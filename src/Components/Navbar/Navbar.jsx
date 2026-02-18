import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/map", label: "Map" },
  { to: "/leaderboard", label: "Leader Board" },
  { to: "/history", label: "Person History" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? "text-white border-b-2 border-sand-200 pb-0.5"
        : "text-ocean-100 hover:text-white"
    }`;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4">
      <nav className="bg-ocean-600 shadow-md rounded-2xl">
        <div className="px-6 flex items-center justify-between h-14">
          <NavLink to="/" className="text-white font-heading text-xl font-bold">
            GeoJournal
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={linkClass}>
                {label}
              </NavLink>
            ))}
            
            {localStorage.getItem("token") ? (
              <NavLink to="/history" className={linkClass}>
                Personal History
              </NavLink>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col gap-3">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={linkClass}
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navbar;
