import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src="/icon-192.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-xl" />
          <span className="truncate font-display text-lg text-gradient">ما وراء المنطق</span>
        </Link>
        <nav className="flex shrink-0 gap-1 text-sm">
          <Link to="/achievements" className="rounded-full px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="الإنجازات">🏆</Link>
          <Link to="/settings" className="rounded-full px-3 py-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="الإعدادات">⚙️</Link>
        </nav>
      </header>
      {title && <h1 className="mb-6 text-3xl text-gradient">{title}</h1>}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-glow transition active:scale-95 hover:brightness-110 disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/60 px-6 py-4 text-base font-semibold text-secondary-foreground transition active:scale-95 hover:bg-secondary",
};
