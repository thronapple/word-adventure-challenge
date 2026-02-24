# 📚 单词闯关挑战 | Word Adventure Challenge

**中文** | [English](#english)

> CET-4 英语词汇闯关小程序 —— 60 关卡 × 600 词汇，边闯边记，轻松备考四级！

## 截图预览

| 首页 | 答题 | 结果 | 排行榜 |
|:---:|:---:|:---:|:---:|
| ![首页](screenshots/home.png) | ![答题](screenshots/game.png) | ![结果](screenshots/result.png) | ![排行榜](screenshots/rank.png) |

## 功能特色

### 🎮 核心玩法

- **60 个关卡**，每关 10 个单词，覆盖 CET-4 高频词汇
- **10 秒限时**答题，4 选 1 中英配对
- **3 条生命**，答错扣命，用完即止
- **星级评价**：全对 3 星、8-9 题 2 星、及格 1 星
- **确定性关卡**：同一关卡的单词固定不变，可反复练习

### 🏆 排行榜

- **全服排行**：云端同步分数，展示 Top 50 排名
- **好友排行**：微信开放数据域，与好友实时比拼
- **综合积分**：关卡 × 100 + 星星 × 30 + 速度奖励

### 🎬 广告续命

- 每关限 1 次复活机会
- 观看激励视频广告即可继续挑战
- 不看广告也可直接跳过，不影响体验

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信原生小程序（WXML / WXSS / JS） |
| 本地存储 | `wx.setStorageSync` |
| 云端 | 微信云开发（云函数 + 云数据库） |
| 开放数据 | 微信开放数据域（好友排行） |
| 广告 | 微信激励视频广告 |

## 项目结构

```
miniprogram/
├── app.js/json/wxss           # 应用配置、全局状态、设计令牌、云初始化
├── pages/
│   ├── home/                  # 关卡地图、进度展示、排行入口
│   ├── game/                  # 核心玩法（计时、选项、生命、广告续命）
│   ├── result/                # 通关/失败结果、星级评定、云端同步
│   └── rank/                  # 排行榜（全服 Top50 + 好友排行）
├── utils/
│   ├── game-engine.js         # 状态机：生命、计分、关卡流程、复活
│   ├── word-service.js        # 单词选取、干扰项生成
│   ├── score-utils.js         # 综合分数计算
│   └── cloud-service.js       # 云函数调用封装
├── open-data-context/         # 微信开放数据域（好友排行）
│   ├── index.js/wxml/wxss     # 共享画布渲染
│   └── data.js                # 好友数据解析/排序
└── data/
    └── cet4-words.js          # ~600 个 CET-4 单词，6 级难度

cloudfunctions/
├── updateScore/               # 更新玩家分数（仅更高分时覆盖）
└── getLeaderboard/            # 查询 Top 50 + 当前玩家排名
```

## 快速开始

### 环境要求

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)（稳定版）
- 微信小程序 AppID（测试号或正式号）
- 开通微信云开发（如需排行榜功能）

### 运行步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/your-username/word-adventure-challenge.git
   ```
2. 打开微信开发者工具，导入项目（选择 `project.config.json` 所在目录）
3. 在 `project.config.json` 中替换为你的 AppID
4. 编译运行即可预览

## 游戏机制

### 综合积分公式

```
compositeScore = highestLevel × 100 + totalStars × 30 + speedBonus
speedBonus = Σ max(0, floor((100 - levelTime) × 2))  // 每关速度奖励
```

### 星级评价

| 星级 | 条件 |
|:---:|------|
| ⭐⭐⭐ | 10/10 全对 |
| ⭐⭐ | 答对 8-9 题 |
| ⭐ | 通关但少于 8 题正确 |

### 难度分层

| 难度 | 关卡 | 词汇特征 |
|------|------|---------|
| 初级（Tier 1-2） | 1-20 关 | 常见高频词 |
| 中级（Tier 3-4） | 21-40 关 | 中等难度词 |
| 高级（Tier 5-6） | 41-60 关 | CET-4 进阶词 |

## 上线清单

- [ ] **替换广告单元 ID** — `miniprogram/pages/game/game.js:5` 的 `AD_UNIT_ID` 替换为微信后台申请的真实激励视频广告单元 ID
- [ ] **创建云数据库集合** — 微信云开发控制台创建 `scores` 集合，权限设为：所有用户可读，仅创建者可写
- [ ] **部署云函数** — 开发者工具中右键上传部署 `cloudfunctions/updateScore` 和 `cloudfunctions/getLeaderboard`
- [ ] **配置云环境** — 如有多个云环境，在 `miniprogram/app.js` 的 `wx.cloud.init()` 中指定 `env` 参数
- [ ] **真机测试** — 开放数据域（好友排行）和激励视频广告只能在真机上验证，模拟器不支持

## 许可证

[MIT](LICENSE)

---

<a id="english"></a>

[中文](#) | **English**

> A WeChat Mini Program for CET-4 English vocabulary — 60 levels × 600 words, learn while you play!

## Screenshots

| Home | Game | Result | Leaderboard |
|:---:|:---:|:---:|:---:|
| ![Home](screenshots/home.png) | ![Game](screenshots/game.png) | ![Result](screenshots/result.png) | ![Leaderboard](screenshots/rank.png) |

## Features

### 🎮 Core Gameplay

- **60 levels**, 10 words each, covering high-frequency CET-4 vocabulary
- **10-second timer** per question, pick the correct Chinese translation from 4 options
- **3 lives** per attempt — lose one for each wrong answer
- **Star ratings**: 3 stars for perfect, 2 stars for 8–9 correct, 1 star for passing with fewer
- **Deterministic levels**: each level always contains the same words, great for repeated practice

### 🏆 Leaderboard

- **Global ranking**: cloud-synced scores, showing Top 50 players
- **Friend ranking**: powered by WeChat Open Data, compete with friends in real time
- **Composite score**: level × 100 + stars × 30 + speed bonus

### 🎬 Ad Revive

- One revive chance per level
- Watch a rewarded video ad to continue the challenge
- Skipping the ad is always an option — no impact on experience

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | WeChat native Mini Program (WXML / WXSS / JS) |
| Local Storage | `wx.setStorageSync` |
| Cloud | WeChat Cloud Development (Cloud Functions + Cloud Database) |
| Open Data | WeChat Open Data Context (friend ranking) |
| Ads | WeChat Rewarded Video Ads |

## Project Structure

```
miniprogram/
├── app.js/json/wxss           # App config, global state, design tokens, cloud init
├── pages/
│   ├── home/                  # Level map, progress display, rank entry
│   ├── game/                  # Core gameplay (timer, options, lives, ad revive)
│   ├── result/                # Pass/fail result, star awards, cloud sync
│   └── rank/                  # Leaderboard (global Top 50 + friend ranking)
├── utils/
│   ├── game-engine.js         # State machine: lives, scoring, level flow, revive
│   ├── word-service.js        # Word selection, distractor generation
│   ├── score-utils.js         # Composite score calculation
│   └── cloud-service.js       # Cloud function wrappers
├── open-data-context/         # WeChat Open Data Context (friend ranking)
│   ├── index.js/wxml/wxss     # Shared canvas rendering
│   └── data.js                # Friend data parser/sorter
└── data/
    └── cet4-words.js          # ~600 CET-4 words, 6 difficulty tiers

cloudfunctions/
├── updateScore/               # Upsert player score (only if higher)
└── getLeaderboard/            # Query Top 50 + current player rank
```

## Getting Started

### Prerequisites

- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (stable release)
- A WeChat Mini Program AppID (test or production)
- WeChat Cloud Development enabled (required for leaderboard features)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/word-adventure-challenge.git
   ```
2. Open WeChat DevTools and import the project (select the directory containing `project.config.json`)
3. Replace the AppID in `project.config.json` with your own
4. Build and preview

## Game Mechanics

### Composite Score Formula

```
compositeScore = highestLevel × 100 + totalStars × 30 + speedBonus
speedBonus = Σ max(0, floor((100 - levelTime) × 2))  // per-level speed bonus
```

### Star Ratings

| Stars | Condition |
|:---:|------|
| ⭐⭐⭐ | 10/10 correct |
| ⭐⭐ | 8–9 correct |
| ⭐ | Passed with fewer than 8 correct |

### Difficulty Tiers

| Difficulty | Levels | Vocabulary |
|------------|--------|-----------|
| Beginner (Tier 1–2) | 1–20 | Common high-frequency words |
| Intermediate (Tier 3–4) | 21–40 | Medium-difficulty words |
| Advanced (Tier 5–6) | 41–60 | Advanced CET-4 words |

## Pre-Launch Checklist

- [ ] **Replace Ad Unit ID** — Update `AD_UNIT_ID` in `miniprogram/pages/game/game.js:5` with a real rewarded video ad unit ID from the WeChat ad platform
- [ ] **Create Cloud Database Collection** — Create a `scores` collection in the WeChat Cloud Console; set permissions to: all users can read, only creator can write
- [ ] **Deploy Cloud Functions** — Right-click and deploy `cloudfunctions/updateScore` and `cloudfunctions/getLeaderboard` in DevTools
- [ ] **Configure Cloud Environment** — If you have multiple cloud environments, specify the `env` parameter in `wx.cloud.init()` inside `miniprogram/app.js`
- [ ] **Test on Real Device** — Open Data Context (friend ranking) and rewarded video ads can only be verified on a real device, not in the simulator

## License

[MIT](LICENSE)
