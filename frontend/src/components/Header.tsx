import { NavLink } from "react-router-dom";

function linkClass({ isActive }: { isActive: boolean }) {
  return `px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30"
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
  }`;
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg transform group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-indigo-500/30">
              ✓
            </div>
            <div className="hidden sm:block">
              <div className="gradient-text text-lg font-black">PromptGrade</div>
              <div className="text-xs text-slate-500 font-semibold">AI Governance</div>
            </div>
          </NavLink>

          {/* Navigation */}
          <nav className="flex items-center gap-2 bg-slate-800/50 rounded-full p-1.5 border border-slate-700/50">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/evaluate" className={linkClass}>
              Evaluate
            </NavLink>
            <NavLink to="/history" className={linkClass}>
              History
            </NavLink>
            <NavLink to="/leaderboard" className={linkClass}>
              Leaderboard
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
