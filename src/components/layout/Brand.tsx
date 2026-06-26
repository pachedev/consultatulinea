import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Marca: icono (mano sosteniendo el teléfono con SIM) + wordmark.
 * El icono se cambia según el tema: oscuro en claro, blanco en oscuro. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2 text-ink", className)}
      aria-label="ConsultaTuLínea — inicio"
    >
      <span className="relative inline-flex size-7 shrink-0 items-center justify-center">
        <Image
          src="/brand-icon.png"
          alt="ConsultaTuLínea"
          width={28}
          height={28}
          priority
          className="brand-icon-light size-7"
        />
        <Image
          src="/brand-icon-white.png"
          alt=""
          aria-hidden
          width={28}
          height={28}
          className="brand-icon-dark size-7"
        />
      </span>
      <span className="font-display text-[0.95rem] font-bold tracking-tight">
        ConsultaTuLínea
      </span>
    </Link>
  );
}
