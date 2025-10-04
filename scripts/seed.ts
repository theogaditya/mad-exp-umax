import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create departments
    const departments = [
      { name: 'General Medicine' },
      { name: 'Orthopedics' },
      { name: 'Cardiology' },
      { name: 'Neurology' },
      { name: 'Pediatrics' },
      { name: 'Dermatology' },
      { name: 'Gynecology' },
      { name: 'Emergency' }
    ];

    for (const dept of departments) {
      const department = await prisma.department.upsert({
        where: { name: dept.name },
        update: {},
        create: dept
      });

      // Create 2 normal counters and 1 special counter for each department
      const counters = [
        { name: `${dept.name} Counter 1`, isSpecial: false },
        { name: `${dept.name} Counter 2`, isSpecial: false },
        { name: `${dept.name} Priority Counter`, isSpecial: true }
      ];

      for (const counter of counters) {
        await prisma.counter.create({
          data: {
            name: counter.name,
            departmentId: department.id,
            isSpecial: counter.isSpecial
          }
        });
      }

      console.log(`✅ Created department: ${dept.name} with 3 counters`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
