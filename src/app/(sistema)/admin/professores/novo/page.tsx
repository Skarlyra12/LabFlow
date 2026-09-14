"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import Header from "@/components/Header";

const campo = "min-h-12 w-full rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3.5 py-2.5 text-ink hover:border-[oklch(0.65_0.035_250)]";
const botao = "flex min-h-11 items-center justify-center rounded-lg px-4 font-semibold disabled:cursor-not-allowed disabled:opacity-60";

export default function NovoProfessorPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [registro, setRegistro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cadastrarProfessor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);

    try {
      const resposta = await fetch("/api/professores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, registro }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro ?? "Não foi possível cadastrar o professor.");
        return;
      }

      setMensagem("Professor cadastrado com sucesso.");
      setNome("");
      setEmail("");
      setSenha("");
      setRegistro("");
    } catch {
      setMensagem("Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  const sucesso = mensagem === "Professor cadastrado com sucesso.";

  return (
    <div className="w-full max-w-[960px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header titulo="Novo professor" descricao="Cadastre os dados de acesso e o registro do professor." />

      <form className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] sm:p-7" onSubmit={cadastrarProfessor} aria-busy={enviando}>
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="nome">Nome</label>
            <input className={campo} id="nome" name="nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="email">Email</label>
            <input className={campo} id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="senha">Senha</label>
            <input className={campo} id="senha" name="senha" type="password" autoComplete="new-password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold" htmlFor="registro">Registro</label>
            <input className={campo} id="registro" name="registro" value={registro} onChange={(event) => setRegistro(event.target.value)} required />
          </div>
        </div>

        {mensagem && <p className={`mb-6 rounded-lg px-3.5 py-3 text-sm font-semibold ${sucesso ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`} role="status">{mensagem}</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <Link href="/admin/professores" className={`${botao} border border-line bg-surface text-ink hover:bg-page`}>Cancelar</Link>
          <button className={`${botao} bg-primary text-white hover:bg-primary-hover active:bg-sidebar`} type="submit" disabled={enviando}>
            {enviando ? "Cadastrando..." : "Cadastrar professor"}
          </button>
        </div>
      </form>
    </div>
  );
}
