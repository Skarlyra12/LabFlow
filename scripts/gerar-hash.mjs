import { hash } from "bcryptjs";

const senha = process.argv[2];

if (!senha) {
  console.error('Informe a senha: npm run gerar-hash -- "sua_senha"');
  process.exit(1);
}

console.log(await hash(senha, 12));
