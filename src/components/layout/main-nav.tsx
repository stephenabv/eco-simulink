"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/lessons/", label: "Lessons" },
  { href: "/activities/", label: "Activities" },
  { href: "/simulation/", label: "Lab" },
  { href: "/pyramid/", label: "Pyramid" },
  { href: "/assessment/", label: "Quiz" },
  { href: "/progress/", label: "Progress" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="mx-auto max-w-5xl px-2 pb-2">
      <ul className="flex flex-wrap gap-1">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.slice(0, -1));
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 font-bold ${
                  active ? "bg-forest-700 text-white" : "text-forest-700 hover:bg-forest-50"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
