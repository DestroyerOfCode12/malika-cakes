import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderCustomization.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.catalogTopper.deleteMany();
  await prisma.catalogFilling.deleteMany();
  await prisma.catalogFlavor.deleteMany();
  await prisma.catalogSize.deleteMany();
  await prisma.adminUser.deleteMany();

  // Seed sizes
  const sizes = await prisma.catalogSize.createMany({
    data: [
      {
        name: 'Bento',
        basePrice: 250,
        servingsMin: 1,
        servingsMax: 1,
        description: 'Mini single cake',
      },
      {
        name: '15cm Round',
        basePrice: 400,
        servingsMin: 6,
        servingsMax: 8,
        description: 'Small round cake',
      },
      {
        name: '20cm Round',
        basePrice: 550,
        servingsMin: 12,
        servingsMax: 15,
        description: 'Medium round cake (Most Popular)',
      },
      {
        name: '2-Tier',
        basePrice: 750,
        servingsMin: 20,
        servingsMax: 25,
        description: 'Two tiers stacked',
      },
      {
        name: '3-Tier',
        basePrice: 950,
        servingsMin: 30,
        servingsMax: 40,
        description: 'Three tiers stacked',
      },
      {
        name: 'Cupcakes (Dozen)',
        basePrice: 200,
        servingsMin: 12,
        servingsMax: 12,
        description: 'Minimum 1 dozen',
      },
    ],
  });

  // Seed flavors
  const flavors = await prisma.catalogFlavor.createMany({
    data: [
      { name: 'Vanilla', description: 'Classic vanilla cake' },
      { name: 'Chocolate', description: 'Rich chocolate cake' },
      { name: 'Red Velvet', description: 'Traditional red velvet' },
      { name: 'Carrot', description: 'Spiced carrot cake' },
      { name: 'Lemon', description: 'Zesty lemon cake' },
      { name: 'Strawberry', description: 'Fresh strawberry cake' },
    ],
  });

  // Seed fillings
  const fillings = await prisma.catalogFilling.createMany({
    data: [
      { name: 'Vanilla Buttercream', priceAddon: 50 },
      { name: 'Chocolate Ganache', priceAddon: 75 },
      { name: 'Cream Cheese Frosting', priceAddon: 75 },
      { name: 'Salted Caramel', priceAddon: 100 },
      { name: 'Jam', priceAddon: 50 },
      { name: 'Mousse', priceAddon: 100 },
    ],
  });

  // Seed toppers
  const toppers = await prisma.catalogTopper.createMany({
    data: [
      { name: 'Fresh Berries', priceAddon: 80 },
      { name: 'Fresh Flowers', priceAddon: 120 },
      { name: 'Sprinkles', priceAddon: 30 },
      { name: 'Edible Gold', priceAddon: 50 },
      { name: 'Chocolate Shards', priceAddon: 40 },
      { name: 'Macarons', priceAddon: 100 },
      { name: 'Fondant Decoration', priceAddon: 60 },
      { name: 'Mirror Glaze', priceAddon: 150 },
    ],
  });

  // Seed admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@malikacakes.co.za',
      passwordHash: hashedPassword,
      role: 'owner',
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`   - ${sizes.count} sizes`);
  console.log(`   - ${flavors.count} flavors`);
  console.log(`   - ${fillings.count} fillings`);
  console.log(`   - ${toppers.count} toppers`);
  console.log(`   - 1 admin user`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
