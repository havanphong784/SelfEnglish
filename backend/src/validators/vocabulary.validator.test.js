const { importBody, practiceQuery, reviewBody } = require('./vocabulary.validator');

describe('vocabulary.validator', () => {
  it('rejects review payloads without boolean isCorrect', () => {
    expect(() => reviewBody.parse({ isCorrect: 'true' })).toThrow();
    expect(reviewBody.parse({ isCorrect: true })).toEqual({ isCorrect: true });
    expect(() => reviewBody.parse({ rating: 'easy' })).toThrow();
    expect(() => reviewBody.parse({ isCorrect: true, rating: 'easy' })).toThrow();
    expect(() => reviewBody.parse({})).toThrow();
  });

  it('rejects empty imports and accepts valid imported words', () => {
    expect(() => importBody.parse({ words: [] })).toThrow();
    const parsed = importBody.parse({
      title: 'Deck',
      words: [{ word: 'Learn', meaning: 'Hoc' }],
    });
    expect(parsed.words[0]).toEqual({
      word: 'Learn',
      meaning: 'Hoc',
      synonyms: [],
    });
  });

  it('parses practice exclude ids as a UUID list', () => {
    const firstId = '00000000-0000-4000-8000-000000000001';
    const secondId = '00000000-0000-4000-8000-000000000002';

    expect(practiceQuery.parse({})).toEqual({ excludeIds: [] });
    expect(practiceQuery.parse({ excludeIds: `${firstId}, ${secondId}` })).toEqual({
      excludeIds: [firstId, secondId],
    });
    expect(() => practiceQuery.parse({ excludeIds: 'not-a-uuid' })).toThrow();
  });
});
