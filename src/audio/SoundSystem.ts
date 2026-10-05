/**
 * @file SoundSystem.ts
 * @description Web Audio API を用いた完全オフライン・プログラマティック効果音（SE）生成システム。
 * 外部の音声ファイル通信・依存を一切持たず、純粋な数学的波形（オシレーター）とホワイトノイズフィルター、
 * エンベロープ合成によって、小気味よいレトロ＆迫力のあるゲームSEをミリ秒単位で合成・再生します。
 */

import { Item } from '../core/types';

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
   * 装備中の武器の種類（または素手）に応じた最適な攻撃サウンドを再生します。
   * @param weapon 装備中の武器アイテム（未装備の場合はnull/undefined）
   * @param isBackstab 不意打ちクリティカルフラグ
   */
  public playAttackByWeapon(weapon?: Item | null, isBackstab = false): void {
    if (!weapon) {
      // 素手・武器未装備時はパンチ殴打音！
      this.playPunch(isBackstab);
      return;
    }

    const name = weapon.name || '';
    if (name.includes('ハンマー') || name.includes('槌') || name.includes('棍棒')) {
      this.playHammerAttack(isBackstab);
    } else if (name.includes('ランス') || name.includes('槍')) {
      this.playSpearAttack(isBackstab);
    } else {
      // 剣、刀、短剣など刃物系
      this.playSwordAttack(isBackstab);
    }
  }

  /**
   * 素手格闘・パンチ攻撃音（ドカッ！バシィッ！という骨太な拳打音）。
   * 武器を装備していない時の格闘攻撃をリアルに演出。
   * @param isBackstab クリティカル時は超重低音パンチ
   */
  public playPunch(isBackstab = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = isBackstab ? 0.18 : 0.12;

    // 1. 拳のインパクト（低音三角波急降下 90Hz -> 35Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isBackstab ? 110 : 85, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(isBackstab ? 0.85 : 0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 2. 肉と骨の衝突ノイズ（バンドパス 450Hz）
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.5, now);
      filter.frequency.setValueAtTime(isBackstab ? 550 : 420, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(isBackstab ? 0.75 : 0.55, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }

    // クリティカル時の重低音サブベース
    if (isBackstab) {
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.22);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.8, now);
      subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + 0.22);
    }
  }

  /**
   * 剣・刃物の攻撃音（シャキィン！ザシュッ！という鋭利な金属斬撃音）。
   * @param isBackstab 不意打ちクリティカル時は重低音と金属共鳴を追加
   */
  public playSwordAttack(isBackstab = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = isBackstab ? 0.16 : 0.11;

    // 1. ノイズによる斬撃の風切り＆肉裂き音（高域〜中域）
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.0, now);
      filter.frequency.setValueAtTime(isBackstab ? 2200 : 1800, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + dur);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(isBackstab ? 0.9 : 0.65, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }

    // 2. 金属ブレードのインパクト音（急降下Sawtooth波）
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isBackstab ? 420 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(isBackstab ? 0.75 : 0.5, now);
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
   * 槌・ウォーハンマー等の鈍器攻撃音（ドォン！ゴスッ！という破壊的重打撃音）。
   */
  public playHammerAttack(isBackstab = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = isBackstab ? 0.22 : 0.16;

    // 鉄塊の重低音打撃（急降下矩形波 140Hz -> 25Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isBackstab ? 160 : 130, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(isBackstab ? 0.85 : 0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 重圧ノイズ
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(60, now + dur);

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
   * 槍・ホーリーランス等の刺突攻撃音（シュバッ！ズスッ！という鋭利な突き刺し音）。
   */
  public playSpearAttack(isBackstab = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = isBackstab ? 0.14 : 0.09;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isBackstab ? 650 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.6, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * プレイヤー攻撃音（旧互換メソッド）。
   */
  public playAttack(isBackstab = false): void {
    this.playSwordAttack(isBackstab);
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
  /**
   * 攻撃の空振り・素振り音（ヒュッ！という風切り音）。
   * 武器を装備しているか素手かによって音質を差別化。
   * @param hasWeapon 武器を装備しているかどうか
   */
  public playMiss(hasWeapon = false): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = hasWeapon ? 0.09 : 0.08;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(hasWeapon ? 2.8 : 1.4, now);
    // 武器ありは高い金属風切り(1400Hz)、素手は低い拳風切り(600Hz)
    filter.frequency.setValueAtTime(hasWeapon ? 800 : 350, now);
    filter.frequency.linearRampToValueAtTime(hasWeapon ? 1600 : 650, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(hasWeapon ? 400 : 180, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(hasWeapon ? 0.45 : 0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 弓矢の発射音（ビュンッ！という弦鳴りと鋭い飛翔音）。
   */
  public playBowShoot(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.13;

    // 1. 弓の弦が弾けるピシッという低〜中音（三角波 280Hz -> 750Hz -> 180Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(140, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 2. 矢が空気を切り裂いて飛ぶ風切りノイズ（ハイパス 1200Hz）
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.2, now);
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.5, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * 射撃音（旧互換メソッド）。
   */
  public playShoot(): void {
    this.playBowShoot();
  }

  /**
   * 矢がモンスターに命中して刺さる音（ドスッ！という矢刺音）。
   */
  public playArrowHit(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.08;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 矢が壁に当たって落ちる音（カチッ…）。
   */
  public playArrowHitWall(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.05;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 魔法の杖照射音（杖の種類に応じた魔力音）。
   * @param staffName 杖のアイテム名称
   */
  public playZapStaff(staffName?: string): void {
    const name = staffName || '';
    if (name.includes('雷鳴')) {
      this.playThunder();
    } else if (name.includes('吹き飛ばし')) {
      this.playWindBlast();
    } else if (name.includes('かなしばり')) {
      this.playParalyze();
    } else if (name.includes('睡眠') || name.includes('一時しのぎ')) {
      this.playMagicCharm();
    } else {
      this.playZap();
    }
  }

  /**
   * 通常の魔法光線音（ピシューン！というエネルギービーム音）。
   */
  public playZap(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.22;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.65, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 雷鳴の杖・電撃魔法音（バリバリドォン！！という轟雷放電音）。
   */
  public playThunder(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.35;

    // 電撃ノイズ
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.2, now);
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.9, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }

    // 重低音の落雷（急降下Sawtooth波 240Hz -> 30Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 吹き飛ばしの杖・突風音（ゴォォッ！という衝撃波音）。
   */
  public playWindBlast(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.28;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(180, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.85, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * かなしばりの杖・石化音（キィーーン！という高音凍結・結晶化音）。
   */
  public playParalyze(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.3;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(2200, now + 0.08);
    osc.frequency.linearRampToValueAtTime(1600, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * 睡眠・一時しのぎの杖・幻惑音（ポワワ〜ン♪ という幻想的な魔力変調音）。
   */
  public playMagicCharm(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.35;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(880, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.55, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
  }

  /**
   * アイテム手投げ風切り音（ビュッ！という投擲音）。
   */
  public playThrowItem(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.1;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.0, now);
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.linearRampToValueAtTime(1100, now + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(300, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.5, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 投げたアイテムの命中音（バシッ！という衝突音）。
   */
  public playThrowHit(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.1;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.65, now);
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
   * 障害物押し・地響き音（ズズズ… / ゴゴゴゴッ…）。
   * @param durationSec 持続時間秒（移動距離に応じてスケール）
   */
  public playPushObstacle(durationSec = 0.35): void {
    this.playRockSlide(durationSec);
  }

  /**
   * 大石に肩を当てて力を込めた時の軋み・力み音（ググッ…！）。
   */
  public playPushStrain(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.22;

    // 低音のきしみ三角波（60Hz -> 85Hz -> 45Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(35, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.55, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 摩擦ノイズ
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.6, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * 大石がゴゴゴゴッと重い地響きを立てて転がる音。
   * @param durationSec 地響き持続秒数
   */
  public playRockSlide(durationSec = 0.6): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = Math.max(0.3, durationSec);

    // 1. 地鳴り超低周波オシレータ（55Hz〜40Hzでうねる）
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(45, now + dur * 0.5);
    osc.frequency.exponentialRampToValueAtTime(25, now + dur);

    const oscFilter = this.ctx.createBiquadFilter();
    oscFilter.type = 'lowpass';
    oscFilter.frequency.setValueAtTime(140, now);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscFilter);
    oscFilter.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 2. 石と床が擦れ合う重い地響きノイズ（ローパス 180Hz）
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);
      filter.frequency.linearRampToValueAtTime(120, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.85, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * 大石が壁やモンスターに激突・圧殺した時の大破砕音（ドガァァン！）。
   */
  public playRockCrash(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.35;

    // 激突の衝撃波低音（急降下矩形波 150Hz -> 20Hz）
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.9, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);

    // 岩石激突ノイズ
    const noiseBuffer = this.createNoiseBuffer(dur);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(80, now + dur);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0.9, now);
      nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      noiseSource.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + dur);
    }
  }

  /**
   * 氷塊や氷床の滑走音（サァーーッという滑らかな氷上摩擦音）。
   * @param durationSec 滑走秒数
   */
  public playIceSlide(durationSec = 0.4): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = Math.max(0.2, durationSec);

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, now);
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.linearRampToValueAtTime(1600, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.55, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 氷で滑って転んだ音（ツルッ…ドテッ！）。
   */
  public playIceSlip(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // 1. ツルッ（高音上昇サイン波）
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.linearRampToValueAtTime(1100, now + 0.1);

    const gain1 = this.ctx.createGain();
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // 2. ドテッ！（0.1秒後の尻もち低音打撃）
    const hitTime = now + 0.12;
    const dur2 = 0.15;
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(180, hitTime);
    osc2.frequency.exponentialRampToValueAtTime(40, hitTime + dur2);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.75, hitTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, hitTime + dur2);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(hitTime);
    osc2.stop(hitTime + dur2);
  }

  /**
   * 泥濘に足を取られてもがく音（ズブズブ…！）。
   */
  public playSwampStuck(): void {
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
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.linearRampToValueAtTime(100, now + dur);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.65, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);
  }

  /**
   * 障害物破壊・粉砕音（ガシャーン！バキィン！）。
   */
  public playBreakObstacle(): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const dur = 0.24;

    const noiseBuffer = this.createNoiseBuffer(dur);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noiseSource.start(now);
    noiseSource.stop(now + dur);

    // 破片の衝撃音
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + dur);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + dur);
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
