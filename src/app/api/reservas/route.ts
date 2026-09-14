import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Reserva } from "@/types/reserva";

type ReservaBanco = Reserva & RowDataPacket;

export async function GET() {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  try {
    if (sessao.perfil === "ADMIN") {
      const [reservas] = await db.execute<ReservaBanco[]>(
        `SELECT id_reserva, id_usuario, id_sala, data, hora_inicio, hora_fim, status
         FROM reserva
         ORDER BY data DESC, hora_inicio DESC`,
      );
      return NextResponse.json(reservas);
    }

    const [reservas] = await db.execute<ReservaBanco[]>(
      `SELECT id_reserva, id_usuario, id_sala, data, hora_inicio, hora_fim, status
       FROM reserva
       WHERE id_usuario = ?
       ORDER BY data DESC, hora_inicio DESC`,
      [sessao.id_usuario],
    );
    return NextResponse.json(reservas);
  } catch {
    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  if (sessao.perfil === "ADMIN") {
    return NextResponse.json({ erro: "A reserva deve ser realizada por estudante ou professor." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envie os dados em formato JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ erro: "Dados da reserva inválidos." }, { status: 400 });
  }

  const { id_sala, data, hora_inicio, hora_fim } = body as Record<string, unknown>;
  const idSalaConvertido = Number(id_sala);
  const dataValida = typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data);
  const horaInicioValida = typeof hora_inicio === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora_inicio);
  const horaFimValida = typeof hora_fim === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora_fim);

  if (
    !Number.isInteger(idSalaConvertido) ||
    idSalaConvertido <= 0 ||
    !dataValida ||
    !horaInicioValida ||
    !horaFimValida ||
    hora_inicio >= hora_fim
  ) {
    return NextResponse.json({ erro: "Preencha corretamente os dados e o período da reserva." }, { status: 400 });
  }

  let conexao: PoolConnection | undefined;

  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();

    const [salas] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_sala, status FROM sala WHERE id_sala = ? FOR UPDATE",
      [idSalaConvertido],
    );

    if (salas.length === 0) {
      await conexao.rollback();
      return NextResponse.json({ erro: "Sala não encontrada." }, { status: 400 });
    }

    if (salas[0].status === "MANUTENCAO") {
      await conexao.rollback();
      return NextResponse.json(
        { erro: "Sala em manutenção não pode ser reservada." },
        { status: 409 },
      );
    }

    const [conflitos] = await conexao.execute<RowDataPacket[]>(
      `SELECT id_reserva
       FROM reserva
       WHERE id_sala = ?
         AND data = ?
         AND status = 'ATIVA'
         AND hora_inicio < ?
         AND hora_fim > ?
       LIMIT 1`,
      [idSalaConvertido, data, hora_fim, hora_inicio],
    );

    if (conflitos.length > 0) {
      await conexao.rollback();
      return NextResponse.json(
        { erro: "A sala já possui uma reserva nesse período." },
        { status: 409 },
      );
    }

    const [resultado] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO reserva (id_usuario, id_sala, data, hora_inicio, hora_fim, status)
       VALUES (?, ?, ?, ?, ?, 'ATIVA')`,
      [sessao.id_usuario, idSalaConvertido, data, hora_inicio, hora_fim],
    );

    await conexao.commit();

    const reservaCriada: Reserva = {
      id_reserva: resultado.insertId,
      id_usuario: sessao.id_usuario,
      id_sala: idSalaConvertido,
      data,
      hora_inicio,
      hora_fim,
      status: "ATIVA",
    };

    return NextResponse.json(reservaCriada, { status: 201 });
  } catch {
    if (conexao) await conexao.rollback();
    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  } finally {
    conexao?.release();
  }
}
