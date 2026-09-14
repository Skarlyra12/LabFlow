import { redirect } from "next/navigation";
import SalasClient from "@/components/SalasClient";
import { lerSessao } from "@/lib/auth";

export default async function SalasPage() {
  const sessao = await lerSessao();

  if (!sessao) redirect("/login");

  return <SalasClient perfil={sessao.perfil} />;
}
