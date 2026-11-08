import type { RowDataPacket } from "mysql2/promise";
import { NextResponse } from "next/server";
import { lerSessao } from "@/lib/auth";
import db from "@/lib/db";

type Contexto = { params: Promise<{ id: string }> };

function dataLocalAtual() {
  const agora = new Date();
  const deslocamento = agora.getTimezoneOffset() * 60_000;
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10);
}

export async function GET(request: Request, { params }: Contexto) {
  const sessao = await lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });

  const { id } = await params;
  const idSala = Number(id);
  const data = new URL(request.url).searchParams.get("data") ?? dataLocalAtual();

  if (!Number.isInteger(idSala) || idSala <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return NextResponse.json({ erro: "Sala ou data inválida." }, { status: 400 });

  try {
    const [salas] = await db.execute<RowDataPacket[]>(`SELECT s.id_sala, s.id_professor, s.nome, s.localizacao, s.capacidade, s.status,
              u.nome AS professor_nome, u.email AS professor_email, p.registro AS professor_registro,
              p.id_usuario AS professor_id_usuario
       FROM sala s
       LEFT JOIN professor p ON p.id_professor = s.id_professor
       LEFT JOIN usuario u ON u.id_usuario = p.id_usuario AND u.ativo = TRUE
       WHERE s.id_sala = ?
       LIMIT 1`, [idSala]);
    if (salas.length === 0) return NextResponse.json({ erro: "Sala não encontrada." }, { status: 404 });

    const [aulas] = await db.execute<RowDataPacket[]>(`SELECT a.id_aula, a.titulo, a.descricao, a.hora_inicio, a.hora_fim, u.nome AS professor_nome
       FROM aula a
       INNER JOIN professor p ON p.id_professor = a.id_professor
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
       WHERE a.id_sala = ? AND a.data = ? AND a.status = 'AGENDADA'
       ORDER BY hora_inicio`, [idSala, data]);

    const sala = salas[0];
    const horarios = Array.from({ length: 10 }, (_, indice) => {
      const hora = indice + 8;
      const inicio = `${String(hora).padStart(2, "0")}:00`;
      const fim = `${String(hora + 1).padStart(2, "0")}:00`;
      const aula = aulas.find((item) => String(item.hora_inicio).slice(0, 5) < fim && String(item.hora_fim).slice(0, 5) > inicio);
      return { inicio, fim, disponivel: sala.status === "DISPONIVEL" && !aula, aula: aula ? { id_aula: aula.id_aula, titulo: aula.titulo, descricao: aula.descricao, professor_nome: aula.professor_nome } : null };
    });

    return NextResponse.json({
      id_sala: sala.id_sala, id_professor: sala.id_professor, nome: sala.nome, localizacao: sala.localizacao, capacidade: sala.capacidade, status: sala.status,
      professor: sala.id_professor && sala.professor_nome ? { id_professor: sala.id_professor, nome: sala.professor_nome, email: sala.professor_email, registro: sala.professor_registro } : null,
      pode_gerenciar: sessao.perfil === "ADMIN" || (sessao.perfil === "PROFESSOR" && sala.professor_id_usuario === sessao.id_usuario),
      data, horarios,
    });
  } catch {
    return NextResponse.json({ erro: "Não foi possível carregar os detalhes da sala." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Contexto) {
  const sessao = await lerSessao();
  if (!sessao) return NextResponse.json({ erro: "Usuário não autenticado." }, { status: 401 });
  if (sessao.perfil === "ESTUDANTE") return NextResponse.json({ erro: "Estudantes não podem alterar salas." }, { status: 403 });

  const { id } = await params;
  const idSala = Number(id);
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ erro: "Envie os dados em formato JSON." }, { status: 400 }); }

  const status = body && typeof body === "object" ? (body as Record<string, unknown>).status : null;
  if (!Number.isInteger(idSala) || idSala <= 0 || (status !== "DISPONIVEL" && status !== "MANUTENCAO")) return NextResponse.json({ erro: "Sala ou status inválido." }, { status: 400 });

  try {
    if (sessao.perfil === "ADMIN") {
      const [resultado] = await db.execute<import("mysql2/promise").ResultSetHeader>("UPDATE sala SET status = ? WHERE id_sala = ?", [status, idSala]);
      if (resultado.affectedRows === 0) return NextResponse.json({ erro: "Sala não encontrada." }, { status: 404 });
    } else {
      const [resultado] = await db.execute<import("mysql2/promise").ResultSetHeader>(`UPDATE sala s
         INNER JOIN professor p ON p.id_professor = s.id_professor
         SET s.status = ?
         WHERE s.id_sala = ? AND p.id_usuario = ?`, [status, idSala, sessao.id_usuario]);
      if (resultado.affectedRows === 0) return NextResponse.json({ erro: "Você só pode alterar uma sala associada ao seu perfil." }, { status: 403 });
    }
    return NextResponse.json({ id_sala: idSala, status });
  } catch {
    return NextResponse.json({ erro: "Não foi possível alterar o status da sala." }, { status: 500 });
  }
}
