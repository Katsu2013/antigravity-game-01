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
  | 'ISLAND'  // 外洋に浮かぶ孤島群 (Endless Ocean Islands - 壁なし外洋)
  | 'MAGMA'   // 灼熱の溶岩洞窟 (Magma Caves - 灼熱地獄)
  | 'TEMPLE'  // 深層古代神殿・試練の回廊 (Ancient Temple)
  | 'ALTAR';  // 最深部・奈落の祭壇 (Abyss Altar - 第50層ボスフロア)

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
  | 'POT'      // 壺（合成の壺など）
  | 'GOLD';   // ゴールド通貨（床落ち金貨・所持金）

/**
 * ゲーム内に登場するアイテムの完全な情報を表すインターフェース。
 */
export interface Item {
  /** アイテムの一意なインスタンス識別子（例: 'item_1697012345_1'） */
  id: string;
  /** アイテムの表示名（例: 「薬草」「鉄の剣」「ドラゴンシールド」） */
  name: string;
  /** アイテムのカテゴリ分類（POTION, WEAPON, SHIELD, SCROLL, ARROW, STAFF等） */
  category: ItemCategory;
  /** アイテムの効果説明文（インベントリ詳細モーダル等に表示） */
  description: string;
  /**
   * アイテムの効果基本値。
   * - 武器/盾: 基礎攻撃力/基礎防御力
   * - ポーション/食料: HP回復量/満腹度回復量
   * - 想定値: 0以上の整数（例: 薬草=25, 鉄の剣=6, ドラゴンシールド=12）
   */
  value: number;
  /**
   * スタック数（矢・投擲具・食料等の所持本数）。
   * - 想定値: 1〜99の整数
   * - 初期値: ドロップ生成時に設定（矢なら5〜15本）
   */
  count?: number;
  /**
   * 魔法の杖の残り使用可能回数。
   * - 想定値: 0以上の整数（0になると効果を発揮せず空振りする）
   * - 初期値: 生成時に設定（例: 4〜7回）
   */
  charges?: number;
  /**
   * 武器・盾の鍛錬強化値（+1, +2等）。
   * - 想定値: 0以上の整数（合成や鍛冶で増加）
   * - 初期値: 0（稀に初期ドロップで+1〜+3が付与される場合あり）
   */
  upgradeLevel?: number;
  /**
   * 武器・盾に宿る特殊能力・印・ルーン群のリスト（例: ['DRAGON', 'RUSTPROOF']）。
   * - 想定値: 特殊印識別子の文字列配列、空配列、または `undefined`
   * - 初期値: 生成アイテムの種別により決定、通常装備は空
   */
  runes?: string[];
  /**
   * 壺（合成の壺など）の収納容量・残り投入可能数。
   * - 想定値: 0〜5の整数（0になるとそれ以上アイテムを投入不可）
   * - 初期値: 壺アイテム生成時に設定（例: 3〜5）
   */
  potCapacity?: number;
  /**
   * 特殊効果識別子（例: 'KNOCKBACK', 'SWITCH', 'PARALYZE', 'REVIVE'等）。
   * - 想定値: システムが認識する効果コード文字列、または `undefined`
   * - 初期値: 定義に準拠
   */
  specialEffect?: string;
  /**
   * ショップ販売時の定価ゴールド（購入価格）。
   * - 想定値: 0以上の整数（例: 薬草=100G, 鉄の剣=500G）
   * - 初期値: 定義から算出
   */
  price?: number;
  /**
   * プレイヤーがショップで売却した際の換金ゴールド（売却価格）。
   * - 想定値: 0以上の整数（通常は販売定価の約35%〜50%）
   * - 初期値: 定義から算出
   */
  sellPrice?: number;
  /**
   * ショップの未会計商品フラグ。
   * - 想定値:
   *   - `true`: 店主の店内に陳列されている未会計商品（部屋から持ち出すと泥棒判定）
   *   - `false`: プレイヤーが購入済み、または通常のフロア床落ちアイテム
   * - 初期値: `false`（ショップ部屋生成時に陳列されたアイテムのみ `true`）
   * - 変化契機: 店主への会計（TALK / 金貨精算）時に `false` へ解除
   */
  isShopItem?: boolean;
  /**
   * プレイヤーがショップの床に置いて売却待ち状態のアイテムフラグ。
   * - 想定値:
   *   - `true`: ショップの床に置かれて店主による買取査定待ち
   *   - `false`: 通常の床落ちアイテム、または売却完了済み
   * - 初期値: `false`
   * - 変化契機: ショップ床へのDROP時に `true`、店主会話での精算時にゴールド加算後に `false`
   */
  isSoldToShop?: boolean;
  /**
   * 床に落ちている場合のマップ上X座標。
   * - 想定値: 0 〜 DungeonMap.width - 1 の整数
   */
  x: number;
  /**
   * 床に落ちている場合のマップ上Y座標。
   * - 想定値: 0 〜 DungeonMap.height - 1 の整数
   */
  y: number;
  /**
   * 画面描画用シンボル文字（例: '!', '%', '/', ')'）。
   * - 想定値: ASCII 1文字
   */
  symbol: string;
  /**
   * 画面描画用カラーコード（例: '#34d399', '#f59e0b'）。
   * - 想定値: CSSカラー文字列（HEXまたはRGB）
   */
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
  | 'TRAVELING_BLACKSMITH' // さすらいの鍛冶職人バルカン（装備品の無料鍛錬）
  | 'SCOOTER_GUY'          // スクーターおじさん（脈絡なくダンジョンを通過する謎のオジサン）
  | 'ABYSS_LORD';          // 奈落の魔王アビス・ロード（第50層 最深部の支配者・大ボス）

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
  /** 障害物の一意なインスタンス識別子（例: 'obs_3_5'） */
  id: string;
  /** 障害物の種別（DIRT_BLOCK, TREE_STUMP, SNOW_MOUND, PUSH_ROCK, ICE_BLOCK） */
  type: ObstacleType;
  /** 表示名（例: 「土の塊」「滑る氷の塊」「大石」） */
  name: string;
  /**
   * 現在のマップ上X座標。
   * - 想定値: 0 〜 DungeonMap.width - 1 の整数
   */
  x: number;
  /**
   * 現在のマップ上Y座標。
   * - 想定値: 0 〜 DungeonMap.height - 1 の整数
   */
  y: number;
  /**
   * 現在の耐久値（HP）。
   * - 想定値: 0以上の整数（0になると破砕・消滅）
   * - 初期値: maxHp と同一値
   */
  hp: number;
  /**
   * 最大耐久値。
   * - 想定値: 1以上の整数（土=2, 木=3, 雪=1, 大石=999等）
   */
  maxHp: number;
  /**
   * 攻撃して壊せるかどうかのフラグ。
   * - 想定値:
   *   - `true`: プレイヤーやモンスターの攻撃によりHPが減少し、0で破壊消滅可能
   *   - `false`: 通常攻撃では一切ダメージを受けず破壊不能（大石など）
   * - 初期値: オブジェクト種別に依存（土・木・雪は `true`, 大石は `false`）
   */
  isDestructible: boolean;
  /**
   * プレイヤーが体当たりして押せるかどうかのフラグ。
   * - 想定値:
   *   - `true`: プレイヤーが向かって歩行入力をすることで前方へ押して移動可能
   *   - `false`: 固定障害物であり押して動かすことはできない
   * - 初期値: `PUSH_ROCK` および `ICE_BLOCK` のみ `true`、他は `false`
   */
  isPushable: boolean;
  /**
   * 押した際に氷上を滑走するかどうかのフラグ。
   * - 想定値:
   *   - `true`: 押した方向に障害物や壁に激突するまでスーッと一直線に滑走する
   *   - `false`: 1マスずつまたは段階的に押して動かす
   * - 初期値: `ICE_BLOCK` のみ `true`、他は `false`
   */
  isSliding: boolean;
  /**
   * 大石（PUSH_ROCK）のプッシュ試行回数カウンタ。
   * - 想定値:
   *   - `0`: まだ押す動作を行っていない初期状態
   *   - `1`: 1回目の肩当て・力み動作完了（SE再生・揺れ演出）
   *   - `2`: 2回目の全力押し出し完了（奥のマスへ地響きとともに移動）
   * - 初期値: `0`
   */
  pushAttempts?: number;
  /**
   * マップ・ミニマップ描画用シンボル文字（例: '#', 'O', '*'）。
   * - 想定値: ASCII 1文字
   */
  symbol: string;
  /**
   * マップ・ミニマップ描画用カラーコード（例: '#78716c', '#38bdf8'）。
   * - 想定値: CSSカラー文字列
   */
  color: string;
}

/**
 * ダンジョン内に生息する敵モンスターの完全な情報を表すインターフェース。
 */
export interface Monster {
  /** モンスターの一意なインスタンス識別子（例: 'mon_1_slime_0'） */
  id: string;
  /** モンスターの種族名（例: 「スライム」「レッドドラゴン」「店主」） */
  name: string;
  /** モンスターの種族分類（MonsterType列挙型参照） */
  type: MonsterType;
  /**
   * 現在のマップ上X座標。
   * - 想定値: 0 〜 DungeonMap.width - 1 の整数
   */
  x: number;
  /**
   * 現在のマップ上Y座標。
   * - 想定値: 0 〜 DungeonMap.height - 1 の整数
   */
  y: number;
  /**
   * 現在のヒットポイント。
   * - 想定値: 0 〜 maxHp の整数（0以下で撃破判定）
   * - 初期値: maxHp と同一値
   */
  hp: number;
  /**
   * 最大ヒットポイント。
   * - 想定値: 1以上の正の整数（階層や種族に応じた値）
   */
  maxHp: number;
  /**
   * 攻撃力。
   * - 想定値: 1以上の正の整数
   */
  atk: number;
  /**
   * 防御力。
   * - 想定値: 0以上の整数
   */
  def: number;
  /**
   * 撃破時にプレイヤーが得られる経験値量。
   * - 想定値: 1以上の整数
   */
  expValue: number;
  /**
   * 現在向いている主方位。
   * - 想定値: 'down' | 'up' | 'left' | 'right' | 'down_right' 等
   * - 初期値: ランダムまたは下向き（'down'）
   */
  direction?: CardinalDirection;
  /**
   * 擬態・休眠フラグ。
   * - 想定値:
   *   - `true`: 宝箱等に擬態または深い眠りについており、視界内でも接近されるまで動かない（ミミック等）
   *   - `false`: 通常索敵・行動中
   * - 初期値: ミミックのみ `true`、通常モンスターは `false`
   * - 変化契機: プレイヤーが隣接するか攻撃を受けると `false` に覚醒
   */
  isDormant?: boolean;
  /**
   * 鈍足移動フラグ。
   * - 想定値:
   *   - `true`: 行動速度が遅く、2ターンに1回しか移動・行動しない（ゴーレム、ゾンビ、ミイラ等）
   *   - `false`: プレイヤーと同等の通常速度（毎ターン1回行動）
   * - 初期値: 重厚・アンデッド系モンスターのみ `true`、他は `false`
   */
  isSlow?: boolean;
  /**
   * 中距離直線遠隔攻撃能力を持つかどうかのフラグ。
   * - 想定値:
   *   - `true`: 射線上にプレイヤーがいる場合、数マス離れた位置から魔法や火炎を投射する（メイジ、インプ等）
   *   - `false`: 近接隣接攻撃のみ行う
   * - 初期値: 遠隔射撃モンスターのみ `true`、他は `false`
   */
  hasRangedAttack?: boolean;
  /**
   * 遠隔攻撃の属性種別。
   * - 想定値:
   *   - `'magic'`: 魔法弾投射（壁を透過せず、着弾時に青白い光線エフェクト）
   *   - `'fire'`: 火炎ブレス投射（壁を透過せず、着弾時に炎エフェクト）
   *   - `undefined`: 遠隔攻撃なし
   * - 初期値: 種族定義に準拠
   */
  rangedAttackType?: 'magic' | 'fire';
  /**
   * 正面視野限定（背後死角あり）フラグ。
   * - 想定値:
   *   - `true`: 視界が向いている正面コーン状のみであり、背後や真横から接近しても気付かない（アホな敵）
   *   - `false`: 360度全方位の索敵視界を持つ通常モンスター
   * - 初期値: 一部鈍感モンスターのみ `true`
   */
  hasBackBlindSpot?: boolean;
  /**
   * 衝撃によるスタン・気絶中フラグ。
   * - 想定値:
   *   - `true`: 大石や氷塊の激突衝撃を受け、1ターン行動不能状態
   *   - `false`: 正常に行動可能
   * - 初期値: `false`
   * - 変化契機: 障害物激突時に `true`、ターン経過で `false` へ回復
   */
  isStunned?: boolean;
  /**
   * かなしばり（硬直・結晶化）状態フラグ。
   * - 想定値:
   *   - `true`: 杖の魔力等で完全に身体が硬直しており、攻撃を受けるまで一切行動できない
   *   - `false`: 正常に行動可能
   * - 初期値: `false`
   * - 変化契機: かなしばりの杖被弾時に `true`、ダメージを受けると即座に `false` へ解除
   */
  isParalyzed?: boolean;
  /**
   * 睡眠状態の残りターン数。
   * - 想定値: 0以上の整数（0で起床して行動再開）
   * - 初期値: 0（睡眠の杖被弾時に3〜6ターン付与）
   */
  sleepTurns?: number;
  /**
   * 混乱状態の残りターン数。
   * - 想定値: 0以上の整数（0で正気に戻る。1以上の時はランダム方向に千鳥足移動/攻撃）
   * - 初期値: 0
   */
  confuseTurns?: number;
  /**
   * 特殊能力封印フラグ。
   * - 想定値:
   *   - `true`: 封印の魔力により遠隔魔法や特殊スキルが封じられ、通常攻撃のみ行う
   *   - `false`: 特殊能力を通常通り行使可能
   * - 初期値: `false`
   */
  isSealed?: boolean;
  /**
   * 中立・友好的NPCフラグ。
   * - 想定値:
   *   - `true`: 平和的なNPC。プレイヤーに近づいても攻撃せず、会話や取引・イベントが可能
   *   - `false`: プレイヤーを発見次第接近・攻撃してくる敵性モンスター
   * - 初期値: 通常モンスターは `false`、店主・レアNPCは `true`
   * - 変化契機: 店主の場合は泥棒や度重なる攻撃で `false` に反転
   */
  isFriendly?: boolean;
  /**
   * モンスターの色違い・上位種・亜種のスプライト識別子。
   * - 想定値: `'red_slime'` | `'metal_slime'` | `'hobgoblin'` | `'goblin_shaman'` | `'poison_skeleton'` | `'blood_skeleton'` | `'chaos_bat'` | `'wraith'` | `'magma_golem'` | `'blue_dragon'` | `'black_dragon'` 等
   * - 初期値: 基本種は `undefined`、上位種・亜種のみ文字列キーを指定
   */
  variantId?: string;
  /**
   * 極稀に攻撃せずプレイヤーと仲良くなりたがる仲間モンスターフラグ。
   * - 想定値:
   *   - `true`: プレイヤーを敵対視せず、後をついてきたり敵と戦ってくれたり癒やしてくれる友好モンスター
   *   - `false`: 通常の敵性または中立NPCモンスター
   * - 初期値: 通常は `false`（約2%の極稀な確率で `true` でスポーン）
   * - 変化契機: プレイヤーから執拗に攻撃を受けると `false` に反転
   */
  isCompanion?: boolean;
  /**
   * 仲間モンスターのなかよし度（触れ合いやエサを与えた回数）。
   * - 想定値: 0以上の整数（数値が高いほど癒やしの発生率や支援能力が向上）
   * - 初期値: 0
   */
  companionAffection?: number;
  /**
   * ショップ店主フラグ。
   * - 想定値:
   *   - `true`: ショップ部屋で商品を販売している店主NPC
   *   - `false`: 一般モンスターまたは他の中立キャラクター
   * - 初期値: 店主モンスターのみ `true`
   */
  isShopkeeper?: boolean;
  /**
   * 泥棒追撃用の番犬・警備隊フラグ。
   * - 想定値:
   *   - `true`: 泥棒発生時に召喚される倍速・高攻撃力の警備犬
   *   - `false`: 一般モンスター
   * - 初期値: 番犬のみ `true`
   */
  isGuardDog?: boolean;
  /**
   * 激怒・追撃モード店主フラグ。
   * - 想定値:
   *   - `true`: 泥棒発覚または執拗な攻撃により激怒し、赤オーラを纏って超高速追撃・必殺の一撃を放つ
   *   - `false`: 平常取引モードの平和な店主
   * - 初期値: `false`
   * - 変化契機: 未会計持ち出しまたは一定回数以上の攻撃・迷惑行為で `true`
   */
  isAngryMerchant?: boolean;
  /**
   * 店主にしつこく話しかけた連続回数カウンタ。
   * - 想定値: 0以上の整数（5回で警告、7回で閉店、10回で激怒攻撃）
   * - 初期値: 0
   */
  talkStreak?: number;
  /**
   * 店主が怒って店を閉めたフラグ。
   * - 想定値:
   *   - `true`: 店主が暖簾をしまい、これ以上のアイテム売買を拒絶した状態
   *   - `false`: 通常営業中
   * - 初期値: `false`
   */
  isShopClosed?: boolean;
  /**
   * レア中立NPCキャラクターフラグ。
   * - 想定値:
   *   - `true`: まれにダンジョンに出現する特殊キャラクター（旅の冒険者、賭博仙人、妖精、鍛冶職人、スクーターおじさん）
   *   - `false`: 通常のダンジョン生息モンスター
   * - 初期値: レアNPCのみ `true`
   */
  isRareNpc?: boolean;
  /**
   * NPC専用イベントデータ（物々交換オファー、鍛錬フラグ等）。
   */
  npcData?: {
    /** 物々交換で欲しがっているアイテムカテゴリ */
    tradeWantCategory?: ItemCategory;
    /** 物々交換で欲しがっているカテゴリの和名（例: 「武器」「巻物」） */
    tradeWantCategoryName?: string;
    /** 物々交換で見返りとして提示しているアイテムインスタンス */
    tradeOfferedItem?: Item;
    /**
     * 物々交換が成立済みかどうかのフラグ。
     * - 想定値: `true` (交換済み), `false` (未交換)
     * - 初期値: `false`
     */
    tradeCompleted?: boolean;
    /**
     * さすらいの鍛冶職人による無料鍛錬が完了済みかどうかのフラグ。
     * - 想定値: `true` (鍛錬完了済み、同一フロアで1回のみ), `false` (未鍛錬)
     * - 初期値: `false`
     */
    hasForged?: boolean;
    /**
     * 賭博仙人ガンジとのじゃんけん勝負連続記録（勝利数等）。
     * - 想定値: 0以上の整数
     * - 初期値: 0
     */
    rpsStreak?: number;
  };
  /**
   * スクーターおじさんの横断走行データ。
   */
  scooterData?: {
    /** 横断走行の目標到達地点X座標 */
    targetX: number;
    /** 横断走行の目標到達地点Y座標 */
    targetY: number;
    /**
     * ダンジョン内滞在の残り猶予ターン数（0で自動退場・消滅）。
     * - 想定値: 0以上の整数
     * - 初期値: 15〜25ターン
     */
    despawnTurns: number;
    /** 原付エンジン音の次回再生タイマー（ミリ秒） */
    engineSoundTimer?: number;
  };
  /**
   * ショップ店主の固有プロファイルID。
   * - 想定値: 'NERO' | 'TORNEKO' | 'SHIREN' | 'GOLDO' | 'CELIA'
   * - 初期値: ショップ生成時にランダムまたは固定割り当て
   */
  shopkeeperProfileId?: string;
  /**
   * 画面描画用シンボル文字（例: 's', 'g', 'k', 'D'）。
   * - 想定値: ASCII 1文字
   */
  symbol: string;
  /**
   * 画面描画用カラーコード（例: '#ef4444', '#10b981'）。
   * - 想定値: CSSカラー文字列
   */
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
    }
  /**
   * 武器・盾の合成・鍛冶錬成アクション（合成の壺による強化値加算・印継承）。
   */
  | {
      type: 'SYNTHESIZE';
      baseItemId: string;
      materialItemId: string;
      potId?: string;
      potItemId?: string;
    };

/**
 * プレイヤーキャラクターの現在ステータスを表すインターフェース。
 */
export interface PlayerState {
  /**
   * 現在のマップ上X座標。
   * - 想定値: 0 〜 DungeonMap.width - 1 の整数
   * - 初期値: ダンジョン生成時に決定される startPos.x
   */
  x: number;
  /**
   * 現在のマップ上Y座標。
   * - 想定値: 0 〜 DungeonMap.height - 1 の整数
   * - 初期値: ダンジョン生成時に決定される startPos.y
   */
  y: number;
  /**
   * 現在向いている主方位。
   * - 想定値: 'down' | 'up' | 'left' | 'right' | 'down_right' 等の8方向
   * - 初期値: 'down'
   */
  direction?: CardinalDirection;
  /**
   * 現在のヒットポイント（HP）。
   * - 想定値: 0 〜 maxHp の整数（0以下で死亡・ゲームオーバー判定）
   * - 初期値: 15
   */
  hp: number;
  /**
   * 最大ヒットポイント。
   * - 想定値: レベルアップや薬草で上昇する正の整数（初期値: 15）
   */
  maxHp: number;
  /**
   * 基礎攻撃力（レベルに応じた基礎値、装備を含まない）。
   * - 想定値: 正の整数（初期値: 5）
   */
  baseAtk: number;
  /**
   * 基礎防御力（レベルに応じた基礎値、装備を含まない）。
   * - 想定値: 0以上の整数（初期値: 2）
   */
  baseDef: number;
  /**
   * 装備補正込みの総合攻撃力。
   * - 想定値: baseAtk + equippedWeapon.value + upgradeLevel
   */
  atk: number;
  /**
   * 装備補正込みの総合防御力。
   * - 想定値: baseDef + equippedShield.value + upgradeLevel
   */
  def: number;
  /**
   * 現在の冒険者レベル。
   * - 想定値: 1以上の正の整数（初期値: 1）
   */
  level: number;
  /**
   * 現在蓄積されている累計経験値（EXP）。
   * - 想定値: 0以上の整数（初期値: 0）
   */
  exp: number;
  /**
   * 次のレベルアップに必要な目標経験値。
   * - 想定値: レベルアップテーブルに基づく正の整数（Lv1時: 10）
   */
  nextExp: number;
  /**
   * 現在の満腹度（パーセンテージ）。
   * - 想定値: 0 〜 maxHunger（100）の数値。0になると毎ターン1ダメージの餓死ダメージが発生
   * - 初期値: 100
   */
  hunger: number;
  /**
   * 最大満腹度。
   * - 想定値: 100以上の数値（おにぎり・特製弁当で上限拡張可能）
   * - 初期値: 100
   */
  maxHunger: number;
  /**
   * 所持ゴールド数（ダンジョン内通貨）。
   * - 想定値: 0以上の整数（初期値: 0）
   */
  gold: number;
  /**
   * 現在到達している地下階層番号（フロア）。
   * - 想定値: 1 〜 50 の整数（1 = B1F, 50 = 最深部アビスボスフロア）
   * - 初期値: 1
   */
  floor: number;
  /**
   * 冒険開始からの総経過ターン数。
   * - 想定値: 1以上の正の整数
   * - 初期値: 1
   */
  turn: number;
  /**
   * 所持品アイテムのリスト。
   * - 想定値: Itemオブジェクトの配列（長さ 0 〜 inventoryCapacity）
   * - 初期値: ゲーム開始時の初期装備・支給品
   */
  inventory: Item[];
  /**
   * 所持できる最大アイテム数枠（インベントリ上限）。
   * - 想定値: 12 〜 20 の整数（賭博仙人とのじゃんけんで増減）
   * - 初期値: 12
   */
  inventoryCapacity?: number;
  /**
   * 現在装備している右手武器。
   * - 想定値: Item（category === 'WEAPON'）または `null`（素手状態）
   * - 初期値: `null`
   */
  equippedWeapon: Item | null;
  /**
   * 現在装備している左手盾。
   * - 想定値: Item（category === 'SHIELD'）または `null`（盾なし状態）
   * - 初期値: `null`
   */
  equippedShield: Item | null;
  /**
   * 現在装備している腕輪・装飾品。
   * - 想定値: Item（category === 'TALISMAN'）または `null`
   * - 初期値: `null`
   */
  equippedTalisman?: Item | null;
  /**
   * 現在装備している矢・飛び道具。
   * - 想定値: Item（category === 'ARROW'）または `null`
   * - 初期値: `null`
   */
  equippedArrow?: Item | null;
  /**
   * 現在装備している魔法の杖。
   * - 想定値: Item（category === 'STAFF'）または `null`
   * - 初期値: `null`
   */
  equippedStaff?: Item | null;
  /**
   * 倍速行動バフの残り有効ターン数（すばやさの草等で付与）。
   * - 想定値: 0以上の整数（0で等速、1以上の時は1ターンに2回行動）
   * - 初期値: 0
   */
  speedTurns?: number;
  /**
   * プレイヤー生存フラグ。
   * - 想定値:
   *   - `true`: プレイヤー生存中（HP > 0、通常ゲームプレイ進行）
   *   - `false`: プレイヤー死亡（HP <= 0、ゲームオーバー画面へ移行）
   * - 初期値: `true`
   * - 変化契機: HPが0以下になった際に `false` に切り替え
   */
  isAlive: boolean;
  /**
   * 第50層ボス撃破によるゲーム完全制覇（クリア）達成フラグ。
   * - 想定値:
   *   - `true`: 奈落の魔王アビス・ロードを撃破しエンディング到達
   *   - `false`: ダンジョン攻略中
   * - 初期値: `false`
   * - 変化契機: B50FボスのHPが0になった際に `true` に設定
   */
  isGameCleared?: boolean;
}

/**
 * ダンジョン生成時に配置された個々の部屋の領域情報を表すインターフェース。
 */
export interface Room {
  /**
   * 部屋の左上X座標（グリッド単位）。
   * - 想定値: 0 〜 DungeonMap.width - 1 の整数
   */
  x: number;
  /**
   * 部屋の左上Y座標（グリッド単位）。
   * - 想定値: 0 〜 DungeonMap.height - 1 の整数
   */
  y: number;
  /**
   * 部屋の横幅（セル数）。
   * - 想定値: 4 〜 15 の整数
   */
  w: number;
  /**
   * 部屋の縦幅（セル数）。
   * - 想定値: 4 〜 15 の整数
   */
  h: number;
  /**
   * ショップ（店部屋）フラグ。
   * - 想定値:
   *   - `true`: 店主が常駐し商品アイテムが絨毯上に陳列されたショップ部屋
   *   - `false`: 通常のモンスター・アイテムが配置される一般部屋
   * - 初期値: ダンジョン生成時に一定確率（約20%）で1部屋のみ `true`、他は `false`
   */
  isShop?: boolean;
  /**
   * ショップ部屋に常駐している店主モンスターのID。
   * - 想定値: string（例: 'shopkeeper_1'）または `undefined`
   * - 初期値: ショップ生成時に設定
   */
  shopkeeperId?: string;
}

/**
 * ダンジョンの1フロア全体の完全な状態を表すインターフェース。
 */
export interface DungeonMap {
  /**
   * マップ全体の横幅（セル数）。
   * - 想定値: 30 〜 60 の整数（標準: 48）
   */
  width: number;
  /**
   * マップ全体の縦幅（セル数）。
   * - 想定値: 20 〜 50 の整数（標準: 36）
   */
  height: number;
  /**
   * 2次元配列によるタイルデータ [y][x]。
   * - 想定値: TileType 列挙型（Wall, Floor, Water, Bridge, Ice, Mud, Poison等）の2次元配列
   */
  tiles: TileType[][];
  /**
   * 各セルがこれまでにプレイヤーによって視認・探索されたかどうかの真偽値配列 [y][x]。
   * - 想定値: `boolean[][]`
   *   - `true`: プレイヤーが過去に一度でも視界に収めたセル（ミニマップに形状表示、視界外でも薄暗く描画）
   *   - `false`: 完全未探索の暗黒セル
   * - 初期値: 全セル `false`
   */
  explored: boolean[][];
  /**
   * 現在のターンにおいてプレイヤーの視界内に収まっているかどうかの真偽値配列 [y][x]。
   * - 想定値: `boolean[][]`
   *   - `true`: 現在のプレイヤー位置から直視できる明瞭セル（モンスターや床落ちアイテムが鮮明に可視化）
   *   - `false`: 現在は視界外の暗がり
   * - 初期値: 全セル `false`（FOV計算により毎ターン更新）
   */
  visible: boolean[][];
  /**
   * 次の深層フロアへ降りる下り階段の配置座標。
   * - 想定値: Point { x: number, y: number }
   */
  stairsDown: Point;
  /**
   * プレイヤーがこのフロアに最初に進入した際の初期スポーン座標。
   * - 想定値: Point { x: number, y: number }
   */
  startPos: Point;
  /**
   * フロア内に存在するすべての部屋のリスト。
   * - 想定値: Roomオブジェクトの配列
   */
  rooms: Room[];
  /**
   * フロア内に存在するショップ部屋の参照。
   * - 想定値: Room（ショップが存在するフロア）または `null` / `undefined`
   * - 初期値: ショップ生成フロアでのみRoom、存在しないフロアは `null`
   */
  shopRoom?: Room | null;
  /**
   * 泥棒発覚中モードフラグ。
   * - 想定値:
   *   - `true`: 未会計の商品を持ったまま店を出た、または店主に攻撃を加えたため警報発令中（番犬が出現、店主が激怒追撃）
   *   - `false`: 通常の平和なダンジョン探索中
   * - 初期値: `false`
   * - 変化契機: 未会計状態で部屋外に出たターンに `true` に設定
   */
  isThiefMode?: boolean;
  /**
   * フロア内に生存している敵モンスター・NPCのリスト。
   * - 想定値: Monsterオブジェクトの配列
   */
  monsters: Monster[];
  /**
   * フロアの床に落ちているアイテムのリスト。
   * - 想定値: Itemオブジェクトの配列
   */
  items: Item[];
  /**
   * フロア内に配置されている障害物・ギミックオブジェクトのリスト。
   * - 想定値: Obstacleオブジェクトの配列
   */
  obstacles: Obstacle[];
  /**
   * フロアの環境・バイオーム分類。
   * - 想定値: 'STONE' | 'EARTH' | 'FOREST' | 'RIVER' | 'LAKE' | 'SNOW' | 'ICE' | 'SWAMP' | 'TOXIC' | 'MECHA' | 'ISLAND' 等
   */
  biome: BiomeType;
  /**
   * 画面表示用のバイオーム和名（例: 「草木が生い茂る旧遺跡」「永久凍土と蒼氷窟」）。
   * - 想定値: 文字列
   */
  biomeName: string;
}

/**
 * プレイヤーの行動やイベントの履歴ログを表すインターフェース。
 */
export interface GameLogEntry {
  /**
   * ログエントリの一意な識別子（例: 'log_42'）。
   * - 想定値: 文字列
   */
  id: string;
  /**
   * ログが発生した総経過ターン数。
   * - 想定値: 1以上の正の整数
   */
  turn: number;
  /**
   * 表示するメッセージ本文（例: 「ゴブリンに 8 のダメージを与えた！」）。
   * - 想定値: 文字列
   */
  text: string;
  /**
   * ログの種類（UIでの色分けやモバイルティッカーの装飾枠に使用）。
   * - 想定値:
   *   - `'normal'`: 通常の一般行動ログ（白色）
   *   - `'info'`: 階段発見・アイテム拾得・システム案内（青色）
   *   - `'warning'`: 罠発動・空腹警告・敵の接近（黄色）
   *   - `'damage'`: 被ダメージ・会心の一撃・破壊（赤色）
   *   - `'turn-header'`: 店主会話・スクーターおじさん・ストーリー（金色/アンバー枠）
   * - 初期値: 'normal'
   */
  type?: 'normal' | 'info' | 'warning' | 'damage' | 'turn-header';
}
