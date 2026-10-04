/**
 * @file InputManager.ts
 * @description PCおよびスマートフォンの多様な入力（キーボード、マウス、タッチ、スワイプ、仮想パッド）を
 * 統一されたゲームアクション（ActionType）に抽象化・集約する入力管理クラス。
 */

import { GameEngine } from '../core/GameEngine';
import { ActionType } from '../core/types';
import { CanvasRenderer } from '../render/CanvasRenderer';
import { UIManager } from '../ui/UIManager';

/**
 * 入力抽象化マネージャークラス。
 */
export class InputManager {
  /** アクションを実行する対象のゲームエンジン */
  private engine: GameEngine;

  /** 座標変換に使用するレンダラー */
  private renderer: CanvasRenderer;

  /** UIダイアログ操作用マネージャー */
  private ui: UIManager;

  /** マウス・タッチイベントを監視するキャンバス要素 */
  private canvas: HTMLCanvasElement;

  /** タッチ開始時のクライアントX座標（スワイプ検出用） */
  private touchStartX = 0;

  /** タッチ開始時のクライアントY座標（スワイプ検出用） */
  private touchStartY = 0;

  /** 現在タッチ操作中かどうかのフラグ */
  private isTouching = false;

  /** 押下中のキーセット（矢印やWASDの同時押しによる斜め移動判定用） */
  private pressedKeys = new Set<string>();

  /** 方向キーの同時押し合成用バッファタイマーID */
  private moveTimer: number | null = null;

  /** 仮想パッドの長押しリピート用ディレイタイマーID */
  private repeatDelayTimer: number | null = null;

  /** 仮想パッドの長押し連続実行用インターバルタイマーID */
  private repeatIntervalTimer: number | null = null;

  /**
   * InputManager のインスタンスを生成し、各種イベントリスナーを登録します。
   *
   * @param engine - 連携先のGameEngineインスタンス
   * @param renderer - 画面座標変換を行うCanvasRendererインスタンス
   * @param ui - UIダイアログ制御を行うUIManagerインスタンス
   * @param canvas - タッチ・クリックを検知するCanvas要素
   */
  constructor(
    engine: GameEngine,
    renderer: CanvasRenderer,
    ui: UIManager,
    canvas: HTMLCanvasElement
  ) {
    this.engine = engine;
    this.renderer = renderer;
    this.ui = ui;
    this.canvas = canvas;

    this.bindKeyboard();
    this.bindMouse();
    this.bindTouch();
    this.bindUIButtons();
  }

  /**
   * 生成されたゲームアクションをエンジンへ送出して実行します。
   *
   * @param action - 実行するアクション
   */
  private dispatchAction(action: ActionType): void {
    if (this.engine.isActionLocked()) return;
    this.engine.executeAction(action);
  }

  /**
   * PCキーボード入力（矢印、WASD、テンキー、ショートカットキー）を監視し、対応するアクションを発行します。
   */
  private bindKeyboard(): void {
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.pressedKeys.delete(e.key.toLowerCase());
      this.pressedKeys.delete(e.key);
    });

    window.addEventListener('blur', () => {
      this.pressedKeys.clear();
      if (this.moveTimer !== null) {
        clearTimeout(this.moveTimer);
        this.moveTimer = null;
      }
    });

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // 修飾キー単体の押下は無視
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      // タイトル画面またはモーダルが開いている場合はダンジョン内ゲーム操作を無効化
      const titleScreen = document.getElementById('title-screen');
      if (titleScreen && !titleScreen.classList.contains('hidden')) {
        return;
      }
      const inventoryModal = document.getElementById('inventory-modal');
      const scoresModal = document.getElementById('scores-modal');
      const helpModal = document.getElementById('help-modal');
      const gameoverModal = document.getElementById('gameover-modal');

      if (
        (inventoryModal && !inventoryModal.classList.contains('hidden')) ||
        (scoresModal && !scoresModal.classList.contains('hidden')) ||
        (helpModal && !helpModal.classList.contains('hidden')) ||
        (gameoverModal && !gameoverModal.classList.contains('hidden'))
      ) {
        if (e.key === 'Escape') {
          this.ui.closeInventoryModal();
          this.ui.hideScoresModal();
          this.ui.hideHelpModal();
        } else if (inventoryModal && !inventoryModal.classList.contains('hidden')) {
          if (['o', 's'].includes(e.key.toLowerCase())) {
            e.preventDefault();
            this.engine.sortInventory();
          }
        }
        return;
      }

      const keyLower = e.key.toLowerCase();
      this.pressedKeys.add(keyLower);
      this.pressedKeys.add(e.key);

      // 非移動アクションの判定
      if (['z', 'j', 'enter'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'INTERACT' });
        return;
      }
      if (['x', 'k', ' ', '5'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'WAIT' });
        return;
      }
      if (['c', 'i', 'tab'].includes(keyLower)) {
        e.preventDefault();
        this.ui.toggleInventoryModal();
        return;
      }
      if (['o'].includes(keyLower)) {
        e.preventDefault();
        this.engine.sortInventory();
        return;
      }
      if (['v', 'm'].includes(keyLower)) {
        e.preventDefault();
        this.toggleMinimap();
        return;
      }
      if (['p', 'g'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'PICKUP' });
        return;
      }
      if (keyLower === 'r') {
        e.preventDefault();
        this.dispatchAction({ type: 'REGEN' });
        return;
      }

      // 単独の斜めキー判定
      // 北西 (Q / 7 / Y / Home)
      if (['q', '7', 'y', 'home'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'MOVE', dx: -1, dy: -1 });
        return;
      }
      // 北東 (E / 9 / U / PageUp)
      if (['e', '9', 'u', 'pageup'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'MOVE', dx: 1, dy: -1 });
        return;
      }
      // 南西 (1 / B / End)
      if (['1', 'b', 'end'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'MOVE', dx: -1, dy: 1 });
        return;
      }
      // 南東 (3 / N / PageDown)
      if (['3', 'n', 'pagedown'].includes(keyLower)) {
        e.preventDefault();
        this.dispatchAction({ type: 'MOVE', dx: 1, dy: 1 });
        return;
      }

      // 方向キー（矢印 / WASD / テンキー）の押下状態から合成移動ベクトルを計算
      const isUp =
        this.pressedKeys.has('arrowup') ||
        this.pressedKeys.has('w') ||
        this.pressedKeys.has('8');
      const isDown =
        this.pressedKeys.has('arrowdown') ||
        this.pressedKeys.has('s') ||
        this.pressedKeys.has('2');
      const isLeft =
        this.pressedKeys.has('arrowleft') ||
        this.pressedKeys.has('a') ||
        this.pressedKeys.has('4');
      const isRight =
        this.pressedKeys.has('arrowright') ||
        this.pressedKeys.has('d') ||
        this.pressedKeys.has('6');

      let dx = 0;
      let dy = 0;
      if (isUp) dy -= 1;
      if (isDown) dy += 1;
      if (isLeft) dx -= 1;
      if (isRight) dx += 1;

      if (dx === 0 && dy === 0) return;

      e.preventDefault();

      // 斜め入力（同時押し）が成立している場合は即座に実行
      if (dx !== 0 && dy !== 0) {
        if (this.moveTimer !== null) {
          clearTimeout(this.moveTimer);
          this.moveTimer = null;
        }
        this.dispatchAction({ type: 'MOVE', dx, dy });
        return;
      }

      // 単一の方向キーが押された場合、ごくわずか（25ms）バッファリングして
      // 直後の同時キー（斜め入力）を待つ。同時キーが来なければ単方向移動を実行。
      if (this.moveTimer !== null) {
        clearTimeout(this.moveTimer);
      }

      this.moveTimer = window.setTimeout(() => {
        this.moveTimer = null;
        const curUp =
          this.pressedKeys.has('arrowup') ||
          this.pressedKeys.has('w') ||
          this.pressedKeys.has('8');
        const curDown =
          this.pressedKeys.has('arrowdown') ||
          this.pressedKeys.has('s') ||
          this.pressedKeys.has('2');
        const curLeft =
          this.pressedKeys.has('arrowleft') ||
          this.pressedKeys.has('a') ||
          this.pressedKeys.has('4');
        const curRight =
          this.pressedKeys.has('arrowright') ||
          this.pressedKeys.has('d') ||
          this.pressedKeys.has('6');

        let finalDx = 0;
        let finalDy = 0;
        if (curUp) finalDy -= 1;
        if (curDown) finalDy += 1;
        if (curLeft) finalDx -= 1;
        if (curRight) finalDx += 1;

        if (finalDx !== 0 || finalDy !== 0) {
          this.dispatchAction({ type: 'MOVE', dx: finalDx, dy: finalDy });
        } else {
          this.dispatchAction({ type: 'MOVE', dx, dy });
        }
      }, 25);
    });
  }

  /**
   * PCマウスによるCanvasクリック入力を監視します。
   * プレイヤーと隣接する8方向のマスをクリックした場合はその方向へ移動/攻撃し、
   * プレイヤー自身のマスをクリックした場合はその場で足踏みします。
   */
  private bindMouse(): void {
    this.canvas.addEventListener('click', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const gridPos = this.renderer.screenToGrid(clickX, clickY);
      const player = this.engine.player;

      const dx = gridPos.x - player.x;
      const dy = gridPos.y - player.y;

      // クリック位置がプレイヤーと隣接している場合
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        if (dx === 0 && dy === 0) {
          this.dispatchAction({ type: 'WAIT' });
        } else {
          this.dispatchAction({ type: 'MOVE', dx, dy });
        }
      }
    });
  }

  /**
   * モバイルデバイス向けのタッチおよびスワイプジェスチャー入力を監視します。
   */
  private bindTouch(): void {
    this.canvas.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 1) {
          this.isTouching = true;
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      'touchend',
      (e: TouchEvent) => {
        if (!this.isTouching) return;
        this.isTouching = false;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;
        const dist = Math.hypot(deltaX, deltaY);

        // 25px以上の移動がある場合はスワイプ操作とみなす
        if (dist >= 25) {
          const angle = Math.atan2(deltaY, deltaX);
          const step = Math.PI / 4;
          const index = Math.round(angle / step);

          let dx = 0;
          let dy = 0;

          switch (index) {
            case 0: dx = 1; dy = 0; break;
            case 1: dx = 1; dy = 1; break;
            case 2: dx = 0; dy = 1; break;
            case 3: dx = -1; dy = 1; break;
            case 4:
            case -4: dx = -1; dy = 0; break;
            case -3: dx = -1; dy = -1; break;
            case -2: dx = 0; dy = -1; break;
            case -1: dx = 1; dy = -1; break;
          }

          this.dispatchAction({ type: 'MOVE', dx, dy });
        } else {
          // タップ操作
          const rect = this.canvas.getBoundingClientRect();
          const clickX = this.touchStartX - rect.left;
          const clickY = this.touchStartY - rect.top;
          const gridPos = this.renderer.screenToGrid(clickX, clickY);
          const player = this.engine.player;

          const dx = gridPos.x - player.x;
          const dy = gridPos.y - player.y;

          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            if (dx === 0 && dy === 0) {
              this.dispatchAction({ type: 'WAIT' });
            } else {
              this.dispatchAction({ type: 'MOVE', dx, dy });
            }
          }
        }
      },
      { passive: true }
    );
  }

  /**
   * ミニマップの表示・非表示をトグル切り替えし、HUDボタンの表示およびログを更新します。
   */
  public toggleMinimap(): void {
    const isVisible = this.renderer.toggleMinimap();
    const btn = document.getElementById('btn-toggle-map');
    if (btn) {
      btn.textContent = isVisible ? 'MAP: ON' : 'MAP: OFF';
      if (isVisible) {
        btn.classList.add('highlight');
      } else {
        btn.classList.remove('highlight');
      }
    }
    this.engine.addLog(
      isVisible ? 'ミニマップを表示しました。' : 'ミニマップを非表示にしました。',
      'info'
    );
  }

  /**
   * 仮想ボタンの長押しオートリピートを安全に停止・クリーンアップします。
   */
  private stopButtonRepeat(): void {
    if (this.repeatDelayTimer !== null) {
      window.clearTimeout(this.repeatDelayTimer);
      this.repeatDelayTimer = null;
    }
    if (this.repeatIntervalTimer !== null) {
      window.clearInterval(this.repeatIntervalTimer);
      this.repeatIntervalTimer = null;
    }
  }

  /**
   * モバイル画面上の仮想十字キー（D-pad）および4ボタン（A, B, X, Y）のクリック・タッチをバインドします。
   * 十字キーおよび足踏みボタンは長押しオートリピート（押しっぱなしで連続移動・連続足踏み）に対応します。
   */
  private bindUIButtons(): void {
    // 画面外やボタン外で指が離れた場合に確実にリピートを停止
    window.addEventListener('pointerup', () => this.stopButtonRepeat());
    window.addEventListener('pointercancel', () => this.stopButtonRepeat());

    // 仮想D-padボタン（8方向＋中央待機・長押し連続移動対応）
    const dpadButtons = document.querySelectorAll<HTMLButtonElement>('.dpad-btn');
    dpadButtons.forEach((btn) => {
      const getAction = (): ActionType | null => {
        const dir = btn.dataset.dir;
        switch (dir) {
          case 'N': return { type: 'MOVE', dx: 0, dy: -1 };
          case 'S': return { type: 'MOVE', dx: 0, dy: 1 };
          case 'W': return { type: 'MOVE', dx: -1, dy: 0 };
          case 'E': return { type: 'MOVE', dx: 1, dy: 0 };
          case 'NW': return { type: 'MOVE', dx: -1, dy: -1 };
          case 'NE': return { type: 'MOVE', dx: 1, dy: -1 };
          case 'SW': return { type: 'MOVE', dx: -1, dy: 1 };
          case 'SE': return { type: 'MOVE', dx: 1, dy: 1 };
          case 'WAIT': return { type: 'WAIT' };
          default: return null;
        }
      };

      btn.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        const action = getAction();
        if (!action) return;

        this.stopButtonRepeat();
        // 初回即時実行
        this.dispatchAction(action);

        // 長押しディレイ（230ms）後に連続移動リピート（130ms周期）開始
        this.repeatDelayTimer = window.setTimeout(() => {
          this.repeatIntervalTimer = window.setInterval(() => {
            const currentAction = getAction();
            if (currentAction) {
              this.dispatchAction(currentAction);
            }
          }, 130);
        }, 230);
      });

      btn.addEventListener('pointerup', () => this.stopButtonRepeat());
      btn.addEventListener('pointercancel', () => this.stopButtonRepeat());
      btn.addEventListener('pointerleave', () => this.stopButtonRepeat());
    });

    // [Aボタン] 決定 / 拾う / 階段
    document.getElementById('btn-pad-a')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.dispatchAction({ type: 'INTERACT' });
    });

    // [Bボタン] 足踏み（長押しで連続足踏み回復対応）
    const btnB = document.getElementById('btn-pad-b');
    if (btnB) {
      btnB.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.stopButtonRepeat();
        this.dispatchAction({ type: 'WAIT' });

        this.repeatDelayTimer = window.setTimeout(() => {
          this.repeatIntervalTimer = window.setInterval(() => {
            this.dispatchAction({ type: 'WAIT' });
          }, 110);
        }, 230);
      });
      btnB.addEventListener('pointerup', () => this.stopButtonRepeat());
      btnB.addEventListener('pointercancel', () => this.stopButtonRepeat());
      btnB.addEventListener('pointerleave', () => this.stopButtonRepeat());
    }

    // [Xボタン] 持ち物開閉
    const btnX = document.getElementById('btn-pad-x');
    if (btnX) {
      btnX.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.ui.toggleInventoryModal();
      });
      btnX.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // [Yボタン] ミニマップ切替
    document.getElementById('btn-pad-y')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.toggleMinimap();
    });

    // HUDのミニマップ切替ボタン
    document.getElementById('btn-toggle-map')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleMinimap();
    });

    // 再生成ボタン
    document.getElementById('btn-regen')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.dispatchAction({ type: 'REGEN' });
    });
  }
}
