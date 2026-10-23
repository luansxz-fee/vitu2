
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './lib/prisma.js';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_PASSWORD;

  if (!email || !senha || senha.length < 12) {
    throw new Error(
      'Configure ADMIN_EMAIL e ADMIN_PASSWORD (mínimo de 12 caracteres) no .env.'
    );
  }

  const senhaHash = await bcrypt.hash(senha, 12);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: { senhaHash, papel: 'ADMINISTRADOR' },
    create: {
      nome: 'Administrador',
      email,
      senhaHash,
      papel: 'ADMINISTRADOR'
    }
  });

  console.log(`Administrador configurado: ${admin.email}`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
