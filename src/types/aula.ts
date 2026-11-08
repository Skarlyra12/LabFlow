export type StatusAula = "AGENDADA" | "CANCELADA";

export type Aula = {
  id_aula: number;
  id_professor: number;
  id_sala: number;
  titulo: string;
  descricao: string | null;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: StatusAula;
  sala_nome: string;
  professor_nome: string;
};
