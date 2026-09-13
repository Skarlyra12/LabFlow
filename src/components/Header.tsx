import type { ReactNode } from "react";

type HeaderProps = {
  titulo: string;
  descricao: string;
  acao?: ReactNode;
};

export default function Header({ titulo, descricao, acao }: HeaderProps) {
  return (
    <header className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="m-0 text-3xl leading-tight font-bold tracking-[-0.025em] text-balance">{titulo}</h1>
        <p className="mt-2 max-w-[65ch] text-[0.95rem] text-muted text-pretty">{descricao}</p>
      </div>
      {acao && <div className="w-full shrink-0 sm:w-auto">{acao}</div>}
    </header>
  );
}
