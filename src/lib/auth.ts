import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { Perfil } from "@/types/usuario";

const nomeCookie = "labflow_session";
const duracaoSessao = 60 * 60 * 8;

export type Sessao = {
  id_usuario: number;
  nome: string;
  perfil: Perfil;
};

type DadosCookie = Sessao & {
  expira_em: number;
};

function obterSegredo() {
  const segredo = process.env.AUTH_SECRET;

  if (!segredo || segredo.length < 32) {
    throw new Error("AUTH_SECRET deve possuir pelo menos 32 caracteres.");
  }

  return segredo;
}

function assinar(valor: string) {
  return createHmac("sha256", obterSegredo()).update(valor).digest("base64url");
}

export async function criarSessao(sessao: Sessao) {
  const dados: DadosCookie = {
    ...sessao,
    expira_em: Date.now() + duracaoSessao * 1000,
  };
  const valor = Buffer.from(JSON.stringify(dados)).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(nomeCookie, `${valor}.${assinar(valor)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: duracaoSessao,
  });
}

export async function lerSessao(): Promise<Sessao | null> {
  const valorCookie = (await cookies()).get(nomeCookie)?.value;

  if (!valorCookie) return null;

  const [valor, assinaturaRecebida] = valorCookie.split(".");

  if (!valor || !assinaturaRecebida) return null;

  try {
    const assinaturaEsperada = assinar(valor);
    const recebida = Buffer.from(assinaturaRecebida);
    const esperada = Buffer.from(assinaturaEsperada);

    if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) {
      return null;
    }

    const dados = JSON.parse(Buffer.from(valor, "base64url").toString()) as DadosCookie;
    const perfisValidos: Perfil[] = ["ADMIN", "ESTUDANTE", "PROFESSOR"];

    if (
      !Number.isInteger(dados.id_usuario) ||
      typeof dados.nome !== "string" ||
      !perfisValidos.includes(dados.perfil) ||
      typeof dados.expira_em !== "number" ||
      dados.expira_em <= Date.now()
    ) {
      return null;
    }

    return {
      id_usuario: dados.id_usuario,
      nome: dados.nome,
      perfil: dados.perfil,
    };
  } catch {
    return null;
  }
}

export async function removerSessao() {
  (await cookies()).delete(nomeCookie);
}
