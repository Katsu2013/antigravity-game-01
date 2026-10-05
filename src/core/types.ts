/**
 * @file types.ts
 * @description コアゲームロジックで使用される共通型定義、列挙型、インターフェース群。
 * プレイヤー、モンスター、アイテム、ダンジョンマップ、各種アクションの仕様を定義します。
 */

/**
 * ダンジョンのマップを構成するタイルの種類を表す列挙型。
 */
export enum TileType {
  /** 通行不能な壁タイル */
  Wall = 'Wall',
  /** 通行可能な通常の床タイル */
  Floor = 'Floor',
  /** 次の深層フロアへ進むための下り階段タイル */
  StairsDown = 'StairsDown',
  /** 通行不能な水路・川・湖タイル（視界は透過） */
  Water = 'Water',
  /** 水路上に架けられた通行可能な木の橋タイル */
  Bridge = 'Bridge',
  /** 通行可能だが老朽化して軋む壊れかけの木の橋タイル */
  BrokenBridge = 'BrokenBridge',
  /** 進入すると同一方向へスーッと滑走する氷床タイル */
  Ice = 'Ice',
  /** 進入・脱出にターンを費やす足枷の泥沼タイル */
  Mud = 'Mud',
  /** 進入すると毒ダメージ（-2HP）を受ける有毒沼タイル */
  Poison = 'Poison',
}

/**
 * ダンジョンフロアの環境・テーマ（バイオーム）を表す型。
 */
export type BiomeType =
  | 'STONE'   // 石造りの迷宮 (Classic Stone)
  | 'EARTH'   // 岩と赤土の洞窟 (Earthy Cavern)
  | 'FOREST'  // 草木と旧遺跡 (Overgrowth Ruins)
  | 'RIVER'   // 地下水流と木橋の清流洞 (Subterranean River & Bridges)
  | 'LAKE'    // 水没せし蒼玉の地下湖 (Sunken Lake)
  | 'SNOW'    // 白銀の雪原回廊 (Silver Snow Realm)
  | 'ICE'     // 永久凍土と蒼氷窟 (Glacial Ice Cavern - 氷上滑走)
  | 'SWAMP'   // 深緑の泥濘と沼地 (Murky Swamp - 泥沼足枷)
  | 'TOXIC'   // 有毒瘴気と毒沼の魔境 (Toxic Mire - 毒沼ダメージ)
  | 'MECHA'   // 歯車と真鍮の機巧回廊 (Clockwork Labyrinth - 古代機械)
  | 'ISLAND'; // 外洋に浮かぶ孤島群 (Endless Ocean Islands - 壁なし外洋)

/**
 * 2次元グリッド上の整数座標を表すインターフェース。
 */
export interface Point {
  /** X座標（横方向、左から右へ増加） */
  x: number;
  /** Y座標（縦方向、上から下へ増加） */
  y: number;
}

/**
 * キャラクターが向くことのできる8方向の方位型。
 * 風来のシレンやトルネコの大冒険における8方向移動・近接攻撃に完全準拠します。
 */
export type Direction8 =
  | 'down'
  | 'up'
  | 'left'
  | 'right'
  | 'down_right'
  | 'down_left'
  | 'up_right'
  | 'up_left';

/**
 * 4方向または8方向の方位型（後方互換用エイリアス）。
 */
export type CardinalDirection = Direction8;

/**
 * 移動ベクトル（方向・変位量）を表すインターフェース。
 */
export interface Direction {
  /** X方向の変位量（-1: 左, 0: 移動なし, 1: 右） */
  dx: number;
  /** Y方向の変位量（-1: 上, 0: 移動なし, 1: 下） */
  dy: number;
}

/**
 * アイテムの大分類カテゴリを表す型。
 */
export type ItemCategory =
  | 'POTION'  // ポーション・薬草（HP回復・強化）
  | 'FOOD'    // 食料（満腹度回復）
  | 'WEAPON'  // 武器（攻撃力上昇）
  | 'SHIELD'  // 盾（防御力上昇）
  | 'SCROLL'  // 巻物（ワープ・広域効果）
  | 'ARROW'   // 矢・飛び道具（遠距離直線攻撃）
  | 'STAFF'   // 魔法の杖（回数制の遠距離特殊効果）
  | 'TALISMAN' // 腕輪・装飾品（パッシブ能力）
  | 'GOLD';   // ゴールド通貨（床落ち金貨・所持金）

/**
 * ゲーム内に登場するアイテムの完全な情報を表すインターフェース。
 */
export interface Item {
  /** アイテムの一意なインスタンス識別子 */
  id: string;
  /** アイテムの表示名（例: 「薬草」「鉄の剣」） */
  name: string;
  /** アイテムのカテゴリ分類 */
  category: ItemCategory;
  /** アイテムの効果説明文 */
  description: string;
  /** アイテムの効果基本値（回復量や攻撃力・防御力加算値） */
  value: number;
  /** スタック数（矢・投擲具等の所持本数） */
  count?: number;
  /** 杖の残り使用回数 */
  charges?: number;
  /** 装備品の強化値（+1, +2等） */
  upgradeLevel?: number;
  /** 特殊効果識別子（例: 'KNOCKBACK', 'SWITCH', 'PARALYZE', 'REVIVE'等） */
  specialEffect?: string;
  /** 購入価格（ショップ販売時の定価ゴールド） */
  price?: number;
  /** 売却価格（プレイヤーが売却した際の換金ゴールド） */
  sellPrice?: number;
  /** ショップの未会計商品フラグ（trueの場合は未会計で持ち出し不可） */
  isShopItem?: boolean;
  /** プレイヤーがショップの床に置いて売却待ちのアイテムフラグ */
  isSoldToShop?: boolean;
  /** 床に落ちている場合のX座標 */
  x: number;
  /** 床に落ちている場合のY座標 */
  y: number;
  /** 画面描画用シンボル文字（例: '!', '%', '/', ')'） */
  symbol: string;
  /** 画面描画用カラーコード（例: '#34d399'） */
  color: string;
}

/**
 * モンスターの種族タイプを表す型。
 */
export type MonsterType =
  | 'SLIME'
  | 'GOBLIN'
  | 'SKELETON'
  | 'GOLEM'       // ゴーレム（岩・土フロア: 高HP・頑丈）
  | 'MANDRAGORA'  // マンドラゴラ（草木フロア: 樹木・植物系）
  | 'SAHAGIN'     // サハギン（川・湖フロア: 水棲半魚人）
  | 'BAT'         // 吸血コウモリ（洞窟・水流: 暗闇を飛翔）
  | 'GHOST'       // 彷徨う亡霊（旧遺跡・地下湖: 高防御アンデッド）
  | 'MAGE'        // ダークメイジ（深層魔術師: 高魔力・高威力）
  | 'DRAGON'      // レッドドラゴン（深層の覇者: 圧倒的高HP・高火力）
  | 'MIMIC'       // ミミック（宝箱に擬態する奇襲モンスター）
  | 'ZOMBIE'      // ゾンビ（腐肉のアンデッド: 高HPタフ）
  | 'IMP'         // インプ（狡猾な小悪魔: 高速・トリッキー）
  | 'MUMMY'       // ミイラ男（古代の呪術を纏う高防御怪人）
  | 'MERCHANT'    // 店主・商人（平時は中立NPC、泥棒発覚で最強の追撃者に変貌）
  | 'GUARD_DOG'   // 番犬・警備隊（泥棒時に召喚される倍速・高索敵の追跡犬）
  | 'WANDERING_ADVENTURER'  // さすらいの冒険者レオン（物々交換の旅人）
  | 'GAMBLER_SAGE'          // 賭博仙人ガンジ（じゃんけん大勝負で所持枠拡張/ペナルティ）
  | 'HEALING_FAIRY'         // 慈愛の妖精ピクシー（敵なのにプレイヤーを回復してくれる）
  | 'TRAVELING_BLACKSMITH'; // さすらいの鍛冶職人バルカン（装備品の無料鍛錬）

/**
 * フロア上に配置される障害物・ギミックオブジェクトの分類型。
 */
export type ObstacleType =
  | 'DIRT_BLOCK'    // 土の塊 (攻撃2回で破壊)
  | 'TREE_STUMP'    // 倒木・木塊 (攻撃3回で破壊)
  | 'SNOW_MOUND'    // 雪の塊 (攻撃1回で破壊)
  | 'PUSH_ROCK'     // 押せる石 (破壊不能・押して1〜5マス移動)
  | 'ICE_BLOCK';    // 滑る氷塊 (押すと直進滑走・衝突で破砕＆敵に20ダメージ)

/**
 * フロア上の障害物・ギミックオブジェクトを表すインターフェース。
 */
export interface Obstacle {
  /** 障害物の一意なインスタンス識別子 */
  id: string;
  /** 障害物の種別 */
  type: ObstacleType;
  /** 表示名（例: 「土の塊」「滑る氷の塊」） */
  name: string;
  /** X座標 */
  x: number;
  /** Y座標 */
  y: number;
  /** 現在の耐久値（HP） */
  hp: number;
  /** 最大耐久値 */
  maxHp: number;
  /** 攻撃して壊せるかどうか */
  isDestructible: boolean;
  /** 押して動かせるかどうか */
  isPushable: boolean;
  /** 押すと滑走するかどうか */
  isSliding: boolean;
  /** 大石などのプッシュ試行回数（1回目肩当て、2回目で奥へ移動） */
  pushAttempts?: number;
  /** マップ・ミニマップ描画用シンボル文字 */
  symbol: string;
  /** マップ・ミニマップ描画用カラーコード */
  color: string;
}

/**
 * ダンジョン内に生息する敵モンスターの完全な情報を表すインターフェース。
 */
export interface Monster {
  /** モンスターの一意なインスタンス識別子 */
  id: string;
  /** モンスターの種族名（例: 「スライム」） */
  name: string;
  /** モンスターの種族分類 */
  type: MonsterType;
  /** 現在のマップ上X座標 */
  x: number;
  /** 現在のマップ上Y座標 */
  y: number;
  /** 現在のヒットポイント */
  hp: number;
  /** 最大ヒットポイント */
  maxHp: number;
  /** 攻撃力 */
  atk: number;
  /** 防御力 */
  def: number;
  /** 撃破時にプレイヤーが得られる経験値量 */
  expValue: number;
  /** 現在向いている主方位（'down' | 'up' | 'left' | 'right' 等） */
  direction?: CardinalDirection;
  /** 擬態・睡眠中かどうか（人食い箱ミミック等: 近接刺激するまで動かない） */
  isDormant?: boolean;
  /** 鈍重モンスターかどうか（ゴーレム、ゾンビ、ミイラ等: 2ターンに1回移動） */
  isSlow?: boolean;
  /** 中距離遠隔攻撃を行うかどうか（メイジ、インプ等） */
  hasRangedAttack?: boolean;
  /** 遠隔攻撃の種別（'magic' | 'fire'） */
  rangedAttackType?: 'magic' | 'fire';
  /** 索敵視野が正面向き限定のアホな敵かどうか（背後から近づけば気付かない） */
  hasBackBlindSpot?: boolean;
  /** 衝撃によるスタン・気絶中かどうか（大石や氷塊直撃時: 1ターン行動不能） */
  isStunned?: boolean;
  /** 金縛り状態かどうか（攻撃を受けるまで一切行動不能） */
  isParalyzed?: boolean;
  /** 睡眠状態の残りターン数（0で起床） */
  sleepTurns?: number;
  /** 混乱状態の残りターン数（0で回復） */
  confuseTurns?: number;
  /** 特殊能力が封印されているかどうか */
  isSealed?: boolean;
  /** 平時の中立・友好的NPCフラグ（プレイヤーから攻撃されるか泥棒発覚まで反撃・攻撃しない） */
  isFriendly?: boolean;
  /** ショップの店主フラグ */
  isShopkeeper?: boolean;
  /** 泥棒追撃用の番犬・警備隊フラグ */
  isGuardDog?: boolean;
  /** 激怒モードの店主フラグ（泥棒追撃中） */
  isAngryMerchant?: boolean;
  /** レア中立NPCキャラクターフラグ（会話・イベント可能） */
  isRareNpc?: boolean;
  /** NPC専用イベントデータ（物々交換オファー、鍛錬フラグ等） */
  npcData?: {
    tradeWantCategory?: ItemCategory;
    tradeWantCategoryName?: string;
    tradeOfferedItem?: Item;
    tradeCompleted?: boolean;
    hasForged?: boolean;
    rpsStreak?: number;
  };
  /** 画面描画用シンボル文字（例: 's', 'g', 'k'） */
  symbol: string;
  /** 画面描画用カラーコード */
  color: string;
}

/**
 * プレイヤーまたはシステムが要求するゲームアクションの判別共用体型。
 */
export type ActionType =
  /**
   * 指定方向への移動アクション（モンスターが存在する場合は近接攻撃に遷移）。
   */
  | {
      type: 'MOVE';
      /** X方向の移動量 (-1, 0, 1) */
      dx: number;
      /** Y方向の移動量 (-1, 0, 1) */
      dy: number;
    }
  /**
   * その場で足踏みし、時間を1ターン進めるアクション（HP自然回復などに利用）。
   */
  | {
      type: 'WAIT';
    }
  /**
   * 足元の床に落ちているアイテムを拾い上げてインベントリに収納するアクション。
   */
  | {
      type: 'PICKUP';
    }
  /**
   * 汎用決定・アクション操作（Aボタン）。
   * 足元にアイテムがあれば拾い、階段マスであればフロアを降り、それ以外の場合は周囲を確認します。
   */
  | {
      type: 'INTERACT';
    }
  /**
   * インベントリ内の指定アイテムを使用・装備・消費するアクション。
   */
  | {
      type: 'USE_ITEM';
      /** 使用するアイテムのID */
      itemId: string;
    }
  /**
   * インベントリ内の指定アイテムを足元の床に捨てるアクション。
   */
  | {
      type: 'DROP_ITEM';
      /** 捨てるアイテムのID */
      itemId: string;
    }
  /**
   * 飛び道具（弓矢など）を発射するアクション。
   */
  | {
      type: 'SHOOT';
      /** 発射する矢のアイテムID（省略時は所持している矢から自動選択） */
      itemId?: string;
      dx?: number;
      dy?: number;
    }
  /**
   * 魔法の杖を向いている方向へ振るアクション。
   */
  | {
      type: 'ZAP_STAFF';
      itemId: string;
      dx?: number;
      dy?: number;
    }
  /**
   * インベントリ内のアイテムを向いている方向へ投げつけるアクション。
   */
  | {
      type: 'THROW_ITEM';
      itemId: string;
      dx?: number;
      dy?: number;
    }
  /**
   * 現在立っているマスの下り階段を利用して次のフロアへ降りるアクション。
   */
  | {
      type: 'DESCEND';
    }
  /**
   * ゲームオーバー時またはリセット時に新規ゲームを最初から開始するアクション。
   */
  | {
      type: 'RESTART';
    }
  /**
   * 現在のフロアマップを強制的に再生成するデバッグ・検証用アクション。
   */
  | {
      type: 'REGEN';
    }
  /**
   * レアNPCとの会話・イベントアクション。
   */
  | {
      type: 'NPC_INTERACT';
      monsterId: string;
      action: 'TALK' | 'TRADE_ACCEPT' | 'RPS_PLAY' | 'FORGE_WEAPON' | 'FORGE_SHIELD';
      rpsChoice?: 'ROCK' | 'SCISSORS' | 'PAPER';
      tradePlayerItemId?: string;
    };

/**
 * プレイヤーキャラクターの現在ステータスを表すインターフェース。
 */
export interface PlayerState {
  /** 現在のマップ上X座標 */
  x: number;
  /** 現在のマップ上Y座標 */
  y: number;
  /** 現在向いている主方位（'down' | 'up' | 'left' | 'right'） */
  direction?: CardinalDirection;
  /** 現在のヒットポイント（HP） */
  hp: number;
  /** 最大ヒットポイント */
  maxHp: number;
  /** 基礎攻撃力 */
  baseAtk: number;
  /** 基礎防御力 */
  baseDef: number;
  /** 装備補正込みの総合攻撃力 */
  atk: number;
  /** 装備補正込みの総合防御力 */
  def: number;
  /** 現在の冒険者レベル */
  level: number;
  /** 現在蓄積されている経験値（EXP） */
  exp: number;
  /** 次のレベルアップに必要な累計経験値 */
  nextExp: number;
  /** 現在の満腹度（0〜100%）。0になると餓死ダメージが発生する */
  hunger: number;
  /** 最大満腹度 */
  maxHunger: number;
  /** 所持ゴールド数（通貨） */
  gold: number;
  /** 現在到達している地下階層番号（例: 1 = 地下1階） */
  floor: number;
  /** 冒険開始からの総経過ターン数 */
  turn: number;
  /** 所持品アイテムのリスト */
  inventory: Item[];
  /** 所持できる最大アイテム数枠（初期値12、仙人とのじゃんけんで拡張可能） */
  inventoryCapacity?: number;
  /** 現在装備している右手武器（未装備時は null） */
  equippedWeapon: Item | null;
  /** 現在装備している左手盾（未装備時は null） */
  equippedShield: Item | null;
  /** 現在装備している腕輪・装飾品（未装備時は null） */
  equippedTalisman?: Item | null;
  /** 現在装備している矢・飛び道具（未装備時は null） */
  equippedArrow?: Item | null;
  /** 現在装備している魔法の杖（未装備時は null） */
  equippedStaff?: Item | null;
  /** 倍速行動バフの残りターン数（すばやさの草） */
  speedTurns?: number;
  /** 生存フラグ（falseの場合はゲームオーバー） */
  isAlive: boolean;
}

/**
 * ダンジョン生成時に配置された個々の部屋の領域情報を表すインターフェース。
 */
export interface Room {
  /** 部屋の左上X座標 */
  x: number;
  /** 部屋の左上Y座標 */
  y: number;
  /** 部屋の横幅（セル数） */
  w: number;
  /** 部屋の縦幅（セル数） */
  h: number;
  /** ショップ（店部屋）かどうか */
  isShop?: boolean;
  /** 店主モンスターのID */
  shopkeeperId?: string;
}

/**
 * ダンジョンの1フロア全体の完全な状態を表すインターフェース。
 */
export interface DungeonMap {
  /** マップ全体の横幅（セル数） */
  width: number;
  /** マップ全体の縦幅（セル数） */
  height: number;
  /** 2次元配列によるタイルデータ [y][x] */
  tiles: TileType[][];
  /** 各セルがこれまでにプレイヤーによって視認・探索されたかどうかの真偽値配列 [y][x] */
  explored: boolean[][];
  /** 現在のターンにおいてプレイヤーの視界内に収まっているかどうかの真偽値配列 [y][x] */
  visible: boolean[][];
  /** 次のフロアへ降りる階段の配置座標 */
  stairsDown: Point;
  /** プレイヤーが最初にスポーンする開始座標 */
  startPos: Point;
  /** フロア内に存在する部屋のリスト */
  rooms: Room[];
  /** フロア内に存在するショップ部屋（存在しないフロアは undefined/null） */
  shopRoom?: Room | null;
  /** 泥棒発覚中モードフラグ（BGMや店主・番犬の追撃がアクティブ） */
  isThiefMode?: boolean;
  /** フロア内に生存している敵モンスターのリスト */
  monsters: Monster[];
  /** フロアの床に配置されているアイテムのリスト */
  items: Item[];
  /** フロア内に配置されている障害物・ギミックオブジェクトのリスト */
  obstacles: Obstacle[];
  /** フロアの環境・バイオーム分類 */
  biome: BiomeType;
  /** 画面表示用のバイオーム和名（例: 「草木が生い茂る旧遺跡」） */
  biomeName: string;
}

/**
 * プレイヤーの行動やイベントの履歴ログを表すインターフェース。
 */
export interface GameLogEntry {
  /** ログエントリの一意な識別子 */
  id: string;
  /** ログが発生したターン数 */
  turn: number;
  /** 表示するメッセージ本文 */
  text: string;
  /** ログの種類（UIでの色分けや装飾に使用） */
  type?: 'normal' | 'info' | 'warning' | 'damage' | 'turn-header';
}
