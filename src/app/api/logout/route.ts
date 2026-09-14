import { NextResponse } from "next/server";
import { removerSessao } from "@/lib/auth";

export async function POST() {
  await removerSessao();
  return NextResponse.json({ mensagem: "Sessão encerrada." });
}
