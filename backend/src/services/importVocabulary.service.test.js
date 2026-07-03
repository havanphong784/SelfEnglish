const {
  buildImportPackageData,
  normalizeImportedWord,
} = require('./importVocabulary.service');

describe('importVocabulary.service', () => {
  it('normalizes optional word fields', () => {
    expect(normalizeImportedWord({
      word: '  diligent ',
      meaning: ' can cu ',
      ipa: ' ',
      example: ' He studies daily. ',
      partOfSpeech: ' adjective ',
      synonyms: [' hard-working ', '', 'careful'],
    }, 'pkg-1')).toEqual({
      word: 'diligent',
      meaning: 'can cu',
      ipa: null,
      example: 'He studies daily.',
      partOfSpeech: 'adjective',
      synonyms: ['hard-working', 'careful'],
      packageId: 'pkg-1',
    });
  });

  it('builds private user-owned package data by default', () => {
    const data = buildImportPackageData({
      title: '',
      description: '',
      level: '',
      userId: 'user-1',
      now: new Date('2026-07-03T00:00:00.000Z'),
    });

    expect(data).toMatchObject({
      title: 'Tu vung Import (3/7/2026)',
      description: 'Goi tu vung ca nhan duoc import tu file JSON.',
      level: 'Tuy chon',
      isPro: false,
      ownerId: 'user-1',
      visibility: 'private',
    });
  });
});
