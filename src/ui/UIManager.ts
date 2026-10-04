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
   * インベントリモーダルを開きます。
   */
  public openInventoryModal(): void {
    this.modalOpenTimestamps.set('inventory-modal', Date.now());
    this.inventoryModalEl.classList.remove('hidden');
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
   * インベントリモーダルを閉じます。
   */
  public closeInventoryModal(): void {
    this.inventoryModalEl.classList.add('hidden');
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
        player.equippedShield?.id === item.id;

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

      // アイテム名・装備タグ
      const nameRow = document.createElement('div');
      nameRow.className = 'item-name-row';

      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = item.name;
      nameRow.appendChild(name);

      if (isEquipped) {
        const tag = document.createElement('span');
        tag.className = 'equipped-tag';
        tag.textContent = 'E';
        nameRow.appendChild(tag);
      }

      // 操作ボタン群
      const actions = document.createElement('div');
      actions.className = 'item-actions';

      // 使う/装備ボタン
      const useBtn = document.createElement('button');
      useBtn.className = 'item-btn use-btn';
      useBtn.textContent =
        item.category === 'WEAPON' || item.category === 'SHIELD'
          ? isEquipped
            ? '外す'
            : '装備'
          : '使う';

      useBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.engine.executeAction({ type: 'USE_ITEM', itemId: item.id });
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

      card.appendChild(topRow);
      card.appendChild(desc);

      container.appendChild(card);
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
   *
   * @param text - 表示する通知メッセージ本文
   */
  private showFloorToast(text: string): void {
    this.floorToastEl.textContent = text;
    this.floorToastEl.classList.remove('hidden');

    setTimeout(() => {
      this.floorToastEl.classList.add('hidden');
    }, 2200);
  }
}
