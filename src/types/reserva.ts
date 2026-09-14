export type StatusReserva = "ATIVA" | "CANCELADA";

export type Reserva = {
  id_reserva: number;
  id_usuario: number;
  id_sala: number;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  status: StatusReserva;
};
