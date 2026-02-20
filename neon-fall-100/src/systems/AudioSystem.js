/**
 * 音效系统 - 使用 Web Audio API 生成程序化音效
 */

export class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.musicEnabled = window.gameState?.musicEnabled !== false;
    this.sfxEnabled = window.gameState?.soundEnabled !== false;

    this.init();
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // 主音量控制
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.5;

      // 音乐音量
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = 0.3;

      // 音效音量
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = 0.6;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // 跳跃音效
  playJump() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  // 弹跳平台音效
  playBounce() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.25);
  }

  // 踩踏平台音效
  playLand() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // 收集能量音效
  playCollect(type) {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const frequencies = {
      doubleJump: [400, 600, 800],
      flying: [500, 700, 900, 1100],
      shield: [600, 800, 1000],
      speedBoost: [700, 900, 1100, 1300],
    };

    const freqs = frequencies[type] || [400, 600, 800];

    freqs.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  // 成就解锁音效
  playAchievement() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 游戏结束音效
  playGameOver() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const notes = [392, 349, 330, 262]; // G4, F4, E4, C4 (descending)

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // 胜利音效
  playVictory() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const melody = [523, 659, 784, 1047, 784, 1047, 1318]; // Victory fanfare

    melody.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // 按钮点击音效
  playClick() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = 'sine';
    osc.frequency.value = 800;

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  // 层数里程碑音效
  playMilestone() {
    if (!this.sfxEnabled || !this.audioContext) return;
    this.resume();

    const notes = [523, 784, 1047]; // C5, G5, C6 - major chord arpeggio

    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = this.audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 开始背景音乐循环
  startBackgroundMusic() {
    if (!this.musicEnabled || !this.audioContext || this.bgMusicInterval) return;
    this.resume();

    // 简单的电子音乐循环
    const playNote = (freq, time, duration, type = 'sine') => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.01);
      gain.gain.setValueAtTime(0.1, time + duration - 0.05);
      gain.gain.linearRampToValueAtTime(0, time + duration);

      osc.start(time);
      osc.stop(time + duration);
    };

    // 简单的电子音乐序列
    const bpm = 120;
    const beatDuration = 60 / bpm;
    const bassNotes = [65.41, 82.41, 98.00, 82.41]; // C2, E2, G2, E2
    const melodyNotes = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 392.00, 349.23];

    let beatIndex = 0;

    const playBeat = () => {
      const time = this.audioContext.currentTime;

      // 低音
      playNote(bassNotes[beatIndex % bassNotes.length], time, beatDuration * 0.8, 'triangle');

      // 旋律
      if (beatIndex % 2 === 0) {
        playNote(melodyNotes[beatIndex % melodyNotes.length], time, beatDuration * 0.3, 'sine');
      }

      beatIndex++;
    };

    this.bgMusicInterval = setInterval(playBeat, beatDuration * 1000);
    playBeat();
  }

  stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (window.gameState) {
      window.gameState.musicEnabled = this.musicEnabled;
      localStorage.setItem('neonFallMusicEnabled', this.musicEnabled.toString());
    }

    if (this.musicEnabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }

    return this.musicEnabled;
  }

  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    if (window.gameState) {
      window.gameState.soundEnabled = this.sfxEnabled;
      localStorage.setItem('neonFallSoundEnabled', this.sfxEnabled.toString());
    }
    return this.sfxEnabled;
  }

  destroy() {
    this.stopBackgroundMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
