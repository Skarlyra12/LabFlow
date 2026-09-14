import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Sala, StatusSala } from "@/types/sala";

type SalaBanco = Sala & RowDataPacket;

const statusValidos: StatusSala[] = ["DISPONIVEL", "MANUTENCAO"];

export async function GET() {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  try {
    const [salas] = await db.execute<SalaBanco[]>(
      `SELECT id_sala, nome, localizacao, capacidade, status
       FROM sala
       ORDER BY nome`,
    );

    return NextResponse.json(salas);
  } catch {
    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  if (sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso permitido apenas para administradores." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envie os dados em formato JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ erro: "Dados da sala inválidos." }, { status: 400 });
  }

  const { nome, localizacao, capacidade, status } = body as Record<string, unknown>;
  const capacidadeConvertida = Number(capacidade);

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof localizacao !== "string" ||
    localizacao.trim() === "" ||
    !Number.isInteger(capacidadeConvertida) ||
    capacidadeConvertida <= 0 ||
    typeof status !== "string" ||
    !statusValidos.includes(status as StatusSala)
  ) {
    return NextResponse.json({ erro: "Preencha corretamente todos os campos obrigatórios." }, { status: 400 });
  }

  try {
    const [resultado] = await db.execute<ResultSetHeader>(
      `INSERT INTO sala (nome, localizacao, capacidade, status)
       VALUES (?, ?, ?, ?)`,
      [nome.trim(), localizacao.trim(), capacidadeConvertida, status],
    );

    const salaCriada: Sala = {
      id_sala: resultado.insertId,
      nome: nome.trim(),
      localizacao: localizacao.trim(),
      capacidade: capacidadeConvertida,
      status: status as StatusSala,
    };

    return NextResponse.json(salaCriada, { status: 201 });
  } catch {
    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  }
}
