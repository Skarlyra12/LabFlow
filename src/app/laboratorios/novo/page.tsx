"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import Header from "@/components/Header";
import type { StatusLaboratorio } from "@/types/laboratorio";

const campo = "min-h-12 w-full rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3.5 py-2.5 text-ink hover:border-[oklch(0.65_0.035_250)]";
const botao = "flex min-h-11 items-center justify-center rounded-lg px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60";

export default function NovoLaboratorioPage() {
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<StatusLaboratorio>("DISPONIVEL");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrarLaboratorio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");

    try {
      const resposta = await fetch("/api/laboratorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, localizacao, capacidade, descricao, status }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro ?? "Não foi possível cadastrar o laboratório.");
        return;
      }

      setMensagem("Laboratório cadastrado com sucesso.");
      setNome("");
      setLocalizacao("");
      setCapacidade("");
      setDescricao("");
      setStatus("DISPONIVEL");
    } catch {
      setMensagem("Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  const sucesso = mensagem === "Laboratório cadastrado com sucesso.";

  return (
    <div className="w-full max-w-[960px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header titulo="Novo laboratório" descricao="Cadastre as informações básicas do laboratório." />

      <form className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] sm:p-7" onSubmit={cadastrarLaboratorio} aria-busy={enviando}>
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="nome">Nome</label>
            <input className={campo} id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="localizacao">Localização</label>
            <input className={campo} id="localizacao" name="localizacao" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} required />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="capacidade">Capacidade</label>
            <input className={campo} id="capacidade" name="capacidade" type="number" min="1" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} required />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="status">Status</label>
            <select className={campo} id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as StatusLaboratorio)}>
              <option value="DISPONIVEL">DISPONIVEL</option>
              <option value="OCUPADO">OCUPADO</option>
              <option value="MANUTENCAO">MANUTENCAO</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-bold" htmlFor="descricao">Descrição</label>
          <textarea className={`${campo} min-h-31 resize-y`} id="descricao" name="descricao" rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
        </div>

        {mensagem && (
          <p className={`mb-6 rounded-lg px-3.5 py-3 text-sm font-semibold ${sucesso ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`} role="status" aria-live="polite">
            {mensagem}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Link href="/laboratorios" className={`${botao} border border-line bg-surface text-ink hover:bg-page`}>
            Cancelar
          </Link>
          <button className={`${botao} bg-primary text-white hover:bg-primary-hover active:bg-sidebar`} type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar laboratório"}
          </button>
        </div>
      </form>
    </div>
  );
}
