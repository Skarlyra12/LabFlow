"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

const campo = "min-h-12 w-full rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3.5 py-2.5 text-ink hover:border-[oklch(0.65_0.035_250)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const resposta = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro ?? "Não foi possível entrar.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErro("Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-page px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-3 text-xl font-bold tracking-[-0.02em] text-sidebar">
          <span className="grid size-10 place-items-center rounded-lg bg-sidebar text-xs tracking-[0.06em] text-white" aria-hidden="true">
            LF
          </span>
          <span>LabFlow</span>
        </div>

        <form className="rounded-xl border border-line bg-surface p-6 shadow-[0_4px_8px_oklch(0.22_0.035_255/0.06)] sm:p-8" onSubmit={entrar} aria-busy={enviando}>
          <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
            <LockKeyhole className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.025em]">Entrar</h1>
          <p className="mt-2 text-sm text-muted">Acesse o sistema com seu email e senha.</p>

          <div className="mt-7">
            <label className="mb-2 block text-sm font-bold" htmlFor="email">Email</label>
            <input className={campo} id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-bold" htmlFor="senha">Senha</label>
            <input className={campo} id="senha" name="senha" type="password" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
          </div>

          {erro && (
            <p className="mt-5 rounded-lg bg-danger-bg px-3.5 py-3 text-sm font-semibold text-danger-text" role="alert">
              {erro}
            </p>
          )}

          <button className="mt-7 flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
