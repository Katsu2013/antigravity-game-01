/**
 * @file UIManager.ts
 * @description HTML/DOM上のUI要素（HUDステータス表示、行動ログリスト、インベントリ表示、
 * 各種モーダルダイアログ、階層トースト通知）の更新および演出を統括するUI管理クラス。
 */

import { GameEngine } from '../core/GameEngine';
import { SVGSprites } from '../render/sprites/SVGSprites';
import { RunStats, StorageManager } from '../storage/StorageManager';

/**
 * DOM UIコンポーネント管理クラス。
 */
export class UIManager {
  /** 監視対象のGameEngineインスタンス */
  private engine: GameEngine;

  /** 現在階層を表示するDOM要素 */
  private floorEl: HTMLElement;

  /** プレイヤーレベルを表示するDOM要素 */
  private levelEl: HTMLElement;

  /** 現在/最大HPを表示するDOM要素 */
  private hpEl: HTMLElement;

  /** HPゲージ（棒グラフ）の塗りつぶしDOM要素 */
  private hpBarEl: HTMLElement | null;

  /** 満腹度パーセンテージを表示するDOM要素 */
  private hungerEl: HTMLElement;

  /** 満腹度ゲージ（棒グラフ）の塗りつぶしDOM要素 */
  private hungerBarEl: HTMLElement | null;

  /** 攻撃力/防御力を表示するDOM要素 */
  private statsEl: HTMLElement;

  /** 所持ゴールドを表示するDOM要素 */
  private goldEl: HTMLElement;

  /** 泥棒警報インジケータDOM要素 */
  private thiefIndicatorEl: HTMLElement;

  /** 現在ターン数を表示するDOM要素 */
  private turnEl: HTMLElement;

  /** デスクトップ向けの行動ログコンテナ要素 */
  private logListEl: HTMLElement;

  /** モバイル画面下部の最新ログ表示ティッカー要素 */
  private mobileTickerEl: HTMLElement;

  /** 階層遷移時にポップアップ表示されるトースト通知要素 */
  private floorToastEl: HTMLElement;

  /** デスクトップ用のインベントリリストコンテナ要素 */
  private desktopInventoryListEl: HTMLElement;

  /** モーダル用のインベントリリストコンテナ要素 */
  private modalInventoryListEl: HTMLElement;

  /** インベントリモーダル要素 */
  private inventoryModalEl: HTMLElement;

  /** ゲームオーバーモーダル要素 */
  private gameOverModalEl: HTMLElement;

  /** ゲームオーバーステータス表示要素 */
  private gameOverStatsEl: HTMLElement;

  /** ゲームオーバー時の敗因説明テキスト要素 */
  private gameoverCauseEl: HTMLElement | null;

  /** インベントリ所持容量バッジ要素 */
  private inventoryCapacityEl: HTMLElement;

  /** インベントリモーダルで現在選択されているアイテムのインデックス（コントローラー・キーボード操作用） */
  public selectedInventoryIndex = 0;

  /** タイトル画面オーバーレイ要素 */
  private titleScreenEl: HTMLElement;

  /** タイトル画面の「冒険を再開する」ボタン要素 */
  private btnTitleContinueEl: HTMLButtonElement;

  /** スコア履歴モーダル要素 */
  private scoresModalEl: HTMLElement;

  /** スコア履歴一覧コンテナ要素 */
  private scoresListEl: HTMLElement;

  /** 遊び方モーダル要素 */
  private helpModalEl: HTMLElement;

  /** 直前に描画した階層番号（フロア変化の検知用） */
  private lastRenderedFloor = 1;

  /** ゲームオーバー表示ディレイ用タイマーID（倒れ込み演出待機用） */
  private gameOverTimerId: number | null = null;

  /** モバイルティッカー自動消去用タイマーID（約3秒でフェードアウト） */
  private tickerTimerId: number | null = null;

  /** 直前に処理した最新ログID */
  private lastHandledLogId: string | null = null;

  /** モーダルが開かれたタイムスタンプ（スマホタッチ直後の合成クリックによる即時クローズ防止用） */
  private modalOpenTimestamps: Map<string, number> = new Map();

  /** トースト通知消去用タイマーID */
  private toastTimerId: number | null = null;

  /**
   * UIManager のインスタンスを生成し、DOM要素を取得して初回描画を行います。
   *
   * @param engine - 連携先のGameEngineインスタンス
   */
  constructor(engine: GameEngine) {
    this.engine = engine;

    this.floorEl = document.getElementById('hud-floor')!;
    this.levelEl = document.getElementById('hud-level')!;
    this.hpEl = document.getElementById('hud-hp')!;
    this.hpBarEl = document.getElementById('hud-hp-bar');
    this.hungerEl = document.getElementById('hud-hunger')!;
    this.hungerBarEl = document.getElementById('hud-hunger-bar');
    this.statsEl = document.getElementById('hud-stats')!;
    this.goldEl = document.getElementById('hud-gold')!;
    this.thiefIndicatorEl = document.getElementById('hud-thief-indicator')!;
    this.turnEl = document.getElementById('hud-turn')!;
    this.logListEl = document.getElementById('log-list')!;
    this.mobileTickerEl = document.getElementById('mobile-ticker')!;
    this.floorToastEl = document.getElementById('floor-toast')!;
    this.desktopInventoryListEl = document.getElementById('desktop-inventory-list')!;
    this.modalInventoryListEl = document.getElementById('modal-inventory-list')!;
    this.inventoryModalEl = document.getElementById('inventory-modal')!;
    this.gameOverModalEl = document.getElementById('gameover-modal')!;
    this.gameOverStatsEl = document.getElementById('gameover-stats')!;
    this.gameoverCauseEl = document.getElementById('gameover-cause');
    this.inventoryCapacityEl = document.getElementById('inventory-capacity')!;

    this.titleScreenEl = document.getElementById('title-screen')!;
    this.btnTitleContinueEl = document.getElementById(
      'btn-title-continue'
    ) as HTMLButtonElement;
    this.scoresModalEl = document.getElementById('scores-modal')!;
    this.scoresListEl = document.getElementById('scores-list')!;
    this.helpModalEl = document.getElementById('help-modal')!;

    this.bindModalEvents();
    this.update();
  }

  /**
   * モーダル開閉等のUIイベントをバインドします。
   */
  private bindModalEvents(): void {
    // 持ち物ボタン（上部HUD & モバイル操作パネル）
    document.getElementById('btn-inventory-top')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInventoryModal();
    });
    document.getElementById('btn-inventory')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInventoryModal();
    });

    // 持ち物モーダル閉じるボタン
    document.getElementById('btn-close-inventory')?.addEventListener('click', () => {
      this.closeInventoryModal();
    });

    // 持ち物整理ボタン（モーダル内 ＆ デスクトップサイドバー）
    document.getElementById('btn-sort-inventory')?.addEventListener('click', () => {
      this.engine.sortInventory();
    });
    document.getElementById('btn-desktop-sort')?.addEventListener('click', () => {
      this.engine.sortInventory();
    });

    // モーダル背景クリックで閉じる（タッチ直後の合成クリックによる誤クローズをガード）
    this.inventoryModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('inventory-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.inventoryModalEl) {
        this.closeInventoryModal();
      }
    });

    // ゲームオーバーのやり直すボタン
    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.cancelGameOverTimer();
      this.gameOverModalEl.classList.add('hidden');
      StorageManager.saveCurrentScreen('playing');
      this.engine.executeAction({ type: 'RESTART' });
    });

    // タイトル画面: 冒険を再開する
    this.btnTitleContinueEl?.addEventListener('click', async () => {
      this.cancelGameOverTimer();
      const ok = await this.engine.resumeSavedGame();
      if (ok) {
        this.hideTitleScreen();
      }
    });

    // タイトル画面: 新しく冒険を始める
    document.getElementById('btn-title-new')?.addEventListener('click', () => {
      this.cancelGameOverTimer();
      this.engine.startNewGame();
      this.hideTitleScreen();
    });

    // タイトル画面: 冒険の記録（スコア履歴）
    document.getElementById('btn-title-scores')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showScoresModal();
    });

    // タイトル画面: 遊び方・操作説明
    document.getElementById('btn-title-help')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showHelpModal();
    });

    // HUD: タイトルへ戻るボタン
    document.getElementById('btn-to-title')?.addEventListener('click', () => {
      this.cancelGameOverTimer();
      this.showTitleScreen();
    });

    // ゲームオーバー画面: 記録を見る
    document.getElementById('btn-gameover-scores')?.addEventListener('click', () => {
      this.showScoresModal();
    });

    // ゲームオーバー画面: タイトル画面へ
    document.getElementById('btn-gameover-title')?.addEventListener('click', () => {
      this.cancelGameOverTimer();
      this.gameOverModalEl.classList.add('hidden');
      this.showTitleScreen();
    });

    // スコア履歴モーダル閉じる
    document.getElementById('btn-close-scores')?.addEventListener('click', () => {
      this.hideScoresModal();
    });
    this.scoresModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('scores-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.scoresModalEl) {
        this.hideScoresModal();
      }
    });

    // ヘルプモーダル閉じる
    document.getElementById('btn-close-help')?.addEventListener('click', () => {
      this.hideHelpModal();
    });
    this.helpModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('help-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.helpModalEl) {
        this.hideHelpModal();
      }
    });
  }

  /**
   * インベントリモーダルが開いているかどうかを判定します。
   */
  public isInventoryOpen(): boolean {
    return !this.inventoryModalEl.classList.contains('hidden');
  }

  /**
   * いずれかのモーダル（インベントリ、ゲームオーバー、スコア、ヘルプ）が開いているかを判定します。
   */
  public isAnyModalOpen(): boolean {
    return (
      this.isInventoryOpen() ||
      !this.gameOverModalEl.classList.contains('hidden') ||
      !this.scoresModalEl.classList.contains('hidden') ||
      !this.helpModalEl.classList.contains('hidden')
    );
  }

  /**
   * インベントリモーダルを開きます。
   * 下部コントローラーをインベントリ操作モード（使う/閉じる/整理）へ切り替えます。
   */
  public openInventoryModal(): void {
    this.modalOpenTimestamps.set('inventory-modal', Date.now());
    this.inventoryModalEl.classList.remove('hidden');

    const invLen = this.engine.player.inventory.length;
    if (this.selectedInventoryIndex >= invLen) {
      this.selectedInventoryIndex = Math.max(0, invLen - 1);
    }

    this.updateGamepadLabels(true);
    this.highlightSelectedInventoryItem();
  }

  /**
   * インベントリモーダルを開閉トグルします。
   */
  public toggleInventoryModal(): void {
    if (this.inventoryModalEl.classList.contains('hidden')) {
      this.openInventoryModal();
    } else {
      this.closeInventoryModal();
    }
  }

  /**
   * インベントリモーダルを閉じ、コントローラーをダンジョン操作モードへ復帰します。
   */
  public closeInventoryModal(): void {
    this.inventoryModalEl.classList.add('hidden');
    this.updateGamepadLabels(false);
  }

  /**
   * 画面下部コントローラーのボタンサブラベルを、所持品操作モードか通常モードかに応じて切り替えます。
   */
  public updateGamepadLabels(isInventoryMode: boolean): void {
    const controlsEl = document.getElementById('mobile-controls');
    if (controlsEl) {
      if (isInventoryMode) {
        controlsEl.classList.add('inventory-mode');
      } else {
        controlsEl.classList.remove('inventory-mode');
      }
    }

    const btnA = document.getElementById('btn-pad-a');
    const btnB = document.getElementById('btn-pad-b');
    const btnX = document.getElementById('btn-pad-x');
    const btnY = document.getElementById('btn-pad-y');

    const subA = btnA?.querySelector('.btn-sub');
    const subB = btnB?.querySelector('.btn-sub');
    const subX = btnX?.querySelector('.btn-sub');
    const subY = btnY?.querySelector('.btn-sub');

    const player = this.engine.player;
    const map = this.engine.map;

    if (isInventoryMode) {
      if (subA) subA.textContent = '使う';
      if (subB) subB.textContent = '閉じる';
      if (subX) subX.textContent = '投げる';
      if (subY) subY.textContent = '整理';

      btnA?.classList.remove('btn-pickup');
      btnB?.classList.remove('btn-disabled');
      btnY?.classList.remove('btn-disabled');
    } else {
      // 1. Aボタン: 足元アイテム判定（アイテムの上に乗った際は「拾う」と表示＆ゴールド強調）
      const hasGroundItem = map?.items?.some(
        (it) => it.x === player.x && it.y === player.y
      );
      if (subA) {
        subA.textContent = hasGroundItem ? '拾う' : '攻撃';
      }
      if (btnA) {
        if (hasGroundItem) {
          btnA.classList.add('btn-pickup');
          btnA.setAttribute('title', '足元の道具を拾う (Z/Enter/G)');
        } else {
          btnA.classList.remove('btn-pickup');
          btnA.setAttribute('title', '攻撃/調べる/決定 (Z/Enter)');
        }
      }

      // 2. Bボタン: 矢を装備して初めてカラフル（未装備はグレーアウト非活性）
      const equippedArrow = player.equippedArrow;
      if (equippedArrow) {
        btnB?.classList.remove('btn-disabled');
        const countStr = equippedArrow.count !== undefined ? `(${equippedArrow.count})` : '';
        if (subB) subB.textContent = `撃つ${countStr}`;
        btnB?.setAttribute('title', `${equippedArrow.name}を撃つ (F/Space)`);
      } else {
        btnB?.classList.add('btn-disabled');
        if (subB) subB.textContent = '撃つ';
        btnB?.setAttribute('title', '矢未装備 (所持品一覧から矢を装備してください)');
      }

      // 3. Yボタン: 杖を装備して初めてカラフル（未装備はグレーアウト非活性）
      const equippedStaff = player.equippedStaff;
      if (equippedStaff) {
        btnY?.classList.remove('btn-disabled');
        const chargeStr = equippedStaff.charges !== undefined ? `[${equippedStaff.charges}]` : '';
        if (subY) subY.textContent = `振る${chargeStr}`;
        btnY?.setAttribute('title', `${equippedStaff.name}を振る (T/V)`);
      } else {
        btnY?.classList.add('btn-disabled');
        if (subY) subY.textContent = '振る';
        btnY?.setAttribute('title', '杖未装備 (所持品一覧から杖を装備してください)');
      }

      // 4. Xボタン: 持ち物メニュー
      if (subX) subX.textContent = '持物';
    }
  }

  /**
   * コントローラーの十字キー操作等でインベントリのカーソルを上下移動します。
   *
   * @param delta - 移動方向（-1: 上、1: 下）
   */
  public moveInventorySelection(delta: number): void {
    const items = this.engine.player.inventory;
    if (items.length === 0) return;
    this.selectedInventoryIndex =
      (this.selectedInventoryIndex + delta + items.length) % items.length;
    this.highlightSelectedInventoryItem();
  }

  /**
   * 選択中のアイテムカードにハイライトを付与し、自動スクロール追従します。
   */
  public highlightSelectedInventoryItem(): void {
    const cards = this.modalInventoryListEl.querySelectorAll<HTMLElement>(
      '.inventory-item-card'
    );
    cards.forEach((card, idx) => {
      if (idx === this.selectedInventoryIndex) {
        card.classList.add('selected');
        card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        card.classList.remove('selected');
      }
    });
  }

  /**
   * 現在選択中のアイテムを使用（消費・装備・外す・撃つ・振る）します。
   * 武器・防具・腕輪の着脱時はインベントリを開いたまま維持し、
   * 薬草・食料・巻物・飛び道具・杖等の消費アクション時は結果メッセージを見せるため自動で閉じます。
   */
  public useSelectedInventoryItem(): void {
    const items = this.engine.player.inventory;
    if (items.length === 0) return;
    const item = items[this.selectedInventoryIndex];
    if (!item) return;

    const isEquipment =
      item.category === 'WEAPON' ||
      item.category === 'SHIELD' ||
      item.category === 'TALISMAN' ||
      item.category === 'ARROW' ||
      item.category === 'STAFF';

    this.engine.executeAction({ type: 'USE_ITEM', itemId: item.id });

    // 装備品以外の消費アイテム使用時は結果メッセージを見るためにインベントリを閉じる
    if (!isEquipment) {
      this.closeInventoryModal();
      return;
    }

    const nextLen = this.engine.player.inventory.length;
    if (this.selectedInventoryIndex >= nextLen) {
      this.selectedInventoryIndex = Math.max(0, nextLen - 1);
    }
    this.highlightSelectedInventoryItem();
  }

  /**
   * 現在選択中のアイテムを向いている方向に投げます。
   * 投擲演出と命中メッセージを見せるためにインベントリを閉じます。
   */
  public throwSelectedInventoryItem(): void {
    const items = this.engine.player.inventory;
    if (items.length === 0) return;
    const item = items[this.selectedInventoryIndex];
    if (!item) return;

    this.engine.throwItem(item.id);
    this.closeInventoryModal();
  }

  /**
   * 現在選択中のアイテムを足元に置きます。
   */
  public dropSelectedInventoryItem(): void {
    const items = this.engine.player.inventory;
    if (items.length === 0) return;
    const item = items[this.selectedInventoryIndex];
    if (!item) return;

    this.engine.executeAction({ type: 'DROP_ITEM', itemId: item.id });

    const nextLen = this.engine.player.inventory.length;
    if (this.selectedInventoryIndex >= nextLen) {
      this.selectedInventoryIndex = Math.max(0, nextLen - 1);
    }
    this.highlightSelectedInventoryItem();
  }

  /**
   * コントローラーのYボタン等から所持品の整理整頓を実行します。
   */
  public sortInventoryFromUI(): void {
    this.engine.sortInventory();
    this.highlightSelectedInventoryItem();
  }

  /**
   * ゲームエンジンの最新状態をDOMに反映します。
   */
  public update(): void {
    const player = this.engine.player;

    // 1. HUDステータスバーのテキスト更新
    const biomeText = this.engine.map.biomeName
      ? ` (${this.engine.map.biomeName})`
      : '';
    this.floorEl.textContent = `B${player.floor}F${biomeText}`;
    this.levelEl.textContent = `${player.level}`;
    this.hpEl.textContent = `${player.hp}/${player.maxHp}`;
    this.hungerEl.textContent = `${player.hunger}%`;
    this.statsEl.textContent = `${player.atk}/${player.def}`;
    if (this.goldEl) {
      this.goldEl.textContent = `${player.gold ?? 0}G`;
    }
    if (this.thiefIndicatorEl) {
      if (this.engine.map.isThiefMode) {
        this.thiefIndicatorEl.classList.remove('hidden');
      } else {
        this.thiefIndicatorEl.classList.add('hidden');
      }
    }
    this.turnEl.textContent = `${player.turn}`;

    // 2. HP危険度に応じたカラーハイライト切り替え & 棒グラフゲージの更新
    const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
    if (this.hpBarEl) {
      this.hpBarEl.style.width = `${hpRatio * 100}%`;
      if (hpRatio <= 0.25) {
        this.hpBarEl.className = 'hud-bar-fill hud-hp-fill danger';
      } else if (hpRatio <= 0.5) {
        this.hpBarEl.className = 'hud-bar-fill hud-hp-fill warning';
      } else {
        this.hpBarEl.className = 'hud-bar-fill hud-hp-fill';
      }
    }

    if (player.hp <= player.maxHp * 0.25) {
      this.hpEl.className = 'hud-val text-red-500 font-bold';
    } else if (player.hp <= player.maxHp * 0.5) {
      this.hpEl.className = 'hud-val text-yellow-400 font-semibold';
    } else {
      this.hpEl.className = 'hud-val text-emerald-400';
    }

    // 満腹度ゲージバーの更新
    if (this.hungerBarEl) {
      const hungerRatio = Math.max(0, Math.min(1, player.hunger / player.maxHunger));
      this.hungerBarEl.style.width = `${hungerRatio * 100}%`;
      if (hungerRatio <= 0.2) {
        this.hungerBarEl.className = 'hud-bar-fill hud-hunger-fill danger';
      } else {
        this.hungerBarEl.className = 'hud-bar-fill hud-hunger-fill';
      }
    }

    // 3. インベントリのレンダリング
    this.inventoryCapacityEl.textContent = `${player.inventory.length}/12`;
    this.renderInventoryList(this.desktopInventoryListEl);
    this.renderInventoryList(this.modalInventoryListEl);

    // 4. デスクトップ用行動ログのレンダリング
    this.logListEl.innerHTML = '';
    for (const log of this.engine.logs) {
      const entryEl = document.createElement('div');
      entryEl.className = `log-entry ${log.type || 'normal'}`;
      entryEl.textContent = `[T${log.turn}] ${log.text}`;
      this.logListEl.appendChild(entryEl);
    }

    // 5. 画面上部ティッカーの更新（最新ログと種別カラーを反映、約3.2秒後に自動フェードアウト）
    if (this.engine.logs.length > 0) {
      const latestLog = this.engine.logs[0];
      if (latestLog.id !== this.lastHandledLogId) {
        this.lastHandledLogId = latestLog.id;
        this.mobileTickerEl.textContent = latestLog.text;
        this.mobileTickerEl.className = `mobile-ticker log-type-${latestLog.type || 'normal'}`;

        if (this.tickerTimerId !== null) {
          window.clearTimeout(this.tickerTimerId);
        }

        this.tickerTimerId = window.setTimeout(() => {
          this.mobileTickerEl.classList.add('ticker-hidden');
          this.tickerTimerId = null;
        }, 3200);
      }
    }

    // 6. 新フロア到達時のトーストポップアップ演出
    if (player.floor !== this.lastRenderedFloor) {
      const biomeName = this.engine.map.biomeName || '石の迷宮';
      this.showFloorToast(`B${player.floor}F 【${biomeName}】 に到達`);
      this.lastRenderedFloor = player.floor;
    }

    // 7. ゲームオーバー表示（倒れ込み演出をしっかり見せるため、約1.8秒ディレイ後に表示）
    if (!player.isAlive) {
      if (
        this.gameOverTimerId === null &&
        this.gameOverModalEl.classList.contains('hidden')
      ) {
        this.gameOverTimerId = window.setTimeout(() => {
          this.showGameOverModal();
          this.gameOverTimerId = null;
        }, 1800);
      }
    } else {
      this.cancelGameOverTimer();
      this.gameOverModalEl.classList.add('hidden');
    }

    // 8. コントローラーボタン表示（A: 攻撃/拾う、B/Y: 装備状態に応じたカラフル/グレーアウト）を常時同期
    this.updateGamepadLabels(this.isInventoryOpen());
  }

  /**
   * 待機中のゲームオーバー表示タイマーを破棄します。
   */
  private cancelGameOverTimer(): void {
    if (this.gameOverTimerId !== null) {
      window.clearTimeout(this.gameOverTimerId);
      this.gameOverTimerId = null;
    }
  }

  /**
   * インベントリの各アイテムカードをレンダリングします。
   *
   * @param container - アイテムカードを配置するコンテナ要素
   */
  private renderInventoryList(container: HTMLElement): void {
    container.innerHTML = '';
    const player = this.engine.player;

    if (player.inventory.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'text-xs text-gray-500 p-2 text-center';
      emptyEl.textContent = '持ち物は空です。';
      container.appendChild(emptyEl);
      return;
    }

    for (const item of player.inventory) {
      const isEquipped =
        player.equippedWeapon?.id === item.id ||
        player.equippedShield?.id === item.id ||
        player.equippedTalisman?.id === item.id ||
        player.equippedArrow?.id === item.id ||
        player.equippedStaff?.id === item.id;

      const card = document.createElement('div');
      card.className = `inventory-item-card ${isEquipped ? 'equipped' : ''}`;

      // アイテムグラフィックアイコン
      const icon = document.createElement('div');
      icon.className = 'item-icon flex items-center justify-center';
      const spriteId = SVGSprites.getItemSpriteId(item.category, item.name);
      const spriteImg = SVGSprites.get(spriteId);
      if (spriteImg) {
        const img = document.createElement('img');
        img.src = spriteImg.src;
        img.alt = item.name;
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.display = 'block';
        icon.appendChild(img);
      } else {
        icon.style.color = item.color;
        icon.textContent = item.symbol;
      }

      // アイテム名・装備タグ・残数・強化値
      const nameRow = document.createElement('div');
      nameRow.className = 'item-name-row';

      const name = document.createElement('span');
      name.className = 'item-name';
      let displayName = item.name;
      if (item.upgradeLevel && item.upgradeLevel > 0) {
        displayName += `+${item.upgradeLevel}`;
      }
      if (item.category === 'ARROW' && item.count !== undefined) {
        displayName += ` [${item.count}]`;
      } else if (item.category === 'STAFF' && item.charges !== undefined) {
        displayName += ` [${item.charges}]`;
      }
      name.textContent = displayName;
      nameRow.appendChild(name);

      if (item.isShopItem) {
        const shopTag = document.createElement('span');
        shopTag.className = 'shop-item-tag';
        shopTag.textContent = `商品:${item.price ?? item.value}G`;
        nameRow.appendChild(shopTag);
      } else if (isEquipped) {
        const tag = document.createElement('span');
        tag.className = 'equipped-tag';
        tag.textContent = 'E';
        nameRow.appendChild(tag);
      }

      // 操作ボタン群
      const actions = document.createElement('div');
      actions.className = 'item-actions';

      // 装備/外す/使うボタン（武器・防具・腕輪・矢・杖はインベントリを開いたまま装備着脱）
      const useBtn = document.createElement('button');
      useBtn.className = 'item-btn use-btn';
      if (
        item.category === 'WEAPON' ||
        item.category === 'SHIELD' ||
        item.category === 'TALISMAN' ||
        item.category === 'ARROW' ||
        item.category === 'STAFF'
      ) {
        useBtn.textContent = isEquipped ? '外す' : '装備';
        useBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.executeAction({ type: 'USE_ITEM', itemId: item.id });
          // 装備品の着脱時はインベントリを開いたまま維持
        });
      } else {
        useBtn.textContent = '使う';
        useBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.engine.executeAction({ type: 'USE_ITEM', itemId: item.id });
          this.closeInventoryModal();
        });
      }

      // 投げるボタン
      const throwBtn = document.createElement('button');
      throwBtn.className = 'item-btn throw-btn';
      throwBtn.textContent = '投げる';
      throwBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.throwItem(item.id);
        this.closeInventoryModal();
      });

      // 置くボタン
      const dropBtn = document.createElement('button');
      dropBtn.className = 'item-btn';
      dropBtn.textContent = '置く';
      dropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.executeAction({ type: 'DROP_ITEM', itemId: item.id });
      });

      actions.appendChild(useBtn);
      actions.appendChild(throwBtn);
      actions.appendChild(dropBtn);

      // 上段: アイコン ＋ アイテム名・装備タグ ＋ 操作ボタン
      const topRow = document.createElement('div');
      topRow.className = 'item-top-row';
      topRow.appendChild(icon);
      topRow.appendChild(nameRow);
      topRow.appendChild(actions);

      // 下段: 詳細説明・性能テキスト（小画面でも全文読めるように独立配置）
      const desc = document.createElement('div');
      desc.className = 'item-desc';
      desc.textContent = item.description;

      // 価格・査定行
      const priceRow = document.createElement('div');
      priceRow.className = 'item-price-row';
      if (item.isShopItem) {
        priceRow.innerHTML = `<span class="price-buy">💰 買値: ${item.price ?? item.value}G (未会計)</span>`;
      } else {
        const sellPrice = item.sellPrice ?? Math.floor((item.value ?? 100) * 0.5);
        priceRow.innerHTML = `<span class="price-sell">🏷️ 売却査定: ${sellPrice}G</span>`;
      }

      card.appendChild(topRow);
      card.appendChild(desc);
      card.appendChild(priceRow);

      if (container === this.modalInventoryListEl) {
        card.addEventListener('pointerdown', () => {
          const idx = player.inventory.indexOf(item);
          if (idx !== -1) {
            this.selectedInventoryIndex = idx;
            this.highlightSelectedInventoryItem();
          }
        });
      }

      container.appendChild(card);
    }

    if (container === this.modalInventoryListEl && this.isInventoryOpen()) {
      this.highlightSelectedInventoryItem();
    }
  }

  /**
   * ゲームオーバーモーダルを表示し、最終スコア・統計を出力します。
   */
  private showGameOverModal(): void {
    const player = this.engine.player;
    const score = GameEngine.calculateScore(
      player.floor,
      player.level,
      player.turn
    );
    const cause = this.engine.lastDefeatCause || '力尽きて倒れてしまった';

    if (this.gameoverCauseEl) {
      this.gameoverCauseEl.textContent = `あなたは${cause}……`;
    }

    this.gameOverStatsEl.innerHTML = `
      <div style="font-size: 15px; margin-bottom: 4px; padding-bottom: 6px; border-bottom: 1px solid #374151;">
        冒険スコア: <strong class="text-amber-400" style="font-size: 18px;">${score.toLocaleString()} 点</strong>
      </div>
      <div>到達階層: <strong class="text-amber-400">B${player.floor}F</strong></div>
      <div>冒険者Lv: <strong class="text-cyan-400">Lv.${player.level}</strong></div>
      <div>生存ターン数: <strong class="text-sky-400">${player.turn} ターン</strong></div>
      <div>最大HP: <strong class="text-emerald-400">${player.maxHp}</strong></div>
      <div>攻撃力 / 防御力: <strong class="text-orange-300">${player.atk} / ${player.def}</strong></div>
    `;
    this.gameOverModalEl.classList.remove('hidden');
  }

  /**
   * タイトル画面を表示し、中断セーブデータの有無を判定して「冒険を再開する」ボタンを活性化します。
   */
  public async showTitleScreen(): Promise<void> {
    this.cancelGameOverTimer();
    StorageManager.saveCurrentScreen('title');
    const hasSave = await StorageManager.hasCurrentRun();
    if (hasSave) {
      this.btnTitleContinueEl.disabled = false;
      this.btnTitleContinueEl.classList.remove('disabled');
    } else {
      this.btnTitleContinueEl.disabled = true;
      this.btnTitleContinueEl.classList.add('disabled');
    }
    this.titleScreenEl.classList.remove('hidden');
  }

  /**
   * タイトル画面を非表示にしてゲーム画面を開始します。
   */
  public hideTitleScreen(): void {
    StorageManager.saveCurrentScreen('playing');
    this.titleScreenEl.classList.add('hidden');
  }

  /**
   * スコア履歴モーダルを表示し、IndexedDBから過去の戦歴を取得してレンダリングします。
   */
  public async showScoresModal(): Promise<void> {
    this.modalOpenTimestamps.set('scores-modal', Date.now());
    const scores = await StorageManager.loadHighscores();
    this.renderHighscoresList(scores);
    this.scoresModalEl.classList.remove('hidden');
  }

  /**
   * スコア履歴モーダルを非表示にします。
   */
  public hideScoresModal(): void {
    this.scoresModalEl.classList.add('hidden');
  }

  /**
   * 遊び方・操作説明モーダルを表示します。
   */
  public showHelpModal(): void {
    this.modalOpenTimestamps.set('help-modal', Date.now());
    this.helpModalEl.classList.remove('hidden');
  }

  /**
   * 遊び方・操作説明モーダルを非表示にします。
   */
  public hideHelpModal(): void {
    this.helpModalEl.classList.add('hidden');
  }

  /**
   * 取得したハイスコアリストをDOMカード要素として生成・レンダリングします。
   *
   * @param list - ソート済みの戦歴配列
   */
  private renderHighscoresList(list: RunStats[]): void {
    this.scoresListEl.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'score-empty-state';
      empty.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 8px;">📜</div>
        <div>まだ冒険の記録がありません。</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">迷宮に挑んで新たな記録を刻みましょう！</div>
      `;
      this.scoresListEl.appendChild(empty);
      return;
    }

    list.forEach((entry, index) => {
      const rank = index + 1;
      const card = document.createElement('div');
      card.className = 'score-card';

      let rankClass = '';
      let rankText = `#${rank}`;
      if (rank === 1) {
        rankClass = 'score-rank-1';
        rankText = '🥇 1位';
      } else if (rank === 2) {
        rankClass = 'score-rank-2';
        rankText = '🥈 2位';
      } else if (rank === 3) {
        rankClass = 'score-rank-3';
        rankText = '🥉 3位';
      }

      const dateStr = new Date(entry.timestamp).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      card.innerHTML = `
        <div class="score-card-header">
          <span class="score-rank-badge ${rankClass}">${rankText}</span>
          <span class="score-value">${entry.score.toLocaleString()} PTS</span>
        </div>
        <div class="score-stats-grid">
          <div class="score-stat-cell">
            <span class="score-stat-label">到達フロア</span>
            <span class="score-stat-val text-amber-400">B${entry.floor}F</span>
          </div>
          <div class="score-stat-cell">
            <span class="score-stat-label">冒険者LV</span>
            <span class="score-stat-val text-cyan-400">Lv.${entry.level}</span>
          </div>
          <div class="score-stat-cell">
            <span class="score-stat-label">生存ターン</span>
            <span class="score-stat-val text-sky-400">${entry.turn} ターン</span>
          </div>
        </div>
        <div class="score-footer-row">
          <span class="score-cause">結末: ${entry.causeOfDeath || '冒険終了'}</span>
          <span>${dateStr}</span>
        </div>
      `;

      this.scoresListEl.appendChild(card);
    });
  }

  /**
   * 画面中央上部に一時的なトースト通知メッセージを表示します。
   * ゲーム再開時や新階層到達時に呼び出されます。
   *
   * @param text - 表示する通知メッセージ本文
   * @param durationMs - 表示時間（ミリ秒、デフォルト 2400ms）
   */
  public showToast(text: string, durationMs = 2400): void {
    if (this.toastTimerId !== null) {
      window.clearTimeout(this.toastTimerId);
      this.toastTimerId = null;
    }

    this.floorToastEl.textContent = text;
    this.floorToastEl.classList.remove('hidden');

    this.toastTimerId = window.setTimeout(() => {
      this.floorToastEl.classList.add('hidden');
      this.toastTimerId = null;
    }, durationMs);
  }

  /**
   * 新フロア到達時のトースト通知を表示します。
   *
   * @param text - 表示する通知メッセージ本文
   */
  private showFloorToast(text: string): void {
    this.showToast(text, 2200);
  }
}
