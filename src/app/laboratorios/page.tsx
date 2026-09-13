"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import LaboratorioCard from "@/components/LaboratorioCard";
import type { Laboratorio } from "@/types/laboratorio";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function LaboratoriosPage() {
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarLaboratorios() {
      try {
        const resposta = await fetch("/api/laboratorios");
        if (!resposta.ok) throw new Error();
        setLaboratorios(await resposta.json());
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarLaboratorios();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header
        titulo="Laboratórios"
        descricao="Consulte os laboratórios cadastrados e sua disponibilidade."
        acao={
          <Link href="/laboratorios/novo" className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar sm:w-auto">
            Novo laboratório
          </Link>
        }
      />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && (
        <div className={`${estadoBase} text-danger-text`}>
          Erro ao carregar laboratórios. Atualize a página para tentar novamente.
        </div>
      )}
      {!carregando && !erro && laboratorios.length === 0 && (
        <div className={estadoBase}>Nenhum laboratório cadastrado.</div>
      )}
      {!carregando && !erro && laboratorios.length > 0 && (
        <>
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4 text-sm">
            <span className="text-muted">Total de laboratórios</span>
            <strong className="tabular-nums">{laboratorios.length}</strong>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[380px]:grid-cols-1">
            {laboratorios.map((laboratorio) => (
              <LaboratorioCard key={laboratorio.id} laboratorio={laboratorio} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
