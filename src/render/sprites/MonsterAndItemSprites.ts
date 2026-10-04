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

  /** ダークメイジ正面（下向き: 深紫の尖がりフード、魔力杖、暗黒ローブ） */
  public static readonly MAGE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- ローブ裾 -->
  <path d="M22 28 L14 54 L50 54 L42 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="2"/>
  <path d="M28 28 L24 54 L40 54 L36 28 Z" fill="#581c87"/>
  <!-- 尖がりフード頭部 -->
  <path d="M20 28 Q32 2 44 28 Q32 24 20 28 Z" fill="#581c87" stroke="#1e1b4b" stroke-width="2"/>
  <!-- フードの陰影と輝く目 -->
  <path d="M22 26 Q32 22 42 26 Q32 30 22 26 Z" fill="#0f172a"/>
  <circle cx="28" cy="26" r="2" fill="#e879f9"/>
  <circle cx="36" cy="26" r="2" fill="#e879f9"/>
  <!-- 魔力の杖（右手） -->
  <line x1="48" y1="12" x2="48" y2="52" stroke="#78350f" stroke-width="2.5"/>
  <circle cx="48" cy="12" r="5" fill="#a855f7" stroke="#c084fc" stroke-width="1.5"/>
  <circle cx="48" cy="12" r="2" fill="#ffffff"/>
</svg>`.trim();

  /** ダークメイジ背面（上向き） */
  public static readonly MAGE_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 28 L14 54 L50 54 L42 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="2"/>
  <path d="M20 28 Q32 2 44 28 Q32 24 20 28 Z" fill="#581c87" stroke="#1e1b4b" stroke-width="2"/>
  <line x1="48" y1="12" x2="48" y2="52" stroke="#78350f" stroke-width="2.5"/>
  <circle cx="48" cy="12" r="4" fill="#a855f7"/>
</svg>`.trim();

  /** ダークメイジ真横 */
  public static readonly MAGE_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M24 28 L16 54 L44 54 L38 28 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="2"/>
  <path d="M20 28 Q30 2 42 28 Z" fill="#581c87" stroke="#1e1b4b" stroke-width="2"/>
  <circle cx="36" cy="26" r="2" fill="#e879f9"/>
  <line x1="44" y1="14" x2="44" y2="52" stroke="#78350f" stroke-width="2.5"/>
  <circle cx="44" cy="14" r="4.5" fill="#a855f7"/>
</svg>`.trim();

  /** ダークメイジ斜め前 */
  public static readonly MAGE_DIAG_DOWN_SVG = MonsterAndItemSprites.MAGE_DOWN_SVG;
  /** ダークメイジ斜め後ろ */
  public static readonly MAGE_DIAG_UP_SVG = MonsterAndItemSprites.MAGE_UP_SVG;

  // =========================================================================
  // 4. レッドドラゴン (DRAGON) - 5方向
  // =========================================================================

  /** レッドドラゴン正面（下向き: 巨大な角、深紅の竜翼、力強い首、黄金の瞳） */
  public static readonly DRAGON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
  <!-- 左翼 -->
  <path d="M24 28 Q8 10 2 20 Q12 34 24 38 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
  <path d="M24 28 Q10 14 6 22 Q14 30 24 34 Z" fill="#dc2626"/>
  <!-- 右翼 -->
  <path d="M40 28 Q56 10 62 20 Q52 34 40 38 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
  <path d="M40 28 Q54 14 58 22 Q50 30 40 34 Z" fill="#dc2626"/>
  <!-- 胴体 -->
  <rect x="22" y="32" width="20" height="24" rx="6" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2"/>
  <!-- 腹部の蛇腹 -->
  <rect x="26" y="36" width="12" height="4" rx="2" fill="#f59e0b"/>
  <rect x="26" y="42" width="12" height="4" rx="2" fill="#f59e0b"/>
  <rect x="27" y="48" width="10" height="4" rx="2" fill="#f59e0b"/>
  <!-- 竜の頭部 -->
  <circle cx="32" cy="24" r="13" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
  <!-- 左右の角 -->
  <polygon points="24,18 16,6 26,14" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
  <polygon points="40,18 48,6 38,14" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
  <!-- 黄金の瞳 -->
  <ellipse cx="27" cy="24" rx="3" ry="4" fill="#fbbf24"/>
  <line x1="27" y1="21" x2="27" y2="27" stroke="#000000" stroke-width="1.5"/>
  <ellipse cx="37" cy="24" rx="3" ry="4" fill="#fbbf24"/>
  <line x1="37" y1="21" x2="37" y2="27" stroke="#000000" stroke-width="1.5"/>
  <!-- 鼻孔と牙 -->
  <polygon points="30,30 31,34 32,30" fill="#ffffff"/>
  <polygon points="32,30 33,34 34,30" fill="#ffffff"/>
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
}
