const { importBody, reviewBody } = require('./vocabulary.validator');

describe('vocabulary.validator', () => {
  it('rejects review payloads without boolean isCorrect', () => {
    expect(() => reviewBody.parse({ isCorrect: 'true' })).toThrow();
    expect(reviewBody.parse({ isCorrect: true })).toEqual({ isCorrect: true });
    expect(reviewBody.parse({ rating: 'easy' })).toEqual({ rating: 'easy' });
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
});
