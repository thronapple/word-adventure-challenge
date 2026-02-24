# 📚 Word Adventure Challenge

> A WeChat Mini Program for CET-4 English vocabulary — 60 levels × 600 words, learn while you play!

[中文版](README.md)

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
