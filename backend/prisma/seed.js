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

  console.log('Seeding fleet data...');
  const fleet = [
      { name: "Capesize", capacity: 150000, laden_draft: 18.0, daily_cost: 25000, block_coeff: 0.85, speed_knots: 12.0 },
      { name: "Panamax", capacity: 75000, laden_draft: 14.0, daily_cost: 15000, block_coeff: 0.85, speed_knots: 12.0 },
      { name: "Supramax", capacity: 50000, laden_draft: 11.5, daily_cost: 12000, block_coeff: 0.85, speed_knots: 12.0 },
      { name: "Handysize", capacity: 35000, laden_draft: 10.0, daily_cost: 9500, block_coeff: 0.82, speed_knots: 12.0 }
  ];
  for (const v of fleet) {
      await prisma.vessel.upsert({
          where: { name: v.name },
          update: v,
          create: v,
      });
  }

  console.log('Seeding Completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
