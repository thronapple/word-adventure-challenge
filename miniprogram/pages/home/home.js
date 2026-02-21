const app = getApp();

Page({
  data: {
    currentLevel: 1,
    totalStars: 0,
    levels: []
  },

  onShow() {
    app.loadProgress();
    const currentLevel = app.globalData.currentLevel;
    const totalStars = app.globalData.totalStars;
    const levelStars = app.globalData.levelStars;

    // Generate level grid (show up to currentLevel + 5, min 20)
    const maxDisplay = Math.max(20, currentLevel + 5);
    const levels = [];
    for (let i = 1; i <= maxDisplay; i++) {
      levels.push({
        level: i,
        unlocked: i <= currentLevel,
        stars: levelStars[i] || 0
      });
    }

    this.setData({
      currentLevel,
      totalStars,
      levels
    });
  },

  startGame() {
    wx.navigateTo({
      url: `/pages/game/game?level=${this.data.currentLevel}`
    });
  },

  goToRank() {
    wx.navigateTo({
      url: '/pages/rank/rank'
    });
  },

  selectLevel(e) {
    const level = e.currentTarget.dataset.level;
    if (level > this.data.currentLevel) {
      wx.showToast({
        title: '请先通过前面的关卡',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/game/game?level=${level}`
    });
  }
});
