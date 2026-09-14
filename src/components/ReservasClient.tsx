"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import Header from "@/components/Header";
import type { Reserva } from "@/types/reserva";
import type { Sala } from "@/types/sala";
import type { Perfil } from "@/types/usuario";

const campo = "min-h-12 w-full rounded-lg border border-[oklch(0.78_0.018_250)] bg-surface px-3.5 py-2.5 text-ink hover:border-[oklch(0.65_0.035_250)]";
const estadoBase = "rounded-xl border border-line bg-surface p-7 text-muted";

export default function ReservasClient({ perfil }: { perfil: Perfil }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [id_sala, setIdSala] = useState("");
  const [data, setData] = useState("");
  const [hora_inicio, setHoraInicio] = useState("");
  const [hora_fim, setHoraFim] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    async function carregarDados() {
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

    carregarDados();
  }, []);

  async function criarReserva(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setEnviando(true);

    try {
      const resposta = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_sala, data, hora_inicio, hora_fim }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setMensagem(dados.erro ?? "Não foi possível criar a reserva.");
        return;
      }

      setReservas((reservasAtuais) => [dados, ...reservasAtuais]);
      setMensagem("Reserva realizada com sucesso.");
      setIdSala("");
      setData("");
      setHoraInicio("");
      setHoraFim("");
    } catch {
      setMensagem("Não foi possível conectar à API.");
    } finally {
      setEnviando(false);
    }
  }

  const sucesso = mensagem === "Reserva realizada com sucesso.";

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <Header
        titulo={perfil === "ADMIN" ? "Reservas" : "Minhas Reservas"}
        descricao={perfil === "ADMIN" ? "Visualize as reservas cadastradas." : "Realize e consulte suas reservas de sala."}
      />

      {carregando && <div className={estadoBase}>Carregando...</div>}
      {erro && <div className={`${estadoBase} text-danger-text`}>Erro ao carregar reservas. Verifique a conexão com o banco de dados.</div>}

      {!carregando && !erro && (
        <>
          {perfil !== "ADMIN" && (
            <form className="rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)] sm:p-7" onSubmit={criarReserva} aria-busy={enviando}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <CalendarDays className="size-5" strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-bold">Nova reserva</h2>
                  <p className="mt-0.5 text-sm text-muted">Informe a sala, a data e o período.</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-x-5 md:grid-cols-4">
                <div className="mb-5 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold" htmlFor="id_sala">Sala</label>
                  <select className={campo} id="id_sala" name="id_sala" value={id_sala} onChange={(event) => setIdSala(event.target.value)} required>
                    <option value="">Selecione uma sala</option>
                    {salas.filter((sala) => sala.status === "DISPONIVEL").map((sala) => (
                      <option key={sala.id_sala} value={sala.id_sala}>{sala.nome} — {sala.localizacao}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-5 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold" htmlFor="data">Data</label>
                  <input className={campo} id="data" name="data" type="date" value={data} onChange={(event) => setData(event.target.value)} required />
                </div>
                <div className="mb-5 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold" htmlFor="hora_inicio">Hora de início</label>
                  <input className={campo} id="hora_inicio" name="hora_inicio" type="time" value={hora_inicio} onChange={(event) => setHoraInicio(event.target.value)} required />
                </div>
                <div className="mb-5 md:col-span-2">
                  <label className="mb-2 block text-sm font-bold" htmlFor="hora_fim">Hora de término</label>
                  <input className={campo} id="hora_fim" name="hora_fim" type="time" value={hora_fim} onChange={(event) => setHoraFim(event.target.value)} required />
                </div>
              </div>

              {mensagem && <p className={`mb-5 rounded-lg px-3.5 py-3 text-sm font-semibold ${sucesso ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text"}`} role="status">{mensagem}</p>}

              <div className="flex justify-end border-t border-line pt-5">
                <button className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-sidebar disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" type="submit" disabled={enviando || salas.length === 0}>
                  {enviando ? "Reservando..." : "Realizar reserva"}
                </button>
              </div>
            </form>
          )}

          <section className={perfil === "ADMIN" ? "" : "mt-9"}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-[-0.02em]">Reservas cadastradas</h2>
                <p className="mt-1 text-sm text-muted">{perfil === "ADMIN" ? "Todas as reservas do sistema." : "Reservas vinculadas ao seu usuário."}</p>
              </div>
              <strong className="text-sm tabular-nums">{reservas.length}</strong>
            </div>

            {reservas.length === 0 ? (
              <div className={estadoBase}>Nenhuma reserva cadastrada.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-[0_1px_2px_oklch(0.22_0.035_255/0.04)]">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-page text-muted">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Sala</th>
                      {perfil === "ADMIN" && <th className="px-5 py-3.5 font-semibold">Usuário</th>}
                      <th className="px-5 py-3.5 font-semibold">Data</th>
                      <th className="px-5 py-3.5 font-semibold">Horário</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((reserva) => {
                      const sala = salas.find((item) => item.id_sala === reserva.id_sala);
                      return (
                        <tr className="border-t border-line" key={reserva.id_reserva}>
                          <td className="px-5 py-4 font-semibold">{sala?.nome ?? `Sala #${reserva.id_sala}`}</td>
                          {perfil === "ADMIN" && <td className="px-5 py-4 text-muted">#{reserva.id_usuario}</td>}
                          <td className="px-5 py-4 text-muted">{reserva.data.split("-").reverse().join("/")}</td>
                          <td className="px-5 py-4 text-muted">{reserva.hora_inicio.slice(0, 5)}–{reserva.hora_fim.slice(0, 5)}</td>
                          <td className="px-5 py-4"><span className={reserva.status === "ATIVA" ? "text-success-text" : "text-danger-text"}>{reserva.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
