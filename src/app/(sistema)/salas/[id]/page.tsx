import { redirect } from "next/navigation";
import SalaDetalhesClient from "@/components/SalaDetalhesClient";
import { lerSessao } from "@/lib/auth";

type Props = { params: Promise<{ id: string }> };

export default async function SalaDetalhesPage({ params }: Props) {
  const sessao = await lerSessao();
  if (!sessao) redirect("/login");

  const { id } = await params;
  return <SalaDetalhesClient idSala={id} perfil={sessao.perfil} />;
}
