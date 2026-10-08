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

  /** コウモリ正面（下向き: 骨格指骨・翼膜血管・夜紫の毛並み・尖耳・赤黄の凶悪瞳・吸血長牙・爪足） */
  public static readonly BAT_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ（飛行浮遊） -->
  <ellipse cx="32" cy="58" rx="17" ry="4" fill="rgba(0,0,0,0.32)"/>

  <!-- 左翼: 骨格・多層翼膜・鉤爪・光沢ハイライト -->
  <path d="M28 28 Q14 7 1 15 Q7 32 14 36 Q19 43 28 35 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M26 27 Q14 11 4 17 Q9 30 15 34 Q20 40 26 34 Z" fill="#581c87" opacity="0.85"/>
  <path d="M25 26 Q16 13 8 18 Q12 28 17 32 Z" fill="#7e22ce" opacity="0.4"/>
  <!-- 左翼骨格リブ（指骨） -->
  <path d="M28 28 Q15 15 3 16" stroke="#2e1065" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M28 28 Q18 24 14 35" stroke="#2e1065" stroke-width="1.6" fill="none"/>
  <path d="M28 28 Q23 31 19 41" stroke="#2e1065" stroke-width="1.4" fill="none"/>
  <!-- 指骨ハイライト線 -->
  <path d="M27 27 Q15 16 5 17" stroke="#a855f7" stroke-width="0.8" fill="none" opacity="0.7"/>
  <!-- 左翼の親指鉤爪（鋭い白銀） -->
  <polygon points="3,16 0,12 5,15" fill="#f8fafc" stroke="#1e1b4b" stroke-width="0.8"/>
  <polygon points="2,14 1,12 4,14" fill="#ffffff"/>

  <!-- 右翼: 骨格・多層翼膜・鉤爪・光沢ハイライト -->
  <path d="M36 28 Q50 7 63 15 Q57 32 50 36 Q45 43 36 35 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M38 27 Q50 11 60 17 Q55 30 49 34 Q44 40 38 34 Z" fill="#581c87" opacity="0.85"/>
  <path d="M39 26 Q48 13 56 18 Q52 28 47 32 Z" fill="#7e22ce" opacity="0.4"/>
  <!-- 右翼骨格リブ（指骨） -->
  <path d="M36 28 Q49 15 61 16" stroke="#2e1065" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M36 28 Q46 24 50 35" stroke="#2e1065" stroke-width="1.6" fill="none"/>
  <path d="M36 28 Q41 31 45 41" stroke="#2e1065" stroke-width="1.4" fill="none"/>
  <!-- 指骨ハイライト線 -->
  <path d="M37 27 Q49 16 59 17" stroke="#a855f7" stroke-width="0.8" fill="none" opacity="0.7"/>
  <!-- 右翼の親指鉤爪（鋭い白銀） -->
  <polygon points="61,16 64,12 59,15" fill="#f8fafc" stroke="#1e1b4b" stroke-width="0.8"/>
  <polygon points="62,14 63,12 60,14" fill="#ffffff"/>

  <!-- 胴体毛並みベース（多層立体感） -->
  <ellipse cx="32" cy="35" rx="9.5" ry="11.5" fill="#2e1065" stroke="#0f0728" stroke-width="1.8"/>
  <ellipse cx="32" cy="36" rx="7" ry="8.5" fill="#3b0764"/>
  <!-- 胸元のふさふさ毛並みハイライト -->
  <path d="M28 31 L32 36 L36 31 L34 39 L32 41 L30 39 Z" fill="#9333ea" opacity="0.8"/>
  <ellipse cx="32" cy="34" rx="3.5" ry="2" fill="#c084fc" opacity="0.5"/>

  <!-- 尖った大耳（立体多層内耳＆軟骨） -->
  <!-- 左耳 -->
  <polygon points="26,27 21,13 30,22" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="25.5,25 22.5,15 28.5,22" fill="#c026d3"/>
  <polygon points="25,23 23.5,17 27,21" fill="#f472b6" opacity="0.8"/>
  <!-- 右耳 -->
  <polygon points="38,27 43,13 34,22" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="38.5,25 41.5,15 35.5,22" fill="#c026d3"/>
  <polygon points="39,23 40.5,17 37,21" fill="#f472b6" opacity="0.8"/>

  <!-- 頭部輪郭（ふっくら立体球） -->
  <circle cx="32" cy="26" r="8.5" fill="#2e1065" stroke="#0f0728" stroke-width="1.6"/>
  <!-- おでこハイライト（スライム基準のツヤ） -->
  <ellipse cx="32" cy="20.5" rx="5" ry="2.2" fill="#a855f7" opacity="0.65"/>
  <ellipse cx="32" cy="19.5" rx="3" ry="1" fill="#ffffff" opacity="0.7"/>

  <!-- 鼻（ブタ鼻コウモリ鼻孔） -->
  <ellipse cx="32" cy="28.5" rx="2.8" ry="1.8" fill="#581c87" stroke="#2e1065" stroke-width="0.8"/>
  <circle cx="30.8" cy="28.5" r="0.7" fill="#0f0728"/>
  <circle cx="33.2" cy="28.5" r="0.7" fill="#0f0728"/>

  <!-- ギラつく赤黄の凶悪な生き生き瞳（スライム基準の5層構造・2点白ハイライト） -->
  <!-- 左目 -->
  <ellipse cx="27.5" cy="23.5" rx="3.5" ry="3.8" fill="#451a03" stroke="#1e1b4b" stroke-width="0.8"/>
  <ellipse cx="27.5" cy="23.5" rx="2.6" ry="3" fill="#fef08a"/>
  <ellipse cx="27.5" cy="23.5" rx="1.5" ry="2" fill="#ef4444"/>
  <ellipse cx="26.6" cy="22" rx="1.1" ry="1.3" fill="#ffffff"/>
  <circle cx="28.3" cy="25" r="0.5" fill="#ffffff" opacity="0.85"/>

  <!-- 右目 -->
  <ellipse cx="36.5" cy="23.5" rx="3.5" ry="3.8" fill="#451a03" stroke="#1e1b4b" stroke-width="0.8"/>
  <ellipse cx="36.5" cy="23.5" rx="2.6" ry="3" fill="#fef08a"/>
  <ellipse cx="36.5" cy="23.5" rx="1.5" ry="2" fill="#ef4444"/>
  <ellipse cx="35.6" cy="22" rx="1.1" ry="1.3" fill="#ffffff"/>
  <circle cx="37.3" cy="25" r="0.5" fill="#ffffff" opacity="0.85"/>

  <!-- 口腔と鋭い吸血長牙（純白光沢＆血滴） -->
  <path d="M27 30.5 Q32 35 37 30.5 Z" fill="#0f0728"/>
  <polygon points="27.5,30.5 28.8,35.5 30.2,30.5" fill="#ffffff"/>
  <polygon points="33.8,30.5 35.2,35.5 36.5,30.5" fill="#ffffff"/>
  <!-- 牙の先端ハイライト & 血滴 -->
  <circle cx="28.8" cy="35.5" r="0.5" fill="#ffffff"/>
  <circle cx="29" cy="36.5" r="0.8" fill="#ef4444"/>

  <!-- ぶら下がる足爪（立体鉤爪） -->
  <path d="M28 45 L26 50 L29 48" stroke="#0f0728" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M36 45 L38 50 L35 48" stroke="#0f0728" stroke-width="1.6" fill="none" stroke-linecap="round"/>
</svg>`.trim();

  /** コウモリ背面（上向き） */
  public static readonly BAT_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 左翼背面 -->
  <path d="M28 28 Q14 8 2 16 Q8 32 14 36 Q19 43 28 35 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M28 28 Q15 16 3 17" stroke="#1e1b4b" stroke-width="2.2" fill="none"/>
  <!-- 右翼背面 -->
  <path d="M36 28 Q50 8 62 16 Q56 32 50 36 Q45 43 36 35 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M36 28 Q49 16 61 17" stroke="#1e1b4b" stroke-width="2.2" fill="none"/>
  <!-- 胴体背面と背骨 -->
  <ellipse cx="32" cy="35" rx="9" ry="11" fill="#1e1b4b" stroke="#0f0728" stroke-width="1.8"/>
  <line x1="32" y1="26" x2="32" y2="44" stroke="#3b0764" stroke-width="2.5"/>
  <!-- 耳の裏側 -->
  <polygon points="26,27 22,14 30,23" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="38,27 42,14 34,23" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.5"/>
  <circle cx="32" cy="27" r="8" fill="#1e1b4b" stroke="#0f0728" stroke-width="1.5"/>
  <path d="M28 45 L26 49" stroke="#0f0728" stroke-width="1.5"/>
  <path d="M36 45 L38 49" stroke="#0f0728" stroke-width="1.5"/>
</svg>`.trim();

  /** コウモリ真横（羽ばたきと横顔） */
  public static readonly BAT_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 奥の翼 -->
  <path d="M26 30 Q10 12 2 22 Q12 36 24 36 Z" fill="#2e1065" stroke="#1e1b4b" stroke-width="1.5"/>
  <!-- 胴体 -->
  <ellipse cx="32" cy="36" rx="9" ry="11" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <!-- 頭部横顔 -->
  <ellipse cx="37" cy="27" rx="8" ry="7.5" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <!-- 耳 -->
  <polygon points="34,25 35,13 41,22" fill="#581c87" stroke="#1e1b4b" stroke-width="1.5"/>
  <polygon points="35,23 36,15 39,22" fill="#c026d3"/>
  <!-- 横目の赤い瞳 -->
  <ellipse cx="40" cy="25" rx="2.5" ry="2.8" fill="#fef08a" stroke="#b45309" stroke-width="0.8"/>
  <ellipse cx="40.5" cy="25" rx="1.3" ry="1.8" fill="#ef4444"/>
  <circle cx="41" cy="24.2" r="0.6" fill="#ffffff"/>
  <!-- 口と鋭い牙 -->
  <path d="M38 31 Q43 33 46 29" stroke="#1e1b4b" stroke-width="1.5" fill="none"/>
  <polygon points="41,31 43,36 44,31" fill="#ffffff"/>
  <!-- 手前の翼（大きく羽ばたく） -->
  <path d="M30 32 Q44 10 58 18 Q48 34 34 38 Z" fill="#581c87" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M30 32 Q44 12 56 11" stroke="#3b0764" stroke-width="2" fill="none"/>
  <polygon points="58,18 61,14 56,17" fill="#f8fafc"/>
  <path d="M30 46 L28 50 L31 49" stroke="#1e1b4b" stroke-width="1.5" fill="none"/>
</svg>`.trim();

  /** コウモリ斜め前 */
  public static readonly BAT_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <path d="M26 30 Q10 10 2 20 Q10 34 22 36 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <path d="M36 28 Q52 10 62 20 Q54 36 42 36 Z" fill="#581c87" stroke="#1e1b4b" stroke-width="1.8"/>
  <ellipse cx="33" cy="35" rx="8.5" ry="10.5" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.8"/>
  <polygon points="27,26 24,14 31,23" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.2"/>
  <polygon points="38,26 41,14 35,23" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.2"/>
  <circle cx="33" cy="27" r="7.5" fill="#3b0764" stroke="#1e1b4b" stroke-width="1.5"/>
  <circle cx="29" cy="25" r="2.2" fill="#ef4444"/>
  <circle cx="29" cy="24.5" r="0.8" fill="#ffffff"/>
  <circle cx="36" cy="25" r="2.4" fill="#ef4444"/>
  <circle cx="36" cy="24.5" r="0.8" fill="#ffffff"/>
  <polygon points="31,31 32,35 33,31" fill="#ffffff"/>
  <polygon points="35,31 36,35 37,31" fill="#ffffff"/>
</svg>`.trim();

  /** コウモリ斜め後ろ */
  public static readonly BAT_DIAG_UP_SVG = MonsterAndItemSprites.BAT_UP_SVG;

  // =========================================================================
  // 2. 彷徨う亡霊 (GHOST) - 5方向
  // =========================================================================

  /** ゴースト正面（下向き: 多層霊気オーラ・半透明エーテルローブ・スライム基準の内部霊核・ソウルアイ蒼炎・うるおい光沢） */
  public static readonly GHOST_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地淡青浮遊シャドウ -->
  <ellipse cx="32" cy="58" rx="17" ry="4.5" fill="rgba(8, 145, 178, 0.28)"/>

  <!-- 最外層: 揺らめくエーテル霊気オーラ（多層半透明） -->
  <path d="M32 5 Q53 5 53 30 Q53 48 43 54 Q32 46 21 54 Q11 48 11 30 Q11 5 32 5 Z" fill="#06b6d4" opacity="0.22"/>
  <path d="M32 7 Q50 7 50 30 Q50 46 40 52 Q32 44 24 52 Q14 46 14 30 Q14 7 32 7 Z" fill="#22d3ee" opacity="0.35"/>

  <!-- 霊体ローブ本体（深みのあるシアン陰影と半透明レイヤー） -->
  <path d="M32 9 Q47 9 47 30 Q47 46 38 50 Q32 44 26 50 Q17 46 17 30 Q17 9 32 9 Z" fill="#0891b2" stroke="#0e7490" stroke-width="1.8"/>
  <!-- 前面のエーテル光ドレープ（スライムのインナーレイヤー構造） -->
  <path d="M32 11 Q44 11 44 28 Q44 42 36 47 Q32 43 28 47 Q20 42 20 28 Q20 11 32 11 Z" fill="#67e8f9" opacity="0.8"/>
  <path d="M32 13 Q41 13 41 27 Q41 40 35 44 Q32 41 29 44 Q23 40 23 27 Q23 13 32 13 Z" fill="#a5f3fc" opacity="0.5"/>

  <!-- 胸の奥で妖しく脈動する霊核（スライムの核コア構造） -->
  <ellipse cx="32" cy="36" rx="6.5" ry="7.5" fill="#0284c7" opacity="0.75"/>
  <ellipse cx="32" cy="36" rx="4.5" ry="5.5" fill="#38bdf8"/>
  <circle cx="31" cy="34.5" r="2.2" fill="#ffffff" opacity="0.95"/>
  <!-- 霊気気泡粒子 -->
  <circle cx="25" cy="42" r="1.5" fill="#e0f2fe" opacity="0.7"/>
  <circle cx="38" cy="40" r="1.3" fill="#e0f2fe" opacity="0.6"/>

  <!-- 幽鬼の腕（左右に伸びる半透明の霊手） -->
  <path d="M19 28 Q6 30 10 38 Q17 35 19 32 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.2"/>
  <circle cx="10" cy="37" r="1.8" fill="#ffffff" opacity="0.9"/>
  <path d="M45 28 Q58 30 54 38 Q47 35 45 32 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.2"/>
  <circle cx="54" cy="37" r="1.8" fill="#ffffff" opacity="0.9"/>

  <!-- 頭頂部のうるおい光沢ハイライト（スライム基準） -->
  <path d="M24 13 Q32 10 40 14 Q34 17 24 15 Z" fill="#ffffff" opacity="0.8"/>
  <ellipse cx="44" cy="22" rx="2" ry="4" transform="rotate(25 44 22)" fill="#ffffff" opacity="0.5"/>

  <!-- 窪んだ髑髏眼窩 -->
  <ellipse cx="25" cy="22" rx="4.5" ry="5.5" fill="#042f2e" stroke="#0e7490" stroke-width="1"/>
  <ellipse cx="39" cy="22" rx="4.5" ry="5.5" fill="#042f2e" stroke="#0e7490" stroke-width="1"/>

  <!-- 妖しく燃え上がる生きたソウルアイ（スライム基準の白ハイライト2点） -->
  <!-- 左目 -->
  <path d="M25 24 Q22 20 25 17 Q28 20 25 24 Z" fill="#38bdf8"/>
  <circle cx="25" cy="20.5" r="2.2" fill="#0284c7"/>
  <circle cx="25" cy="20.5" r="1.4" fill="#ffffff"/>
  <circle cx="26.2" cy="22" r="0.6" fill="#ffffff" opacity="0.85"/>

  <!-- 右目 -->
  <path d="M39 24 Q36 20 39 17 Q42 20 39 24 Z" fill="#38bdf8"/>
  <circle cx="39" cy="20.5" r="2.2" fill="#0284c7"/>
  <circle cx="39" cy="20.5" r="1.4" fill="#ffffff"/>
  <circle cx="40.2" cy="22" r="0.6" fill="#ffffff" opacity="0.85"/>

  <!-- 怨嗟の叫びをあげる虚ろな口腔 -->
  <ellipse cx="32" cy="29" rx="3.5" ry="4.5" fill="#042f2e"/>
  <!-- 漏れ出る冷気スモーク粒子 -->
  <circle cx="32" cy="30" r="1.2" fill="#a5f3fc" opacity="0.8"/>
  <circle cx="30" cy="32" r="0.8" fill="#e0f2fe" opacity="0.6"/>
  <circle cx="34" cy="33" r="0.7" fill="#e0f2fe" opacity="0.6"/>

  <!-- 霊尾のたなびく先端エッジ光 -->
  <path d="M26 49 Q32 45 38 49" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.85"/>
</svg>`.trim();

  /** ゴースト背面（上向き） */
  public static readonly GHOST_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(8, 145, 178, 0.25)"/>
  <path d="M32 6 Q52 6 52 30 Q52 48 42 54 Q32 46 22 54 Q12 48 12 30 Q12 6 32 6 Z" fill="#06b6d4" opacity="0.25"/>
  <path d="M32 10 Q46 10 46 30 Q46 46 38 50 Q32 44 26 50 Q18 46 18 30 Q18 10 32 10 Z" fill="#0891b2" stroke="#0e7490" stroke-width="1.8"/>
  <path d="M32 12 Q43 12 43 28 Q43 42 36 47 Q32 43 28 47 Q21 42 21 28 Q21 12 32 12 Z" fill="#0284c7" opacity="0.75"/>
  <line x1="32" y1="12" x2="32" y2="44" stroke="#38bdf8" stroke-width="1.8" opacity="0.6"/>
</svg>`.trim();

  /** ゴースト真横 */
  public static readonly GHOST_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(8, 145, 178, 0.25)"/>
  <!-- オーラ -->
  <path d="M30 8 Q48 10 48 30 Q48 46 38 52 Q26 44 18 52 Q14 40 16 26 Q18 8 30 8 Z" fill="#06b6d4" opacity="0.25"/>
  <!-- 霊体本体 -->
  <path d="M30 10 Q44 12 44 30 Q44 44 36 48 Q26 42 20 48 Q16 38 18 26 Q20 10 30 10 Z" fill="#67e8f9" stroke="#0e7490" stroke-width="1.8"/>
  <!-- 前方に伸ばす腕 -->
  <path d="M36 28 Q52 30 48 38 Q40 35 38 30 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.2"/>
  <ellipse cx="40" cy="22" rx="4" ry="5.5" fill="#042f2e"/>
  <circle cx="41" cy="21" r="1.8" fill="#38bdf8"/>
  <circle cx="41.5" cy="20.5" r="0.9" fill="#ffffff"/>
  <ellipse cx="43" cy="30" rx="3" ry="4.5" fill="#042f2e"/>
</svg>`.trim();

  /** ゴースト斜め前 */
  public static readonly GHOST_DIAG_DOWN_SVG = MonsterAndItemSprites.GHOST_DOWN_SVG;
  /** ゴースト斜め後ろ */
  public static readonly GHOST_DIAG_UP_SVG = MonsterAndItemSprites.GHOST_UP_SVG;

  // =========================================================================
  // 3. ダークメイジ (MAGE) - 5方向
  // =========================================================================

  /** ダークメイジ正面（下向き: 深紫多層ローブ・金糸魔法陣・闇に浮かぶ魔眼・魔導杖紫電オーブ・詠唱手） */
  public static readonly MAGE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地浮遊シャドウ -->
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>

  <!-- ローブ裾（外層マントの重なりとドレープ） -->
  <path d="M20 28 L12 55 Q22 52 32 55 Q42 52 52 55 L44 28 Z" fill="#1e1b4b" stroke="#0f0728" stroke-width="1.8"/>
  <!-- 内層ローブ（深紫と金糸刺繍） -->
  <path d="M24 28 L17 54 Q25 51 32 53 Q39 51 47 54 L40 28 Z" fill="#3b0764"/>
  <path d="M28 28 L23 53 Q28 51 32 52 Q36 51 41 53 L36 28 Z" fill="#581c87"/>
  <!-- ローブ裾の古代金糸トリム & ルーン飾り -->
  <path d="M15 52 Q23 49 32 51 Q41 49 49 52" stroke="#fbbf24" stroke-width="1.6" fill="none"/>
  <circle cx="24" cy="50" r="1" fill="#fde68a"/>
  <circle cx="32" cy="49" r="1.2" fill="#fde68a"/>
  <circle cx="40" cy="50" r="1" fill="#fde68a"/>

  <!-- 胸元の黄金アミュレット（真紅の魔導宝石） -->
  <polygon points="32,32 35,36 32,40 29,36" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>
  <circle cx="32" cy="36" r="1.8" fill="#ef4444"/>

  <!-- 左手（詠唱の構え: 紫電の魔力粒子） -->
  <ellipse cx="20" cy="38" rx="2.8" ry="2.2" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
  <circle cx="17" cy="36" r="1.5" fill="#c084fc" opacity="0.8"/>
  <circle cx="15" cy="33" r="1" fill="#e879f9" opacity="0.6"/>

  <!-- 尖がり魔導フード頭部（深い立体陰影） -->
  <path d="M18 28 Q32 -2 46 28 Q32 23 18 28 Z" fill="#2e1065" stroke="#0f0728" stroke-width="1.8"/>
  <path d="M22 25 Q32 4 42 25" stroke="#4c1d95" stroke-width="2" fill="none"/>
  <!-- フードの金糸縁取り -->
  <path d="M19 28 Q32 22 45 28" stroke="#fbbf24" stroke-width="1.2" fill="none"/>

  <!-- フード内の深淵の漆黒 -->
  <path d="M21 25 Q32 21 43 25 Q32 30 21 25 Z" fill="#020617"/>
  <!-- 怪しくギラつく双眸の魔眼（マゼンタ怪光とスパーク） -->
  <ellipse cx="27" cy="25" rx="3" ry="1.8" fill="#f0abfc"/>
  <ellipse cx="27" cy="25" rx="1.5" ry="1" fill="#ffffff"/>
  <ellipse cx="37" cy="25" rx="3" ry="1.8" fill="#f0abfc"/>
  <ellipse cx="37" cy="25" rx="1.5" ry="1" fill="#ffffff"/>
  <!-- 魔眼の放電スパーク -->
  <line x1="23" y1="25" x2="25" y2="25" stroke="#e879f9" stroke-width="0.8"/>
  <line x1="39" y1="25" x2="41" y2="25" stroke="#e879f9" stroke-width="0.8"/>

  <!-- 右手: 魔導杖（古木シャフト、金爪台座、浮遊回転オーブ） -->
  <line x1="49" y1="12" x2="49" y2="54" stroke="#451a03" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="49" y1="14" x2="49" y2="52" stroke="#78350f" stroke-width="1.5"/>
  <!-- 杖頭の黄金鉤爪台座 -->
  <path d="M44 14 Q49 19 54 14 L52 17 Q49 15 46 17 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
  <!-- 浮遊する紫電の暗黒魔力球 -->
  <circle cx="49" cy="9" r="8" fill="#a855f7" opacity="0.3"/>
  <circle cx="49" cy="9" r="6" fill="#7e22ce" stroke="#e879f9" stroke-width="1.5"/>
  <circle cx="47.5" cy="7.5" r="2.2" fill="#ffffff"/>
  <!-- オーブを周回する魔力軌道リング -->
  <ellipse cx="49" cy="9" rx="8" ry="3.5" fill="none" stroke="#f0abfc" stroke-width="1" transform="rotate(-20 49 9)"/>
  <!-- オーブの稲妻スパーク -->
  <polygon points="50,2 47,8 52,7 48,15 54,6 49,7" fill="#fde68a"/>
</svg>`.trim();

  /** ダークメイジ背面（上向き） */
  public static readonly MAGE_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <!-- マント背面ドレープ -->
  <path d="M20 28 L12 55 Q22 52 32 55 Q42 52 52 55 L44 28 Z" fill="#1e1b4b" stroke="#0f0728" stroke-width="1.8"/>
  <path d="M24 28 L18 54 Q25 52 32 53 Q39 52 46 54 L40 28 Z" fill="#2e1065"/>
  <!-- 背面の黄金魔法陣シンボル刺繍 -->
  <circle cx="32" cy="40" r="7" fill="none" stroke="#fbbf24" stroke-width="1.2" opacity="0.8"/>
  <polygon points="32,34 37,43 27,43" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.8"/>
  <polygon points="32,46 37,37 27,37" fill="none" stroke="#fbbf24" stroke-width="0.8" opacity="0.8"/>
  <!-- 尖がりフード後ろ姿 -->
  <path d="M18 28 Q32 -2 46 28 Q32 23 18 28 Z" fill="#2e1065" stroke="#0f0728" stroke-width="1.8"/>
  <line x1="32" y1="4" x2="32" y2="26" stroke="#1e1b4b" stroke-width="1.8"/>
  <!-- 杖（背面） -->
  <line x1="49" y1="12" x2="49" y2="54" stroke="#451a03" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="49" cy="9" r="6" fill="#7e22ce" stroke="#e879f9" stroke-width="1.2"/>
</svg>`.trim();

  /** ダークメイジ真横 */
  public static readonly MAGE_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <!-- ローブ横姿 -->
  <path d="M24 28 L14 55 Q26 52 44 55 L38 28 Z" fill="#1e1b4b" stroke="#0f0728" stroke-width="1.8"/>
  <path d="M28 28 L20 54 Q28 52 40 54 L35 28 Z" fill="#3b0764"/>
  <!-- フード横顔 -->
  <path d="M18 28 Q28 -2 42 26 Q32 24 18 28 Z" fill="#2e1065" stroke="#0f0728" stroke-width="1.8"/>
  <path d="M30 23 Q38 22 42 27 Q36 29 30 23 Z" fill="#020617"/>
  <ellipse cx="38" cy="25" rx="2.5" ry="1.5" fill="#f0abfc"/>
  <circle cx="38" cy="25" r="0.8" fill="#ffffff"/>
  <!-- 前方に突き出す魔導杖 -->
  <line x1="48" y1="10" x2="46" y2="54" stroke="#451a03" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="48" cy="8" r="6.5" fill="#7e22ce" stroke="#e879f9" stroke-width="1.5"/>
  <circle cx="46.5" cy="6.5" r="2" fill="#ffffff"/>
  <ellipse cx="48" cy="8" rx="7" ry="3" fill="none" stroke="#f0abfc" stroke-width="1" transform="rotate(-15 48 8)"/>
</svg>`.trim();

  /** ダークメイジ斜め前 */
  public static readonly MAGE_DIAG_DOWN_SVG = MonsterAndItemSprites.MAGE_DOWN_SVG;
  /** ダークメイジ斜め後ろ */
  public static readonly MAGE_DIAG_UP_SVG = MonsterAndItemSprites.MAGE_UP_SVG;

  // =========================================================================
  // 4. レッドドラゴン (DRAGON) - 5方向
  // =========================================================================

  /** レッドドラゴン正面（下向き: 黄金の二対大角、雄大な竜翼膜と骨爪、灼熱の胸部マグマコア発光、スライム基準の生きた黄金竜眼、純白竜牙列と火の粉） */
  public static readonly DRAGON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地大型ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="25" ry="6.5" fill="rgba(0,0,0,0.48)"/>

  <!-- 側面に覗く太いトゲ付き竜尾 -->
  <path d="M18 48 Q8 50 4 42 Q2 36 8 36 Q10 42 20 44 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.6"/>
  <polygon points="6,38 2,33 8,36" fill="#f59e0b"/>
  <polygon points="12,43 9,47 14,46" fill="#f59e0b"/>

  <!-- 左竜翼（雄大な翼幅・多層皮膜・骨爪・光沢ハイライト） -->
  <path d="M22 28 Q4 4 0 16 Q8 32 16 35 Q20 40 24 35 Z" fill="#581c1c" stroke="#450a0a" stroke-width="1.8"/>
  <path d="M20 27 Q6 8 3 17 Q9 30 16 33 Q19 37 22 34 Z" fill="#991b1b"/>
  <path d="M19 26 Q9 12 6 18 Q11 28 17 31 Z" fill="#dc2626" opacity="0.4"/>
  <!-- 左翼骨格リブ（竜骨指） -->
  <path d="M22 28 Q8 12 1 15" stroke="#7f1d1d" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M22 28 Q12 22 7 32" stroke="#7f1d1d" stroke-width="1.8" fill="none"/>
  <path d="M22 28 Q18 28 15 39" stroke="#7f1d1d" stroke-width="1.5" fill="none"/>
  <!-- 左翼の鋭い白骨鉤爪 -->
  <polygon points="1,15 -2,11 3,13" fill="#f8fafc" stroke="#450a0a" stroke-width="0.8"/>
  <polygon points="0,13 -1,11 2,13" fill="#ffffff"/>

  <!-- 右竜翼（雄大な翼幅・多層皮膜・骨爪・光沢ハイライト） -->
  <path d="M42 28 Q60 4 64 16 Q56 32 48 35 Q44 40 40 35 Z" fill="#581c1c" stroke="#450a0a" stroke-width="1.8"/>
  <path d="M44 27 Q58 8 61 17 Q55 30 48 33 Q45 37 42 34 Z" fill="#991b1b"/>
  <path d="M45 26 Q55 12 58 18 Q53 28 47 31 Z" fill="#dc2626" opacity="0.4"/>
  <!-- 右翼骨格リブ（竜骨指） -->
  <path d="M42 28 Q56 12 63 15" stroke="#7f1d1d" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M42 28 Q52 22 57 32" stroke="#7f1d1d" stroke-width="1.8" fill="none"/>
  <path d="M42 28 Q46 28 49 39" stroke="#7f1d1d" stroke-width="1.5" fill="none"/>
  <!-- 右翼の鋭い白骨鉤爪 -->
  <polygon points="63,15 66,11 61,13" fill="#f8fafc" stroke="#450a0a" stroke-width="0.8"/>
  <polygon points="64,13 65,11 62,13" fill="#ffffff"/>

  <!-- 竜の胴体装甲（深紅の胸鱗・多層立体構造） -->
  <path d="M20 30 Q16 46 22 54 Q32 57 42 54 Q48 46 44 30 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
  <path d="M22 32 Q18 45 23 52 Q32 55 41 52 Q46 45 42 32 Z" fill="#991b1b" opacity="0.6"/>

  <!-- 胸の奥で燃えたぎるドラゴンのマグマコア発光（スライム核構造） -->
  <circle cx="32" cy="40" r="9" fill="#ea580c" opacity="0.4"/>
  <circle cx="32" cy="40" r="6" fill="#f97316" opacity="0.75"/>
  <circle cx="32" cy="40" r="3.5" fill="#fef08a"/>
  <circle cx="31" cy="39" r="1.5" fill="#ffffff"/>

  <!-- 赤熱したマグマ蛇腹甲（ドラゴンスケール甲板） -->
  <path d="M25 33 Q32 30 39 33 L38 38 Q32 35 26 38 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <path d="M24 39 Q32 36 40 39 L39 44 Q32 41 25 44 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <path d="M25 45 Q32 42 39 45 L38 50 Q32 47 26 50 Z" fill="#ea580c" stroke="#9a3412" stroke-width="1"/>
  <!-- 蛇腹の隙間から漏れる灼熱光ハイライト -->
  <line x1="28" y1="36" x2="36" y2="36" stroke="#ffffff" stroke-width="1.2" opacity="0.9"/>
  <line x1="27" y1="42" x2="37" y2="42" stroke="#ffffff" stroke-width="1.2" opacity="0.9"/>

  <!-- 大地を掴む太い両脚と爪（立体鱗） -->
  <path d="M20 48 L17 56 L24 56 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.2"/>
  <polygon points="16,56 18,58 20,56" fill="#f8fafc"/>
  <polygon points="20,56 22,58 24,56" fill="#f8fafc"/>
  <path d="M44 48 L47 56 L40 56 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.2"/>
  <polygon points="40,56 42,58 44,56" fill="#f8fafc"/>
  <polygon points="44,56 46,58 48,56" fill="#f8fafc"/>

  <!-- 巨大な黄金の二対大角（主角・副角・光沢ハイライト） -->
  <!-- 左主角 -->
  <path d="M23 18 Q12 4 8 0 Q18 4 25 14 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.6"/>
  <path d="M21 16 Q13 6 10 3 Q16 6 22 13 Z" fill="#fef08a" opacity="0.7"/>
  <!-- 左副角 -->
  <path d="M20 22 Q12 16 10 13 Q16 17 22 20 Z" fill="#d97706" stroke="#78350f" stroke-width="1"/>
  <!-- 右主角 -->
  <path d="M41 18 Q52 4 56 0 Q46 4 39 14 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.6"/>
  <path d="M43 16 Q51 6 54 3 Q48 6 42 13 Z" fill="#fef08a" opacity="0.7"/>
  <!-- 右副角 -->
  <path d="M44 22 Q52 16 54 13 Q48 17 42 20 Z" fill="#d97706" stroke="#78350f" stroke-width="1"/>

  <!-- 獰猛な竜頭（筋肉質な顎・額の竜鱗甲板・うるおい光沢） -->
  <path d="M20 18 Q32 10 44 18 Q46 28 32 31 Q18 28 20 18 Z" fill="#dc2626" stroke="#450a0a" stroke-width="2"/>
  <!-- 額のダイヤモンド型竜鱗プレート（多層立体） -->
  <polygon points="32,14 36,21 32,26 28,21" fill="#991b1b" stroke="#7f1d1d" stroke-width="1.2"/>
  <polygon points="32,15 35,21 32,24 29,21" fill="#ef4444"/>
  <line x1="32" y1="16" x2="32" y2="24" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <!-- 頭頂部ハイライト光（スライム基準のツヤ） -->
  <path d="M24 14 Q32 11 40 14" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.6"/>

  <!-- 黄金の爬虫類竜眼（スライム基準の多層生きた瞳光・縦スリット） -->
  <!-- 左目 -->
  <ellipse cx="25.5" cy="20" rx="3.8" ry="4.5" fill="#450a0a" stroke="#1c1917" stroke-width="0.8"/>
  <ellipse cx="25.5" cy="20" rx="2.8" ry="3.5" fill="#fef08a"/>
  <line x1="25.5" y1="17" x2="25.5" y2="23" stroke="#000000" stroke-width="1.8"/>
  <circle cx="26.5" cy="18.5" r="0.9" fill="#ffffff"/>
  <circle cx="24.8" cy="21.5" r="0.5" fill="#ffffff" opacity="0.8"/>

  <!-- 右目 -->
  <ellipse cx="38.5" cy="20" rx="3.8" ry="4.5" fill="#450a0a" stroke="#1c1917" stroke-width="0.8"/>
  <ellipse cx="38.5" cy="20" rx="2.8" ry="3.5" fill="#fef08a"/>
  <line x1="38.5" y1="17" x2="38.5" y2="23" stroke="#000000" stroke-width="1.8"/>
  <circle cx="39.5" cy="18.5" r="0.9" fill="#ffffff"/>
  <circle cx="37.8" cy="21.5" r="0.5" fill="#ffffff" opacity="0.8"/>

  <!-- 鼻孔と赤熱火炎ブレススモーク -->
  <circle cx="29" cy="26" r="1.5" fill="#450a0a"/>
  <circle cx="29" cy="26" r="0.8" fill="#ef4444"/>
  <circle cx="35" cy="26" r="1.5" fill="#450a0a"/>
  <circle cx="35" cy="26" r="0.8" fill="#ef4444"/>
  <!-- 立ち上る火の粉粒子 -->
  <circle cx="28" cy="29" r="1.2" fill="#f97316"/>
  <circle cx="36" cy="29" r="1.2" fill="#f97316"/>
  <circle cx="32" cy="30" r="1.5" fill="#fef08a"/>
  <circle cx="32" cy="30" r="0.7" fill="#ffffff"/>

  <!-- 顎と鋭い巨大純白竜牙列（光沢ハイライト） -->
  <polygon points="26,27 27.5,32 29,27" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
  <polygon points="30,27 31.5,33 33,27" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
  <polygon points="34,27 35.5,32 37,27" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5"/>
</svg>`.trim();

  /** レッドドラゴン背面（上向き） */
  public static readonly DRAGON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.45)"/>
  <!-- 竜尾 -->
  <path d="M30 48 Q28 56 22 58 Q16 56 24 50 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.8"/>
  <!-- 大翼背面 -->
  <path d="M22 28 Q4 4 0 16 Q8 32 16 35 Q20 40 24 35 Z" fill="#581c1c" stroke="#450a0a" stroke-width="1.8"/>
  <path d="M42 28 Q60 4 64 16 Q56 32 48 35 Q44 40 40 35 Z" fill="#581c1c" stroke="#450a0a" stroke-width="1.8"/>
  <!-- 胴体背面 -->
  <path d="M20 30 Q16 46 22 54 Q32 57 42 54 Q48 46 44 30 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
  <!-- 背骨に沿って並ぶ鋭いドラゴンスパイク（背ビレ） -->
  <polygon points="32,30 30,34 34,34" fill="#f59e0b"/>
  <polygon points="32,36 29,41 35,41" fill="#f59e0b"/>
  <polygon points="32,43 29,48 35,48" fill="#f59e0b"/>
  <polygon points="32,50 30,54 34,54" fill="#f59e0b"/>
  <!-- 角背面 -->
  <path d="M23 18 Q12 4 8 0 Q18 4 25 14 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
  <path d="M41 18 Q52 4 56 0 Q46 4 39 14 Z" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
  <path d="M20 18 Q32 10 44 18 Q46 28 32 30 Q18 28 20 18 Z" fill="#991b1b" stroke="#450a0a" stroke-width="2"/>
</svg>`.trim();

  /** レッドドラゴン真横 */
  public static readonly DRAGON_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.45)"/>
  <!-- 奥の翼 -->
  <path d="M24 26 Q12 4 4 14 Q14 28 22 32 Z" fill="#581c1c" stroke="#450a0a" stroke-width="1.8"/>
  <!-- 竜尾 -->
  <path d="M18 44 Q8 46 2 40 Q8 36 16 40 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="1.8"/>
  <polygon points="4,38 0,33 6,36" fill="#f59e0b"/>
  <!-- 胴体 -->
  <path d="M20 30 Q18 46 24 54 Q36 56 42 50 L38 30 Z" fill="#7f1d1d" stroke="#450a0a" stroke-width="2"/>
  <!-- 腹部蛇腹甲 -->
  <path d="M30 34 Q38 35 40 40 L38 46 Q32 44 28 42 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
  <!-- 後脚 -->
  <path d="M24 46 L20 56 L28 56 Z" fill="#7f1d1d"/>
  <polygon points="19,56 21,58 23,56" fill="#f8fafc"/>
  <polygon points="25,56 27,58 29,56" fill="#f8fafc"/>
  <!-- 手前の大翼（大きく跳ね上がる） -->
  <path d="M26 30 Q44 2 58 10 Q48 30 32 36 Z" fill="#991b1b" stroke="#450a0a" stroke-width="2"/>
  <path d="M26 30 Q44 12 56 11" stroke="#7f1d1d" stroke-width="2" fill="none"/>
  <polygon points="58,10 61,6 56,8" fill="#f8fafc"/>
  <!-- 頭部横顔 -->
  <path d="M28 24 Q36 12 48 20 Q56 26 44 32 Q32 32 28 24 Z" fill="#dc2626" stroke="#450a0a" stroke-width="2"/>
  <!-- 大角 -->
  <path d="M32 16 Q24 2 20 0 Q28 6 34 14 Z" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
  <!-- 黄金横目 -->
  <ellipse cx="40" cy="20" rx="3" ry="3.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <line x1="40" y1="18" x2="40" y2="23" stroke="#000000" stroke-width="1.5"/>
  <!-- 口と牙 -->
  <polygon points="46,26 50,30 44,29" fill="#ffffff"/>
  <!-- 鼻先ブレス炎 -->
  <circle cx="50" cy="24" r="1.5" fill="#ef4444"/>
  <circle cx="52" cy="23" r="1" fill="#f59e0b"/>
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

  /** 人食い箱 (MIMIC) - 正面（跳ね上がった上蓋、不揃いの鋭い白骨牙列、スライム基準の生き生きとした血走る巨大怪眼、生々しい毒舌のぬめり光沢、オーク木目と真鍮鋲の宝箱、奇怪な爪足） */
  public static readonly MIMIC_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地大型ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="23" ry="6" fill="rgba(0,0,0,0.48)"/>

  <!-- 箱底から覗く奇怪な爪足（立体鉤爪） -->
  <path d="M14 52 L9 57 L15 56" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M50 52 L55 57 L49 56" stroke="#0f172a" stroke-width="2.2" fill="none" stroke-linecap="round"/>

  <!-- 宝箱下部本体（オーク木目と立体陰影） -->
  <rect x="10" y="27" width="44" height="29" rx="3" fill="#5c2605" stroke="#2e1002" stroke-width="2"/>
  <rect x="12" y="29" width="40" height="25" rx="2" fill="#78350f"/>
  <rect x="13" y="30" width="38" height="6" fill="#92400e" opacity="0.6"/>
  <!-- 木目の横スリット筋 -->
  <line x1="12" y1="38" x2="52" y2="38" stroke="#451a03" stroke-width="1.3"/>
  <line x1="12" y1="46" x2="52" y2="46" stroke="#451a03" stroke-width="1.3"/>

  <!-- 鉄の補強帯（アイアンバンド・立体ハイライト） -->
  <rect x="15" y="27" width="5" height="29" fill="#334155" stroke="#1e293b" stroke-width="0.8"/>
  <line x1="16" y1="28" x2="16" y2="55" stroke="#64748b" stroke-width="0.8"/>
  <rect x="44" y="27" width="5" height="29" fill="#334155" stroke="#1e293b" stroke-width="0.8"/>
  <line x1="45" y1="28" x2="45" y2="55" stroke="#64748b" stroke-width="0.8"/>
  <!-- 真鍮リベット鋲（光沢ハイライト） -->
  <circle cx="17.5" cy="30" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="17.2" cy="29.7" r="0.4" fill="#ffffff"/>
  <circle cx="17.5" cy="42" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="17.2" cy="41.7" r="0.4" fill="#ffffff"/>
  <circle cx="17.5" cy="53" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="46.5" cy="30" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="46.2" cy="29.7" r="0.4" fill="#ffffff"/>
  <circle cx="46.5" cy="42" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="46.2" cy="41.7" r="0.4" fill="#ffffff"/>
  <circle cx="46.5" cy="53" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>

  <!-- コーナー真鍮金具ガード -->
  <polygon points="10,50 10,56 16,56" fill="#d97706" stroke="#78350f" stroke-width="0.6"/>
  <polygon points="54,50 54,56 48,56" fill="#d97706" stroke="#78350f" stroke-width="0.6"/>

  <!-- 口内の漆黒と深紅の深淵（多層陰影） -->
  <path d="M12 28 Q32 17 52 28 L50 13 Q32 9 14 13 Z" fill="#4c0519"/>
  <rect x="13" y="15" width="38" height="14" fill="#020617"/>

  <!-- 奥底からギラリと覗く血走った巨大怪眼（スライム基準の多層生きた瞳光） -->
  <!-- 左怪眼 -->
  <ellipse cx="23.5" cy="18" rx="4.5" ry="5.2" fill="#450a0a" stroke="#dc2626" stroke-width="0.8"/>
  <ellipse cx="23.5" cy="18" rx="3.5" ry="4.2" fill="#fef08a"/>
  <ellipse cx="23.5" cy="18" rx="2" ry="2.8" fill="#ef4444"/>
  <circle cx="23.5" cy="18" r="1.1" fill="#000000"/>
  <circle cx="22.3" cy="16.5" r="1.1" fill="#ffffff"/>
  <circle cx="24.8" cy="19.5" r="0.5" fill="#ffffff" opacity="0.9"/>
  <!-- 充血血管筋 -->
  <path d="M20 16 L22 17" stroke="#b91c1c" stroke-width="0.7"/>
  <path d="M25 19 L27 19.5" stroke="#b91c1c" stroke-width="0.7"/>

  <!-- 右怪眼 -->
  <ellipse cx="40.5" cy="18" rx="4.5" ry="5.2" fill="#450a0a" stroke="#dc2626" stroke-width="0.8"/>
  <ellipse cx="40.5" cy="18" rx="3.5" ry="4.2" fill="#fef08a"/>
  <ellipse cx="40.5" cy="18" rx="2" ry="2.8" fill="#ef4444"/>
  <circle cx="40.5" cy="18" r="1.1" fill="#000000"/>
  <circle cx="39.3" cy="16.5" r="1.1" fill="#ffffff"/>
  <circle cx="41.8" cy="19.5" r="0.5" fill="#ffffff" opacity="0.9"/>
  <path d="M37 19.5 L39 19" stroke="#b91c1c" stroke-width="0.7"/>
  <path d="M42 16 L44 17" stroke="#b91c1c" stroke-width="0.7"/>

  <!-- 跳ね上がった上蓋（ドーム状アーチ・木目・鉄帯・光沢ハイライト） -->
  <path d="M8 15 Q32 -3 56 15 L52 7 Q32 -9 12 7 Z" fill="#78350f" stroke="#2e1002" stroke-width="2"/>
  <path d="M10 13 Q32 -1 54 13" stroke="#b45309" stroke-width="2" fill="none"/>
  <path d="M14 9 Q32 -3 50 9" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.5"/>
  <!-- 上蓋の鉄帯 -->
  <path d="M15 11 Q19 1 21 -1" stroke="#334155" stroke-width="2.6" fill="none"/>
  <path d="M49 11 Q45 1 43 -1" stroke="#334155" stroke-width="2.6" fill="none"/>

  <!-- 鋭い白骨牙列（上下の不揃いな噛み合わせ・ハイライト） -->
  <!-- 上牙列 -->
  <polygon points="14,14 16,21 18,14" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="19,13 21,22 23,13" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="25,12 27,21 29,12" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="31,11 33,22 35,11" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="37,12 39,21 41,12" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="43,13 45,22 47,13" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="48,14 50,21 52,14" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <!-- 下牙列 -->
  <polygon points="14,30 16,23 18,30" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="20,30 22,22 24,30" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="38,30 40,21 42,30" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>
  <polygon points="44,30 46,23 48,30" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.6"/>

  <!-- だらりと垂れ下がる生々しい長い毒舌（ぬめり光沢・毒の飛沫雫） -->
  <path d="M28 24 Q37 26 31 36 Q25 46 34 51 Q39 49 35 40 Q39 32 34 24 Z" fill="#e11d48" stroke="#9f1239" stroke-width="1.3"/>
  <path d="M29 27 Q34 34 31 44" stroke="#fda4af" stroke-width="1.5" fill="none" opacity="0.85"/>
  <ellipse cx="33" cy="48" rx="2" ry="1.2" fill="#ffffff" opacity="0.6"/>
  <!-- 毒液の飛沫雫 -->
  <circle cx="36" cy="53" r="1.3" fill="#a855f7"/>
  <circle cx="36" cy="53" r="0.6" fill="#ffffff"/>
  <circle cx="32" cy="47" r="0.8" fill="#fda4af"/>
</svg>`.trim();

  /** 人食い箱 (MIMIC) - 背面（上向き） */
  public static readonly MIMIC_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <rect x="10" y="28" width="44" height="28" rx="3" fill="#5c2605" stroke="#2e1002" stroke-width="2"/>
  <rect x="12" y="30" width="40" height="24" rx="2" fill="#78350f"/>
  <!-- 背面の重厚ヒンジ蝶番 -->
  <rect x="18" y="24" width="6" height="12" rx="1" fill="#334155" stroke="#1e1b4b" stroke-width="1"/>
  <circle cx="21" cy="27" r="1" fill="#fbbf24"/>
  <circle cx="21" cy="33" r="1" fill="#fbbf24"/>
  <rect x="40" y="24" width="6" height="12" rx="1" fill="#334155" stroke="#1e1b4b" stroke-width="1"/>
  <circle cx="43" cy="27" r="1" fill="#fbbf24"/>
  <circle cx="43" cy="33" r="1" fill="#fbbf24"/>
  <!-- 上蓋背面 -->
  <path d="M10 28 Q32 14 54 28 Z" fill="#92400e" stroke="#2e1002" stroke-width="2"/>
  <!-- 鉄帯 -->
  <rect x="18" y="36" width="6" height="18" fill="#334155"/>
  <rect x="40" y="36" width="6" height="18" fill="#334155"/>
</svg>`.trim();

  /** 腐乱ゾンビ (ZOMBIE) - 正面（立体露出頭蓋骨、縫合痕、左右非対称の生きた死眼、裂け服から覗く立体肋骨、血塗られた黒爪、おでこ光沢） */
  public static readonly ZOMBIE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="19" ry="5" fill="rgba(0,0,0,0.38)"/>

  <!-- ボロボロの衣服（引き裂かれたチュニック・多層破れ目） -->
  <path d="M18 28 L13 50 L49 50 L44 28 Z" fill="#334155" stroke="#0f172a" stroke-width="1.8"/>
  <polygon points="13,50 18,44 22,50 28,45 34,51 40,44 46,51 49,50" fill="#1e293b"/>
  <!-- 服のハイライト -->
  <path d="M20 30 L26 44" stroke="#475569" stroke-width="1.2"/>

  <!-- 破れ目から覗く灰白の立体肋骨（奥の漆黒胸腔＆手前の骨ハイライト） -->
  <rect x="29" y="32" width="12" height="13" fill="#020617"/>
  <line x1="30" y1="35" x2="40" y2="35" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
  <line x1="31" y1="34.5" x2="39" y2="34.5" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round"/>
  <line x1="31" y1="39" x2="39" y2="39" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/>
  <line x1="32" y1="38.5" x2="38" y2="38.5" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round"/>
  <line x1="32" y1="43" x2="38" y2="43" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round"/>

  <!-- 引きずる両足（左右非対称） -->
  <rect x="22" y="47" width="6.5" height="10" fill="#1e293b"/>
  <rect x="22" y="55" width="7.5" height="3" fill="#65a30d" stroke="#3f6212" stroke-width="0.8"/>
  <rect x="34" y="47" width="6.5" height="7" fill="#1e293b"/>
  <rect x="35" y="52" width="5.5" height="6" fill="#4d7c0f" stroke="#3f6212" stroke-width="0.8"/>

  <!-- 前方に突き出された腐乱した両腕 & 血塗られた黒爪 -->
  <!-- 左腕 -->
  <path d="M18 31 L7 35 L7 40 L16 38 Z" fill="#65a30d" stroke="#365314" stroke-width="1.3"/>
  <polygon points="7,35 3,37 6,40" fill="#0f172a"/>
  <circle cx="4" cy="38" r="0.9" fill="#991b1b"/>
  <!-- 右腕 -->
  <path d="M44 31 L55 34 L55 39 L46 38 Z" fill="#65a30d" stroke="#365314" stroke-width="1.3"/>
  <polygon points="55,34 59,36 56,39" fill="#0f172a"/>
  <circle cx="58" cy="37" r="0.9" fill="#991b1b"/>

  <!-- 腐敗した頭部（緑灰色の立体輪郭・頬骨） -->
  <ellipse cx="32" cy="20" rx="12" ry="12.5" fill="#65a30d" stroke="#365314" stroke-width="1.8"/>
  <ellipse cx="28" cy="16" rx="6" ry="3" fill="#84cc16" opacity="0.6"/>

  <!-- 頭頂部〜右側頭部: 露出した白い頭蓋骨（クラック付き） -->
  <path d="M30 8 Q42 7 43 16 Q36 17 30 14 Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2"/>
  <path d="M32 9 Q40 9 41 15" stroke="#ffffff" stroke-width="1" fill="none"/>
  <line x1="35" y1="11" x2="38" y2="15" stroke="#64748b" stroke-width="0.9"/>

  <!-- 額の縫合ステッチ -->
  <path d="M23 16 L29 14" stroke="#1c1917" stroke-width="1.3"/>
  <line x1="24" y1="14" x2="25" y2="18" stroke="#1c1917" stroke-width="0.9"/>
  <line x1="27" y1="13" x2="28" y2="17" stroke="#1c1917" stroke-width="0.9"/>

  <!-- 左右非対称の死眼（スライム基準の立体球眼） -->
  <!-- 左目: 白濁した虚ろな大球眼（立体ハイライト） -->
  <ellipse cx="25.5" cy="20" rx="4.2" ry="4.5" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
  <ellipse cx="25.5" cy="20" rx="3.5" ry="3.8" fill="#fef08a"/>
  <circle cx="25.5" cy="20" r="1.6" fill="#475569"/>
  <circle cx="24.3" cy="18.5" r="1.2" fill="#ffffff"/>
  <circle cx="26.5" cy="21.5" r="0.5" fill="#ffffff" opacity="0.8"/>

  <!-- 右目: 眼窩の深淵に灯る小さな赤色残光（スライム調ソウルアイ） -->
  <ellipse cx="37.5" cy="20" rx="4" ry="4.5" fill="#090d16" stroke="#1c1917" stroke-width="0.8"/>
  <circle cx="37.5" cy="20" r="2.2" fill="#991b1b"/>
  <circle cx="37.5" cy="20" r="1.4" fill="#ef4444"/>
  <circle cx="37.2" cy="19.2" r="0.6" fill="#ffffff"/>

  <!-- 裂けた頬とだらしなく開いた顎・死人歯（立体陰影） -->
  <path d="M25 27 Q32 32 39 27 Q36 33 27 32 Z" fill="#18181b"/>
  <rect x="27.5" y="27" width="2" height="2.8" rx="0.4" fill="#fef3c7" stroke="#78350f" stroke-width="0.4"/>
  <rect x="31" y="27" width="2" height="2.2" rx="0.4" fill="#fef3c7" stroke="#78350f" stroke-width="0.4"/>
  <rect x="34.5" y="27" width="2" height="3.2" rx="0.4" fill="#fef3c7" stroke="#78350f" stroke-width="0.4"/>
</svg>`.trim();

  /** 腐乱ゾンビ (ZOMBIE) - 背面（上向き） */
  public static readonly ZOMBIE_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 背中の破れ服 -->
  <path d="M18 28 L14 50 L48 50 L44 28 Z" fill="#334155" stroke="#0f172a" stroke-width="1.8"/>
  <!-- 背中から露出した脊椎骨 -->
  <line x1="32" y1="30" x2="32" y2="46" stroke="#0f172a" stroke-width="4"/>
  <line x1="32" y1="30" x2="32" y2="46" stroke="#e2e8f0" stroke-width="2"/>
  <circle cx="32" cy="33" r="1.5" fill="#f8fafc"/>
  <circle cx="32" cy="38" r="1.5" fill="#f8fafc"/>
  <circle cx="32" cy="43" r="1.5" fill="#f8fafc"/>
  <!-- 後頭部と露出骨 -->
  <ellipse cx="32" cy="20" rx="11" ry="12" fill="#4d7c0f" stroke="#365314" stroke-width="1.8"/>
  <path d="M30 9 Q41 8 42 16 Q36 17 30 14 Z" fill="#e2e8f0"/>
  <!-- 脚 -->
  <rect x="22" y="48" width="6" height="9" fill="#1e293b"/>
  <rect x="34" y="48" width="6" height="9" fill="#1e293b"/>
</svg>`.trim();

  /** 小悪魔インプ (IMP) - 正面（黒紫コウモリ翼、漆黒悪魔角の光沢、スライム基準のいたずら黄色猫目、八重歯、スペード尾、赤熱三叉槍と立ち上る炎） */
  public static readonly IMP_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地浮遊シャドウ -->
  <ellipse cx="32" cy="58" rx="16" ry="4.2" fill="rgba(0,0,0,0.32)"/>

  <!-- 背中の悪魔コウモリ翼（左右・多層皮膜＆光沢） -->
  <!-- 左翼 -->
  <path d="M25 27 Q8 11 2 23 Q10 33 18 31 Q20 37 25 31 Z" fill="#4a044e" stroke="#2e022d" stroke-width="1.6"/>
  <path d="M24 26 Q10 14 5 23 Q11 30 18 29 Z" fill="#701a75" opacity="0.6"/>
  <path d="M25 27 Q10 15 5 24" stroke="#a21caf" stroke-width="1.4" fill="none"/>
  <polygon points="5,24 2,21 6,23" fill="#f43f5e"/>
  <!-- 右翼 -->
  <path d="M39 27 Q56 11 62 23 Q54 33 46 31 Q44 37 39 31 Z" fill="#4a044e" stroke="#2e022d" stroke-width="1.6"/>
  <path d="M40 26 Q54 14 59 23 Q53 30 46 29 Z" fill="#701a75" opacity="0.6"/>
  <path d="M39 27 Q54 15 59 24" stroke="#a21caf" stroke-width="1.4" fill="none"/>
  <polygon points="59,24 62,21 58,23" fill="#f43f5e"/>

  <!-- しなやかにくねる悪魔の尾 & 鋭いスペード先端（立体グラデーション） -->
  <path d="M30 46 Q23 54 17 50 Q13 44 14 38" stroke="#be185d" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M29 46 Q23 53 18 50" stroke="#f472b6" stroke-width="1" fill="none"/>
  <polygon points="14,34 9,40 19,40" fill="#f43f5e" stroke="#9f1239" stroke-width="1"/>
  <polygon points="14,36 11,39 17,39" fill="#fda4af"/>

  <!-- 小悪魔の胴体 & スタッズハーネス（ぷにっとした立体感） -->
  <rect x="24" y="33" width="16" height="16" rx="5" fill="#db2777" stroke="#9f1239" stroke-width="1.6"/>
  <ellipse cx="32" cy="40" rx="5.5" ry="5.5" fill="#f472b6" opacity="0.5"/>
  <!-- 黒革ハーネスと金鋲 -->
  <line x1="25" y1="35" x2="39" y2="45" stroke="#18181b" stroke-width="1.8"/>
  <line x1="39" y1="35" x2="25" y2="45" stroke="#18181b" stroke-width="1.8"/>
  <circle cx="32" cy="40" r="1.5" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <circle cx="31.8" cy="39.7" r="0.5" fill="#ffffff"/>

  <!-- 小悪魔の足（ぷにっとした足） -->
  <path d="M27 49 L25 56 L29 56 Z" fill="#be185d"/>
  <path d="M37 49 L35 56 L39 56 Z" fill="#be185d"/>

  <!-- 尖った大耳（黄金ピアス付き） -->
  <polygon points="22,23 11,17 20,27" fill="#db2777" stroke="#9f1239" stroke-width="1.2"/>
  <polygon points="20,23 14,18 19,25" fill="#f472b6"/>
  <circle cx="12" cy="19" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>
  <polygon points="42,23 53,17 44,27" fill="#db2777" stroke="#9f1239" stroke-width="1.2"/>
  <polygon points="44,23 50,18 45,25" fill="#f472b6"/>
  <circle cx="52" cy="19" r="1.3" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>

  <!-- 頭部輪郭（ふっくら立体球・おでこハイライト） -->
  <circle cx="32" cy="24" r="11.5" fill="#db2777" stroke="#9f1239" stroke-width="1.6"/>
  <!-- おでこと頬のツヤハイライト（スライム基準） -->
  <ellipse cx="32" cy="17" rx="5.5" ry="2.2" fill="#ffffff" opacity="0.6"/>
  <ellipse cx="25" cy="25" rx="2" ry="1" fill="#fda4af" opacity="0.7"/>
  <ellipse cx="39" cy="25" rx="2" ry="1" fill="#fda4af" opacity="0.7"/>

  <!-- 漆黒の湾曲悪魔角（赤光ハイライト） -->
  <path d="M25 16 Q18 3 13 -1 Q22 5 27 12 Z" fill="#18181b" stroke="#09090b" stroke-width="1.3"/>
  <path d="M22 7 Q24 9 26 12" stroke="#f43f5e" stroke-width="1.2" fill="none"/>
  <path d="M39 16 Q46 3 51 -1 Q42 5 37 12 Z" fill="#18181b" stroke="#09090b" stroke-width="1.3"/>
  <path d="M42 7 Q40 9 38 12" stroke="#f43f5e" stroke-width="1.2" fill="none"/>

  <!-- ギラつく黄色い悪魔猫目（スライム基準の多層生きた瞳光・2点白ハイライト） -->
  <!-- 左目 -->
  <polygon points="23,19 30,22 25,27" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
  <polygon points="23.5,19.5 29.5,22 25.5,26" fill="#fef08a"/>
  <line x1="26.5" y1="20.5" x2="26.5" y2="25" stroke="#000000" stroke-width="1.5"/>
  <circle cx="26" cy="21" r="0.9" fill="#ffffff"/>
  <circle cx="27.5" cy="24" r="0.4" fill="#ffffff" opacity="0.85"/>

  <!-- 右目 -->
  <polygon points="41,19 34,22 39,27" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
  <polygon points="40.5,19.5 34.5,22 38.5,26" fill="#fef08a"/>
  <line x1="37.5" y1="20.5" x2="37.5" y2="25" stroke="#000000" stroke-width="1.5"/>
  <circle cx="37" cy="21" r="0.9" fill="#ffffff"/>
  <circle cx="38.5" cy="24" r="0.4" fill="#ffffff" opacity="0.85"/>

  <!-- ニヤリと笑う三日月口と八重歯 -->
  <path d="M26 28 Q32 34 38 28 Z" fill="#18181b"/>
  <polygon points="27.5,28 29,32 30.5,28" fill="#ffffff"/>
  <polygon points="33.5,28 35,32 36.5,28" fill="#ffffff"/>

  <!-- 右手: 魔界の三叉槍（ピッチフォーク & 立ち上る炎） -->
  <line x1="48" y1="11" x2="48" y2="52" stroke="#52525b" stroke-width="2.6" stroke-linecap="round"/>
  <!-- 赤熱穂先 -->
  <polygon points="48,11 46,2 50,2" fill="#ef4444" stroke="#991b1b" stroke-width="0.8"/>
  <polygon points="43,13 40,6 44,6" fill="#f97316" stroke="#991b1b" stroke-width="0.8"/>
  <polygon points="53,13 56,6 52,6" fill="#f97316" stroke="#991b1b" stroke-width="0.8"/>
  <line x1="41" y1="12" x2="55" y2="12" stroke="#52525b" stroke-width="2.2"/>
  <!-- 立ち上る炎の粉 -->
  <circle cx="48" cy="1" r="1.6" fill="#fef08a"/>
  <circle cx="48" cy="1" r="0.8" fill="#ffffff"/>
  <circle cx="43" cy="4" r="1.2" fill="#ef4444"/>
</svg>`.trim();

  /** 小悪魔インプ (IMP) - 背面（上向き） */
  public static readonly IMP_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 翼背面 -->
  <path d="M25 27 Q8 12 2 24 Q10 33 18 31 Q20 37 25 31 Z" fill="#2e022d" stroke="#180117" stroke-width="1.5"/>
  <path d="M39 27 Q56 12 62 24 Q54 33 46 31 Q44 37 39 31 Z" fill="#2e022d" stroke="#180117" stroke-width="1.5"/>
  <!-- 尾 -->
  <path d="M30 46 Q24 54 18 50 Q14 44 14 38" stroke="#be185d" stroke-width="2.5" fill="none"/>
  <polygon points="14,35 10,40 18,40" fill="#f43f5e"/>
  <!-- 胴体と頭部 -->
  <rect x="25" y="34" width="14" height="15" rx="4" fill="#be185d"/>
  <circle cx="32" cy="24" r="11" fill="#be185d" stroke="#9f1239" stroke-width="1.5"/>
  <!-- 角背面 -->
  <path d="M25 16 Q18 4 14 0 Q22 6 27 13 Z" fill="#18181b"/>
  <path d="M39 16 Q46 4 50 0 Q42 6 37 13 Z" fill="#18181b"/>
  <!-- 槍背面 -->
  <line x1="47" y1="12" x2="47" y2="52" stroke="#52525b" stroke-width="2.5"/>
</svg>`.trim();

  /** 古代のミイラ (MUMMY) - 正面（ファラオ黄金額飾り、幾重の立体包帯レイヤー、爛々と光る古代黄金呪眼、スカラベ護符、たなびく呪符包帯、黒褐色の鋭爪） */
  public static readonly MUMMY_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="19" ry="5.2" fill="rgba(0,0,0,0.42)"/>

  <!-- 宙にたなびく解けた呪文包帯の端（美しい曲線・立体陰影） -->
  <path d="M44 42 Q57 46 53 56 Q48 62 43 58" stroke="#e4e4e7" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M45 43 Q56 47 52 56" stroke="#ffffff" stroke-width="1" fill="none"/>
  <path d="M18 38 Q7 44 11 53" stroke="#d4d4d8" stroke-width="2.4" fill="none" stroke-linecap="round"/>

  <!-- 全身包帯巻きの胴体（多重交差レイヤー＆立体陰影） -->
  <path d="M20 27 L15 52 L49 52 L44 27 Z" fill="#d4d4d8" stroke="#71717a" stroke-width="1.8"/>
  <path d="M17 33 Q32 29 47 34" stroke="#a1a1aa" stroke-width="2.4" fill="none"/>
  <path d="M18 32 Q32 28 46 33" stroke="#ffffff" stroke-width="1" fill="none" opacity="0.8"/>
  <path d="M16 40 Q32 44 48 38" stroke="#71717a" stroke-width="2.5" fill="none"/>
  <path d="M16 46 Q32 42 48 47" stroke="#a1a1aa" stroke-width="2.4" fill="none"/>

  <!-- 胸元の黄金とターコイズの古代スカラベ護符（アミュレット・多層発光） -->
  <polygon points="32,31 37,36 32,42 27,36" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
  <circle cx="32" cy="36" r="2.5" fill="#06b6d4" stroke="#0891b2" stroke-width="0.6"/>
  <circle cx="32" cy="36" r="1.2" fill="#a5f3fc"/>
  <circle cx="31.6" cy="35.5" r="0.5" fill="#ffffff"/>

  <!-- 両手（包帯の隙間から覗く干からびた黒褐色の手と呪いの鉤爪） -->
  <!-- 左手 -->
  <path d="M18 31 L10 37 L13 41 L20 35 Z" fill="#3f3f46" stroke="#18181b" stroke-width="1.2"/>
  <polygon points="9,36 6,38 9,40" fill="#18181b"/>
  <!-- 右手 -->
  <path d="M44 31 L52 37 L49 41 L42 35 Z" fill="#3f3f46" stroke="#18181b" stroke-width="1.2"/>
  <polygon points="53,36 56,38 53,40" fill="#18181b"/>

  <!-- 両足包帯巻き（立体筋） -->
  <rect x="22" y="49" width="7" height="10" fill="#d4d4d8" stroke="#71717a" stroke-width="1.2"/>
  <line x1="22" y1="53" x2="29" y2="54" stroke="#71717a" stroke-width="1.4"/>
  <line x1="22" y1="57" x2="29" y2="58" stroke="#71717a" stroke-width="1.4"/>
  <rect x="33" y="49" width="7" height="10" fill="#d4d4d8" stroke="#71717a" stroke-width="1.2"/>
  <line x1="33" y1="53" x2="40" y2="52" stroke="#71717a" stroke-width="1.4"/>
  <line x1="33" y1="57" x2="40" y2="56" stroke="#71717a" stroke-width="1.4"/>

  <!-- 頭部（幾重にも巻かれた包帯球体・光沢） -->
  <ellipse cx="32" cy="19" rx="12.5" ry="13" fill="#e4e4e7" stroke="#71717a" stroke-width="1.8"/>
  <ellipse cx="32" cy="13" rx="7" ry="3" fill="#ffffff" opacity="0.6"/>
  <path d="M21 15 Q32 18 43 14" stroke="#a1a1aa" stroke-width="2.2" fill="none"/>
  <path d="M20 24 Q32 21 44 25" stroke="#71717a" stroke-width="2.4" fill="none"/>

  <!-- 古代ファラオ額飾り（金とラピスラズリのネメス・ウラエウスコブラ） -->
  <path d="M18 11 Q32 7 46 11 L44 16 Q32 11 20 16 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.2"/>
  <line x1="26" y1="9" x2="25" y2="15" stroke="#1d4ed8" stroke-width="2.2"/>
  <line x1="38" y1="9" x2="39" y2="15" stroke="#1d4ed8" stroke-width="2.2"/>
  <!-- コブラ聖蛇の額飾りエンブレム -->
  <polygon points="32,6 34.5,12 32,14 29.5,12" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
  <circle cx="32" cy="9.5" r="1.3" fill="#dc2626"/>

  <!-- 包帯の隙間の漆黒の深淵 -->
  <path d="M21 17 Q32 15 43 17 Q32 23 21 17 Z" fill="#09090b"/>

  <!-- 爛々と黄金に発光する古代の呪眼（スライム基準の多層生きた瞳光・2点白ハイライト） -->
  <!-- 左呪眼 -->
  <ellipse cx="26.5" cy="19" rx="3.5" ry="3.8" fill="#ca8a04"/>
  <circle cx="26.5" cy="19" r="2.5" fill="#facc15"/>
  <circle cx="26.5" cy="19" r="1.4" fill="#ffffff"/>
  <circle cx="27.5" cy="20.2" r="0.6" fill="#ffffff" opacity="0.9"/>
  <!-- 右呪眼 -->
  <ellipse cx="37.5" cy="19" rx="3.5" ry="3.8" fill="#ca8a04"/>
  <circle cx="37.5" cy="19" r="2.5" fill="#facc15"/>
  <circle cx="37.5" cy="19" r="1.4" fill="#ffffff"/>
  <circle cx="38.5" cy="20.2" r="0.6" fill="#ffffff" opacity="0.9"/>

  <!-- 漏れ出る呪詛の紫光粒子 -->
  <circle cx="23" cy="17.5" r="1" fill="#c084fc"/>
  <circle cx="41" cy="17.5" r="1" fill="#c084fc"/>
  <circle cx="32" cy="24" r="0.8" fill="#c084fc"/>
</svg>`.trim();

  /** 古代のミイラ (MUMMY) - 背面（上向き） */
  public static readonly MUMMY_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.4)"/>
  <!-- たなびく包帯 -->
  <path d="M44 42 Q56 46 52 56" stroke="#d4d4d8" stroke-width="2.5" fill="none"/>
  <!-- 胴体背面 -->
  <path d="M20 28 L16 52 L48 52 L44 28 Z" fill="#d4d4d8" stroke="#71717a" stroke-width="1.8"/>
  <line x1="18" y1="36" x2="46" y2="44" stroke="#71717a" stroke-width="2"/>
  <line x1="18" y1="44" x2="46" y2="36" stroke="#71717a" stroke-width="2"/>
  <!-- 頭部背面とファラオ垂れ布 -->
  <ellipse cx="32" cy="20" rx="12" ry="12.5" fill="#d4d4d8" stroke="#71717a" stroke-width="1.8"/>
  <path d="M20 12 Q32 8 44 12 L46 22 L40 22 L38 14 L26 14 L24 22 L18 22 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1"/>
  <!-- 脚 -->
  <rect x="22" y="50" width="7" height="9" fill="#a1a1aa"/>
  <rect x="33" y="50" width="7" height="9" fill="#a1a1aa"/>
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

  // =========================================================================
  // 11. ショップ・商人・番犬・ゴールド通貨スプライト
  // =========================================================================

  /** 店主・商人ネロ（平時: 豊かな髭、商人帽、革エプロン、ゴールドコイン袋） */
  public static readonly MERCHANT_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 両足・革ブーツ -->
  <rect x="23" y="47" width="8" height="9" rx="2.5" fill="#78350f" stroke="#451a03" stroke-width="1.2"/>
  <rect x="33" y="47" width="8" height="9" rx="2.5" fill="#78350f" stroke="#451a03" stroke-width="1.2"/>
  <!-- 胴体ローブ・上着 -->
  <path d="M19 28 L45 28 L47 48 L17 48 Z" fill="#1e3a8a" stroke="#172554" stroke-width="1.5"/>
  <!-- 革のエプロン -->
  <path d="M22 30 L42 30 L40 47 L24 47 Z" fill="#b45309" stroke="#78350f" stroke-width="1.2"/>
  <!-- エプロンのポケットとゴールド刺繍 -->
  <rect x="26" y="38" width="12" height="7" rx="1.5" fill="#92400e" stroke="#d97706" stroke-width="1"/>
  <circle cx="32" cy="41.5" r="2" fill="#fbbf24"/>
  <!-- 右手: ずっしり重い金貨袋 -->
  <path d="M46 36 Q49 32 52 35 Q55 38 54 44 Q52 48 47 47 Q44 45 44 40 Z" fill="#ca8a04" stroke="#854d0e" stroke-width="1.2"/>
  <polygon points="48,34 51,32 50,35" fill="#eab308"/>
  <line x1="47" y1="36" x2="52" y2="36" stroke="#713f12" stroke-width="1.5"/>
  <text x="49" y="44" font-size="7" font-weight="bold" fill="#713f12" text-anchor="middle">G</text>
  <!-- 左手: 招き手 -->
  <circle cx="17" cy="38" r="3.5" fill="#fed7aa" stroke="#c2410c" stroke-width="1"/>
  <!-- 商人の豊かな白髭 -->
  <path d="M22 25 Q32 37 42 25 Q38 34 32 36 Q26 34 22 25 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- 顔・肌 -->
  <circle cx="32" cy="22" r="9" fill="#fed7aa" stroke="#c2410c" stroke-width="1.2"/>
  <!-- 穏やかな目（笑顔） -->
  <path d="M27 21 Q29 19 31 21" stroke="#7c2d12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M33 21 Q35 19 37 21" stroke="#7c2d12" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- 赤ら顔の鼻と頬 -->
  <ellipse cx="32" cy="23.5" rx="2" ry="1.5" fill="#f97316"/>
  <circle cx="25" cy="23" r="1.5" fill="#fb7185" opacity="0.6"/>
  <circle cx="39" cy="23" r="1.5" fill="#fb7185" opacity="0.6"/>
  <!-- 商人帽（緑のベレー帽と黄金の羽飾り） -->
  <ellipse cx="32" cy="15" rx="13" ry="5.5" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
  <ellipse cx="32" cy="13" rx="10" ry="4" fill="#16a34a"/>
  <!-- 黄金の羽飾り -->
  <path d="M38 14 Q46 6 48 3 Q43 9 40 13 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>
</svg>`.trim();

  /** 店主・商人ネロ（背面・上向き） */
  public static readonly MERCHANT_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="23" y="47" width="8" height="9" rx="2.5" fill="#78350f" stroke="#451a03" stroke-width="1.2"/>
  <rect x="33" y="47" width="8" height="9" rx="2.5" fill="#78350f" stroke="#451a03" stroke-width="1.2"/>
  <path d="M19 28 L45 28 L47 48 L17 48 Z" fill="#1e3a8a" stroke="#172554" stroke-width="1.5"/>
  <circle cx="32" cy="22" r="9" fill="#fed7aa" stroke="#c2410c" stroke-width="1.2"/>
  <ellipse cx="32" cy="15" rx="13" ry="5.5" fill="#15803d" stroke="#14532d" stroke-width="1.5"/>
  <ellipse cx="32" cy="13" rx="10" ry="4" fill="#16a34a"/>
  <path d="M38 14 Q46 6 48 3 Q43 9 40 13 Z" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>
</svg>`.trim();

  /** 店主・商人ネロ（側面・横向きエイリアス） */
  public static readonly MERCHANT_SIDE_SVG = MonsterAndItemSprites.MERCHANT_DOWN_SVG;
  /** 店主・商人ネロ（斜め手前エイリアス） */
  public static readonly MERCHANT_DIAG_DOWN_SVG = MonsterAndItemSprites.MERCHANT_DOWN_SVG;
  /** 店主・商人ネロ（斜め奥エイリアス） */
  public static readonly MERCHANT_DIAG_UP_SVG = MonsterAndItemSprites.MERCHANT_UP_SVG;

  /** 怒れる店主（泥棒追撃時: 逆立つ怒髪、紅蓮の炎オーラ、血走る赤眼、黄金の棍棒） */
  public static readonly ANGRY_MERCHANT_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 紅蓮の怒気炎オーラ -->
  <path d="M10 50 Q4 32 18 20 Q24 6 32 2 Q40 6 46 20 Q60 32 54 50 Q40 62 32 60 Q24 62 10 50 Z" fill="#ef4444" opacity="0.35"/>
  <path d="M14 48 Q10 34 20 24 Q26 10 32 8 Q38 10 44 24 Q54 34 50 48 Z" fill="#f97316" opacity="0.45"/>
  <!-- 接地影 -->
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.5)"/>
  <!-- 両足 -->
  <rect x="22" y="46" width="9" height="10" rx="2.5" fill="#450a0a" stroke="#180202" stroke-width="1.5"/>
  <rect x="33" y="46" width="9" height="10" rx="2.5" fill="#450a0a" stroke="#180202" stroke-width="1.5"/>
  <!-- 胴体・紅蓮の戦闘服 -->
  <path d="M18 28 L46 28 L48 48 L16 48 Z" fill="#991b1b" stroke="#450a0a" stroke-width="1.8"/>
  <!-- 右手: 振り上げた巨大な黄金棍棒 -->
  <g transform="rotate(-30 48 20)">
    <line x1="48" y1="2" x2="48" y2="34" stroke="#ca8a04" stroke-width="5" stroke-linecap="round"/>
    <circle cx="48" cy="4" r="5" fill="#eab308" stroke="#ca8a04" stroke-width="1.5"/>
    <circle cx="45" cy="4" r="1.5" fill="#ffffff"/>
    <polygon points="44,8 52,8 50,14 46,14" fill="#fbbf24"/>
  </g>
  <!-- 左手: 怒りの拳 -->
  <ellipse cx="15" cy="36" rx="4" ry="4" fill="#fca5a5" stroke="#991b1b" stroke-width="1.5"/>
  <!-- 逆立つ白髭と怒りの口 -->
  <path d="M20 24 Q32 38 44 24 Q40 37 32 40 Q24 37 20 24 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
  <path d="M26 30 Q32 36 38 30 Z" fill="#450a0a"/>
  <polygon points="28,30 30,33 32,30 34,33 36,30" fill="#ffffff"/>
  <!-- 顔・怒りで充血 -->
  <circle cx="32" cy="20" r="9.5" fill="#fca5a5" stroke="#991b1b" stroke-width="1.5"/>
  <!-- 怒りの青筋マーク -->
  <path d="M37 14 L41 18 M41 14 L37 18" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
  <!-- ギラつく血走った赤眼 -->
  <ellipse cx="27" cy="19" rx="3.5" ry="3" fill="#ffffff" stroke="#991b1b" stroke-width="1"/>
  <circle cx="28" cy="19" r="1.8" fill="#dc2626"/>
  <circle cx="28.5" cy="18.5" r="0.6" fill="#ffffff"/>
  <ellipse cx="37" cy="19" rx="3.5" ry="3" fill="#ffffff" stroke="#991b1b" stroke-width="1"/>
  <circle cx="36" cy="19" r="1.8" fill="#dc2626"/>
  <circle cx="36.5" cy="18.5" r="0.6" fill="#ffffff"/>
  <!-- 逆立つ怒髪 -->
  <path d="M22 13 L26 4 L30 11 L34 2 L38 11 L42 5 L42 14 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
</svg>`.trim();

  /** 番犬・警備犬 (GUARD_DOG: 俊敏なドーベルマン、トゲ付き真鍮首輪、牙、跳躍ポーズ) */
  public static readonly GUARD_DOG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 4本のしなやかな脚 -->
  <rect x="20" y="45" width="5" height="12" rx="2" fill="#292524" stroke="#1c1917" stroke-width="1.2"/>
  <rect x="39" y="45" width="5" height="12" rx="2" fill="#292524" stroke="#1c1917" stroke-width="1.2"/>
  <rect x="25" y="44" width="4.5" height="11" rx="2" fill="#44403c" stroke="#1c1917" stroke-width="1"/>
  <rect x="34" y="44" width="4.5" height="11" rx="2" fill="#44403c" stroke="#1c1917" stroke-width="1"/>
  <!-- 胴体（引き締まった黒褐色ボディ） -->
  <ellipse cx="32" cy="40" rx="12" ry="9" fill="#292524" stroke="#1c1917" stroke-width="1.5"/>
  <!-- 胸のタンマーク（茶褐色の毛並み） -->
  <path d="M26 36 Q32 44 38 36 Q36 45 32 46 Q28 45 26 36 Z" fill="#b45309"/>
  <!-- 立ち尾 -->
  <path d="M42 36 Q49 32 50 24" stroke="#292524" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <!-- トゲ付き真鍮首輪 -->
  <rect x="25" y="27" width="14" height="4" rx="1.5" fill="#ca8a04" stroke="#713f12" stroke-width="1"/>
  <polygon points="26,27 25,24 28,27" fill="#ffffff"/>
  <polygon points="31,27 32,23 33,27" fill="#ffffff"/>
  <polygon points="37,27 39,24 38,27" fill="#ffffff"/>
  <!-- 頭部（鋭いマズルと尖耳） -->
  <path d="M24 24 L21 11 L28 18 L36 18 L43 11 L40 24 Z" fill="#292524" stroke="#1c1917" stroke-width="1.5"/>
  <!-- 顔・マズル -->
  <ellipse cx="32" cy="24" rx="6" ry="5.5" fill="#b45309"/>
  <!-- 鼻 -->
  <polygon points="30,22 34,22 32,25" fill="#0c0a09"/>
  <!-- 鋭い赤く光る眼光 -->
  <ellipse cx="28" cy="18" rx="2.2" ry="2.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.8"/>
  <circle cx="28.5" cy="17.5" r="0.7" fill="#ffffff"/>
  <ellipse cx="36" cy="18" rx="2.2" ry="2.5" fill="#ef4444" stroke="#7f1d1d" stroke-width="0.8"/>
  <circle cx="36.5" cy="17.5" r="0.7" fill="#ffffff"/>
  <!-- 唸る牙 -->
  <path d="M28 27 Q32 29 36 27" stroke="#1c1917" stroke-width="1.2" fill="none"/>
  <polygon points="29,27 30,29 31,27" fill="#ffffff"/>
  <polygon points="33,27 34,29 35,27" fill="#ffffff"/>
</svg>`.trim();

  /** ゴールド通貨・金貨の山 (ITEM_GOLD_PILE: キラキラ輝くゴールドコインの山) */
  public static readonly ITEM_GOLD_PILE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="56" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <!-- コインの山（最下段） -->
  <ellipse cx="24" cy="51" rx="8" ry="4" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>
  <ellipse cx="24" cy="49" rx="7.5" ry="3.5" fill="#eab308"/>
  <ellipse cx="40" cy="51" rx="8" ry="4" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>
  <ellipse cx="40" cy="49" rx="7.5" ry="3.5" fill="#eab308"/>
  <ellipse cx="32" cy="52" rx="9" ry="4.5" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>
  <ellipse cx="32" cy="50" rx="8.5" ry="4" fill="#fbbf24"/>
  <!-- コインの山（中段） -->
  <ellipse cx="26" cy="44" rx="8" ry="4" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>
  <ellipse cx="26" cy="42" rx="7.5" ry="3.5" fill="#fde047"/>
  <text x="26" y="44" font-size="5" font-weight="bold" fill="#854d0e" text-anchor="middle">G</text>
  <ellipse cx="38" cy="44" rx="8" ry="4" fill="#ca8a04" stroke="#854d0e" stroke-width="1"/>
  <ellipse cx="38" cy="42" rx="7.5" ry="3.5" fill="#fde047"/>
  <text x="38" y="44" font-size="5" font-weight="bold" fill="#854d0e" text-anchor="middle">G</text>
  <!-- 頂上の大金貨 -->
  <ellipse cx="32" cy="35" rx="9" ry="4.5" fill="#ca8a04" stroke="#854d0e" stroke-width="1.2"/>
  <ellipse cx="32" cy="33" rx="8.5" ry="4" fill="#fef08a"/>
  <text x="32" y="35" font-size="6" font-weight="bold" fill="#a16207" text-anchor="middle">★</text>
  <!-- キラリと光る星スパークル -->
  <polygon points="44,25 46,28 49,29 46,30 44,33 43,30 40,29 43,28" fill="#ffffff"/>
  <polygon points="18,33 19,35 21,36 19,37 18,39 17,37 15,36 17,35" fill="#fef08a"/>
  <polygon points="32,20 33,22 35,23 33,24 32,26 31,24 29,23 31,22" fill="#ffffff"/>
</svg>`.trim();

  // =========================================================================
  // 7. レアキャラ4種（冒険者レオン、賭博仙人ガンジ、妖精ピクシー、鍛冶職人バルカン）
  // =========================================================================

  /** さすらいの冒険者レオン (物々交換の旅人: 緑の羽帽子・青マント・バックパック・親しみやすい笑顔) */
  public static readonly WANDERING_ADVENTURER_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 巨大バックパック（背後） -->
  <rect x="18" y="22" width="28" height="24" rx="4" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="20" y="24" width="24" height="6" fill="#92400e"/>
  <line x1="24" y1="30" x2="24" y2="44" stroke="#451a03" stroke-width="1.2"/>
  <line x1="40" y1="30" x2="40" y2="44" stroke="#451a03" stroke-width="1.2"/>
  <!-- 丸めた寝袋（バックパック上） -->
  <rect x="20" y="17" width="24" height="6" rx="3" fill="#15803d" stroke="#14532d" stroke-width="1.2"/>
  <!-- 青いマント -->
  <path d="M22 26 L16 52 L26 50 L32 52 L38 50 L48 52 L42 26 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5"/>
  <!-- 体（旅人の服・革ベルト） -->
  <ellipse cx="32" cy="38" rx="9" ry="11" fill="#3b82f6"/>
  <rect x="26" y="36" width="12" height="4" fill="#854d0e"/>
  <circle cx="32" cy="38" r="2" fill="#fbbf24"/>
  <!-- 足・ブーツ -->
  <rect x="25" y="48" width="5" height="9" rx="2" fill="#78350f"/>
  <rect x="34" y="48" width="5" height="9" rx="2" fill="#78350f"/>
  <!-- 頭部・顔 -->
  <ellipse cx="32" cy="22" rx="7.5" ry="7" fill="#fde047"/>
  <ellipse cx="32" cy="22" rx="7" ry="6.5" fill="#fed7aa"/>
  <!-- 茶髪 -->
  <path d="M25 19 Q32 15 39 19 Q36 24 25 19 Z" fill="#78350f"/>
  <!-- 冒険者の羽帽子 -->
  <ellipse cx="32" cy="16" rx="10" ry="3.5" fill="#16a34a" stroke="#15803d" stroke-width="1"/>
  <path d="M25 15 Q32 9 39 15 Z" fill="#15803d"/>
  <!-- 帽子に差した白い羽根 -->
  <path d="M37 14 Q44 6 46 4 Q43 11 39 15 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
  <!-- 瞳・笑顔 -->
  <ellipse cx="29" cy="21" rx="1" ry="1.2" fill="#1e293b"/>
  <ellipse cx="35" cy="21" rx="1" ry="1.2" fill="#1e293b"/>
  <path d="M30 25 Q32 27 34 25" stroke="#9a3412" stroke-width="1" fill="none"/>
  <!-- 手を振るポーズ -->
  <circle cx="19" cy="35" r="3" fill="#fed7aa"/>
  <circle cx="45" cy="35" r="3" fill="#fed7aa"/>
</svg>`.trim();

  /** 賭博仙人ガンジ (じゃんけん勝負の老人: 長い白髭・紫道着・サイコロ・金の扇子) */
  public static readonly GAMBLER_SAGE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 紫の道着（広がる裾） -->
  <path d="M22 30 L14 54 L50 54 L42 30 Z" fill="#6b21a8" stroke="#3b0764" stroke-width="1.5"/>
  <path d="M27 30 L32 46 L37 30 Z" fill="#a855f7"/>
  <rect x="24" y="44" width="16" height="4" fill="#fbbf24"/>
  <!-- 仙人の頭部 -->
  <ellipse cx="32" cy="20" rx="8" ry="7" fill="#fed7aa"/>
  <!-- 白い長眉 -->
  <path d="M25 16 Q28 13 30 17" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M39 16 Q36 13 34 17" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- 細めた笑い目 -->
  <path d="M27 19 Q29 21 31 19" stroke="#1e293b" stroke-width="1.2" fill="none"/>
  <path d="M33 19 Q35 21 37 19" stroke="#1e293b" stroke-width="1.2" fill="none"/>
  <!-- 頭頂の白髪お団子・かんざし -->
  <circle cx="32" cy="11" r="4.5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <line x1="26" y1="10" x2="38" y2="12" stroke="#d97706" stroke-width="1.8" stroke-linecap="round"/>
  <!-- 胸まで伸びる立派な長い白髭 -->
  <path d="M27 24 Q32 42 32 45 Q32 42 37 24 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- 左手: 赤いサイコロ（ダイス）を宙に浮かす -->
  <rect x="13" y="32" width="9" height="9" rx="1.5" fill="#dc2626" stroke="#991b1b" stroke-width="1" transform="rotate(12 17 36)"/>
  <circle cx="17.5" cy="36.5" r="1.5" fill="#ffffff"/>
  <!-- 右手: 金の扇子 -->
  <path d="M42 36 L52 26 Q56 34 50 42 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1.2"/>
  <line x1="42" y1="36" x2="52" y2="28" stroke="#b45309" stroke-width="0.8"/>
  <line x1="42" y1="36" x2="52" y2="34" stroke="#b45309" stroke-width="0.8"/>
  <line x1="42" y1="36" x2="50" y2="40" stroke="#b45309" stroke-width="0.8"/>
</svg>`.trim();

  /** 慈愛の妖精ピクシー (敵なのに回復してくれる: 透明な羽・ハートステッキ・キラキラ星粉) */
  public static readonly HEALING_FAIRY_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地浮遊影（ふわふわ浮遊） -->
  <ellipse cx="32" cy="58" rx="11" ry="3" fill="rgba(16,185,129,0.25)"/>
  <!-- 背中の透明な妖精の羽（4枚） -->
  <path d="M30 28 Q10 10 12 24 Q14 36 30 32 Z" fill="rgba(110,231,183,0.65)" stroke="#34d399" stroke-width="1.2"/>
  <path d="M30 32 Q14 36 18 46 Q24 48 30 36 Z" fill="rgba(167,243,208,0.55)" stroke="#34d399" stroke-width="1"/>
  <path d="M34 28 Q54 10 52 24 Q50 36 34 32 Z" fill="rgba(110,231,183,0.65)" stroke="#34d399" stroke-width="1.2"/>
  <path d="M34 32 Q50 36 46 46 Q40 48 34 36 Z" fill="rgba(167,243,208,0.55)" stroke="#34d399" stroke-width="1"/>
  <!-- エメラルドのワンピース -->
  <path d="M26 30 L22 47 Q32 50 42 47 L38 30 Z" fill="#10b981" stroke="#047857" stroke-width="1.2"/>
  <path d="M25 43 Q32 46 39 43" stroke="#a7f3d0" stroke-width="1.5" fill="none"/>
  <!-- 小さな足 -->
  <circle cx="28" cy="49" r="2" fill="#fed7aa"/>
  <circle cx="36" cy="49" r="2" fill="#fed7aa"/>
  <!-- 顔・ピンク髪 -->
  <ellipse cx="32" cy="22" rx="7" ry="6.5" fill="#fed7aa"/>
  <path d="M24 20 Q32 12 40 20 Q42 28 40 30 Q38 23 32 23 Q26 23 24 30 Z" fill="#f43f5e"/>
  <!-- 金のティアラ -->
  <polygon points="28,14 30,17 32,13 34,17 36,14 35,18 29,18" fill="#fbbf24" stroke="#d97706" stroke-width="0.8"/>
  <!-- きらめく瞳・微笑み -->
  <ellipse cx="29" cy="21" rx="1.5" ry="2" fill="#047857"/>
  <circle cx="29.5" cy="20.5" r="0.6" fill="#ffffff"/>
  <ellipse cx="35" cy="21" rx="1.5" ry="2" fill="#047857"/>
  <circle cx="35.5" cy="20.5" r="0.6" fill="#ffffff"/>
  <ellipse cx="27" cy="24" rx="1.5" ry="0.8" fill="#fda4af" opacity="0.8"/>
  <ellipse cx="37" cy="24" rx="1.5" ry="0.8" fill="#fda4af" opacity="0.8"/>
  <path d="M30.5 25 Q32 26.5 33.5 25" stroke="#e11d48" stroke-width="1" fill="none"/>
  <!-- 右手: ハートの回復ステッキ -->
  <line x1="40" y1="32" x2="48" y2="20" stroke="#f59e0b" stroke-width="1.5"/>
  <path d="M47 18 Q45 15 48 13 Q51 15 49 18 L48 20 Z" fill="#ec4899"/>
  <!-- 周囲の回復キラキラ星 -->
  <polygon points="16,16 17,18 19,19 17,20 16,22 15,20 13,19 15,18" fill="#34d399"/>
  <polygon points="48,38 49,40 51,41 49,42 48,44 47,42 45,41 47,40" fill="#fef08a"/>
</svg>`.trim();

  /** さすらいの鍛冶職人バルカン (武具無料鍛錬: 赤髭ドワーフ・革エプロン・大金槌) */
  public static readonly TRAVELING_BLACKSMITH_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- がっしりした体格 -->
  <rect x="20" y="28" width="24" height="24" rx="3" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <!-- 革の鍛冶エプロン -->
  <path d="M25 28 L23 52 L41 52 L39 28 Z" fill="#92400e" stroke="#78350f" stroke-width="1.2"/>
  <line x1="25" y1="28" x2="29" y2="22" stroke="#78350f" stroke-width="2"/>
  <line x1="39" y1="28" x2="35" y2="22" stroke="#78350f" stroke-width="2"/>
  <rect x="23" y="40" width="18" height="4" fill="#451a03"/>
  <rect x="30" y="39" width="4" height="6" fill="#fbbf24"/>
  <!-- がっしりした鉄靴 -->
  <rect x="21" y="52" width="9" height="6" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1"/>
  <rect x="34" y="52" width="9" height="6" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1"/>
  <!-- 頭部・豪快な赤髭 -->
  <circle cx="32" cy="18" r="8" fill="#fed7aa"/>
  <path d="M22 17 Q32 36 32 39 Q32 36 42 17 Z" fill="#b91c1c" stroke="#991b1b" stroke-width="1.5"/>
  <!-- 頑固そうな目元・太眉 -->
  <path d="M25 14 L30 16" stroke="#991b1b" stroke-width="2" stroke-linecap="round"/>
  <path d="M39 14 L34 16" stroke="#991b1b" stroke-width="2" stroke-linecap="round"/>
  <circle cx="28" cy="17" r="1.3" fill="#1e293b"/>
  <circle cx="36" cy="17" r="1.3" fill="#1e293b"/>
  <!-- バンダナ（頭頂） -->
  <path d="M24 13 Q32 8 40 13 L39 16 Q32 12 25 16 Z" fill="#ea580c"/>
  <!-- 巨大な鍛冶金槌（右手に担ぐ） -->
  <line x1="44" y1="44" x2="56" y2="16" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
  <!-- 金槌の鉄頭 -->
  <rect x="49" y="14" width="14" height="8" rx="2" fill="#64748b" stroke="#334155" stroke-width="1.5" transform="rotate(-25 56 18)"/>
  <circle cx="43" cy="38" r="3.5" fill="#fed7aa"/>
  <circle cx="21" cy="38" r="3.5" fill="#fed7aa"/>
</svg>`.trim();

  /** 合成の壺 (POT_OF_SYNTHESIS: 蒼碧の神秘陶器・金装飾の口縁・回転する錬成魔導ルーン) */
  public static readonly ITEM_POT_SYNTHESIS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <!-- 壺の台座 -->
  <ellipse cx="32" cy="54" rx="12" ry="3.5" fill="#0e7490" stroke="#155e75" stroke-width="1.5"/>
  <!-- 壺の膨らみ本体 -->
  <path d="M14 36 Q12 48 20 54 Q32 58 44 54 Q52 48 50 36 Q48 26 38 22 L26 22 Q16 26 14 36 Z" fill="#06b6d4" stroke="#0891b2" stroke-width="2"/>
  <!-- 壺のハイライト・陶器の艶 -->
  <path d="M18 32 Q16 42 22 48" stroke="#a5f3fc" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- 壺の金装飾帯 -->
  <path d="M16 38 Q32 44 48 38" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
  <circle cx="32" cy="41" r="3" fill="#f59e0b" stroke="#78350f" stroke-width="1"/>
  <!-- 壺の首部 -->
  <rect x="24" y="16" width="16" height="8" fill="#0891b2" stroke="#155e75" stroke-width="1.5"/>
  <!-- 金装飾の口縁 -->
  <ellipse cx="32" cy="16" rx="11" ry="3.5" fill="#facc15" stroke="#b45309" stroke-width="1.5"/>
  <ellipse cx="32" cy="16" rx="8" ry="2" fill="#164e63"/>
  <!-- 錬成の魔導粒子 -->
  <circle cx="20" cy="20" r="1.5" fill="#67e8f9"/>
  <circle cx="44" cy="22" r="2" fill="#fef08a"/>
  <polygon points="32,8 33,11 36,12 33,13 32,16 31,13 28,12 31,11" fill="#38bdf8"/>
</svg>`.trim();

  /** 奈落の魔王アビス・ロード (ABYSS_LORD: 巨大な漆黒の双角、スライム基準の生きた紅蓮邪眼、胸部紅蓮コアジュエル多層発光、立体漆黒甲冑エッジ光、紫黒マント、破滅の大剣) */
  public static readonly ABYSS_LORD_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地大型ドロップシャドウ -->
  <ellipse cx="32" cy="60" rx="24" ry="4.5" fill="rgba(0,0,0,0.55)"/>

  <!-- 背後の巨大な紫黒の魔王マント（多層ドレープ＆陰影） -->
  <path d="M12 24 L5 58 Q32 63 59 58 L52 24 Z" fill="#3b0764" stroke="#1e1b4b" stroke-width="2"/>
  <path d="M16 26 L10 56 Q32 60 54 56 L48 26 Z" fill="#581c87"/>
  <path d="M20 28 L15 54 Q32 57 49 54 L44 28 Z" fill="#7e22ce" opacity="0.35"/>

  <!-- 重厚な魔界甲冑の胴体（多面体エッジハイライト） -->
  <rect x="19" y="23" width="26" height="29" rx="4" fill="#0f172a" stroke="#6b21a8" stroke-width="2"/>
  <rect x="21" y="25" width="22" height="25" rx="3" fill="#1e1b4b"/>
  <!-- 甲冑のエッジハイライト -->
  <line x1="20" y1="24" x2="44" y2="24" stroke="#a855f7" stroke-width="1.2"/>
  <line x1="20" y1="24" x2="20" y2="51" stroke="#a855f7" stroke-width="1.2"/>

  <!-- 胸当ての紅蓮コアジュエル（スライム基準の多層魔力核構造） -->
  <circle cx="32" cy="36" r="8" fill="#991b1b" opacity="0.45"/>
  <polygon points="32,27 39,36 32,45 25,36" fill="#dc2626" stroke="#fbbf24" stroke-width="1.5"/>
  <polygon points="32,29 37,36 32,43 27,36" fill="#ef4444"/>
  <circle cx="32" cy="36" r="3.2" fill="#fef08a"/>
  <circle cx="31.2" cy="35.2" r="1.3" fill="#ffffff"/>

  <!-- 巨大な肩当て（ショルダーアーマー・鋭利なスパイク） -->
  <!-- 左肩 -->
  <polygon points="9,19 22,21 17,34 7,29" fill="#1e1b4b" stroke="#7e22ce" stroke-width="1.8"/>
  <polygon points="9,19 21,21 16,26 8,24" fill="#3b0764"/>
  <line x1="9" y1="20" x2="16" y2="32" stroke="#c084fc" stroke-width="1"/>
  <!-- 右肩 -->
  <polygon points="55,19 42,21 47,34 57,29" fill="#1e1b4b" stroke="#7e22ce" stroke-width="1.8"/>
  <polygon points="55,19 43,21 48,26 56,24" fill="#3b0764"/>
  <line x1="55" y1="20" x2="48" y2="32" stroke="#c084fc" stroke-width="1"/>

  <!-- 兜・頭部（漆黒ヘルメット・エッジ光） -->
  <rect x="23" y="11" width="18" height="15" rx="3.5" fill="#0f172a" stroke="#6b21a8" stroke-width="2"/>
  <line x1="24" y1="12" x2="40" y2="12" stroke="#a855f7" stroke-width="1.4"/>
  <ellipse cx="32" cy="13" rx="5" ry="1.5" fill="#ffffff" opacity="0.5"/>

  <!-- 巨大な漆黒の双角（紫光ハイライト＆鋭角） -->
  <!-- 左角 -->
  <path d="M24 13 Q13 5 9 -1 Q17 7 26 11 Z" fill="#4c1d95" stroke="#1e1b4b" stroke-width="1.5"/>
  <path d="M22 11 Q14 5 11 1 Q16 6 24 10 Z" fill="#9333ea" opacity="0.7"/>
  <!-- 右角 -->
  <path d="M40 13 Q51 5 55 -1 Q47 7 38 11 Z" fill="#4c1d95" stroke="#1e1b4b" stroke-width="1.5"/>
  <path d="M42 11 Q50 5 53 1 Q48 6 40 10 Z" fill="#9333ea" opacity="0.7"/>

  <!-- 兜のスリット・ギラつく生きた紅蓮邪眼（スライム基準の多層瞳・白ハイライト2点） -->
  <line x1="25" y1="18" x2="39" y2="18" stroke="#000000" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="25" y1="18" x2="39" y2="18" stroke="#991b1b" stroke-width="2" stroke-linecap="round"/>
  <!-- 左邪眼 -->
  <circle cx="28" cy="18" r="2.2" fill="#ef4444"/>
  <circle cx="28" cy="18" r="1.3" fill="#fef08a"/>
  <circle cx="27.5" cy="17.3" r="0.6" fill="#ffffff"/>
  <!-- 右邪眼 -->
  <circle cx="36" cy="18" r="2.2" fill="#ef4444"/>
  <circle cx="36" cy="18" r="1.3" fill="#fef08a"/>
  <circle cx="35.5" cy="17.3" r="0.6" fill="#ffffff"/>

  <!-- 漆黒の脚部・鉄甲冑（ハイライト付き） -->
  <rect x="22" y="52" width="8" height="8.5" rx="2" fill="#0f172a" stroke="#6b21a8" stroke-width="1.3"/>
  <rect x="23" y="53" width="6" height="3" fill="#334155"/>
  <rect x="34" y="52" width="8" height="8.5" rx="2" fill="#0f172a" stroke="#6b21a8" stroke-width="1.3"/>
  <rect x="35" y="53" width="6" height="3" fill="#334155"/>

  <!-- 右手: 破滅の魔導大剣（アビス・ブレード・暗黒オーラと稲妻） -->
  <g>
    <!-- 大剣の柄と鍔 -->
    <circle cx="45" cy="37" r="3.2" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
    <rect x="43" y="34" width="10" height="3" rx="1" fill="#78350f" transform="rotate(-40 45 37)"/>
    <!-- 大剣の身（両刃・紫電の輝き） -->
    <line x1="47" y1="35" x2="59" y2="11" stroke="#3b0764" stroke-width="5" stroke-linecap="round"/>
    <line x1="47" y1="35" x2="59" y2="11" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
    <line x1="48" y1="33" x2="58" y2="13" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/>
  </g>

  <!-- 立ち昇る暗黒の瘴気粒子 -->
  <circle cx="16" cy="11" r="1.8" fill="#c084fc" opacity="0.7"/>
  <circle cx="16" cy="11" r="0.8" fill="#ffffff"/>
  <circle cx="48" cy="9" r="1.8" fill="#c084fc" opacity="0.7"/>
  <circle cx="48" cy="9" r="0.8" fill="#ffffff"/>
  <circle cx="32" cy="3" r="2.2" fill="#ef4444" opacity="0.75"/>
  <circle cx="32" cy="3" r="1" fill="#fef08a"/>
</svg>`.trim();

  // =========================================================================
  // 17. スクーターおじさん (SCOOTER_GUY) - 5方向
  // 脈絡なくダンジョンをスクーターで走り抜ける謎のオジサン
  // =========================================================================

  /** スクーターおじさん 正面（下向き: ヘルメット、丸メガネ、ちょび髭、緑ジャンパー、赤い原付スクーター、丸目ライト） */
  public static readonly SCOOTER_GUY_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="60" rx="16" ry="3.5" fill="rgba(0,0,0,0.35)"/>
  <!-- スクーター前輪タイヤ -->
  <ellipse cx="32" cy="55" rx="5" ry="6" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="32" cy="55" rx="2.5" ry="3.5" fill="#94a3b8"/>
  <!-- 赤いフロントフェンダー -->
  <path d="M26 50 Q32 46 38 50 L37 53 Q32 50 27 53 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1"/>
  <!-- 白いレッグシールド -->
  <path d="M22 38 Q32 35 42 38 L40 50 Q32 48 24 50 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- スクーターハンドルバー -->
  <line x1="18" y1="32" x2="46" y2="32" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
  <!-- ハンドルグリップ（黒） -->
  <rect x="16" y="30.5" width="4" height="3" rx="1" fill="#0f172a"/>
  <rect x="44" y="30.5" width="4" height="3" rx="1" fill="#0f172a"/>
  <!-- 丸目ヘッドライト（黄色点灯） -->
  <circle cx="32" cy="35" r="4.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
  <circle cx="32" cy="35" r="2.5" fill="#ffffff" opacity="0.8"/>
  <!-- 左右丸型バックミラー -->
  <circle cx="19" cy="27" r="2.2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>
  <line x1="19" y1="29.2" x2="20" y2="32" stroke="#64748b" stroke-width="1"/>
  <circle cx="45" cy="27" r="2.2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>
  <line x1="45" y1="29.2" x2="44" y2="32" stroke="#64748b" stroke-width="1"/>
  <!-- おじさんの緑ジャンパー胴体 -->
  <rect x="25" y="24" width="14" height="12" rx="3" fill="#15803d" stroke="#166534" stroke-width="1.2"/>
  <!-- ハンドルを握る手袋（軍手） -->
  <circle cx="20" cy="32" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
  <circle cx="44" cy="32" r="2.5" fill="#f8fafc" stroke="#94a3b8" stroke-width="0.8"/>
  <!-- おじさんの顔 -->
  <ellipse cx="32" cy="18" rx="6" ry="6.5" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.8"/>
  <!-- 丸メガネ -->
  <circle cx="29.5" cy="17" r="2.2" fill="none" stroke="#334155" stroke-width="0.9"/>
  <circle cx="34.5" cy="17" r="2.2" fill="none" stroke="#334155" stroke-width="0.9"/>
  <line x1="31.7" y1="17" x2="32.3" y2="17" stroke="#334155" stroke-width="0.8"/>
  <!-- ちょび髭と温和な口 -->
  <rect x="30.5" y="20.5" width="3" height="1.2" rx="0.5" fill="#334155"/>
  <path d="M30 22 Q32 23.5 34 22" stroke="#9f1239" stroke-width="0.8" fill="none"/>
  <!-- クリーム色のジェットヘルメット -->
  <path d="M24 16 Q24 7 32 7 Q40 7 40 16 L40 19 Q32 17 24 19 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <!-- ヘルメットの開閉バイザーシールド（水色透明） -->
  <path d="M26 14 Q32 12 38 14 L37 17 Q32 15 27 17 Z" fill="#38bdf8" opacity="0.6"/>
  <!-- あご紐 -->
  <path d="M25 18 Q32 25 39 18" stroke="#78350f" stroke-width="1" fill="none"/>
  <!-- ステップボードに乗るおじさんの靴 -->
  <rect x="22" y="47" width="4" height="6" rx="1.5" fill="#475569"/>
  <rect x="38" y="47" width="4" height="6" rx="1.5" fill="#475569"/>
</svg>`.trim();

  /** スクーターおじさん 背面（上向き） */
  public static readonly SCOOTER_GUY_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="60" rx="16" ry="3.5" fill="rgba(0,0,0,0.35)"/>
  <!-- スクーター後輪タイヤ -->
  <ellipse cx="32" cy="55" rx="5" ry="6" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 白いナンバープレート -->
  <rect x="28" y="48" width="8" height="5" rx="0.8" fill="#f8fafc" stroke="#64748b" stroke-width="0.8"/>
  <line x1="30" y1="50" x2="34" y2="50" stroke="#0284c7" stroke-width="0.7"/>
  <!-- 赤いテールランプ -->
  <rect x="29" y="44" width="6" height="3" rx="1" fill="#ef4444" stroke="#991b1b" stroke-width="0.8"/>
  <!-- 金属製リアキャリア（荷台） -->
  <rect x="25" y="38" width="14" height="4" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- スクーターシート（黒） -->
  <ellipse cx="32" cy="36" rx="8" ry="4" fill="#1e293b"/>
  <!-- おじさんの緑ジャンパー背中 -->
  <rect x="24" y="22" width="16" height="15" rx="3" fill="#15803d" stroke="#166534" stroke-width="1.3"/>
  <line x1="32" y1="23" x2="32" y2="36" stroke="#166534" stroke-width="1"/>
  <!-- ヘルメット後頭部（クリーム色） -->
  <circle cx="32" cy="14" r="8.5" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <!-- ヘルメット後部ゴーグルバンド -->
  <path d="M24 14 Q32 16 40 14" stroke="#78350f" stroke-width="2" fill="none"/>
  <!-- 左右バックミラー -->
  <circle cx="19" cy="27" r="2.2" fill="#334155"/>
  <circle cx="45" cy="27" r="2.2" fill="#334155"/>
  <!-- 右マフラー排気管（銀色・トコトコ煙） -->
  <rect x="37" y="52" width="5" height="2.5" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <circle cx="43" cy="51" r="1" fill="#cbd5e1" opacity="0.7"/>
  <circle cx="45" cy="49" r="1.5" fill="#e2e8f0" opacity="0.5"/>
</svg>`.trim();

  /** スクーターおじさん 側面（横向き: 風を切って走る姿） */
  public static readonly SCOOTER_GUY_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="60" rx="20" ry="3.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 後輪 -->
  <circle cx="18" cy="52" r="6" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="18" cy="52" r="3" fill="#94a3b8"/>
  <!-- 前輪 -->
  <circle cx="46" cy="52" r="6" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="46" cy="52" r="3" fill="#94a3b8"/>
  <!-- マフラー排気管 -->
  <rect x="14" y="53" width="10" height="2.5" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <!-- トコトコ排気煙 -->
  <circle cx="10" cy="53" r="1.5" fill="#cbd5e1" opacity="0.6"/>
  <circle cx="6" cy="50" r="2" fill="#e2e8f0" opacity="0.4"/>
  <!-- 赤いボディフレーム -->
  <path d="M16 48 L28 48 L36 48 L44 38 L42 36 L34 44 L24 44 L16 44 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.2"/>
  <!-- 白いフロントレッグシールド -->
  <path d="M42 36 L46 48 L43 50 L39 38 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <!-- ハンドル＆前照灯 -->
  <line x1="41" y1="36" x2="40" y2="30" stroke="#64748b" stroke-width="2"/>
  <circle cx="46" cy="35" r="3.5" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <!-- シート -->
  <rect x="20" y="40" width="12" height="4" rx="2" fill="#1e293b"/>
  <!-- おじさんのズボンと足 -->
  <path d="M26 42 L34 46 L35 50" stroke="#334155" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- おじさんの緑ジャンパー胴体（前傾姿勢） -->
  <path d="M24 28 L34 32 L32 42 L22 38 Z" fill="#15803d" stroke="#166534" stroke-width="1.2"/>
  <!-- 腕（ハンドルへ） -->
  <path d="M28 30 L38 31" stroke="#15803d" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="39" cy="31" r="2" fill="#f8fafc"/>
  <!-- 顔と横顔メガネ -->
  <ellipse cx="32" cy="18" rx="5.5" ry="6" fill="#fbcfe8"/>
  <circle cx="34.5" cy="17" r="1.8" fill="none" stroke="#334155" stroke-width="0.8"/>
  <rect x="34" y="20" width="2.5" height="1" fill="#334155"/>
  <!-- ヘルメット -->
  <path d="M26 18 Q26 9 33 9 Q39 9 39 18 L39 20 Q32 19 26 20 Z" fill="#fef3c7" stroke="#d97706" stroke-width="1.3"/>
  <path d="M35 15 L39 16 L38 18 L35 17 Z" fill="#38bdf8" opacity="0.6"/>
</svg>`.trim();

  /** スクーターおじさん（斜め手前エイリアス） */
  public static readonly SCOOTER_GUY_DIAG_DOWN_SVG = MonsterAndItemSprites.SCOOTER_GUY_SIDE_SVG;
  /** スクーターおじさん（斜め奥エイリアス） */
  public static readonly SCOOTER_GUY_DIAG_UP_SVG = MonsterAndItemSprites.SCOOTER_GUY_UP_SVG;

  // =========================================================================
  // 18. 多種多様な名物店主たち (MERCHANT VARIANTS)
  // =========================================================================

  /** 大商人トルネー (ユーザー提示公式トルネコ完全準拠: ワインレッド丸帽子、青いふさふさ髪＆青い口髭、白地に青の縦縞カフタンローブ、ワインレッドのベスト、左手に正義のそろばん杖、斜めがけ革鞄、背中の巨大緑風呂敷荷物＆青い寝袋、サンダル) */
  public static readonly MERCHANT_TORNEKO_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="59" rx="21" ry="4.5" fill="rgba(0,0,0,0.35)"/>

  <!-- 背中の巨大荷物（背負子の木枠・緑の風呂敷包み・青い寝袋） -->
  <!-- 木製背負子の柱 -->
  <rect x="18" y="14" width="2.8" height="15" rx="0.5" fill="#78350f" stroke="#451a03" stroke-width="0.8"/>
  <rect x="43" y="14" width="2.8" height="15" rx="0.5" fill="#78350f" stroke="#451a03" stroke-width="0.8"/>
  <!-- 頭上に高く積まれた巨大な緑の風呂敷包み -->
  <path d="M21 17 Q32 3 43 17 Q47 27 32 27 Q17 27 21 17 Z" fill="#15803d" stroke="#14532d" stroke-width="1.6"/>
  <path d="M24 16 Q32 8 40 16" stroke="#22c55e" stroke-width="1.2" fill="none"/>
  <!-- 結び目 -->
  <path d="M30 6 L32 9 L34 6" stroke="#166534" stroke-width="1.5" fill="none"/>
  <!-- 右側（向かって左）の青い丸めた寝袋ロール -->
  <ellipse cx="14" cy="38" rx="4.5" ry="7" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
  <ellipse cx="14" cy="38" rx="2.5" ry="4.5" fill="none" stroke="#bae6fd" stroke-width="1"/>
  <circle cx="14" cy="38" r="1" fill="#38bdf8"/>
  <!-- 左側（向かって右）の荷物ロール -->
  <ellipse cx="49" cy="39" rx="4" ry="6.5" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>

  <!-- ふくよかなロングカフタンローブ（白地に細い青の縦縞ストライプ） -->
  <path d="M15 25 Q11 44 13 53 Q32 57 51 53 Q53 44 49 25 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.4"/>
  <!-- 白地に鮮やかな青の縦縞ストライプ（トルネコ象徴パターン） -->
  <path d="M18 27 Q17 42 18 52" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M22 26 Q21 42 22 53" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M26 25 Q25 42 26 54" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M30 25 Q30 42 30 55" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M34 25 Q34 42 34 55" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M38 25 Q39 42 38 54" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M42 26 Q43 42 42 53" stroke="#0284c7" stroke-width="1.8" fill="none"/>
  <path d="M46 27 Q47 42 46 52" stroke="#0284c7" stroke-width="1.8" fill="none"/>

  <!-- ワインレッド（赤紫）の前開きベスト（ジレ） -->
  <!-- 右側ベスト（向かって左） -->
  <path d="M16 25 L11 44 Q16 46 19 41 L21 25 Z" fill="#881337" stroke="#4c0519" stroke-width="1.2"/>
  <path d="M17 27 L13 42" stroke="#be123c" stroke-width="0.8"/>
  <!-- 左側ベスト（向かって右） -->
  <path d="M48 25 L53 44 Q48 46 45 41 L43 25 Z" fill="#881337" stroke="#4c0519" stroke-width="1.2"/>
  <path d="M47 27 L51 42" stroke="#be123c" stroke-width="0.8"/>

  <!-- パフスリーブ腕（白地に青ストライプ） -->
  <!-- 右腕（腰に手を当てる） -->
  <path d="M16 25 Q8 32 10 39 L14 38 Q13 32 19 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <path d="M12 28 Q10 33 12 37" stroke="#0284c7" stroke-width="1.4" fill="none"/>
  <circle cx="12" cy="40" r="2.2" fill="#fde68a" stroke="#d97706" stroke-width="0.6"/>
  <!-- 左腕（前方にそろばん杖を握る） -->
  <path d="M48 25 Q54 31 52 38 L48 37 Q49 31 44 28 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1"/>
  <path d="M49 28 Q52 33 50 37" stroke="#0284c7" stroke-width="1.4" fill="none"/>

  <!-- 斜めがけの茶色い革鞄（ズタ袋ポシェット） -->
  <path d="M23 25 L38 41" stroke="#78350f" stroke-width="2" fill="none"/>
  <ellipse cx="33" cy="40" rx="6.5" ry="5.5" fill="#a16207" stroke="#713f12" stroke-width="1.2"/>
  <ellipse cx="32" cy="39" rx="4.5" ry="3.5" fill="#ca8a04" opacity="0.6"/>
  <circle cx="29" cy="37" r="1.5" fill="#78350f"/>

  <!-- 左手（向かって右）: 正義のそろばん杖（長い木製シャフト ＆ 精巧なそろばん本体） -->
  <!-- 杖の長い木製シャフト（上下に長く伸びる） -->
  <line x1="55" y1="2" x2="55" y2="58" stroke="#d97706" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="55" y1="4" x2="55" y2="56" stroke="#fde68a" stroke-width="0.8"/>
  <!-- 先端の金属石突きコーン -->
  <polygon points="55,57 53.5,62 56.5,62" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8"/>
  <!-- そろばん本体（木枠と珠） -->
  <rect x="48" y="4" width="14" height="15" rx="1.5" fill="#78350f" stroke="#451a03" stroke-width="1.2"/>
  <rect x="49.5" y="5.5" width="11" height="12" fill="#fef3c7"/>
  <!-- 上部の尖った装飾飾り鋲（3つの突起） -->
  <polygon points="50,4 51.5,1 53,4" fill="#e2e8f0" stroke="#64748b" stroke-width="0.6"/>
  <polygon points="54,4 55.5,0.5 57,4" fill="#e2e8f0" stroke="#64748b" stroke-width="0.6"/>
  <polygon points="58,4 59.5,1 61,4" fill="#e2e8f0" stroke="#64748b" stroke-width="0.6"/>
  <!-- そろばんの中央仕切り梁棒 -->
  <line x1="49.5" y1="9.5" x2="60.5" y2="9.5" stroke="#451a03" stroke-width="1.2"/>
  <!-- そろばんの珠（上段1玉・下段2玉の精密ビーズ列） -->
  <!-- 1列目 -->
  <circle cx="51.5" cy="7.5" r="0.9" fill="#78350f"/>
  <circle cx="51.5" cy="11.8" r="0.9" fill="#78350f"/>
  <circle cx="51.5" cy="14.2" r="0.9" fill="#78350f"/>
  <!-- 2列目 -->
  <circle cx="55" cy="7.5" r="0.9" fill="#78350f"/>
  <circle cx="55" cy="11.8" r="0.9" fill="#78350f"/>
  <circle cx="55" cy="14.2" r="0.9" fill="#78350f"/>
  <!-- 3列目 -->
  <circle cx="58.5" cy="7.5" r="0.9" fill="#78350f"/>
  <circle cx="58.5" cy="11.8" r="0.9" fill="#78350f"/>
  <circle cx="58.5" cy="14.2" r="0.9" fill="#78350f"/>
  <!-- 左右の白い房飾りタッセル -->
  <circle cx="48" cy="19" r="1.3" fill="#ffffff" stroke="#94a3b8" stroke-width="0.6"/>
  <line x1="48" y1="19" x2="48" y2="23" stroke="#cbd5e1" stroke-width="1.2"/>
  <circle cx="62" cy="19" r="1.3" fill="#ffffff" stroke="#94a3b8" stroke-width="0.6"/>
  <line x1="62" y1="19" x2="62" y2="23" stroke="#cbd5e1" stroke-width="1.2"/>
  <!-- 杖をしっかりと握る左手（素手拳） -->
  <circle cx="55" cy="34" r="2.8" fill="#fde68a" stroke="#d97706" stroke-width="0.8"/>
  <circle cx="54.5" cy="33.5" r="1" fill="#ffffff" opacity="0.6"/>

  <!-- 頭部・髪型・顔（鳥山明先生の公式トルネコ） -->
  <!-- 後頭部・側頭部の青いもじゃもじゃふさふさ髪 -->
  <path d="M19 17 Q15 25 20 28 Q23 26 22 20 Z" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="0.8"/>
  <path d="M45 17 Q49 25 44 28 Q41 26 42 20 Z" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="0.8"/>
  <path d="M21 21 Q32 30 43 21" stroke="#1d4ed8" stroke-width="3" fill="none"/>

  <!-- 頭頂部のワインレッド丸キャップ帽子（カロット帽） -->
  <ellipse cx="32" cy="13.5" rx="8.5" ry="3.8" fill="#881337" stroke="#4c0519" stroke-width="1.3"/>
  <ellipse cx="32" cy="12.5" rx="6.5" ry="2.2" fill="#be123c"/>
  <circle cx="32" cy="10" r="0.8" fill="#fda4af"/>

  <!-- 丸顔・福々しい輪郭（二重あご） -->
  <ellipse cx="32" cy="21.5" rx="10" ry="9.5" fill="#fde68a" stroke="#d97706" stroke-width="1.2"/>
  <!-- 福耳（左右） -->
  <ellipse cx="21" cy="21.5" rx="2.5" ry="4.2" fill="#fde68a" stroke="#d97706" stroke-width="0.8"/>
  <ellipse cx="43" cy="21.5" rx="2.5" ry="4.2" fill="#fde68a" stroke="#d97706" stroke-width="0.8"/>

  <!-- 前髪の青いもじゃもじゃ毛束 -->
  <path d="M24 15 Q27 17 26 19 Q23 18 24 15 Z" fill="#1d4ed8"/>
  <path d="M38 15 Q35 17 36 19 Q39 18 38 15 Z" fill="#1d4ed8"/>
  <path d="M29 14.5 Q32 17 35 14.5" stroke="#1d4ed8" stroke-width="2.2" fill="none"/>

  <!-- 細いアーチ眉 -->
  <path d="M25 16.5 Q27.5 14.5 30 16.5" stroke="#1e3a8a" stroke-width="1" fill="none"/>
  <path d="M34 16.5 Q36.5 14.5 39 16.5" stroke="#1e3a8a" stroke-width="1" fill="none"/>

  <!-- パッチリとしたつぶらな生きた瞳（白目に黒い瞳孔＆光沢白ハイライト） -->
  <!-- 左目 -->
  <ellipse cx="28" cy="19" rx="2.2" ry="2.8" fill="#ffffff" stroke="#1e293b" stroke-width="0.6"/>
  <circle cx="28" cy="19" r="1.4" fill="#1e293b"/>
  <circle cx="27.5" cy="18.2" r="0.6" fill="#ffffff"/>
  <!-- 右目 -->
  <ellipse cx="36" cy="19" rx="2.2" ry="2.8" fill="#ffffff" stroke="#1e293b" stroke-width="0.6"/>
  <circle cx="36" cy="19" r="1.4" fill="#1e293b"/>
  <circle cx="35.5" cy="18.2" r="0.6" fill="#ffffff"/>

  <!-- 特徴的な大きなふっくら丸鼻（肌色〜ほんのりピンク） -->
  <ellipse cx="32" cy="21" rx="3.2" ry="2.2" fill="#fbcfe8" stroke="#d97706" stroke-width="0.8"/>

  <!-- 象徴的な立派な青い口髭（カイゼル髭 / 髪と同じ濃紺ブルー！） -->
  <path d="M24 23.5 Q32 21.5 32 24.5 Q32 21.5 40 23.5 Q38 28 32 27 Q26 28 24 23.5 Z" fill="#1d4ed8" stroke="#172554" stroke-width="1.2"/>
  <path d="M26 24 Q32 23 38 24" stroke="#3b82f6" stroke-width="0.8" fill="none"/>

  <!-- 満面の温和なにっこり商人スマイル -->
  <path d="M29 27.5 Q32 30 35 27.5" stroke="#991b1b" stroke-width="1.2" fill="none"/>
  <!-- 二重あごのシワ -->
  <path d="M28.5 29.5 Q32 31.5 35.5 29.5" stroke="#d97706" stroke-width="0.9" fill="none"/>

  <!-- 足元（青いダボズボン裾 ＆ 素足ストラップサンダル） -->
  <!-- 青いズボン裾 -->
  <ellipse cx="26" cy="53" rx="4.5" ry="2.5" fill="#1e40af"/>
  <ellipse cx="38" cy="53" rx="4.5" ry="2.5" fill="#1e40af"/>
  <!-- 右足（向かって左）素足サンダル -->
  <rect x="23" y="55" width="6.5" height="3" rx="1.5" fill="#fde68a" stroke="#78350f" stroke-width="0.6"/>
  <line x1="22" y1="58" x2="30.5" y2="58" stroke="#78350f" stroke-width="1.4"/>
  <line x1="24" y1="55" x2="28.5" y2="57.5" stroke="#78350f" stroke-width="1.1"/>
  <!-- 左足（向かって右）素足サンダル -->
  <rect x="34.5" y="55" width="6.5" height="3" rx="1.5" fill="#fde68a" stroke="#78350f" stroke-width="0.6"/>
  <line x1="33.5" y1="58" x2="42" y2="58" stroke="#78350f" stroke-width="1.4"/>
  <line x1="35.5" y1="55" x2="40" y2="57.5" stroke="#78350f" stroke-width="1.1"/>
</svg>`.trim();

  /** 怒れる大商人トルネー (激怒時: 正義のそろばん杖を頭上に振り上げ激しくシャカシャカ！立ち上る紅蓮オーラと逆立つ青髪＆青髭) */
  public static readonly ANGRY_TORNEKO_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地影 -->
  <ellipse cx="32" cy="59" rx="21" ry="4.5" fill="rgba(0,0,0,0.35)"/>

  <!-- 激怒の紅蓮闘気オーラ（立ち上る火炎粒子） -->
  <circle cx="32" cy="34" r="25" fill="#fee2e2" opacity="0.38"/>
  <polygon points="32,2 35,8 29,8" fill="#ef4444" opacity="0.8"/>
  <polygon points="12,18 15,24 10,24" fill="#f97316" opacity="0.7"/>
  <polygon points="52,18 55,24 49,24" fill="#f97316" opacity="0.7"/>

  <!-- 背中の巨大風呂敷包み（激怒で揺れる） -->
  <path d="M20 18 Q32 2 44 18 Q48 28 32 28 Q16 28 20 18 Z" fill="#14532d" stroke="#052e16" stroke-width="1.8"/>

  <!-- 白地に青の縦縞カフタンローブ（怒りで大きく広がる） -->
  <path d="M14 26 Q10 44 12 53 Q32 58 52 53 Q54 44 50 26 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- 青の縦縞ストライプ -->
  <path d="M17 28 Q16 42 17 52" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M21 27 Q20 42 21 53" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M25 26 Q24 42 25 54" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M30 26 Q30 42 30 55" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M34 26 Q34 42 34 55" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M39 26 Q40 42 39 54" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M43 27 Q44 42 43 53" stroke="#0284c7" stroke-width="2" fill="none"/>
  <path d="M47 28 Q48 42 47 52" stroke="#0284c7" stroke-width="2" fill="none"/>

  <!-- ワインレッドのベスト（前開き） -->
  <path d="M15 26 L10 45 Q15 47 18 42 L20 26 Z" fill="#881337" stroke="#4c0519" stroke-width="1.3"/>
  <path d="M49 26 L54 45 Q49 47 46 42 L44 26 Z" fill="#881337" stroke="#4c0519" stroke-width="1.3"/>

  <!-- 斜めがけ革鞄 -->
  <ellipse cx="33" cy="41" rx="6.5" ry="5.5" fill="#a16207" stroke="#713f12" stroke-width="1.2"/>

  <!-- 振り上げられた正義のそろばん杖（頭上に斜めに振りかざす！） -->
  <g transform="rotate(-35 38 18)">
    <line x1="38" y1="-8" x2="38" y2="46" stroke="#d97706" stroke-width="2.6" stroke-linecap="round"/>
    <!-- そろばん枠 -->
    <rect x="31" y="-6" width="14" height="15" rx="1.5" fill="#78350f" stroke="#451a03" stroke-width="1.3"/>
    <rect x="32.5" y="-4.5" width="11" height="12" fill="#fef3c7"/>
    <line x1="32.5" y1="-0.5" x2="43.5" y2="-0.5" stroke="#451a03" stroke-width="1.2"/>
    <!-- 激しくシャカシャカ鳴り散るそろばん珠 -->
    <circle cx="34.5" cy="-2.5" r="0.9" fill="#78350f"/>
    <circle cx="38" cy="-2.5" r="0.9" fill="#78350f"/>
    <circle cx="41.5" cy="-2.5" r="0.9" fill="#78350f"/>
    <circle cx="34.5" cy="2" r="0.9" fill="#78350f"/>
    <circle cx="38" cy="2" r="0.9" fill="#78350f"/>
    <circle cx="41.5" cy="2" r="0.9" fill="#78350f"/>
    <!-- そろばんの火花スパーク -->
    <polygon points="38,-8 40,-12 36,-12" fill="#fbbf24"/>
    <circle cx="45" cy="-5" r="1.5" fill="#fef08a"/>
    <circle cx="30" cy="5" r="1.5" fill="#fef08a"/>
  </g>
  <!-- 杖を力強く振り上げる左腕拳 -->
  <circle cx="46" cy="20" r="3.2" fill="#fde68a" stroke="#d97706" stroke-width="1"/>

  <!-- 顔（怒りで真っ赤に紅潮した丸顔） -->
  <circle cx="32" cy="22" r="10" fill="#f87171" stroke="#b91c1c" stroke-width="1.5"/>

  <!-- 逆立つ青い髪（怒気でトゲ立つ） -->
  <path d="M19 16 L14 11 L20 13 L17 7 L23 11 Z" fill="#1d4ed8"/>
  <path d="M45 16 L50 11 L44 13 L47 7 L41 11 Z" fill="#1d4ed8"/>

  <!-- ワインレッドの丸キャップ帽子 -->
  <ellipse cx="32" cy="13" rx="8" ry="3.5" fill="#881337" stroke="#4c0519" stroke-width="1.3"/>

  <!-- 吊り上がった怒りの鬼眼（スライム基準の鋭い眼光） -->
  <line x1="24" y1="17" x2="30" y2="20" stroke="#450a0a" stroke-width="2"/>
  <circle cx="28" cy="20.5" r="1.8" fill="#fef08a"/>
  <circle cx="28" cy="20.5" r="0.9" fill="#000000"/>
  <circle cx="27.5" cy="20" r="0.4" fill="#ffffff"/>

  <line x1="40" y1="17" x2="34" y2="20" stroke="#450a0a" stroke-width="2"/>
  <circle cx="36" cy="20.5" r="1.8" fill="#fef08a"/>
  <circle cx="36" cy="20.5" r="0.9" fill="#000000"/>
  <circle cx="35.5" cy="20" r="0.4" fill="#ffffff"/>

  <!-- 逆立つ青い口髭（怒りで跳ね上がる！） -->
  <path d="M23 23 Q32 20 32 24 Q32 20 41 23 Q39 27 32 26 Q25 27 23 23 Z" fill="#1d4ed8" stroke="#172554" stroke-width="1.3"/>

  <!-- 激怒の大口（泥棒を許さぬ怒号） -->
  <path d="M27 26.5 Q32 34 37 26.5 Z" fill="#450a0a"/>
  <polygon points="29,26.5 30,28.5 31,26.5" fill="#ffffff"/>
  <polygon points="33,26.5 34,28.5 35,26.5" fill="#ffffff"/>

  <!-- 額の怒りマーク（十字マーク） -->
  <path d="M37 13 L42 17 M42 13 L37 17" stroke="#dc2626" stroke-width="2.2"/>

  <!-- 足元（サンダル） -->
  <rect x="23" y="55" width="6.5" height="3" rx="1.5" fill="#fde68a" stroke="#78350f" stroke-width="0.6"/>
  <line x1="22" y1="58" x2="30.5" y2="58" stroke="#78350f" stroke-width="1.4"/>
  <rect x="34.5" y="55" width="6.5" height="3" rx="1.5" fill="#fde68a" stroke="#78350f" stroke-width="0.6"/>
  <line x1="33.5" y1="58" x2="42" y2="58" stroke="#78350f" stroke-width="1.4"/>
</svg>`.trim();

  /** 風来坊シレンス (SHIREN風: 三度笠、青白縞合羽、竹筒、刀、肩の小動物) */
  public static readonly MERCHANT_SHIREN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 縞合羽（マント: 青と白の縦縞模様） -->
  <path d="M16 26 L10 52 L54 52 L48 26 Z" fill="#1e40af" stroke="#172554" stroke-width="1.5"/>
  <path d="M18 28 L14 52 L22 52 L24 28 Z" fill="#f8fafc"/>
  <path d="M30 28 L28 52 L36 52 L36 28 Z" fill="#f8fafc"/>
  <path d="M42 28 L42 52 L48 52 L46 28 Z" fill="#f8fafc"/>
  <!-- 旅の装束（着物と帯） -->
  <rect x="24" y="32" width="16" height="18" fill="#334155"/>
  <rect x="23" y="42" width="18" height="4" fill="#f59e0b"/>
  <!-- 左腰の刀（柄と鍔） -->
  <line x1="20" y1="46" x2="14" y2="40" stroke="#f1f5f9" stroke-width="2.5"/>
  <rect x="18" y="43" width="3" height="3" fill="#fbbf24"/>
  <!-- 肩に乗った黄色い小動物（相棒） -->
  <ellipse cx="44" cy="24" rx="4" ry="3" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
  <circle cx="46" cy="23" r="0.7" fill="#1e293b"/>
  <polygon points="41,22 43,24 41,25" fill="#facc15"/>
  <!-- 精悍な顔立ち -->
  <circle cx="32" cy="23" r="7" fill="#fed7aa" stroke="#ea580c" stroke-width="0.8"/>
  <!-- 涼やかな目元 -->
  <line x1="28" y1="23" x2="31" y2="23" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="33" y1="23" x2="36" y2="23" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 立派な三度笠（編み笠） -->
  <ellipse cx="32" cy="16" rx="18" ry="7" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
  <ellipse cx="32" cy="14" rx="10" ry="4" fill="#b45309"/>
  <!-- 笠の編み目ライン -->
  <line x1="16" y1="16" x2="48" y2="16" stroke="#78350f" stroke-width="0.8"/>
  <line x1="32" y1="9" x2="32" y2="21" stroke="#78350f" stroke-width="0.8"/>
  <!-- 脚絆と草鞋 -->
  <rect x="25" y="50" width="5" height="7" fill="#e2e8f0"/>
  <rect x="34" y="50" width="5" height="7" fill="#e2e8f0"/>
</svg>`.trim();

  /** 怒れる風来坊シレンス (抜き身の青光り白刃・激怒の鬼気オーラ) */
  public static readonly ANGRY_SHIREN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 青白い抜刀闘気オーラ -->
  <circle cx="32" cy="32" r="25" fill="#e0f2fe" opacity="0.3"/>
  <!-- 縞合羽（風になびく） -->
  <path d="M12 24 L4 54 L58 50 L52 24 Z" fill="#1e3a8a" stroke="#0f172a" stroke-width="2"/>
  <path d="M14 26 L8 52 L18 52 L22 26 Z" fill="#f8fafc"/>
  <path d="M28 26 L26 52 L36 52 L36 26 Z" fill="#f8fafc"/>
  <!-- 抜き放たれた名刀（白刃が青光り） -->
  <line x1="20" y1="42" x2="6" y2="16" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
  <line x1="20" y1="42" x2="6" y2="16" stroke="#ffffff" stroke-width="1.5"/>
  <circle cx="6" cy="16" r="2.5" fill="#bae6fd"/>
  <!-- 深く被った三度笠と光る鋭い眼光 -->
  <ellipse cx="32" cy="18" rx="18" ry="7" fill="#92400e" stroke="#451a03" stroke-width="2"/>
  <!-- 影の中の光る紅蓮の眼 -->
  <circle cx="29" cy="24" r="1.5" fill="#ef4444"/>
  <circle cx="35" cy="24" r="1.5" fill="#ef4444"/>
</svg>`.trim();

  /** ドワーフ商人ゴルド (GOLDO: 赤髭、革エプロン、鍛冶ハンマー) */
  public static readonly MERCHANT_GOLDO_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- がっしりした体躯・革エプロン -->
  <rect x="20" y="28" width="24" height="24" rx="4" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="24" y="32" width="16" height="18" fill="#92400e"/>
  <!-- 右手: 鍛冶屋の大槌（ハンマー） -->
  <line x1="48" y1="48" x2="48" y2="24" stroke="#78350f" stroke-width="2.5"/>
  <rect x="42" y="22" width="12" height="7" rx="1.5" fill="#475569" stroke="#1e293b" stroke-width="1.2"/>
  <!-- ドワーフの頑丈な頭部 -->
  <circle cx="32" cy="20" r="8" fill="#d97706" stroke="#92400e" stroke-width="1"/>
  <!-- 鉄の額当て（ヘッドバンド） -->
  <rect x="24" y="14" width="16" height="4" fill="#64748b" stroke="#334155" stroke-width="0.8"/>
  <circle cx="32" cy="16" r="1.5" fill="#fbbf24"/>
  <!-- 豊かな赤茶の長髭（胸元まで伸びる） -->
  <path d="M24 22 Q32 38 40 22 Q36 40 32 44 Q28 40 24 22 Z" fill="#ea580c" stroke="#9a3412" stroke-width="1.2"/>
  <!-- 太い眉と鋭い眼 -->
  <line x1="27" y1="18" x2="30" y2="19" stroke="#9a3412" stroke-width="2"/>
  <circle cx="28.5" cy="20" r="1.2" fill="#0f172a"/>
  <line x1="37" y1="18" x2="34" y2="19" stroke="#9a3412" stroke-width="2"/>
  <circle cx="35.5" cy="20" r="1.2" fill="#0f172a"/>
  <!-- 頑丈な鉄ブーツ -->
  <rect x="22" y="52" width="8" height="6" rx="2" fill="#334155"/>
  <rect x="34" y="52" width="8" height="6" rx="2" fill="#334155"/>
</svg>`.trim();

  /** 怒れるドワーフ商人ゴルド (赤熱ハンマー振り上げ) */
  public static readonly ANGRY_GOLDO_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.3)"/>
  <!-- 爆炎オーラ -->
  <circle cx="32" cy="30" r="25" fill="#fef08a" opacity="0.3"/>
  <!-- 赤熱した巨大ハンマー -->
  <line x1="46" y1="36" x2="54" y2="8" stroke="#78350f" stroke-width="3"/>
  <rect x="46" y="4" width="16" height="9" rx="2" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
  <circle cx="54" cy="8" r="3" fill="#fef08a"/>
  <!-- 体躯 -->
  <rect x="20" y="28" width="24" height="24" rx="4" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
  <!-- 逆立つ赤髭 -->
  <path d="M22 22 Q32 38 42 22 Q36 44 32 46 Q28 44 22 22 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
  <!-- 怒りの鬼面 -->
  <circle cx="32" cy="18" r="8" fill="#f87171"/>
  <circle cx="28" cy="18" r="2" fill="#ffffff"/>
  <circle cx="28" cy="18" r="1" fill="#7f1d1d"/>
  <circle cx="36" cy="18" r="2" fill="#ffffff"/>
  <circle cx="36" cy="18" r="1" fill="#7f1d1d"/>
</svg>`.trim();

  /** エルフ女商人セリア (CELIA: 金髪ロング、エルフ耳、紫の魔道ローブ、水晶玉) */
  public static readonly MERCHANT_CELIA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="3.5" fill="rgba(0,0,0,0.25)"/>
  <!-- 紫の魔道シルクローブ（優美なドレス） -->
  <path d="M22 26 L16 54 Q32 58 48 54 L42 26 Z" fill="#6b21a8" stroke="#4c1d95" stroke-width="1.5"/>
  <path d="M25 28 L20 54 Q32 56 44 54 L39 28 Z" fill="#7e22ce"/>
  <!-- 金の刺繍装飾帯 -->
  <line x1="32" y1="28" x2="32" y2="54" stroke="#fbbf24" stroke-width="1.5"/>
  <circle cx="32" cy="30" r="2" fill="#38bdf8"/>
  <!-- 左手: 浮かぶ神秘の水晶玉 -->
  <circle cx="16" cy="34" r="5" fill="#38bdf8" opacity="0.8" stroke="#0284c7" stroke-width="1"/>
  <circle cx="15" cy="33" r="1.8" fill="#ffffff"/>
  <!-- 金髪ロングウェーブの髪 -->
  <path d="M20 18 Q16 36 20 44 Q24 32 24 20 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
  <path d="M44 18 Q48 36 44 44 Q40 32 40 20 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
  <!-- 尖ったエルフ耳 -->
  <polygon points="22,18 12,12 23,22" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.8"/>
  <polygon points="42,18 52,12 41,22" fill="#fbcfe8" stroke="#f472b6" stroke-width="0.8"/>
  <!-- 美しい顔立ち -->
  <circle cx="32" cy="20" r="7.5" fill="#fbcfe8"/>
  <!-- 前髪 -->
  <path d="M24 16 Q32 20 40 16 Q32 12 24 16 Z" fill="#fef08a"/>
  <!-- 魅惑的な紫の瞳 -->
  <ellipse cx="29" cy="20" rx="1.3" ry="1.8" fill="#9333ea"/>
  <circle cx="29.3" cy="19.5" r="0.5" fill="#ffffff"/>
  <ellipse cx="35" cy="20" rx="1.3" ry="1.8" fill="#9333ea"/>
  <circle cx="35.3" cy="19.5" r="0.5" fill="#ffffff"/>
  <!-- 妖艶な微笑み -->
  <path d="M30 24 Q32 25.5 34 24" stroke="#db2777" stroke-width="0.9" fill="none"/>
</svg>`.trim();

  /** 怒れるエルフ女商人セリア (真紅の瞳・紫電魔法陣) */
  public static readonly ANGRY_CELIA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="3.5" fill="rgba(0,0,0,0.25)"/>
  <!-- 背後の紫電魔法陣 -->
  <circle cx="32" cy="28" r="22" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="3,3"/>
  <polygon points="32,8 48,36 16,36" fill="none" stroke="#a855f7" stroke-width="1"/>
  <polygon points="32,48 48,20 16,20" fill="none" stroke="#a855f7" stroke-width="1"/>
  <!-- ローブ -->
  <path d="M22 26 L14 54 Q32 60 50 54 L42 26 Z" fill="#581c87" stroke="#3b0764" stroke-width="1.8"/>
  <!-- 逆立つ金髪 -->
  <path d="M20 16 Q10 26 12 42" stroke="#fef08a" stroke-width="3" fill="none"/>
  <path d="M44 16 Q54 26 52 42" stroke="#fef08a" stroke-width="3" fill="none"/>
  <!-- 尖ったエルフ耳 -->
  <polygon points="22,18 10,10 23,22" fill="#fbcfe8" stroke="#f472b6" stroke-width="1"/>
  <polygon points="42,18 54,10 41,22" fill="#fbcfe8" stroke="#f472b6" stroke-width="1"/>
  <!-- 顔と真紅の魔眼 -->
  <circle cx="32" cy="20" r="7.5" fill="#fbcfe8"/>
  <ellipse cx="29" cy="20" rx="1.5" ry="2" fill="#dc2626"/>
  <ellipse cx="35" cy="20" rx="1.5" ry="2" fill="#dc2626"/>
</svg>`.trim();

  // =========================================================================
  // 迷宮屋台システム（ラーメン屋台マルキン・おでん屋台）
  // =========================================================================

  /** ラーメン屋台マルキン（おじさん店主「あじゃあうえっぇー！」） */
  public static readonly FOOD_STALL_RAMEN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地シャドウ -->
  <ellipse cx="32" cy="59" rx="26" ry="4" fill="rgba(0,0,0,0.4)"/>
  <!-- 屋台車輪 -->
  <circle cx="16" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="16" cy="54" r="2" fill="#d97706"/>
  <circle cx="48" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="48" cy="54" r="2" fill="#d97706"/>
  <!-- カウンター台車本体 -->
  <rect x="10" y="34" width="44" height="18" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <rect x="8" y="32" width="48" height="4" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1"/>
  <!-- 支柱 -->
  <rect x="12" y="10" width="2.5" height="23" fill="#78350f"/>
  <rect x="49.5" y="10" width="2.5" height="23" fill="#78350f"/>
  <!-- 屋根（瓦屋根ひさし） -->
  <path d="M6 10 L58 10 L54 4 L10 4 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="8" y="9" width="48" height="2" fill="#d97706"/>
  <!-- 暖簾（紺色・マルキン） -->
  <path d="M14 10 L50 10 L50 20 L42 20 L42 16 L38 16 L38 20 L26 20 L26 16 L22 16 L22 20 L14 20 Z" fill="#1e3a8a" stroke="#172554" stroke-width="0.8"/>
  <text x="32" y="16" font-size="5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">マルキン</text>
  <!-- 赤提灯（左右） -->
  <ellipse cx="10" cy="18" rx="3.5" ry="5" fill="#ef4444" stroke="#991b1b" stroke-width="0.8"/>
  <rect x="8.5" y="13" width="3" height="1" fill="#1e293b"/>
  <rect x="8.5" y="22" width="3" height="1" fill="#1e293b"/>
  <text x="10" y="19" font-size="3.5" font-weight="bold" fill="#fef08a" text-anchor="middle" font-family="sans-serif">拉</text>
  <ellipse cx="54" cy="18" rx="3.5" ry="5" fill="#ef4444" stroke="#991b1b" stroke-width="0.8"/>
  <rect x="52.5" y="13" width="3" height="1" fill="#1e293b"/>
  <rect x="52.5" y="22" width="3" height="1" fill="#1e293b"/>
  <text x="54" y="19" font-size="3.5" font-weight="bold" fill="#fef08a" text-anchor="middle" font-family="sans-serif">麺</text>
  <!-- 店主おじさん（カウンター奥） -->
  <g transform="translate(0, 0)">
    <!-- 体（白Tシャツ） -->
    <rect x="26" y="22" width="12" height="11" fill="#f8fafc" stroke="#cbd5e1" stroke-width="0.8"/>
    <!-- 顔・ヒゲ・笑顔 -->
    <circle cx="32" cy="19" r="5.5" fill="#fed7aa"/>
    <!-- ねじり鉢巻き（赤白） -->
    <path d="M26.5 16 Q32 14 37.5 16" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="1.5,1" fill="none"/>
    <circle cx="37" cy="16" r="1" fill="#dc2626"/>
    <!-- 目（にっこり笑い目） -->
    <path d="M29.5 18 Q30.5 17 31.5 18" stroke="#78350f" stroke-width="0.8" fill="none"/>
    <path d="M32.5 18 Q33.5 17 34.5 18" stroke="#78350f" stroke-width="0.8" fill="none"/>
    <!-- 口（豪快な開口「あじゃあうえっぇー！」） -->
    <path d="M30.5 21 Q32 23.5 33.5 21 Z" fill="#b91c1c"/>
    <ellipse cx="32" cy="20" rx="1.5" ry="1" fill="#ea580c"/>
    <!-- ヒゲ -->
    <path d="M30 20.5 Q32 21.5 34 20.5" stroke="#78350f" stroke-width="0.6" fill="none"/>
  </g>
  <!-- カウンター上の寸胴鍋と湯気 -->
  <rect x="14" y="28" width="8" height="6" rx="1" fill="#94a3b8" stroke="#475569" stroke-width="0.8"/>
  <!-- 立ち上る湯気 -->
  <path d="M16 26 Q18 23 16 20 Q14 17 17 14" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.75"/>
  <path d="M20 25 Q22 22 20 19 Q18 16 21 13" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.6"/>
  <!-- カウンター上のドンブリ（極上ラーメン） -->
  <path d="M40 31 L48 31 L46 36 L42 36 Z" fill="#dc2626" stroke="#991b1b" stroke-width="0.8"/>
  <ellipse cx="44" cy="31" rx="4" ry="1.2" fill="#fef08a"/>
  <!-- ナルトとチャーシュー -->
  <circle cx="43" cy="31" r="0.8" fill="#f43f5e"/>
  <ellipse cx="45.5" cy="31" rx="1.2" ry="0.6" fill="#b45309"/>
  <!-- 箸 -->
  <line x1="39" y1="29" x2="47" y2="33" stroke="#d97706" stroke-width="0.6"/>
</svg>`.trim();

  /** ラーメン屋台マルキン（おかみさん奥さん「ウチやってません！」） */
  public static readonly FOOD_STALL_RAMEN_WIFE_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地シャドウ -->
  <ellipse cx="32" cy="59" rx="26" ry="4" fill="rgba(0,0,0,0.4)"/>
  <!-- 屋台車輪 -->
  <circle cx="16" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="16" cy="54" r="2" fill="#d97706"/>
  <circle cx="48" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="48" cy="54" r="2" fill="#d97706"/>
  <!-- カウンター台車本体 -->
  <rect x="10" y="34" width="44" height="18" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <rect x="8" y="32" width="48" height="4" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1"/>
  <!-- 支柱 -->
  <rect x="12" y="10" width="2.5" height="23" fill="#78350f"/>
  <rect x="49.5" y="10" width="2.5" height="23" fill="#78350f"/>
  <!-- 屋根 -->
  <path d="M6 10 L58 10 L54 4 L10 4 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="8" y="9" width="48" height="2" fill="#d97706"/>
  <!-- 暖簾（裏返し・準備中感） -->
  <path d="M14 10 L50 10 L50 18 L42 18 L42 15 L38 15 L38 18 L26 18 L26 15 L22 15 L22 18 L14 18 Z" fill="#334155" stroke="#1e293b" stroke-width="0.8"/>
  <text x="32" y="15" font-size="4" font-weight="bold" fill="#94a3b8" text-anchor="middle" font-family="sans-serif">仕込中</text>
  <!-- 赤提灯（消灯・暗い赤） -->
  <ellipse cx="10" cy="18" rx="3.5" ry="5" fill="#7f1d1d" stroke="#450a0a" stroke-width="0.8"/>
  <ellipse cx="54" cy="18" rx="3.5" ry="5" fill="#7f1d1d" stroke="#450a0a" stroke-width="0.8"/>
  <!-- 奥さん（割烹着エプロン・三角巾・不機嫌仁王立ち） -->
  <g transform="translate(0, 0)">
    <!-- 割烹着（ピンクエプロン） -->
    <rect x="26" y="22" width="12" height="11" fill="#f43f5e" stroke="#be123c" stroke-width="0.8"/>
    <rect x="28" y="24" width="8" height="8" fill="#ffffff"/>
    <!-- 顔 -->
    <circle cx="32" cy="18" r="5.5" fill="#fed7aa"/>
    <!-- 三角巾（水色）とお団子髪 -->
    <path d="M26 16 L38 16 L32 12 Z" fill="#38bdf8"/>
    <circle cx="32" cy="12" r="2" fill="#78350f"/>
    <!-- 不機嫌眉毛・じと目（「ウチやってません」） -->
    <line x1="28" y1="16.5" x2="31" y2="18" stroke="#78350f" stroke-width="0.9"/>
    <line x1="36" y1="16.5" x2="33" y2="18" stroke="#78350f" stroke-width="0.9"/>
    <circle cx="30" cy="19" r="0.7" fill="#0f172a"/>
    <circle cx="34" cy="19" r="0.7" fill="#0f172a"/>
    <!-- 引き結んだへの字口 -->
    <path d="M30.5 22 Q32 20.5 33.5 22" stroke="#be123c" stroke-width="1" fill="none"/>
    <!-- 怒りマーク・青筋 -->
    <path d="M38 13 L42 13 M40 11 L40 15" stroke="#ef4444" stroke-width="1"/>
  </g>
  <!-- カウンター上の「準備中」札 -->
  <rect x="22" y="28" width="20" height="4" rx="1" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
  <text x="32" y="31" font-size="3" font-weight="bold" fill="#7f1d1d" text-anchor="middle" font-family="sans-serif">本日休業 / 準備中</text>
</svg>`.trim();

  /** 秘伝のおでん屋台 */
  public static readonly FOOD_STALL_ODEN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="59" rx="26" ry="4" fill="rgba(0,0,0,0.4)"/>
  <circle cx="16" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="48" cy="54" r="6" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="10" y="34" width="44" height="18" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="8" y="32" width="48" height="4" rx="1" fill="#92400e"/>
  <rect x="12" y="10" width="2.5" height="23" fill="#78350f"/>
  <rect x="49.5" y="10" width="2.5" height="23" fill="#78350f"/>
  <path d="M6 10 L58 10 L54 4 L10 4 Z" fill="#3f3f46" stroke="#18181b" stroke-width="1.2"/>
  <!-- おでん提灯 -->
  <ellipse cx="10" cy="18" rx="3.5" ry="5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
  <text x="10" y="19" font-size="3.5" font-weight="bold" fill="#451a03" text-anchor="middle" font-family="sans-serif">お</text>
  <ellipse cx="54" cy="18" rx="3.5" ry="5" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
  <text x="54" y="19" font-size="3.5" font-weight="bold" fill="#451a03" text-anchor="middle" font-family="sans-serif">でん</text>
  <!-- おでん鍋（仕切り） -->
  <rect x="20" y="27" width="24" height="6" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
  <line x1="32" y1="27" x2="32" y2="33" stroke="#475569" stroke-width="0.8"/>
  <!-- 大根・玉子・こんにゃく -->
  <circle cx="25" cy="30" r="2" fill="#fef08a"/>
  <polygon points="28,29 31,29 29.5,32" fill="#713f12"/>
  <rect x="34" y="29" width="4" height="2" fill="#d97706"/>
  <!-- 立ち上る湯気 -->
  <path d="M26 25 Q28 22 26 19" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.7"/>
  <path d="M38 25 Q40 22 38 19" stroke="#ffffff" stroke-width="0.8" fill="none" opacity="0.7"/>
</svg>`.trim();
}
