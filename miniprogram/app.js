const { calculateCompositeScore } = require('./utils/score-utils.js');

App({
  globalData: {
    currentLevel: 1,
    totalStars: 0,
    levelStars: {},  // { levelNumber: starCount }
    levelTimes: {},  // { levelNumber: bestTimeInSeconds }
    cloudReady: false
  },

  onLaunch() {
    this.loadProgress();
    this.initCloud();
  },

  initCloud() {
    if (!wx.cloud) {
      console.warn('Cloud API not available');
      return;
    }
    wx.cloud.init({
      traceUser: true
    });
    this.globalData.cloudReady = true;
  },

  loadProgress() {
    try {
      const progress = wx.getStorageSync('gameProgress');
      if (progress) {
        this.globalData.currentLevel = progress.currentLevel || 1;
        this.globalData.totalStars = progress.totalStars || 0;
        this.globalData.levelStars = progress.levelStars || {};
        this.globalData.levelTimes = progress.levelTimes || {};
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  },

  saveProgress() {
    try {
      wx.setStorageSync('gameProgress', {
        currentLevel: this.globalData.currentLevel,
        totalStars: this.globalData.totalStars,
        levelStars: this.globalData.levelStars,
        levelTimes: this.globalData.levelTimes
      });
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  unlockNextLevel(level, stars, totalTime) {
    const oldStars = this.globalData.levelStars[level] || 0;
    if (stars > oldStars) {
      this.globalData.totalStars += (stars - oldStars);
      this.globalData.levelStars[level] = stars;
    }
    if (level >= this.globalData.currentLevel) {
      this.globalData.currentLevel = level + 1;
    }
    // Track best time per level
    if (typeof totalTime === 'number' && totalTime > 0) {
      const oldTime = this.globalData.levelTimes[level];
      if (!oldTime || totalTime < oldTime) {
        this.globalData.levelTimes[level] = totalTime;
      }
    }
    this.saveProgress();
  },

  getCompositeScore() {
    return calculateCompositeScore(
      this.globalData.currentLevel - 1, // highestLevel = last completed
      this.globalData.totalStars,
      this.globalData.levelTimes
    );
  },

  syncScoreToCloud() {
    if (!this.globalData.cloudReady) return Promise.resolve();

    const compositeScore = this.getCompositeScore();
    const data = {
      highestLevel: this.globalData.currentLevel - 1,
      totalStars: this.globalData.totalStars,
      compositeScore,
      levelTimes: this.globalData.levelTimes
    };

    return wx.cloud.callFunction({
      name: 'updateScore',
      data
    }).then(res => {
      console.log('Score synced to cloud:', res);
      this.syncFriendScore(compositeScore);
    }).catch(err => {
      console.error('Failed to sync score:', err);
    });
  },

  syncFriendScore(compositeScore) {
    try {
      wx.setUserCloudStorage({
        KVDataList: [{
          key: 'score',
          value: JSON.stringify({
            compositeScore,
            highestLevel: this.globalData.currentLevel - 1,
            totalStars: this.globalData.totalStars,
            updatedAt: Date.now()
          })
        }],
        success: () => console.log('Friend score synced'),
        fail: (err) => console.error('Failed to sync friend score:', err)
      });
    } catch (e) {
      console.error('setUserCloudStorage not available:', e);
    }
  }
});
