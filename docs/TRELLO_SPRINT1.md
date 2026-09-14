# Trello — Sprint 1

## PBI-01 — Realizar autenticação de usuário

- **Título:** PBI-01 — Realizar autenticação de usuário
- **Labels:** PBI; Sprint 1
- **Responsável:** Gabriel Skarbek Lyra
- **User Story:** Como usuário cadastrado, quero entrar no LabFlow com email e senha para acessar as funcionalidades permitidas ao meu perfil.
- **Critério de Aceite 1 — fluxo principal:** Dado um usuário ativo com credenciais válidas, quando ele realizar o login, então o sistema deve criar uma sessão segura e permitir o acesso conforme seu perfil.
- **Critério de Aceite 2 — fluxo alternativo:** Dadas credenciais inválidas ou um usuário inativo, quando houver tentativa de login, então o sistema deve negar o acesso e exibir uma mensagem coerente.
- **Checklist técnico:**
  - [ ] Consultar `usuario` por email
  - [ ] Validar usuário ativo
  - [ ] Comparar a senha com bcrypt
  - [ ] Criar cookie HTTP-only assinado
  - [ ] Remover o cookie no logout
- **Sugestão de status final:** Concluído

## PBI-02 — Cadastrar estudante

- **Título:** PBI-02 — Cadastrar estudante
- **Labels:** PBI; Sprint 1
- **Responsável:** Gabriel Skarbek Lyra
- **User Story:** Como administrador, quero cadastrar estudantes para que eles possam acessar o sistema e realizar reservas.
- **Critério de Aceite 1 — fluxo principal:** Dados nome, email, senha e matrícula válidos, quando o administrador confirmar o cadastro, então o usuário e o estudante devem ser persistidos juntos.
- **Critério de Aceite 2 — fluxo alternativo:** Dado email ou matrícula já cadastrado, quando o administrador tentar salvar, então o sistema deve rejeitar a duplicidade sem criar usuário órfão.
- **Checklist técnico:**
  - [ ] Restringir tela e API ao ADMIN
  - [ ] Validar campos obrigatórios
  - [ ] Validar email e matrícula únicos
  - [ ] Gerar senha com bcrypt
  - [ ] Usar transação com commit ou rollback
- **Sugestão de status final:** Concluído

## PBI-03 — Cadastrar professor

- **Título:** PBI-03 — Cadastrar professor
- **Labels:** PBI; Sprint 1
- **Responsável:** Gabriel Skarbek Lyra
- **User Story:** Como administrador, quero cadastrar professores para que eles possam acessar o sistema e realizar reservas.
- **Critério de Aceite 1 — fluxo principal:** Dados nome, email, senha e registro válidos, quando o administrador confirmar o cadastro, então o usuário e o professor devem ser persistidos juntos.
- **Critério de Aceite 2 — fluxo alternativo:** Dado email ou registro já cadastrado, quando o administrador tentar salvar, então o sistema deve rejeitar a duplicidade sem criar usuário órfão.
- **Checklist técnico:**
  - [ ] Restringir tela e API ao ADMIN
  - [ ] Validar campos obrigatórios
  - [ ] Validar email e registro únicos
  - [ ] Gerar senha com bcrypt
  - [ ] Usar transação com commit ou rollback
- **Sugestão de status final:** Concluído

## PBI-04 — Cadastrar sala

- **Título:** PBI-04 — Cadastrar sala
- **Labels:** PBI; Sprint 1
- **Responsável:** Gabriel Skarbek Lyra
- **User Story:** Como administrador, quero cadastrar salas para disponibilizá-las para consulta e reserva no LabFlow.
- **Critério de Aceite 1 — fluxo principal:** Dados nome, localização, capacidade positiva e status válido, quando o administrador confirmar o cadastro, então a sala deve ser persistida e exibida na listagem.
- **Critério de Aceite 2 — fluxo alternativo:** Dados ausentes, capacidade inválida ou status não permitido, quando houver tentativa de cadastro, então o sistema deve rejeitar a operação.
- **Checklist técnico:**
  - [ ] Restringir cadastro ao ADMIN
  - [ ] Validar os quatro campos oficiais
  - [ ] Aceitar apenas `DISPONIVEL` ou `MANUTENCAO`
  - [ ] Persistir e listar pelo MySQL
- **Sugestão de status final:** Concluído

## PBI-05 — Realizar reserva de sala

- **Título:** PBI-05 — Realizar reserva de sala
- **Labels:** PBI; Sprint 1
- **Responsável:** Gabriel Skarbek Lyra
- **User Story:** Como estudante ou professor, quero reservar uma sala em uma data e horário para utilizar o espaço sem conflito com outra reserva.
- **Critério de Aceite 1 — fluxo principal:** Dada uma sala disponível e um período livre, quando o usuário autenticado confirmar a reserva, então o sistema deve vinculá-la ao usuário da sessão e persistir a reserva ativa.
- **Critério de Aceite 2 — fluxo alternativo:** Dada uma sala em manutenção, inexistente ou já reservada no período, quando houver tentativa de reserva, então o sistema deve bloquear a operação e informar o motivo.
- **Checklist técnico:**
  - [ ] Permitir POST apenas a ESTUDANTE e PROFESSOR
  - [ ] Obter `id_usuario` da sessão
  - [ ] Validar sala, data e intervalo de horários
  - [ ] Bloquear sala em manutenção
  - [ ] Verificar conflito e criar dentro de transação
  - [ ] Retornar HTTP 409 para sobreposição
- **Sugestão de status final:** Concluído
