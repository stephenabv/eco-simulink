import type { Illustration } from "@/types/ecology";

/** Renders an organism's artwork. Emoji placeholders are decorative; the name is always shown as text. */
export function OrganismArt({ illustration, className = "text-3xl" }: { illustration: Illustration; className?: string }) {
  if (illustration.kind === "emoji") {
    return (
      <span aria-hidden className={`leading-none ${className}`}>
        {illustration.value}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- static export, researcher artwork served as-is
  return <img src={illustration.src} alt="" className="size-10 object-contain" />;
}
