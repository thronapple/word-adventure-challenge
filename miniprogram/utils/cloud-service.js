/**
 * Cloud service wrapper for leaderboard operations.
 */

function updateScore(data) {
  return wx.cloud.callFunction({
    name: 'updateScore',
    data
  }).then(res => res.result);
}

function getLeaderboard() {
  return wx.cloud.callFunction({
    name: 'getLeaderboard'
  }).then(res => res.result);
}

function syncFriendScore(compositeScore, highestLevel, totalStars) {
  return new Promise((resolve, reject) => {
    wx.setUserCloudStorage({
      KVDataList: [{
        key: 'score',
        value: JSON.stringify({
          compositeScore,
          highestLevel,
          totalStars,
          updatedAt: Date.now()
        })
      }],
      success: resolve,
      fail: reject
    });
  });
}

module.exports = {
  updateScore,
  getLeaderboard,
  syncFriendScore
};
