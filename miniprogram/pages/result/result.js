const app = getApp();

Page({
  data: {
    level: 1,
    passed: false,
    stars: 0,
    correct: 0,
    wrong: 0,
    total: 10,
    time: 0
  },

  onLoad(options) {
    const level = parseInt(options.level) || 1;
    const passed = options.passed === 'true';
    const stars = parseInt(options.stars) || 0;
    const correct = parseInt(options.correct) || 0;
    const wrong = parseInt(options.wrong) || 0;
    const total = parseInt(options.total) || 10;
    const time = parseInt(options.time) || 0;

    this.setData({ level, passed, stars, correct, wrong, total, time });

    if (passed) {
      app.unlockNextLevel(level, stars, time);
      app.syncScoreToCloud();
    }
  },

  nextAction() {
    const nextLevel = this.data.passed ? this.data.level + 1 : this.data.level;
    wx.redirectTo({
      url: `/pages/game/game?level=${nextLevel}`
    });
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/home/home'
    });
  }
});
