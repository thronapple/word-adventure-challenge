/**
 * Parse and sort friend score data from KV storage.
 */
function parseFriendData(friendList) {
  const parsed = [];

  for (let i = 0; i < friendList.length; i++) {
    const friend = friendList[i];
    const scoreData = friend.KVDataList.find(kv => kv.key === 'score');
    if (!scoreData || !scoreData.value) continue;

    try {
      const data = JSON.parse(scoreData.value);
      parsed.push({
        nickName: friend.nickname || '好友',
        avatarUrl: friend.avatarUrl || '',
        compositeScore: data.compositeScore || 0,
        highestLevel: data.highestLevel || 0,
        totalStars: data.totalStars || 0
      });
    } catch (e) {
      // Skip invalid data
    }
  }

  // Sort by compositeScore descending
  parsed.sort((a, b) => b.compositeScore - a.compositeScore);

  // Add rank
  for (let i = 0; i < parsed.length; i++) {
    parsed[i].rank = i + 1;
  }

  return parsed;
}

module.exports = { parseFriendData };
