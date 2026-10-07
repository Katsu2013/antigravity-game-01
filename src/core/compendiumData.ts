/**
 * @file compendiumData.ts
 * @description 迷宮博物誌（モンスター図鑑・アイテム図鑑）で参照される全モンスター・全アイテムの
 * 静的マスタデータ定義。ゲーム内の発見・討伐実績と照合して図鑑UIに表示します。
 */

import { ItemCategory, MonsterType } from './types';
import { SpriteId } from '../render/sprites/SVGSprites';

/**
 * モンスター図鑑のマスタ定義インターフェース。
 */
export interface MonsterCompendiumDef {
  /** モンスター種別キー */
  type: MonsterType;
  /** 変種ID（色違い・特殊変種の場合） */
  variantId?: string;
  /** 対応するスプライト画像キー */
  spriteId: SpriteId;
  /** 図鑑上の正式名称 */
  name: string;
  /** 生息・出現階層の目安テキスト */
  floorRange: string;
  /** 図鑑解説テキスト */
  description: string;
  /** 代表的な特殊能力・行動特徴 */
  features: string;
}

/**
 * アイテム図鑑のマスタ定義インターフェース。
 */
export interface ItemCompendiumDef {
  /** アイテム識別・検索用の一致キーワード（名称の部分一致） */
  matchKey: string;
  /** アイテムカテゴリ */
  category: ItemCategory;
  /** 対応するスプライト画像キー */
  spriteId: SpriteId;
  /** 図鑑上の正式名称 */
  name: string;
  /** 図鑑解説テキスト */
  description: string;
  /** アイテムの性能概要（効果値など） */
  statsSummary: string;
}

/**
 * 迷宮博物誌に収録されている全モンスターのマスタリスト。
 */
export const COMPENDIUM_MONSTER_LIST: readonly MonsterCompendiumDef[] = [
  {
    type: 'SLIME',
    spriteId: 'slime',
    name: 'グリーンスライム',
    floorRange: '1F〜',
    description: '迷宮の湿地帯に広く生息するゼリー状の軟体魔物。分裂力と跳躍力を持つ。',
    features: '基本モンスター / 序盤に出現',
  },
  {
    type: 'SLIME',
    variantId: 'red_slime',
    spriteId: 'red_slime',
    name: 'レッドスライム',
    floorRange: '6F〜',
    description: '地熱やマグマの熱気を浴びて好戦的になったスライム。攻撃力が高い。',
    features: '攻撃力特化 / 好戦的',
  },
  {
    type: 'SLIME',
    variantId: 'metal_slime',
    spriteId: 'metal_slime',
    name: 'メタルスライム',
    floorRange: '全階層 (低確率)',
    description: '金属質の強固な肉体を持つ珍種スライム。倒すと莫大な経験値を得られる。',
    features: '防御力99 / 莫大EXP / 逃走傾向',
  },
  {
    type: 'SLIME',
    variantId: 'friendly_slime',
    spriteId: 'friendly_slime',
    name: 'なかよしスライム',
    floorRange: '全階層 (奇跡)',
    description: '人間と仲良くなりたがっている奇跡の桃色スライム。攻撃せずプレゼントをくれる。',
    features: '攻撃なし / 回復・食料贈呈',
  },
  {
    type: 'GOBLIN',
    spriteId: 'goblin',
    name: 'ゴブリン',
    floorRange: '2F〜',
    description: '小柄だが狡猾な亜人。手にした棍棒を振り回して冒険者に襲いかかる。',
    features: '標準的な近接攻撃 / 群れを形成',
  },
  {
    type: 'GOBLIN',
    variantId: 'hobgoblin',
    spriteId: 'hobgoblin',
    name: 'ホブゴブリン',
    floorRange: '10F〜',
    description: '大型化し筋力を増した上位ゴブリン。力任せの豪快な強打を繰り出す。',
    features: '高攻撃力 / 高HPタフ',
  },
  {
    type: 'GOBLIN',
    variantId: 'goblin_shaman',
    spriteId: 'goblin_shaman',
    name: 'ゴブリンシャーマン',
    floorRange: '15F〜',
    description: '怪しげな精霊呪法を操るゴブリンの呪術師。遠距離から呪いを放つ。',
    features: '遠距離攻撃 / トリッキー',
  },
  {
    type: 'SKELETON',
    spriteId: 'skeleton',
    name: 'スケルトン',
    floorRange: '4F〜',
    description: '過去に倒れた冒険者の骨が魔力で動き出した不死者。錆びた剣を振るう。',
    features: 'アンデッド / 安定した剣撃',
  },
  {
    type: 'SKELETON',
    variantId: 'poison_skeleton',
    spriteId: 'poison_skeleton',
    name: 'ポイズンスケルトン',
    floorRange: '12F〜',
    description: '緑色の猛毒を骨身に纏う骸骨剣士。斬撃とともに毒素を注入する。',
    features: '毒攻撃 / アンデッド',
  },
  {
    type: 'SKELETON',
    variantId: 'blood_skeleton',
    spriteId: 'blood_skeleton',
    name: 'ブラッドスケルトン',
    floorRange: '20F〜',
    description: '鮮血を浴びて紅に染まった上位スケルトン。狂乱の強撃を繰り出す。',
    features: '狂戦士化 / 高火力',
  },
  {
    type: 'MANDRAGORA',
    spriteId: 'mandragora',
    name: 'マンドラゴラ',
    floorRange: '3F〜',
    description: '草木や根に擬態する植物魔物。土中から不意打ちの攻撃を仕掛ける。',
    features: '植物系 / 高防御 / 足止め',
  },
  {
    type: 'SAHAGIN',
    spriteId: 'sahagin',
    name: 'サハギン戦士',
    floorRange: '5F〜',
    description: '湿地帯や水流沿いに生息する半魚人。鋭い三叉槍による突進を得意とする。',
    features: '水棲系 / 鋭い槍撃',
  },
  {
    type: 'GOLEM',
    spriteId: 'golem',
    name: 'ロックゴーレム',
    floorRange: '6F〜',
    description: '迷宮の巨岩が組み合わさった岩石人形。非常に頑丈で一撃が重い。',
    features: '高防御 / 鈍足豪腕',
  },
  {
    type: 'GOLEM',
    variantId: 'magma_golem',
    spriteId: 'magma_golem',
    name: 'マグマゴーレム',
    floorRange: '25F〜',
    description: '灼熱の溶岩を核とする高熱ゴーレム。近寄る者を焼き焦がす熱波を放つ。',
    features: '炎属性 / 圧倒的高耐久',
  },
  {
    type: 'BAT',
    spriteId: 'bat',
    name: 'ヴァンパイアバット',
    floorRange: '7F〜',
    description: '洞窟の闇を飛び交う夜行性の大型蝙蝠。素早い飛翔で冒険者を翻弄する。',
    features: '飛行移動 / 素早い接近',
  },
  {
    type: 'BAT',
    variantId: 'chaos_bat',
    spriteId: 'chaos_bat',
    name: 'ケイオスバット',
    floorRange: '18F〜',
    description: '混沌の魔力を帯びた黄金のコウモリ。不規則な飛び方で幻惑する。',
    features: '高速飛行 / 回避力高',
  },
  {
    type: 'GHOST',
    spriteId: 'ghost',
    name: 'レイスゴースト',
    floorRange: '8F〜',
    description: '冷気を放ちながら浮遊する亡霊。壁や障害物をすり抜ける性質を持つ。',
    features: '壁抜け浮遊 / 物理耐性',
  },
  {
    type: 'GHOST',
    variantId: 'wraith',
    spriteId: 'wraith',
    name: 'ダークレイス',
    floorRange: '22F〜',
    description: '怨嗟の紫炎を纏う上級悪霊。触れた者の体力を冷酷に奪い去る。',
    features: '壁抜け / 凍気攻撃',
  },
  {
    type: 'MAGE',
    spriteId: 'mage',
    name: 'ダークメイジ',
    floorRange: '11F〜',
    description: '深淵の暗黒魔術を極めた邪法士。遠隔から強烈な魔法弾を連射する。',
    features: '遠距離魔法攻撃 / 高火力',
  },
  {
    type: 'ZOMBIE',
    spriteId: 'zombie',
    name: 'ゾンビ',
    floorRange: '8F〜',
    description: '腐食した肉体を揺らしながら徘徊する不死の怪物。打たれ強さが桁違い。',
    features: '超高HP / アンデッド',
  },
  {
    type: 'IMP',
    spriteId: 'imp',
    name: '狡猾なインプ',
    floorRange: '14F〜',
    description: 'すばしっこく飛び回る小悪魔。トリッキーな動きで冒険者を翻弄する。',
    features: '高機動 / 特殊攪乱',
  },
  {
    type: 'MUMMY',
    spriteId: 'mummy',
    name: '古代のミイラ男',
    floorRange: '16F〜',
    description: '古代の呪布を纏った怪人。強固な呪縛と高い耐久力で立ち塞がる。',
    features: '高防御 / 呪詛',
  },
  {
    type: 'MIMIC',
    spriteId: 'mimic',
    name: 'ミミック',
    floorRange: '10F〜',
    description: '豪華な宝箱に偽装して冒険者を待ち伏せる奇襲モンスター。噛み砕く力は強烈。',
    features: '宝箱擬態 / 不意打ち強打',
  },
  {
    type: 'DRAGON',
    spriteId: 'dragon',
    name: 'レッドドラゴン',
    floorRange: '25F〜',
    description: '迷宮深層の溶岩地帯を支配する巨竜。灼熱のブレスと圧倒的な腕力を誇る。',
    features: '火炎ブレス / 圧倒的HP・火力',
  },
  {
    type: 'DRAGON',
    variantId: 'blue_dragon',
    spriteId: 'blue_dragon',
    name: 'ブルードラゴン',
    floorRange: '35F〜',
    description: '極冷の吹雪ブレスを吐く青き巨竜。強固な氷鱗で全身を強固に守る。',
    features: '冷気ブレス / 鉄壁の鱗',
  },
  {
    type: 'DRAGON',
    variantId: 'black_dragon',
    spriteId: 'black_dragon',
    name: 'ブラックドラゴン',
    floorRange: '45F〜',
    description: '深淵の暗黒物質を纏う伝説の黒竜。魔王に次ぐ最強クラスの絶対強者。',
    features: '暗黒波 / 迷宮最強の竜',
  },
  {
    type: 'MERCHANT',
    spriteId: 'merchant_torneko',
    name: '商人トルネコ',
    floorRange: '店フロア',
    description: '迷宮内で店を開く親切な商人。だが泥棒を働くと憤怒の追撃者と化す！',
    features: '中立NPC / 泥棒時最強の敵',
  },
  {
    type: 'GUARD_DOG',
    spriteId: 'guard_dog',
    name: '警備番犬',
    floorRange: '泥棒時召喚',
    description: '店主が飼い慣らした俊足の警備犬。圧倒的な倍速移動で逃亡者を追い詰める。',
    features: '倍速移動 / 泥棒包囲網',
  },
  {
    type: 'WANDERING_ADVENTURER',
    spriteId: 'wandering_adventurer',
    name: 'さすらいの冒険者レオン',
    floorRange: '稀に出現',
    description: '同じく迷宮を探索する気さくな旅人。物々交換を持ちかけてくれる。',
    features: '友好NPC / アイテム物々交換',
  },
  {
    type: 'GAMBLER_SAGE',
    spriteId: 'gambler_sage',
    name: '賭博仙人ガンジ',
    floorRange: '稀に出現',
    description: 'じゃんけん勝負を挑んでくる謎の老人。勝てば所持品枠が拡張される！',
    features: '友好NPC / じゃんけん大勝負',
  },
  {
    type: 'HEALING_FAIRY',
    spriteId: 'healing_fairy',
    name: '慈愛の妖精ピクシー',
    floorRange: '稀に出現',
    description: '迷宮に舞い降りた心優しき妖精。敵意がなく冒険者を癒してくれる。',
    features: '友好NPC / HP全回復の祈り',
  },
  {
    type: 'TRAVELING_BLACKSMITH',
    spriteId: 'traveling_blacksmith',
    name: '鍛冶職人バルカン',
    floorRange: '稀に出現',
    description: '武器や盾を無料で鍛えてくれる腕利きの鍛冶師。',
    features: '友好NPC / 装備品の無料強化',
  },
  {
    type: 'SCOOTER_GUY',
    spriteId: 'scooter_guy',
    name: 'スクーターおじさん',
    floorRange: '神出鬼没',
    description: '原付スクーターに乗って迷宮を走り抜ける謎のオジサン。何を考えているかは不明。',
    features: '疾走通過 / 謎の存在',
  },
  {
    type: 'FOOD_STALL',
    spriteId: 'food_stall_ramen',
    name: 'ラーメン屋台 マルキン',
    floorRange: '極稀に出現 (3F〜)',
    description: '「あじゃあうえっぇー！」が口癖のおじさん店主（金さん）が営む奇跡のラーメン屋台。空腹を満たしてくれる迷宮のオアシス。たまに奥さんが出てきて「ウチやってません」と門前払いされる。',
    features: '友好NPC / 満腹度全快 / 最大満腹度拡張 / コミカル門前払い',
  },
  {
    type: 'ABYSS_LORD',
    spriteId: 'abyss_lord',
    name: '魔王アビス・ロード',
    floorRange: '50F (最深部)',
    description: '第50層最深部で待ち受ける迷宮の絶対君主。圧倒的な魔力で世界の終末を目論む。',
    features: '大ボス / 広範囲強打 / 高耐久',
  },
];

/**
 * 迷宮博物誌に収録されている全アイテムのマスタリスト。
 */
export const COMPENDIUM_ITEM_LIST: readonly ItemCompendiumDef[] = [
  // 武器
  {
    matchKey: '短剣',
    category: 'WEAPON',
    spriteId: 'item_weapon_dagger',
    name: '青銅の短剣',
    description: '軽量で扱いやすい短剣。小回りが利く。',
    statsSummary: '攻撃力 +3',
  },
  {
    matchKey: '鉄の剣',
    category: 'WEAPON',
    spriteId: 'item_weapon',
    name: '鉄の剣',
    description: '鍛冶屋で打たれた堅牢な標準の剣。',
    statsSummary: '攻撃力 +6',
  },
  {
    matchKey: '炎の剣',
    category: 'WEAPON',
    spriteId: 'item_weapon_flame',
    name: '炎の剣',
    description: '刀身に火炎の魔力を宿す灼熱の業物。植物系魔物に特効。',
    statsSummary: '攻撃力 +10 / 火炎属性',
  },
  {
    matchKey: 'ルーン',
    category: 'WEAPON',
    spriteId: 'item_weapon_rune',
    name: 'ルーンの剣',
    description: '古代の呪文が刻まれた魔導の剣。印の合成スロットが多い。',
    statsSummary: '攻撃力 +8 / 合成適性',
  },
  {
    matchKey: 'ミスリル',
    category: 'WEAPON',
    spriteId: 'item_weapon_mithril',
    name: 'ミスリルブレード',
    description: 'ミスリル銀で鍛え上げられた神聖な刃。アンデッドを容易に断つ。',
    statsSummary: '攻撃力 +14 / アンデッド特効',
  },
  {
    matchKey: '妖刀ムラマサ',
    category: 'WEAPON',
    spriteId: 'item_weapon_muramasa',
    name: '妖刀ムラマサ',
    description: '妖気漂う伝説の名刀。会心の一撃を放ちやすい。',
    statsSummary: '攻撃力 +18 / 高会心率',
  },
  {
    matchKey: 'ウォーハンマー',
    category: 'WEAPON',
    spriteId: 'item_weapon_warhammer',
    name: 'ウォーハンマー',
    description: '重厚な金属塊を備えた戦槌。ゴーレムの装甲を粉砕する。',
    statsSummary: '攻撃力 +12 / 岩石特効',
  },
  {
    matchKey: 'ホーリーランス',
    category: 'WEAPON',
    spriteId: 'item_weapon_holy_lance',
    name: 'ホーリーランス',
    description: '清らかな聖光を放つ長槍。悪しき邪悪を浄化する。',
    statsSummary: '攻撃力 +15 / 聖属性',
  },

  // 盾
  {
    matchKey: '木の盾',
    category: 'SHIELD',
    spriteId: 'item_shield_wood',
    name: '木の盾',
    description: '頑丈なオーク材で作られた軽盾。',
    statsSummary: '防御力 +2',
  },
  {
    matchKey: '青銅の盾',
    category: 'SHIELD',
    spriteId: 'item_shield_bronze',
    name: '青銅の盾',
    description: '青銅で鋳造されたしっかりとした盾。',
    statsSummary: '防御力 +4',
  },
  {
    matchKey: '鉄の盾',
    category: 'SHIELD',
    spriteId: 'item_shield',
    name: '鉄の盾',
    description: '鍛鉄で作られた信頼できる防具。',
    statsSummary: '防御力 +7',
  },
  {
    matchKey: '魔法の盾',
    category: 'SHIELD',
    spriteId: 'item_shield_magic',
    name: '魔法の盾',
    description: '魔術的な障壁を展開し、敵の魔法弾の威力を和らげる。',
    statsSummary: '防御力 +9 / 魔法耐性',
  },
  {
    matchKey: 'ドラゴンシールド',
    category: 'SHIELD',
    spriteId: 'item_shield_dragon',
    name: 'ドラゴンシールド',
    description: 'ドラゴンの硬質鱗で作られた重盾。炎ブレスの熱を大幅にカットする。',
    statsSummary: '防御力 +12 / 竜炎半減',
  },
  {
    matchKey: '風魔の盾',
    category: 'SHIELD',
    spriteId: 'item_shield_wind',
    name: '風魔の盾',
    description: '風をまとい矢や飛翔物の直撃をそらす伝説の盾。',
    statsSummary: '防御力 +15 / 飛び道具軽減',
  },
  {
    matchKey: 'タワーシールド',
    category: 'SHIELD',
    spriteId: 'item_shield_tower',
    name: 'タワーシールド',
    description: '全身をすっぽり覆う巨大な大盾。物理防御が極めて高い。',
    statsSummary: '防御力 +16',
  },
  {
    matchKey: 'イージスの盾',
    category: 'SHIELD',
    spriteId: 'item_shield_aegis',
    name: 'イージスの盾',
    description: '神々の加護が宿る最高峰の聖盾。あらゆる状態異常と錆を遮断する。',
    statsSummary: '防御力 +20 / 完全錆防止',
  },

  // 草・ポーション
  {
    matchKey: '薬草',
    category: 'POTION',
    spriteId: 'item_potion',
    name: '薬草',
    description: '生薬の効能で傷を癒す緑の草。HPが全快の時は最大HPが1上昇する。',
    statsSummary: 'HP +25 回復 / 最大HP+1',
  },
  {
    matchKey: '特薬草',
    category: 'POTION',
    spriteId: 'item_potion_high',
    name: '特薬草',
    description: '調合により純度を高めた良質な薬草。HPを大きく回復する。',
    statsSummary: 'HP +50 回復 / 最大HP+2',
  },
  {
    matchKey: '弟切草',
    category: 'POTION',
    spriteId: 'item_potion_otogiri',
    name: '弟切草',
    description: '強壮な薬効を持つ伝説の薬草。HPをほぼ全快近くまで回復する。',
    statsSummary: 'HP +100 回復 / 最大HP+3',
  },
  {
    matchKey: '命の草',
    category: 'POTION',
    spriteId: 'item_potion_life',
    name: '命の草',
    description: '生命力を底上げする神秘の草。最大HPを永続的に増加させる。',
    statsSummary: '最大HP +5 永続上昇',
  },
  {
    matchKey: '力の種',
    category: 'POTION',
    spriteId: 'item_seed',
    name: '力の種',
    description: '食べると身体の芯から筋力が湧き出る赤い種子。攻撃力を永続的に増加させる。',
    statsSummary: '攻撃力 +1 永続上昇',
  },
  {
    matchKey: '剛力',
    category: 'POTION',
    spriteId: 'item_potion_str',
    name: '剛力の丸薬',
    description: '一時的に超人的な腕力を引き出す秘薬。数ターンの間与ダメージが倍増する。',
    statsSummary: '攻撃力大幅ブースト',
  },
  {
    matchKey: '毒消し草',
    category: 'POTION',
    spriteId: 'item_potion_antidote',
    name: '毒消し草',
    description: '体内の毒素を中和し、低下した力を元に戻す薬草。',
    statsSummary: '毒解除 / 攻撃力低下回復',
  },
  {
    matchKey: 'すばやさ',
    category: 'POTION',
    spriteId: 'item_potion_agi',
    name: 'すばやさの草',
    description: '身体が羽のように軽くなる不思議な草。一定ターン倍速行動が可能になる。',
    statsSummary: '倍速行動モード付与',
  },
  {
    matchKey: '復活の草',
    category: 'POTION',
    spriteId: 'item_potion_revive',
    name: '復活の草',
    description: '持っているだけで、HPが0になった際に自動で消費され全快復活する奇跡の草。',
    statsSummary: '持参時 自動蘇生',
  },

  // 食料
  {
    matchKey: '大きなパン',
    category: 'FOOD',
    spriteId: 'item_food',
    name: '大きなパン',
    description: '香ばしく焼き上げられた冒険者の主食。満腹度を大きく回復する。',
    statsSummary: '満腹度 +50% 回復',
  },
  {
    matchKey: 'おにぎり',
    category: 'FOOD',
    spriteId: 'item_food_riceball',
    name: '特製おにぎり',
    description: '米を握った携帯食糧。満腹度をバランスよく回復する。',
    statsSummary: '満腹度 +40% 回復',
  },
  {
    matchKey: '巨大なおにぎり',
    category: 'FOOD',
    spriteId: 'item_food_big_riceball',
    name: '巨大なおにぎり',
    description: '両手サイズの巨大おにぎり。満腹度を100%全回復する。',
    statsSummary: '満腹度 100% 全回復',
  },

  // 巻物
  {
    matchKey: 'ワープの巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll',
    name: 'ワープの巻物',
    description: '空間転移の魔導文字が記された巻物。フロア内のランダムな安全な場所へ転移する。',
    statsSummary: '同フロア内ランダム転移',
  },
  {
    matchKey: '雷の巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll_thunder',
    name: '雷の巻物',
    description: '部屋中、または周囲の敵すべてに電撃を落とし、大ダメージを与える。',
    statsSummary: '部屋全体 30電撃ダメージ',
  },
  {
    matchKey: 'あかりの巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll_light',
    name: 'あかりの巻物',
    description: '聖なる光でフロア全体のマップ構造と全モンスター・アイテムの配置を可視化する。',
    statsSummary: 'フロア全マップ＆気配開示',
  },
  {
    matchKey: '睡眠の巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll_sleep',
    name: '睡眠の巻物',
    description: '部屋中に催眠の波動を放ち、敵全体を深い眠りにつかせる。',
    statsSummary: '部屋全体モンスター昏睡',
  },
  {
    matchKey: '混乱の巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll_confuse',
    name: '混乱の巻物',
    description: '部屋中の敵を錯乱させ、デタラメに移動・味方同士で攻撃させる。',
    statsSummary: '部屋全体モンスター混乱',
  },
  {
    matchKey: '天の恵み',
    category: 'SCROLL',
    spriteId: 'item_scroll_upgrade_atk',
    name: '天の恵みの巻物',
    description: '神聖な祈りが記された巻物。装備中の武器の鍛錬値を+1強化する。',
    statsSummary: '装備武器 +1 鍛錬強化',
  },
  {
    matchKey: '地の恵み',
    category: 'SCROLL',
    spriteId: 'item_scroll_upgrade_def',
    name: '地の恵みの巻物',
    description: '大地の大地霊の加護が記された巻物。装備中の盾の鍛錬値を+1強化する。',
    statsSummary: '装備盾 +1 鍛錬強化',
  },
  {
    matchKey: '真空斬り',
    category: 'SCROLL',
    spriteId: 'item_scroll_vacuum',
    name: '真空斬りの巻物',
    description: '大気のかまいたちを発生させ、部屋中の全モンスターを切り刻む。',
    statsSummary: '部屋全体 40風刃ダメージ',
  },
  {
    matchKey: '識別の巻物',
    category: 'SCROLL',
    spriteId: 'item_scroll',
    name: '識別の巻物',
    description: '真実を見通す鑑定術式。未識別の道具の正体を完全に看破する。',
    statsSummary: '所持品鑑定 / 同名品一括識別',
  },

  // 魔法の杖
  {
    matchKey: '吹き飛ばし',
    category: 'STAFF',
    spriteId: 'item_staff_blast',
    name: '吹き飛ばしの杖',
    description: '命中した対象を一直線に10マス後方へ吹き飛ばし、壁激突でダメージを与える。',
    statsSummary: '10マス吹き飛ばし / 激突5ダメ',
  },
  {
    matchKey: '場所替え',
    category: 'STAFF',
    spriteId: 'item_staff_switch',
    name: '場所替えの杖',
    description: '魔法弾が命中した敵とプレイヤーの位置を一瞬で入れ替える。',
    statsSummary: '対象モンスターと位置交換',
  },
  {
    matchKey: 'かなしばり',
    category: 'STAFF',
    spriteId: 'item_staff_paralyze',
    name: 'かなしばりの杖',
    description: '命中した敵の身体を麻痺させ、ダメージを受けるまで一切の行動を停止させる。',
    statsSummary: '永続金縛り（被弾で解除）',
  },
  {
    matchKey: '雷鳴',
    category: 'STAFF',
    spriteId: 'item_staff_thunder',
    name: '雷鳴の杖',
    description: '直線貫通する強力な雷光を放射し、一直線上の敵全員に大ダメージを与える。',
    statsSummary: '直線貫通 25電撃ダメージ',
  },

  // 矢・飛び道具
  {
    matchKey: '鉄の矢',
    category: 'ARROW',
    spriteId: 'item_arrow_iron',
    name: '鉄の矢',
    description: '鉄製の鏃を装着した標準的な矢。遠距離から安全に敵を射抜ける。',
    statsSummary: '遠距離直線 射程10マス',
  },
  {
    matchKey: '銀の矢',
    category: 'ARROW',
    spriteId: 'item_arrow_silver',
    name: '銀の矢',
    description: '純銀で鋳造された魔導矢。敵や障害物を一直線に貫通して突き抜ける。',
    statsSummary: '直線完全貫通 射撃',
  },

  // 腕輪・装飾品
  {
    matchKey: '通過の腕輪',
    category: 'TALISMAN',
    spriteId: 'item_ring',
    name: '通過の腕輪',
    description: '水面や水路の上を地面と同じように歩行できるようになる不思議な腕輪。',
    statsSummary: '水路侵入・水上歩行可能',
  },
  {
    matchKey: 'ちからの腕輪',
    category: 'TALISMAN',
    spriteId: 'item_ring',
    name: 'ちからの腕輪',
    description: '装備者の内なる腕力を増幅させる腕輪。攻撃力と腕力が+3加算される。',
    statsSummary: '攻撃力 +3 / 腕力底上げ',
  },
  {
    matchKey: '会心の腕輪',
    category: 'TALISMAN',
    spriteId: 'item_ring',
    name: '会心の腕輪',
    description: '気迫を研ぎ澄まし、通常攻撃のクリティカルヒット確率を飛躍的に向上させる。',
    statsSummary: 'クリティカル率大幅アップ',
  },
  {
    matchKey: '幸運の腕輪',
    category: 'TALISMAN',
    spriteId: 'item_ring',
    name: '幸運の腕輪',
    description: '幸運の女神の微笑みを受ける腕輪。敵を倒した際のアイテムドロップ率が上昇する。',
    statsSummary: '道具ドロップ率上昇',
  },

  // 壺
  {
    matchKey: '合成の壺',
    category: 'POT',
    spriteId: 'item_pot_synthesis',
    name: '合成の壺',
    description: 'ベース装備と素材装備を投入することで、鍛錬値と印を融合錬成する秘壺。',
    statsSummary: '武具錬成 / 鍛錬値・印合成',
  },

  // 通貨
  {
    matchKey: 'ゴールド',
    category: 'GOLD',
    spriteId: 'item_gold',
    name: '金貨（ゴールド）',
    description: '迷宮内で流通する通貨。店主からの買い物やNPC対話の代金として使用する。',
    statsSummary: '通貨 / 店での売買用',
  },
];
