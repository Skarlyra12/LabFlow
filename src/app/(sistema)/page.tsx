"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, CalendarDays, CircleCheckBig, Wrench } from "lucide-react";
import Header from "@/components/Header";
import SalaCard from "@/components/SalaCard";
import type { Reserva } from "@/types/reserva";
import type { Sala } from "@/types/sala";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function Dashboard() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [respostaSalas, respostaReservas] = await Promise.all([
          fetch("/api/salas"),
          fetch("/api/reservas"),
        ]);

        if (!respostaSalas.ok || !respostaReservas.ok) throw new Error();

        setSalas(await respostaSalas.json());
        setReservas(await respostaReservas.json());
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  const indicadores = [
    { label: "Salas cadastradas", valor: salas.length, Icone: Building2 },
    { label: "Salas disponíveis", valor: salas.filter((sala) => sala.status === "DISPONIVEL").length, Icone: CircleCheckBig },
    { label: "Salas em manutenção", valor: salas.filter((sala) => sala.status === "MANUTENCAO").length, Icone: Wrench },
    { label: "Reservas", valor: reservas.length, Icone: CalendarDays },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header titulo="Dashboard" descricao="Visão geral das salas e reservas." />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && (
        <div className={`${estadoBase} text-danger-text`}>
          Erro ao carregar o dashboard. Verifique a conexão com o banco de dados.
        </div>
      )}

      {!carregando && !erro && (
        <>
          <section className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores do sistema">
            {indicadores.map((indicador) => (
              <article className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]" key={indicador.label}>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm leading-5 font-medium text-muted">{indicador.label}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <indicador.Icone className="size-[18px]" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <strong className="mt-5 block text-3xl leading-none font-bold tracking-[-0.03em] tabular-nums">
                  {indicador.valor}
                </strong>
              </article>
            ))}
          </section>

          <section className="mt-6 flex flex-col justify-between gap-5 rounded-xl border border-line bg-surface px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold tracking-[-0.015em]">Gestão de salas</h2>
              <p className="mt-1 max-w-[65ch] text-sm text-muted text-pretty">
                Consulte a disponibilidade das salas e acompanhe as reservas.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Link href="/salas" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-line bg-surface px-4 font-semibold text-ink hover:border-[oklch(0.72_0.03_250)] hover:bg-page">
                Ver salas
              </Link>
              <Link href="/reservas" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar">
                Ver reservas
              </Link>
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-[-0.02em]">Salas</h2>
              <p className="mt-1 text-sm text-muted">Salas cadastradas para consulta.</p>
            </div>

            {salas.length === 0 ? (
              <div className={estadoBase}>Nenhuma sala cadastrada.</div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[380px]:grid-cols-1">
                {salas.slice(0, 3).map((sala) => (
                  <SalaCard key={sala.id_sala} sala={sala} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
