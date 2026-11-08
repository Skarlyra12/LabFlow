"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenCheck, DoorOpen, GraduationCap, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import type { Sessao } from "@/lib/auth";

const linksAdmin = [
  { href: "/", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/admin/estudantes", label: "Estudantes", Icone: GraduationCap },
  { href: "/admin/professores", label: "Professores", Icone: UsersRound },
  { href: "/salas", label: "Salas", Icone: DoorOpen },
  { href: "/aulas", label: "Aulas", Icone: BookOpenCheck },
];

const linksProfessor = [
  { href: "/", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/salas", label: "Minhas salas", Icone: DoorOpen },
  { href: "/aulas", label: "Minhas aulas", Icone: BookOpenCheck },
];

const linksEstudante = [
  { href: "/", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/salas", label: "Salas", Icone: DoorOpen },
  { href: "/aulas", label: "Grade de aulas", Icone: BookOpenCheck },
];

export default function Sidebar({ sessao }: { sessao: Sessao }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = sessao.perfil === "ADMIN" ? linksAdmin : sessao.perfil === "PROFESSOR" ? linksProfessor : linksEstudante;

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[272px] flex-col justify-between bg-sidebar px-5 py-7 text-white md:flex">
        <div>
          <Link href="/" className="flex min-h-11 w-fit items-center gap-3 px-2 text-xl font-bold tracking-[-0.02em]" aria-label="LabFlow - Dashboard">
            <span className="grid size-9 place-items-center rounded-lg border border-white/35 bg-white/10 text-xs tracking-[0.06em]" aria-hidden="true">LF</span>
            <span>LabFlow</span>
          </Link>
          <nav className="mt-12 flex flex-col gap-1.5" aria-label="Navegação principal">
            {links.map((link) => {
              const ativo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} aria-current={ativo ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3.5 text-sm font-semibold ${ativo ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]" : "text-sidebar-muted hover:bg-white/8 hover:text-white"}`}>
                  <link.Icone className="size-[18px] shrink-0" strokeWidth={1.8} aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mx-2 border-t border-white/15 pt-5">
          <strong className="block break-words text-sm font-semibold">{sessao.nome}</strong>
          <span className="mt-1 block text-sm text-sidebar-muted">{sessao.perfil}</span>
          <button className="mt-4 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-sidebar-muted hover:bg-white/8 hover:text-white" type="button" onClick={sair}>
            <LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" />Sair
          </button>
        </div>
      </aside>
      <div className="sticky top-0 z-20 overflow-x-auto bg-sidebar px-5 pt-3.5 text-white md:hidden">
        <div className="flex min-w-max items-center justify-between gap-8">
          <Link href="/" className="inline-flex min-h-11 items-center text-lg font-bold">LabFlow</Link>
          <button className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-sidebar-muted" type="button" onClick={sair}><LogOut className="size-4" strokeWidth={1.8} aria-hidden="true" />Sair</button>
        </div>
        <nav className="flex min-w-max gap-5" aria-label="Navegação principal">
          {links.map((link) => {
            const ativo = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return <Link key={link.href} href={link.href} aria-current={ativo ? "page" : undefined} className={`flex min-h-11 items-center gap-2 border-b-2 px-0 text-sm font-semibold ${ativo ? "border-white text-white" : "border-transparent text-sidebar-muted"}`}><link.Icone className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />{link.label}</Link>;
          })}
        </nav>
      </div>
    </>
  );
}
