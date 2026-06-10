import { NavLink, Route, Routes } from "react-router-dom";
import Evaluate from "./pages/Evaluate";
import History from "./pages/History";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";

function linkClass({ isActive }: { isActive: boolean }) {
  return `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <NavLink to="/" className="text-xl font-extrabold text-indigo-700">PromptGrade AI</NavLink>
          <div className="flex gap-2"><NavLink to="/" className={linkClass}>Home</NavLink><NavLink to="/evaluate" className={linkClass}>Evaluate</NavLink><NavLink to="/history" className={linkClass}>History</NavLink><NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink></div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8"><Routes><Route path="/" element={<Home />} /><Route path="/evaluate" element={<Evaluate />} /><Route path="/history" element={<History />} /><Route path="/leaderboard" element={<Leaderboard />} /></Routes></main>
    </div>
  );
}
