import { redirect } from "next/navigation";
import { lerSessao } from "@/lib/auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessao = await lerSessao();

  if (!sessao) redirect("/login");
  if (sessao.perfil !== "ADMIN") redirect("/");

  return children;
}
