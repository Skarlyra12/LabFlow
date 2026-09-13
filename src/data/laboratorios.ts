import type { Laboratorio } from "@/types/laboratorio";

// Dados temporários utilizados antes da integração com MySQL.
export const laboratorios: Laboratorio[] = [
  {
    id: 1,
    nome: "Laboratório de Software",
    localizacao: "Bloco 3 - Sala 201",
    capacidade: 32,
    descricao: "Espaço para aulas práticas de programação e desenvolvimento de sistemas.",
    status: "DISPONIVEL",
  },
  {
    id: 2,
    nome: "Laboratório de Redes",
    localizacao: "Bloco 2 - Sala 105",
    capacidade: 24,
    descricao: "Laboratório destinado a práticas de redes e infraestrutura.",
    status: "OCUPADO",
  },
  {
    id: 3,
    nome: "Laboratório de Eletrônica",
    localizacao: "Bloco 4 - Sala 302",
    capacidade: 20,
    descricao: "Bancadas para atividades de circuitos e sistemas eletrônicos.",
    status: "MANUTENCAO",
  },
];
