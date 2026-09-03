const prisma = require('../lib/prisma');

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
    ,
    {
      name: 'Mumbai',
      chartedDepth: 11.0,
      permissibleDraft: 10.0,
      brackishDensity: 1.025,
      lat: 18.94,
      lon: 72.83
    },
    {
      name: 'Kandla',
      chartedDepth: 10.5,
      permissibleDraft: 9.5,
      brackishDensity: 1.025,
      lat: 23.03,
      lon: 70.21
    },
    {
      name: 'Mundra',
      chartedDepth: 16.0,
      permissibleDraft: 14.0,
      brackishDensity: 1.025,
      lat: 22.73,
      lon: 69.70
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
      { name: "Capesize", capacity: 150000, laden_draft: 18.0, ballast_draft: 9.0, daily_cost: 25000, block_coeff: 0.84, speed_knots: 14.5 },
      { name: "Panamax", capacity: 75000, laden_draft: 14.0, ballast_draft: 7.0, daily_cost: 15000, block_coeff: 0.83, speed_knots: 14.0 },
      { name: "Supramax", capacity: 50000, laden_draft: 11.5, ballast_draft: 6.0, daily_cost: 12000, block_coeff: 0.81, speed_knots: 14.5 },
      { name: "Handysize", capacity: 35000, laden_draft: 10.0, ballast_draft: 5.0, daily_cost: 9500, block_coeff: 0.80, speed_knots: 13.5 }
  ];
  for (const v of fleet) {
      await prisma.vessel.upsert({
          where: { name: v.name },
          update: v,
          create: v,
      });
  }

  console.log('Seeding Completed.');
  console.log('Seeding initial requisitions...');
  const initialRequisitions = [
    { volume_mt: 145000, destPortName: "Haldia", commodity: "Iron Ore", status: "Feasible", origin: "Newcastle, Australia" },
    { volume_mt: 75000, destPortName: "Paradip", commodity: "Coal", status: "Pending", origin: "Richards Bay, SA" },
    { volume_mt: 200000, destPortName: "Dhamra", commodity: "Bauxite", status: "Feasible", origin: "Dampier, Australia" },
    { volume_mt: 50000, destPortName: "Mumbai", commodity: "Grain", status: "Pending", origin: "Global" },
    { volume_mt: 120000, destPortName: "Mundra", commodity: "Coal", status: "Feasible", origin: "Tubarão, Brazil" },
  ];

  await prisma.requisition.createMany({
    data: initialRequisitions,
    skipDuplicates: true
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
