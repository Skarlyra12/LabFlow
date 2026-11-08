-- LabFlow — esquema físico consolidado da Sprint 2
-- Uso: instalação limpa / banco novo.
-- Modelo final: usuario, estudante, professor, sala e aula.

CREATE DATABASE IF NOT EXISTS labflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE labflow;

CREATE TABLE usuario (
  id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('ADMIN', 'ESTUDANTE', 'PROFESSOR') NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE estudante (
  id_estudante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL UNIQUE,
  matricula VARCHAR(30) NOT NULL UNIQUE,
  CONSTRAINT fk_estudante_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE professor (
  id_professor INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT UNSIGNED NOT NULL UNIQUE,
  registro VARCHAR(30) NOT NULL UNIQUE,
  CONSTRAINT fk_professor_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario)
    ON DELETE CASCADE
);

CREATE TABLE sala (
  id_sala INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_professor INT UNSIGNED NULL,
  nome VARCHAR(120) NOT NULL,
  localizacao VARCHAR(160) NOT NULL,
  capacidade INT UNSIGNED NOT NULL,
  status ENUM('DISPONIVEL', 'MANUTENCAO') NOT NULL DEFAULT 'DISPONIVEL',
  CONSTRAINT chk_sala_capacidade CHECK (capacidade > 0),
  CONSTRAINT fk_sala_professor
    FOREIGN KEY (id_professor) REFERENCES professor (id_professor)
    ON DELETE SET NULL,
  INDEX idx_sala_professor (id_professor),
  INDEX idx_sala_nome (nome)
);

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

-- Gere o hash com:
-- npm run gerar-hash -- "sua_senha"
--
-- Depois substitua HASH_BCRYPT_GERADO:
-- INSERT INTO usuario (nome, email, senha_hash, perfil, ativo)
-- VALUES ('Administrador', 'admin@labflow.local', 'HASH_BCRYPT_GERADO', 'ADMIN', TRUE);
