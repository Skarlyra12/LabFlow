import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";
import type { Aula } from "@/types/aula";

type AulaBanco = Aula & RowDataPacket;

const consultaBase = `SELECT a.id_aula, a.id_professor, a.id_sala, a.titulo, a.descricao,
                              a.data, a.hora_inicio, a.hora_fim, a.status,
                              s.nome AS sala_nome, u.nome AS professor_nome
                       FROM aula a
                       INNER JOIN sala s ON s.id_sala = a.id_sala
                       INNER JOIN professor p ON p.id_professor = a.id_professor
                       INNER JOIN usuario u ON u.id_usuario = p.id_usuario`;

export async function GET() {
  const sessao = await lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });

  try {
    if (sessao.perfil === "PROFESSOR") {
      const [aulas] = await db.execute<AulaBanco[]>(
        `${consultaBase}
         WHERE p.id_usuario = ?
         ORDER BY a.data DESC, a.hora_inicio DESC`,
        [sessao.id_usuario],
      );
      return NextResponse.json(aulas);
    }

    const [aulas] = await db.execute<AulaBanco[]>(`${consultaBase}
       ORDER BY a.data DESC, a.hora_inicio DESC`);
    return NextResponse.json(aulas);
  } catch {
    return NextResponse.json({ erro: "Não foi possível carregar as aulas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessao = await lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  if (sessao.perfil !== "PROFESSOR") return NextResponse.json({ erro: "Apenas professores podem cadastrar aulas." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ erro: "Envie os dados em formato JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ erro: "Dados da aula inválidos." }, { status: 400 });

  const { id_sala, titulo, descricao, data, hora_inicio, hora_fim } = body as Record<string, unknown>;
  const idSala = Number(id_sala);
  const horarioValido = (valor: unknown): valor is string => typeof valor === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);

  if (!Number.isInteger(idSala) || idSala <= 0 || typeof titulo !== "string" || titulo.trim() === "" || titulo.trim().length > 120 || (descricao != null && typeof descricao !== "string") || typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data) || !horarioValido(hora_inicio) || !horarioValido(hora_fim) || hora_inicio >= hora_fim || hora_inicio < "08:00" || hora_fim > "18:00") {
    return NextResponse.json({ erro: "Preencha corretamente a aula e escolha um horário entre 08:00 e 18:00." }, { status: 400 });
  }

  let conexao: PoolConnection | undefined;
  try {
    conexao = await db.getConnection();
    await conexao.beginTransaction();

    const [professores] = await conexao.execute<RowDataPacket[]>("SELECT id_professor FROM professor WHERE id_usuario = ? LIMIT 1", [sessao.id_usuario]);
    const professor = professores[0];
    if (!professor) { await conexao.rollback(); return NextResponse.json({ erro: "Cadastro de professor não encontrado." }, { status: 403 }); }

    const [salas] = await conexao.execute<RowDataPacket[]>("SELECT id_sala, nome, status FROM sala WHERE id_sala = ? AND id_professor = ? FOR UPDATE", [idSala, professor.id_professor]);
    const sala = salas[0];
    if (!sala) { await conexao.rollback(); return NextResponse.json({ erro: "Você só pode cadastrar aulas em uma sala associada ao seu perfil." }, { status: 403 }); }
    if (sala.status === "MANUTENCAO") { await conexao.rollback(); return NextResponse.json({ erro: "A sala está em manutenção." }, { status: 409 }); }

    const [conflitos] = await conexao.execute<RowDataPacket[]>(`SELECT id_aula FROM aula
       WHERE id_sala = ? AND data = ? AND status = 'AGENDADA'
         AND hora_inicio < ? AND hora_fim > ?
       LIMIT 1`, [idSala, data, hora_fim, hora_inicio]);
    if (conflitos.length > 0) { await conexao.rollback(); return NextResponse.json({ erro: "Já existe uma aula nessa sala durante o período escolhido." }, { status: 409 }); }

    const descricaoLimpa = typeof descricao === "string" && descricao.trim() ? descricao.trim().slice(0, 500) : null;
    const [resultado] = await conexao.execute<ResultSetHeader>(`INSERT INTO aula (id_professor, id_sala, titulo, descricao, data, hora_inicio, hora_fim, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'AGENDADA')`, [professor.id_professor, idSala, titulo.trim(), descricaoLimpa, data, hora_inicio, hora_fim]);
    await conexao.commit();

    return NextResponse.json({ id_aula: resultado.insertId, id_professor: professor.id_professor, id_sala: idSala, titulo: titulo.trim(), descricao: descricaoLimpa, data, hora_inicio, hora_fim, status: "AGENDADA", sala_nome: sala.nome, professor_nome: sessao.nome }, { status: 201 });
  } catch {
    if (conexao) await conexao.rollback();
    return NextResponse.json({ erro: "Não foi possível cadastrar a aula." }, { status: 500 });
  } finally {
    conexao?.release();
  }
}
