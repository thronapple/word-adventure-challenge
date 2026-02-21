const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 50;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  try {
    // Get top 50 by compositeScore descending
    const topResult = await db.collection('scores')
      .orderBy('compositeScore', 'desc')
      .limit(MAX_LIMIT)
      .get();

    const topList = topResult.data.map((item, index) => ({
      rank: index + 1,
      nickName: item.nickName || '匿名玩家',
      avatarUrl: item.avatarUrl || '',
      compositeScore: item.compositeScore || 0,
      highestLevel: item.highestLevel || 0,
      totalStars: item.totalStars || 0,
      isMe: item._openid === OPENID
    }));

    // Find current player's rank
    let myRank = null;
    const meInTop = topList.find(item => item.isMe);

    if (meInTop) {
      myRank = meInTop;
    } else {
      // Player not in top 50, find their record and count higher scores
      const myRecord = await db.collection('scores')
        .where({ _openid: OPENID })
        .get();

      if (myRecord.data.length > 0) {
        const myScore = myRecord.data[0].compositeScore || 0;
        const countResult = await db.collection('scores')
          .where({ compositeScore: _.gt(myScore) })
          .count();

        myRank = {
          rank: countResult.total + 1,
          nickName: myRecord.data[0].nickName || '匿名玩家',
          avatarUrl: myRecord.data[0].avatarUrl || '',
          compositeScore: myScore,
          highestLevel: myRecord.data[0].highestLevel || 0,
          totalStars: myRecord.data[0].totalStars || 0,
          isMe: true
        };
      }
    }

    return { code: 0, topList, myRank };
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return { code: -1, msg: err.message, topList: [], myRank: null };
  }
};
