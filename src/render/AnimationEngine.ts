/**
 * @file AnimationEngine.ts
 * @description キャラクターの移動イージング補間、歩行ステップ＆体重移動ロッキング、
 * 左右向き（Facing Direction）追従、攻撃ステップイン、被弾フラッシュ＆振動、
 * 待機時アイドルボビングを統括管理するアニメーションエンジン。
 */

import { CardinalDirection } from '../core/types';

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
   */
  public syncPosition(id: string, gridX: number, gridY: number): void {
    const state = this.getState(id, gridX, gridY);

    const dx = gridX - state.targetX;
    const dy = gridY - state.targetY;

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

    // 階層移動やワープ等で2マス以上の急激なジャンプがあった場合は即時テレポート
    const dist = Math.hypot(state.targetX - gridX, state.targetY - gridY);
    if (dist > 2.5) {
      state.renderX = gridX;
      state.renderY = gridY;
    }

    state.targetX = gridX;
    state.targetY = gridY;
  }

  /**
   * エンティティの向き（方位）を明示的に設定します。
   *
   * @param id - エンティティID
   * @param direction - 設定する方位（8方向）
   */
  public setDirection(id: string, direction: CardinalDirection): void {
    const state = this.states.get(id);
    if (state) {
      state.direction = direction;
      if (
        direction === 'left' ||
        direction === 'down_left' ||
        direction === 'up_left'
      ) {
        state.facingDir = -1;
      } else if (
        direction === 'right' ||
        direction === 'down_right' ||
        direction === 'up_right'
      ) {
        state.facingDir = 1;
      }
    }
  }

  /**
   * 指定方向への攻撃踏み込み（スラッシュ）モーションを発動し、攻撃対象の方向へ向きも更新します。
   *
   * @param id - 攻撃を行うエンティティID
   * @param dx - 攻撃方向X (-1, 0, 1)
   * @param dy - 攻撃方向Y (-1, 0, 1)
   */
  public triggerAttack(id: string, dx: number, dy: number): void {
    const state = this.states.get(id);
    if (state) {
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

      state.attackOffsetX = dx * 0.35; // 0.35マス分素早く踏み込む
      state.attackOffsetY = dy * 0.35;
    }
  }

  /**
   * 被ダメージ時の赤点滅およびノックバック振動を発動します。
   *
   * @param id - 被弾したエンティティID
   */
  public triggerDamage(id: string): void {
    const state = this.states.get(id);
    if (state) {
      state.damageFlash = 1.0;
      state.shakeX = (Math.random() - 0.5) * 8;
      state.shakeY = (Math.random() - 0.5) * 8;
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

    // 移動補間スピード
    const moveLerpSpeed = 16.0;

    for (const state of this.states.values()) {
      // 1. 移動のスムーズ補間（LERP）
      const dx = state.targetX - state.renderX;
      const dy = state.targetY - state.renderY;
      const dist = Math.hypot(dx, dy);

      if (dist > 0.01) {
        state.isWalking = true;
        // 歩行ステップサイクルを進行
        state.walkTime += dt * 16.0;

        state.renderX += dx * Math.min(1.0, moveLerpSpeed * dt);
        state.renderY += dy * Math.min(1.0, moveLerpSpeed * dt);
      } else {
        state.renderX = state.targetX;
        state.renderY = state.targetY;
        state.isWalking = false;
        // 停止時は歩行サイクルをスムーズにニュートラル（0）へ戻す
        state.walkTime *= Math.max(0, 1.0 - 15.0 * dt);
      }

      // 2. 攻撃オフセットの減衰復帰（スプリングバック）
      state.attackOffsetX *= Math.max(0, 1.0 - 14.0 * dt);
      state.attackOffsetY *= Math.max(0, 1.0 - 14.0 * dt);

      // 3. 被弾フラッシュの減衰
      if (state.damageFlash > 0) {
        state.damageFlash = Math.max(0, state.damageFlash - 3.5 * dt);
      }

      // 4. 被弾振動の減衰
      state.shakeX *= Math.max(0, 1.0 - 20.0 * dt);
      state.shakeY *= Math.max(0, 1.0 - 20.0 * dt);
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
