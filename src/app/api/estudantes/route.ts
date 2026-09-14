import { hash } from "bcryptjs";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Estudante } from "@/types/estudante";

type EstudanteBanco = Estudante & RowDataPacket;

export async function GET() {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  if (sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso permitido apenas para administradores." }, { status: 403 });
  }

  try {
    const [estudantes] = await db.execute<EstudanteBanco[]>(
      `SELECT e.id_estudante, e.id_usuario, u.nome, u.email, e.matricula, u.ativo
       FROM estudante e
       INNER JOIN usuario u ON u.id_usuario = e.id_usuario
       ORDER BY u.nome`,
    );

    return NextResponse.json(estudantes);
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
    return NextResponse.json({ erro: "Dados do estudante inválidos." }, { status: 400 });
  }

  const { nome, email, senha, matricula } = body as Record<string, unknown>;

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof senha !== "string" ||
    senha === "" ||
    typeof matricula !== "string" ||
    matricula.trim() === ""
  ) {
    return NextResponse.json({ erro: "Preencha corretamente todos os campos obrigatórios." }, { status: 400 });
  }

  let conexao: PoolConnection | undefined;

  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();

    const [emailExistente] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_usuario FROM usuario WHERE email = ? LIMIT 1",
      [email.trim().toLowerCase()],
    );

    if (emailExistente.length > 0) {
      await conexao.rollback();
      return NextResponse.json({ erro: "Já existe um usuário com este email." }, { status: 409 });
    }

    const [matriculaExistente] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_estudante FROM estudante WHERE matricula = ? LIMIT 1",
      [matricula.trim()],
    );

    if (matriculaExistente.length > 0) {
      await conexao.rollback();
      return NextResponse.json({ erro: "Já existe um estudante com esta matrícula." }, { status: 409 });
    }

    const senha_hash = await hash(senha, 12);
    const [usuarioCriado] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO usuario (nome, email, senha_hash, perfil, ativo)
       VALUES (?, ?, ?, 'ESTUDANTE', TRUE)`,
      [nome.trim(), email.trim().toLowerCase(), senha_hash],
    );
    const id_usuario = usuarioCriado.insertId;
    const [estudanteCriado] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO estudante (id_usuario, matricula) VALUES (?, ?)",
      [id_usuario, matricula.trim()],
    );

    await conexao.commit();

    return NextResponse.json(
      {
        id_estudante: estudanteCriado.insertId,
        id_usuario,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        matricula: matricula.trim(),
        ativo: 1,
      },
      { status: 201 },
    );
  } catch (erro) {
    if (conexao) await conexao.rollback();

    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ erro: "Email ou matrícula já cadastrado." }, { status: 409 });
    }

    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  } finally {
    conexao?.release();
  }
}
