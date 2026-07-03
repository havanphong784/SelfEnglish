
const prisma = require('./src/config/db');

async function testReview() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users.length);
    
    const userVocabs = await prisma.userVocabulary.findMany({ take: 5, include: { vocabulary: true } });
    console.log('UserVocabs:', JSON.stringify(userVocabs, null, 2));

    const now = new Date();
    const reviews = await prisma.userVocabulary.findMany({
      where: {
        nextReview: { lte: now }
      },
      include: { vocabulary: true },
      take: 20
    });
    
    console.log('Due for review:', reviews.length);

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
testReview();

