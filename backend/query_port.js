const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const ports = await prisma.port.findMany({ take: 1 });
    console.log(ports);
}
main().finally(() => prisma.$disconnect());
