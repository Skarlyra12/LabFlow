-- LabFlow — migração Sprint 1 -> Sprint 2
-- Execute este arquivo somente se você JÁ possui o banco da Sprint 1 com dados.
-- Faça um backup/export pelo MySQL Workbench antes de executar.

USE labflow;

ALTER TABLE sala
  ADD COLUMN id_professor INT UNSIGNED NULL AFTER id_sala;

ALTER TABLE sala
  ADD CONSTRAINT fk_sala_professor
    FOREIGN KEY (id_professor) REFERENCES professor (id_professor)
    ON DELETE SET NULL;

CREATE INDEX idx_sala_professor ON sala (id_professor);
CREATE INDEX idx_sala_nome ON sala (nome);

CREATE TABLE aula (
  id_aula INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_professor INT UNSIGNED NOT NULL,
  id_sala INT UNSIGNED NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  descricao VARCHAR(500) NULL,
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status ENUM('AGENDADA', 'CANCELADA') NOT NULL DEFAULT 'AGENDADA',
  CONSTRAINT fk_aula_professor
    FOREIGN KEY (id_professor) REFERENCES professor (id_professor),
  CONSTRAINT fk_aula_sala
    FOREIGN KEY (id_sala) REFERENCES sala (id_sala),
  CONSTRAINT chk_aula_horario CHECK (hora_inicio < hora_fim),
  INDEX idx_aula_conflito (id_sala, data, status, hora_inicio, hora_fim),
  INDEX idx_aula_professor (id_professor, data)
);

SELECT p.id_professor, u.nome, u.email, p.registro
FROM professor p
INNER JOIN usuario u ON u.id_usuario = p.id_usuario
WHERE u.ativo = TRUE
ORDER BY u.nome;

-- UPDATE sala SET id_professor = 1 WHERE id_sala = 1;
-- UPDATE sala SET id_professor = 2 WHERE id_sala = 2;

-- Após validar o novo fluxo e possuir backup:
-- DROP TABLE reserva;

DESCRIBE sala;
DESCRIBE aula;
