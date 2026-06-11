import { NavLink, Route, Routes } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import Evaluate from "./pages/Evaluate";
import History from "./pages/History";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Plans from "./pages/Plans";

const NAV = [
  { to: "/",            end: true,  label: "Dashboard"   },
  { to: "/evaluate",    end: false, label: "Evaluate"    },
  { to: "/history",     end: false, label: "History"     },
  { to: "/leaderboard", end: false, label: "Leaderboard" },
  { to: "/roadmap",     end: false, label: "Roadmap"     },
];

function SunIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={12} cy={12} r={5} />
      <line x1={12} y1={1} x2={12} y2={3} />
      <line x1={12} y1={21} x2={12} y2={23} />
      <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
      <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
      <line x1={1} y1={12} x2={3} y2={12} />
      <line x1={21} y1={12} x2={23} y2={12} />
      <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
      <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--pg-page)]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] [background:var(--pg-header)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-[11px] font-bold !text-white shadow-md shadow-violet-900/40">
              PG
            </div>
            <span className="text-sm font-semibold text-white">
              PromptGrade <span className="text-gray-500 font-normal">AI</span>
            </span>
          </NavLink>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-violet-600/20 text-violet-300 ring-1 ring-inset ring-violet-500/30"
                      : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-gray-400 transition-all duration-150 hover:bg-white/[0.06] hover:text-gray-200"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
            <span className="text-[11px] text-gray-600">v1.0</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/evaluate"    element={<Evaluate />} />
          <Route path="/history"     element={<History />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/roadmap"     element={<Plans />} />
        </Routes>
      </main>
    </div>
  );
}
