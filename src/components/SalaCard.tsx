import Link from "next/link";
import { ArrowRight, MapPin, UsersRound } from "lucide-react";
import type { Sala } from "@/types/sala";

const classesStatus = {
  DISPONIVEL: "bg-success-bg text-success-text",
  MANUTENCAO: "bg-danger-bg text-danger-text",
};

export default function SalaCard({ sala }: { sala: Sala }) {
  return (
    <Link
      href={`/salas/${sala.id_sala}`}
      className="group flex min-h-64 flex-col rounded-xl border border-line bg-surface p-6 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] hover:border-[oklch(0.72_0.04_250)] hover:shadow-[0_6px_14px_oklch(0.22_0.035_255/0.07)]"
      aria-label={`Ver detalhes de ${sala.nome}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold tracking-[0.06em] text-muted">
          SALA {String(sala.id_sala).padStart(2, "0")}
        </span>
        <span className={`inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-sm font-bold ${classesStatus[sala.status]}`}>
          {sala.status}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-[1.08rem] leading-[1.35] font-bold tracking-[-0.015em] text-balance">
          {sala.nome}
        </h3>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted">
          <MapPin className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <span>{sala.localizacao}</span>
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <UsersRound className="size-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          Capacidade
        </span>
        <strong>{sala.capacidade} lugares</strong>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        Ver sala
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
      </span>
    </Link>
  );
}
