import { CalendarDays } from "lucide-react";
import Header from "@/components/Header";

export default function ReservasPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header titulo="Reservas" descricao="Área reservada para a próxima etapa do projeto." />
      <div className="rounded-xl border border-line bg-surface px-6 py-10 text-center shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] sm:px-10 sm:py-14">
        <span className="mx-auto grid size-11 place-items-center rounded-lg bg-primary-soft text-primary">
          <CalendarDays className="size-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-bold tracking-[-0.015em]">Reservas</h2>
        <p className="mx-auto mt-2 max-w-[52ch] text-sm text-muted text-pretty">
          As funcionalidades de reserva serão implementadas na próxima etapa.
        </p>
      </div>
    </div>
  );
}
