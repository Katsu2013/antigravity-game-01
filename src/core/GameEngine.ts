/**
 * @file GameEngine.ts
 * @description コアゲーム状態の管理、ターン進行、戦闘解決、モンスターAI、アイテム操作、ログ管理、
 * および IndexedDB オートセーブ連携を行う統合ゲームエンジン。
 */

import { DungeonGenerator } from './algorithms/DungeonGenerator';
import { FOV } from './algorithms/FOV';
import { Pathfinding } from './algorithms/Pathfinding';
import { EntityFactory } from './entities/EntityFactory';
import { CombatSystem } from './systems/CombatSystem';
import { ItemSystem } from './systems/ItemSystem';
import { ShopSystem } from './systems/ShopSystem';
import { NpcSystem } from './systems/NpcSystem';
import { SynthesisSystem } from './systems/SynthesisSystem';
import { StorageManager } from '../storage/StorageManager';
import { SoundSystem } from '../audio/SoundSystem';
import {
  ActionType,
  CardinalDirection,
  Direction8,
  DungeonMap,
  GameLogEntry,
  GameSettings,
  Item,
  Monster,
  Obstacle,
  PlayerState,
  Room,
  TileType,
} from './types';

/**
 * ゲーム全体のステートとルール進行を統括する中央エンジンクラス。
 */
export class GameEngine {
  /**
   * 現在のダンジョンフロアの完全なマップ情報（地形タイル、部屋、敵、アイテム、ギミック）。
   * - 初期値: `initDefaultState()` または `resumeSavedGame()` 実行時に初期化生成
   */
  public map!: DungeonMap;

  /**
   * プレイヤーキャラクターの現在ステータス（座標、HP、満腹度、装備品、インベントリ等）。
   * - 初期値: `initDefaultState()` でLv1初期ステータス（HP15, 満腹度100%）として生成
   */
  public player!: PlayerState;

  /**
   * 行動ログ・メッセージの履歴リスト（最新ログが先頭インデックス0）。
   * - 想定値: GameLogEntryオブジェクトの配列（上限50件程度保持）
   * - 初期値: `[]`（空配列）
   */
  public logs: GameLogEntry[] = [];

  /**
   * 死亡時の敗因メッセージ（ハイスコア記録・冒険結果画面表示用）。
   * - 想定値: 「ゴブリンの一撃により力尽きた」「空腹で力尽きた」等の文字列
   * - 初期値: `''`（空文字）
   */
  public lastDefeatCause = '';

  /**
   * ログエントリの一意なIDを生成するための内部連番カウンタ。
   * - 想定値: 0以上の整数（ログ追加ごとにインクリメント）
   * - 初期値: `0`
   */
  private logIdCounter = 0;

  /**
   * ゲーム状態が変化（ターン経過、HP変動等）した際に呼び出されるリスナー関数のリスト。
   * - 想定値: コールバック関数の配列
   * - 初期値: `[]`（空配列）
   */
  private listeners: (() => void)[] = [];

  /**
   * 攻撃演出アニメーション発生時のコールバック関数。
   * - 想定引数: attackerId（攻撃者ID）, dx/dy（攻撃方向ベクトル）, targetId（対象ID）
   * - 初期値: `undefined`
   */
  public onAttack?: (
    attackerId: string,
    dx: number,
    dy: number,
    targetId: string
  ) => void;

  /**
   * 被ダメージ・被弾アニメーション発生時のコールバック関数。
   * - 想定引数: targetId（被弾対象のID）
   * - 初期値: `undefined`
   */
  public onDamage?: (targetId: string) => void;

  /**
   * レアNPCとの対話イベント発生時のコールバック関数。
   * - 想定引数: npc（対話対象のMonsterオブジェクト）
   * - 初期値: `undefined`
   */
  public onNpcInteract?: (npc: Monster) => void;

  /**
   * 合成の壺使用時の鍛冶錬成モーダル呼び出しコールバック関数。
   * - 想定引数: potItem（使用された合成の壺アイテム）
   * - 初期値: `undefined`
   */
  public onOpenSynthesis?: (potItem: Item) => void;

  /**
   * 第50層ボス撃破時のゲームクリア（完全制覇）コールバック関数。
   * - 初期値: `undefined`
   */
  public onGameClear?: () => void;

  /**
   * 節目階層到達時のストーリーモノローグ通知コールバック関数。
   * - 想定引数: floor（到達階層番号）, title（章タイトル）, text（本文）
   * - 初期値: `undefined`
   */
  public onStoryMonologue?: (floor: number, title: string, text: string) => void;

  /**
   * モノローグを既に表示した階層の記録セット（同一階層での重複ポップアップ防止用）。
   * - 想定値: 階層番号のSet集合（例: Set { 1, 10, 25, 50 }）
   * - 初期値: `new Set<number>()`
   */
  private shownMonologueFloors = new Set<number>();

  /**
   * 障害物を押して移動した際の演出コールバック関数。
   * - 想定引数: obstacle（移動した障害物）, dx/dy（移動方向）
   * - 初期値: `undefined`
   */
  public onObstaclePush?: (obstacle: Obstacle, dx: number, dy: number) => void;

  /**
   * 障害物が破壊・粉砕された際の破片演出コールバック関数。
   * - 想定引数: obstacle（破壊された障害物）
   * - 初期値: `undefined`
   */
  public onObstacleBreak?: (obstacle: Obstacle) => void;

  /**
   * 泥濘や沼に足を取られて身動きが取れなくなった際のエフェクトコールバック関数。
   * - 想定引数: x, y（泥沼座標）
   * - 初期値: `undefined`
   */
  public onSwampStuck?: (x: number, y: number) => void;

  /**
   * 泥濘や沼から力いっぱい足を引き抜いて脱出した際の演出コールバック関数。
   * - 想定引数: fromX, fromY, toX, toY（脱出移動の始点と終点座標）
   * - 初期値: `undefined`
   */
  public onSwampEscape?: (fromX: number, fromY: number, toX: number, toY: number) => void;

  /**
   * 氷の床で滑走した際の氷煙・滑走演出コールバック関数。
   * - 想定引数: fromX, fromY, toX, toY, hitWall（壁激突フラグ）, durationSec（滑走時間秒）, didFall（水没落下フラグ）, damage（落下ダメージ）
   * - 初期値: `undefined`
   */
  public onIceSlide?: (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    hitWall: boolean,
    durationSec?: number,
    didFall?: boolean,
    damage?: number
  ) => void;

  /**
   * 飛び道具（弓矢・魔法弾・火炎・投擲岩）の飛翔・着弾演出コールバック関数。
   * - 想定引数: fromX, fromY, toX, toY, type（ARROW/BEAM/STONE/ITEM）, color（発光色）
   * - 初期値: `undefined`
   */
  public onProjectile?: (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    type: 'ARROW' | 'BEAM' | 'STONE' | 'ITEM',
    color: string
  ) => void;

  /**
   * 演出アニメーション中（岩押し・氷滑走・沼脱出等）に入力受付を遮断するミリ秒タイムスタンプ。
   * - 想定値: 未来のエポックミリ秒（Date.now() + 演出所要時間）、演出待機なし時は 0
   * - 初期値: `0`
   */
  public actionLockUntil = 0;

  /**
   * プレイヤーがカスタマイズしたゲーム詳細設定。
   * - 想定値: GameSettings オブジェクト（ゲーム速度、BGM/SE音量、仮想パッド表示等）
   * - 初期値: StorageManager.loadSettings() から復元
   * - 変化契機: 設定モーダルでの変更時に updateSettings() で更新
   */
  public settings: GameSettings = StorageManager.loadSettings();

  /**
   * ゲーム詳細設定を更新し、ストレージ保存および音声システムへ即時反映します。
   *
   * @param newSettings 変更する設定差分
   */
  public updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    StorageManager.saveSettings(this.settings);

    // 音声システムへの即時反映
    if (newSettings.bgmVolume !== undefined) {
      SoundSystem.getInstance().setBgmVolume(newSettings.bgmVolume);
    }
    if (newSettings.seVolume !== undefined) {
      SoundSystem.getInstance().setSeVolume(newSettings.seVolume);
    }

    this.notify();
  }

  /**
   * プレイヤーが現在滞在している部屋オブジェクトを取得します。
   * 通路にいる場合は null を返します。
   *
   * @returns 滞在中のRoomオブジェクト、または通路時は null
   */
  public getCurrentRoom(): Room | null {
    if (!this.map || !this.player) return null;
    const px = this.player.x;
    const py = this.player.y;
    for (const r of this.map.rooms) {
      if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) {
        return r;
      }
    }
    return null;
  }

  /**
   * プレイヤーがモンスターハウスの部屋に進入したかを検知し、
   * 初回進入時に警報ファンファーレSE、BGM切替、警告ログ、部屋内魔物の全覚醒を発動します。
   */
  public checkMonsterHouseEntry(): void {
    const room = this.getCurrentRoom();
    if (room && room.isMonsterHouse && !room.monsterHouseTriggered) {
      room.monsterHouseTriggered = true;

      // 1. 警報ファンファーレSE再生
      SoundSystem.getInstance().playMonsterHouseFanfare();

      // 2. 警告ログ出力
      this.addLog('🚨 モンスターハウスだ！！ 部屋の魔物たちが一斉に目を覚ました！', 'warning');

      // 3. 部屋内のモンスターを一斉覚醒（睡眠解除）
      for (const m of this.map.monsters) {
        if (
          m.x >= room.x &&
          m.x < room.x + room.w &&
          m.y >= room.y &&
          m.y < room.y + room.h
        ) {
          m.isDormant = false;
        }
      }

      // 4. BGMをモンスターハウス曲に切り替え
      this.updateBgm();
    }
  }

  /**
   * 現在のフロア環境や探索状況（泥棒、店、モンスターハウス、ボス）に応じたプログラマティックBGMを自動再生します。
   */
  public updateBgm(): void {
    const sound = SoundSystem.getInstance();
    if (!this.player || !this.player.isAlive) {
      sound.stopBgm();
      return;
    }

    // 1. 泥棒発覚時
    if (this.map.isThiefMode) {
      sound.playBgm('THIEF');
      return;
    }

    // 2. モンスターハウス発動中の部屋内にいる場合
    const currentRoom = this.getCurrentRoom();
    if (currentRoom && currentRoom.isMonsterHouse && currentRoom.monsterHouseTriggered) {
      sound.playBgm('MONSTER_HOUSE');
      return;
    }

    // 3. ショップ部屋内にいる場合（平常時）
    if (currentRoom && currentRoom.isShop) {
      sound.playBgm('SHOP');
      return;
    }

    // 4. 第50層ボスフロア
    if (this.player.floor === 50) {
      sound.playBgm('BOSS');
      return;
    }

    // 5. バイオーム別BGM
    switch (this.map.biome) {
      case 'ICE':
      case 'SNOW':
        sound.playBgm('DUNGEON_ICE');
        break;
      case 'SWAMP':
      case 'TOXIC':
      case 'MAGMA':
        sound.playBgm('DUNGEON_SWAMP');
        break;
      case 'EARTH':
      case 'MECHA':
        sound.playBgm('DUNGEON_CAVE');
        break;
      default:
        sound.playBgm('DUNGEON_STONE');
        break;
    }
  }

  /**
   * モンスター討伐実績を迷宮博物誌（図鑑）に登録します。
   *
   * @param monster 討伐されたモンスター
   */
  public recordMonsterKill(monster: Monster): void {
    StorageManager.recordMonsterDefeat(
      monster.type,
      monster.name,
      this.player.floor,
      monster.variantId
    );
  }

  /**
   * 現在演出アニメーション等のためプレイヤー入力がロック中かどうかを判定します。
   * - 想定返り値:
   *   - `true`: ロック中（Date.now() < actionLockUntil）であり、キー・タッチ入力を無視
   *   - `false`: 入力受付可能（通常操作状態）
   * @returns 入力遮断中かどうかの真偽値
   */
  public isActionLocked(): boolean {
    return Date.now() < this.actionLockUntil;
  }

  /**
   * GameEngine のインスタンスを生成し、デフォルトステータスと初期マップを準備します。
   * 中断セーブデータの有無を破壊せず保持します。
   */
  constructor() {
    this.initDefaultState();
  }

  /**
   * 現在のゲーム状態（プレイヤー、マップ、ログ）をlocalStorageおよびIndexedDBに永続化保存します。
   */
  public saveGame(): void {
    if (!this.player || !this.player.isAlive || !this.map) return;
    StorageManager.saveCurrentRun({
      player: this.player,
      map: this.map,
      logs: this.logs,
      timestamp: Date.now(),
    });
  }

  /**
   * ブラウザ終了・ページ遷移時用の完全同期セーブ処理。
   */
  public saveGameSync(): void {
    if (!this.player || !this.player.isAlive || !this.map) return;
    StorageManager.saveCurrentRunSync({
      player: this.player,
      map: this.map,
      logs: this.logs,
      timestamp: Date.now(),
    });
  }

  /**
   * 到達階層、冒険者レベル、生存ターン数から総合冒険スコアを算出します。
   *
   * @param floor - 到達階層
   * @param level - 冒険者レベル
   * @param turn - 生存ターン数
   * @returns 総合スコア値
   */
  public static calculateScore(floor: number, level: number, turn: number): number {
    return floor * 1000 + level * 350 + turn * 10;
  }

  /**
   * IndexedDBまたはlocalStorageの中断セーブデータを読み込み、前回の冒険を再開します。
   *
   * @returns 再開に成功した場合は true、データがない場合は false
   */
  public async resumeSavedGame(): Promise<boolean> {
    const saved = await StorageManager.loadCurrentRun();
    if (saved && saved.player && saved.player.isAlive && saved.map) {
      this.player = saved.player;
      if (typeof this.player.gold !== 'number') {
        this.player.gold = 0;
      }
      if (typeof this.player.inventoryCapacity !== 'number') {
        this.player.inventoryCapacity = 12;
      }
      this.map = saved.map;
      if (!this.map.obstacles) {
        this.map.obstacles = [];
      }
      this.logs = saved.logs || [];
      this.lastDefeatCause = '';
      FOV.compute(this.map, { x: this.player.x, y: this.player.y });
      this.addLog('前回の冒険の続きを再開した。', 'turn-header');
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * プレイヤーの所持品インベントリを論理順（装備中優先、武器→盾→薬草→食料→巻物）に整理整頓します。
   */
  public sortInventory(): void {
    ItemSystem.sortInventory(this.player);
    this.addLog('持ち物を種類順に整理整頓した。', 'info');
    this.saveGame();
    this.notify();
  }

  /**
   * 飛び道具（弓矢など）を発射します。
   */
  public shoot(arrowId?: string): boolean {
    return this.executeAction({ type: 'SHOOT', itemId: arrowId });
  }

  /**
   * 魔法の杖を振ります。
   */
  public zapStaff(staffId: string): boolean {
    return this.executeAction({ type: 'ZAP_STAFF', itemId: staffId });
  }

  /**
   * アイテムを向いている方向へ投げつけます。
   */
  public throwItem(itemId: string): boolean {
    return this.executeAction({ type: 'THROW_ITEM', itemId });
  }

  /**
   * ゲームエンジンを非同期初期化し、IndexedDBの中断セーブデータが存在すれば復元します。
   *
   * @returns 初期化完了を示すPromise
   */
  public async initAsync(): Promise<void> {
    await this.resumeSavedGame();
  }

  /**
   * ゲーム状態の変化を監視するリスナーを登録します。
   *
   * @param listener - 状態更新時に実行されるコールバック関数
   * @returns 登録解除用のアンサブスクライブ関数
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * 登録されているすべてのリスナーに対して状態変更を通知します。
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * ゲームエンジン用の初期ステータスとマップを用意します（既存の中断セーブデータはクリアしません）。
   */
  public initDefaultState(): void {
    this.player = {
      x: 0,
      y: 0,
      direction: 'down',
      hp: 20,
      maxHp: 20,
      baseAtk: 5,
      baseDef: 1,
      atk: 5,
      def: 1,
      level: 1,
      exp: 0,
      nextExp: 10,
      hunger: 100,
      maxHunger: 100,
      gold: 0,
      floor: 1,
      turn: 1,
      inventory: [
        EntityFactory.createRandomItem(0, 0),
      ],
      inventoryCapacity: 12,
      equippedWeapon: null,
      equippedShield: null,
      equippedTalisman: null,
      equippedArrow: null,
      equippedStaff: null,
      isAlive: true,
    };

    // 初期アイテムとして薬草を確定支給
    this.player.inventory[0].name = '薬草';
    this.player.inventory[0].category = 'POTION';
    this.player.inventory[0].description = '飲むとHPが15回復する不思議な薬草。';
    this.player.inventory[0].value = 15;
    this.player.inventory[0].symbol = '!';
    this.player.inventory[0].color = '#10b981';

    this.logs = [];
    this.generateFloor(1, false);
    this.addLog('ダンジョン深部への冒険が始まった。', 'info');
  }

  /**
   * 新しいゲームを初期ステータス（地下1階、初期アイテム所持）で開始します。
   * 既存のセーブデータは完全に消去され、新データが即座に保存されます。
   */
  public startNewGame(): void {
    StorageManager.clearCurrentRun();
    this.initDefaultState();
    StorageManager.saveCurrentScreen('playing');
    this.saveGame();
    this.notify();
  }

  /**
   * 指定した階層番号のフロアを生成し、プレイヤーを開始位置へ配置して初期視界を計算します。
   *
   * @param floorNum - 生成する階層番号（1 = B1F）
   * @param shouldSave - 生成後に自動セーブを行うかどうか（デフォルト: true）
   */
  public generateFloor(floorNum: number, shouldSave = true): void {
    this.player.floor = floorNum;
    this.map = DungeonGenerator.generate(floorNum, 48, 36);

    // プレイヤーの配置
    this.player.x = this.map.startPos.x;
    this.player.y = this.map.startPos.y;

    // 視界の初期計算
    FOV.compute(this.map, { x: this.player.x, y: this.player.y });

    // 節目階層ストーリーモノローグ演出
    this.checkAndTriggerStoryMonologue(floorNum);

    // バイオームに応じたBGM自動再生
    this.updateBgm();

    if (shouldSave) {
      this.saveGame();
    }
    this.notify();
  }

  /**
   * 節目階層（1F, 10F, 20F, 30F, 40F, 50F）に初回到達した際、ストーリーモノローグを発火します。
   */
  private checkAndTriggerStoryMonologue(floor: number): void {
    if (this.shownMonologueFloors.has(floor)) return;

    const monologues: Record<number, { title: string; text: string }> = {
      1: {
        title: '【第1層】深淵迷宮への第一歩',
        text: 'かつて多くの歴戦の勇者が挑み、誰一人として戻らなかったという地下50層の深淵迷宮『ラビリンス』。\n最深部に眠る伝説の秘宝『アビス・オーブ』を求めて、あなたの壮大な冒険が今始まる……！',
      },
      10: {
        title: '【第10層】過酷なる中層への境',
        text: '冷気が肌を刺す。浅層を抜け、迷宮はその過酷な深部へと姿を変え始めた。\nここからは水脈と氷雪、そして凶悪な魔獣たちが待ち受ける……油断は命取りだ！',
      },
      20: {
        title: '【第20層】腐蝕と有毒の魔境',
        text: '鼻をつく腐臭と紫の瘴気。足元は泥濘と有毒沼に覆われ、引き返す道は既に閉ざされている。\n研ぎ澄まされた集中力と武具の強化だけが、生還への唯一の道だ……。',
      },
      30: {
        title: '【第30層】煮え滾る灼熱の地鳴り',
        text: '足の裏から激しい熱気が伝わる。煮え滾るマグマと古代機械の重低音が響き渡る。\n深淵の支配者が潜む最深部は、確実に近づいている……！',
      },
      40: {
        title: '【第40層】深層古代神殿の静寂',
        text: '荘厳にして禍々しい古代神殿の回廊。\n第50層を守護する魔王の強大なプレッシャーが、空間そのものを歪ませている……覚悟を決めよ！',
      },
      50: {
        title: '【第50層：最終決戦】奈落の祭壇',
        text: 'ついに地下50層、深淵の最奥『奈落の祭壇』へ到達した！\n紫黒の闇の中、玉座から『奈落の魔王アビス・ロード』が立ち上がる！\nすべての武具と知恵を尽くし、迷宮の支配者を討ち果たせ！！',
      },
    };

    const mono = monologues[floor];
    if (mono) {
      this.shownMonologueFloors.add(floor);
      this.onStoryMonologue?.(floor, mono.title, mono.text);
    }
  }

  /**
   * プレイヤーからの要求アクションを実行し、ゲーム内時間を進めます。
   *
   * @param action - 実行するアクションオブジェクト
   * @returns ターンが実際に経過した場合は true、無効な移動などターンが経過しなかった場合は false
   */
  public executeAction(action: ActionType): boolean {
    // 演出アニメーション中（岩押し・氷滑走・沼脱出等）は次の操作を受け付けない（岩のすり抜け等を物理防止）
    if (this.isActionLocked()) {
      return false;
    }

    // 死亡している場合はリスタートアクション以外を受け付けない
    if (!this.player.isAlive) {
      if (action.type === 'RESTART') {
        this.startNewGame();
        return true;
      }
      return false;
    }

    let turnPassed = false;

    switch (action.type) {
      case 'MOVE': {
        // 入力方向へプレイヤーの向き（8方向）を即座に更新
        let moveDir: Direction8 = 'down';
        if (action.dx !== 0 && action.dy !== 0) {
          if (action.dx > 0 && action.dy > 0) moveDir = 'down_right';
          else if (action.dx < 0 && action.dy > 0) moveDir = 'down_left';
          else if (action.dx > 0 && action.dy < 0) moveDir = 'up_right';
          else if (action.dx < 0 && action.dy < 0) moveDir = 'up_left';
        } else if (action.dx !== 0) {
          moveDir = action.dx > 0 ? 'right' : 'left';
        } else if (action.dy !== 0) {
          moveDir = action.dy > 0 ? 'down' : 'up';
        }
        this.player.direction = moveDir;

        const targetX = this.player.x + action.dx;
        const targetY = this.player.y + action.dy;

        // マップ範囲外チェック
        if (
          targetX < 0 ||
          targetX >= this.map.width ||
          targetY < 0 ||
          targetY >= this.map.height
        ) {
          this.notify();
          return false;
        }

        // 1. 進行方向にモンスターがいるか判定（近接攻撃）
        const targetMonster = this.map.monsters.find(
          (m) => m.x === targetX && m.y === targetY
        );

        if (targetMonster) {
          // 平時の中立店主NPCなら、攻撃ではなく話しかけ・会計を行う
          if (targetMonster.isFriendly && targetMonster.isShopkeeper) {
            this.handleShopkeeperInteraction(targetMonster, action.dx, action.dy);
            return false;
          }

          // レア中立NPCなら、攻撃ではなく対話イベントを開く
          if (targetMonster.isRareNpc) {
            this.onNpcInteract?.(targetMonster);
            this.notify();
            return false;
          }

          // スクーターおじさんなら、攻撃せず呑気な会話が発生
          if (targetMonster.type === 'SCOOTER_GUY') {
            this.talkToScooterGuy(targetMonster);
            this.notify();
            return false;
          }

          // 仲良し仲間モンスターなら、攻撃せず触れ合い＆位置スワップ
          if (targetMonster.isCompanion) {
            this.interactWithCompanion(targetMonster);
            turnPassed = true;
            break;
          }

          this.executePlayerAttack(targetMonster, action.dx, action.dy);
          turnPassed = true;
          break;
        }

        // 2. 進行方向に障害物があるか判定（破壊・押し出し・滑走）
        const targetObstacle = (this.map.obstacles || []).find(
          (o) => o.x === targetX && o.y === targetY
        );

        if (targetObstacle) {
          turnPassed = this.interactWithObstacle(
            targetObstacle,
            action.dx,
            action.dy
          );
          break;
        }

        // 3. 壁・水路チェック（進入不可タイルの場合は向き変更のみでターン消費なし）
        const targetTile = this.map.tiles[targetY][targetX];
        if (targetTile === TileType.Wall || targetTile === TileType.Water) {
          this.notify();
          return false;
        }

        // 3.5 泥沼足枷判定: 現在立っている足元が泥濘の場合、脱出時にもがく（40%で足止め失敗）
        const currentTile = this.map.tiles[this.player.y][this.player.x];
        if (currentTile === TileType.Mud) {
          if (Math.random() < 0.40) {
            this.addLog('ズブズブ……！ 泥濘に足を取られて抜け出せない！', 'warning');
            this.onDamage?.('player'); // もがき振動演出
            SoundSystem.getInstance().playSwampStuck();
            this.onSwampStuck?.(this.player.x, this.player.y);
            this.actionLockUntil = Date.now() + 1150; // 約1.15秒もがきロック
            turnPassed = true;
            break;
          } else {
            this.addLog('ぬかるみから力いっぱい足を引き抜いて進んだ！', 'normal');
            this.onSwampEscape?.(this.player.x, this.player.y, targetX, targetY);
            this.actionLockUntil = Date.now() + 1000; // 約1.0秒脱出ジャンプ演出ロック
          }
        }

        // 3.8 ショップ退出判定（店部屋から外へ出ようとした場合）
        if (ShopSystem.isLeavingShop(this.player.x, this.player.y, targetX, targetY, this.map.shopRoom)) {
          const bill = ShopSystem.calculateBill(this.player, this.map);
          if (bill.unpaidItems.length > 0) {
            if (bill.canAfford) {
              const res = ShopSystem.checkout(this.player, this.map);
              this.addLog(res.message, 'turn-header');
            } else {
              this.addLog(
                `店主ネロ「おっとお客さん！まだお代(${bill.balance}G)をいただいてないよ！品物を返しておくれ！」`,
                'warning'
              );
              this.notify();
              return false;
            }
          } else if (bill.sellItems.length > 0) {
            const res = ShopSystem.checkout(this.player, this.map);
            this.addLog(res.message, 'turn-header');
          }
        }

        // 4. 移動実行
        this.player.x = targetX;
        this.player.y = targetY;
        turnPassed = true;

        // モンスターハウス突入検知 & BGM環境更新
        this.checkMonsterHouseEntry();
        this.updateBgm();

        // 5. タイル環境ギミック処理（氷の滑走、泥濘の足枷、毒沼の毒気）
        const extraTurn = this.handleTileGimmick(
          targetTile,
          action.dx,
          action.dy
        );

        // 足元のアイテム検知
        const groundItem = this.map.items.find(
          (it) => it.x === this.player.x && it.y === this.player.y
        );
        if (groundItem) {
          const groundName =
            groundItem.isIdentified === false && groundItem.unidentifiedName
              ? groundItem.unidentifiedName
              : groundItem.name;
          this.addLog(`足元に ${groundName} が落ちている。`, 'info');
        }

        if (targetTile === TileType.StairsDown) {
          this.addLog('下り階段を見つけた。(決定ボタンまたは階段ボタンで次へ)', 'info');
        }

        if (extraTurn) {
          // 泥濘などで追加のターンが進行
          this.updateMonsters();
        }
        break;
      }

      case 'WAIT': {
        turnPassed = true;
        this.addLog('その場で周囲を警戒した。', 'normal');
        // 周囲隣接マス（8方向）に敵モンスターが存在する場合、その敵の方向へ自動で向き直る
        const nearMonster = this.map.monsters.find(
          (m) => Math.hypot(m.x - this.player.x, m.y - this.player.y) <= 1.5
        );
        if (nearMonster) {
          const dx = nearMonster.x - this.player.x;
          const dy = nearMonster.y - this.player.y;
          if (dx !== 0 && dy !== 0) {
            if (dx > 0 && dy > 0) this.player.direction = 'down_right';
            else if (dx < 0 && dy > 0) this.player.direction = 'down_left';
            else if (dx > 0 && dy < 0) this.player.direction = 'up_right';
            else if (dx < 0 && dy < 0) this.player.direction = 'up_left';
          } else if (dx !== 0) {
            this.player.direction = dx > 0 ? 'right' : 'left';
          } else if (dy !== 0) {
            this.player.direction = dy > 0 ? 'down' : 'up';
          }
        }
        break;
      }

      case 'PICKUP': {
        const result = ItemSystem.pickupItem(this.player, this.map);
        if (result.success) {
          if (result.message.includes('G') || result.message.includes('ゴールド')) {
            SoundSystem.getInstance().playGold();
          } else {
            SoundSystem.getInstance().playPickup();
          }
        }
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        break;
      }

      case 'INTERACT': {
        // 1. 足元アイテム拾得判定（ボタン表示が「拾う」になっている場合は最優先で拾う）
        const hasGroundItem = this.map.items.some(
          (it) => it.x === this.player.x && it.y === this.player.y
        );
        if (hasGroundItem) {
          const result = ItemSystem.pickupItem(this.player, this.map);
          if (result.success) {
            if (result.message.includes('G') || result.message.includes('ゴールド')) {
              SoundSystem.getInstance().playGold();
            } else {
              SoundSystem.getInstance().playPickup();
            }
          }
          this.addLog(result.message, result.success ? 'info' : 'warning');
          turnPassed = result.success;
          break;
        }

        // 2. 階段マス判定（足元）
        const currentTile = this.map.tiles[this.player.y][this.player.x];
        if (currentTile === TileType.StairsDown) {
          return this.descendFloor();
        }

        // 3. プレイヤーの向いている方向（8方向）の直前マスを計算
        let fdx = 0;
        let fdy = 1;
        switch (this.player.direction) {
          case 'up':
            fdx = 0;
            fdy = -1;
            break;
          case 'down':
            fdx = 0;
            fdy = 1;
            break;
          case 'left':
            fdx = -1;
            fdy = 0;
            break;
          case 'right':
            fdx = 1;
            fdy = 0;
            break;
          case 'up_left':
            fdx = -1;
            fdy = -1;
            break;
          case 'up_right':
            fdx = 1;
            fdy = -1;
            break;
          case 'down_left':
            fdx = -1;
            fdy = 1;
            break;
          case 'down_right':
            fdx = 1;
            fdy = 1;
            break;
        }

        const targetX = this.player.x + fdx;
        const targetY = this.player.y + fdy;

        // 正面マスにモンスターがいる場合は直接近接攻撃（店主なら会話・会計）！
        const facingMonster = this.map.monsters.find(
          (m) => m.x === targetX && m.y === targetY
        );

        if (facingMonster) {
          if (facingMonster.isFriendly && facingMonster.isShopkeeper) {
            this.handleShopkeeperInteraction(facingMonster, fdx, fdy);
            return false;
          }

          // レア中立NPCなら、攻撃ではなく対話イベントを開く
          if (facingMonster.isRareNpc) {
            this.onNpcInteract?.(facingMonster);
            this.notify();
            return false;
          }

          // スクーターおじさんなら、攻撃せず呑気な会話が発生
          if (facingMonster.type === 'SCOOTER_GUY') {
            this.talkToScooterGuy(facingMonster);
            this.notify();
            return false;
          }

          // 仲良し仲間モンスターなら、攻撃せず触れ合い＆位置スワップ
          if (facingMonster.isCompanion) {
            this.interactWithCompanion(facingMonster);
            turnPassed = true;
            break;
          }

          this.executePlayerAttack(facingMonster, fdx, fdy);
          turnPassed = true;
          break;
        }

        // 正面マスに障害物がある場合は攻撃または押し出し実行！
        const facingObstacle = (this.map.obstacles || []).find(
          (o) => o.x === targetX && o.y === targetY
        );
        if (facingObstacle) {
          turnPassed = this.interactWithObstacle(facingObstacle, fdx, fdy);
          break;
        }

        // 4. 正面に敵・障害物がなく足元にも階段・アイテムがない場合、正面に向かって素振り（空振り攻撃）を実行！
        this.onAttack?.('player', fdx, fdy, '');
        SoundSystem.getInstance().playMiss(!!this.player.equippedWeapon);
        const swingName = this.player.equippedWeapon ? `${this.player.equippedWeapon.name}を素振りした` : '拳を素振りした';
        this.addLog(`正面へ${swingName}。手応えはない。`, 'normal');
        turnPassed = true;
        break;
      }

      case 'USE_ITEM': {
        const targetItem = this.player.inventory.find((it) => it.id === action.itemId);
        if (targetItem && targetItem.category === 'POT') {
          if ((targetItem.potCapacity ?? 0) <= 0) {
            this.addLog(`${targetItem.name} は満杯でこれ以上合成できない。`, 'warning');
            this.notify();
            return false;
          }
          this.onOpenSynthesis?.(targetItem);
          this.notify();
          return false;
        }

        const result = ItemSystem.useItem(this.player, this.map, action.itemId);
        if (result.success) {
          SoundSystem.getInstance().playHeal();
        }
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        if (result.success) {
          FOV.compute(this.map, { x: this.player.x, y: this.player.y });
        }
        break;
      }

      case 'DROP_ITEM': {
        const result = ItemSystem.dropItem(this.player, this.map, action.itemId);
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        break;
      }

      case 'SHOOT': {
        const result = ItemSystem.shootArrow(
          this.player,
          this.map,
          action.itemId,
          action.dx,
          action.dy
        );
        if (result.success) {
          SoundSystem.getInstance().playBowShoot();
          if (result.projectile?.hitMonsterId || result.projectile?.isHit) {
            SoundSystem.getInstance().playArrowHit();
          } else {
            SoundSystem.getInstance().playArrowHitWall();
          }
        }
        this.addLog(result.message, result.success ? 'info' : 'warning');
        if (result.projectile) {
          this.onProjectile?.(
            result.projectile.fromX,
            result.projectile.fromY,
            result.projectile.toX,
            result.projectile.toY,
            result.projectile.type,
            result.projectile.color
          );
        }
        turnPassed = result.success;
        break;
      }

      case 'ZAP_STAFF': {
        const staff = this.player.inventory.find((it) => it.id === action.itemId) || this.player.equippedStaff;
        const result = ItemSystem.zapStaff(
          this.player,
          this.map,
          action.itemId,
          action.dx,
          action.dy
        );
        if (result.success) {
          SoundSystem.getInstance().playZapStaff(staff?.name);
        }
        this.addLog(result.message, result.success ? 'info' : 'warning');
        if (result.projectile) {
          this.onProjectile?.(
            result.projectile.fromX,
            result.projectile.fromY,
            result.projectile.toX,
            result.projectile.toY,
            result.projectile.type,
            result.projectile.color
          );
        }
        turnPassed = result.success;
        break;
      }

      case 'THROW_ITEM': {
        const result = ItemSystem.throwItem(
          this.player,
          this.map,
          action.itemId,
          action.dx,
          action.dy
        );
        if (result.success) {
          SoundSystem.getInstance().playThrowItem();
          if (result.projectile?.hitMonsterId || result.projectile?.isHit) {
            SoundSystem.getInstance().playThrowHit();
          }
        }
        this.addLog(result.message, result.success ? 'info' : 'warning');
        if (result.projectile) {
          this.onProjectile?.(
            result.projectile.fromX,
            result.projectile.fromY,
            result.projectile.toX,
            result.projectile.toY,
            result.projectile.type,
            result.projectile.color
          );
        }
        turnPassed = result.success;
        break;
      }

      case 'DESCEND': {
        return this.descendFloor();
      }

      case 'RESTART': {
        this.startNewGame();
        return true;
      }

      case 'REGEN': {
        this.addLog('フロアを再生成した。', 'info');
        this.generateFloor(this.player.floor);
        return true;
      }

      case 'NPC_INTERACT': {
        const npc = this.map.monsters.find((m) => m.id === action.monsterId);
        if (!npc) {
          this.notify();
          return false;
        }

        if (action.action === 'TALK') {
          this.onNpcInteract?.(npc);
          this.notify();
          return false;
        } else if (action.action === 'TRADE_ACCEPT' && action.tradePlayerItemId) {
          const res = NpcSystem.executeTrade(this.player, npc, action.tradePlayerItemId);
          this.addLog(res.message, res.success ? 'turn-header' : 'warning');
          this.notify();
          return false;
        } else if (action.action === 'RPS_PLAY' && action.rpsChoice) {
          const res = NpcSystem.playRPS(this.player, action.rpsChoice);
          this.addLog(
            res.message,
            res.result === 'WIN' ? 'turn-header' : res.result === 'DRAW' ? 'normal' : 'damage'
          );
          this.notify();
          return false;
        } else if (action.action === 'FORGE_WEAPON') {
          const res = NpcSystem.forgeEquipment(this.player, npc, 'WEAPON');
          this.addLog(res.message, res.success ? 'turn-header' : 'warning');
          this.notify();
          return false;
        } else if (action.action === 'FORGE_SHIELD') {
          const res = NpcSystem.forgeEquipment(this.player, npc, 'SHIELD');
          this.addLog(res.message, res.success ? 'turn-header' : 'warning');
          this.notify();
          return false;
        }
        break;
      }

      case 'SYNTHESIZE': {
        const pId = action.potId || action.potItemId;
        const pot = this.player.inventory.find((it) => it.id === pId);
        const baseItem = this.player.inventory.find((it) => it.id === action.baseItemId);
        const materialItem = this.player.inventory.find((it) => it.id === action.materialItemId);

        if (!pot || !baseItem || !materialItem) {
          this.addLog('合成の対象アイテムが見つかりません。', 'warning');
          this.notify();
          return false;
        }

        const synResult = SynthesisSystem.synthesize(baseItem, materialItem, pot);
        if (!synResult.success) {
          this.addLog(synResult.message, 'warning');
          this.notify();
          return false;
        }

        // 素材アイテムをインベントリから消費・除外（装備中だった場合は装備解除）
        if (this.player.equippedWeapon?.id === materialItem.id) this.player.equippedWeapon = null;
        if (this.player.equippedShield?.id === materialItem.id) this.player.equippedShield = null;
        this.player.inventory = this.player.inventory.filter((it) => it.id !== materialItem.id);

        // 壺の容量を1消費
        pot.potCapacity = (pot.potCapacity ?? 1) - 1;

        // プレイヤー戦闘ステータス再計算（ベース装備を装備中なら更新）
        CombatSystem.updatePlayerStats(this.player);

        SoundSystem.getInstance().playHeal();
        this.addLog(synResult.message, 'turn-header');
        if (pot.potCapacity <= 0) {
          this.addLog(`${pot.name} は役目を終え、光の粒子となって砕け散った！`, 'warning');
          this.player.inventory = this.player.inventory.filter((it) => it.id !== pot.id);
        } else {
          this.addLog(`${pot.name} の残り容量は [${pot.potCapacity}] だ。`, 'info');
        }

        turnPassed = true;
        break;
      }
    }

    if (turnPassed) {
      this.endTurn();
    }

    this.notify();
    return turnPassed;
  }

  /**
   * ターン終了時の共通処理を実行します。
   * 敵モンスターの自律行動AI、ターン加算、満腹度減少、HP自然回復、視界更新、
   * および IndexedDB へのオートセーブ（死亡時はデータ削除＆ハイスコア記録）を行います。
   */
  private endTurn(): void {
    // 0. 未会計アイテムの泥棒チェック（店外にいるのに未会計品を所持している場合）
    if (
      !this.map.isThiefMode &&
      !ShopSystem.isInsideShop(this.player.x, this.player.y, this.map.shopRoom)
    ) {
      const bill = ShopSystem.calculateBill(this.player, this.map);
      if (bill.unpaidItems.length > 0) {
        const theftRes = ShopSystem.triggerTheft(this.player, this.map);
        SoundSystem.getInstance().playAlarm();
        this.addLog(theftRes.message, 'damage');
        this.onDamage?.('player');
      }
    }

    // 1. 敵モンスターの自律AI処理
    this.updateMonsters();

    if (!this.player.isAlive) {
      const reviveIdx = this.player.inventory.findIndex((it) => it.name.includes('復活の草'));
      if (reviveIdx !== -1) {
        this.player.inventory.splice(reviveIdx, 1);
        this.player.hp = this.player.maxHp;
        this.player.isAlive = true;
        SoundSystem.getInstance().playHeal();
        this.addLog(
          '力尽きて倒れた……だが、袋の中の【復活の草】が神々しい黄金の光を放ち、奇跡的に息を吹き返した！(HP全快)',
          'info'
        );
        this.notify();
        return;
      }

      const cause = this.lastDefeatCause || '力尽きて倒れてしまった';
      this.addLog(`あなたは${cause}…… (GAME OVER)`, 'damage');
      // 死亡時: パーマデス担保のためセーブデータを削除しハイスコアを保存
      StorageManager.clearCurrentRun();
      StorageManager.saveHighscore({
        floor: this.player.floor,
        level: this.player.level,
        turn: this.player.turn,
        score: GameEngine.calculateScore(
          this.player.floor,
          this.player.level,
          this.player.turn
        ),
        causeOfDeath: cause,
        timestamp: Date.now(),
      });
      this.notify();
      return;
    }

    this.player.turn += 1;

    // 倍速バフのターン経過
    if (this.player.speedTurns && this.player.speedTurns > 0) {
      this.player.speedTurns--;
      if (this.player.speedTurns === 0) {
        this.addLog('疾風の加護が解け、通常速度に戻った。', 'normal');
      }
    }

    // 2. 満腹度の減少（10ターンごとに1%減少）
    if (this.player.turn % 10 === 0 && this.player.hunger > 0) {
      this.player.hunger = Math.max(0, this.player.hunger - 1);
      if (this.player.hunger === 0) {
        this.addLog('空腹で目が眩んできた！(HPが減少し始めます)', 'warning');
      }
    }

    // 3. HPの自然回復（満腹度が残っている場合、5ターンごとに1回復）
    if (this.player.hunger > 0) {
      if (this.player.turn % 5 === 0 && this.player.hp < this.player.maxHp) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
      }
    } else {
      // 餓死スリップダメージ
      this.player.hp = Math.max(0, this.player.hp - 1);
      this.addLog('飢えにより体力を奪われている！', 'warning');
      if (this.player.hp <= 0) {
        this.player.isAlive = false;
        const cause = '飢えに耐えかねて力尽きた';
        this.lastDefeatCause = cause;
        this.addLog(`あなたは${cause}…… (GAME OVER)`, 'damage');
        StorageManager.clearCurrentRun();
        StorageManager.saveHighscore({
          floor: this.player.floor,
          level: this.player.level,
          turn: this.player.turn,
          score: GameEngine.calculateScore(
            this.player.floor,
            this.player.level,
            this.player.turn
          ),
          causeOfDeath: cause,
          timestamp: Date.now(),
        });
      }
    }

    // 4. 視界更新
    FOV.compute(this.map, { x: this.player.x, y: this.player.y });

    // 5. IndexedDB & localStorage へ1ターン自動セーブ
    if (this.player.isAlive) {
      this.saveGame();
    }
  }

  /**
   * 障害物とのインタラクション（攻撃による破壊、大石の押し出し、氷塊の滑走と敵直撃粉砕）を実行します。
   *
   * @param obstacle - 対象の障害物
   * @param dx - アクションX方向
   * @param dy - アクションY方向
   * @returns ターンが経過した場合は true
   */
  private interactWithObstacle(
    obstacle: Obstacle,
    dx: number,
    dy: number
  ): boolean {
    // 1. 滑る氷塊 (ICE_BLOCK)
    if (obstacle.isSliding) {
      this.addLog(`${obstacle.name} を力いっぱい蹴り出した！`, 'normal');
      this.onAttack?.('player', dx, dy, obstacle.id);
      SoundSystem.getInstance().playIceSlide();

      const startX = obstacle.x;
      const startY = obstacle.y;
      let curX = obstacle.x;
      let curY = obstacle.y;
      let hitMonster: Monster | undefined;
      let hitObstacle: Obstacle | undefined;
      let hitWall = false;

      // 一直線に滑走
      while (true) {
        const nextX = curX + dx;
        const nextY = curY + dy;

        // マップ外・壁・水路判定
        if (
          nextX < 0 ||
          nextX >= this.map.width ||
          nextY < 0 ||
          nextY >= this.map.height
        ) {
          hitWall = true;
          break;
        }

        const tile = this.map.tiles[nextY][nextX];
        if (tile === TileType.Wall || tile === TileType.Water) {
          hitWall = true;
          break;
        }

        // モンスター衝突判定
        hitMonster = this.map.monsters.find(
          (m) => m.x === nextX && m.y === nextY
        );
        if (hitMonster) {
          break;
        }

        // 他の障害物衝突判定
        hitObstacle = (this.map.obstacles || []).find(
          (o) => o.id !== obstacle.id && o.x === nextX && o.y === nextY
        );
        if (hitObstacle) {
          break;
        }

        curX = nextX;
        curY = nextY;
      }

      // 氷塊の滑走距離に応じた演出ロック時間を設定（秒速3.5マスで算出）
      const slideDist = Math.hypot(curX - startX, curY - startY);
      const slideDurationMs = Math.max(500, Math.round((slideDist / 3.5) * 1000) + 150);
      this.actionLockUntil = Date.now() + slideDurationMs;

      if (hitMonster) {
        // 衝突位置に座標を更新（破砕パーティクルが激突マスで発生するようにする）
        obstacle.x = hitMonster.x;
        obstacle.y = hitMonster.y;

        // 直撃を受けたモンスターはスタン（気絶・怯み・手前に歩いてこない）
        hitMonster.isStunned = true;
        if (hitMonster.isDormant) {
          hitMonster.isDormant = false;
        }

        // モンスターを奥へノックバック吹き飛ばし
        const behindX = hitMonster.x + dx;
        const behindY = hitMonster.y + dy;
        const isBehindBlocked =
          behindX < 0 ||
          behindX >= this.map.width ||
          behindY < 0 ||
          behindY >= this.map.height ||
          this.map.tiles[behindY][behindX] === TileType.Wall ||
          this.map.tiles[behindY][behindX] === TileType.Water ||
          this.map.monsters.some((m) => m.x === behindX && m.y === behindY) ||
          (this.map.obstacles || []).some((o) => o.x === behindX && o.y === behindY);

        let damage = 20;
        if (!isBehindBlocked) {
          hitMonster.x = behindX;
          hitMonster.y = behindY;
          this.addLog(
            `${obstacle.name} が ${hitMonster.name} に激突！ 20 の大ダメージを与えて吹き飛ばし、粉砕した！`,
            'damage'
          );
        } else {
          damage = 28; // 壁激突追加ダメージ
          this.addLog(
            `${obstacle.name} が ${hitMonster.name} を壁に叩きつけて激突！ 28 の大ダメージを与えて粉砕した！`,
            'damage'
          );
        }

        this.onDamage?.(hitMonster.id);
        SoundSystem.getInstance().playRockCrash();
        hitMonster.hp -= damage;

        // 氷塊は粉砕・消滅
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );

        if (hitMonster.hp <= 0) {
          this.addLog(
            `${hitMonster.name} を粉砕撃破した！ (${hitMonster.expValue} EXP獲得)`,
            'info'
          );
          this.player.exp += hitMonster.expValue;
          this.map.monsters = this.map.monsters.filter(
            (m) => m.id !== hitMonster.id
          );
          // レベルアップチェック
          const expNeeded = this.player.level * 15;
          if (this.player.exp >= expNeeded) {
            this.player.level += 1;
            this.player.exp -= expNeeded;
            this.player.maxHp += 5;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
            this.player.baseAtk += 2;
            this.player.baseDef += 1;
            this.addLog(
              `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
              'turn-header'
            );
          }
        }
        this.onObstacleBreak?.(obstacle);
        return true;
      } else if (hitObstacle) {
        SoundSystem.getInstance().playRockCrash();
        this.addLog(
          `${obstacle.name} が ${hitObstacle.name} に激突し、木っ端微塵に粉砕した！`,
          'normal'
        );
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        return true;
      } else if (hitWall) {
        SoundSystem.getInstance().playRockCrash();
        this.addLog(
          `${obstacle.name} が壁に激突し、ガラガラと粉砕した！`,
          'normal'
        );
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        return true;
      } else {
        obstacle.x = curX;
        obstacle.y = curY;
        return true;
      }
    }

    // 2. 押せる大石 (PUSH_ROCK)
    if (obstacle.isPushable) {
      obstacle.pushAttempts = (obstacle.pushAttempts || 0) + 1;
      this.onAttack?.('player', dx, dy, obstacle.id);

      // 1回目の試行: 肩を当てて力を込める
      if (obstacle.pushAttempts === 1) {
        this.onDamage?.(obstacle.id);
        SoundSystem.getInstance().playPushStrain();
        this.actionLockUntil = Date.now() + 450; // 0.45秒ロック
        this.addLog(
          `${obstacle.name} に全力で肩を当てて押した！……重くてビクともしないが、もう少し力を込めれば動きそうだ！`,
          'normal'
        );
        return true;
      }

      // 2回目（規定回数）: 大石の押し出し。基本的には2マス動く確率を最頻出（約65%）に設定
      const rand = Math.random();
      let targetMaxDist = 2; // 最頻値: 2マス
      if (rand < 0.20) {
        targetMaxDist = 1; // 20%: 1マス
      } else if (rand < 0.85) {
        targetMaxDist = 2; // 65%: 基本的に2マス
      } else if (rand < 0.97) {
        targetMaxDist = 3; // 12%: 3マス
      } else {
        targetMaxDist = 4; // 3%: 4マス
      }

      let curX = obstacle.x;
      let curY = obstacle.y;
      let movedDist = 0;
      let hitMonster: Monster | undefined;
      let monsterPinned = false; // 壁挟みフラグ

      while (movedDist < targetMaxDist) {
        const nextX = curX + dx;
        const nextY = curY + dy;

        // マップ外・壁・水路判定
        if (
          nextX < 0 ||
          nextX >= this.map.width ||
          nextY < 0 ||
          nextY >= this.map.height
        ) {
          break;
        }

        const tile = this.map.tiles[nextY][nextX];
        if (tile === TileType.Wall || tile === TileType.Water) {
          break;
        }

        // 他の障害物判定
        const hitOtherObstacle = (this.map.obstacles || []).find(
          (o) => o.id !== obstacle.id && o.x === nextX && o.y === nextY
        );
        if (hitOtherObstacle) {
          break;
        }

        // モンスター衝突判定
        hitMonster = this.map.monsters.find(
          (m) => m.x === nextX && m.y === nextY
        );
        if (hitMonster) {
          // モンスターの奥のマス (behindX, behindY) を判定
          const behindX = nextX + dx;
          const behindY = nextY + dy;

          const isBehindBlocked =
            behindX < 0 ||
            behindX >= this.map.width ||
            behindY < 0 ||
            behindY >= this.map.height ||
            this.map.tiles[behindY][behindX] === TileType.Wall ||
            this.map.tiles[behindY][behindX] === TileType.Water ||
            this.map.monsters.some((m) => m.x === behindX && m.y === behindY) ||
            (this.map.obstacles || []).some((o) => o.x === behindX && o.y === behindY);

          if (!isBehindBlocked) {
            // モンスターを奥のマスへノックバック吹き飛ばし！
            hitMonster.x = behindX;
            hitMonster.y = behindY;
            // 大石はモンスターが元いたマスへ前進！
            curX = nextX;
            curY = nextY;
            movedDist += 1;
            monsterPinned = false;
          } else {
            // モンスターの奥が壁などで塞がっている！
            // 大石はモンスターの手前マス (curX, curY) で停止し、壁と挟み撃ちにする！
            monsterPinned = true;
          }

          // 激突したため大石の移動はここで終了
          break;
        }

        curX = nextX;
        curY = nextY;
        movedDist += 1;
      }

      if (movedDist === 0 && !hitMonster) {
        this.addLog(`奥が塞がっていて ${obstacle.name} を押せない！`, 'warning');
        obstacle.pushAttempts = 0;
        return false;
      }

      obstacle.x = curX;
      obstacle.y = curY;
      obstacle.pushAttempts = 0;
      // 岩が画面上で目的マスに到着するまで入力を完全ロック（1マスあたり約750ms、2マスで約1500ms）
      this.actionLockUntil = Date.now() + Math.max(1450, Math.max(1, movedDist) * 750);
      SoundSystem.getInstance().playRockSlide(Math.max(0.4, movedDist * 0.35));
      this.onObstaclePush?.(obstacle, dx, dy);

      if (hitMonster) {
        // 直撃を受けたモンスターはスタン（気絶・怯み・手前に歩いてこない）
        hitMonster.isStunned = true;
        if (hitMonster.isDormant) {
          hitMonster.isDormant = false;
        }

        this.onDamage?.(hitMonster.id);
        SoundSystem.getInstance().playRockCrash();
        const damage = monsterPinned ? 20 : 12;
        hitMonster.hp -= damage;

        if (monsterPinned) {
          this.addLog(
            `ゴゴゴゴッ！ ${obstacle.name} が ${hitMonster.name} を壁に激しく押し潰した！ 20 の圧殺大ダメージ！`,
            'damage'
          );
        } else {
          this.addLog(
            `ゴゴゴゴッ！ ${obstacle.name} が重い地響きを立てて動き出し、${hitMonster.name} を奥へ吹き飛ばして 12 のダメージを与えた！（${movedDist}マス移動）`,
            'damage'
          );
        }

        if (hitMonster.hp <= 0) {
          this.addLog(
            `${hitMonster.name} を圧殺撃破した！ (${hitMonster.expValue} EXP獲得)`,
            'info'
          );
          this.player.exp += hitMonster.expValue;
          this.map.monsters = this.map.monsters.filter(
            (m) => m.id !== hitMonster!.id
          );
          const expNeeded = this.player.level * 15;
          if (this.player.exp >= expNeeded) {
            this.player.level += 1;
            this.player.exp -= expNeeded;
            this.player.maxHp += 5;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
            this.player.baseAtk += 2;
            this.player.baseDef += 1;
            this.addLog(
              `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
              'turn-header'
            );
          }
        }
      } else {
        this.addLog(
          `うおおおっ！ ゴゴゴゴッ……！ ${obstacle.name} が重い地響きを立てて奥へ ${movedDist} マス動いた！`,
          'normal'
        );
      }
      return true;
    }

    // 3. 攻撃で壊せる障害物 (DIRT_BLOCK, TREE_STUMP, SNOW_MOUND)
    if (obstacle.isDestructible) {
      obstacle.hp -= 1;
      this.onAttack?.('player', dx, dy, obstacle.id);
      this.onDamage?.(obstacle.id);

      if (obstacle.hp > 0) {
        SoundSystem.getInstance().playMonsterHit();
        this.addLog(
          `${obstacle.name} に一撃を加えた！（耐久度: ${obstacle.hp}/${obstacle.maxHp}）`,
          'damage'
        );
      } else {
        SoundSystem.getInstance().playBreakObstacle();
        this.addLog(`${obstacle.name} を粉砕して道を切り開いた！`, 'info');
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        // 20%の確率でアイテムドロップ
        if (Math.random() < 0.2) {
          this.map.items.push(EntityFactory.createRandomItem(obstacle.x, obstacle.y));
          this.addLog('崩れた破片の中からアイテムが現れた！', 'info');
        }
      }
      return true;
    }

    return false;
  }

  /**
   * プレイヤーが移動した先の床ギミック効果（氷の滑走、泥濘の足枷、毒沼の毒気、壊れかけの橋）を適用します。
   *
   * @param currentTile - 進入したタイル種別
   * @param dx - 進入X方向
   * @param dy - 進入Y方向
   * @returns 追加ターン消費（泥濘）が発生した場合は true
   */
  private handleTileGimmick(
    currentTile: TileType,
    dx: number,
    dy: number
  ): boolean {
    let extraTurn = false;

    // 1. 氷床（TileType.Ice）: 進行方向へスーッと滑走！
    if (currentTile === TileType.Ice && (dx !== 0 || dy !== 0)) {
      let curX = this.player.x;
      let curY = this.player.y;
      let slid = false;
      let hitWall = false;

      while (true) {
        const nextX = curX + dx;
        const nextY = curY + dy;
        if (
          nextX < 0 ||
          nextX >= this.map.width ||
          nextY < 0 ||
          nextY >= this.map.height
        ) {
          hitWall = true;
          break;
        }

        const nTile = this.map.tiles[nextY][nextX];
        if (nTile === TileType.Wall || nTile === TileType.Water) {
          hitWall = true;
          break;
        }
        if (this.map.monsters.some((m) => m.x === nextX && m.y === nextY)) {
          hitWall = true;
          break;
        }
        if (this.map.obstacles.some((o) => o.x === nextX && o.y === nextY)) {
          hitWall = true;
          break;
        }

        curX = nextX;
        curY = nextY;
        slid = true;

        // 次のマスが氷以外ならそこでストップ
        if (nTile !== TileType.Ice) {
          break;
        }
      }

      if (slid) {
        const slideSteps = Math.hypot(curX - this.player.x, curY - this.player.y);
        // 滑走にかかる時間: ユーザー要望「今の半分の時間で良かった」に基づき秒速3.0マスで算出（従来の半分の所要時間）
        let slideDurationMs = Math.max(500, Math.round((slideSteps / 3.0) * 1000) + 150);

        // まれに滑って転んで軽度ダメージを受ける（約18%の確率）
        const didFall = Math.random() < 0.18;
        let slipDamage = 0;
        if (didFall) {
          slipDamage = Math.floor(Math.random() * 3) + 2; // 2〜4ダメージ
          this.player.hp = Math.max(0, this.player.hp - slipDamage);
          slideDurationMs += 400; // 尻もちをついて立ち上がるまでのダウン時間

          if (this.player.hp <= 0) {
            this.player.isAlive = false;
            this.lastDefeatCause = '氷の床で派手に滑って転んで力尽きた';
          }
        }

        this.actionLockUntil = Date.now() + slideDurationMs;
        if (didFall) {
          SoundSystem.getInstance().playIceSlip();
        } else {
          SoundSystem.getInstance().playIceSlide();
        }
        this.onIceSlide?.(
          this.player.x,
          this.player.y,
          curX,
          curY,
          hitWall,
          slideDurationMs / 1000,
          didFall,
          slipDamage
        );
        this.player.x = curX;
        this.player.y = curY;

        if (didFall) {
          this.addLog(
            `おっとっと……！？ 氷で足を取られツーーーーッと滑走した！ ……ドテッ！！ 派手に尻もちをついて転んでしまった！ (${slipDamage} ダメージ)`,
            'warning'
          );
        } else {
          this.addLog(
            'おっとっと……！？ 氷で足を取られ、両手を激しくバタつかせながらツーーーーッと滑走した！',
            'normal'
          );
        }
      }
    }

    // 2. 泥濘床（TileType.Mud）: 足を取られターン消費増
    if (currentTile === TileType.Mud) {
      SoundSystem.getInstance().playSwampStuck();
      this.addLog('ズブズブ…！ 泥濘に足が深く沈み込み、余分な時間がかかってしまった！', 'warning');
      this.onSwampStuck?.(this.player.x, this.player.y);
      this.actionLockUntil = Math.max(this.actionLockUntil, Date.now() + 900); // 泥への沈み込みロック
      extraTurn = true;
    }

    // 3. 毒沼床（TileType.Poison）: 2の毒沼ダメージ
    if (currentTile === TileType.Poison) {
      const poisonDmg = 2;
      this.player.hp = Math.max(1, this.player.hp - poisonDmg);
      this.addLog(
        `毒沼の有毒ガスと腐蝕液で ${poisonDmg} のダメージを受けた！`,
        'damage'
      );
    }

    // 4. 壊れかけの木橋（TileType.BrokenBridge）: 軋む音
    if (currentTile === TileType.BrokenBridge) {
      this.addLog('ギシギシ…！ 壊れかけの木橋が音を立てて軋んだ！', 'warning');
    }

    return extraTurn;
  }

  /**
   * プレイヤーから指定モンスターへの攻撃を実行します。
   * ミミックの擬態解除、背後不意打ち判定、ダメージ付与、撃破・レベルアップ処理を行います。
   */
  private executePlayerAttack(monster: Monster, dx: number, dy: number): void {
    if (monster.type === 'SCOOTER_GUY') {
      this.talkToScooterGuy(monster);
      return;
    }

    if (monster.isDormant) {
      monster.isDormant = false;
      this.addLog(`${monster.name} が正体を現して目を覚ました！`, 'warning');
    }

    const isBack = this.isBackstabAttack(dx, dy, monster.direction);
    this.onAttack?.('player', dx, dy, monster.id);
    this.onDamage?.(monster.id);

    // 攻撃音再生（武器種別・素手パンチ・会心の一撃に応じた専用サウンド）
    SoundSystem.getInstance().playAttackByWeapon(this.player.equippedWeapon, isBack);

    const result = CombatSystem.playerAttack(this.player, monster, isBack);

    // 武器に刻まれた印の効果ログ出力
    if (result.runeEffects && result.runeEffects.length > 0) {
      for (const runeMsg of result.runeEffects) {
        this.addLog(runeMsg, 'turn-header');
      }
    }

    if (result.isBackstab) {
      this.addLog(
        `背後から不意打ち！ 会心の一撃！ ${monster.name} に ${result.damage} の大ダメージ！`,
        'turn-header'
      );
    } else {
      this.addLog(
        `${monster.name} に ${result.damage} のダメージを与えた！`,
        'damage'
      );
    }

    // 仲間モンスターを誤爆・攻撃した場合のペナルティ処理
    if (monster.isCompanion) {
      monster.companionAffection = Math.max(0, (monster.companionAffection ?? 1) - 30);
      if (monster.companionAffection <= 0) {
        monster.isCompanion = false;
        monster.isFriendly = false;
        this.addLog(
          `${monster.name} は信じていたあなたに裏切られ、怒りと悲しみで敵対した……！`,
          'warning'
        );
      } else {
        this.addLog(
          `${monster.name} は悲しそうに身を縮めて涙を浮かべた。（なかよし度低下: ${monster.companionAffection}）`,
          'warning'
        );
      }
    }

    if (result.isDefeated) {
      this.addLog(
        `${monster.name} を倒した！ (${result.expGained} EXP獲得)`,
        'info'
      );
      this.map.monsters = this.map.monsters.filter((m) => m.id !== monster.id);
      this.recordMonsterKill(monster);

      if (monster.type === 'ABYSS_LORD') {
        this.player.isGameCleared = true;
        this.addLog('★☆★ 地下50層 迷宮の支配者【奈落の魔王アビス・ロード】を討ち果たした！！ ★☆★', 'turn-header');
        this.addLog('深淵の迷宮に満ちていた瘴気が晴れ渡り、聖なる光が天より降り注ぐ……！', 'info');
        SoundSystem.getInstance().playLevelUp();
        this.saveGame();
        this.onGameClear?.();
      }

      if (result.didLevelUp) {
        SoundSystem.getInstance().playLevelUp();
        this.addLog(
          `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
          'turn-header'
        );
      }
    } else {
      // 生存時は肉弾ヒット音
      SoundSystem.getInstance().playMonsterHit();
    }
  }

  /**
   * 攻撃方向とモンスターの向きから、背後からの不意打ち攻撃かどうかを判定します。
   */
  private isBackstabAttack(
    atkDx: number,
    atkDy: number,
    monsterDir?: CardinalDirection
  ): boolean {
    if (!monsterDir) return false;
    const mVec = this.getDirectionVector(monsterDir);
    // 内積 > 0: 攻撃者の進行方向とモンスターの向いている方向が同方向（＝敵の背中側から切りかかった）
    return atkDx * mVec.x + atkDy * mVec.y > 0;
  }

  /**
   * 方向文字列から単位ベクトルを取得します。
   */
  private getDirectionVector(dir?: CardinalDirection): { x: number; y: number } {
    switch (dir) {
      case 'up': return { x: 0, y: -1 };
      case 'down': return { x: 0, y: 1 };
      case 'left': return { x: -1, y: 0 };
      case 'right': return { x: 1, y: 0 };
      case 'up_left': return { x: -1, y: -1 };
      case 'up_right': return { x: 1, y: -1 };
      case 'down_left': return { x: -1, y: 1 };
      case 'down_right': return { x: 1, y: 1 };
      default: return { x: 0, y: 1 };
    }
  }

  /**
   * 移動ベクトルから8方向の方位文字列を計算します。
   */
  private calcDirection(dx: number, dy: number): CardinalDirection {
    if (dx > 0 && dy > 0) return 'down_right';
    if (dx < 0 && dy > 0) return 'down_left';
    if (dx > 0 && dy < 0) return 'up_right';
    if (dx < 0 && dy < 0) return 'up_left';
    if (dx > 0) return 'right';
    if (dx < 0) return 'left';
    if (dy > 0) return 'down';
    return 'up';
  }

  /**
   * 2点間に壁や障害物のない射線が通っているか検査します。
   */
  private hasClearLineOfSight(
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): boolean {
    const stepX = Math.sign(x1 - x0);
    const stepY = Math.sign(y1 - y0);
    let cx = x0 + stepX;
    let cy = y0 + stepY;

    while (cx !== x1 || cy !== y1) {
      if (cx < 0 || cx >= this.map.width || cy < 0 || cy >= this.map.height) {
        return false;
      }
      const tile = this.map.tiles[cy][cx];
      if (tile === TileType.Wall) return false;
      if (this.map.obstacles?.some((o) => o.x === cx && o.y === cy)) return false;
      cx += stepX;
      cy += stepY;
    }
    return true;
  }

  /**
   * 店主NPCに接触または正面から話しかけた際の統合インタラクション処理。
   * 会計、冷やかし警告、お仕置きビンタ（ダメージ＋ノックバック）、シャッター強制閉店を処理します。
   */
  private handleShopkeeperInteraction(
    merchant: Monster,
    dirX: number,
    dirY: number
  ): void {
    const res = ShopSystem.handleTalkToShopkeeper(
      this.player,
      this.map,
      merchant,
      { dx: dirX, dy: dirY }
    );

    if (res.actionTaken === 'slap') {
      SoundSystem.getInstance().playSlap();
      this.onDamage?.('player');
      const damage = res.slapDamage ?? 8;
      this.player.hp = Math.max(1, this.player.hp - damage);

      // ノックバック処理（後ろのマスが空いていれば1マス後退）
      if (res.knockbackDir) {
        const kx = this.player.x + res.knockbackDir.dx;
        const ky = this.player.y + res.knockbackDir.dy;
        if (
          kx >= 0 &&
          kx < this.map.width &&
          ky >= 0 &&
          ky < this.map.height &&
          this.map.tiles[ky][kx] !== TileType.Wall &&
          !(this.map.obstacles || []).some((o) => o.x === kx && o.y === ky) &&
          !this.map.monsters.some((m) => m.x === kx && m.y === ky)
        ) {
          this.player.x = kx;
          this.player.y = ky;
        }
      }
    } else if (res.actionTaken === 'close_shop') {
      SoundSystem.getInstance().playShutterClose();
    }

    this.addLog(res.message, res.type);
    this.notify();
  }

  /**
   * スクーターおじさんに接触・話しかけた時の呑気な日常会話処理。
   */
  private talkToScooterGuy(_monster: Monster): void {
    SoundSystem.getInstance().playScooterHorn();
    const quotes = [
      'スクーターおじさん「おっと危ないよ若者！ 一時停止はちゃんと左右確認しなきゃダメだよ！」',
      'スクーターおじさん「ちょっとそこ通るよ〜。駅前のスーパーが特売日でねぇ。」',
      'スクーターおじさん「このダンジョン、一方通行の標識が見当たらないんだよねぇ。」',
      'スクーターおじさん「ヘルメットのあご紐はしっかり締めなきゃ危ないよ！」',
      'スクーターおじさん「夕飯のカレーのルーを買い忘れてね、急いでるんだ。」',
      'スクーターおじさん「スクーターは燃費が良くて助かるよ。リッター50キロは走るからね。」',
      'スクーターおじさん「制限速度は30km/h厳守！ 安全運転第一だよ！」',
      'スクーターおじさん「あおり運転は道路交通法違反だよ！ 車間距離を保ってね！」',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.addLog(quote, 'turn-header');
  }

  /**
   * 仲間モンスターとの触れ合いおよび位置入れ替え（スワップ）処理を実行します。
   * 通路でのスタック事故を防ぐため、プレイヤーとモンスターの位置を相互に入れ替えます。
   * なかよし度の加算、確率によるプレイヤーのHP癒やし回復を行います。
   *
   * @param companion - 対象の仲間モンスター
   */
  private interactWithCompanion(companion: Monster): void {
    // 1. 位置スワップ
    const oldPx = this.player.x;
    const oldPy = this.player.y;
    this.player.x = companion.x;
    this.player.y = companion.y;
    companion.x = oldPx;
    companion.y = oldPy;

    // 2. なかよし度の加算
    companion.companionAffection = Math.min(100, (companion.companionAffection ?? 1) + 1);
    const affection = companion.companionAffection;

    const petSounds = ['「きゅいっ💖」', '「ぷにっ✨」', '「ぐるるん♪」', '「わふっ💕」'];
    const randomPetSound = petSounds[Math.floor(Math.random() * petSounds.length)];

    // なかよし度に応じた回復判定（30%〜50%）
    const healChance = 0.3 + Math.min(0.2, affection * 0.005);
    const canHeal = this.player.hp < this.player.maxHp && Math.random() < healChance;

    if (canHeal) {
      const healAmount = Math.floor(Math.random() * 4) + 3; // 3〜6回復
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      SoundSystem.getInstance().playHeal();
      this.addLog(
        `${companion.name} と位置を入れ替えた。${randomPetSound} 擦り寄って癒やしてくれた！（HPが ${healAmount} 回復 / なかよし度: ${affection}）`,
        'info'
      );
    } else {
      SoundSystem.getInstance().playPickup();
      this.addLog(
        `${companion.name} と位置を入れ替えた。${randomPetSound} 嬉しそうに微笑みかけてくれた。（なかよし度: ${affection}）`,
        'normal'
      );
    }

    FOV.compute(this.map, { x: this.player.x, y: this.player.y });
    this.notify();
  }

  /**
   * 階段を降りて次の深層フロアへ進みます。
   * 泥棒モードの解除精算、フロア生成、および生存している仲間モンスターの同伴連行を行います。
   *
   * @returns 階段降下に成功したかどうかの真偽値
   */
  private descendFloor(): boolean {
    const currentTile = this.map.tiles[this.player.y][this.player.x];
    if (currentTile !== TileType.StairsDown) {
      this.addLog('ここには降りる階段がない。', 'warning');
      this.notify();
      return false;
    }

    SoundSystem.getInstance().playStairs();
    if (this.map.isThiefMode) {
      this.addLog(
        '泥棒大成功！！ 店主と番犬の猛追撃を振り切り、商品を無事に手に入れた！',
        'turn-header'
      );
      for (const item of this.player.inventory) {
        delete item.isShopItem;
      }
    }

    // 生存している仲間モンスターを退避
    const companion = this.map.monsters.find((m) => m.isCompanion && m.hp > 0);

    this.player.floor += 1;
    this.player.turn += 1;
    const nextBiome = DungeonGenerator.getBiomeForFloor(this.player.floor);
    this.addLog(
      `階段を降り、地下 ${this.player.floor} 階【${nextBiome.name}】へ進んだ。`,
      'info'
    );
    this.generateFloor(this.player.floor);

    // 仲間モンスターを新フロアのプレイヤー隣接空きマスに配置
    if (companion) {
      const candidateOffsets = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
      ];
      let placed = false;
      for (const offset of candidateOffsets) {
        const cx = this.player.x + offset.dx;
        const cy = this.player.y + offset.dy;
        if (
          cx >= 0 && cx < this.map.width && cy >= 0 && cy < this.map.height &&
          this.map.tiles[cy][cx] !== TileType.Wall &&
          this.map.tiles[cy][cx] !== TileType.Water &&
          !this.map.monsters.some((m) => m.x === cx && m.y === cy)
        ) {
          companion.x = cx;
          companion.y = cy;
          this.map.monsters.push(companion);
          placed = true;
          break;
        }
      }
      if (placed) {
        this.addLog(
          `仲間モンスター【${companion.name}】も一緒に階段を駆け下りてきた！`,
          'turn-header'
        );
      }
    }

    return true;
  }


  /**
   * マップ上の生存モンスター全員の自律AI（索敵・追跡・近接＆中距離攻撃）を実行します。
   */
  private updateMonsters(): void {
    // プレイヤーが既に死亡している場合は一切のモンスター行動・攻撃を実行しない
    if (!this.player.isAlive) {
      return;
    }

    const playerPos = { x: this.player.x, y: this.player.y };

    for (const monster of this.map.monsters) {
      // ターン中の攻撃でプレイヤーが死亡した場合は即座に完全中断し、後続モンスターは攻撃しない
      if (!this.player.isAlive) {
        return;
      }

      // 0-A. 金縛り中のモンスターは完全に行動不能
      if (monster.isParalyzed) {
        continue;
      }

      // 0-B. 睡眠中のモンスターはターン経過で目を覚ますまで行動不能
      if (monster.sleepTurns && monster.sleepTurns > 0) {
        monster.sleepTurns--;
        continue;
      }

      // 0-C. 混乱中のモンスターはランダム行動
      if (monster.confuseTurns && monster.confuseTurns > 0) {
        monster.confuseTurns--;
        const dirs = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
          { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
        ];
        const rDir = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = monster.x + rDir.dx;
        const ny = monster.y + rDir.dy;
        if (
          nx >= 0 && nx < this.map.width && ny >= 0 && ny < this.map.height &&
          this.map.tiles[ny][nx] !== TileType.Wall
        ) {
          if (nx === playerPos.x && ny === playerPos.y) {
            this.onAttack?.(monster.id, rDir.dx, rDir.dy, 'player');
            this.onDamage?.('player');
            SoundSystem.getInstance().playPlayerHit();
            const combat = CombatSystem.monsterAttack(monster, this.player);
            this.addLog(
              `${monster.name} は混乱して突進してきた！ あなたは ${combat.damage} のダメージを受けた！`,
              'damage'
            );
          } else if (!this.map.monsters.some((m) => m !== monster && m.x === nx && m.y === ny)) {
            monster.x = nx;
            monster.y = ny;
          }
        }
        continue;
      }

      // 0-D. 大石や氷塊の直撃でスタン（気絶・怯み）中のモンスターは行動不能（1ターン行動スキップ）
      if (monster.isStunned) {
        monster.isStunned = false;
        continue;
      }

      // 1. 擬態・休眠中のミミック（MIMIC）は刺激されるまで動かない（封印されていなければ）
      if (monster.isDormant && !monster.isSealed) {
        continue;
      }

      // 1.5. 平時の中立店主NPCはプレイヤーを攻撃せず待機
      if (monster.isFriendly && monster.isShopkeeper) {
        continue;
      }

      // 1.6. レア中立NPC（レオン、ガンジ、バルカン）はプレイヤーを攻撃しない
      if (monster.isRareNpc) {
        continue;
      }

      // 1.65. 極稀な仲良し仲間モンスター (isCompanion) の援護＆癒やしAI
      if (monster.isCompanion) {
        // A. 5マス以内の敵モンスターを索敵
        const nearbyEnemies = this.map.monsters.filter(
          (m) =>
            m !== monster &&
            !m.isCompanion &&
            !m.isFriendly &&
            m.type !== 'SCOOTER_GUY' &&
            Math.max(Math.abs(m.x - monster.x), Math.abs(m.y - monster.y)) <= 5
        );

        if (nearbyEnemies.length > 0) {
          // 最も近い敵モンスターを選択
          nearbyEnemies.sort((a, b) => {
            const distA = Math.max(Math.abs(a.x - monster.x), Math.abs(a.y - monster.y));
            const distB = Math.max(Math.abs(b.x - monster.x), Math.abs(b.y - monster.y));
            return distA - distB;
          });
          const targetEnemy = nearbyEnemies[0];
          const distToEnemy = Math.max(
            Math.abs(targetEnemy.x - monster.x),
            Math.abs(targetEnemy.y - monster.y)
          );

          if (distToEnemy <= 1) {
            // 敵に隣接しているなら援護攻撃！
            const edx = targetEnemy.x - monster.x;
            const edy = targetEnemy.y - monster.y;
            monster.direction = this.calcDirection(edx, edy);
            this.onAttack?.(monster.id, edx, edy, targetEnemy.id);
            this.onDamage?.(targetEnemy.id);
            SoundSystem.getInstance().playAttack();
            SoundSystem.getInstance().playMonsterHit();

            const cResult = CombatSystem.companionAttack(monster, targetEnemy);
            this.addLog(
              `仲間モンスター【${monster.name}】の勇敢な攻撃！ ${targetEnemy.name} に ${cResult.damage} のダメージ！`,
              'turn-header'
            );

            if (cResult.isDefeated) {
              this.addLog(
                `仲間モンスター【${monster.name}】が ${targetEnemy.name} を討ち取った！ (${targetEnemy.expValue} EXP獲得)`,
                'info'
              );
              this.player.exp += targetEnemy.expValue;
              if (CombatSystem.checkLevelUp(this.player)) {
                SoundSystem.getInstance().playLevelUp();
                this.addLog(
                  `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
                  'turn-header'
                );
              }
              this.map.monsters = this.map.monsters.filter((m) => m.id !== targetEnemy.id);
            }
            continue;
          } else {
            // 敵モンスターへ向かって1歩接近移動
            const nextStep = Pathfinding.getNextStep(
              this.map,
              { x: monster.x, y: monster.y },
              { x: targetEnemy.x, y: targetEnemy.y }
            );
            if (
              nextStep &&
              !(nextStep.x === playerPos.x && nextStep.y === playerPos.y) &&
              !this.map.monsters.some((m) => m !== monster && m.x === nextStep.x && m.y === nextStep.y)
            ) {
              monster.direction = this.calcDirection(nextStep.x - monster.x, nextStep.y - monster.y);
              monster.x = nextStep.x;
              monster.y = nextStep.y;
            }
            continue;
          }
        }

        // B. 周囲に敵がいない場合はプレイヤーへ追従または触れ合い応援
        const distToPlayer = Math.max(
          Math.abs(monster.x - playerPos.x),
          Math.abs(monster.y - playerPos.y)
        );

        if (distToPlayer <= 1) {
          // プレイヤーに隣接: 一定確率でHP回復応援
          const healChance = 0.25 + Math.min(0.2, (monster.companionAffection ?? 1) * 0.005);
          if (this.player.hp < this.player.maxHp && Math.random() < healChance) {
            const healVal = Math.floor(Math.random() * 3) + 3; // 3〜5回復
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + healVal);
            SoundSystem.getInstance().playHeal();
            this.addLog(
              `仲間モンスター【${monster.name}】は一生懸命に応援してくれた！ HPが ${healVal} 回復した♪`,
              'info'
            );
          }
        } else {
          // プレイヤーに向かって追従移動
          const nextStep = Pathfinding.getNextStep(
            this.map,
            { x: monster.x, y: monster.y },
            playerPos
          );
          if (
            nextStep &&
            !(nextStep.x === playerPos.x && nextStep.y === playerPos.y) &&
            !this.map.monsters.some((m) => m !== monster && m.x === nextStep.x && m.y === nextStep.y)
          ) {
            monster.direction = this.calcDirection(nextStep.x - monster.x, nextStep.y - monster.y);
            monster.x = nextStep.x;
            monster.y = nextStep.y;
          }
        }
        continue;
      }

      // 1.7. 慈愛の妖精ピクシー（敵なのに回復してくれる）のおせっかいAI
      if (monster.type === 'HEALING_FAIRY') {
        const fairyMsg = NpcSystem.processHealingFairyTurn(
          monster,
          this.player,
          this.map.monsters
        );
        if (fairyMsg) {
          this.addLog(fairyMsg, 'info');
        }
        // ピクシーはプレイヤーにふわりと近寄るが攻撃はしない
        const distToPlayer = Math.max(
          Math.abs(monster.x - playerPos.x),
          Math.abs(monster.y - playerPos.y)
        );
        if (distToPlayer > 1) {
          const nextStep = Pathfinding.getNextStep(
            this.map,
            { x: monster.x, y: monster.y },
            playerPos
          );
          if (
            nextStep &&
            !this.map.monsters.some((m) => m !== monster && m.x === nextStep.x && m.y === nextStep.y) &&
            !(nextStep.x === playerPos.x && nextStep.y === playerPos.y)
          ) {
            monster.x = nextStep.x;
            monster.y = nextStep.y;
          }
        }
        continue;
      }

      // 1.8. スクーターおじさん (SCOOTER_GUY) の横断・疾走AI
      if (monster.type === 'SCOOTER_GUY' && monster.scooterData) {
        monster.scooterData.despawnTurns--;

        const distToPlayer = Math.hypot(monster.x - playerPos.x, monster.y - playerPos.y);

        // プレイヤーの視界内または近接時（距離8以内）にエンジン音が軽快に鳴る
        if (distToPlayer <= 8) {
          monster.scooterData.engineSoundTimer = (monster.scooterData.engineSoundTimer ?? 0) + 1;
          if (monster.scooterData.engineSoundTimer % 2 === 1) {
            SoundSystem.getInstance().playScooterEngine();
          }
        }

        // デスポーン判定（目標地点に到着、または滞在猶予ターン消化）
        if (
          monster.scooterData.despawnTurns <= 0 ||
          (monster.x === monster.scooterData.targetX && monster.y === monster.scooterData.targetY)
        ) {
          if (distToPlayer <= 8) {
            this.addLog('スクーターおじさん「じゃあね〜！ 安全運転でね〜！」ブルルンと走り去っていった。', 'info');
            SoundSystem.getInstance().playScooterHorn();
          }
          this.map.monsters = this.map.monsters.filter((m) => m !== monster);
          continue;
        }

        // 最短経路で目標地点へ向かって走行
        const nextStep = Pathfinding.getNextStep(
          this.map,
          { x: monster.x, y: monster.y },
          { x: monster.scooterData.targetX, y: monster.scooterData.targetY }
        );

        if (nextStep) {
          if (nextStep.x === playerPos.x && nextStep.y === playerPos.y) {
            SoundSystem.getInstance().playScooterHorn();
            this.addLog('スクーターおじさん「おっと危ない！ ぶつかるところだったよ！」', 'normal');
          } else {
            const mdx = nextStep.x - monster.x;
            const mdy = nextStep.y - monster.y;
            monster.direction = this.calcDirection(mdx, mdy);
            monster.x = nextStep.x;
            monster.y = nextStep.y;

            // 他のモンスターと鉢合わせた場合、そのモンスターが驚いて1マス避ける
            const otherM = this.map.monsters.find(
              (m) => m !== monster && m.x === nextStep.x && m.y === nextStep.y
            );
            if (otherM) {
              const freeDirs = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
              ];
              for (const fd of freeDirs) {
                const ox = otherM.x + fd.dx;
                const oy = otherM.y + fd.dy;
                if (
                  ox >= 0 && ox < this.map.width && oy >= 0 && oy < this.map.height &&
                  this.map.tiles[oy][ox] !== TileType.Wall &&
                  !this.map.monsters.some((m) => m.x === ox && m.y === oy)
                ) {
                  otherM.x = ox;
                  otherM.y = oy;
                  break;
                }
              }
            }
          }
        } else {
          monster.scooterData.despawnTurns -= 2;
        }

        continue;
      }

      // 2. 鈍重モンスター（isSlow）は2ターンに1回しか行動しない
      if (monster.isSlow && this.player.turn % 2 !== 0) {
        continue;
      }

      const isPlayerVisible = this.map.visible[monster.y][monster.x];
      const distToPlayer = Math.max(
        Math.abs(monster.x - playerPos.x),
        Math.abs(monster.y - playerPos.y)
      );

      // 2.5. メタルスライム（metal_slime）は好戦的でなく、プレイヤーから遠ざかるように素早く逃走する
      if (monster.variantId === 'metal_slime') {
        const awayDirs = [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
          { dx: 1, dy: 1 }, { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 },
        ];
        let bestDir: { dx: number; dy: number } | null = null;
        let maxDist = distToPlayer;
        for (const dir of awayDirs) {
          const nx = monster.x + dir.dx;
          const ny = monster.y + dir.dy;
          if (
            nx >= 0 && nx < this.map.width && ny >= 0 && ny < this.map.height &&
            this.map.tiles[ny][nx] !== TileType.Wall &&
            this.map.tiles[ny][nx] !== TileType.Water &&
            !(nx === playerPos.x && ny === playerPos.y) &&
            !this.map.monsters.some((m) => m !== monster && m.x === nx && m.y === ny)
          ) {
            const d = Math.max(Math.abs(nx - playerPos.x), Math.abs(ny - playerPos.y));
            if (d > maxDist) {
              maxDist = d;
              bestDir = dir;
            }
          }
        }
        if (bestDir) {
          monster.direction = this.calcDirection(bestDir.dx, bestDir.dy);
          monster.x += bestDir.dx;
          monster.y += bestDir.dy;
        }
        continue;
      }

      // 3. 隣接（距離1）している場合は近接攻撃
      if (distToPlayer <= 1) {
        const dx = playerPos.x - monster.x;
        const dy = playerPos.y - monster.y;
        monster.direction = this.calcDirection(dx, dy);

        this.onAttack?.(monster.id, dx, dy, 'player');
        const combat = CombatSystem.monsterAttack(monster, this.player);

        if (combat.isEvaded) {
          SoundSystem.getInstance().playMiss();
          this.addLog(
            `${monster.name} の攻撃！ だが【見】見切りの盾が直撃を完全に見切って躱した！`,
            'info'
          );
          continue;
        }

        this.onDamage?.('player');
        SoundSystem.getInstance().playPlayerHit();

        // 盾の印（竜耐性・絶対防壁等）の効果ログ
        if (combat.runeEffects && combat.runeEffects.length > 0) {
          for (const runeMsg of combat.runeEffects) {
            this.addLog(runeMsg, 'info');
          }
        }

        this.addLog(
          `${monster.name} の攻撃！ あなたは ${combat.damage} のダメージを受けた！`,
          'damage'
        );
        if (!this.player.isAlive) {
          const reviveIdx = this.player.inventory.findIndex((it) => it.name.includes('復活の草'));
          if (reviveIdx !== -1) {
            this.player.inventory.splice(reviveIdx, 1);
            this.player.hp = this.player.maxHp;
            this.player.isAlive = true;
            SoundSystem.getInstance().playHeal();
            this.addLog(
              '力尽きて倒れた……だが、袋の中の【復活の草】が神々しい黄金の光を放ち、奇跡的に息を吹き返した！(HP全快)',
              'info'
            );
          } else {
            SoundSystem.getInstance().playDefeat();
            this.lastDefeatCause = `${monster.name} の攻撃により力尽きた`;
            return; // 死亡確定時は即座に全モンスターの行動を完全終了！
          }
        } else {
          // プレイヤー生存時: 色違い・上位種モンスターの固有追加効果
          if (monster.variantId === 'poison_skeleton' && Math.random() < 0.45) {
            const poisonExtra = 3;
            this.player.hp = Math.max(1, this.player.hp - poisonExtra);
            this.addLog(
              `【猛毒浸食】ポイズンスケルトンの毒針が肉体を蝕み、追加で ${poisonExtra} の毒ダメージを受けた！`,
              'damage'
            );
          } else if (monster.variantId === 'chaos_bat' && Math.random() < 0.40) {
            const randomDirections: CardinalDirection[] = [
              'up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right',
            ];
            this.player.direction =
              randomDirections[Math.floor(Math.random() * randomDirections.length)];
            this.addLog(
              `【超音波乱流】カオスバットの怪音波を浴びて平衡感覚が狂い、向きを強制転換された！`,
              'warning'
            );
          } else if (monster.variantId === 'blood_skeleton') {
            const lifesteal = Math.max(1, Math.floor(combat.damage * 0.4));
            monster.hp = Math.min(monster.maxHp, monster.hp + lifesteal);
            this.addLog(
              `【吸血再生】ブラッドスケルトンは吸血の魔力で自身のHPを ${lifesteal} 回復した！`,
              'warning'
            );
          }
        }
        continue;
      }

      // 3.5. 泥棒モード中の激怒店主による遠隔追撃
      if (
        monster.isAngryMerchant &&
        this.map.isThiefMode &&
        distToPlayer >= 2 &&
        distToPlayer <= 5 &&
        isPlayerVisible
      ) {
        const dx = playerPos.x - monster.x;
        const dy = playerPos.y - monster.y;
        const isLine = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
        if (
          isLine &&
          this.hasClearLineOfSight(monster.x, monster.y, playerPos.x, playerPos.y)
        ) {
          const theftAtk = ShopSystem.checkAndExecuteRangedTheftAttack(
            monster,
            this.player,
            this.map,
            true
          );
          if (theftAtk && theftAtk.executed) {
            monster.direction = this.calcDirection(dx, dy);

            // 飛翔体エフェクト発動
            this.onProjectile?.(
              monster.x,
              monster.y,
              playerPos.x,
              playerPos.y,
              theftAtk.projectileType,
              theftAtk.color
            );

            // サウンド再生
            if (theftAtk.soundType === 'thunder') {
              SoundSystem.getInstance().playThunder();
            } else if (theftAtk.soundType === 'slash') {
              SoundSystem.getInstance().playSwordAttack();
            } else if (theftAtk.soundType === 'hammer') {
              SoundSystem.getInstance().playHammerAttack();
            } else {
              SoundSystem.getInstance().playThrowItem();
            }

            this.onDamage?.('player');
            SoundSystem.getInstance().playPlayerHit();

            let finalDamage = theftAtk.damage;
            // 盾の印による軽減（魔法・雷撃）
            const shieldRunes = this.player.equippedShield?.runes ?? [];
            if (
              theftAtk.soundType === 'thunder' &&
              shieldRunes.includes('MAGIC_RESIST')
            ) {
              finalDamage = Math.max(1, Math.floor(finalDamage * 0.5));
              this.addLog('【魔】魔法の盾が雷撃魔弾を半減した！', 'info');
            }

            this.player.hp = Math.max(0, this.player.hp - finalDamage);
            this.addLog(
              `${theftAtk.message} あなたは ${finalDamage} のダメージを受けた！`,
              'damage'
            );

            if (this.player.hp <= 0) {
              const reviveIdx = this.player.inventory.findIndex((it) =>
                it.name.includes('復活の草')
              );
              if (reviveIdx !== -1) {
                this.player.inventory.splice(reviveIdx, 1);
                this.player.hp = this.player.maxHp;
                this.player.isAlive = true;
                SoundSystem.getInstance().playHeal();
                this.addLog(
                  '力尽きて倒れた……だが、袋の中の【復活の草】が神々しい黄金の光を放ち、奇跡的に息を吹き返した！(HP全快)',
                  'info'
                );
              } else {
                this.player.isAlive = false;
                SoundSystem.getInstance().playDefeat();
                this.lastDefeatCause = `${monster.name} の【${theftAtk.attackName}】により力尽きた`;
                return; // 死亡確定時は即座に全モンスターの行動を完全終了！
              }
            }
            continue;
          }
        }
      }

      // 4. 中距離遠隔攻撃（メイジ、インプ等）: 距離2〜3マスで射線が通る場合（封印されていない場合）
      if (
        monster.hasRangedAttack &&
        !monster.isSealed &&
        distToPlayer >= 2 &&
        distToPlayer <= 3 &&
        isPlayerVisible
      ) {
        const dx = playerPos.x - monster.x;
        const dy = playerPos.y - monster.y;
        const isLine = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
        if (
          isLine &&
          this.hasClearLineOfSight(monster.x, monster.y, playerPos.x, playerPos.y)
        ) {
          monster.direction = this.calcDirection(dx, dy);
          const stepX = Math.sign(dx);
          const stepY = Math.sign(dy);
          this.onAttack?.(monster.id, stepX, stepY, 'player');
          this.onDamage?.('player');
          SoundSystem.getInstance().playPlayerHit();

          let rangedDamage = Math.max(
            2,
            Math.round(monster.atk * 0.85 + Math.random() * 3)
          );

          // 盾の印による属性軽減判定
          const shieldRunes = this.player.equippedShield?.runes ?? [];
          if (monster.rangedAttackType === 'fire' && shieldRunes.includes('DRAGON_RESIST')) {
            rangedDamage = Math.max(1, Math.floor(rangedDamage * 0.5));
            this.addLog('【竜耐】竜鱗の盾が灼熱の火炎を半減した！', 'info');
          } else if (shieldRunes.includes('MAGIC_RESIST')) {
            rangedDamage = Math.max(1, Math.floor(rangedDamage * 0.5));
            this.addLog('【魔】魔法の盾が魔弾を半減した！', 'info');
          }

          this.player.hp = Math.max(0, this.player.hp - rangedDamage);

          if (monster.rangedAttackType === 'fire') {
            this.addLog(
              `${monster.name} が火の玉を放った！ あなたは ${rangedDamage} の炎ダメージを受けた！`,
              'damage'
            );
          } else {
            this.addLog(
              `${monster.name} が魔力を詠唱し魔弾を放った！ あなたは ${rangedDamage} の魔法ダメージを受けた！`,
              'damage'
            );
          }

          if (this.player.hp <= 0) {
            const reviveIdx = this.player.inventory.findIndex((it) => it.name.includes('復活の草'));
            if (reviveIdx !== -1) {
              this.player.inventory.splice(reviveIdx, 1);
              this.player.hp = this.player.maxHp;
              this.player.isAlive = true;
              SoundSystem.getInstance().playHeal();
              this.addLog(
                '力尽きて倒れた……だが、袋の中の【復活の草】が神々しい黄金の光を放ち、奇跡的に息を吹き返した！(HP全快)',
                'info'
              );
            } else {
              this.player.isAlive = false;
              SoundSystem.getInstance().playDefeat();
              this.lastDefeatCause = `${monster.name} の遠隔攻撃により力尽きた`;
              return; // 死亡確定時は即座に全モンスターの行動を完全終了！
            }
          }
          continue;
        }
      }

      // 5. 索敵・接近（視界内）
      if (isPlayerVisible) {
        // 背後死角を持つアホな敵（GOBLIN等）：プレイヤーが真後ろにいる場合は気付かない
        if (monster.hasBackBlindSpot && monster.direction) {
          const dxToPlayer = playerPos.x - monster.x;
          const dyToPlayer = playerPos.y - monster.y;
          const facingVec = this.getDirectionVector(monster.direction);
          const dot = dxToPlayer * facingVec.x + dyToPlayer * facingVec.y;
          if (dot < 0) {
            // 背後にいるためプレイヤーを発見できない
            continue;
          }
        }

        const blockers = [
          ...this.map.monsters
            .filter((m) => m.id !== monster.id)
            .map((m) => ({ x: m.x, y: m.y })),
          ...(this.map.obstacles || []).map((o) => ({ x: o.x, y: o.y })),
        ];

        const nextStep = Pathfinding.getNextStep(
          this.map,
          { x: monster.x, y: monster.y },
          playerPos,
          blockers
        );

        if (nextStep) {
          const dx = nextStep.x - monster.x;
          const dy = nextStep.y - monster.y;
          monster.direction = this.calcDirection(dx, dy);
          monster.x = nextStep.x;
          monster.y = nextStep.y;
        }
      }
    }

    // 6. 泥棒モード中の番犬追加召喚処理
    if (this.map.isThiefMode) {
      const newDog = ShopSystem.processThiefTurn(this.map, this.player.turn);
      if (newDog) {
        this.addLog('「ウォォン……！」 泥棒を追って増援の番犬が駆けつけた！', 'warning');
      }
    }
  }

  /**
   * 行動ログを新しく追加します。最新の30件まで保持されます。
   *
   * @param text - ログ本文
   * @param type - ログ種別（UI装飾用: normal, info, warning, damage, turn-header）
   */
  public addLog(
    text: string,
    type: 'normal' | 'info' | 'warning' | 'damage' | 'turn-header' = 'normal'
  ): void {
    this.logs.unshift({
      id: `${++this.logIdCounter}`,
      turn: this.player.turn,
      text,
      type,
    });
    if (this.logs.length > 30) {
      this.logs.pop();
    }
  }
}
