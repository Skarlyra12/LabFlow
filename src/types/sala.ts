export type StatusSala = "DISPONIVEL" | "MANUTENCAO";

export type Sala = {
  id_sala: number;
  nome: string;
  localizacao: string;
  capacidade: number;
  status: StatusSala;
};
