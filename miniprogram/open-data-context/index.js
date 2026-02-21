const { parseFriendData } = require('./data.js');

const sharedCanvas = wx.getSharedCanvas();
const ctx = sharedCanvas.getContext('2d');
let friendList = [];

// Colors
const BG_COLOR = '#F0F0F5';
const CARD_COLOR = '#FFFFFF';
const PRIMARY_COLOR = '#6C5CE7';
const TEXT_COLOR = '#2D3436';
const TEXT_SECONDARY = '#888888';

function drawLeaderboard() {
  if (!ctx || !sharedCanvas) return;

  const sysInfo = wx.getSystemInfoSync();
  const dpr = sysInfo.pixelRatio;
  // Set canvas size based on screen
  sharedCanvas.width = sysInfo.screenWidth * dpr;
  sharedCanvas.height = sysInfo.screenHeight * dpr;
  const width = sysInfo.screenWidth;
  const height = sysInfo.screenHeight;

  ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, width, height);

  if (friendList.length === 0) {
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无好友数据', width / 2, height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return;
  }

  const itemHeight = 60;
  const padding = 12;

  for (let i = 0; i < friendList.length; i++) {
    const item = friendList[i];
    const y = i * (itemHeight + 8) + padding;

    // Card background
    ctx.fillStyle = CARD_COLOR;
    ctx.beginPath();
    roundRect(ctx, padding, y, width - padding * 2, itemHeight, 8);
    ctx.fill();

    // Rank medal or number
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    const rankText = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : String(item.rank);
    ctx.fillText(rankText, padding + 25, y + 35);

    // Name
    ctx.fillStyle = TEXT_COLOR;
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    const name = item.nickName.length > 6 ? item.nickName.slice(0, 6) + '...' : item.nickName;
    ctx.fillText(name, padding + 55, y + 28);

    // Detail
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.font = '11px sans-serif';
    ctx.fillText(`第${item.highestLevel}关 · ⭐${item.totalStars}`, padding + 55, y + 46);

    // Score
    ctx.fillStyle = PRIMARY_COLOR;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(item.compositeScore), width - padding - 12, y + 36);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Listen for messages from main context
wx.onMessage((msg) => {
  if (msg.type === 'loadFriendRanking') {
    wx.getFriendCloudStorage({
      keyList: ['score'],
      success: (res) => {
        friendList = parseFriendData(res.data || []);
        drawLeaderboard();
      },
      fail: (err) => {
        console.error('getFriendCloudStorage failed:', err);
      }
    });
  }
});
