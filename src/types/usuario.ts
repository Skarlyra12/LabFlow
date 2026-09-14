export type Perfil = "ADMIN" | "ESTUDANTE" | "PROFESSOR";

export type Usuario = {
  id_usuario: number;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: Perfil;
  ativo: number;
};
