import { redirect } from "next/navigation";
import NovaSalaClient from "@/components/NovaSalaClient";
import { lerSessao } from "@/lib/auth";

export default async function NovaSalaPage() {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  if (sessao.perfil === "ESTUDANTE") redirect("/salas");
  return <NovaSalaClient perfil={sessao.perfil} />;
}
