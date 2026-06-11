import { NavLink, Route, Routes } from "react-router-dom";
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

export default function App() {
  return (
    <div className="min-h-screen bg-[#0d0d12]">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d0d12]/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 text-[11px] font-bold text-white shadow-md shadow-violet-900/40">
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

          {/* Status */}
          <div className="flex items-center gap-2">
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
