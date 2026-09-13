"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FlaskConical, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/laboratorios", label: "Laboratórios", Icone: FlaskConical },
  { href: "/reservas", label: "Reservas", Icone: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] flex-col justify-between bg-sidebar px-5 py-7 text-white md:flex">
        <div>
          <Link href="/" className="flex min-h-11 w-fit items-center gap-3 px-2 text-xl font-bold tracking-[-0.02em]" aria-label="LabFlow - Dashboard">
            <span className="grid size-9 place-items-center rounded-lg border border-white/35 bg-white/10 text-xs tracking-[0.06em]" aria-hidden="true">
              LF
            </span>
            <span>LabFlow</span>
          </Link>

          <nav className="mt-12 flex flex-col gap-1.5" aria-label="Navegação principal">
            {links.map((link) => {
              const ativo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={ativo ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-semibold ${
                    ativo ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]" : "text-sidebar-muted hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <link.Icone className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-2 border-t border-white/15 pt-5">
          <strong className="block text-sm font-semibold">Projeto Acadêmico</strong>
          <span className="mt-1 block text-sm leading-5 text-sidebar-muted">Engenharia de Software</span>
        </div>
      </aside>

      <div className="sticky top-0 z-20 overflow-x-auto bg-sidebar px-5 pt-3.5 text-white md:hidden">
        <Link href="/" className="inline-flex min-h-11 items-center text-lg font-bold">LabFlow</Link>
        <nav className="flex min-w-max gap-5" aria-label="Navegação principal">
          {links.map((link) => {
            const ativo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 border-b-2 px-0 text-sm font-semibold ${
                  ativo ? "border-white text-white" : "border-transparent text-sidebar-muted"
                }`}
              >
                <link.Icone className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
