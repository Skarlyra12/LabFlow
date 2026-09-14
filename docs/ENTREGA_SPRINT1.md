# Sprint 1

PBIs:

- PBI-01 Realizar autenticação de usuário
- PBI-02 Cadastrar estudante
- PBI-03 Cadastrar professor
- PBI-04 Cadastrar sala
- PBI-05 Realizar reserva de sala

## Implementação

| PBI | Rota/tela principal | API | Tabela(s) |
| --- | --- | --- | --- |
| PBI-01 | `/login` | `POST /api/login` e `POST /api/logout` | `usuario` |
| PBI-02 | `/admin/estudantes` e `/admin/estudantes/novo` | `GET/POST /api/estudantes` | `usuario` e `estudante` |
| PBI-03 | `/admin/professores` e `/admin/professores/novo` | `GET/POST /api/professores` | `usuario` e `professor` |
| PBI-04 | `/salas` e `/admin/salas/novo` | `GET/POST /api/salas` | `sala` |
| PBI-05 | `/reservas` | `GET/POST /api/reservas` | `reserva`, `sala` e `usuario` |

## Validações

- [x] Lint
- [x] Build
- [x] MySQL
- [x] Autenticação
- [x] Conflito de reservas

## Resultado dos testes locais

Validação realizada com a aplicação Next.js conectada ao MySQL 26.7.0. Passaram os 14 cenários obrigatórios: login administrativo, login inválido, cadastros e duplicidades de estudante e professor, cadastro de sala, login dos dois perfis, reserva válida, conflito com HTTP 409, bloqueio de sala em manutenção, isolamento das reservas do estudante e visão completa do administrador.

## Entregas manuais ainda necessárias

- Canvas PBB
- Word de especificação
- Imagem Canvas em alta resolução
- Link público Trello
- Screenshot Trello
- Link GitHub
- Screenshot GitHub Insights > Contributors
