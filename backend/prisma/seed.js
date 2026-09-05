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

  console.log('Clearing old requisitions...');
  await prisma.requisition.deleteMany({});

  console.log('Generating massive mock dataset for requisitions...');

  const statuses = ["Infeasible", "Pending Evaluation", "Converted", "Feasible", "Allocated"];
  const commodities = ["Thermal Coal", "Coking Coal", "Metallurgical Coal", "Iron Ore", "Bauxite", "Grain"];
  const origins = [
    "Port Hedland, Australia",
    "Newcastle, Australia",
    "Richards Bay, South Africa",
    "Dampier, Australia",
    "Tubarão, Brazil",
    "Samarinda, Indonesia",
    "Baltimore, USA",
    "Gladstone, Australia"
  ];
  const destPorts = ports.map(p => p.name);

  const generateRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  };

  const mockRequisitions = [];
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

  for (let i = 0; i < 500; i++) {
    mockRequisitions.push({
      volume_mt: Math.floor(Math.random() * (200000 - 30000 + 1)) + 30000,
      destPortName: destPorts[Math.floor(Math.random() * destPorts.length)],
      commodity: commodities[Math.floor(Math.random() * commodities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      origin: origins[Math.floor(Math.random() * origins.length)],
      createdAt: generateRandomDate(twoYearsAgo, now)
    });
  }

  console.log(`Inserting ${mockRequisitions.length} requisitions...`);
  await prisma.requisition.createMany({
    data: mockRequisitions,
    skipDuplicates: true
  });
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
