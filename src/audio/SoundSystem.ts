/**
 * @file SoundSystem.ts
 * @description Web Audio API を用いた完全オフライン・プログラマティック効果音（SE）生成システム。
 * 外部の音声ファイル通信・依存を一切持たず、純粋な数学的波形（オシレーター）とホワイトノイズフィルター、
 * エンベロープ合成によって、小気味よいレトロ＆迫力のあるゲームSEをミリ秒単位で合成・再生します。
 */

export class SoundSystem {
  private static instance: SoundSystem | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private isUnlocked = false;

  private constructor() {
    // ローカルストレージからミュート設定を復元
    try {
      const savedMute = localStorage.getItem('rogue_se_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
    } catch {
      // localStorageが制限されている環境でもフォールバック
      this.muted = false;
    }
  }

  /**
   * SoundSystem のシングルトンインスタンスを取得します。
   */
  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  /**
   * AudioContext を初期化またはレジュームします。
   * ブラウザのユーザー操作ポリシー（クリック、キー押下、タッチ）時に呼び出します。
   */
  public unlock(): void {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') {
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx && AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {
          // ユーザーインタラクション待機中
        });
      } else if (this.ctx && this.ctx.state === 'running') {
        this.isUnlocked = true;
      }
    } catch (e) {
      console.warn('AudioContext initialization failed:', e);
    }
  }

  /**
   * ミュート状態を切り替えます。
   * @returns 切り替え後のミュート状態（true: 消音, false: 発音）
   */
  public toggleMute(): boolean {
    this.unlock();
    this.muted = !this.muted;
    try {
      localStorage.setItem('rogue_se_muted', String(this.muted));
    } catch {
      // ignore
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.muted;
  }

  /**
   * 現在ミュート中かどうかを取得します。
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * ホワイトノイズバッファを生成します。
   */
  private createNoiseBuffer(durationSec: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ==========================================
  // 効果音（SE）生成・再生メソッド群
  // ==========================================

  /**
   * プレイヤーの攻撃（剣戟スラッシュ）音。
   * ノイズバーストと急降下鋸歯状波を合成し、鋭い「ザシュッ！」を再現。
   * @param isBackstab 不意打ちクリティカル時は重低音と破裂音を追加
   */
  public playAttack(isBackstab = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = isBackstab ? 0.16 : 0.11;

    // 1. ノイズによる斬撃の風切り＆肉裂き音
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, now);
      filter.frequency.setValueAtTime(isBackstab ? 1800 : 1500, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + dur);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isBackstab ? 0.9 : 0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }

    // 2. 刃物のインパクト音（急降下Sawtooth波）
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isBackstab ? 380 : 280, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(isBackstab ? 0.7 : 0.45, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 不意打ち時の重低音サブベース
    if (isBackstab) {
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'square';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + 0.2);
    }
  }

  /**
   * プレイヤー被弾音（ドスッ！という重いダメージ打撃音）。
   * 矩形波の急降下と低音ノイズで痛烈な衝撃を再現。
   */
  public playPlayerHit(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.18;

    // 低音矩形波（鈍い打撃）
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.85, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 打撃の低音ノイズ
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(80, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.7, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * モンスター被弾・打撃音（バシッ！という肉弾ヒット音）。
   */
  public playMonsterHit(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.08;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 攻撃の空振り音（ヒュッ！という風切り音）。
   */
  public playMiss(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.09;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.5, now);
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1400, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 矢の発射音（ビュンッ！という弦鳴りと飛翔音）。
   */
  public playShoot(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.12;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(200, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.55, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 魔法の杖照射音（ピシューン！という魔法光線音）。
   */
  public playZap(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.22;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * アイテム拾得音（ピロリン♪ という2音アルペジオ）。
   */
  public playPickup(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 783.99]; // C5 -> G5

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.06;
      const dur = 0.09;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.45, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }

  /**
   * ゴールド（通貨）拾得音（チャリン♪ という高音の金属コイン音）。
   */
  public playGold(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [987.77, 1318.51, 1975.53]; // B5 -> E6 -> B6

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.04;
      const dur = 0.1;

      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.35, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }

  /**
   * 薬草・回復・食事音（ポワワ〜ン♪ という心地よい上昇アルペジオ）。
   */
  public playHeal(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.055;
      const dur = 0.18;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.4, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }

  /**
   * 階段を降りる音（トコトコトン、というステップ音）。
   */
  public playStairs(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [392.0, 329.63, 261.63]; // G4 -> E4 -> C4

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.09;
      const dur = 0.14;

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.5, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }

  /**
   * レベルアップ音（パッパラー♪ という輝かしいファンファーレ）。
   */
  public playLevelUp(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // C5, E5, G5, C6
    const melody = [
      { f: 523.25, t: 0.0, d: 0.09 },
      { f: 659.25, t: 0.09, d: 0.09 },
      { f: 783.99, t: 0.18, d: 0.09 },
      { f: 1046.5, t: 0.27, d: 0.35 },
    ];

    melody.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + note.t;

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.55, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + note.d);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + note.d);
    });
  }

  /**
   * 泥棒警報・緊急サイレン音（ウー！ウー！という警告）。
   */
  public playAlarm(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.45;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.15);
    osc.frequency.linearRampToValueAtTime(880, now + 0.3);
    osc.frequency.linearRampToValueAtTime(440, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 障害物押し・地響き音（ズズズ…）。
   */
  public playPushObstacle(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.25;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 障害物破壊・粉砕音（ガシャーン！）。
   */
  public playBreakObstacle(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.2;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.75, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * プレイヤー死亡音（沈痛な下降音）。
   */
  public playDefeat(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [349.23, 311.13, 293.66, 261.63]; // F4, Eb4, D4, C4

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.18;
      const dur = 0.3;

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.6, noteTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }
}
