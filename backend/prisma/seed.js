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
  console.log('Seeding initial requisitions...');
  const initialRequisitions = [
    { volume_mt: 145000, dest_port: "Haldia", commodity: "Iron Ore", status: "Feasible", origin: "Newcastle, Australia" },
    { volume_mt: 75000, dest_port: "Paradip", commodity: "Coal", status: "Pending", origin: "Richards Bay, SA" },
    { volume_mt: 200000, dest_port: "Dhamra", commodity: "Bauxite", status: "Feasible", origin: "Dampier, Australia" },
    { volume_mt: 50000, dest_port: "Mumbai", commodity: "Grain", status: "Pending", origin: "Global" },
    { volume_mt: 120000, dest_port: "Mundra", commodity: "Coal", status: "Feasible", origin: "Tubarão, Brazil" },
  ];

  for (const req of initialRequisitions) {
    await prisma.requisition.create({
      data: req
    });
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
