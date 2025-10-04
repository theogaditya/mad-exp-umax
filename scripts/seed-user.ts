import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUser() {
  try {
    console.log('🌱 Creating test user...');

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        age: 25,
        isSpecial: false,
      }
    });

    console.log('✅ Created test user:', {
      email: user.email,
      name: user.name,
      id: user.id
    });

    console.log('🎉 Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedUser();
