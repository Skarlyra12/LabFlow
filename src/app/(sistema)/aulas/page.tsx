import { redirect } from "next/navigation";
import AulasClient from "@/components/AulasClient";
import { lerSessao } from "@/lib/auth";

type Props = { searchParams: Promise<{ sala?: string; data?: string; inicio?: string; fim?: string }> };

export default async function AulasPage({ searchParams }: Props) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");
  return <AulasClient perfil={sessao.perfil} valoresIniciais={await searchParams} />;
}
