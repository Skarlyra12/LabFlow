export type StatusSala = "DISPONIVEL" | "MANUTENCAO";

export type Sala = {
  id_sala: number;
  id_professor: number | null;
  nome: string;
  localizacao: string;
  capacidade: number;
  status: StatusSala;
};

export type ProfessorDaSala = {
  id_professor: number;
  nome: string;
  email: string;
  registro: string;
};

export type HorarioSala = {
  inicio: string;
  fim: string;
  disponivel: boolean;
  aula: {
    id_aula: number;
    titulo: string;
    descricao: string | null;
    professor_nome: string;
  } | null;
};

export type DetalhesSala = Sala & {
  professor: ProfessorDaSala | null;
  pode_gerenciar: boolean;
  data: string;
  horarios: HorarioSala[];
};
