import { MapPin, UsersRound } from "lucide-react";
import type { Laboratorio } from "@/types/laboratorio";

const classesStatus = {
  DISPONIVEL: "bg-success-bg text-success-text",
  OCUPADO: "bg-warning-bg text-warning-text",
  MANUTENCAO: "bg-danger-bg text-danger-text",
};

type LaboratorioCardProps = {
  laboratorio: Laboratorio;
};

export default function LaboratorioCard({ laboratorio }: LaboratorioCardProps) {
  return (
    <article className="flex min-h-72 flex-col rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] hover:border-[oklch(0.78_0.025_250)] hover:shadow-[0_4px_8px_oklch(0.22_0.035_255/0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold tracking-[0.06em] text-muted">
          LAB {String(laboratorio.id).padStart(2, "0")}
        </span>
        <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-sm font-bold ${classesStatus[laboratorio.status]}`}>
          {laboratorio.status}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="m-0 text-[1.08rem] leading-[1.35] font-bold tracking-[-0.015em] text-balance">
          {laboratorio.nome}
        </h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span>{laboratorio.localizacao}</span>
        </p>
      </div>

      <p className="mt-5 flex-1 text-sm leading-6 text-muted text-pretty">{laboratorio.descricao}</p>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <UsersRound className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          Capacidade
        </span>
        <strong>{laboratorio.capacidade} lugares</strong>
      </div>
    </article>
  );
}
