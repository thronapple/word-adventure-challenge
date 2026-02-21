/**
 * Composite score calculation for leaderboard ranking.
 *
 * Formula: highestLevel × 100 + totalStars × 30 + speedBonus
 * speedBonus = sum of max(0, floor((100 - levelTime) × 2)) per level
 */

function calculateSpeedBonus(levelTimes) {
  if (!levelTimes || typeof levelTimes !== 'object') return 0;
  let bonus = 0;
  const times = Object.values(levelTimes);
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    if (typeof t === 'number' && t >= 0) {
      bonus += Math.max(0, Math.floor((100 - t) * 2));
    }
  }
  return bonus;
}

function calculateCompositeScore(highestLevel, totalStars, levelTimes) {
  const levelScore = (highestLevel || 0) * 100;
  const starScore = (totalStars || 0) * 30;
  const speedBonus = calculateSpeedBonus(levelTimes);
  return levelScore + starScore + speedBonus;
}

module.exports = {
  calculateCompositeScore,
  calculateSpeedBonus
};
