import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-forest-700 text-white hover:bg-forest-900 disabled:bg-forest-500/50",
  secondary: "bg-white text-forest-900 border-2 border-forest-100 hover:border-forest-500 disabled:opacity-50",
  ghost: "text-forest-700 hover:bg-forest-50 disabled:opacity-50",
};

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 font-bold transition disabled:cursor-not-allowed";

export function buttonClasses(variant: Variant = "primary", extra = ""): string {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
