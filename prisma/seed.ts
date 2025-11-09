import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empiretravel.com' },
    update: {},
    create: {
      email: 'admin@empiretravel.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create agent user
  const agentPassword = await bcrypt.hash('agent123', 10);
  const agent = await prisma.user.upsert({
    where: { email: 'agent@empiretravel.com' },
    update: {},
    create: {
      email: 'agent@empiretravel.com',
      name: 'Agent User',
      password: agentPassword,
      role: 'AGENT',
    },
  });

  // Create default pricing rule
  await prisma.pricingRule.upsert({
    where: { id: 'default-pricing-rule' },
    update: {},
    create: {
      id: 'default-pricing-rule',
      name: 'Default Pricing Rules',
      singleSupplementFlat: 50,
      singleSupplementPercent: 30,
      tripleDiscountFlat: 0,
      tripleDiscountPercent: 15,
      childDiscountPercent: 25,
      childAgeLimit: 12,
      defaultTaxRate: 10,
      isDefault: true,
    },
  });

  // Create sample accommodation templates
  await prisma.accommodationTemplate.create({
    data: {
      name: 'Luxury Beach Resort',
      description: '5-star beachfront resort with all-inclusive amenities',
      location: 'Cancun, Mexico',
      singleRoomRate: 200,
      doubleRoomRate: 300,
      tripleRoomRate: 380,
      familyRoomRate: 450,
      singleSupplement: 80,
      tripleDiscount: 20,
      childDiscount: 50,
      taxRate: 10,
    },
  });

  await prisma.accommodationTemplate.create({
    data: {
      name: 'City Center Hotel',
      description: '4-star hotel in the heart of the city',
      location: 'New York, USA',
      singleRoomRate: 150,
      doubleRoomRate: 220,
      tripleRoomRate: 280,
      familyRoomRate: 350,
      singleSupplement: 60,
      tripleDiscount: 15,
      childDiscount: 40,
      taxRate: 12,
    },
  });

  // Create sample transfer templates
  await prisma.transferTemplate.create({
    data: {
      name: 'Airport Transfer - Private',
      description: 'Private transfer from airport to hotel',
      from: 'Airport',
      to: 'Hotel',
      pricePerGroup: 80,
      taxRate: 8,
    },
  });

  await prisma.transferTemplate.create({
    data: {
      name: 'Airport Transfer - Shared',
      description: 'Shared shuttle from airport to hotel',
      from: 'Airport',
      to: 'Hotel',
      pricePerPerson: 15,
      taxRate: 8,
    },
  });

  // Create sample tour templates
  await prisma.tourTemplate.create({
    data: {
      name: 'City Highlights Tour',
      description: 'Full-day guided tour of city attractions',
      location: 'Various',
      duration: 'Full Day (8 hours)',
      pricePerPerson: 120,
      taxRate: 10,
    },
  });

  await prisma.tourTemplate.create({
    data: {
      name: 'Sunset Cruise',
      description: 'Evening cruise with dinner and entertainment',
      location: 'Marina',
      duration: '3 hours',
      pricePerPerson: 85,
      taxRate: 10,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin user: admin@empiretravel.com / admin123');
  console.log('Agent user: agent@empiretravel.com / agent123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
