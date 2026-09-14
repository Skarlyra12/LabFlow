import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { lerSessao } from "@/lib/auth";

export default async function SistemaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessao = await lerSessao();

  if (!sessao) redirect("/login");

  return (
    <>
      <Sidebar sessao={sessao} />
      <main className="min-h-screen md:ml-[272px]">{children}</main>
    </>
  );
}
