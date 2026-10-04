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
}

/**
 * ダンジョンフロアの環境・テーマ（バイオーム）を表す型。
 */
export type BiomeType =
  | 'STONE'  // 石造りの迷宮 (Classic Stone)
  | 'EARTH'  // 岩と赤土の洞窟 (Earthy Cavern)
  | 'FOREST' // 草木と旧遺跡 (Overgrowth Ruins)
  | 'RIVER'  // 地下水流と清流洞 (Subterranean River)
  | 'LAKE';  // 水没せし蒼玉の地下湖 (Sunken Lake)

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
  | 'SCROLL'; // 巻物（ワープ・広域効果）

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
  | 'SAHAGIN';    // サハギン（川・湖フロア: 水棲半魚人）

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
  /** 現在向いている主方位（'down' | 'up' | 'left' | 'right'） */
  direction?: CardinalDirection;
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
  /** 現在到達している地下階層番号（例: 1 = 地下1階） */
  floor: number;
  /** 冒険開始からの総経過ターン数 */
  turn: number;
  /** 所持品アイテムのリスト（最大12枠） */
  inventory: Item[];
  /** 現在装備している右手武器（未装備時は null） */
  equippedWeapon: Item | null;
  /** 現在装備している左手盾（未装備時は null） */
  equippedShield: Item | null;
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
  /** フロア内に生存している敵モンスターのリスト */
  monsters: Monster[];
  /** フロアの床に配置されているアイテムのリスト */
  items: Item[];
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
