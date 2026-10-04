/**
 * @file TileSprites.ts
 * @description ダンジョン各バイオーム（石・赤土・草木遺跡・水流・地下湖）の床および壁の
 * 高品質ベクターSVGグラフィック（バリエーション計30種）を定義・キャッシュ・提供するクラス。
 * 外部通信を一切行わず、Data URL変換によりHTMLImageElementとして高速インメモリキャッシュします。
 */

import { BiomeType } from '../../core/types';

/**
 * ダンジョンタイルスプライトの識別子。
 */
export type TileSpriteId =
  // 1. 石造りの迷宮 (STONE)
  | 'tile_stone_floor_1'
  | 'tile_stone_floor_2'
  | 'tile_stone_floor_3'
  | 'tile_stone_floor_4'
  | 'tile_stone_wall_1'
  | 'tile_stone_wall_2'
  // 2. 岩と赤土の洞窟 (EARTH)
  | 'tile_earth_floor_1'
  | 'tile_earth_floor_2'
  | 'tile_earth_floor_3'
  | 'tile_earth_floor_4'
  | 'tile_earth_wall_1'
  | 'tile_earth_wall_2'
  // 3. 草木と旧遺跡 (FOREST)
  | 'tile_forest_floor_1'
  | 'tile_forest_floor_2'
  | 'tile_forest_floor_3'
  | 'tile_forest_floor_4'
  | 'tile_forest_wall_1'
  | 'tile_forest_wall_2'
  // 4. 地下水流と清流洞 (RIVER)
  | 'tile_river_floor_1'
  | 'tile_river_floor_2'
  | 'tile_river_floor_3'
  | 'tile_river_floor_4'
  | 'tile_river_wall_1'
  | 'tile_river_wall_2'
  // 5. 水没せし蒼玉の地下湖 (LAKE)
  | 'tile_lake_floor_1'
  | 'tile_lake_floor_2'
  | 'tile_lake_floor_3'
  | 'tile_lake_floor_4'
  | 'tile_lake_wall_1'
  | 'tile_lake_wall_2';

/**
 * ダンジョンの床・壁のベクターグラフィックスプライト管理クラス。
 */
export class TileSprites {
  /** キャッシュされたスプライト画像マップ */
  private static imageCache: Map<TileSpriteId, HTMLImageElement> = new Map();

  /** ロード完了を示すPromise */
  private static readyPromise: Promise<void> | null = null;

  // ==========================================
  // 1. 石造りの迷宮 (STONE) SVG 定義
  // ==========================================

  /** 石の迷宮・通常石畳 */
  public static readonly STONE_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b"/>
  <!-- 石畳タイル1（左上・大） -->
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#475569" opacity="0.7"/>
  <!-- 石畳タイル2（右上・小） -->
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#475569" opacity="0.7"/>
  <!-- 石畳タイル3（左下・小） -->
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#475569" opacity="0.7"/>
  <!-- 石畳タイル4（右下・大） -->
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#475569" opacity="0.7"/>
  <!-- 目地の陰影・質感ドット -->
  <circle cx="38" cy="29" r="1.5" fill="#0f172a"/>
  <circle cx="26" cy="31" r="1" fill="#0f172a"/>
</svg>
`.trim();

  /** 石の迷宮・ひび割れ古代石畳 */
  public static readonly STONE_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#475569" opacity="0.7"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#475569" opacity="0.7"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#475569" opacity="0.7"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#475569" opacity="0.7"/>
  <!-- ひび割れクラックライン -->
  <path d="M10 8 L18 16 L15 22 L24 25" stroke="#0f172a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M18 16 L22 13" stroke="#0f172a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
  <path d="M42 42 L48 48 L46 56" stroke="#0f172a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

  /** 石の迷宮・小石散乱石畳 */
  public static readonly STONE_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#475569" opacity="0.7"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#475569" opacity="0.7"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#475569" opacity="0.7"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#475569" opacity="0.7"/>
  <!-- 散らばる小石 -->
  <ellipse cx="14" cy="48" rx="3" ry="2" fill="#64748b" stroke="#0f172a" stroke-width="1"/>
  <ellipse cx="20" cy="52" rx="2" ry="1.5" fill="#475569" stroke="#0f172a" stroke-width="0.8"/>
  <ellipse cx="52" cy="14" rx="2.5" ry="1.8" fill="#64748b" stroke="#0f172a" stroke-width="1"/>
</svg>
`.trim();

  /** 石の迷宮・苔むした石畳 */
  public static readonly STONE_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1e293b"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#475569" opacity="0.7"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#475569" opacity="0.7"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#475569" opacity="0.7"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#475569" opacity="0.7"/>
  <!-- 隙間に這う苔 -->
  <path d="M26 27 Q32 28 38 28 Q34 32 30 33 Z" fill="#047857" opacity="0.9"/>
  <circle cx="28" cy="29" r="1.5" fill="#10b981"/>
  <circle cx="34" cy="30" r="1.8" fill="#10b981"/>
  <path d="M50 28 Q54 30 58 29" stroke="#047857" stroke-width="2" fill="none"/>
</svg>
`.trim();

  /** 石の迷宮・重厚な石レンガ壁 */
  public static readonly STONE_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 壁天板（Top Surface: 明るい立体押し出し面） -->
  <rect x="0" y="0" width="64" height="18" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#64748b" stroke-width="1.5"/>
  <!-- 正面壁面（Front Face: 互い違いの石積みレンガ） -->
  <rect x="0" y="18" width="64" height="46" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <!-- レンガ1段目 -->
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="4" y="22" width="24" height="2" fill="#475569" opacity="0.6"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="35" y="22" width="25" height="2" fill="#475569" opacity="0.6"/>
  <!-- レンガ2段目 -->
  <rect x="2" y="42" width="16" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="20" y="42" width="28" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="22" y="44" width="24" height="2" fill="#475569" opacity="0.6"/>
  <rect x="50" y="42" width="12" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 目地シャドウ -->
  <line x1="0" y1="18" x2="64" y2="18" stroke="#030712" stroke-width="2"/>
</svg>
`.trim();

  /** 石の迷宮・亀裂入り石レンガ壁 */
  public static readonly STONE_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#64748b" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="2" y="42" width="16" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="20" y="42" width="28" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="50" y="42" width="12" height="20" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 亀裂と壁面陰影 -->
  <path d="M38 24 L44 32 L40 38 L48 44 L45 52" stroke="#030712" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#030712" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 2. 岩と赤土の洞窟 (EARTH) SVG 定義
  // ==========================================

  /** 赤土の洞窟・通常土面 */
  public static readonly EARTH_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#2d1510"/>
  <!-- 踏み固められた赤土パッチ -->
  <path d="M4 8 Q24 4 48 10 Q60 28 54 48 Q32 60 12 52 Q2 32 4 8 Z" fill="#3d1e17" stroke="#1c0d0a" stroke-width="1"/>
  <ellipse cx="28" cy="32" rx="18" ry="12" fill="#4d271f" opacity="0.6"/>
  <circle cx="18" cy="22" r="1.5" fill="#1c0d0a"/>
  <circle cx="44" cy="38" r="1.8" fill="#1c0d0a"/>
</svg>
`.trim();

  /** 赤土の洞窟・砂利と小岩 */
  public static readonly EARTH_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#2d1510"/>
  <path d="M6 12 Q30 6 52 14 Q58 36 50 52 Q26 58 10 48 Z" fill="#3d1e17"/>
  <!-- 尖った小岩と砂利 -->
  <polygon points="18,22 24,18 26,24 20,26" fill="#5c3228" stroke="#1c0d0a" stroke-width="1"/>
  <polygon points="42,38 48,34 50,42 44,44" fill="#6d3b30" stroke="#1c0d0a" stroke-width="1"/>
  <circle cx="34" cy="20" r="1.5" fill="#78350f"/>
  <circle cx="14" cy="44" r="2" fill="#1c0d0a"/>
</svg>
`.trim();

  /** 赤土の洞窟・乾いた地割れ */
  public static readonly EARTH_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#2d1510"/>
  <path d="M4 6 Q32 4 56 12 Q60 38 48 56 Q22 60 8 46 Z" fill="#3d1e17"/>
  <!-- 地割れの亀裂 -->
  <path d="M12 28 L24 26 L30 34 L42 30 L52 38" stroke="#140907" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M30 34 L28 46 L34 52" stroke="#140907" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M24 26 L22 14" stroke="#140907" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

  /** 赤土の洞窟・硬質岩盤露出 */
  public static readonly EARTH_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#2d1510"/>
  <path d="M8 8 L48 6 L56 32 L46 54 L12 50 Z" fill="#3d1e17"/>
  <!-- 露出した硬質岩盤 -->
  <polygon points="20,16 44,14 50,34 38,44 18,36" fill="#4a251e" stroke="#1c0d0a" stroke-width="1.5"/>
  <line x1="22" y1="18" x2="42" y2="16" stroke="#6d3b30" stroke-width="1.5"/>
</svg>
`.trim();

  /** 赤土の洞窟・荒削り鍾乳洞壁1 */
  public static readonly EARTH_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 岩壁天板 -->
  <polygon points="0,0 64,0 64,18 0,18" fill="#5c3228" stroke="#1c0d0a" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#783d31" stroke-width="1.5"/>
  <!-- ごつごつした多角形岩肌正面 -->
  <rect x="0" y="18" width="64" height="46" fill="#2d1510"/>
  <polygon points="4,22 28,20 34,36 12,40" fill="#4a251e" stroke="#1c0d0a" stroke-width="1.2"/>
  <polygon points="34,20 60,22 56,38 32,36" fill="#3d1e17" stroke="#1c0d0a" stroke-width="1.2"/>
  <polygon points="8,42 36,38 32,60 4,58" fill="#3d1e17" stroke="#1c0d0a" stroke-width="1.2"/>
  <polygon points="36,40 60,38 58,58 32,60" fill="#4a251e" stroke="#1c0d0a" stroke-width="1.2"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#140907" stroke-width="2"/>
</svg>
`.trim();

  /** 赤土の洞窟・断層岩壁2 */
  public static readonly EARTH_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="0,0 64,0 64,18 0,18" fill="#5c3228" stroke="#1c0d0a" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#2d1510"/>
  <!-- 地層断層ライン -->
  <path d="M0 26 Q32 32 64 24" stroke="#140907" stroke-width="2" fill="none"/>
  <path d="M0 40 Q32 46 64 38" stroke="#140907" stroke-width="2" fill="none"/>
  <path d="M0 54 Q32 58 64 52" stroke="#140907" stroke-width="2" fill="none"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#140907" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 3. 草木と旧遺跡 (FOREST) SVG 定義
  // ==========================================

  /** 旧遺跡・生い茂る草むら */
  public static readonly FOREST_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#064e3b"/>
  <!-- 草地パッチ -->
  <path d="M4 8 Q32 2 58 10 Q62 36 52 56 Q28 62 8 50 Z" fill="#047857"/>
  <!-- 草の穂 -->
  <path d="M14 26 Q18 16 22 14 Q20 22 18 26 Z" fill="#34d399"/>
  <path d="M18 26 Q24 18 28 17 Q25 23 21 26 Z" fill="#10b981"/>
  <path d="M42 44 Q46 32 52 30 Q49 38 46 44 Z" fill="#34d399"/>
  <path d="M38 44 Q42 36 46 35 Q44 41 41 44 Z" fill="#10b981"/>
</svg>
`.trim();

  /** 旧遺跡・可憐な野の花の咲く草地 */
  public static readonly FOREST_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#064e3b"/>
  <path d="M4 8 Q32 2 58 10 Q62 36 52 56 Q28 62 8 50 Z" fill="#047857"/>
  <path d="M16 46 Q20 36 24 34 Q22 42 20 46 Z" fill="#34d399"/>
  <!-- 黄色い小花 -->
  <circle cx="44" cy="22" r="3" fill="#fef08a"/>
  <circle cx="44" cy="22" r="1.3" fill="#f59e0b"/>
  <!-- 白い小花 -->
  <circle cx="24" cy="20" r="2.5" fill="#f8fafc"/>
  <circle cx="24" cy="20" r="1" fill="#fbbf24"/>
</svg>
`.trim();

  /** 旧遺跡・石畳が埋もれた草地 */
  public static readonly FOREST_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#064e3b"/>
  <!-- 埋もれた古代石畳 -->
  <rect x="14" y="14" width="36" height="36" rx="4" fill="#334155" stroke="#064e3b" stroke-width="2"/>
  <rect x="18" y="18" width="28" height="2" fill="#475569" opacity="0.7"/>
  <!-- 石畳を覆う草 -->
  <path d="M8 30 Q18 26 24 32 Q20 38 12 36 Z" fill="#047857"/>
  <path d="M12 36 Q16 28 20 26 Q18 33 15 36 Z" fill="#34d399"/>
  <path d="M40 42 Q48 38 54 44 Q50 48 42 46 Z" fill="#047857"/>
  <path d="M44 45 Q48 37 52 36 Q49 42 46 45 Z" fill="#34d399"/>
</svg>
`.trim();

  /** 旧遺跡・濃緑の苔絨毯 */
  public static readonly FOREST_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#064e3b"/>
  <ellipse cx="32" cy="32" rx="24" ry="18" fill="#047857"/>
  <ellipse cx="32" cy="32" rx="16" ry="10" fill="#059669"/>
  <circle cx="26" cy="28" r="4" fill="#10b981" opacity="0.6"/>
  <circle cx="38" cy="34" r="5" fill="#10b981" opacity="0.6"/>
</svg>
`.trim();

  /** 旧遺跡・ツタが絡む古代壁1 */
  public static readonly FOREST_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#166534" stroke="#052e16" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#22c55e" stroke-width="1"/>
  <rect x="0" y="18" width="64" height="46" fill="#14532d" stroke="#052e16" stroke-width="1.5"/>
  <rect x="4" y="22" width="26" height="18" rx="2" fill="#1e293b" opacity="0.6"/>
  <rect x="34" y="22" width="26" height="18" rx="2" fill="#1e293b" opacity="0.6"/>
  <!-- 這い上がる緑のツタ -->
  <path d="M8 64 Q12 44 24 36 Q34 28 32 18" stroke="#15803d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="16" cy="48" r="3" fill="#22c55e"/>
  <circle cx="26" cy="38" r="3.5" fill="#4ade80"/>
  <circle cx="34" cy="26" r="3" fill="#22c55e"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#052e16" stroke-width="2"/>
</svg>
`.trim();

  /** 旧遺跡・苔むした巨石壁2 */
  public static readonly FOREST_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#166534" stroke="#052e16" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#14532d" stroke="#052e16" stroke-width="1.5"/>
  <!-- 密生した苔パッチ -->
  <ellipse cx="20" cy="28" rx="14" ry="7" fill="#15803d"/>
  <ellipse cx="44" cy="46" rx="16" ry="8" fill="#15803d"/>
  <circle cx="22" cy="28" r="3" fill="#4ade80"/>
  <circle cx="46" cy="46" r="3.5" fill="#4ade80"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#052e16" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 4. 地下水流と清流洞 (RIVER) SVG 定義
  // ==========================================

  /** 清流洞・濡れた暗青岩盤 */
  public static readonly RIVER_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a"/>
  <path d="M4 6 Q32 2 58 8 Q62 34 54 56 Q28 62 6 52 Z" fill="#172554"/>
  <!-- 濡れた光沢ハイライト -->
  <path d="M12 18 Q28 14 44 20" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.6"/>
  <circle cx="22" cy="38" r="1.5" fill="#67e8f9"/>
</svg>
`.trim();

  /** 清流洞・水たまりのある湿岩 */
  public static readonly RIVER_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a"/>
  <path d="M4 6 Q32 2 58 8 Q62 34 54 56 Q28 62 6 52 Z" fill="#172554"/>
  <!-- 小さな水たまり -->
  <ellipse cx="36" cy="36" rx="16" ry="9" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2" opacity="0.8"/>
  <ellipse cx="34" cy="34" rx="10" ry="4" fill="#38bdf8" opacity="0.5"/>
</svg>
`.trim();

  /** 清流洞・川原の玉石 */
  public static readonly RIVER_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a"/>
  <path d="M4 6 Q32 2 58 8 Q62 34 54 56 Q28 62 6 52 Z" fill="#172554"/>
  <!-- 丸石の集合 -->
  <ellipse cx="20" cy="22" rx="8" ry="6" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
  <ellipse cx="40" cy="26" rx="9" ry="7" fill="#334155" stroke="#0f172a" stroke-width="1"/>
  <ellipse cx="30" cy="44" rx="11" ry="8" fill="#1e3a8a" stroke="#0f172a" stroke-width="1"/>
  <ellipse cx="48" cy="46" rx="7" ry="5" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
</svg>
`.trim();

  /** 清流洞・濡れた青敷石 */
  public static readonly RIVER_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a"/>
  <rect x="4" y="4" width="26" height="26" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="34" y="4" width="26" height="26" rx="3" fill="#172554" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="4" y="34" width="26" height="26" rx="3" fill="#172554" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="34" y="34" width="26" height="26" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 水滴 -->
  <circle cx="28" cy="18" r="1.5" fill="#38bdf8"/>
  <circle cx="48" cy="48" r="1.5" fill="#38bdf8"/>
</svg>
`.trim();

  /** 清流洞・水滴が滴る岩壁1 */
  public static readonly RIVER_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#60a5fa" stroke-width="1" opacity="0.6"/>
  <rect x="0" y="18" width="64" height="46" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <!-- 滴る水滴ライン -->
  <line x1="16" y1="22" x2="16" y2="52" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/>
  <circle cx="16" cy="54" r="1.5" fill="#38bdf8"/>
  <line x1="42" y1="26" x2="42" y2="48" stroke="#38bdf8" stroke-width="1.5" opacity="0.6"/>
  <circle cx="42" cy="50" r="1.5" fill="#38bdf8"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#0f172a" stroke-width="2"/>
</svg>
`.trim();

  /** 清流洞・暗青色の削岩壁2 */
  public static readonly RIVER_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#172554" stroke="#0f172a" stroke-width="1.5"/>
  <polygon points="4,22 30,20 28,42 6,40" fill="#1e293b"/>
  <polygon points="34,22 60,24 58,44 32,42" fill="#1e293b"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#0f172a" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 5. 水没せし蒼玉の地下湖 (LAKE) SVG 定義
  // ==========================================

  /** 地下湖・神殿モザイクタイル */
  public static readonly LAKE_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#041c26"/>
  <!-- モザイクタイル枠 -->
  <rect x="3" y="3" width="58" height="58" rx="4" fill="#083344" stroke="#0e7490" stroke-width="1.5"/>
  <rect x="14" y="14" width="36" height="36" rx="2" fill="#0e7490" stroke="#155e75" stroke-width="1.2"/>
  <rect x="24" y="24" width="16" height="16" fill="#06b6d4" opacity="0.6"/>
</svg>
`.trim();

  /** 地下湖・青い水晶片散布タイル */
  public static readonly LAKE_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#041c26"/>
  <rect x="3" y="3" width="58" height="58" rx="4" fill="#083344" stroke="#0e7490" stroke-width="1.5"/>
  <!-- 散らばる青い水晶破片 -->
  <polygon points="20,24 24,18 28,24 24,30" fill="#38bdf8" stroke="#e0f2fe" stroke-width="0.8"/>
  <polygon points="44,40 47,34 50,40 47,46" fill="#06b6d4" stroke="#e0f2fe" stroke-width="0.8"/>
  <polygon points="40,16 42,12 44,16 42,20" fill="#67e8f9"/>
</svg>
`.trim();

  /** 地下湖・古代ルーン模様タイル */
  public static readonly LAKE_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#041c26"/>
  <rect x="3" y="3" width="58" height="58" rx="4" fill="#083344" stroke="#0e7490" stroke-width="1.5"/>
  <!-- 神秘的な円形ルーンサークル -->
  <circle cx="32" cy="32" r="18" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="4,2" opacity="0.8"/>
  <polygon points="32,18 44,38 20,38" fill="none" stroke="#22d3ee" stroke-width="1.2" opacity="0.7"/>
</svg>
`.trim();

  /** 地下湖・沈んだ石段タイル */
  public static readonly LAKE_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#041c26"/>
  <rect x="3" y="3" width="58" height="58" rx="4" fill="#083344" stroke="#0e7490" stroke-width="1.5"/>
  <line x1="3" y1="22" x2="61" y2="22" stroke="#0e7490" stroke-width="1.5"/>
  <line x1="3" y1="42" x2="61" y2="42" stroke="#0e7490" stroke-width="1.5"/>
  <rect x="4" y="23" width="56" height="2" fill="#22d3ee" opacity="0.4"/>
</svg>
`.trim();

  /** 地下湖・水晶鉱脈が埋まる神殿壁1 */
  public static readonly LAKE_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#155e75" stroke="#083344" stroke-width="1.5"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#22d3ee" stroke-width="1" opacity="0.7"/>
  <rect x="0" y="18" width="64" height="46" fill="#0e7490" stroke="#083344" stroke-width="1.5"/>
  <!-- 蒼く輝く水晶クラスター -->
  <polygon points="26,38 32,24 38,38 32,46" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.5"/>
  <polygon points="20,42 26,32 30,42 24,48" fill="#06b6d4" stroke="#cffafe" stroke-width="1.2"/>
  <polygon points="34,44 40,30 46,42 40,50" fill="#0284c7" stroke="#38bdf8" stroke-width="1.2"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#083344" stroke-width="2"/>
</svg>
`.trim();

  /** 地下湖・ルーン刻印神殿壁2 */
  public static readonly LAKE_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#155e75" stroke="#083344" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#083344" stroke="#083344" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="14" fill="none" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="32" y1="32" x2="32" y2="52" stroke="#22d3ee" stroke-width="1.5"/>
  <line x1="22" y1="42" x2="42" y2="42" stroke="#22d3ee" stroke-width="1.5"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#083344" stroke-width="2"/>
</svg>
`.trim();

  /**
   * 全タイルスプライトの事前ロードを開始します。
   *
   * @returns 全画像ロード完了を示すPromise
   */
  public static init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    const spriteMap: Record<TileSpriteId, string> = {
      // STONE
      tile_stone_floor_1: this.STONE_FLOOR_1_SVG,
      tile_stone_floor_2: this.STONE_FLOOR_2_SVG,
      tile_stone_floor_3: this.STONE_FLOOR_3_SVG,
      tile_stone_floor_4: this.STONE_FLOOR_4_SVG,
      tile_stone_wall_1: this.STONE_WALL_1_SVG,
      tile_stone_wall_2: this.STONE_WALL_2_SVG,
      // EARTH
      tile_earth_floor_1: this.EARTH_FLOOR_1_SVG,
      tile_earth_floor_2: this.EARTH_FLOOR_2_SVG,
      tile_earth_floor_3: this.EARTH_FLOOR_3_SVG,
      tile_earth_floor_4: this.EARTH_FLOOR_4_SVG,
      tile_earth_wall_1: this.EARTH_WALL_1_SVG,
      tile_earth_wall_2: this.EARTH_WALL_2_SVG,
      // FOREST
      tile_forest_floor_1: this.FOREST_FLOOR_1_SVG,
      tile_forest_floor_2: this.FOREST_FLOOR_2_SVG,
      tile_forest_floor_3: this.FOREST_FLOOR_3_SVG,
      tile_forest_floor_4: this.FOREST_FLOOR_4_SVG,
      tile_forest_wall_1: this.FOREST_WALL_1_SVG,
      tile_forest_wall_2: this.FOREST_WALL_2_SVG,
      // RIVER
      tile_river_floor_1: this.RIVER_FLOOR_1_SVG,
      tile_river_floor_2: this.RIVER_FLOOR_2_SVG,
      tile_river_floor_3: this.RIVER_FLOOR_3_SVG,
      tile_river_floor_4: this.RIVER_FLOOR_4_SVG,
      tile_river_wall_1: this.RIVER_WALL_1_SVG,
      tile_river_wall_2: this.RIVER_WALL_2_SVG,
      // LAKE
      tile_lake_floor_1: this.LAKE_FLOOR_1_SVG,
      tile_lake_floor_2: this.LAKE_FLOOR_2_SVG,
      tile_lake_floor_3: this.LAKE_FLOOR_3_SVG,
      tile_lake_floor_4: this.LAKE_FLOOR_4_SVG,
      tile_lake_wall_1: this.LAKE_WALL_1_SVG,
      tile_lake_wall_2: this.LAKE_WALL_2_SVG,
    };

    const promises: Promise<void>[] = [];

    for (const [key, svg] of Object.entries(spriteMap)) {
      const id = key as TileSpriteId;
      const img = new Image();
      const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

      const p = new Promise<void>((resolve) => {
        img.onload = () => {
          this.imageCache.set(id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load tile sprite: ${id}`);
          resolve();
        };
      });

      img.src = svgBase64;
      promises.push(p);
    }

    this.readyPromise = Promise.all(promises).then(() => {});
    return this.readyPromise;
  }

  /**
   * 指定したタイルスプライト画像を取得します。
   *
   * @param id - タイルスプライトID
   * @returns キャッシュされたHTMLImageElement
   */
  public static get(id: TileSpriteId): HTMLImageElement | undefined {
    return this.imageCache.get(id);
  }

  /**
   * バイオームおよびグリッド座標ハッシュから、自然な床タイルスプライトを取得します。
   *
   * @param biome - 現在のバイオーム
   * @param x - グリッドX座標
   * @param y - グリッドY座標
   * @returns 適合する床タイルのHTMLImageElement
   */
  public static getFloorSprite(
    biome: BiomeType,
    x: number,
    y: number
  ): HTMLImageElement | undefined {
    // 座標ハッシュ（0〜3の4バリエーション）
    const hash = Math.abs((x * 73856093 ^ y * 19349663) % 4) + 1;
    const biomeLower = biome.toLowerCase();
    const id = `tile_${biomeLower}_floor_${hash}` as TileSpriteId;
    return this.imageCache.get(id);
  }

  /**
   * バイオームおよびグリッド座標ハッシュから、自然な壁タイルスプライトを取得します。
   *
   * @param biome - 現在のバイオーム
   * @param x - グリッドX座標
   * @param y - グリッドY座標
   * @returns 適合する壁タイルのHTMLImageElement
   */
  public static getWallSprite(
    biome: BiomeType,
    x: number,
    y: number
  ): HTMLImageElement | undefined {
    // 座標ハッシュ（0〜1の2バリエーション）
    const hash = Math.abs((x * 374761393 ^ y * 668265263) % 2) + 1;
    const biomeLower = biome.toLowerCase();
    const id = `tile_${biomeLower}_wall_${hash}` as TileSpriteId;
    return this.imageCache.get(id);
  }
}
