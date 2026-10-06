/**
 * @file InputManager.ts
 * @description PCおよびスマートフォンの多様な入力（キーボード、マウス、タッチ、スワイプ、仮想パッド）を
 * 統一されたゲームアクション（ActionType）に抽象化・集約する入力管理クラス。
 */

import { GameEngine } from '../core/GameEngine';
import { ActionType } from '../core/types';
import { CanvasRenderer } from '../render/CanvasRenderer';
import { UIManager } from '../ui/UIManager';
import { SoundSystem } from '../audio/SoundSystem';

/**
 * 入力抽象化マネージャークラス。
 */
export class InputManager {
  /**
   * アクションを実行・指示する対象のゲームエンジンインスタンス。
   */
  private engine: GameEngine;

  /**
   * 画面座標からゲーム内グリッド座標への変換に使用するレンダラー。
   */
  private renderer: CanvasRenderer;

  /**
   * UIダイアログやインベントリモーダルの開閉操作を行うマネージャー。
   */
  private ui: UIManager;

  /**
   * マウス・タッチイベントを監視するキャンバス要素。
   */
  private canvas: HTMLCanvasElement;

  /**
   * タッチ開始時のクライアントX座標（スワイプ方向判定用）。
   * - 想定値: クライアントピクセル座標
   * - 初期値: 0
   */
  private touchStartX = 0;

  /**
   * タッチ開始時のクライアントY座標（スワイプ方向判定用）。
   * - 想定値: クライアントピクセル座標
   * - 初期値: 0
   */
  private touchStartY = 0;

  /**
   * 現在画面上でタッチ操作が継続中かどうかのフラグ。
   * - 想定値:
   *   - `true`: 画面に指が触れている状態（スワイプ中または長押し中）
   *   - `false`: 指が離れている静止状態
   * - 初期値: `false`
   */
  private isTouching = false;

  /**
   * 現在押下されているキーのセット（矢印やWASDの同時押しによる8方向斜め移動判定用）。
   * - 初期値: 空のSet
   */
  private pressedKeys = new Set<string>();

  /**
   * 方向キーの同時押し斜め合成用バッファタイマーID（約20〜30msディレイ）。
   * - 想定値: window.setTimeout ID または `null`
   * - 初期値: `null`
   */
  private moveTimer: number | null = null;

  /**
   * 仮想パッドボタンの長押しリピート開始ディレイタイマーID。
   * - 想定値: window.setTimeout ID または `null`
   * - 初期値: `null`
   */
  private repeatDelayTimer: number | null = null;

  /**
   * 仮想パッドボタンの長押し連続移動・足踏み実行用インターバルタイマーID。
   * - 想定値: window.setInterval ID または `null`
   * - 初期値: `null`
   */
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

    // ズームボタンの初期表示設定と同期リスナー
    this.updateZoomButtonUI(this.renderer.zoom);
    this.renderer.onZoomChange = (z) => this.updateZoomButtonUI(z);
  }

  /**
   * 生成されたゲームアクションをエンジンへ送出して実行します。
   *
   * @param action - 実行するアクション
   */
  private dispatchAction(action: ActionType): void {
    SoundSystem.getInstance().unlock();

    // 死亡している場合はリスタートアクション以外は一切受け付けない
    if (!this.engine.player.isAlive && action.type !== 'RESTART') {
      return;
    }
    // 演出アニメーション中（岩押し・氷滑走等）は操作を受け付けない
    if (this.engine.isActionLocked()) {
      return;
    }
    // タイトル画面が表示されている時はダンジョン内操作を受け付けない
    const titleScreen = document.getElementById('title-screen');
    if (titleScreen && !titleScreen.classList.contains('hidden')) {
      return;
    }
    // モーダル（所持品一覧、ゲームオーバー、スコア、ヘルプ等）が開いている時はダンジョン内操作を遮断
    if (this.ui.isAnyModalOpen() && action.type !== 'RESTART') {
      return;
    }

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
        const keyLower = e.key.toLowerCase();
        if (e.key === 'Escape') {
          this.ui.closeInventoryModal();
          this.ui.hideScoresModal();
          this.ui.hideHelpModal();
          return;
        }

        // 所持品モーダル表示中のキーボード操作（カーソル移動・使用・整理・閉じる）
        if (inventoryModal && !inventoryModal.classList.contains('hidden')) {
          if (['arrowup', 'w', '8'].includes(keyLower)) {
            e.preventDefault();
            this.ui.moveInventorySelection(-1);
            return;
          }
          if (['arrowdown', 's', '2'].includes(keyLower)) {
            e.preventDefault();
            this.ui.moveInventorySelection(1);
            return;
          }
          if (['enter', 'z', 'j'].includes(keyLower)) {
            e.preventDefault();
            this.ui.useSelectedInventoryItem();
            return;
          }
          if (['t', 'x'].includes(keyLower)) {
            e.preventDefault();
            this.ui.throwSelectedInventoryItem();
            return;
          }
          if (['b', 'k', 'c', 'i', 'tab'].includes(keyLower)) {
            e.preventDefault();
            this.ui.closeInventoryModal();
            return;
          }
          if (['o', 'y'].includes(keyLower)) {
            e.preventDefault();
            this.ui.sortInventoryFromUI();
            return;
          }
          if (keyLower === 'd') {
            e.preventDefault();
            this.ui.dropSelectedInventoryItem();
            return;
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
      if (keyLower === 'f') {
        // [Fキー] 矢を撃つ（クイック射撃）
        e.preventDefault();
        this.quickShootArrow();
        return;
      }
      if (keyLower === 't') {
        // [Tキー] 杖を振る（クイック杖照射）
        e.preventDefault();
        this.quickZapStaff();
        return;
      }
      if ([' ', '5', '.'].includes(keyLower)) {
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
      if (['+', ';', '='].includes(e.key)) {
        e.preventDefault();
        this.renderer.setZoom(this.renderer.zoom + 0.15);
        return;
      }
      if (['-', '_'].includes(e.key)) {
        e.preventDefault();
        this.renderer.setZoom(this.renderer.zoom - 0.15);
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
      // 死亡中またはモーダル（所持品一覧・ゲームオーバー・ヘルプ等）表示中は無効
      if (!this.engine.player.isAlive || this.ui.isAnyModalOpen()) {
        return;
      }

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
        // 死亡中またはモーダル表示中は無効
        if (!this.engine.player.isAlive || this.ui.isAnyModalOpen()) {
          this.isTouching = false;
          return;
        }

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

        // 死亡中またはモーダル表示中は無効
        if (!this.engine.player.isAlive || this.ui.isAnyModalOpen()) {
          return;
        }

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
   * カメラズームのHUDボタン表示を最新の倍率に更新します。
   */
  public updateZoomButtonUI(zoom: number): void {
    const btn = document.getElementById('btn-zoom-toggle');
    if (btn) {
      btn.textContent = `🔍 ${Math.round(zoom * 100)}%`;
    }
  }

  /**
   * カメラのズーム倍率を主要プリセット（100% -> 150% -> 200%）で循環切り替えします。
   */
  public toggleZoom(): void {
    const nextZoom = this.renderer.cycleZoom();
    this.updateZoomButtonUI(nextZoom);
    this.engine.addLog(
      `画面表示を ${Math.round(nextZoom * 100)}% に切り替えました。`,
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

        // 死亡時または所持品以外のモーダル（ヘルプ・ゲームオーバー・スコア等）が開いている場合は何もしない
        if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
          this.stopButtonRepeat();
          return;
        }

        // 所持品モーダル表示中の十字キー操作（上下でアイテム選択カーソル移動）
        if (this.ui.isInventoryOpen()) {
          const dir = btn.dataset.dir;
          let delta = 0;
          if (dir === 'N' || dir === 'NW' || dir === 'NE') delta = -1;
          else if (dir === 'S' || dir === 'SW' || dir === 'SE') delta = 1;

          if (delta !== 0) {
            this.stopButtonRepeat();
            this.ui.moveInventorySelection(delta);

            this.repeatDelayTimer = window.setTimeout(() => {
              this.repeatIntervalTimer = window.setInterval(() => {
                this.ui.moveInventorySelection(delta);
              }, 150);
            }, 240);
          }
          return;
        }

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

    // [Aボタン] 攻撃/決定/拾う/階段（所持品モーダル中はアイテム使用/装備）
    document.getElementById('btn-pad-a')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
        return;
      }
      if (this.ui.isInventoryOpen()) {
        this.ui.useSelectedInventoryItem();
        return;
      }
      this.dispatchAction({ type: 'INTERACT' });
    });

    // [Bボタン] 矢を撃つ（所持品モーダル中はモーダルを閉じる）
    const btnB = document.getElementById('btn-pad-b');
    if (btnB) {
      btnB.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
          return;
        }
        if (this.ui.isInventoryOpen()) {
          this.ui.closeInventoryModal();
          return;
        }
        this.quickShootArrow();
      });
    }

    // [Xボタン] 持ち物開閉（所持品モーダル中は選択中アイテムを投げる）
    const btnX = document.getElementById('btn-pad-x');
    if (btnX) {
      btnX.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.engine.player.isAlive) return;
        if (this.ui.isInventoryOpen()) {
          this.ui.throwSelectedInventoryItem();
          return;
        }
        this.ui.openInventoryModal();
      });
      btnX.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    // [Yボタン] 魔法の杖を振る（所持品モーダル中は持ち物整理整頓）
    document.getElementById('btn-pad-y')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
        return;
      }
      if (this.ui.isInventoryOpen()) {
        this.ui.sortInventoryFromUI();
        return;
      }
      this.quickZapStaff();
    });

    // HUDのズーム切替ボタン
    document.getElementById('btn-zoom-toggle')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleZoom();
    });

    // HUDのミニマップ切替ボタン
    document.getElementById('btn-toggle-map')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (!this.engine.player.isAlive || this.ui.isAnyModalOpen()) {
        return;
      }
      this.toggleMinimap();
    });

    // 再生成ボタン
    document.getElementById('btn-regen')?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.engine.player.isAlive || this.ui.isAnyModalOpen()) {
        return;
      }
      this.dispatchAction({ type: 'REGEN' });
    });
  }

  /**
   * 装備中の矢（木の矢・鉄の矢・銀の矢）を向いている方向へ射出します。
   */
  private quickShootArrow(): void {
    if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
      return;
    }
    const equippedArrow = this.engine.player.equippedArrow;
    if (equippedArrow) {
      this.engine.shoot(equippedArrow.id);
    } else {
      this.engine.addLog('矢を装備していません！所持品から矢を装備してください。', 'warning');
    }
  }

  /**
   * 装備中の魔法の杖を向いている方向へ照射します。
   */
  private quickZapStaff(): void {
    if (!this.engine.player.isAlive || (this.ui.isAnyModalOpen() && !this.ui.isInventoryOpen())) {
      return;
    }
    const equippedStaff = this.engine.player.equippedStaff;
    if (equippedStaff) {
      this.engine.zapStaff(equippedStaff.id);
    } else {
      this.engine.addLog('魔法の杖を装備していません！所持品から杖を装備してください。', 'warning');
    }
  }
}
