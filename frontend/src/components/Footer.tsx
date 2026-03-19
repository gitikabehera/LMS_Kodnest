export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
      <p className="text-center text-slate-400 text-xs">
        © {new Date().getFullYear()} LearnHub. All rights reserved.
      </p>
    </footer>
  );
}
