import { NextResponse } from "next/server";
import { laboratorios } from "@/data/laboratorios";
import type { Laboratorio, StatusLaboratorio } from "@/types/laboratorio";

const statusValidos: StatusLaboratorio[] = [
  "DISPONIVEL",
  "OCUPADO",
  "MANUTENCAO",
];

export async function GET() {
  return NextResponse.json(laboratorios);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Envie os dados em formato JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ erro: "Dados do laboratório inválidos." }, { status: 400 });
  }

  const { nome, localizacao, capacidade, descricao, status } = body as Record<string, unknown>;
  const capacidadeConvertida = Number(capacidade);

  if (
    typeof nome !== "string" ||
    nome.trim() === "" ||
    typeof localizacao !== "string" ||
    localizacao.trim() === "" ||
    !Number.isFinite(capacidadeConvertida) ||
    capacidadeConvertida <= 0 ||
    typeof descricao !== "string" ||
    descricao.trim() === "" ||
    typeof status !== "string" ||
    !statusValidos.includes(status as StatusLaboratorio)
  ) {
    return NextResponse.json(
      { erro: "Preencha corretamente todos os campos obrigatórios." },
      { status: 400 },
    );
  }

  const laboratorioCriado: Laboratorio = {
    id: Date.now(),
    nome: nome.trim(),
    localizacao: localizacao.trim(),
    capacidade: capacidadeConvertida,
    descricao: descricao.trim(),
    status: status as StatusLaboratorio,
  };

  return NextResponse.json(laboratorioCriado, { status: 201 });
}
