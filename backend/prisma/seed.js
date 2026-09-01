const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding port bathymetry data...');

  const ports = [
    {
      name: 'Haldia',
      chartedDepth: 8.5,
      permissibleDraft: 7.5,
      brackishDensity: 1.010,
      lat: 22.02,
      lon: 88.06
    },
    {
      name: 'Paradip',
      chartedDepth: 17.1,
      permissibleDraft: 14.5,
      brackishDensity: 1.025,
      lat: 20.26,
      lon: 86.67
    },
    {
      name: 'Dhamra',
      chartedDepth: 18.0,
      permissibleDraft: 16.0,
      brackishDensity: 1.020,
      lat: 20.83,
      lon: 86.96
    }
  ];

  for (const p of ports) {
    await prisma.port.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
