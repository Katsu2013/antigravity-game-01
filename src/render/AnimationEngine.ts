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
  /** 現在向いている水平方向（1: 右向き, -1: 左向き） */
  facingDir: number;
  /** 現在マス間を移動中（歩行中）かどうかの真偽値 */
  isWalking: boolean;
  /** 滑走・高速スライド中かどうかの真偽値 */
  isSliding: boolean;
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
   * @param isSliding - 滑走・スライド移動中かどうか（氷塊や石押し等）
   * @param speedMultiplier - 移動補間速度倍率（氷塊は2.0倍、石押しは0.8倍等）
   */
  public syncPosition(
    id: string,
    gridX: number,
    gridY: number,
    isSliding = false,
    speedMultiplier = 1.0
  ): void {
    const state = this.getState(id, gridX, gridY);

    const dx = gridX - state.targetX;
    const dy = gridY - state.targetY;

    state.isSliding = isSliding;
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

    // 階層移動やワープ等で急激なジャンプがあった場合は即時テレポート（※滑走移動中はテレポートせずスライド）
    const dist = Math.hypot(state.targetX - gridX, state.targetY - gridY);
    if (!isSliding && dist > 3.5) {
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

    // 1. 各エンティティの状態補間
    for (const state of this.states.values()) {
      const moveLerpSpeed =
        16.0 * (state.moveSpeedMultiplier || 1.0) * (state.isSliding ? 1.5 : 1.0);

      const dx = state.targetX - state.renderX;
      const dy = state.targetY - state.renderY;
      const dist = Math.hypot(dx, dy);

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
    for (const id of this.states.keys()) {
      if (!validIds.has(id)) {
        this.states.delete(id);
      }
    }
  }
}
