import Link from "next/link";
import { ConnectionStatus } from "./connection-status";
import { MainNav } from "./main-nav";

export function AppHeader() {
  return (
    <header className="border-b border-forest-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-lg font-extrabold text-forest-700">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export serves the SVG as-is */}
          <img src="/icons/icon.svg" alt="" width={32} height={32} className="size-8" />
          Eco-Simulink
        </Link>
        <ConnectionStatus />
      </div>
      <MainNav />
    </header>
  );
}
