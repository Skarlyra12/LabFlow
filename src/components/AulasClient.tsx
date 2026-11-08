"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { BookOpenCheck } from "lucide-react";
import Header from "@/components/Header";
import type { Aula } from "@/types/aula";
import type { Sala } from "@/types/sala";
import type { Perfil } from "@/types/usuario";

const campo = "min-h-12 w-full rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3.5 py-2.5 text-ink hover:border-[oklch(0.65_0.035_250)]";
const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

type Props = { perfil: Perfil; valoresIniciais?: { sala?: string; data?: string; inicio?: string; fim?: string } };

export default function AulasClient({ perfil, valoresIniciais = {} }: Props) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [idSala, setIdSala] = useState(valoresIniciais.sala ?? "");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(valoresIniciais.data ?? "");
  const [inicio, setInicio] = useState(valoresIniciais.inicio ?? "");
  const [fim, setFim] = useState(valoresIniciais.fim ?? "");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const [respostaSalas, respostaAulas] = await Promise.all([fetch("/api/salas"), fetch("/api/aulas")]);
        if (!respostaSalas.ok || !respostaAulas.ok) throw new Error();
        setSalas(await respostaSalas.json());
        setAulas(await respostaAulas.json());
      } catch { setErro(true); } finally { setCarregando(false); }
    }
    carregar();
  }, []);

  async function cadastrarAula(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMensagem(""); setEnviando(true);
    try {
      const resposta = await fetch("/api/aulas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_sala: idSala, titulo, descricao, data, hora_inicio: inicio, hora_fim: fim }) });
      const dados = await resposta.json();
      if (!resposta.ok) { setMensagem(dados.erro ?? "Não foi possível cadastrar a aula."); return; }
      setAulas((atuais) => [dados, ...atuais]);
      setMensagem("Aula cadastrada com sucesso.");
      setTitulo(""); setDescricao(""); setIdSala(""); setData(""); setInicio(""); setFim("");
    } catch { setMensagem("Não foi possível conectar à API."); } finally { setEnviando(false); }
  }

  const sucesso = mensagem === "Aula cadastrada com sucesso.";
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header titulo="Aulas" descricao={perfil === "PROFESSOR" ? "Escolha uma sala e um horário para cadastrar sua aula." : "Consulte as aulas programadas, seus horários e professores."} />
      {carregando && <div className={estadoBase}>Carregando aulas...</div>}
      {erro && <div className={`${estadoBase} text-danger-text`}>Erro ao carregar as aulas. Verifique a conexão com o banco de dados.</div>}
      {!carregando && !erro && (
        <>
          {perfil === "PROFESSOR" && (
            <form className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] sm:p-7" onSubmit={cadastrarAula} aria-busy={enviando}>
              <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary"><BookOpenCheck className="size-5" strokeWidth={1.8} aria-hidden="true" /></span><div><h2 className="font-bold">Cadastrar aula</h2><p className="mt-0.5 text-sm text-muted">A aula ficará visível para os alunos na grade da sala.</p></div></div>
              <div className="mt-6 grid grid-cols-1 gap-x-5 md:grid-cols-6">
                <div className="mb-5 md:col-span-3"><label className="mb-2 block text-sm font-bold" htmlFor="titulo">Aula</label><input className={campo} id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Aula de Computadores" maxLength={120} required /></div>
                <div className="mb-5 md:col-span-3"><label className="mb-2 block text-sm font-bold" htmlFor="sala">Sala</label><select className={campo} id="sala" value={idSala} onChange={(e) => setIdSala(e.target.value)} required><option value="">Selecione uma sala</option>{salas.filter((s) => s.status === "DISPONIVEL").map((s) => <option key={s.id_sala} value={s.id_sala}>{s.nome} — {s.localizacao}</option>)}</select></div>
                <div className="mb-5 md:col-span-2"><label className="mb-2 block text-sm font-bold" htmlFor="data">Data</label><input className={campo} id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required /></div>
                <div className="mb-5 md:col-span-2"><label className="mb-2 block text-sm font-bold" htmlFor="inicio">Início</label><input className={campo} id="inicio" type="time" min="08:00" max="18:00" value={inicio} onChange={(e) => setInicio(e.target.value)} required /></div>
                <div className="mb-5 md:col-span-2"><label className="mb-2 block text-sm font-bold" htmlFor="fim">Término</label><input className={campo} id="fim" type="time" min="08:00" max="18:00" value={fim} onChange={(e) => setFim(e.target.value)} required /></div>
                <div className="mb-5 md:col-span-6"><label className="mb-2 block text-sm font-bold" htmlFor="descricao">Informações da aula <span className="font-normal text-muted">(opcional)</span></label><textarea className={`${campo} min-h-24 resize-y`} id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500} placeholder="Conteúdo, turma ou orientações para os alunos." /></div>
              </div>
              {mensagem && <p className={`mb-5 rounded-lg px-3.5 py-3 text-sm font-semibold ${sucesso ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`} role="status">{mensagem}</p>}
              <div className="flex justify-end border-t border-line pt-5"><button className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover disabled:opacity-60" disabled={enviando || salas.length === 0}>{enviando ? "Cadastrando..." : "Cadastrar aula"}</button></div>
            </form>
          )}

          <section className={perfil === "PROFESSOR" ? "mt-9" : ""}>
            <div className="mb-5 flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold tracking-[-0.02em]">Grade de aulas</h2><p className="mt-1 text-sm text-muted">{perfil === "PROFESSOR" ? "Aulas cadastradas por você." : "Aulas programadas nas salas."}</p></div><strong className="text-sm tabular-nums">{aulas.length}</strong></div>
            {aulas.length === 0 ? <div className={estadoBase}>Nenhuma aula cadastrada.</div> : (
              <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]"><table className="w-full min-w-[820px] border-collapse text-left text-sm"><thead className="bg-page text-muted"><tr><th className="px-5 py-3.5 font-semibold">Aula</th><th className="px-5 py-3.5 font-semibold">Sala</th><th className="px-5 py-3.5 font-semibold">Professor</th><th className="px-5 py-3.5 font-semibold">Data</th><th className="px-5 py-3.5 font-semibold">Horário</th><th className="px-5 py-3.5 font-semibold">Status</th></tr></thead><tbody>{aulas.map((aula) => <tr className="border-t border-line" key={aula.id_aula}><td className="px-5 py-4"><strong className="block">{aula.titulo}</strong>{aula.descricao && <span className="mt-1 block max-w-[36ch] text-muted">{aula.descricao}</span>}</td><td className="px-5 py-4 text-muted">{aula.sala_nome}</td><td className="px-5 py-4 text-muted">{aula.professor_nome}</td><td className="px-5 py-4 text-muted">{aula.data.split("-").reverse().join("/")}</td><td className="px-5 py-4 text-muted">{aula.hora_inicio.slice(0, 5)}–{aula.hora_fim.slice(0, 5)}</td><td className="px-5 py-4 text-success-text">{aula.status}</td></tr>)}</tbody></table></div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
