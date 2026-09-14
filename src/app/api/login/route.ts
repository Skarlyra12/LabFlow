import { compare } from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Usuario } from "@/types/usuario";

type UsuarioLogin = Usuario & RowDataPacket;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envie email e senha em formato JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ erro: "Dados de login inválidos." }, { status: 400 });
  }

  const { email, senha } = body as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof senha !== "string" ||
    senha === ""
  ) {
    return NextResponse.json({ erro: "Informe email e senha." }, { status: 400 });
  }

  try {
    const [usuarios] = await db.execute<UsuarioLogin[]>(
      `SELECT id_usuario, nome, email, senha_hash, perfil, ativo
       FROM usuario
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()],
    );
    const usuario = usuarios[0];

    if (!usuario) {
      return NextResponse.json({ erro: "Email ou senha inválidos." }, { status: 401 });
    }

    if (usuario.ativo !== 1) {
      return NextResponse.json({ erro: "Este usuário está inativo." }, { status: 403 });
    }

    if (!(await compare(senha, usuario.senha_hash))) {
      return NextResponse.json({ erro: "Email ou senha inválidos." }, { status: 401 });
    }

    await criarSessao({
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      perfil: usuario.perfil,
    });

    return NextResponse.json({
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      perfil: usuario.perfil,
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível conectar ao banco de dados." }, { status: 500 });
  }
}
