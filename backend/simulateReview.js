
const prisma = require('./src/config/db');

async function testSimulate() {
  try {
    const user = await prisma.user.findFirst();
    const vocab = await prisma.userVocabulary.findFirst({
        where: { userId: user.id }
    });

    console.log('Original Level:', vocab.level, 'Next Review:', vocab.nextReview);

    // 1. Move nextReview to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    await prisma.userVocabulary.update({
        where: { id: vocab.id },
        data: { nextReview: yesterday }
    });

    // 2. Fetch for review
    const now = new Date();
    const reviews = await prisma.userVocabulary.findMany({
        where: { userId: user.id, nextReview: { lte: now } }
    });
    console.log('Due for review count after modifying date:', reviews.length);
    const itemToReview = reviews.find(r => r.id === vocab.id);
    if (!itemToReview) {
        console.log('Item not found for review!');
        return;
    }

    // 3. Simulate updateProgress (Correct answer)
    const calculateInterval = (currentLevel) => {
        switch (currentLevel) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 4;
            case 4: return 8;
            case 5: return 15;
            case 6: return 30; // Master
            default: return 1;
        }
    };

    let newLevel = Math.min(itemToReview.level + 1, 6);
    const intervalDays = calculateInterval(newLevel);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + intervalDays);

    const updated = await prisma.userVocabulary.update({
        where: { id: vocab.id },
        data: { level: newLevel, nextReview: nextReview }
    });

    console.log('Updated Level:', updated.level, 'New Next Review:', updated.nextReview);
    console.log('Interval applied (days):', intervalDays);
    
    // Simulate updateProgress (Incorrect answer)
    let newLevelFail = 1;
    if (updated.level <= 4) {
        newLevelFail = Math.max(updated.level - 1, 1);
    } else {
        newLevelFail = 3;
    }
    const intervalDaysFail = calculateInterval(newLevelFail);
    const nextReviewFail = new Date();
    nextReviewFail.setDate(nextReviewFail.getDate() + intervalDaysFail);

    const updatedFail = await prisma.userVocabulary.update({
        where: { id: vocab.id },
        data: { level: newLevelFail, nextReview: nextReviewFail }
    });

    console.log('After fail - Level:', updatedFail.level, 'Next Review:', updatedFail.nextReview);
    console.log('Interval applied (days):', intervalDaysFail);

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
testSimulate();

