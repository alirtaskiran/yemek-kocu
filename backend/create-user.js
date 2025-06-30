const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    console.log('Creating user...');
    
    const hashedPassword = await bcrypt.hash('Rum3838!!', 10);
    
    const user = await prisma.user.create({
      data: {
        username: 'rumeysataskiran',
        email: 'rumeysataskiran@gmail.com', 
        password: hashedPassword
      }
    });
    
    console.log('✅ User created successfully!');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('ID:', user.id);
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 