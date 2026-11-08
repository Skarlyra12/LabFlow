"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, MapPin, UserRound, UsersRound, Wrench } from "lucide-react";
import type { DetalhesSala } from "@/types/sala";
import type { Perfil } from "@/types/usuario";

const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

function dataLocalAtual() {
  const agora = new Date();
  const deslocamento = agora.getTimezoneOffset() * 60_000;
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10);
}

export default function SalaDetalhesClient({ idSala, perfil }: { idSala: string; perfil: Perfil }) {
  const [data, setData] = useState(dataLocalAtual);
  const [sala, setSala] = useState<DetalhesSala | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [alterandoStatus, setAlterandoStatus] = useState(false);
  const [mensagemStatus, setMensagemStatus] = useState("");

  useEffect(() => {
    const controlador = new AbortController();

    async function carregarSala() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await fetch(`/api/salas/${idSala}?data=${data}`, { signal: controlador.signal });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível carregar a sala.");
        setSala(dados);
      } catch (erroAtual) {
        if ((erroAtual as Error).name !== "AbortError") setErro((erroAtual as Error).message);
      } finally {
        if (!controlador.signal.aborted) setCarregando(false);
      }
    }

    carregarSala();
    return () => controlador.abort();
  }, [data, idSala]);

  async function alterarStatus() {
    if (!sala) return;
    setAlterandoStatus(true);
    setMensagemStatus("");
    const novoStatus = sala.status === "DISPONIVEL" ? "MANUTENCAO" : "DISPONIVEL";
    try {
      const resposta = await fetch(`/api/salas/${idSala}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: novoStatus }) });
      const dados = await resposta.json();
      if (!resposta.ok) { setMensagemStatus(dados.erro ?? "Não foi possível alterar o status."); return; }
      setSala({ ...sala, status: novoStatus, horarios: sala.horarios.map((horario) => ({ ...horario, disponivel: novoStatus === "DISPONIVEL" && !horario.aula })) });
      setMensagemStatus(novoStatus === "MANUTENCAO" ? "Sala marcada como em manutenção." : "Sala liberada para aulas.");
    } catch { setMensagemStatus("Não foi possível conectar à API."); } finally { setAlterandoStatus(false); }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Link href="/salas" className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"><ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden="true" />Voltar para salas</Link>

      {carregando && <div className={estadoBase}>Carregando informações da sala...</div>}
      {erro && <div className={`${estadoBase} text-danger-text`} role="alert">{erro}</div>}

      {!carregando && !erro && sala && (
        <>
          <header className="border-b border-line pb-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div><h1 className="text-3xl font-bold tracking-[-0.025em] text-balance">{sala.nome}</h1><p className="mt-2 flex items-center gap-2 text-muted"><MapPin className="size-4" strokeWidth={1.8} aria-hidden="true" />{sala.localizacao}</p></div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex min-h-8 items-center rounded-full px-3 py-1 text-sm font-bold ${sala.status === "DISPONIVEL" ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`}>{sala.status === "DISPONIVEL" ? "Disponível" : "Em manutenção"}</span>
                {sala.pode_gerenciar && <button type="button" onClick={alterarStatus} disabled={alterandoStatus} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-sm font-semibold hover:bg-page disabled:opacity-60"><Wrench className="size-4" strokeWidth={1.8} aria-hidden="true" />{alterandoStatus ? "Alterando..." : sala.status === "DISPONIVEL" ? "Colocar em manutenção" : "Liberar sala"}</button>}
              </div>
            </div>
            {mensagemStatus && <p className="mt-4 text-sm font-semibold text-muted" role="status">{mensagemStatus}</p>}
          </header>

          <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section aria-labelledby="horarios-titulo">
              <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div><h2 id="horarios-titulo" className="text-xl font-bold tracking-[-0.02em]">Grade de horários</h2><p className="mt-1 text-sm text-muted">Veja os horários livres e as aulas programadas.</p></div>
                <label className="block text-sm font-bold" htmlFor="data-sala">Data<input className="mt-2 block min-h-11 rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3 py-2 font-normal text-ink hover:border-[oklch(0.65_0.035_250)]" id="data-sala" type="date" min={dataLocalAtual()} value={data} onChange={(evento) => setData(evento.target.value)} /></label>
              </div>

              {sala.status === "MANUTENCAO" ? (
                <p className="mt-5 rounded-lg bg-danger-bg px-4 py-3 text-sm font-semibold text-danger-text">Esta sala está em manutenção e não recebe aulas.</p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {sala.horarios.map((horario) => horario.aula ? (
                    <article key={horario.inicio} className="min-h-32 rounded-xl border border-line bg-surface p-4 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]">
                      <p className="text-sm font-bold tabular-nums text-primary">{horario.inicio}–{horario.fim}</p>
                      <h3 className="mt-2 font-bold">{horario.aula.titulo}</h3>
                      <p className="mt-1 text-sm text-muted">Prof. {horario.aula.professor_nome}</p>
                      {horario.aula.descricao && <p className="mt-2 text-sm text-muted">{horario.aula.descricao}</p>}
                    </article>
                  ) : (
                    sala.pode_gerenciar && perfil === "PROFESSOR" ? (
                      <Link key={horario.inicio} href={`/aulas?sala=${sala.id_sala}&data=${data}&inicio=${horario.inicio}&fim=${horario.fim}`} className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-line bg-surface px-3 text-center text-sm font-semibold text-primary hover:border-primary hover:bg-primary-soft"><span>{horario.inicio}–{horario.fim}</span><span className="mt-1 font-normal text-muted">Cadastrar aula</span></Link>
                    ) : (
                      <span key={horario.inicio} className="flex min-h-20 flex-col items-center justify-center rounded-lg border border-line bg-surface px-3 text-center text-sm font-semibold text-muted"><span>{horario.inicio}–{horario.fim}</span><span className="mt-1 font-normal text-success-text">Livre</span></span>
                    )
                  ))}
                </div>
              )}
              {sala.status === "DISPONIVEL" && sala.pode_gerenciar && perfil === "PROFESSOR" && <p className="mt-4 text-sm text-muted">Selecione um horário livre para cadastrar os dados da aula.</p>}
            </section>

            <aside className="space-y-6 border-t border-line pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8" aria-label="Informações da sala">
              <div><h2 className="text-base font-bold">Informações</h2><dl className="mt-4 space-y-4 text-sm"><div className="flex items-start gap-3"><UsersRound className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" /><div><dt className="text-muted">Capacidade</dt><dd className="mt-0.5 font-semibold">{sala.capacidade} lugares</dd></div></div><div className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.8} aria-hidden="true" /><div><dt className="text-muted">Funcionamento</dt><dd className="mt-0.5 font-semibold">08:00 às 18:00</dd></div></div></dl></div>
              <div className="border-t border-line pt-6"><h2 className="text-base font-bold">Professor responsável</h2>{sala.professor ? <div className="mt-4 flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"><UserRound className="size-5" strokeWidth={1.8} aria-hidden="true" /></span><div className="min-w-0 text-sm"><p className="font-semibold">{sala.professor.nome}</p><p className="mt-1 break-words text-muted">{sala.professor.email}</p><p className="mt-1 text-muted">Registro: {sala.professor.registro}</p></div></div> : <p className="mt-3 text-sm text-muted">Nenhum professor vinculado a esta sala.</p>}</div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
