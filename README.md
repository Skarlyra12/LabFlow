# LabFlow

Sistema acadêmico para gestão de salas e programação de aulas universitárias.

## Tecnologias

- Next.js
- TypeScript
- Tailwind CSS
- MySQL
- mysql2
- bcryptjs

## Sprint 2

A Sprint 2 evolui o LabFlow para:
- filtro de salas por nome;
- consulta detalhada de sala e grade de horários;
- programação de aulas pelo professor responsável;
- consulta de aulas por perfil;
- alteração do status da sala;
- vínculo de professor responsável;
- bloqueio de conflito de horário e de salas em manutenção.

## Banco de dados

Para instalação limpa, execute `database/labflow.sql`.

Para atualizar um banco existente da Sprint 1, faça backup e execute `database/migracao_sprint1_para_sprint2.sql`.

O modelo consolidado da Sprint 2 utiliza as tabelas `usuario`, `estudante`, `professor`, `sala` e `aula`.

## Iniciar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.
