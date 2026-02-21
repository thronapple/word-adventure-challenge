const wordService = require('./word-service.js');

const WORDS_PER_LEVEL = 10;
const INITIAL_LIVES = 3;
const TIME_PER_WORD = 10; // seconds

class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.level = 1;
    this.words = [];
    this.currentIndex = 0;
    this.lives = INITIAL_LIVES;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.currentOptions = [];
    this.answered = false;
    this.startTime = 0;
  }

  /**
   * Initialize a new level.
   */
  initLevel(level) {
    this.level = level;
    this.words = wordService.getWordsForLevel(level);
    this.currentIndex = 0;
    this.lives = INITIAL_LIVES;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.answered = false;
    this.startTime = Date.now();
    this.currentOptions = this._generateCurrentOptions();
  }

  /**
   * Get current word being displayed.
   */
  getCurrentWord() {
    if (this.currentIndex >= this.words.length) return null;
    return this.words[this.currentIndex];
  }

  /**
   * Get current options for the question.
   */
  getCurrentOptions() {
    return this.currentOptions;
  }

  /**
   * Submit an answer by option index.
   * Returns { correct: boolean, correctMeaning: string }
   */
  submitAnswer(optionIndex) {
    if (this.answered || this.isGameOver() || this.isLevelComplete()) {
      return null;
    }

    this.answered = true;
    const selected = this.currentOptions[optionIndex];
    const currentWord = this.getCurrentWord();
    const correct = selected && selected.correct;

    if (correct) {
      this.correctCount++;
    } else {
      this.wrongCount++;
      this.lives--;
    }

    return {
      correct,
      correctMeaning: currentWord.meaning
    };
  }

  /**
   * Handle time up — counts as wrong answer.
   */
  timeUp() {
    if (this.answered) return null;
    return this.submitAnswer(-1); // invalid index → wrong answer
  }

  /**
   * Advance to next word. Returns true if advanced, false if level complete/game over.
   */
  nextWord() {
    if (this.isGameOver() || this.isLevelComplete()) return false;

    this.currentIndex++;
    this.answered = false;

    if (this.currentIndex < this.words.length) {
      this.currentOptions = this._generateCurrentOptions();
      return true;
    }
    return false;
  }

  /**
   * Check if game is over (lives depleted).
   */
  isGameOver() {
    return this.lives <= 0;
  }

  /**
   * Revive the player with 1 life after ad watch.
   */
  revive() {
    if (this.lives > 0) return false; // not dead, no need to revive
    this.lives = 1;
    return true;
  }

  /**
   * Check if level is complete (all words answered).
   */
  isLevelComplete() {
    return this.currentIndex >= this.words.length - 1 && this.answered && this.lives > 0;
  }

  /**
   * Check if the current word has been answered.
   */
  isAnswered() {
    return this.answered;
  }

  /**
   * Get level result summary.
   */
  getLevelResult() {
    const totalTime = Math.round((Date.now() - this.startTime) / 1000);
    const passed = this.lives > 0 && (this.currentIndex >= this.words.length - 1) && this.answered;
    let stars = 0;

    if (passed) {
      if (this.correctCount === WORDS_PER_LEVEL) {
        stars = 3;
      } else if (this.correctCount >= 8) {
        stars = 2;
      } else {
        stars = 1;
      }
    }

    return {
      level: this.level,
      passed,
      stars,
      correctCount: this.correctCount,
      wrongCount: this.wrongCount,
      totalWords: WORDS_PER_LEVEL,
      totalTime,
      livesRemaining: this.lives
    };
  }

  /**
   * Get current game state for UI rendering.
   */
  getState() {
    return {
      level: this.level,
      currentIndex: this.currentIndex,
      totalWords: WORDS_PER_LEVEL,
      lives: this.lives,
      correctCount: this.correctCount,
      currentWord: this.getCurrentWord(),
      options: this.currentOptions,
      answered: this.answered,
      progress: `${this.currentIndex + 1}/${WORDS_PER_LEVEL}`
    };
  }

  _generateCurrentOptions() {
    const word = this.getCurrentWord();
    if (!word) return [];
    return wordService.generateOptions(word, this.level);
  }
}

module.exports = {
  GameEngine,
  WORDS_PER_LEVEL,
  INITIAL_LIVES,
  TIME_PER_WORD
};
