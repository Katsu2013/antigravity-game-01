/**
 * @file MonsterAndItemSprites.ts
 * @description 追加モンスター4種（コウモリ、ゴースト、ダークメイジ、レッドドラゴン）の5大方向SVGスプライト、
 * および追加アイテム（短剣、炎の剣、ルーンの剣、木の盾、青銅の盾、魔法の盾、おにぎり、雷の巻物、あかりの巻物など）の
 * ベクターSVGグラフィックを定義・提供するモジュール。
 */

/**
 * 追加エンティティおよび追加アイテムのSVG定義クラス。
 */
export class MonsterAndItemSprites {
  // =========================================================================
  // 1. 吸血コウモリ (BAT) - 5方向
  // =========================================================================

  /** コウモリ正面（下向き: 広げた紫の翼、赤い瞳、鋭い牙） */
  public static readonly BAT_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 左翼 -->
  <path d="M30 30 Q16 16 2 24 Q10 36 18 36 Q22 42 30 36 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.5"/>
  <!-- 右翼 -->
  <path d="M34 30 Q48 16 62 24 Q54 36 46 36 Q42 42 34 36 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.5"/>
  <!-- 胴体 -->
  <ellipse cx="32" cy="34" rx="7" ry="9" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <!-- 尖った耳 -->
  <polygon points="27,27 25,18 30,24" fill="#a855f7" stroke="#3b0764" stroke-width="1"/>
  <polygon points="37,27 39,18 34,24" fill="#a855f7" stroke="#3b0764" stroke-width="1"/>
  <!-- 赤い瞳 -->
  <circle cx="29" cy="32" r="2" fill="#ef4444"/>
  <circle cx="35" cy="32" r="2" fill="#ef4444"/>
  <!-- 小さな牙 -->
  <polygon points="30,37 31,40 32,37" fill="#ffffff"/>
  <polygon points="32,37 33,40 34,37" fill="#ffffff"/>
</svg>`.trim();

  /** コウモリ背面（上向き） */
  public static readonly BAT_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M30 30 Q16 16 2 24 Q10 36 18 36 Q22 42 30 36 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <path d="M34 30 Q48 16 62 24 Q54 36 46 36 Q42 42 34 36 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <ellipse cx="32" cy="34" rx="7" ry="9" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="27,27 25,18 30,24" fill="#581c87"/>
  <polygon points="37,27 39,18 34,24" fill="#581c87"/>
</svg>`.trim();

  /** コウモリ真横 */
  public static readonly BAT_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M26 32 Q12 18 6 28 Q18 36 28 36 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.5"/>
  <ellipse cx="34" cy="34" rx="8" ry="9" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="32,26 33,17 38,24" fill="#a855f7" stroke="#3b0764" stroke-width="1"/>
  <circle cx="39" cy="32" r="2" fill="#ef4444"/>
  <polygon points="40,36 42,39 43,36" fill="#ffffff"/>
  <path d="M32 30 Q44 14 56 22 Q46 32 36 34 Z" fill="#6b21a8" stroke="#3b0764" stroke-width="1.5"/>
</svg>`.trim();

  /** コウモリ斜め前 */
  public static readonly BAT_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M26 30 Q12 14 2 24 Q12 36 22 36 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.5"/>
  <path d="M34 30 Q50 16 60 26 Q50 38 40 36 Z" fill="#6b21a8" stroke="#3b0764" stroke-width="1.5"/>
  <ellipse cx="32" cy="34" rx="7.5" ry="9" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="28,26 27,17 32,23" fill="#a855f7"/>
  <polygon points="36,26 38,17 34,23" fill="#a855f7"/>
  <circle cx="31" cy="32" r="2" fill="#ef4444"/>
  <circle cx="36" cy="32" r="1.8" fill="#ef4444"/>
</svg>`.trim();

  /** コウモリ斜め後ろ */
  public static readonly BAT_DIAG_UP_SVG = MonsterAndItemSprites.BAT_UP_SVG;

  // =========================================================================
  // 2. 彷徨う亡霊 (GHOST) - 5方向
  // =========================================================================

  /** ゴースト正面（下向き: 青白く揺らめく霊体、怪しい目、たなびく尾） */
  public static readonly GHOST_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.25)"/>
  <!-- 揺らめく霊体オーラ -->
  <path d="M32 10 Q48 10 48 30 Q48 48 40 52 Q32 44 24 52 Q16 48 16 30 Q16 10 32 10 Z" fill="#0891b2" opacity="0.4"/>
  <!-- 霊体本体 -->
  <path d="M32 12 Q46 12 46 30 Q46 44 38 48 Q32 42 26 48 Q18 44 18 30 Q18 12 32 12 Z" fill="#67e8f9" stroke="#0e7490" stroke-width="1.5"/>
  <!-- 霊体の腕 -->
  <path d="M18 28 Q8 32 14 38 Q20 34 20 30 Z" fill="#a5f3fc"/>
  <path d="M46 28 Q56 32 50 38 Q44 34 44 30 Z" fill="#a5f3fc"/>
  <!-- 怪しく光る目 -->
  <ellipse cx="26" cy="24" rx="3.5" ry="5" fill="#083344"/>
  <circle cx="26" cy="23" r="1.5" fill="#ffffff"/>
  <ellipse cx="38" cy="24" rx="3.5" ry="5" fill="#083344"/>
  <circle cx="38" cy="23" r="1.5" fill="#ffffff"/>
  <!-- 不気味な口 -->
  <ellipse cx="32" cy="34" rx="4" ry="5" fill="#083344"/>
</svg>`.trim();

  /** ゴースト背面（上向き） */
  public static readonly GHOST_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.25)"/>
  <path d="M32 10 Q48 10 48 30 Q48 48 40 52 Q32 44 24 52 Q16 48 16 30 Q16 10 32 10 Z" fill="#0891b2" opacity="0.4"/>
  <path d="M32 12 Q46 12 46 30 Q46 44 38 48 Q32 42 26 48 Q18 44 18 30 Q18 12 32 12 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
</svg>`.trim();

  /** ゴースト真横 */
  public static readonly GHOST_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.25)"/>
  <path d="M30 12 Q44 14 44 30 Q44 44 36 48 Q28 42 20 48 Q16 38 18 26 Q20 12 30 12 Z" fill="#67e8f9" stroke="#0e7490" stroke-width="1.5"/>
  <path d="M36 28 Q48 30 44 36 Q38 34 38 30 Z" fill="#a5f3fc"/>
  <ellipse cx="38" cy="24" rx="3.5" ry="5" fill="#083344"/>
  <circle cx="38" cy="23" r="1.5" fill="#ffffff"/>
  <ellipse cx="42" cy="34" rx="3" ry="4" fill="#083344"/>
</svg>`.trim();

  /** ゴースト斜め前 */
  public static readonly GHOST_DIAG_DOWN_SVG = MonsterAndItemSprites.GHOST_DOWN_SVG;
  /** ゴースト斜め後ろ */
  public static readonly GHOST_DIAG_UP_SVG = MonsterAndItemSprites.GHOST_UP_SVG;

  // =========================================================================
  // 3. ダークメイジ (MAGE) - 5方向
  // =========================================================================

  /** ダークメイジ正面（深紫の星飾フード、魔導杖、金糸装飾ローブ、怪光眼） */
  public static readonly MAGE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <!-- ローブ裾（布の重なりと金糸トリム） -->
  <path d="M22 28 L14 54 L50 54 L42 28 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M26 28 L20 54 L44 54 L38 28 Z" fill="#3b0764"/>
  <line x1="16" y1="52" x2="48" y2="52" stroke="#fbbf24" stroke-width="1.5"/>
  <path d="M32 28 L32 52" stroke="#d97706" stroke-width="1" stroke-dasharray="2,2"/>
  <!-- 尖がりフード頭部（深い陰影） -->
  <path d="M20 28 Q32 2 44 28 Q32 24 20 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M24 24 Q32 8 40 24" stroke="#581c87" stroke-width="2" fill="none"/>
  <!-- フード内の深淵の闇と怪しく光る紫眼 -->
  <path d="M22 25 Q32 21 42 25 Q32 29 22 25 Z" fill="#020617"/>
  <ellipse cx="27" cy="25" rx="2.5" ry="1.5" fill="#f0abfc"/>
  <circle cx="27" cy="25" r="0.8" fill="#ffffff"/>
  <ellipse cx="37" cy="25" rx="2.5" ry="1.5" fill="#f0abfc"/>
  <circle cx="37" cy="25" r="0.8" fill="#ffffff"/>
  <!-- 魔導杖（木目シャフト、金台座、浮遊する魔力オーブ） -->
  <line x1="48" y1="12" x2="48" y2="52" stroke="#451a03" stroke-width="3"/>
  <polygon points="45,14 51,14 48,18" fill="#fbbf24"/>
  <circle cx="48" cy="11" r="5.5" fill="#a855f7" stroke="#e879f9" stroke-width="1.5"/>
  <circle cx="46.5" cy="9.5" r="1.8" fill="#ffffff"/>
</svg>`.trim();

  /** ダークメイジ背面（上向き） */
  public static readonly MAGE_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M22 28 L14 54 L50 54 L42 28 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M20 28 Q32 2 44 28 Q32 24 20 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <line x1="16" y1="52" x2="48" y2="52" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="48" y1="12" x2="48" y2="52" stroke="#451a03" stroke-width="3"/>
  <circle cx="48" cy="11" r="5" fill="#a855f7"/>
</svg>`.trim();

  /** ダークメイジ真横 */
  public static readonly MAGE_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M24 28 L16 54 L44 54 L38 28 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M20 28 Q30 2 42 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <line x1="18" y1="52" x2="42" y2="52" stroke="#fbbf24" stroke-width="1.5"/>
  <circle cx="36" cy="25" r="1.8" fill="#f0abfc"/>
  <line x1="44" y1="14" x2="44" y2="52" stroke="#451a03" stroke-width="3"/>
  <circle cx="44" cy="13" r="5" fill="#a855f7" stroke="#e879f9" stroke-width="1.5"/>
  <circle cx="42.5" cy="11.5" r="1.5" fill="#ffffff"/>
</svg>`.trim();

  /** ダークメイジ斜め前 */
  public static readonly MAGE_DIAG_DOWN_SVG = MonsterAndItemSprites.MAGE_DOWN_SVG;
  /** ダークメイジ斜め後ろ */
  public static readonly MAGE_DIAG_UP_SVG = MonsterAndItemSprites.MAGE_UP_SVG;

  // =========================================================================
  // 4. レッドドラゴン (DRAGON) - 5方向
  // =========================================================================

  /** レッドドラゴン正面（巨大な龍角、翼の皮膜骨格、赤熱した蛇腹甲、黄金の縦瞳孔） */
  public static readonly DRAGON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.45)"/>
  <!-- 巨大な竜翼（左・右、骨格と皮膜） -->
  <path d="M24 28 Q6 8 2 18 Q10 34 24 38 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.8"/>
  <path d="M24 28 Q8 12 5 20 Q12 30 24 34 Z" fill="#b91c1c"/>
  <line x1="24" y1="28" x2="4" y2="19" stroke="#991b1b" stroke-width="2"/>
  <path d="M40 28 Q58 8 62 18 Q54 34 40 38 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.8"/>
  <path d="M40 28 Q56 12 59 20 Q52 30 40 34 Z" fill="#b91c1c"/>
  <line x1="40" y1="28" x2="60" y2="19" stroke="#991b1b" stroke-width="2"/>
  <!-- 竜の胴体と赤熱蛇腹甲 -->
  <rect x="22" y="32" width="20" height="24" rx="6" fill="#991b1b" stroke="#450a0a" stroke-width="2"/>
  <rect x="25" y="35" width="14" height="4.5" rx="2" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <rect x="25" y="41" width="14" height="4.5" rx="2" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <rect x="26" y="47" width="12" height="4.5" rx="2" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <!-- 獰猛な竜頭 -->
  <circle cx="32" cy="23" r="13" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
  <!-- 巨大な角（外側へ鋭く湾曲） -->
  <path d="M24 17 Q14 4 12 2 Q22 6 26 14 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
  <path d="M40 17 Q50 4 52 2 Q42 6 38 14 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
  <!-- 黄金の爬虫類瞳（縦スリット瞳孔） -->
  <ellipse cx="27" cy="23" rx="3.2" ry="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <line x1="27" y1="20" x2="27" y2="26" stroke="#000000" stroke-width="1.8"/>
  <ellipse cx="37" cy="23" rx="3.2" ry="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <line x1="37" y1="20" x2="37" y2="26" stroke="#000000" stroke-width="1.8"/>
  <!-- 鼻腔の赤熱ブレス光と鋭い牙 -->
  <circle cx="30" cy="29" r="1.2" fill="#ef4444"/>
  <circle cx="34" cy="29" r="1.2" fill="#ef4444"/>
  <polygon points="29,31 30.5,35 32,31" fill="#ffffff"/>
  <polygon points="32,31 33.5,35 35,31" fill="#ffffff"/>
</svg>`.trim();

  /** レッドドラゴン背面（上向き） */
  public static readonly DRAGON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
  <path d="M24 28 Q8 10 2 20 Q12 34 24 38 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
  <path d="M40 28 Q56 10 62 20 Q52 34 40 38 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
  <rect x="22" y="32" width="20" height="24" rx="6" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="32" cy="24" r="13" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2"/>
  <polygon points="24,18 16,6 26,14" fill="#fbbf24"/>
  <polygon points="40,18 48,6 38,14" fill="#fbbf24"/>
</svg>`.trim();

  /** レッドドラゴン真横 */
  public static readonly DRAGON_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
  <path d="M20 28 Q4 10 0 20 Q10 34 20 38 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
  <rect x="22" y="32" width="20" height="24" rx="6" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2"/>
  <circle cx="36" cy="24" r="13" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
  <polygon points="42,20 54,26 42,28" fill="#dc2626"/>
  <polygon points="32,16 26,4 34,12" fill="#fbbf24"/>
  <ellipse cx="38" cy="22" rx="3" ry="4" fill="#fbbf24"/>
  <line x1="38" y1="19" x2="38" y2="25" stroke="#000000" stroke-width="1.5"/>
</svg>`.trim();

  /** レッドドラゴン斜め前 */
  public static readonly DRAGON_DIAG_DOWN_SVG = MonsterAndItemSprites.DRAGON_DOWN_SVG;
  /** レッドドラゴン斜め後ろ */
  public static readonly DRAGON_DIAG_UP_SVG = MonsterAndItemSprites.DRAGON_UP_SVG;

  // =========================================================================
  // 5. 追加アイテムSVG
  // =========================================================================

  /** 特製おにぎり（海苔が巻かれた三角形のおにぎり） */
  public static readonly ITEM_FOOD_RICEBALL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="18" ry="4.5" fill="rgba(0,0,0,0.3)"/>
  <!-- 三角形ごはん -->
  <path d="M32 14 Q36 14 48 38 Q50 48 40 50 Q24 50 16 48 Q14 38 26 14 Q30 14 32 14 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.8"/>
  <!-- 海苔 -->
  <rect x="24" y="32" width="16" height="18" rx="2" fill="#0f172a" stroke="#020617" stroke-width="1"/>
  <!-- 梅干し・ごまアクセント -->
  <circle cx="32" cy="26" r="2.5" fill="#ef4444"/>
</svg>`.trim();

  /** 青銅の短剣 */
  public static readonly ITEM_WEAPON_DAGGER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,16 35,22 34,42 30,42 29,22" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
    <rect x="25" y="42" width="14" height="3" rx="1" fill="#78350f"/>
    <rect x="30.5" y="45" width="3" height="7" fill="#451a03"/>
  </g>
</svg>`.trim();

  /** 炎の剣 */
  public static readonly ITEM_WEAPON_FLAME_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <g transform="rotate(45 32 32)">
    <path d="M32 4 Q38 18 36 42 L28 42 Q26 18 32 4 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
    <polygon points="32,6 34,16 33,40 31,40 30,16" fill="#fef08a"/>
    <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#991b1b"/>
    <circle cx="32" cy="58" r="3" fill="#f97316"/>
  </g>
</svg>`.trim();

  /** ルーンの剣 */
  public static readonly ITEM_WEAPON_RUNE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,4 37,12 35,42 29,42 27,12" fill="#a855f7" stroke="#6b21a8" stroke-width="2"/>
    <circle cx="32" cy="20" r="2" fill="#ffffff"/>
    <rect x="20" y="42" width="24" height="4.5" rx="2" fill="#581c87"/>
    <circle cx="32" cy="58" r="3.5" fill="#c084fc"/>
  </g>
</svg>`.trim();

  /** 木の盾 */
  public static readonly ITEM_SHIELD_WOOD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="34" r="18" fill="#78350f" stroke="#451a03" stroke-width="2.5"/>
  <circle cx="32" cy="34" r="12" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="5" fill="#b45309"/>
</svg>`.trim();

  /** 青銅の盾 */
  public static readonly ITEM_SHIELD_BRONZE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="34" r="18" fill="#b45309" stroke="#78350f" stroke-width="2.5"/>
  <circle cx="32" cy="34" r="13" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
  <polygon points="32,24 35,32 42,34 35,36 32,44 29,36 22,34 29,32" fill="#fef3c7"/>
</svg>`.trim();

  /** 魔法の盾 */
  public static readonly ITEM_SHIELD_MAGIC_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 18 Q32 14 48 18 Q48 40 32 54 Q16 40 16 18 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="8" fill="none" stroke="#a5f3fc" stroke-width="1.5"/>
  <polygon points="32,26 36,32 32,38 28,32" fill="#a5f3fc"/>
</svg>`.trim();

  /** 剛力の秘薬 */
  public static readonly ITEM_POTION_STR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="28" y="14" width="8" height="6" rx="1" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.5"/>
  <rect x="26" y="20" width="12" height="4" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="16" fill="rgba(15,23,42,0.4)" stroke="#ef4444" stroke-width="2"/>
  <path d="M18 42 C18 50 24 56 32 56 C40 56 46 50 46 42 Q39 40 32 42 Q25 44 18 42 Z" fill="#dc2626"/>
  <circle cx="28" cy="46" r="2.5" fill="#f87171"/>
  <circle cx="36" cy="49" r="1.5" fill="#fca5a5"/>
</svg>`.trim();

  /** 雷の巻物 */
  public static readonly ITEM_SCROLL_THUNDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="#78350f"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="#78350f"/>
  <rect x="15" y="18" width="34" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <polygon points="34,22 26,34 32,34 28,44 40,30 33,30" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
</svg>`.trim();

  /** あかりの巻物 */
  public static readonly ITEM_SCROLL_LIGHT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="#78350f"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="#78350f"/>
  <rect x="15" y="18" width="34" height="30" fill="#f0f9ff" stroke="#0284c7" stroke-width="1.5"/>
  <circle cx="32" cy="33" r="6" fill="#38bdf8"/>
  <circle cx="32" cy="33" r="3" fill="#ffffff"/>
  <line x1="32" y1="23" x2="32" y2="25" stroke="#38bdf8" stroke-width="2"/>
  <line x1="32" y1="41" x2="32" y2="43" stroke="#38bdf8" stroke-width="2"/>
  <line x1="22" y1="33" x2="24" y2="33" stroke="#38bdf8" stroke-width="2"/>
  <line x1="40" y1="33" x2="42" y2="33" stroke="#38bdf8" stroke-width="2"/>
</svg>`.trim();

  // =========================================================================
  // 新モンスター4種（MIMIC, ZOMBIE, IMP, MUMMY）
  // =========================================================================

  /** 人食い箱 (MIMIC) - 正面（開いた宝箱、鉄帯と金鋲、リアルな牙、長い舌、怪しい目） */
  public static readonly MIMIC_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.4)"/>
  <!-- 宝箱下部（オーク木目と鉄の鋲） -->
  <rect x="12" y="30" width="40" height="26" rx="3" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <rect x="10" y="30" width="44" height="5.5" fill="#92400e"/>
  <!-- 鉄の補強帯とリベット鋲 -->
  <rect x="15" y="30" width="4" height="26" fill="#334155"/>
  <circle cx="17" cy="33" r="1" fill="#cbd5e1"/>
  <circle cx="17" cy="43" r="1" fill="#cbd5e1"/>
  <circle cx="17" cy="52" r="1" fill="#cbd5e1"/>
  <rect x="45" y="30" width="4" height="26" fill="#334155"/>
  <circle cx="47" cy="33" r="1" fill="#cbd5e1"/>
  <circle cx="47" cy="43" r="1" fill="#cbd5e1"/>
  <circle cx="47" cy="52" r="1" fill="#cbd5e1"/>
  <!-- 口の中（深紅の闇） -->
  <rect x="14" y="21" width="36" height="15" rx="2" fill="#4c0519"/>
  <!-- 上蓋（大きく開口） -->
  <path d="M10 21 Q32 6 54 21 L52 13 Q32 2 12 13 Z" fill="#92400e" stroke="#451a03" stroke-width="2"/>
  <path d="M12 14 Q32 4 52 14" stroke="#d97706" stroke-width="1.2" fill="none"/>
  <!-- 鋭い牙（上下のギザギザ歯列） -->
  <polygon points="15,21 17,27 19,21" fill="#f8fafc"/>
  <polygon points="21,21 23,28 25,21" fill="#f8fafc"/>
  <polygon points="27,21 29,27 31,21" fill="#f8fafc"/>
  <polygon points="33,21 35,27 37,21" fill="#f8fafc"/>
  <polygon points="39,21 41,28 43,21" fill="#f8fafc"/>
  <polygon points="45,21 47,27 49,21" fill="#f8fafc"/>
  <polygon points="17,35 19,30 21,35" fill="#f8fafc"/>
  <polygon points="23,35 25,29 27,35" fill="#f8fafc"/>
  <polygon points="37,35 39,29 41,35" fill="#f8fafc"/>
  <polygon points="43,35 45,30 47,35" fill="#f8fafc"/>
  <!-- 覗く血走った眼球 -->
  <circle cx="23" cy="19" r="3.2" fill="#dc2626"/>
  <circle cx="23" cy="19" r="1.3" fill="#fef08a"/>
  <circle cx="41" cy="19" r="3.2" fill="#dc2626"/>
  <circle cx="41" cy="19" r="1.3" fill="#fef08a"/>
  <!-- 垂れ下がる生々しい舌 -->
  <path d="M29 28 Q34 42 27 46 Q22 41 27 32 Z" fill="#e11d48" stroke="#9f1239" stroke-width="1"/>
</svg>`.trim();

  public static readonly MIMIC_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="30" width="40" height="26" rx="3" fill="#92400e" stroke="#78350f" stroke-width="2"/>
  <path d="M12 30 Q32 16 52 30 Z" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <rect x="28" y="34" width="8" height="10" rx="1" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
</svg>`.trim();

  /** 腐乱ゾンビ (ZOMBIE) - 正面（緑灰の肌、うつろな瞳、ちぎれた衣服） */
  public static readonly ZOMBIE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 腐敗した頭部 -->
  <rect x="22" y="10" width="20" height="20" rx="4" fill="#65a30d" stroke="#3f6212" stroke-width="1.5"/>
  <!-- うつろな目 -->
  <circle cx="28" cy="18" r="3.5" fill="#fef08a"/>
  <circle cx="28" cy="18" r="1.5" fill="#1e293b"/>
  <circle cx="37" cy="19" r="2.5" fill="#1e293b"/>
  <!-- 歪んだ口 -->
  <path d="M26 25 Q32 28 38 24" stroke="#1e293b" stroke-width="2" fill="none"/>
  <!-- ボロボロの胴体 -->
  <rect x="18" y="30" width="28" height="20" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <polygon points="18,48 24,44 28,50 34,44 40,50 46,46" fill="#334155"/>
  <!-- 前に突き出された両腕 -->
  <rect x="10" y="32" width="10" height="6" rx="2" fill="#65a30d"/>
  <rect x="44" y="32" width="10" height="6" rx="2" fill="#65a30d"/>
  <!-- 両足 -->
  <rect x="24" y="50" width="6" height="10" fill="#65a30d"/>
  <rect x="34" y="50" width="6" height="10" fill="#4d7c0f"/>
</svg>`.trim();

  public static readonly ZOMBIE_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="22" y="10" width="20" height="20" rx="4" fill="#4d7c0f" stroke="#3f6212" stroke-width="1.5"/>
  <rect x="18" y="30" width="28" height="20" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="24" y="50" width="6" height="10" fill="#4d7c0f"/>
  <rect x="34" y="50" width="6" height="10" fill="#4d7c0f"/>
</svg>`.trim();

  /** 小悪魔インプ (IMP) - 正面（赤紫の体、小さな角、コウモリ翼、三叉槍） */
  public static readonly IMP_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 小悪魔の翼 -->
  <path d="M26 28 Q10 18 4 30 Q14 36 24 34 Z" fill="#831843" stroke="#500724" stroke-width="1.2"/>
  <path d="M38 28 Q54 18 60 30 Q50 36 40 34 Z" fill="#831843" stroke="#500724" stroke-width="1.2"/>
  <!-- 頭部 -->
  <circle cx="32" cy="24" r="12" fill="#ec4899" stroke="#be185d" stroke-width="1.5"/>
  <!-- 角 -->
  <polygon points="24,14 20,4 28,12" fill="#f43f5e"/>
  <polygon points="40,14 44,4 36,12" fill="#f43f5e"/>
  <!-- 黄色いいたずら目 -->
  <polygon points="24,22 30,24 26,27" fill="#fef08a"/>
  <polygon points="40,22 34,24 38,27" fill="#fef08a"/>
  <circle cx="27" cy="24" r="1.2" fill="#000000"/>
  <circle cx="37" cy="24" r="1.2" fill="#000000"/>
  <!-- 胴体と手足 -->
  <rect x="26" y="34" width="12" height="14" rx="3" fill="#db2777"/>
  <!-- 三叉の小槍 -->
  <line x1="44" y1="16" x2="48" y2="48" stroke="#71717a" stroke-width="2"/>
  <polygon points="44,14 42,8 46,8" fill="#f43f5e"/>
  <polygon points="40,16 38,11 42,12" fill="#f43f5e"/>
  <polygon points="48,16 50,11 46,12" fill="#f43f5e"/>
</svg>`.trim();

  public static readonly IMP_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M26 28 Q10 18 4 30 Q14 36 24 34 Z" fill="#500724" stroke="#500724" stroke-width="1.2"/>
  <path d="M38 28 Q54 18 60 30 Q50 36 40 34 Z" fill="#500724" stroke="#500724" stroke-width="1.2"/>
  <circle cx="32" cy="24" r="12" fill="#db2777" stroke="#be185d" stroke-width="1.5"/>
  <polygon points="24,14 20,4 28,12" fill="#be185d"/>
  <polygon points="40,14 44,4 36,12" fill="#be185d"/>
  <rect x="26" y="34" width="12" height="14" rx="3" fill="#be185d"/>
</svg>`.trim();

  /** 古代のミイラ (MUMMY) - 正面（黄ばんだ包帯、隙間から光る古代瞳） */
  public static readonly MUMMY_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="5" fill="rgba(0,0,0,0.35)"/>
  <!-- 全身包帯巻きのシルエット -->
  <rect x="22" y="10" width="20" height="20" rx="3" fill="#d4d4d8" stroke="#a1a1aa" stroke-width="1.5"/>
  <!-- 包帯の筋ライン -->
  <line x1="22" y1="14" x2="42" y2="17" stroke="#71717a" stroke-width="1.5"/>
  <line x1="22" y1="22" x2="42" y2="21" stroke="#71717a" stroke-width="1.5"/>
  <line x1="22" y1="28" x2="42" y2="26" stroke="#71717a" stroke-width="1.5"/>
  <!-- 包帯の隙間から光る黄金の眼 -->
  <rect x="25" y="18" width="14" height="4" fill="#18181b"/>
  <circle cx="28" cy="20" r="1.5" fill="#facc15"/>
  <circle cx="36" cy="20" r="1.5" fill="#facc15"/>
  <!-- 胴体と包帯 -->
  <rect x="18" y="30" width="28" height="22" rx="2" fill="#e4e4e7" stroke="#a1a1aa" stroke-width="1.5"/>
  <line x1="18" y1="36" x2="46" y2="39" stroke="#71717a" stroke-width="1.8"/>
  <line x1="18" y1="44" x2="46" y2="42" stroke="#71717a" stroke-width="1.8"/>
  <!-- たれる包帯の端 -->
  <path d="M42 44 Q48 52 44 60" stroke="#d4d4d8" stroke-width="3" fill="none"/>
  <!-- 足 -->
  <rect x="23" y="52" width="7" height="8" fill="#a1a1aa"/>
  <rect x="34" y="52" width="7" height="8" fill="#a1a1aa"/>
</svg>`.trim();

  public static readonly MUMMY_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="5" fill="rgba(0,0,0,0.35)"/>
  <rect x="22" y="10" width="20" height="20" rx="3" fill="#a1a1aa" stroke="#71717a" stroke-width="1.5"/>
  <line x1="22" y1="16" x2="42" y2="18" stroke="#52525b" stroke-width="1.5"/>
  <rect x="18" y="30" width="28" height="22" rx="2" fill="#a1a1aa" stroke="#71717a" stroke-width="1.5"/>
  <rect x="23" y="52" width="7" height="8" fill="#71717a"/>
  <rect x="34" y="52" width="7" height="8" fill="#71717a"/>
</svg>`.trim();

  // =========================================================================
  // 新アイテムSVG（新武器・新盾・新消費アイテム）
  // =========================================================================

  /** 妖刀ムラマサ（怪しい紅光と黒漆塗りの鞘・刃） */
  public static readonly ITEM_WEAPON_MURAMASA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <path d="M32 2 Q36 16 34 42 L30 42 Q28 16 32 2 Z" fill="#991b1b" stroke="#ef4444" stroke-width="1.8"/>
    <line x1="32" y1="4" x2="32" y2="40" stroke="#fca5a5" stroke-width="1.2"/>
    <circle cx="32" cy="22" r="1.5" fill="#ffffff"/>
    <rect x="24" y="42" width="16" height="4" rx="1.5" fill="#18181b" stroke="#ef4444" stroke-width="1"/>
    <rect x="29.5" y="46" width="5" height="10" rx="1" fill="#450a0a"/>
    <circle cx="32" cy="58" r="2.5" fill="#ef4444"/>
  </g>
</svg>`.trim();

  /** ウォーハンマー（巨大な重厚鉄塊大槌） */
  public static readonly ITEM_WEAPON_WARHAMMER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <rect x="18" y="10" width="28" height="16" rx="3" fill="#eab308" stroke="#713f12" stroke-width="2"/>
    <polygon points="18,12 12,18 18,24" fill="#ca8a04"/>
    <rect x="30" y="26" width="4" height="30" rx="1.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <circle cx="32" cy="58" r="3" fill="#ca8a04"/>
  </g>
</svg>`.trim();

  /** ホーリーランス（黄金と純白の聖槍） */
  public static readonly ITEM_WEAPON_HOLY_LANCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,2 38,20 33,20 33,56 31,56 31,20 26,20" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8"/>
    <polygon points="32,4 35,16 29,16" fill="#ffffff"/>
    <circle cx="32" cy="20" r="3" fill="#38bdf8"/>
    <circle cx="32" cy="58" r="2.5" fill="#facc15"/>
  </g>
</svg>`.trim();

  /** 風の盾（翠嵐の風を纏う軽装盾） */
  public static readonly ITEM_SHIELD_WIND_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="34" r="18" fill="#10b981" stroke="#047857" stroke-width="2.5"/>
  <path d="M22 34 Q32 20 42 34 Q32 48 22 34" fill="#a7f3d0" stroke="#059669" stroke-width="1.8"/>
  <circle cx="32" cy="34" r="4" fill="#ffffff"/>
</svg>`.trim();

  /** タワーシールド（重厚な城壁大盾） */
  public static readonly ITEM_SHIELD_TOWER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="18" y="14" width="28" height="40" rx="4" fill="#64748b" stroke="#334155" stroke-width="2.5"/>
  <line x1="18" y1="34" x2="46" y2="34" stroke="#94a3b8" stroke-width="2"/>
  <line x1="32" y1="14" x2="32" y2="54" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="32" cy="34" r="5" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
</svg>`.trim();

  /** イージスの盾（神話の黄金神盾） */
  public static readonly ITEM_SHIELD_AEGIS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M16 16 Q32 10 48 16 Q52 40 32 56 Q12 40 16 16 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2.5"/>
  <circle cx="32" cy="32" r="10" fill="#78350f" stroke="#fef3c7" stroke-width="1.8"/>
  <polygon points="32,26 35,31 40,32 36,36 37,41 32,38 27,41 28,36 24,32 29,31" fill="#fef08a"/>
</svg>`.trim();

  /** どくけし草（翠の三つ葉薬草） */
  public static readonly ITEM_POTION_ANTIDOTE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 44 Q32 24 22 18 Q16 28 32 44" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
  <path d="M32 44 Q32 24 42 18 Q48 28 32 44" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
  <path d="M32 44 Q30 20 32 14 Q34 20 32 44" fill="#4ade80" stroke="#15803d" stroke-width="1.5"/>
  <circle cx="32" cy="24" r="2.5" fill="#facc15"/>
</svg>`.trim();

  /** すばやさの種（蒼く輝く霊種） */
  public static readonly ITEM_POTION_AGI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 14 Q44 26 38 46 Q26 46 26 26 Z" fill="#06b6d4" stroke="#0891b2" stroke-width="2"/>
  <circle cx="34" cy="26" r="3" fill="#e0f2fe"/>
  <path d="M28 20 Q32 12 36 18" stroke="#67e8f9" stroke-width="2" fill="none"/>
</svg>`.trim();

  /** 巨大なおにぎり（特大おにぎり） */
  public static readonly ITEM_FOOD_BIG_RICEBALL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 8 Q38 8 52 38 Q56 52 42 54 Q22 54 12 52 Q8 38 26 8 Q30 8 32 8 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2.5"/>
  <rect x="20" y="30" width="24" height="24" rx="3" fill="#0f172a" stroke="#020617" stroke-width="1.5"/>
  <circle cx="32" cy="22" r="3.5" fill="#ef4444"/>
</svg>`.trim();

  /** 睡眠の巻物 */
  public static readonly ITEM_SCROLL_SLEEP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="#312e81"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="#312e81"/>
  <rect x="15" y="18" width="34" height="30" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
  <path d="M36 24 Q30 24 30 32 Q30 40 38 40 Q32 40 32 30 Q32 24 36 24 Z" fill="#4338ca"/>
  <circle cx="26" cy="26" r="1.5" fill="#818cf8"/>
  <circle cx="24" cy="36" r="1" fill="#818cf8"/>
</svg>`.trim();

  /** 混乱の巻物 */
  public static readonly ITEM_SCROLL_CONFUSE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="#831843"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="#831843"/>
  <rect x="15" y="18" width="34" height="30" fill="#fce7f3" stroke="#f43f5e" stroke-width="1.5"/>
  <circle cx="32" cy="33" r="8" fill="none" stroke="#be185d" stroke-width="2" stroke-dasharray="6,4"/>
  <circle cx="32" cy="33" r="3" fill="#be185d"/>
</svg>`.trim();

  // =========================================================================
  // 障害物5種（土の塊、倒木、雪の塊、押せる大石、滑る氷塊）
  // =========================================================================

  /** 土の塊 (DIRT_BLOCK: 赤土と泥、埋まった小石、自然な地層の凹凸塊) */
  public static readonly OBSTACLE_DIRT_BLOCK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.45)"/>
  <!-- ベースのゴツゴツした土塊多角形 -->
  <polygon points="10,48 14,28 26,16 44,14 54,26 56,48 44,55 18,54" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <!-- 上面ハイライト面（赤土の乾いた面） -->
  <polygon points="26,16 44,14 50,26 34,28 18,24" fill="#b45309"/>
  <!-- 中間陰影面 -->
  <polygon points="18,24 34,28 42,42 22,46 12,38" fill="#92400e"/>
  <!-- 側面シャドウ面 -->
  <polygon points="34,28 50,26 56,48 42,42" fill="#5c2605"/>
  <polygon points="22,46 42,42 44,55 18,54" fill="#451a03"/>
  <!-- 埋まった小石のアクセント -->
  <ellipse cx="28" cy="36" rx="3.5" ry="2.5" fill="#a8a29e" stroke="#57534e" stroke-width="1"/>
  <ellipse cx="44" cy="46" rx="2.5" ry="2" fill="#78716c" stroke="#44403c" stroke-width="1"/>
  <circle cx="18" cy="44" r="2" fill="#d6d3d1"/>
  <!-- 地層クラックと土の筋 -->
  <path d="M22 22 L32 26 L28 34" stroke="#451a03" stroke-width="1.6" fill="none"/>
  <path d="M38 28 L46 36 L40 44" stroke="#451a03" stroke-width="1.6" fill="none"/>
  <circle cx="36" cy="18" r="1.5" fill="#fde68a" opacity="0.6"/>
</svg>`.trim();

  /** 倒木 (TREE_STUMP: リアルな年輪・苔むした樹皮・力強い根の張り出し) */
  public static readonly OBSTACLE_TREE_STUMP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="56" rx="24" ry="6.5" fill="rgba(0,0,0,0.45)"/>
  <!-- 根の張り出し（左右および手前） -->
  <path d="M8 54 Q18 50 20 40 L44 40 Q46 50 56 54 Q48 58 32 58 Q16 58 8 54 Z" fill="#381a07" stroke="#1f0d04" stroke-width="1.8"/>
  <path d="M4 52 Q14 46 18 36" stroke="#451a03" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M60 52 Q50 46 46 36" stroke="#451a03" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- 幹の側面円柱 -->
  <path d="M16 26 L18 48 Q32 52 46 48 L48 26 Z" fill="#5c2605" stroke="#2e1002" stroke-width="2"/>
  <!-- 樹皮の縦溝テクスチャ -->
  <line x1="24" y1="28" x2="25" y2="48" stroke="#381a07" stroke-width="2"/>
  <line x1="32" y1="29" x2="33" y2="50" stroke="#381a07" stroke-width="2.2"/>
  <line x1="40" y1="28" x2="39" y2="48" stroke="#381a07" stroke-width="2"/>
  <!-- 上部切り株断面（楕円ベース） -->
  <ellipse cx="32" cy="26" rx="16" ry="8.5" fill="#a16207" stroke="#2e1002" stroke-width="2"/>
  <!-- リアルな年輪（同心楕円） -->
  <ellipse cx="32" cy="26" rx="12" ry="6" fill="none" stroke="#78350f" stroke-width="1.5"/>
  <ellipse cx="32" cy="26" rx="8" ry="4" fill="none" stroke="#78350f" stroke-width="1.4"/>
  <ellipse cx="32" cy="26" rx="4" ry="2" fill="none" stroke="#78350f" stroke-width="1.2"/>
  <!-- 芯部 -->
  <circle cx="32" cy="26" r="1.5" fill="#451a03"/>
  <!-- 年輪の放射状乾燥クラック -->
  <line x1="32" y1="26" x2="22" y2="23" stroke="#451a03" stroke-width="1.4"/>
  <line x1="32" y1="26" x2="38" y2="32" stroke="#451a03" stroke-width="1.2"/>
  <!-- 根本と側面の苔（自然なモスグリーン） -->
  <circle cx="18" cy="44" r="4.5" fill="#15803d"/>
  <circle cx="21" cy="42" r="3" fill="#4ade80" opacity="0.8"/>
  <circle cx="44" cy="46" r="4" fill="#15803d"/>
  <circle cx="46" cy="44" r="2.5" fill="#4ade80" opacity="0.8"/>
  <ellipse cx="32" cy="48" rx="5" ry="2" fill="#166534"/>
</svg>`.trim();

  /** 雪の塊 (SNOW_MOUND: 柔らかな積雪の立体起伏・氷晶ハイライト・吹き溜まり) */
  public static readonly OBSTACLE_SNOW_MOUND_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地淡青シャドウ -->
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(15, 23, 42, 0.35)"/>
  <!-- 奥の雪塊ベース -->
  <path d="M10 52 Q18 24 32 20 Q48 24 54 52 Q44 56 32 56 Q18 56 10 52 Z" fill="#93c5fd" stroke="#60a5fa" stroke-width="1.8"/>
  <!-- メイン積雪起伏（滑らかな純白ドーム） -->
  <path d="M12 50 Q20 22 34 18 Q46 22 52 50 Q42 54 32 54 Q20 54 12 50 Z" fill="#e0f2fe"/>
  <!-- 手前右側のふっくらとした雪の吹き溜まり -->
  <path d="M22 52 Q32 30 46 28 Q52 38 48 52 Z" fill="#f0f9ff"/>
  <!-- 頂部純白ハイライト（太陽光反射） -->
  <path d="M26 22 Q34 16 40 22 Q34 26 26 22 Z" fill="#ffffff"/>
  <!-- 陰影クレバスライン -->
  <path d="M20 42 Q30 38 40 44" stroke="#60a5fa" stroke-width="1.5" fill="none" opacity="0.7"/>
  <!-- きらめく氷結晶ハイライト -->
  <polygon points="34,14 36,18 34,22 32,18" fill="#ffffff"/>
  <circle cx="26" cy="30" r="2" fill="#ffffff"/>
  <circle cx="44" cy="34" r="1.8" fill="#ffffff"/>
  <circle cx="36" cy="46" r="1.5" fill="#ffffff"/>
</svg>`.trim();

  /** 押せる大石 (PUSH_ROCK: 重厚な多面体巨石・岩肌の立体陰影・クラック) */
  public static readonly OBSTACLE_PUSH_ROCK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 重厚な接地ドロップシャドウ -->
  <ellipse cx="32" cy="56" rx="23" ry="6.5" fill="rgba(0,0,0,0.5)"/>
  <!-- 巨石ベース多面体外郭 -->
  <polygon points="10,46 14,24 28,12 46,14 54,26 56,46 44,55 18,54" fill="#334155" stroke="#0f172a" stroke-width="2.2"/>
  <!-- 左上ハイライト天板面（光を受ける明るい岩肌） -->
  <polygon points="28,12 46,14 42,26 26,24 14,24" fill="#94a3b8"/>
  <polygon points="28,12 42,26 32,38 18,34 14,24" fill="#64748b"/>
  <!-- 右上中間面 -->
  <polygon points="46,14 54,26 48,38 42,26" fill="#475569"/>
  <!-- 正面中央の角面 -->
  <polygon points="18,34 32,38 34,52 14,48" fill="#475569"/>
  <!-- 右下ダークシャドウ面 -->
  <polygon points="42,26 48,38 56,46 44,55 34,52 32,38" fill="#1e293b"/>
  <!-- 鋭いクラック（ひび割れ） -->
  <path d="M26 18 L32 26 L28 32 L34 36" stroke="#0f172a" stroke-width="1.8" fill="none"/>
  <path d="M42 28 L46 34 L42 42" stroke="#0f172a" stroke-width="1.6" fill="none"/>
  <!-- 岩肌のハイライト稜線 -->
  <line x1="28" y1="12" x2="42" y2="26" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="14" y1="24" x2="26" y2="24" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- 砂粒・小石のアクセント -->
  <circle cx="16" cy="52" r="2" fill="#64748b" stroke="#1e293b" stroke-width="1"/>
  <circle cx="48" cy="52" r="2.5" fill="#475569" stroke="#1e293b" stroke-width="1"/>
</svg>`.trim();

  /** 滑る氷塊 (ICE_BLOCK: 透明感あふれる蒼氷の多面キューブ・氷晶クラック・冷気フロスト) */
  public static readonly OBSTACLE_ICE_BLOCK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地蒼影 -->
  <ellipse cx="32" cy="56" rx="20" ry="6" fill="rgba(3, 105, 161, 0.45)"/>
  <!-- 周囲に漂う冷気オーラ -->
  <path d="M12 48 Q8 32 14 20 Q24 12 36 12 Q52 16 54 36 Q56 48 48 54" stroke="#7dd3fc" stroke-width="1.5" fill="none" opacity="0.45" stroke-dasharray="4,3"/>
  <!-- 立体氷塊・底面・側面ベース -->
  <polygon points="14,24 32,14 50,22 52,48 34,56 12,46" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
  <!-- 上面（滑らかな氷の天板） -->
  <polygon points="14,24 32,14 50,22 34,32" fill="#bae6fd"/>
  <!-- 左側面（屈折面） -->
  <polygon points="14,24 34,32 34,56 12,46" fill="#38bdf8"/>
  <!-- 右側面（深層シャドウ面） -->
  <polygon points="50,22 34,32 34,56 52,48" fill="#0ea5e9"/>
  <!-- 内部の屈折氷晶クラック -->
  <path d="M22 28 L30 36 L24 44 L32 48" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M38 28 L42 36 L36 42" stroke="#e0f2fe" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <!-- 鋭いガラス質白ハイライト稜線 -->
  <line x1="14" y1="24" x2="34" y2="32" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="34" y1="32" x2="34" y2="56" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="34" y1="32" x2="50" y2="22" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <!-- 氷晶きらめき -->
  <circle cx="24" cy="20" r="2.5" fill="#ffffff"/>
  <circle cx="44" cy="40" r="2" fill="#ffffff" opacity="0.8"/>
</svg>`.trim();

  // =========================================================================
  // 6. 飛び道具・矢 (ARROWS)
  // =========================================================================

  /** 木の矢 (ITEM_ARROW: 木製シャフト、羽、鉄の鏃) */
  public static readonly ITEM_ARROW_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 束ねられた3本の矢 -->
  <g transform="rotate(-30 32 32)">
    <line x1="12" y1="32" x2="48" y2="32" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
    <polygon points="44,26 56,32 44,38" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
    <path d="M12,32 L6,26 L16,32 L6,38 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  </g>
  <g transform="rotate(-45 32 32)">
    <line x1="10" y1="32" x2="52" y2="32" stroke="#b45309" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="48,25 60,32 48,39" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
    <path d="M10,32 L4,25 L14,32 L4,39 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  </g>
</svg>`.trim();

  /** 鉄の矢 (ITEM_ARROW_IRON: 重厚な鋼鉄鏃) */
  public static readonly ITEM_ARROW_IRON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <g transform="rotate(-45 32 32)">
    <line x1="8" y1="32" x2="50" y2="32" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
    <!-- 鋭利な大型鉄鏃 -->
    <polygon points="44,23 60,32 44,41" fill="#94a3b8" stroke="#1e293b" stroke-width="2"/>
    <line x1="44" y1="32" x2="58" y2="32" stroke="#ffffff" stroke-width="1.5"/>
    <!-- 矢羽（黒鷹の羽根） -->
    <path d="M10,32 L2,24 L14,32 L2,40 Z" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  </g>
</svg>`.trim();

  /** 銀の矢 (ITEM_ARROW_SILVER: 貫通する白銀の神秘光) */
  public static readonly ITEM_ARROW_SILVER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="18" ry="4.5" fill="rgba(0,0,0,0.25)"/>
  <!-- 銀の光彩オーラ -->
  <line x1="12" y1="52" x2="52" y2="12" stroke="#38bdf8" stroke-width="8" opacity="0.4" stroke-linecap="round"/>
  <g transform="rotate(-45 32 32)">
    <line x1="6" y1="32" x2="52" y2="32" stroke="#e0f2fe" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="46,24 62,32 46,40" fill="#f8fafc" stroke="#38bdf8" stroke-width="2"/>
    <path d="M8,32 L0,23 L12,32 L0,41 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
  </g>
</svg>`.trim();

  // =========================================================================
  // 7. 魔法の杖 (STAFFS)
  // =========================================================================

  /** 魔法の杖・共通 (ITEM_STAFF: 研ぎ澄まされた木製シャフトと輝く水晶) */
  public static readonly ITEM_STAFF_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 杖の軸 -->
  <line x1="18" y1="50" x2="44" y2="18" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
  <line x1="18" y1="50" x2="44" y2="18" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/>
  <!-- 金具 -->
  <circle cx="43" cy="19" r="6" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
  <!-- 先端オーブ -->
  <circle cx="46" cy="15" r="7" fill="#a855f7" stroke="#6b21a8" stroke-width="1.5"/>
  <circle cx="44" cy="13" r="2.5" fill="#ffffff"/>
</svg>`.trim();

  /** 吹き飛ばしの杖 (ITEM_STAFF_BLAST: 翠緑の風の宝玉) */
  public static readonly ITEM_STAFF_BLAST_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <line x1="18" y1="50" x2="44" y2="18" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
  <!-- 風の旋回エフェクト -->
  <circle cx="46" cy="15" r="9" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="6,4"/>
  <circle cx="46" cy="15" r="6.5" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
  <circle cx="44" cy="13" r="2.5" fill="#a7f3d0"/>
</svg>`.trim();

  /** 場所替えの杖 (ITEM_STAFF_SWITCH: 双対する転移オーブ) */
  public static readonly ITEM_STAFF_SWITCH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <line x1="18" y1="50" x2="44" y2="18" stroke="#312e81" stroke-width="5" stroke-linecap="round"/>
  <!-- 双対ワープオーブ -->
  <circle cx="43" cy="13" r="5" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
  <circle cx="49" cy="19" r="5" fill="#f43f5e" stroke="#be123c" stroke-width="1.5"/>
  <circle cx="42" cy="11" r="1.8" fill="#ffffff"/>
</svg>`.trim();

  /** かなしばりの杖 (ITEM_STAFF_PARALYZE: 黄金の麻痺水晶) */
  public static readonly ITEM_STAFF_PARALYZE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <line x1="18" y1="50" x2="44" y2="18" stroke="#713f12" stroke-width="5" stroke-linecap="round"/>
  <!-- 稲妻スパーク -->
  <polygon points="46,6 42,14 48,14 44,24 53,13 47,13" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
  <circle cx="46" cy="15" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" opacity="0.85"/>
  <circle cx="44" cy="13" r="2.5" fill="#fef08a"/>
</svg>`.trim();

  /** 雷鳴の杖 (ITEM_STAFF_THUNDER: 強力な電撃光球) */
  public static readonly ITEM_STAFF_THUNDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <line x1="18" y1="50" x2="44" y2="18" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round"/>
  <circle cx="46" cy="15" r="9" fill="#6366f1" opacity="0.4"/>
  <circle cx="46" cy="15" r="7" fill="#818cf8" stroke="#4338ca" stroke-width="1.8"/>
  <circle cx="44" cy="13" r="3" fill="#ffffff"/>
</svg>`.trim();

  // =========================================================================
  // 8. 腕輪・装飾品 (TALISMANS / RINGS)
  // =========================================================================

  /** 腕輪 (ITEM_RING: 黄金の輪と中央に嵌め込まれた神秘の宝石) */
  public static readonly ITEM_RING_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- リング外枠 -->
  <ellipse cx="32" cy="34" rx="16" ry="14" fill="none" stroke="#f59e0b" stroke-width="5"/>
  <ellipse cx="32" cy="34" rx="16" ry="14" fill="none" stroke="#fef08a" stroke-width="2"/>
  <!-- 宝石座 -->
  <polygon points="32,14 38,20 32,26 26,20" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <circle cx="31" cy="18" r="1.8" fill="#ffffff"/>
</svg>`.trim();

  // =========================================================================
  // 9. 追加の草・薬 (HERBS)
  // =========================================================================

  /** 復活の草 (ITEM_POTION_REVIVE: 奇跡の四つ葉と輝く聖光) */
  public static readonly ITEM_POTION_REVIVE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 黄金の聖光オーラ -->
  <circle cx="32" cy="32" r="16" fill="#fef08a" opacity="0.35"/>
  <!-- 茎 -->
  <path d="M32 50 Q32 38 32 32" stroke="#16a34a" stroke-width="3" stroke-linecap="round"/>
  <!-- 4枚の黄金の葉 -->
  <ellipse cx="25" cy="25" rx="6" ry="7" fill="#eab308" stroke="#ca8a04" stroke-width="1.2" transform="rotate(-30 25 25)"/>
  <ellipse cx="39" cy="25" rx="6" ry="7" fill="#eab308" stroke="#ca8a04" stroke-width="1.2" transform="rotate(30 39 25)"/>
  <ellipse cx="25" cy="37" rx="6" ry="7" fill="#ca8a04" stroke="#a16207" stroke-width="1.2" transform="rotate(30 25 37)"/>
  <ellipse cx="39" cy="37" rx="6" ry="7" fill="#ca8a04" stroke="#a16207" stroke-width="1.2" transform="rotate(-30 39 37)"/>
  <!-- 中心輝き -->
  <circle cx="32" cy="31" r="3" fill="#ffffff"/>
</svg>`.trim();

  /** 弟切草 (ITEM_POTION_OTOGIRI: 鮮やかな深紅の薬効草) */
  public static readonly ITEM_POTION_OTOGIRI_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 52 Q34 40 32 32" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
  <!-- 深紅の花弁 -->
  <ellipse cx="26" cy="26" rx="5" ry="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2" transform="rotate(-35 26 26)"/>
  <ellipse cx="38" cy="26" rx="5" ry="8" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2" transform="rotate(35 38 26)"/>
  <ellipse cx="32" cy="20" rx="5" ry="8" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
  <circle cx="32" cy="27" r="3" fill="#fbbf24"/>
</svg>`.trim();

  /** 命の草 (ITEM_POTION_LIFE: 生命力を宿すエメラルドの薬草) */
  public static readonly ITEM_POTION_LIFE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="32" r="14" fill="#a7f3d0" opacity="0.4"/>
  <path d="M32 52 Q30 38 32 28" stroke="#047857" stroke-width="3" stroke-linecap="round"/>
  <path d="M32 28 Q20 18 24 34 Q32 32 32 28 Z" fill="#10b981" stroke="#047857" stroke-width="1.5"/>
  <path d="M32 28 Q44 18 40 34 Q32 32 32 28 Z" fill="#34d399" stroke="#059669" stroke-width="1.5"/>
  <circle cx="28" cy="26" r="2" fill="#ffffff" opacity="0.8"/>
</svg>`.trim();

  // =========================================================================
  // 10. 追加の巻物 (SCROLLS)
  // =========================================================================

  /** 天の恵みの巻物 (ITEM_SCROLL_UPGRADE_ATK: 黄金の神光を放つ鍛冶の巻物) */
  public static readonly ITEM_SCROLL_UPGRADE_ATK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="18" y="20" width="28" height="24" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <line x1="16" y1="20" x2="16" y2="44" stroke="#a16207" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="20" x2="48" y2="44" stroke="#a16207" stroke-width="4" stroke-linecap="round"/>
  <!-- 黄金の剣シンボル印 -->
  <polygon points="32,24 35,30 33,30 33,38 31,38 31,30 29,30" fill="#dc2626"/>
  <line x1="28" y1="34" x2="36" y2="34" stroke="#dc2626" stroke-width="1.5"/>
</svg>`.trim();

  /** 地の恵みの巻物 (ITEM_SCROLL_UPGRADE_DEF: 堅牢な大地の加護を放つ巻物) */
  public static readonly ITEM_SCROLL_UPGRADE_DEF_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="18" y="20" width="28" height="24" rx="3" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
  <line x1="16" y1="20" x2="16" y2="44" stroke="#0369a1" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="20" x2="48" y2="44" stroke="#0369a1" stroke-width="4" stroke-linecap="round"/>
  <!-- 盾シンボル印 -->
  <path d="M28 26 L36 26 L36 34 Q32 38 32 38 Q28 38 28 34 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1"/>
</svg>`.trim();

  /** 真空斬りの巻物 (ITEM_SCROLL_VACUUM: 部屋全体を切り裂く烈風の刃) */
  public static readonly ITEM_SCROLL_VACUUM_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="14" ry="4" fill="rgba(0,0,0,0.3)"/>
  <rect x="18" y="20" width="28" height="24" rx="3" fill="#a7f3d0" stroke="#059669" stroke-width="2"/>
  <line x1="16" y1="20" x2="16" y2="44" stroke="#047857" stroke-width="4" stroke-linecap="round"/>
  <line x1="48" y1="20" x2="48" y2="44" stroke="#047857" stroke-width="4" stroke-linecap="round"/>
  <!-- 鋭い旋風スラッシュ印 -->
  <path d="M25 36 Q32 24 39 26 Q32 32 25 36 Z" fill="#047857"/>
  <path d="M27 26 Q34 32 37 38" stroke="#10b981" stroke-width="2" fill="none"/>
</svg>`.trim();
}
