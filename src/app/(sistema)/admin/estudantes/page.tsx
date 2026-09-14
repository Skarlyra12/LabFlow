"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import type { Estudante } from "@/types/estudante";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function EstudantesPage() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarEstudantes() {
      try {
        const resposta = await fetch("/api/estudantes");
        if (!resposta.ok) throw new Error();
        setEstudantes(await resposta.json());
      } catch {
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarEstudantes();
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header
        titulo="Estudantes"
        descricao="Consulte e cadastre estudantes."
        acao={
          <Link href="/admin/estudantes/novo" className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar sm:w-auto">
            Novo estudante
          </Link>
        }
      />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && <div className={`${estadoBase} text-danger-text`}>Erro ao carregar estudantes. Verifique a conexão com o banco de dados.</div>}
      {!carregando && !erro && estudantes.length === 0 && <div className={estadoBase}>Nenhum estudante cadastrado.</div>}
      {!carregando && !erro && estudantes.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead className="bg-page text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nome</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Matrícula</th>
                <th className="px-5 py-3.5 font-semibold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {estudantes.map((estudante) => (
                <tr className="border-t border-line" key={estudante.id_estudante}>
                  <td className="px-5 py-4 font-semibold">{estudante.nome}</td>
                  <td className="px-5 py-4 text-muted">{estudante.email}</td>
                  <td className="px-5 py-4 text-muted">{estudante.matricula}</td>
                  <td className="px-5 py-4">{estudante.ativo === 1 ? "Ativo" : "Inativo"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
