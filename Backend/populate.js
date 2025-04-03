const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function populateData() {
  for (let i = 0; i < 20; i++) {
    const password = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        name: faker.name.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        password,
      },
    });
  }
  console.log('Populated');
}

populateData()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });