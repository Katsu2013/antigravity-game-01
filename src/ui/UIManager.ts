/**
 * @file UIManager.ts
 * @description HTML/DOM上のUI要素（HUDステータス表示、行動ログリスト、インベントリ表示、
 * 各種モーダルダイアログ、階層トースト通知）の更新および演出を統括するUI管理クラス。
 */

import { GameEngine } from '../core/GameEngine';
import { GameSettings, GameSpeed, Item, Monster } from '../core/types';
import { NpcSystem } from '../core/systems/NpcSystem';
import { SynthesisSystem } from '../core/systems/SynthesisSystem';
import { SVGSprites } from '../render/sprites/SVGSprites';
import { RunStats, StorageManager } from '../storage/StorageManager';
import { SoundSystem } from '../audio/SoundSystem';
import {
  COMPENDIUM_ITEM_LIST,
  COMPENDIUM_MONSTER_LIST,
} from '../core/compendiumData';


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

  /** レアNPC対話モーダル要素 */
  private npcModalEl: HTMLElement;

  /** NPC名タイトル要素 */
  private npcTitleEl: HTMLElement;

  /** NPCセリフ表示要素 */
  private npcMsgEl: HTMLElement;

  /** NPCアクションコンテナ要素 */
  private npcActionEl: HTMLElement;

  /** 合成モーダル要素 */
  private synthesisModalEl: HTMLElement;
  /** 合成の壺名称表示要素 */
  private synthesisPotNameEl: HTMLElement;
  /** 合成の壺残り容量表示要素 */
  private synthesisPotCapacityEl: HTMLElement;
  /** 合成ベース装備選択リストコンテナ要素 */
  private synthesisBaseListEl: HTMLElement;
  /** 合成素材装備選択リストコンテナ要素 */
  private synthesisMaterialListEl: HTMLElement;
  /** 合成プレビュー表示ボックス要素 */
  private synthesisPreviewBoxEl: HTMLElement;
  /** 合成プレビュー内容テキスト要素 */
  private synthesisPreviewContentEl: HTMLElement;
  /** 合成実行ボタン要素 */
  private btnExecuteSynthesisEl: HTMLButtonElement;

  /**
   * 現在合成錬成モーダルで操作対象となっている合成の壺アイテム。
   * - 想定値: Item インスタンスまたは未選択時 `null`
   * - 初期値: `null`
   */
  private activeSynthesisPot: Item | null = null;

  /**
   * 合成のベース（強化先）として選択されているアイテムのID。
   * - 想定値: string または未選択時 `null`
   * - 初期値: `null`
   */
  private selectedBaseItemId: string | null = null;

  /**
   * 合成の素材（消費消滅側）として選択されているアイテムのID。
   * - 想定値: string または未選択時 `null`
   * - 初期値: `null`
   */
  private selectedMaterialItemId: string | null = null;

  /** ストーリーモノローグモーダル要素 */
  private storyModalEl: HTMLElement;
  /** ストーリーモノローグ章タイトル要素 */
  private storyTitleEl: HTMLElement;
  /** ストーリーモノローグ本文要素 */
  private storyTextEl: HTMLElement;

  /** ゲームクリアモーダル要素 */
  private gameClearModalEl: HTMLElement;
  /** ゲームクリアスコア・戦績表示要素 */
  private gameClearStatsEl: HTMLElement;

  /**
   * 直前に描画した階層番号（フロア変化・新フロア到達トースト演出の検知用）。
   * - 想定値: 1以上の正の整数
   * - 初期値: 1
   */
  private lastRenderedFloor = 1;

  /**
   * ゲームオーバー表示ディレイ用タイマーID（倒れ込みアニメーションをじっくり見せる約1.8秒の待機）。
   * - 想定値: window.setTimeout ID または `null`
   * - 初期値: `null`
   */
  private gameOverTimerId: number | null = null;

  /**
   * モバイルティッカー自動消去用タイマーID（約4.5秒でフェードアウト）。
   * - 想定値: window.setTimeout ID または `null`
   * - 初期値: `null`
   */
  private tickerTimerId: number | null = null;

  /**
   * 直前に処理・画面反映した最新ログエントリのID（重複演出防止用）。
   * - 想定値: string または未処理時 `null`
   * - 初期値: `null`
   */
  private lastHandledLogId: string | null = null;

  /**
   * モーダルが開かれた瞬間のミリ秒タイムスタンプ（スマホタッチ直後の合成クリックによる誤クローズ防止用マップ）。
   * - 想定値: Map<モーダルID, 開放ミリ秒エポックタイム>
   * - 初期値: 空のMap
   */
  private modalOpenTimestamps: Map<string, number> = new Map();

  /** 図鑑（迷宮博物誌）モーダル要素 */
  private compendiumModalEl: HTMLElement;
  /** 図鑑モンスタータブボタン要素 */
  private compendiumTabMonstersEl: HTMLElement;
  /** 図鑑アイテムタブボタン要素 */
  private compendiumTabItemsEl: HTMLElement;
  /** 図鑑収集率進捗表示要素 */
  private compendiumProgressTextEl: HTMLElement;
  /** 図鑑カードグリッドコンテナ要素 */
  private compendiumGridEl: HTMLElement;

  /**
   * 図鑑モーダルで現在アクティブになっている表示タブ。
   * - 想定値: `'MONSTERS'` または `'ITEMS'`
   * - 初期値: `'MONSTERS'`
   * - 変化契機: ユーザーが図鑑内のタブボタンをクリックした時
   */
  private activeCompendiumTab: 'MONSTERS' | 'ITEMS' = 'MONSTERS';

  /** ゲーム詳細設定モーダル要素 */
  private settingsModalEl: HTMLElement;
  /** BGM音量スライダー要素 */
  private settingBgmSliderEl: HTMLInputElement | null;
  /** BGM音量数値表示要素 */
  private settingBgmValEl: HTMLElement | null;
  /** SE音量スライダー要素 */
  private settingSeSliderEl: HTMLInputElement | null;
  /** SE音量数値表示要素 */
  private settingSeValEl: HTMLElement | null;
  /** ゲーム速度選択ボタン群 */
  private settingSpeedBtns: NodeListOf<HTMLButtonElement>;
  /** 仮想ゲームパッドトグルボタン要素 */
  private settingTogglePadBtn: HTMLButtonElement | null;
  /** ミニマップトグルボタン要素 */
  private settingToggleMinimapBtn: HTMLButtonElement | null;

  /**
   * 現在選択されているゲーム速度設定。
   * - 想定値: `'NORMAL'` | `'FAST'` | `'VERY_FAST'`
   * - 初期値: `'FAST'`
   * - 変化契機: 設定モーダル内で速度ボタンをクリックした時、またはロード時
   */
  private currentSpeedSetting: GameSpeed = 'FAST';

  /**
   * 画面下部仮想ゲームパッドが表示中かどうかのフラグ。
   * - 想定値: `true`（表示）または `false`（非表示）
   * - 初期値: `true`
   * - 変化契機: 設定モーダル内でパッド表示トグルを押した時
   */
  private isVirtualPadVisible = true;

  /**
   * ミニマップが表示中かどうかのフラグ。
   * - 想定値: `true`（表示）または `false`（非表示）
   * - 初期値: `true`
   * - 変化契機: 設定モーダルやHUDマップボタン、ショートカットキーでトグルした時
   */
  private isMinimapVisible = true;

  /**
   * フロア到達トースト通知の自動消去タイマーID。
   * - 想定値: window.setTimeout ID または `null`
   * - 初期値: `null`
   * - 変化契機: 新フロア到達時にsetTimeoutを設定し、タイムアウト時にクリア
   */
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

    this.npcModalEl = document.getElementById('npc-modal')!;
    this.npcTitleEl = document.getElementById('npc-modal-title')!;
    this.npcMsgEl = document.getElementById('npc-modal-message')!;
    this.npcActionEl = document.getElementById('npc-action-container')!;

    this.synthesisModalEl = document.getElementById('synthesis-modal')!;
    this.synthesisPotNameEl = document.getElementById('synthesis-pot-name')!;
    this.synthesisPotCapacityEl = document.getElementById('synthesis-pot-capacity')!;
    this.synthesisBaseListEl = document.getElementById('synthesis-base-list')!;
    this.synthesisMaterialListEl = document.getElementById('synthesis-material-list')!;
    this.synthesisPreviewBoxEl = document.getElementById('synthesis-preview-box')!;
    this.synthesisPreviewContentEl = document.getElementById('synthesis-preview-content')!;
    this.btnExecuteSynthesisEl = document.getElementById('btn-execute-synthesis') as HTMLButtonElement;

    this.storyModalEl = document.getElementById('story-modal')!;
    this.storyTitleEl = document.getElementById('story-modal-title')!;
    this.storyTextEl = document.getElementById('story-modal-text')!;

    this.gameClearModalEl = document.getElementById('gameclear-modal')!;
    this.gameClearStatsEl = document.getElementById('gameclear-stats')!;

    this.compendiumModalEl = document.getElementById('compendium-modal')!;
    this.compendiumTabMonstersEl = document.getElementById('tab-compendium-monsters')!;
    this.compendiumTabItemsEl = document.getElementById('tab-compendium-items')!;
    this.compendiumProgressTextEl = document.getElementById('compendium-progress-text')!;
    this.compendiumGridEl = document.getElementById('compendium-grid')!;

    this.settingsModalEl = document.getElementById('settings-modal')!;
    this.settingBgmSliderEl = document.getElementById('setting-bgm-volume') as HTMLInputElement | null;
    this.settingBgmValEl = document.getElementById('setting-bgm-val');
    this.settingSeSliderEl = document.getElementById('setting-se-volume') as HTMLInputElement | null;
    this.settingSeValEl = document.getElementById('setting-se-val');
    this.settingSpeedBtns = document.querySelectorAll('.settings-speed-buttons .settings-opt-btn');
    this.settingTogglePadBtn = document.getElementById('btn-setting-toggle-pad') as HTMLButtonElement | null;
    this.settingToggleMinimapBtn = document.getElementById('btn-setting-toggle-minimap') as HTMLButtonElement | null;

    this.loadAndApplySettings();

    this.engine.onNpcInteract = (npc) => {
      this.showNpcModal(npc);
    };

    this.engine.onOpenSynthesis = (pot) => {
      this.showSynthesisModal(pot);
    };

    this.engine.onStoryMonologue = (_floor, title, text) => {
      this.showStoryMonologue(title, text);
    };

    this.engine.onGameClear = () => {
      this.showGameClearModal();
    };

    this.bindModalEvents();
    this.update();
  }

  /**
   * モーダル開閉等のUIイベントをバインドします。
   */
  private bindModalEvents(): void {
    // サウンド切替ボタン
    const soundBtn = document.getElementById('btn-sound-toggle') as HTMLButtonElement | null;
    if (soundBtn) {
      const updateSoundBtn = () => {
        const isMuted = SoundSystem.getInstance().isMuted();
        soundBtn.textContent = isMuted ? '🔇 SE: OFF' : '🔊 SE: ON';
        if (isMuted) {
          soundBtn.classList.remove('highlight');
        } else {
          soundBtn.classList.add('highlight');
        }
      };
      updateSoundBtn();
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SoundSystem.getInstance().toggleMute();
        updateSoundBtn();
      });
    }

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

    // レアNPCモーダル閉じる
    document.getElementById('btn-close-npc')?.addEventListener('click', () => {
      this.closeNpcModal();
    });
    document.getElementById('btn-npc-cancel')?.addEventListener('click', () => {
      this.closeNpcModal();
    });
    this.npcModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('npc-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.npcModalEl) {
        this.closeNpcModal();
      }
    });

    // 合成モーダルボタン
    document.getElementById('btn-close-synthesis')?.addEventListener('click', () => {
      this.closeSynthesisModal();
    });
    document.getElementById('btn-cancel-synthesis')?.addEventListener('click', () => {
      this.closeSynthesisModal();
    });
    this.btnExecuteSynthesisEl?.addEventListener('click', () => {
      this.executeSynthesis();
    });
    this.synthesisModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('synthesis-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.synthesisModalEl) {
        this.closeSynthesisModal();
      }
    });

    // ストーリーモノローグボタン
    document.getElementById('btn-close-story')?.addEventListener('click', () => {
      this.closeStoryMonologue();
    });
    this.storyModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('story-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.storyModalEl) {
        this.closeStoryMonologue();
      }
    });

    // ゲームクリアモーダルボタン
    document.getElementById('btn-gameclear-restart')?.addEventListener('click', () => {
      this.closeGameClearModal();
      this.engine.executeAction({ type: 'RESTART' });
    });
    document.getElementById('btn-gameclear-scores')?.addEventListener('click', () => {
      this.showScoresModal();
    });
    document.getElementById('btn-gameclear-title')?.addEventListener('click', () => {
      this.closeGameClearModal();
      this.showTitleScreen();
    });

    // 迷宮博物誌（図鑑）ボタン（HUD & タイトル）
    document.getElementById('btn-compendium')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCompendiumModal();
    });
    document.getElementById('btn-title-compendium')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showCompendiumModal();
    });
    document.getElementById('btn-close-compendium')?.addEventListener('click', () => {
      this.hideCompendiumModal();
    });
    this.compendiumModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('compendium-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.compendiumModalEl) {
        this.hideCompendiumModal();
      }
    });

    // 図鑑タブ切替
    this.compendiumTabMonstersEl?.addEventListener('click', () => {
      this.activeCompendiumTab = 'MONSTERS';
      this.compendiumTabMonstersEl.classList.add('active');
      this.compendiumTabItemsEl.classList.remove('active');
      this.renderCompendium();
    });
    this.compendiumTabItemsEl?.addEventListener('click', () => {
      this.activeCompendiumTab = 'ITEMS';
      this.compendiumTabItemsEl.classList.add('active');
      this.compendiumTabMonstersEl.classList.remove('active');
      this.renderCompendium();
    });

    // ゲーム詳細設定ボタン（HUD & タイトル）
    document.getElementById('btn-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showSettingsModal();
    });
    document.getElementById('btn-title-settings')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showSettingsModal();
    });
    document.getElementById('btn-close-settings')?.addEventListener('click', () => {
      this.hideSettingsModal();
    });
    document.getElementById('btn-settings-save')?.addEventListener('click', () => {
      this.hideSettingsModal();
    });
    this.settingsModalEl.addEventListener('click', (e) => {
      const openedAt = this.modalOpenTimestamps.get('settings-modal') || 0;
      if (Date.now() - openedAt < 350) return;
      if (e.target === this.settingsModalEl) {
        this.hideSettingsModal();
      }
    });

    // 音量スライダー
    this.settingBgmSliderEl?.addEventListener('input', () => {
      const vol = parseInt(this.settingBgmSliderEl?.value ?? '50', 10);
      if (this.settingBgmValEl) this.settingBgmValEl.textContent = `${vol}%`;
      SoundSystem.getInstance().setBgmVolume(vol / 100);
    });
    this.settingSeSliderEl?.addEventListener('input', () => {
      const vol = parseInt(this.settingSeSliderEl?.value ?? '70', 10);
      if (this.settingSeValEl) this.settingSeValEl.textContent = `${vol}%`;
      SoundSystem.getInstance().setSeVolume(vol / 100);
    });

    // 速度ボタン
    this.settingSpeedBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const speed = btn.dataset.speed as GameSpeed;
        if (!speed) return;
        this.currentSpeedSetting = speed;
        this.settingSpeedBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.engine.updateSettings({ gameSpeed: speed });
      });
    });

    // 仮想パッドトグル
    this.settingTogglePadBtn?.addEventListener('click', () => {
      this.isVirtualPadVisible = !this.isVirtualPadVisible;
      this.updateVirtualPadVisibility();
      this.engine.updateSettings({ showVirtualPad: this.isVirtualPadVisible });
    });

    // ミニマップトグル
    this.settingToggleMinimapBtn?.addEventListener('click', () => {
      this.isMinimapVisible = !this.isMinimapVisible;
      this.updateMinimapVisibility();
    });
  }

  /**
   * インベントリモーダルが開いているかどうかを判定します。
   */
  public isInventoryOpen(): boolean {
    return !this.inventoryModalEl.classList.contains('hidden');
  }

  /**
   * いずれかのモーダル（インベントリ、ゲームオーバー、スコア、ヘルプ、NPC対話、合成、ストーリー、クリア、図鑑、設定）が開いているかを判定します。
   */
  public isAnyModalOpen(): boolean {
    return (
      this.isInventoryOpen() ||
      !this.gameOverModalEl.classList.contains('hidden') ||
      !this.scoresModalEl.classList.contains('hidden') ||
      !this.helpModalEl.classList.contains('hidden') ||
      !this.npcModalEl.classList.contains('hidden') ||
      !this.synthesisModalEl.classList.contains('hidden') ||
      !this.storyModalEl.classList.contains('hidden') ||
      !this.gameClearModalEl.classList.contains('hidden') ||
      !this.compendiumModalEl.classList.contains('hidden') ||
      !this.settingsModalEl.classList.contains('hidden')
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
   * レアNPCとの対話モーダルを表示します。
   */
  public showNpcModal(npc: Monster): void {
    const dialogData = NpcSystem.startInteraction(this.engine.player, npc);
    if (!dialogData) return;

    this.modalOpenTimestamps.set('npc-modal', Date.now());
    this.npcTitleEl.textContent = dialogData.title;
    this.npcMsgEl.textContent = dialogData.message;
    this.npcActionEl.innerHTML = '';

    // イベント別アクション領域の構築
    if (dialogData.eventType === 'ADVENTURER_TRADE') {
      if (!dialogData.alreadyDone && dialogData.playerMatchingItems && dialogData.playerMatchingItems.length > 0) {
        const desc = document.createElement('div');
        desc.className = 'text-xs text-sky-300 font-bold mb-1';
        desc.textContent = `渡す【${dialogData.tradeWantCategoryName}】を選択:`;
        this.npcActionEl.appendChild(desc);

        const list = document.createElement('div');
        list.className = 'npc-item-trade-list';

        for (const item of dialogData.playerMatchingItems) {
          const btn = document.createElement('button');
          btn.className = 'npc-trade-item-btn';
          btn.innerHTML = `<span>${item.name}${item.upgradeLevel ? `+${item.upgradeLevel}` : ''}</span><span class="text-xs text-emerald-400 font-bold">渡して交換 ➔</span>`;
          btn.addEventListener('click', () => {
            this.engine.executeAction({
              type: 'NPC_INTERACT',
              monsterId: npc.id,
              action: 'TRADE_ACCEPT',
              tradePlayerItemId: item.id,
            });
            this.closeNpcModal();
          });
          list.appendChild(btn);
        }
        this.npcActionEl.appendChild(list);
      } else if (!dialogData.alreadyDone) {
        const emptyNotice = document.createElement('div');
        emptyNotice.className = 'text-xs text-rose-300 p-2 bg-slate-900 rounded border border-rose-800';
        emptyNotice.textContent = `※ 手持ちに渡せる【${dialogData.tradeWantCategoryName}】がありません。`;
        this.npcActionEl.appendChild(emptyNotice);
      }
    } else if (dialogData.eventType === 'GAMBLER_RPS') {
      const btnGroup = document.createElement('div');
      btnGroup.className = 'npc-action-btn-group';

      const hands: { choice: 'ROCK' | 'SCISSORS' | 'PAPER'; icon: string; name: string }[] = [
        { choice: 'ROCK', icon: '✊', name: 'グー' },
        { choice: 'SCISSORS', icon: '✌', name: 'チョキ' },
        { choice: 'PAPER', icon: '🖐', name: 'パー' },
      ];

      for (const h of hands) {
        const btn = document.createElement('button');
        btn.className = 'npc-choice-btn rps-btn';
        btn.innerHTML = `<span>${h.icon}</span><span>${h.name}</span>`;
        btn.addEventListener('click', () => {
          this.engine.executeAction({
            type: 'NPC_INTERACT',
            monsterId: npc.id,
            action: 'RPS_PLAY',
            rpsChoice: h.choice,
          });
          // 最新のメッセージに更新
          this.npcMsgEl.textContent = this.engine.logs[0]?.text || 'じゃんけん勝負完了！';
        });
        btnGroup.appendChild(btn);
      }
      this.npcActionEl.appendChild(btnGroup);
    } else if (dialogData.eventType === 'BLACKSMITH_FORGE') {
      if (!dialogData.alreadyDone && (dialogData.equippedWeapon || dialogData.equippedShield)) {
        const btnGroup = document.createElement('div');
        btnGroup.className = 'npc-action-btn-group';

        if (dialogData.equippedWeapon) {
          const wBtn = document.createElement('button');
          wBtn.className = 'npc-choice-btn';
          wBtn.innerHTML = `<span>🗡 武器を鍛える</span><span class="text-xs text-amber-300 font-normal">${dialogData.equippedWeapon.name}${dialogData.equippedWeapon.upgradeLevel ? `+${dialogData.equippedWeapon.upgradeLevel}` : ''}</span>`;
          wBtn.addEventListener('click', () => {
            this.engine.executeAction({
              type: 'NPC_INTERACT',
              monsterId: npc.id,
              action: 'FORGE_WEAPON',
            });
            this.closeNpcModal();
          });
          btnGroup.appendChild(wBtn);
        }

        if (dialogData.equippedShield) {
          const sBtn = document.createElement('button');
          sBtn.className = 'npc-choice-btn';
          sBtn.innerHTML = `<span>🛡 盾を鍛える</span><span class="text-xs text-sky-300 font-normal">${dialogData.equippedShield.name}${dialogData.equippedShield.upgradeLevel ? `+${dialogData.equippedShield.upgradeLevel}` : ''}</span>`;
          sBtn.addEventListener('click', () => {
            this.engine.executeAction({
              type: 'NPC_INTERACT',
              monsterId: npc.id,
              action: 'FORGE_SHIELD',
            });
            this.closeNpcModal();
          });
          btnGroup.appendChild(sBtn);
        }

        this.npcActionEl.appendChild(btnGroup);
      }
    } else if (dialogData.eventType === 'FOOD_STALL') {
      const btnGroup = document.createElement('div');
      btnGroup.className = 'npc-action-btn-group flex flex-col gap-2 w-full';

      if (dialogData.alreadyDone) {
        const doneBtn = document.createElement('button');
        doneBtn.className =
          'npc-choice-btn w-full justify-center bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2 rounded border border-amber-600/40';
        doneBtn.textContent = '🙏 ごちそうさまでした！（店を出る）';
        doneBtn.addEventListener('click', () => {
          this.closeNpcModal();
        });
        btnGroup.appendChild(doneBtn);
      } else if (
        dialogData.stallClerk === 'WIFE' &&
        (!dialogData.foodMenuList || dialogData.foodMenuList.length === 0)
      ) {
        // 奥さんに門前払いされている段階
        const begBtn = document.createElement('button');
        begBtn.className =
          'npc-choice-btn w-full justify-between bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold py-2 px-3 rounded border border-amber-600';
        const begText =
          (dialogData.wifeTalkCount ?? 0) === 0
            ? '💬 「お腹が空いて倒れそうです！何か売ってください！」'
            : '💬 「どうか一口だけでも！お願いします…！」';
        begBtn.innerHTML = `<span>${begText}</span><span class="text-xs text-amber-400 font-bold">懇願する ➔</span>`;
        begBtn.addEventListener('click', () => {
          this.engine.executeAction({
            type: 'NPC_INTERACT',
            monsterId: npc.id,
            action: 'TALK_WIFE',
          });
          this.showNpcModal(npc);
        });
        btnGroup.appendChild(begBtn);

        const leaveBtn = document.createElement('button');
        leaveBtn.className =
          'npc-choice-btn w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded border border-slate-600 text-sm';
        leaveBtn.textContent = '🚪 一旦立ち去る';
        leaveBtn.addEventListener('click', () => {
          this.closeNpcModal();
        });
        btnGroup.appendChild(leaveBtn);
      } else if (dialogData.foodMenuList && dialogData.foodMenuList.length > 0) {
        // 注文可能な料理メニュー一覧
        const playerGold = this.engine.player.gold ?? 0;

        for (const menu of dialogData.foodMenuList) {
          const canAfford = playerGold >= menu.price;
          const menuBtn = document.createElement('button');
          menuBtn.className = `npc-choice-btn w-full flex flex-col items-start p-2.5 rounded border transition-all text-left ${
            canAfford
              ? 'bg-slate-800/90 hover:bg-amber-950/70 border-amber-500/60 cursor-pointer shadow-md'
              : 'bg-slate-900/60 border-slate-700 opacity-60 cursor-not-allowed'
          }`;

          menuBtn.innerHTML = `
            <div class="flex items-center justify-between w-full">
              <span class="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                <span class="text-base">${menu.icon}</span> ${menu.name}
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded ${
                canAfford
                  ? 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
                  : 'bg-red-950/80 text-red-400 border border-red-800'
              }">
                ${menu.price} G
              </span>
            </div>
            <div class="text-xs text-slate-300 mt-1 leading-relaxed">
              ${menu.description}
            </div>
          `;

          if (canAfford) {
            menuBtn.addEventListener('click', () => {
              this.engine.executeAction({
                type: 'NPC_INTERACT',
                monsterId: npc.id,
                action: 'ORDER_FOOD',
                foodMenuId: menu.id,
              });
              this.showNpcModal(npc);
            });
          }
          btnGroup.appendChild(menuBtn);
        }

        const cancelBtn = document.createElement('button');
        cancelBtn.className =
          'npc-choice-btn w-full justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 rounded border border-slate-600 text-sm mt-1';
        cancelBtn.textContent = 'また今度にする';
        cancelBtn.addEventListener('click', () => {
          this.closeNpcModal();
        });
        btnGroup.appendChild(cancelBtn);
      }

      this.npcActionEl.appendChild(btnGroup);
    }

    this.npcModalEl.classList.remove('hidden');
  }

  /**
   * レアNPCとの対話モーダルを閉じます。
   */
  public closeNpcModal(): void {
    this.npcModalEl.classList.add('hidden');
  }

  /**
   * 合成の壺モーダルを開きます。
   */
  public showSynthesisModal(pot: Item): void {
    this.activeSynthesisPot = pot;
    this.selectedBaseItemId = null;
    this.selectedMaterialItemId = null;
    this.modalOpenTimestamps.set('synthesis-modal', Date.now());

    this.synthesisPotNameEl.textContent = pot.name;
    this.synthesisPotCapacityEl.textContent = `残り容量: [${pot.potCapacity ?? 0}]`;

    // インベントリモーダルが開いていれば閉じる
    this.closeInventoryModal();

    this.renderSynthesisLists();
    this.updateSynthesisPreview();
    this.synthesisModalEl.classList.remove('hidden');
  }

  /**
   * 合成モーダル内のベース武具候補および素材武具候補一覧を描画します。
   */
  public renderSynthesisLists(): void {
    if (!this.activeSynthesisPot) return;

    this.synthesisBaseListEl.innerHTML = '';
    this.synthesisMaterialListEl.innerHTML = '';

    // 合成対象は WEAPON または SHIELD（壺自体は除く）
    const validEquipments = this.engine.player.inventory.filter(
      (it) => it.id !== this.activeSynthesisPot!.id && (it.category === 'WEAPON' || it.category === 'SHIELD')
    );

    if (validEquipments.length === 0) {
      this.synthesisBaseListEl.innerHTML = '<div class="text-xs text-gray-400 p-2">※ 合成可能な武具がありません</div>';
      this.synthesisMaterialListEl.innerHTML = '<div class="text-xs text-gray-400 p-2">※ 合成可能な武具がありません</div>';
      return;
    }

    // ① ベース候補リスト
    for (const item of validEquipments) {
      const isSelected = item.id === this.selectedBaseItemId;
      const btn = document.createElement('button');
      btn.className = `synthesis-select-btn ${isSelected ? 'selected' : ''}`;
      const decName = SynthesisSystem.getDecoratedName(item);
      const isEquipped =
        this.engine.player.equippedWeapon?.id === item.id ||
        this.engine.player.equippedShield?.id === item.id;
      btn.innerHTML = `<span>${isEquipped ? '★ ' : ''}${decName}</span><span class="text-xs text-gray-400">${item.category === 'WEAPON' ? '武器' : '盾'}</span>`;
      btn.addEventListener('click', () => {
        this.selectedBaseItemId = item.id;
        if (this.selectedMaterialItemId === item.id) {
          this.selectedMaterialItemId = null;
        }
        this.renderSynthesisLists();
        this.updateSynthesisPreview();
      });
      this.synthesisBaseListEl.appendChild(btn);
    }

    // ② 素材候補リスト（ベースと同カテゴリの別武具）
    const baseItem = validEquipments.find((it) => it.id === this.selectedBaseItemId);
    const materialCandidates = validEquipments.filter(
      (it) => it.id !== this.selectedBaseItemId && (!baseItem || it.category === baseItem.category)
    );

    if (materialCandidates.length === 0) {
      this.synthesisMaterialListEl.innerHTML = `<div class="text-xs text-gray-400 p-2">${baseItem ? '※ 同種の素材武具がありません' : '※ まずベース武具を選択してください'}</div>`;
    } else {
      for (const item of materialCandidates) {
        const isSelected = item.id === this.selectedMaterialItemId;
        const btn = document.createElement('button');
        btn.className = `synthesis-select-btn ${isSelected ? 'selected' : ''}`;
        const decName = SynthesisSystem.getDecoratedName(item);
        const isEquipped =
          this.engine.player.equippedWeapon?.id === item.id ||
          this.engine.player.equippedShield?.id === item.id;
        btn.innerHTML = `<span>${isEquipped ? '★ ' : ''}${decName}</span><span class="text-xs text-emerald-400 font-bold">素材選択</span>`;
        btn.addEventListener('click', () => {
          this.selectedMaterialItemId = item.id;
          this.renderSynthesisLists();
          this.updateSynthesisPreview();
        });
        this.synthesisMaterialListEl.appendChild(btn);
      }
    }
  }

  /**
   * 合成の壺による錬成結果プレビューを更新します。
   */
  public updateSynthesisPreview(): void {
    if (!this.activeSynthesisPot || !this.selectedBaseItemId || !this.selectedMaterialItemId) {
      this.synthesisPreviewBoxEl.classList.add('hidden');
      this.btnExecuteSynthesisEl.disabled = true;
      return;
    }

    const base = this.engine.player.inventory.find((it) => it.id === this.selectedBaseItemId);
    const mat = this.engine.player.inventory.find((it) => it.id === this.selectedMaterialItemId);

    if (!base || !mat) {
      this.synthesisPreviewBoxEl.classList.add('hidden');
      this.btnExecuteSynthesisEl.disabled = true;
      return;
    }

    const canSyn = SynthesisSystem.canSynthesize(base, mat, this.activeSynthesisPot);
    if (!canSyn.valid) {
      this.synthesisPreviewBoxEl.classList.remove('hidden');
      this.synthesisPreviewContentEl.innerHTML = `<span class="text-rose-400 font-bold">${canSyn.reason}</span>`;
      this.btnExecuteSynthesisEl.disabled = true;
      return;
    }

    const baseVal = base.value;
    const baseUpgrade = base.upgradeLevel ?? 0;
    const matUpgrade = mat.upgradeLevel ?? 0;
    const newUpgrade = baseUpgrade + matUpgrade;
    const combinedRunes = Array.from(new Set([...(base.runes ?? []), ...(mat.runes ?? [])]));

    const runeLabels: Record<string, string> = {
      DRAGON: '【竜】竜特効',
      FIRE: '【炎】炎追加',
      HOLY: '【聖】聖浄化',
      DOUBLE: '【連】2回攻撃',
      CRITICAL: '【会】会心率+25%',
      DRAGON_RESIST: '【竜耐】火炎半減',
      MAGIC_RESIST: '【魔】魔弾半減',
      EVASION: '【見】完全回避15%',
      DEFENSE_UP: '【防】被ダメ20%軽減',
    };

    const runeBadges = combinedRunes
      .map((r) => `<span class="bg-indigo-900 border border-indigo-400 text-indigo-200 px-1 py-0.5 rounded text-xs">${runeLabels[r] ?? r}</span>`)
      .join(' ');

    this.synthesisPreviewBoxEl.classList.remove('hidden');
    this.synthesisPreviewContentEl.innerHTML = `
      <div><strong>${base.name}</strong> ${newUpgrade > 0 ? `<span class="text-emerald-400 font-bold">+${newUpgrade}</span>` : ''}</div>
      <div class="text-xs text-slate-300">性能値: ${baseVal} (+${newUpgrade}) ➔ 合計 ${baseVal + newUpgrade}</div>
      <div class="text-xs text-sky-300 mt-1">継承される特殊印: ${runeBadges || 'なし'}</div>
    `;
    this.btnExecuteSynthesisEl.disabled = false;
  }

  /**
   * 合成を実行します。
   */
  public executeSynthesis(): void {
    if (!this.activeSynthesisPot || !this.selectedBaseItemId || !this.selectedMaterialItemId) return;

    this.engine.executeAction({
      type: 'SYNTHESIZE',
      potId: this.activeSynthesisPot.id,
      baseItemId: this.selectedBaseItemId,
      materialItemId: this.selectedMaterialItemId,
    });

    this.closeSynthesisModal();
  }

  /**
   * 合成モーダルを閉じます。
   */
  public closeSynthesisModal(): void {
    this.synthesisModalEl.classList.add('hidden');
    this.activeSynthesisPot = null;
    this.selectedBaseItemId = null;
    this.selectedMaterialItemId = null;
  }

  /**
   * ストーリーモノローグモーダルを表示します。
   */
  public showStoryMonologue(title: string, text: string): void {
    this.modalOpenTimestamps.set('story-modal', Date.now());
    this.storyTitleEl.textContent = title;
    this.storyTextEl.textContent = text;
    this.storyModalEl.classList.remove('hidden');
  }

  /**
   * ストーリーモノローグモーダルを閉じます。
   */
  public closeStoryMonologue(): void {
    this.storyModalEl.classList.add('hidden');
  }

  /**
   * ゲームクリア（真のエンディング）モーダルを表示します。
   */
  public showGameClearModal(): void {
    this.modalOpenTimestamps.set('gameclear-modal', Date.now());

    // クリアスコア算出（第50層クリアボーナス+50,000点）
    const baseScore = GameEngine.calculateScore(50, this.engine.player.level, this.engine.player.turn);
    const clearBonus = 50000;
    const finalScore = baseScore + clearBonus;

    // ハイスコア永続化保存
    const runStats: RunStats = {
      score: finalScore,
      floor: 50,
      level: this.engine.player.level,
      turn: this.engine.player.turn,
      causeOfDeath: '★ 迷宮完全制覇（クリア！）★',
      timestamp: Date.now(),
    };
    StorageManager.saveHighscore(runStats);

    this.gameClearStatsEl.innerHTML = `
      <div><strong>最終スコア:</strong> <span class="text-yellow-400 font-bold text-lg">${finalScore.toLocaleString()} 点</span></div>
      <div class="text-xs text-amber-300">（基本点 ${baseScore.toLocaleString()} + クリアボーナス ${clearBonus.toLocaleString()}）</div>
      <div><strong>到達階層:</strong> 地下 50 階（最深部）</div>
      <div><strong>冒険者レベル:</strong> Lv.${this.engine.player.level}</div>
      <div><strong>生存ターン数:</strong> ${this.engine.player.turn} ターン</div>
      <div><strong>獲得ゴールド:</strong> ${this.engine.player.gold.toLocaleString()} G</div>
    `;

    this.gameClearModalEl.classList.remove('hidden');
  }

  /**
   * ゲームクリアモーダルを閉じます。
   */
  public closeGameClearModal(): void {
    this.gameClearModalEl.classList.add('hidden');
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
    const maxCap = player.inventoryCapacity ?? 12;
    this.inventoryCapacityEl.textContent = `${player.inventory.length}/${maxCap}`;
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

    // 5. 画面上部ティッカーの更新（最新ログと種別カラーを反映、2行表示メッセージをじっくり読めるよう約4.5秒後に自動フェードアウト）
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
        }, 4500);
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

      const isIdentified = item.isIdentified !== false;
      const name = document.createElement('span');
      name.className = 'item-name';
      let displayName = isIdentified ? item.name : (item.unidentifiedName ?? item.name);
      if (isIdentified && item.upgradeLevel && item.upgradeLevel > 0) {
        displayName += `+${item.upgradeLevel}`;
      }
      if (item.category === 'ARROW' && item.count !== undefined) {
        displayName += ` [${item.count}]`;
      } else if (item.category === 'STAFF') {
        displayName += isIdentified && item.charges !== undefined ? ` [${item.charges}]` : ' [?]';
      }
      name.textContent = displayName;
      nameRow.appendChild(name);

      if (!isIdentified) {
        const unTag = document.createElement('span');
        unTag.className = 'unidentified-tag';
        unTag.textContent = '？ 未識別';
        nameRow.appendChild(unTag);
      }

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
      desc.textContent = isIdentified
        ? item.description
        : '正体不明の道具。何が起きるか使ってみるまで分からない……';

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

  // =========================================================================
  // ゲーム詳細設定モーダル制御
  // =========================================================================

  /**
   * localStorageから保存されたゲーム設定を読み込み、UIおよび各システムに適用します。
   */
  public loadAndApplySettings(): void {
    const settings = StorageManager.loadSettings();
    this.currentSpeedSetting = settings.gameSpeed;
    this.isVirtualPadVisible = settings.showVirtualPad;
    this.isMinimapVisible = settings.showMinimap;

    // サウンドシステムへ音量適用
    const soundSys = SoundSystem.getInstance();
    soundSys.setBgmVolume(settings.bgmVolume);
    soundSys.setSeVolume(settings.seVolume);

    // スライダーと数値の同期
    if (this.settingBgmSliderEl) {
      this.settingBgmSliderEl.value = `${Math.round(settings.bgmVolume * 100)}`;
    }
    if (this.settingBgmValEl) {
      this.settingBgmValEl.textContent = `${Math.round(settings.bgmVolume * 100)}%`;
    }
    if (this.settingSeSliderEl) {
      this.settingSeSliderEl.value = `${Math.round(settings.seVolume * 100)}`;
    }
    if (this.settingSeValEl) {
      this.settingSeValEl.textContent = `${Math.round(settings.seVolume * 100)}%`;
    }

    // 速度ボタンのアクティブ状態同期
    this.settingSpeedBtns.forEach((btn) => {
      if (btn.dataset.speed === this.currentSpeedSetting) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 仮想パッド表示状態の同期
    this.updateVirtualPadVisibility();

    // ミニマップ表示状態の同期
    this.updateMinimapVisibility();

    // エンジンへの反映
    this.engine.updateSettings(settings);
  }

  /**
   * ゲーム詳細設定モーダルを開きます。
   */
  public showSettingsModal(): void {
    this.modalOpenTimestamps.set('settings-modal', Date.now());
    this.loadAndApplySettings();
    this.settingsModalEl.classList.remove('hidden');
  }

  /**
   * ゲーム詳細設定モーダルを閉じ、変更された設定値を永続化保存します。
   */
  public hideSettingsModal(): void {
    const bgmVol = this.settingBgmSliderEl
      ? parseInt(this.settingBgmSliderEl.value, 10) / 100
      : 0.5;
    const seVol = this.settingSeSliderEl
      ? parseInt(this.settingSeSliderEl.value, 10) / 100
      : 0.7;

    const newSettings: GameSettings = {
      gameSpeed: this.currentSpeedSetting,
      bgmVolume: bgmVol,
      seVolume: seVol,
      showVirtualPad: this.isVirtualPadVisible,
      showMinimap: this.isMinimapVisible,
    };

    StorageManager.saveSettings(newSettings);
    this.engine.updateSettings(newSettings);
    this.settingsModalEl.classList.add('hidden');
  }

  /**
   * 画面下部仮想ゲームパッドの表示/非表示をDOMに反映します。
   */
  private updateVirtualPadVisibility(): void {
    const padEl = document.getElementById('mobile-controls');
    if (padEl) {
      if (this.isVirtualPadVisible) {
        padEl.classList.remove('hidden');
      } else {
        padEl.classList.add('hidden');
      }
    }
    if (this.settingTogglePadBtn) {
      this.settingTogglePadBtn.textContent = this.isVirtualPadVisible
        ? '表示中 (ON)'
        : '非表示 (OFF)';
      if (this.isVirtualPadVisible) {
        this.settingTogglePadBtn.classList.remove('off');
      } else {
        this.settingTogglePadBtn.classList.add('off');
      }
    }
  }

  /**
   * ミニマップの表示/非表示をDOMおよび設定に反映します。
   */
  private updateMinimapVisibility(): void {
    if (this.settingToggleMinimapBtn) {
      this.settingToggleMinimapBtn.textContent = this.isMinimapVisible
        ? '表示中 (ON)'
        : '非表示 (OFF)';
      if (this.isMinimapVisible) {
        this.settingToggleMinimapBtn.classList.remove('off');
      } else {
        this.settingToggleMinimapBtn.classList.add('off');
      }
    }

    const mapBtn = document.getElementById('btn-toggle-map');
    if (mapBtn) {
      mapBtn.textContent = this.isMinimapVisible ? 'MAP: ON' : 'MAP: OFF';
    }

    this.engine.updateSettings({ showMinimap: this.isMinimapVisible });
  }

  // =========================================================================
  // 迷宮博物誌（図鑑）モーダル制御
  // =========================================================================

  /**
   * 迷宮博物誌（図鑑）モーダルを開きます。
   */
  public showCompendiumModal(): void {
    this.modalOpenTimestamps.set('compendium-modal', Date.now());
    this.renderCompendium();
    this.compendiumModalEl.classList.remove('hidden');
  }

  /**
   * 迷宮博物誌（図鑑）モーダルを閉じます。
   */
  public hideCompendiumModal(): void {
    this.compendiumModalEl.classList.add('hidden');
  }

  /**
   * 現在選択中のタブに応じた図鑑内容（魔物または名品）をレンダリングします。
   */
  public renderCompendium(): void {
    if (this.activeCompendiumTab === 'MONSTERS') {
      this.renderCompendiumMonsters();
    } else {
      this.renderCompendiumItems();
    }
  }

  /**
   * 魔物図鑑（モンスター一覧）をレンダリングします。
   */
  private renderCompendiumMonsters(): void {
    const compendium = StorageManager.loadMonsterCompendium();
    const totalCount = COMPENDIUM_MONSTER_LIST.length;

    let unlockedCount = 0;
    for (const def of COMPENDIUM_MONSTER_LIST) {
      const entry = compendium[def.type];
      if (entry && entry.defeatedCount > 0) {
        unlockedCount++;
      }
    }

    const percentage = Math.round((unlockedCount / totalCount) * 100);
    this.compendiumProgressTextEl.textContent = `魔物収集率: ${percentage}% (${unlockedCount}/${totalCount}種)`;

    this.compendiumGridEl.innerHTML = '';

    for (const def of COMPENDIUM_MONSTER_LIST) {
      const entry = compendium[def.type];
      const isUnlocked = entry !== undefined && entry.defeatedCount > 0;

      const card = document.createElement('div');
      card.className = `compendium-card ${isUnlocked ? '' : 'locked'}`;

      if (isUnlocked) {
        const sprite = SVGSprites.get(def.spriteId);
        const imgSrc = sprite?.src ?? '';

        card.innerHTML = `
          <div class="compendium-card-top">
            <div class="compendium-card-thumb">
              ${imgSrc ? `<img src="${imgSrc}" alt="${def.name}" width="48" height="48" />` : '<span style="font-size: 32px;">👾</span>'}
            </div>
            <div class="compendium-card-header">
              <h4 class="compendium-card-name">${def.name}</h4>
              <div class="compendium-card-sub">
                <span class="compendium-floor-tag">生息: ${def.floorRange}</span>
                <span class="compendium-defeat-tag">撃破: ${entry.defeatedCount}体</span>
              </div>
            </div>
          </div>
          <div class="compendium-badge-row">
            <span class="compendium-feature-badge">${def.features}</span>
          </div>
          <p class="compendium-card-desc">${def.description}</p>
        `;
      } else {
        card.innerHTML = `
          <div class="compendium-card-top">
            <div class="compendium-card-thumb compendium-locked-thumb">
              <span class="compendium-locked-icon">？</span>
            </div>
            <div class="compendium-card-header">
              <h4 class="compendium-card-name text-gray-500">？？？？？</h4>
              <div class="compendium-card-sub">
                <span class="compendium-floor-tag text-gray-600">生息: ？？？</span>
                <span class="compendium-defeat-tag text-gray-600">未討伐</span>
              </div>
            </div>
          </div>
          <div class="compendium-badge-row">
            <span class="compendium-feature-badge text-gray-600">未解明の脅威</span>
          </div>
          <p class="compendium-card-desc text-gray-600">まだ遭遇・討伐したことのない未知の魔物。迷宮の深層に潜んでいる……</p>
        `;
      }

      this.compendiumGridEl.appendChild(card);
    }
  }

  /**
   * 名品図鑑（アイテム一覧）をレンダリングします。
   */
  private renderCompendiumItems(): void {
    const compendium = StorageManager.loadItemCompendium();
    const totalCount = COMPENDIUM_ITEM_LIST.length;

    let unlockedCount = 0;
    for (const def of COMPENDIUM_ITEM_LIST) {
      const entry = compendium[def.matchKey];
      if (entry && entry.discoveredCount > 0) {
        unlockedCount++;
      }
    }

    const percentage = Math.round((unlockedCount / totalCount) * 100);
    this.compendiumProgressTextEl.textContent = `名品収集率: ${percentage}% (${unlockedCount}/${totalCount}種)`;

    this.compendiumGridEl.innerHTML = '';

    for (const def of COMPENDIUM_ITEM_LIST) {
      const entry = compendium[def.matchKey];
      const isUnlocked = entry !== undefined && entry.discoveredCount > 0;

      const card = document.createElement('div');
      card.className = `compendium-card ${isUnlocked ? '' : 'locked'}`;

      if (isUnlocked) {
        const sprite = SVGSprites.get(def.spriteId);
        const imgSrc = sprite?.src ?? '';

        card.innerHTML = `
          <div class="compendium-card-top">
            <div class="compendium-card-thumb">
              ${imgSrc ? `<img src="${imgSrc}" alt="${def.name}" width="48" height="48" />` : '<span style="font-size: 32px;">📦</span>'}
            </div>
            <div class="compendium-card-header">
              <h4 class="compendium-card-name">${def.name}</h4>
              <div class="compendium-card-sub">
                <span class="compendium-floor-tag">分類: ${def.category}</span>
                <span class="compendium-defeat-tag">発見: ${entry.discoveredCount}回</span>
              </div>
            </div>
          </div>
          <div class="compendium-badge-row">
            <span class="compendium-feature-badge">${def.statsSummary}</span>
          </div>
          <p class="compendium-card-desc">${def.description}</p>
        `;
      } else {
        card.innerHTML = `
          <div class="compendium-card-top">
            <div class="compendium-card-thumb compendium-locked-thumb">
              <span class="compendium-locked-icon">？</span>
            </div>
            <div class="compendium-card-header">
              <h4 class="compendium-card-name text-gray-500">？？？？？</h4>
              <div class="compendium-card-sub">
                <span class="compendium-floor-tag text-gray-600">分類: 未鑑定</span>
                <span class="compendium-defeat-tag text-gray-600">未発見</span>
              </div>
            </div>
          </div>
          <div class="compendium-badge-row">
            <span class="compendium-feature-badge text-gray-600">未発見の秘宝</span>
          </div>
          <p class="compendium-card-desc text-gray-600">まだ手に入れたことのない未知の名品。迷宮のどこかに眠っている……</p>
        `;
      }

      this.compendiumGridEl.appendChild(card);
    }
  }
}
