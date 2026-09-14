import { hash } from "bcryptjs";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Professor } from "@/types/professor";

type ProfessorBanco = Professor & RowDataPacket;

export async function GET() {
  const sessao = await lerSessao();

  if (!sessao) {
    return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  }

  if (sessao.perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso permitido apenas para administradores." }, { status: 403 });
  }

  try {
    const [professores] = await db.execute<ProfessorBanco[]>(
      `SELECT p.id_professor, p.id_usuario, u.nome, u.email, p.registro, u.ativo
       FROM professor p
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
       ORDER BY u.nome`,
    );

    return NextResponse.json(professores);
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
    return NextResponse.json({ erro: "Dados do professor inválidos." }, { status: 400 });
  }

  const { nome, email, senha, registro } = body as Record<string, unknown>;

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof email !== "string" ||
    !email.includes("@") ||
    typeof senha !== "string" ||
    senha === "" ||
    typeof registro !== "string" ||
    registro.trim() === ""
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

    const [registroExistente] = await conexao.execute<RowDataPacket[]>(
      "SELECT id_professor FROM professor WHERE registro = ? LIMIT 1",
      [registro.trim()],
    );

    if (registroExistente.length > 0) {
      await conexao.rollback();
      return NextResponse.json({ erro: "Já existe um professor com este registro." }, { status: 409 });
    }

    const senha_hash = await hash(senha, 12);
    const [usuarioCriado] = await conexao.execute<ResultSetHeader>(
      `INSERT INTO usuario (nome, email, senha_hash, perfil, ativo)
       VALUES (?, ?, ?, 'PROFESSOR', TRUE)`,
      [nome.trim(), email.trim().toLowerCase(), senha_hash],
    );
    const id_usuario = usuarioCriado.insertId;
    const [professorCriado] = await conexao.execute<ResultSetHeader>(
      "INSERT INTO professor (id_usuario, registro) VALUES (?, ?)",
      [id_usuario, registro.trim()],
    );

    await conexao.commit();

    return NextResponse.json(
      {
        id_professor: professorCriado.insertId,
        id_usuario,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        registro: registro.trim(),
        ativo: 1,
      },
      { status: 201 },
    );
  } catch (erro) {
    if (conexao) await conexao.rollback();

    if ((erro as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ erro: "Email ou registro já cadastrado." }, { status: 409 });
    }

    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  } finally {
    conexao?.release();
  }
}
