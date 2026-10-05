/**
 * @file AnimationEngine.ts
 * @description キャラクターの移動イージング補間、歩行ステップ＆体重移動ロッキング、
 * 左右向き（Facing Direction）追従、攻撃ステップイン、被弾フラッシュ＆振動、
 * 待機時アイドルボビングを統括管理するアニメーションエンジン。
 */

import { CardinalDirection, Direction8 } from '../core/types';

/**
 * 画面演出用パーティクルのインターフェース。
 */
export interface VisualParticle {
  /** 描画X座標（グリッド単位） */
  x: number;
  /** 描画Y座標（グリッド単位） */
  y: number;
  /** 移動速度X（グリッド/秒） */
  vx: number;
  /** 移動速度Y（グリッド/秒） */
  vy: number;
  /** パーティクル色コード */
  color: string;
  /** 描画サイズ（ピクセル） */
  size: number;
  /** 現在生存時間（秒） */
  life: number;
  /** 最大生存時間（秒） */
  maxLife: number;
  /** 重力加速度（グリッド/秒^2） */
  gravity: number;
  /** 不透明度（1.0〜0.0） */
  alpha: number;
}

/**
 * 個々のエンティティの動的アニメーション状態を表すインターフェース。
 */
export interface EntityAnimState {
  /** 補間描画X座標（グリッド単位の浮動小数点数） */
  renderX: number;
  /** 補間描画Y座標（グリッド単位の浮動小数点数） */
  renderY: number;
  /** 移動目標マスX座標 */
  targetX: number;
  /** 移動目標マスY座標 */
  targetY: number;
  /** 現在向いている主方位（'down': 正面, 'up': 背面, 'left': 左, 'right': 右） */
  direction: CardinalDirection;
  /** エンティティID */
  id?: string;
  /** 滑走（スライド）完了時に呼び出されるコールバック */
  onSlideComplete?: () => void;
  /** 現在向いている水平方向（1: 右向き, -1: 左向き） */
  facingDir: number;
  /** 現在マス間を移動中（歩行中）かどうかの真偽値 */
  isWalking: boolean;
  /** 滑走・高速スライド中かどうかの真偽値 */
  isSliding: boolean;
  /** 押せる大石（極めて低速かつ等速の重厚移動）かどうかの真偽値 */
  isPushable?: boolean;
  /** スライド移動速度倍率 */
  moveSpeedMultiplier: number;
  /** 歩行ステップサイクルの積算時間（手足のステップ・バウンス計算用） */
  walkTime: number;
  /** 攻撃踏み込み変位量X（グリッド単位） */
  attackOffsetX: number;
  /** 攻撃踏み込み変位量Y（グリッド単位） */
  attackOffsetY: number;
  /** 被弾時の赤色フラッシュ強度 (1.0 〜 0.0) */
  damageFlash: number;
  /** 被弾時の画面振動ノックバックX（ピクセル） */
  shakeX: number;
  /** 被弾時の画面振動ノックバックY（ピクセル） */
  shakeY: number;
  /** エンティティ固有のアイドル位相オフセット（非同期ボビング用） */
  idleOffset: number;
}

/**
 * 2Dアニメーション計算を統括するクラス。
 */
export class AnimationEngine {
  /** エンティティIDごとのアニメーション状態マップ */
  private states: Map<string, EntityAnimState> = new Map();

  /** 演出用パーティクルリスト */
  public particles: VisualParticle[] = [];

  /** グローバルアニメーション進行時間（秒） */
  public globalTime = 0;

  /** プレイヤー死亡演出の経過時間（秒、生存中は -1） */
  private playerDeathTime = -1;

  /** スクリーンシェイク（画面全体の地響き振動）Xオフセット（ピクセル） */
  public screenShakeX = 0;

  /** スクリーンシェイク（画面全体の地響き振動）Yオフセット（ピクセル） */
  public screenShakeY = 0;

  /** スクリーンシェイク残り時間（秒） */
  private screenShakeTime = 0;

  /** スクリーンシェイク最大時間（秒） */
  private screenShakeDuration = 0;

  /** スクリーンシェイク振幅強度（ピクセル） */
  private screenShakeIntensity = 0;

  /** プレイヤーの泥濘沈み込みオフセットY（ピクセル、泥に埋まっている間プラス値） */
  public playerSinkOffsetY = 0;

  /** プレイヤーの泥濘脱出ジャンプオフセットY（ピクセル、跳ね上がり中マイナス値） */
  public playerEscapeJumpY = 0;

  /** プレイヤーの氷上スリップ傾き角度（ラジアン） */
  public playerSlipTilt = 0;

  /** プレイヤーの氷上スリップ焦りワタワタ変位Y（ピクセル） */
  public playerSlipWobbleY = 0;

  /** 泥脱出ジャンプ経過時間（秒、未発生時は -1） */
  private escapeJumpTime = -1;

  /** 氷スリップ経過時間（秒、未発生時は -1） */
  private iceSlideTime = -1;

  /** 氷スリップ転倒ダウン経過時間（秒、未発生時は -1） */
  private playerSlipFallTime = -1;
  private playerSlipFallDuration = 0.75;

  /**
   * 画面全体の地響きスクリーンシェイクをトリガーします。
   */
  public triggerScreenShake(durationSec: number, intensityPx: number): void {
    this.screenShakeTime = durationSec;
    this.screenShakeDuration = durationSec;
    this.screenShakeIntensity = intensityPx;
  }

  /**
   * 泥濘からの脱出ジャンピング復帰アニメーションを開始します。
   */
  public triggerSwampEscapeMotion(): void {
    this.escapeJumpTime = 0;
  }

  /**
   * 氷上スリップ（傾き・バランス喪失・焦り揺れ）アニメーションを開始します。
   */
  public triggerIceSlideMotion(durationSec: number): void {
    this.iceSlideTime = durationSec;
  }

  /**
   * 氷上で足を滑らせて転倒したダウンアニメーションを開始します。
   */
  public triggerPlayerSlipFall(durationSec = 0.75): void {
    this.playerSlipFallTime = durationSec;
    this.playerSlipFallDuration = durationSec;
  }

  /**
   * プレイヤーが氷上で転倒中かどうかを取得します。
   */
  public isPlayerSlipFallen(): boolean {
    return this.playerSlipFallTime > 0;
  }

  /**
   * 氷上転倒による尻もちスクワッシュ（平たく潰れる）変形パラメータを取得します。
   */
  public getPlayerFallSquash(): { scaleX: number; scaleY: number; offsetY: number } {
    if (this.playerSlipFallTime <= 0) {
      return { scaleX: 1.0, scaleY: 1.0, offsetY: 0 };
    }
    const progress = 1.0 - this.playerSlipFallTime / this.playerSlipFallDuration; // 0.0 -> 1.0
    if (progress < 0.45) {
      // 激突・尻もちでペタンと潰れる
      const t = progress / 0.45;
      const sX = 1.0 + 0.35 * Math.sin(t * Math.PI * 0.5);
      const sY = 1.0 - 0.55 * Math.sin(t * Math.PI * 0.5);
      return { scaleX: sX, scaleY: sY, offsetY: 7 * Math.sin(t * Math.PI * 0.5) };
    } else {
      // よっこらしょと起き上がる
      const t = (progress - 0.45) / 0.55;
      const sX = 1.35 - 0.35 * t;
      const sY = 0.45 + 0.55 * t;
      return { scaleX: sX, scaleY: sY, offsetY: 7 * (1.0 - t) };
    }
  }

  /**
   * 現在氷上を滑走中（焦り演出中）かどうかを取得します。
   */
  public isIceSliding(): boolean {
    return this.iceSlideTime > 0;
  }

  /**
   * プレイヤー死亡時のドラマチックな倒れ込みアニメーション（ダウンモーション）を開始します。
   */
  public triggerPlayerDeath(): void {
    if (this.playerDeathTime < 0) {
      this.playerDeathTime = 0;
      this.triggerDamage('player');
    }
  }

  /**
   * プレイヤー死亡アニメーションが進行中かどうかを取得します。
   *
   * @returns 死亡演出が進行中であれば true
   */
  public isPlayerDead(): boolean {
    return this.playerDeathTime >= 0;
  }

  /**
   * プレイヤー死亡アニメーションの経過時間（秒）を取得します。
   *
   * @returns 経過秒数（未発生時は -1）
   */
  public getPlayerDeathTime(): number {
    return this.playerDeathTime;
  }

  /**
   * プレイヤー死亡状態をリセットし、生存状態のアニメーションに戻します（リスタート時等）。
   */
  public resetPlayerDeath(): void {
    this.playerDeathTime = -1;
  }

  /**
   * エンティティのアニメーション状態を取得します。存在しない場合は初期化して返します。
   *
   * @param id - エンティティID
   * @param initialX - 初期グリッドX座標
   * @param initialY - 初期グリッドY座標
   * @returns エンティティのアニメーション状態
   */
  public getState(
    id: string,
    initialX: number,
    initialY: number
  ): EntityAnimState {
    let state = this.states.get(id);
    if (!state) {
      state = {
        id,
        renderX: initialX,
        renderY: initialY,
        targetX: initialX,
        targetY: initialY,
        direction: 'down', // 初期向き: 正面（下向き）
        facingDir: 1, // 初期向き: 右向き
        isWalking: false,
        isSliding: false,
        moveSpeedMultiplier: 1.0,
        walkTime: 0,
        attackOffsetX: 0,
        attackOffsetY: 0,
        damageFlash: 0,
        shakeX: 0,
        shakeY: 0,
        idleOffset: Math.random() * Math.PI * 2,
      };
      this.states.set(id, state);
    }
    return state;
  }

  /**
   * エンティティの論理座標と同期し、座標変化があった場合は方位（4方向）の更新とスムーズな移動アニメーションを開始します。
   *
   * @param id - エンティティID
   * @param gridX - 現在の論理グリッドX座標
   * @param gridY - 現在の論理グリッドY座標
   * @param isSliding - 滑走・スライド移動中かどうか（氷塊等）
   * @param speedMultiplier - 移動補間速度倍率（氷塊は2.0倍等）
   * @param isPushable - 押せる大石かどうか（極めて低速かつ等速の重厚移動）
   */
  public syncPosition(
    id: string,
    gridX: number,
    gridY: number,
    isSliding = false,
    speedMultiplier = 1.0,
    isPushable = false
  ): void {
    const state = this.getState(id, gridX, gridY);

    const dx = gridX - state.targetX;
    const dy = gridY - state.targetY;

    state.isSliding = isSliding;
    state.isPushable = isPushable;
    state.moveSpeedMultiplier = speedMultiplier;

    // 移動が生じた場合、進行方向へ方位（8方向: 上・下・左・右・斜め4方向）を自動更新
    if (dx !== 0 && dy !== 0) {
      if (dx > 0 && dy > 0) state.direction = 'down_right';
      else if (dx < 0 && dy > 0) state.direction = 'down_left';
      else if (dx > 0 && dy < 0) state.direction = 'up_right';
      else if (dx < 0 && dy < 0) state.direction = 'up_left';
      state.facingDir = dx > 0 ? 1 : -1;
    } else if (dx !== 0) {
      state.direction = dx > 0 ? 'right' : 'left';
      state.facingDir = dx > 0 ? 1 : -1;
    } else if (dy !== 0) {
      state.direction = dy > 0 ? 'down' : 'up';
    }

    // 階層移動やワープ等で急激なジャンプがあった場合は即時テレポート（※滑走移動中や大石押しはテレポートせずスライド）
    const dist = Math.hypot(state.targetX - gridX, state.targetY - gridY);
    if (!isSliding && !isPushable && dist > 3.5) {
      state.renderX = gridX;
      state.renderY = gridY;
    }

    state.targetX = gridX;
    state.targetY = gridY;
  }

  /**
   * エンティティの向き（8方向）を直接設定します。
   *
   * @param id - エンティティID
   * @param dir - 向き
   */
  public setDirection(id: string, dir: Direction8): void {
    const state = this.getState(id, 0, 0);
    state.direction = dir;
    if (dir.includes('left')) {
      state.facingDir = -1;
    } else if (dir.includes('right')) {
      state.facingDir = 1;
    }
  }

  /**
   * 攻撃アクション（ステップイン突進）をトリガーします。
   *
   * @param id - 攻撃者エンティティID
   * @param dx - X方向突進ベクトル
   * @param dy - Y方向突進ベクトル
   */
  public triggerAttack(id: string, dx: number, dy: number): void {
    const state = this.getState(id, 0, 0);
    state.attackOffsetX = dx * 0.35;
    state.attackOffsetY = dy * 0.35;
  }

  /**
   * 被弾フラッシュおよび画面/エンティティ振動をトリガーします。
   *
   * @param id - 被弾エンティティID
   */
  public triggerDamage(id: string): void {
    const state = this.getState(id, 0, 0);
    state.damageFlash = 1.0;
    state.shakeX = (Math.random() - 0.5) * 5.0;
    state.shakeY = (Math.random() - 0.5) * 5.0;
  }

  /**
   * 破砕パーティクル（氷の結晶、雪片、土塊の破片など）を発生させます。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   * @param color - パーティクル色コード
   * @param count - 生成数
   */
  public triggerBreakParticles(
    x: number,
    y: number,
    color = '#38bdf8',
    count = 14
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.3,
        y: y + 0.5 + (Math.random() - 0.5) * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        color,
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.3,
        gravity: 4.5,
        alpha: 1.0,
      });
    }
  }

  /**
   * 物体移動時（大石押し出し等）の土煙パーティクルを発生させます。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   */
  public triggerDustParticles(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.4,
        y: y + 0.7 + (Math.random() - 0.5) * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.5 - 0.4,
        color: '#a8a29e',
        size: 4 + Math.random() * 5,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.25,
        gravity: -0.5,
        alpha: 0.6,
      });
    }
  }

  /**
   * 泥沼・泥濘足枷時の泥飛沫スプラッシュパーティクルを発生させます。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   */
  public triggerMudParticles(x: number, y: number): void {
    const mudColors = ['#5b3a29', '#78350f', '#3e2723', '#8d6e63', '#4a2c11'];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 2.2;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.4,
        y: y + 0.75 + (Math.random() - 0.5) * 0.2,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.0,
        color: mudColors[Math.floor(Math.random() * mudColors.length)],
        size: 3 + Math.random() * 5,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
        gravity: 5.5, // 泥の重力落下
        alpha: 0.95,
      });
    }
  }

  /**
   * 氷上滑走時のフロストスプレーパーティクル（スケートのエッジのように吹き飛ぶ氷晶粉塵）を発生させます。
   */
  public triggerFrostParticles(x: number, y: number, dx: number, dy: number): void {
    const frostColors = ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc'];
    const baseAngle = Math.atan2(dy, dx) + Math.PI; // 進行逆方向
    for (let i = 0; i < 14; i++) {
      const spreadAngle = baseAngle + (Math.random() - 0.5) * 1.8;
      const speed = 1.0 + Math.random() * 3.0;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.3,
        y: y + 0.75 + (Math.random() - 0.5) * 0.2,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed - 0.6,
        color: frostColors[Math.floor(Math.random() * frostColors.length)],
        size: 2.5 + Math.random() * 3.5,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.25,
        gravity: 2.5,
        alpha: 0.95,
      });
    }
  }

  /**
   * 滑走中の足元から継続的に発生するフロスト軌跡パーティクル（冷気・微細な氷結晶）。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   */
  public triggerFrostTrailParticles(x: number, y: number): void {
    const frostColors = ['#ffffff', '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc'];
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.7;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.35,
        y: y + 0.75 + (Math.random() - 0.5) * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.25,
        color: frostColors[Math.floor(Math.random() * frostColors.length)],
        size: 2 + Math.random() * 2.8,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        gravity: 0.3,
        alpha: 0.85,
      });
    }
  }

  /**
   * 氷上滑走で焦っている際の飛び散る冷や汗パーティクル（青白い汗滴）。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   */
  public triggerSweatParticles(x: number, y: number): void {
    const sweatColors = ['#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
    for (let i = 0; i < 2; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const speed = 0.5 + Math.random() * 1.1;
      this.particles.push({
        x: x + 0.5 + side * 0.28,
        y: y + 0.25 + (Math.random() - 0.5) * 0.1, // 頭上付近
        vx: side * speed,
        vy: -0.9 - Math.random() * 0.7, // 上にピュッと吹き出す
        color: sweatColors[Math.floor(Math.random() * sweatColors.length)],
        size: 2.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
        gravity: 4.8, // 汗の放物線落下
        alpha: 0.95,
      });
    }
  }

  /**
   * 氷上で転倒した際のピヨピヨ星・衝撃火花パーティクル（黄色・ゴールドの星が頭上を旋回・拡散）。
   *
   * @param x - 発生グリッドX
   * @param y - 発生グリッドY
   */
  public triggerDizzyStars(x: number, y: number): void {
    const starColors = ['#facc15', '#fde047', '#fef08a', '#fbbf24', '#ffffff'];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 0.8 + Math.random() * 1.6;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.2,
        y: y + 0.4 + (Math.random() - 0.5) * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6 - 0.7,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        size: 3.5 + Math.random() * 3.5,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.25,
        gravity: 1.2,
        alpha: 1.0,
      });
    }
  }

  /**
   * 泥濘から足を引き抜いた瞬間の大きな泥塊跳ね上がりパーティクルを発生させます。
   */
  public triggerMudEscapeParticles(
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ): void {
    const mudColors = ['#451a03', '#78350f', '#92400e', '#5b3a29', '#291002'];
    const dirX = Math.sign(targetX - x);
    const dirY = Math.sign(targetY - y);

    for (let i = 0; i < 16; i++) {
      const angle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 1.4;
      const speed = 1.2 + Math.random() * 3.2;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.3,
        y: y + 0.7 + (Math.random() - 0.5) * 0.2,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 2.0, // 上空へ大きく跳ね上がる
        color: mudColors[Math.floor(Math.random() * mudColors.length)],
        size: 4.5 + Math.random() * 5.0, // 大きな泥塊
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
        gravity: 7.5,
        alpha: 1.0,
      });
    }
  }

  /**
   * 大石移動時の重厚な連続土煙・小石破片パーティクルを発生させます。
   */
  public triggerHeavyDustParticles(x: number, y: number): void {
    const dustColors = ['#78716c', '#a8a29e', '#d6d3d1', '#57534e', '#e7e5e4'];
    for (let i = 0; i < 7; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 1.8;
      this.particles.push({
        x: x + 0.5 + (Math.random() - 0.5) * 0.5,
        y: y + 0.75 + (Math.random() - 0.5) * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.4 - 0.5,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
        size: 5 + Math.random() * 6,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.3,
        gravity: -0.2, // ふわっと漂う
        alpha: 0.7,
      });
    }
  }

  /**
   * 毎フレームのアニメーション補間を更新します。
   * 移動中の歩行サイクル、イージング補間、攻撃復帰、被弾フラッシュの減衰を計算します。
   *
   * @param dt - 前フレームからの経過時間（秒、通常 0.016 前後）
   */
  public update(dt: number): void {
    this.globalTime += dt;

    // プレイヤー死亡演出時間の進行
    if (this.playerDeathTime >= 0) {
      this.playerDeathTime += dt;
    }

    // スクリーンシェイクの更新
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      const ratio = Math.max(0, this.screenShakeTime / this.screenShakeDuration);
      this.screenShakeX = (Math.random() - 0.5) * 2 * this.screenShakeIntensity * ratio;
      this.screenShakeY = (Math.random() - 0.5) * 2 * this.screenShakeIntensity * ratio;
    } else {
      this.screenShakeX = 0;
      this.screenShakeY = 0;
    }

    // 泥脱出ジャンプ放物線の更新
    if (this.escapeJumpTime >= 0) {
      this.escapeJumpTime += dt;
      const t = this.escapeJumpTime / 0.55; // 0.55秒でポンと跳ねて着地
      if (t <= 1.0) {
        this.playerEscapeJumpY = -Math.sin(t * Math.PI) * 16; // 最大16px上空へジャンプ
      } else {
        this.playerEscapeJumpY = 0;
        this.escapeJumpTime = -1;
      }
    } else {
      this.playerEscapeJumpY = 0;
    }

    // 氷スリップ傾き＆焦りワタワタ揺れの更新
    if (this.iceSlideTime > 0) {
      this.iceSlideTime -= dt;
      this.playerSlipTilt = Math.sin(this.globalTime * 14) * 0.26; // 慌てて左右にバランスを取るバタバタ揺れ（約15度）
      this.playerSlipWobbleY = Math.sin(this.globalTime * 22) * 2.5; // 足が滑ってよろめく上下ワタワタ
    } else {
      this.playerSlipTilt = 0;
      this.playerSlipWobbleY = 0;
    }

    // 氷スリップ転倒ダウン時間の更新
    if (this.playerSlipFallTime > 0) {
      this.playerSlipFallTime -= dt;
    } else {
      this.playerSlipFallTime = -1;
    }

    // 1. 各エンティティの状態補間
    for (const state of this.states.values()) {
      const dx = state.targetX - state.renderX;
      const dy = state.targetY - state.renderY;
      const dist = Math.hypot(dx, dy);

      if (state.isPushable) {
        // 重い大石の移動演出:
        // 等速で重厚に（1秒あたり約1.35マス）地面を擦るように「ゴゴゴゴ……！」と移動
        const rockSpeed = 1.35;
        const maxStep = rockSpeed * dt;

        if (dist > 0.01) {
          state.isWalking = true;
          const ratio = Math.min(1.0, maxStep / dist);
          state.renderX += dx * ratio;
          state.renderY += dy * ratio;

          // 大石の移動中は継続して土煙・重厚スクリーンシェイク
          this.triggerHeavyDustParticles(state.renderX, state.renderY);
          this.triggerScreenShake(0.1, 2.5);
        } else {
          state.renderX = state.targetX;
          state.renderY = state.targetY;
          state.isWalking = false;
          state.isSliding = false;
        }
      } else if (state.isSliding) {
        // 氷の滑走演出:
        // 急激なLerpではなく、等速でスーッと滑らかに滑走！
        // 「３倍以上ゆっくりが良い」に基づき、秒速1.5マス（1マス進むのに約0.67秒。通常歩行の4倍以上ゆっくり！）
        // 氷の塊（ICE_BLOCK）は秒速2.0マス
        const slideSpeed =
          (state.id === 'player' ? 1.5 : 2.0) * (state.moveSpeedMultiplier || 1.0);
        const maxStep = slideSpeed * dt;

        if (dist > 0.01) {
          state.isWalking = false; // 滑走中は足踏み歩行モーションは出さず、スーッと滑走姿勢
          const ratio = Math.min(1.0, maxStep / dist);
          state.renderX += dx * ratio;
          state.renderY += dy * ratio;

          // 滑走中の冷気・霜の軌跡パーティクルを継続発生
          this.triggerFrostTrailParticles(state.renderX, state.renderY);
          if (state.id === 'player') {
            this.triggerSweatParticles(state.renderX, state.renderY);
          }
        } else {
          state.renderX = state.targetX;
          state.renderY = state.targetY;
          state.isWalking = false;
          state.isSliding = false;

          if (state.onSlideComplete) {
            state.onSlideComplete();
            state.onSlideComplete = undefined;
          }
        }
      } else {
        const moveLerpSpeed = 16.0 * (state.moveSpeedMultiplier || 1.0);

        if (dist > 0.01) {
          state.isWalking = true;
          state.walkTime += dt * 16.0;

          const step = Math.min(1.0, moveLerpSpeed * dt);
          state.renderX += dx * step;
          state.renderY += dy * step;
        } else {
          state.renderX = state.targetX;
          state.renderY = state.targetY;
          state.isWalking = false;
          state.isSliding = false;
          state.walkTime *= Math.max(0, 1.0 - 15.0 * dt);
        }
      }

      // 攻撃オフセットの減衰復帰
      state.attackOffsetX *= Math.max(0, 1.0 - 14.0 * dt);
      state.attackOffsetY *= Math.max(0, 1.0 - 14.0 * dt);

      // 被弾フラッシュの減衰
      if (state.damageFlash > 0) {
        state.damageFlash = Math.max(0, state.damageFlash - 3.5 * dt);
      }

      // 被弾振動の減衰
      state.shakeX *= Math.max(0, 1.0 - 20.0 * dt);
      state.shakeY *= Math.max(0, 1.0 - 20.0 * dt);
    }

    // 2. 演出パーティクルの進行と寿命更新
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.alpha = Math.max(0, 1.0 - p.life / p.maxLife);
    }
  }

  /**
   * 死亡等で存在しなくなったエンティティの状態をクリーンアップします。
   *
   * @param validIds - 現在生存している全エンティティIDのセット
   */
  public pruneInactive(validIds: Set<string>): void {
    for (const [id, state] of this.states.entries()) {
      if (!validIds.has(id)) {
        // スライド移動中または押し出し移動中は完了するまで破棄を保留
        if (state.isSliding || state.isPushable) {
          continue;
        }
        this.states.delete(id);
      }
    }
  }
}
