const { getLeaderboard } = require('../../utils/cloud-service.js');
const app = getApp();

Page({
  data: {
    activeTab: 'global', // 'friends' | 'global'
    topList: [],
    myRank: null,
    loading: true,
    myLocalScore: 0
  },

  onLoad() {
    this.setData({
      myLocalScore: app.getCompositeScore()
    });
    this.fetchGlobalLeaderboard();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab });

    if (tab === 'friends') {
      this.loadFriendRanking();
    } else {
      this.fetchGlobalLeaderboard();
    }
  },

  fetchGlobalLeaderboard() {
    this.setData({ loading: true });

    if (!app.globalData.cloudReady) {
      this.setData({ loading: false, topList: [], myRank: null });
      return;
    }

    getLeaderboard().then(res => {
      if (res.code === 0) {
        this.setData({
          topList: res.topList || [],
          myRank: res.myRank,
          loading: false
        });
      } else {
        this.setData({ loading: false });
      }
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  loadFriendRanking() {
    // Send message to open-data-context to load friend ranking
    const openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage({
      type: 'loadFriendRanking'
    });
  },

  goHome() {
    wx.navigateBack();
  }
});
