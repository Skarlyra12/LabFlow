export type StatusLaboratorio = "DISPONIVEL" | "OCUPADO" | "MANUTENCAO";

export type Laboratorio = {
  id: number;
  nome: string;
  localizacao: string;
  capacidade: number;
  descricao: string;
  status: StatusLaboratorio;
};
