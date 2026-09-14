# LabFlow

Sistema acadêmico para gestão de salas e reservas universitárias.

## Tecnologias

- Next.js
- TypeScript
- Tailwind CSS
- MySQL
- mysql2
- bcryptjs

## Requisitos

- Node.js 20 ou superior
- MySQL Server

## Configurar o MySQL

1. Abra [database/labflow.sql](database/labflow.sql) no MySQL Workbench.
2. Execute o arquivo para criar o banco `labflow` e suas tabelas.
3. Copie `.env.example` para `.env.local` e informe os dados da sua conexão.
4. Troque `AUTH_SECRET` por uma chave aleatória com pelo menos 32 caracteres. Por exemplo: `openssl rand -hex 32`.

## Criar o administrador

Gere o hash da senha localmente:

```bash
npm run gerar-hash -- "sua_senha"
```

No final de `database/labflow.sql`, copie o `INSERT` de exemplo, informe o email desejado e substitua `HASH_BCRYPT_GERADO` pelo resultado do comando. Para testes locais, pode-se usar o email `admin@labflow.local` com uma senha definida somente no seu ambiente.

## Iniciar a aplicação

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.
