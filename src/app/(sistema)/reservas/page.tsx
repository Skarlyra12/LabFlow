import { redirect } from "next/navigation";
import ReservasClient from "@/components/ReservasClient";
import { lerSessao } from "@/lib/auth";

export default async function ReservasPage() {
  const sessao = await lerSessao();

  if (!sessao) redirect("/login");

  return <ReservasClient perfil={sessao.perfil} />;
}
