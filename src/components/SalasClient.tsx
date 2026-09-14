"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SalaCard from "@/components/SalaCard";
import type { Perfil } from "@/types/usuario";
import type { Sala } from "@/types/sala";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function SalasClient({ perfil }: { perfil: Perfil }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarSalas() {
      try {
        const resposta = await fetch("/api/salas");
        if (!resposta.ok) throw new Error();
        setSalas(await resposta.json());
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarSalas();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header
        titulo="Salas"
        descricao="Consulte as salas cadastradas e sua disponibilidade."
        acao={perfil === "ADMIN" ? (
          <Link href="/admin/salas/novo" className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar sm:w-auto">
            Nova sala
          </Link>
        ) : undefined}
      />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && (
        <div className={`${estadoBase} text-danger-text`}>
          Erro ao carregar salas. Verifique a conexão com o banco de dados.
        </div>
      )}
      {!carregando && !erro && salas.length === 0 && (
        <div className={estadoBase}>Nenhuma sala cadastrada.</div>
      )}
      {!carregando && !erro && salas.length > 0 && (
        <>
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4 text-sm">
            <span className="text-muted">Total de salas</span>
            <strong className="tabular-nums">{salas.length}</strong>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 max-[380px]:grid-cols-1">
            {salas.map((sala) => (
              <SalaCard key={sala.id_sala} sala={sala} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
