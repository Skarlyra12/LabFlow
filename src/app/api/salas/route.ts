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
    if (sessao.perfil === "PROFESSOR") {
      const [salas] = await db.execute<SalaBanco[]>(
        `SELECT s.id_sala, s.id_professor, s.nome, s.localizacao, s.capacidade, s.status
         FROM sala s
         INNER JOIN professor p ON p.id_professor = s.id_professor
         WHERE p.id_usuario = ?
         ORDER BY s.nome`,
        [sessao.id_usuario],
      );
      return NextResponse.json(salas);
    }

    const [salas] = await db.execute<SalaBanco[]>(
      `SELECT id_sala, id_professor, nome, localizacao, capacidade, status
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

  if (sessao.perfil === "ESTUDANTE") {
    return NextResponse.json({ erro: "Estudantes não podem cadastrar salas." }, { status: 403 });
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

  const { nome, localizacao, capacidade, status, id_professor } = body as Record<string, unknown>;
  const capacidadeConvertida = Number(capacidade);
  let idProfessorConvertido = id_professor === "" || id_professor == null ? null : Number(id_professor);

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof localizacao !== "string" ||
    localizacao.trim() === "" ||
    !Number.isInteger(capacidadeConvertida) ||
    capacidadeConvertida <= 0 ||
    typeof status !== "string" ||
    !statusValidos.includes(status as StatusSala) ||
    (idProfessorConvertido !== null && (!Number.isInteger(idProfessorConvertido) || idProfessorConvertido <= 0))
  ) {
    return NextResponse.json({ erro: "Preencha corretamente todos os campos obrigatórios." }, { status: 400 });
  }

  try {
    if (sessao.perfil === "PROFESSOR") {
      const [professores] = await db.execute<RowDataPacket[]>(
        `SELECT p.id_professor
         FROM professor p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario
         WHERE p.id_usuario = ? AND u.ativo = TRUE
         LIMIT 1`,
        [sessao.id_usuario],
      );
      if (!professores[0]) {
        return NextResponse.json({ erro: "Cadastro de professor ativo não encontrado." }, { status: 403 });
      }
      idProfessorConvertido = professores[0].id_professor;
    }

    if (sessao.perfil === "ADMIN" && idProfessorConvertido !== null) {
      const [professoresAtivos] = await db.execute<RowDataPacket[]>(
        `SELECT p.id_professor
         FROM professor p
         INNER JOIN usuario u ON u.id_usuario = p.id_usuario
         WHERE p.id_professor = ? AND u.ativo = TRUE
         LIMIT 1`,
        [idProfessorConvertido],
      );

      if (!professoresAtivos[0]) {
        return NextResponse.json({ erro: "Selecione um professor ativo válido." }, { status: 400 });
      }
    }

    const [resultado] = await db.execute<ResultSetHeader>(
      `INSERT INTO sala (id_professor, nome, localizacao, capacidade, status)
       VALUES (?, ?, ?, ?, ?)`,
      [idProfessorConvertido, nome.trim(), localizacao.trim(), capacidadeConvertida, status],
    );

    const salaCriada: Sala = {
      id_sala: resultado.insertId,
      id_professor: idProfessorConvertido,
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
