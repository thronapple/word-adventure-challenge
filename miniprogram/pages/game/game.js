const { GameEngine, TIME_PER_WORD } = require('../../utils/game-engine.js');

const FEEDBACK_DELAY = 800; // ms to show correct/wrong before next word
const TIMER_INTERVAL = 100; // ms
const AD_UNIT_ID = 'adunit-xxxxxxxxxx'; // Replace with real ad unit ID

Page({
  data: {
    level: 1,
    lives: 3,
    progress: '1/10',
    currentWord: '',
    options: [],
    optionLabels: ['A', 'B', 'C', 'D'],
    timerPercent: 100,
    timerWarning: false,
    shakeAnimation: false,
    // Revive popup state
    showRevivePopup: false
  },

  engine: null,
  timer: null,
  timerStartTime: 0,
  feedbackTimeout: null,
  videoAd: null,
  adReady: false,
  hasUsedAdRevive: false,

  onLoad(options) {
    const level = parseInt(options.level) || 1;
    this.engine = new GameEngine();
    this.engine.initLevel(level);
    this.hasUsedAdRevive = false;
    this.renderState();
    this.startTimer();
    this.createRewardedVideoAd();
  },

  onUnload() {
    this.clearTimer();
    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }
  },

  createRewardedVideoAd() {
    if (!wx.createRewardedVideoAd) return;

    this.videoAd = wx.createRewardedVideoAd({
      adUnitId: AD_UNIT_ID
    });

    this.videoAd.onLoad(() => {
      this.adReady = true;
    });

    this.videoAd.onError((err) => {
      console.error('Ad load error:', err);
      this.adReady = false;
    });

    this.videoAd.onClose((res) => {
      if (res && res.isEnded) {
        this.performRevive();
      } else {
        // User closed ad early, treat as skip
        this.navigateToResult();
      }
    });
  },

  renderState() {
    const state = this.engine.getState();
    this.setData({
      level: state.level,
      lives: state.lives,
      progress: state.progress,
      currentWord: state.currentWord ? state.currentWord.word : '',
      options: state.options.map(o => ({
        meaning: o.meaning,
        state: '' // reset visual state
      }))
    });
  },

  startTimer() {
    this.timerStartTime = Date.now();
    this.setData({ timerPercent: 100, timerWarning: false });

    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.timerStartTime) / 1000;
      const remaining = TIME_PER_WORD - elapsed;
      const percent = Math.max(0, (remaining / TIME_PER_WORD) * 100);

      this.setData({
        timerPercent: percent,
        timerWarning: remaining <= 3
      });

      if (remaining <= 0) {
        this.clearTimer();
        this.handleTimeUp();
      }
    }, TIMER_INTERVAL);
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  selectOption(e) {
    if (this.engine.isAnswered()) return;

    const index = e.currentTarget.dataset.index;
    this.clearTimer();

    const result = this.engine.submitAnswer(index);
    if (!result) return;

    this.showFeedback(index, result);
  },

  handleTimeUp() {
    if (this.engine.isAnswered()) return;

    const result = this.engine.timeUp();
    if (!result) return;

    // Find correct option to highlight
    const options = this.engine.getCurrentOptions();
    const correctIdx = options.findIndex(o => o.correct);
    this.showFeedback(-1, result, correctIdx);
  },

  showFeedback(selectedIndex, result, correctIdx) {
    const options = this.data.options.slice();

    // Find the correct option index
    const engineOptions = this.engine.getCurrentOptions();
    const correctOptionIdx = correctIdx !== undefined ? correctIdx : engineOptions.findIndex(o => o.correct);

    if (result.correct) {
      // Mark selected as correct
      options[selectedIndex] = { ...options[selectedIndex], state: 'correct' };
    } else {
      // Mark selected as wrong (if user selected something)
      if (selectedIndex >= 0) {
        options[selectedIndex] = { ...options[selectedIndex], state: 'wrong' };
      }
      // Reveal correct answer
      options[correctOptionIdx] = { ...options[correctOptionIdx], state: 'reveal-correct' };
    }

    // Disable all options
    options.forEach((o, i) => {
      if (!o.state) options[i] = { ...o, state: 'disabled' };
    });

    const updateData = {
      options,
      lives: this.engine.getState().lives
    };

    if (!result.correct) {
      updateData.shakeAnimation = true;
    }

    this.setData(updateData);

    // Reset shake
    if (!result.correct) {
      setTimeout(() => {
        this.setData({ shakeAnimation: false });
      }, 500);
    }

    // Vibrate on wrong answer
    if (!result.correct) {
      wx.vibrateShort({ type: 'heavy' });
    }

    // Advance after delay
    this.feedbackTimeout = setTimeout(() => {
      this.advanceGame();
    }, FEEDBACK_DELAY);
  },

  advanceGame() {
    if (this.engine.isGameOver()) {
      // Check if ad revive is available
      if (!this.hasUsedAdRevive && this.adReady) {
        this.setData({ showRevivePopup: true });
        return;
      }
      this.navigateToResult();
      return;
    }

    if (this.engine.isLevelComplete()) {
      this.navigateToResult();
      return;
    }

    const advanced = this.engine.nextWord();
    if (advanced) {
      this.renderState();
      this.startTimer();
    } else {
      this.navigateToResult();
    }
  },

  watchAdToRevive() {
    this.setData({ showRevivePopup: false });
    if (this.videoAd) {
      this.videoAd.show().catch(() => {
        // If show fails, try to reload then show
        this.videoAd.load().then(() => this.videoAd.show()).catch(() => {
          wx.showToast({ title: '广告加载失败', icon: 'none' });
          this.navigateToResult();
        });
      });
    } else {
      this.navigateToResult();
    }
  },

  skipRevive() {
    this.setData({ showRevivePopup: false });
    this.navigateToResult();
  },

  performRevive() {
    this.hasUsedAdRevive = true;
    this.engine.revive();
    // Current word was already answered wrong, advance to next
    const advanced = this.engine.nextWord();
    if (advanced) {
      this.renderState();
      this.startTimer();
    } else {
      // Was the last word — level is now complete (lives > 0)
      this.navigateToResult();
    }
  },

  navigateToResult() {
    const result = this.engine.getLevelResult();
    wx.redirectTo({
      url: `/pages/result/result?level=${result.level}&passed=${result.passed}&stars=${result.stars}&correct=${result.correctCount}&wrong=${result.wrongCount}&total=${result.totalWords}&time=${result.totalTime}`
    });
  }
});
