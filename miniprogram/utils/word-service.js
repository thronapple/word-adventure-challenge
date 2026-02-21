const { CET4_WORDS } = require('../data/cet4-words.js');

/**
 * Seeded pseudo-random number generator for deterministic level content.
 * Same level always produces same word sequence.
 */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Shuffle array using Fisher-Yates with seeded RNG.
 */
function seededShuffle(arr, rng) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

/**
 * Get the difficulty tier range for a given level.
 * Levels 1-20 → tiers 1-2, Levels 21-40 → tiers 3-4, Levels 41-60 → tiers 5-6
 */
function getTiersForLevel(level) {
  if (level <= 20) return [1, 2];
  if (level <= 40) return [3, 4];
  return [5, 6];
}

/**
 * Get 10 words for a given level. Deterministic: same level = same words.
 */
function getWordsForLevel(level) {
  const tiers = getTiersForLevel(level);
  const pool = CET4_WORDS.filter(w => tiers.includes(w.tier));

  const rng = seededRandom(level * 7919); // prime seed per level
  const shuffled = seededShuffle(pool, rng);

  // Pick 10 words, cycling through pool if needed
  const offset = ((level - 1) % Math.floor(shuffled.length / 10)) * 10;
  return shuffled.slice(offset, offset + 10);
}

/**
 * Generate 4 options for a question: 1 correct + 3 distractors.
 * Distractors come from the same tier, prefer different category.
 */
function generateOptions(correctWord, level) {
  const tiers = getTiersForLevel(level);
  const pool = CET4_WORDS.filter(
    w => tiers.includes(w.tier) && w.id !== correctWord.id
  );

  // Prefer different category for distractors
  const diffCategory = pool.filter(w => w.category !== correctWord.category);
  const sameCategory = pool.filter(w => w.category === correctWord.category);

  // Pick 3 distractors: prefer from different category pool first
  const distractors = [];
  const rng = seededRandom(correctWord.id * 1013 + level);
  const shuffledDiff = seededShuffle(diffCategory, rng);
  const shuffledSame = seededShuffle(sameCategory, rng);

  // Try to get 2 from different category, 1 from same
  const sources = [...shuffledDiff, ...shuffledSame];
  const usedIds = new Set([correctWord.id]);

  for (let i = 0; i < sources.length && distractors.length < 3; i++) {
    if (!usedIds.has(sources[i].id)) {
      distractors.push(sources[i]);
      usedIds.add(sources[i].id);
    }
  }

  // Build options array and shuffle positions
  const options = [
    { meaning: correctWord.meaning, correct: true },
    ...distractors.map(d => ({ meaning: d.meaning, correct: false }))
  ];

  return seededShuffle(options, seededRandom(correctWord.id * 31 + level * 37));
}

module.exports = {
  getWordsForLevel,
  generateOptions,
  getTiersForLevel
};
