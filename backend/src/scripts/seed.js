const prisma = require('../config/db');

async function main() {
  console.log('Seeding Database...');

  // Xoá dữ liệu cũ
  await prisma.userVocabulary.deleteMany();
  await prisma.vocabulary.deleteMany();
  await prisma.vocabularyPackage.deleteMany();

  // Tạo Package
  const pkgB1 = await prisma.vocabularyPackage.create({
    data: {
      title: 'Destination B1',
      description: 'Vocabulary and phrasal verbs from Destination B1, organized by topic.',
      level: 'B1',
      isPro: false,
    }
  });

  const pkgB2 = await prisma.vocabularyPackage.create({
    data: {
      title: 'Destination B2',
      description: 'Vocabulary and phrasal verbs from Destination B2, organized by topic.',
      level: 'B2',
      isPro: false,
    }
  });

  const pkgC1 = await prisma.vocabularyPackage.create({
    data: {
      title: 'Destination C1 & C2',
      description: 'Vocabulary for the further passage, mastery',
      level: 'C1-C2',
      isPro: true,
    }
  });

  // Chèn từ vựng cho gói B1
  await prisma.vocabulary.createMany({
    data: [
      { word: 'Accurate', meaning: 'Chính xác', ipa: '/ˈæk.jə.rət/', example: 'The figures they have used are just not accurate.', packageId: pkgB1.id },
      { word: 'Benefit', meaning: 'Lợi ích', ipa: '/ˈben.ɪ.fɪt/', example: 'The discovery of oil brought many benefits to the town.', packageId: pkgB1.id },
      { word: 'Combine', meaning: 'Kết hợp', ipa: '/kəmˈbaɪn/', example: 'None of our machines could combine these two functions.', packageId: pkgB1.id },
      { word: 'Describe', meaning: 'Miêu tả', ipa: '/dɪˈskraɪb/', example: 'Can you describe the man you saw?', packageId: pkgB1.id },
      { word: 'Effort', meaning: 'Nỗ lực', ipa: '/ˈef.ət/', example: 'If we could all make an effort to keep this office tidier it would help.', packageId: pkgB1.id },
    ]
  });

  // Chèn từ vựng cho gói B2
  await prisma.vocabulary.createMany({
    data: [
      { word: 'Diligent', meaning: 'Siêng năng, cần cù', ipa: '/ˈdɪlɪdʒənt/', example: 'He is a diligent student.', packageId: pkgB2.id },
      { word: 'Resilient', meaning: 'Kiên cường, mau phục hồi', ipa: '/rɪˈzɪliənt/', example: 'She is very resilient to stress.', packageId: pkgB2.id },
      { word: 'Obsolete', meaning: 'Lỗi thời, cổ xưa', ipa: '/ˈɒbsəliːt/', example: 'Typewriters are completely obsolete now.', packageId: pkgB2.id },
      { word: 'Meticulous', meaning: 'Tỉ mỉ, quá kỹ càng', ipa: '/məˈtɪkjələs/', example: 'He is very meticulous about his work.', packageId: pkgB2.id },
      { word: 'Lucrative', meaning: 'Có lợi, sinh lợi', ipa: '/ˈluːkrətɪv/', example: 'It is a very lucrative business.', packageId: pkgB2.id }
    ]
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
