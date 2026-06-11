export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white p-6">
      <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">© {new Date().getFullYear()} PromptGrade AI — Built with care.</div>
    </footer>
  );
}
