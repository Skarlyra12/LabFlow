"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import type { Professor } from "@/types/professor";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function ProfessoresPage() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarProfessores() {
      try {
        const resposta = await fetch("/api/professores");
        if (!resposta.ok) throw new Error();
        setProfessores(await resposta.json());
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarProfessores();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header
        titulo="Professores"
        descricao="Consulte e cadastre professores."
        acao={
          <Link href="/admin/professores/novo" className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar sm:w-auto">
            Novo professor
          </Link>
        }
      />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && <div className={`${estadoBase} text-danger-text`}>Erro ao carregar professores. Verifique a conexão com o banco de dados.</div>}
      {!carregando && !erro && professores.length === 0 && <div className={estadoBase}>Nenhum professor cadastrado.</div>}
      {!carregando && !erro && professores.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-page text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nome</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Registro</th>
                <th className="px-5 py-3.5 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {professores.map((professor) => (
                <tr className="border-t border-line" key={professor.id_professor}>
                  <td className="px-5 py-4 font-semibold">{professor.nome}</td>
                  <td className="px-5 py-4 text-muted">{professor.email}</td>
                  <td className="px-5 py-4 text-muted">{professor.registro}</td>
                  <td className="px-5 py-4">{professor.ativo === 1 ? "Ativo" : "Inativo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
