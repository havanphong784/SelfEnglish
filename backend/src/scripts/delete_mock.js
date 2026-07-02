const prisma = require('../config/db');

async function main() {
  console.log('Deleting mock vocabulary packages...');
  
  const mockTitles = ['Destination B1', 'Destination B2', 'Destination C1 & C2'];
  
  const packages = await prisma.vocabularyPackage.findMany({
    where: {
      title: {
        in: mockTitles
      }
    }
  });

  for (const pkg of packages) {
    // Delete user vocabularies related to this package
    const vocabularies = await prisma.vocabulary.findMany({
      where: { packageId: pkg.id },
      select: { id: true }
    });
    
    const vocabIds = vocabularies.map(v => v.id);
    
    if (vocabIds.length > 0) {
      await prisma.userVocabulary.deleteMany({
        where: { vocabularyId: { in: vocabIds } }
      });
      await prisma.reviewHistory.deleteMany({
        where: { vocabularyId: { in: vocabIds } }
      });
    }

    // Delete vocabularies
    await prisma.vocabulary.deleteMany({
      where: { packageId: pkg.id }
    });

    // Delete package
    await prisma.vocabularyPackage.delete({
      where: { id: pkg.id }
    });
    
    console.log(`Deleted package: ${pkg.title}`);
  }
  
  console.log('Finished deleting mock packages!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
