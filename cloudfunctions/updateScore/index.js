const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const { highestLevel, totalStars, compositeScore, levelTimes } = event;

  const collection = db.collection('scores');
  const now = new Date();

  try {
    // Check if player record exists
    const existing = await collection.where({ _openid: OPENID }).get();

    if (existing.data.length === 0) {
      // Insert new record
      await collection.add({
        data: {
          _openid: OPENID,
          nickName: '',
          avatarUrl: '',
          highestLevel: highestLevel || 0,
          totalStars: totalStars || 0,
          compositeScore: compositeScore || 0,
          levelTimes: levelTimes || {},
          createdAt: now,
          updatedAt: now
        }
      });
      return { code: 0, msg: 'created' };
    }

    const record = existing.data[0];

    // Only update if new score is higher
    if (compositeScore > (record.compositeScore || 0)) {
      await collection.doc(record._id).update({
        data: {
          highestLevel,
          totalStars,
          compositeScore,
          levelTimes,
          updatedAt: now
        }
      });
      return { code: 0, msg: 'updated' };
    }

    return { code: 0, msg: 'no_change' };
  } catch (err) {
    console.error('updateScore error:', err);
    return { code: -1, msg: err.message };
  }
};
