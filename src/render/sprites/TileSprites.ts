/**
 * @file TileSprites.ts
 * @description ダンジョン各バイオーム（石・赤土・草木遺跡・水流・地下湖）の床および壁の
 * 高品質ベクターSVGグラフィック（バリエーション計30種）を定義・キャッシュ・提供するクラス。
 * 壁と床の明度・色相コントラストを極限まで高め、歩行可能マスと遮蔽壁が一目で判別できるよう設計されています。
 */

import { BiomeType, TileType } from '../../core/types';

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
  | 'tile_lake_wall_2'
  // 6. 白銀の雪原回廊 (SNOW)
  | 'tile_snow_floor_1'
  | 'tile_snow_floor_2'
  | 'tile_snow_floor_3'
  | 'tile_snow_floor_4'
  | 'tile_snow_wall_1'
  | 'tile_snow_wall_2'
  // 7. 永久凍土と蒼氷窟 (ICE)
  | 'tile_ice_floor_1'
  | 'tile_ice_floor_2'
  | 'tile_ice_floor_3'
  | 'tile_ice_floor_4'
  | 'tile_ice_wall_1'
  | 'tile_ice_wall_2'
  // 8. 泥濘の湿地帯 (SWAMP)
  | 'tile_swamp_floor_1'
  | 'tile_swamp_floor_2'
  | 'tile_swamp_floor_3'
  | 'tile_swamp_floor_4'
  | 'tile_swamp_wall_1'
  | 'tile_swamp_wall_2'
  // 9. 腐蝕の毒沼窟 (TOXIC)
  | 'tile_toxic_floor_1'
  | 'tile_toxic_floor_2'
  | 'tile_toxic_floor_3'
  | 'tile_toxic_floor_4'
  | 'tile_toxic_wall_1'
  | 'tile_toxic_wall_2'
  // 10. 古代真鍮の機巧回廊 (MECHA)
  | 'tile_mecha_floor_1'
  | 'tile_mecha_floor_2'
  | 'tile_mecha_floor_3'
  | 'tile_mecha_floor_4'
  | 'tile_mecha_wall_1'
  | 'tile_mecha_wall_2'
  // 11. 大海原の孤島迷宮 (ISLAND)
  | 'tile_island_floor_1'
  | 'tile_island_floor_2'
  | 'tile_island_floor_3'
  | 'tile_island_floor_4'
  | 'tile_island_wall_1'
  | 'tile_island_wall_2'
  // 木の橋 (BRIDGE: 縦連結・横連結・交差点・壊れかけ)
  | 'tile_bridge_vertical'
  | 'tile_bridge_horizontal'
  | 'tile_bridge_cross'
  | 'tile_bridge_broken'
  | 'tile_bridge_1'
  | 'tile_bridge_2'
  // 特殊環境ギミック床 (GIMMICKS)
  | 'tile_gimmick_ice'
  | 'tile_gimmick_mud'
  | 'tile_gimmick_poison';

/**
 * ダンジョンの床・壁のベクターグラフィックスプライト管理クラス。
 */
export class TileSprites {
  /**
   * キャッシュされたタイルスプライト画像マップ。
   * - 想定値: Map<TileSpriteId, HTMLImageElement>
   * - 初期値: 空のMap
   */
  private static imageCache: Map<TileSpriteId, HTMLImageElement> = new Map();

  /**
   * 全タイルスプライトのロード完了を監視するPromise。
   * - 想定値: Promise<void> または未初期化時 `null`
   * - 初期値: `null`
   */
  private static readyPromise: Promise<void> | null = null;

  // ==========================================
  // 1. 石造りの迷宮 (STONE) SVG 定義
  // 床: 明るい灰青色の開放的な石畳 (#334155〜#475569)
  // 壁: 重厚な漆黒に近いダークストーンレンガ (#090d16〜#111827)
  // ==========================================

  /** 石の迷宮・通常石畳 */
  public static readonly STONE_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#253346"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#586d88" opacity="0.8"/>
  <circle cx="38" cy="29" r="1.5" fill="#182332"/>
  <circle cx="26" cy="31" r="1" fill="#182332"/>
</svg>
`.trim();

  /** 石の迷宮・ひび割れ古代石畳 */
  public static readonly STONE_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#253346"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#586d88" opacity="0.8"/>
  <path d="M10 8 L18 16 L15 22 L24 25" stroke="#182332" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M18 16 L22 13" stroke="#182332" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M42 42 L48 48 L46 56" stroke="#182332" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

  /** 石の迷宮・小石散乱石畳 */
  public static readonly STONE_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#253346"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#586d88" opacity="0.8"/>
  <ellipse cx="14" cy="48" rx="3" ry="2" fill="#94a3b8" stroke="#182332" stroke-width="1"/>
  <ellipse cx="20" cy="52" rx="2" ry="1.5" fill="#64748b" stroke="#182332" stroke-width="0.8"/>
  <ellipse cx="52" cy="14" rx="2.5" ry="1.8" fill="#94a3b8" stroke="#182332" stroke-width="1"/>
</svg>
`.trim();

  /** 石の迷宮・苔むした石畳 */
  public static readonly STONE_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#253346"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="4" width="32" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="43" y="4" width="17" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="4" y="33" width="20" height="2" fill="#586d88" opacity="0.8"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#3e4f65" stroke="#182332" stroke-width="1.5"/>
  <rect x="31" y="33" width="29" height="2" fill="#586d88" opacity="0.8"/>
  <path d="M26 27 Q32 28 38 28 Q34 32 30 33 Z" fill="#059669" opacity="0.9"/>
  <circle cx="28" cy="29" r="1.5" fill="#34d399"/>
  <circle cx="34" cy="30" r="1.8" fill="#34d399"/>
  <path d="M50 28 Q54 30 58 29" stroke="#059669" stroke-width="2" fill="none"/>
</svg>
`.trim();

  /** 石の迷宮・重厚な黒石レンガ壁 */
  public static readonly STONE_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#334155" stroke="#020617" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#475569" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#090d16" stroke="#020617" stroke-width="2"/>
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="4" y="22" width="24" height="2" fill="#243247" opacity="0.8"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="35" y="22" width="25" height="2" fill="#243247" opacity="0.8"/>
  <rect x="2" y="42" width="16" height="20" rx="2" fill="#0f1724" stroke="#020617" stroke-width="1.6"/>
  <rect x="20" y="42" width="28" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="22" y="44" width="24" height="2" fill="#243247" opacity="0.8"/>
  <rect x="50" y="42" width="12" height="20" rx="2" fill="#0f1724" stroke="#020617" stroke-width="1.6"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 石の迷宮・亀裂入り黒石レンガ壁 */
  public static readonly STONE_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#334155" stroke="#020617" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#475569" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#090d16" stroke="#020617" stroke-width="2"/>
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="2" y="42" width="16" height="20" rx="2" fill="#0f1724" stroke="#020617" stroke-width="1.6"/>
  <rect x="20" y="42" width="28" height="20" rx="2" fill="#131b2a" stroke="#020617" stroke-width="1.6"/>
  <rect x="50" y="42" width="12" height="20" rx="2" fill="#0f1724" stroke="#020617" stroke-width="1.6"/>
  <path d="M38 24 L44 32 L40 38 L48 44 L45 52" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 2. 岩と赤土の洞窟 (EARTH) SVG 定義
  // 床: 明るい赤褐色の土と砂利 (#542c22〜#733d30)
  // 壁: 重々しく黒ずんだ火山黒岩壁 (#120704〜#1c0b06)
  // ==========================================

  /** 赤土の洞窟・通常土面 */
  public static readonly EARTH_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#4d271e"/>
  <path d="M4 8 Q24 4 48 10 Q60 28 54 48 Q32 60 12 52 Q2 32 4 8 Z" fill="#6d382c" stroke="#321610" stroke-width="1.2"/>
  <ellipse cx="28" cy="32" rx="18" ry="12" fill="#884838" opacity="0.6"/>
  <circle cx="18" cy="22" r="1.5" fill="#321610"/>
  <circle cx="44" cy="38" r="1.8" fill="#321610"/>
</svg>
`.trim();

  /** 赤土の洞窟・砂利と小岩 */
  public static readonly EARTH_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#4d271e"/>
  <path d="M6 12 Q30 6 52 14 Q58 36 50 52 Q26 58 10 48 Z" fill="#6d382c"/>
  <polygon points="18,22 24,18 26,24 20,26" fill="#a35442" stroke="#321610" stroke-width="1"/>
  <polygon points="42,38 48,34 50,42 44,44" fill="#b5604c" stroke="#321610" stroke-width="1"/>
  <circle cx="34" cy="20" r="1.8" fill="#c2634e"/>
  <circle cx="14" cy="44" r="2" fill="#321610"/>
</svg>
`.trim();

  /** 赤土の洞窟・乾いた地割れ */
  public static readonly EARTH_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#4d271e"/>
  <path d="M4 6 Q32 4 56 12 Q60 38 48 56 Q22 60 8 46 Z" fill="#6d382c"/>
  <path d="M12 28 L24 26 L30 34 L42 30 L52 38" stroke="#250f0a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M30 34 L28 46 L34 52" stroke="#250f0a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M24 26 L22 14" stroke="#250f0a" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

  /** 赤土の洞窟・硬質岩盤露出 */
  public static readonly EARTH_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#4d271e"/>
  <path d="M8 8 L48 6 L56 32 L46 54 L12 50 Z" fill="#6d382c"/>
  <polygon points="20,16 44,14 50,34 38,44 18,36" fill="#834435" stroke="#321610" stroke-width="1.5"/>
  <line x1="22" y1="18" x2="42" y2="16" stroke="#b5604c" stroke-width="1.5"/>
</svg>
`.trim();

  /** 赤土の洞窟・荒削り暗黒岩壁1 */
  public static readonly EARTH_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="0,0 64,0 64,18 0,18" fill="#451a03" stroke="#0c0502" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#6d2e08" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#120704"/>
  <polygon points="4,22 28,20 34,36 12,40" fill="#200d07" stroke="#0c0502" stroke-width="1.5"/>
  <polygon points="34,20 60,22 56,38 32,36" fill="#180a05" stroke="#0c0502" stroke-width="1.5"/>
  <polygon points="8,42 36,38 32,60 4,58" fill="#180a05" stroke="#0c0502" stroke-width="1.5"/>
  <polygon points="36,40 60,38 58,58 32,60" fill="#200d07" stroke="#0c0502" stroke-width="1.5"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 赤土の洞窟・断層暗黒岩壁2 */
  public static readonly EARTH_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="0,0 64,0 64,18 0,18" fill="#451a03" stroke="#0c0502" stroke-width="2"/>
  <rect x="0" y="18" width="64" height="46" fill="#120704"/>
  <path d="M0 26 Q32 32 64 24" stroke="#000000" stroke-width="2.5" fill="none"/>
  <path d="M0 40 Q32 46 64 38" stroke="#000000" stroke-width="2.5" fill="none"/>
  <path d="M0 54 Q32 58 64 52" stroke="#000000" stroke-width="2.5" fill="none"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 3. 草木と旧遺跡 (FOREST) SVG 定義
  // 床: 鮮やかな草原・可憐な野の花 (#166534〜#22c55e)
  // 壁: 暗い古代遺跡の深緑巨石壁 (#051a0e〜#092614)
  // ==========================================

  /** 旧遺跡・生い茂る草むら */
  public static readonly FOREST_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#14532d"/>
  <path d="M4 8 Q32 2 58 10 Q62 36 52 56 Q28 62 8 50 Z" fill="#15803d"/>
  <path d="M14 26 Q18 16 22 14 Q20 22 18 26 Z" fill="#4ade80"/>
  <path d="M18 26 Q24 18 28 17 Q25 23 21 26 Z" fill="#22c55e"/>
  <path d="M42 44 Q46 32 52 30 Q49 38 46 44 Z" fill="#4ade80"/>
  <path d="M38 44 Q42 36 46 35 Q44 41 41 44 Z" fill="#22c55e"/>
</svg>
`.trim();

  /** 旧遺跡・可憐な野の花の咲く草地 */
  public static readonly FOREST_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#14532d"/>
  <path d="M4 8 Q32 2 58 10 Q62 36 52 56 Q28 62 8 50 Z" fill="#15803d"/>
  <path d="M16 46 Q20 36 24 34 Q22 42 20 46 Z" fill="#4ade80"/>
  <circle cx="44" cy="22" r="3.5" fill="#fef08a"/>
  <circle cx="44" cy="22" r="1.5" fill="#f59e0b"/>
  <circle cx="24" cy="20" r="3" fill="#f8fafc"/>
  <circle cx="24" cy="20" r="1.2" fill="#fbbf24"/>
</svg>
`.trim();

  /** 旧遺跡・石畳が埋もれた草地 */
  public static readonly FOREST_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#14532d"/>
  <rect x="12" y="12" width="22" height="18" rx="2" fill="#334155" stroke="#052e16" stroke-width="1.5"/>
  <rect x="36" y="24" width="20" height="26" rx="2" fill="#334155" stroke="#052e16" stroke-width="1.5"/>
  <path d="M4 4 Q20 12 16 32 Q2 44 8 60 Q34 56 46 48 Q60 38 60 12 Z" fill="#16a34a" opacity="0.85"/>
  <path d="M28 34 Q32 24 36 22" stroke="#86efac" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
`.trim();

  /** 旧遺跡・苔絨毯 */
  public static readonly FOREST_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#14532d"/>
  <circle cx="20" cy="24" r="14" fill="#16a34a"/>
  <circle cx="44" cy="40" r="16" fill="#15803d"/>
  <circle cx="22" cy="46" r="10" fill="#16a34a"/>
  <circle cx="18" cy="22" r="2" fill="#86efac"/>
  <circle cx="46" cy="38" r="2.5" fill="#86efac"/>
  <circle cx="40" cy="18" r="1.8" fill="#4ade80"/>
</svg>
`.trim();

  /** 旧遺跡・ツタが絡む暗黒古代石壁 */
  public static readonly FOREST_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#1e3a29" stroke="#021408" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#2d573d" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#051a0e" stroke="#021408" stroke-width="2"/>
  <rect x="2" y="20" width="30" height="20" rx="2" fill="#0c2916" stroke="#021408" stroke-width="1.6"/>
  <rect x="34" y="20" width="28" height="20" rx="2" fill="#0c2916" stroke="#021408" stroke-width="1.6"/>
  <rect x="2" y="42" width="22" height="20" rx="2" fill="#082012" stroke="#021408" stroke-width="1.6"/>
  <rect x="26" y="42" width="36" height="20" rx="2" fill="#0c2916" stroke="#021408" stroke-width="1.6"/>
  <path d="M12 18 Q16 28 10 38 Q18 46 14 62" stroke="#16a34a" stroke-width="2.2" fill="none"/>
  <circle cx="14" cy="26" r="2" fill="#4ade80"/>
  <circle cx="11" cy="40" r="2" fill="#4ade80"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 旧遺跡・苔むした暗黒巨石壁 */
  public static readonly FOREST_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#1e3a29" stroke="#021408" stroke-width="2"/>
  <rect x="0" y="18" width="64" height="46" fill="#051a0e" stroke="#021408" stroke-width="2"/>
  <rect x="4" y="22" width="56" height="38" rx="4" fill="#0c2916" stroke="#021408" stroke-width="1.8"/>
  <path d="M6 24 Q30 28 58 24 Q52 36 28 32 Q12 36 6 24 Z" fill="#15803d" opacity="0.8"/>
  <circle cx="20" cy="44" r="3" fill="#22c55e"/>
  <circle cx="42" cy="46" r="2.5" fill="#22c55e"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 4. 地下水流と清流洞 (RIVER) SVG 定義
  // 床: 水分を反射する青色スレート敷石 (#1e3a8a〜#3b82f6)
  // 壁: 濡れた黒曜石のような濃紺暗岩 (#070c16〜#0c1322)
  // ==========================================

  /** 地下水流・濡れた滑らかな岩盤 */
  public static readonly RIVER_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1d3557"/>
  <path d="M4 6 Q32 2 60 8 Q62 36 50 56 Q24 62 6 52 Z" fill="#2b4c7e"/>
  <ellipse cx="26" cy="24" rx="14" ry="6" fill="#457b9d" opacity="0.7"/>
  <line x1="16" y1="24" x2="36" y2="24" stroke="#a8dadc" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`.trim();

  /** 地下水流・水たまりのある湿岩 */
  public static readonly RIVER_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1d3557"/>
  <ellipse cx="32" cy="32" rx="24" ry="14" fill="#0284c7" stroke="#0c4a6e" stroke-width="1.5"/>
  <ellipse cx="28" cy="30" rx="16" ry="7" fill="#38bdf8" opacity="0.6"/>
  <line x1="20" y1="30" x2="36" y2="30" stroke="#f0f9ff" stroke-width="1.5" stroke-linecap="round"/>
</svg>
`.trim();

  /** 地下水流・川原の玉石 */
  public static readonly RIVER_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1d3557"/>
  <ellipse cx="18" cy="18" rx="12" ry="9" fill="#2b4c7e" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="44" cy="22" rx="14" ry="11" fill="#457b9d" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="24" cy="44" rx="15" ry="10" fill="#457b9d" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="50" cy="46" rx="10" ry="8" fill="#2b4c7e" stroke="#0f172a" stroke-width="1.2"/>
</svg>
`.trim();

  /** 地下水流・濡れた青敷石 */
  public static readonly RIVER_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1d3557"/>
  <rect x="2" y="2" width="28" height="28" rx="2" fill="#2b4c7e" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="34" y="2" width="28" height="28" rx="2" fill="#3b6998" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="2" y="34" width="28" height="28" rx="2" fill="#3b6998" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="34" y="34" width="28" height="28" rx="2" fill="#2b4c7e" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="6" y1="4" x2="24" y2="4" stroke="#90b8de" stroke-width="1.5"/>
</svg>
`.trim();

  /** 地下水流・水滴滴る暗青削岩壁1 */
  public static readonly RIVER_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="0,0 64,0 64,18 0,18" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#334155" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#070c16"/>
  <polygon points="2,20 32,22 28,40 4,38" fill="#0e1726" stroke="#020617" stroke-width="1.6"/>
  <polygon points="34,20 62,22 58,40 30,38" fill="#0a121e" stroke="#020617" stroke-width="1.6"/>
  <polygon points="4,42 34,40 30,62 2,60" fill="#0a121e" stroke="#020617" stroke-width="1.6"/>
  <polygon points="32,42 60,40 62,62 28,60" fill="#0e1726" stroke="#020617" stroke-width="1.6"/>
  <circle cx="20" cy="30" r="2" fill="#38bdf8"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 地下水流・暗青色削岩壁2 */
  public static readonly RIVER_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <polygon points="0,0 64,0 64,18 0,18" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <rect x="0" y="18" width="64" height="46" fill="#070c16"/>
  <path d="M0 24 L24 28 L48 24 L64 30" stroke="#020617" stroke-width="2.2" fill="none"/>
  <path d="M0 42 L32 46 L64 40" stroke="#020617" stroke-width="2.2" fill="none"/>
  <circle cx="44" cy="34" r="1.8" fill="#38bdf8"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 5. 水没せし蒼玉の地下湖 (LAKE) SVG 定義
  // 床: 明るいアクアマリンのモザイク神殿タイル (#0e7490〜#22d3ee)
  // 壁: 深淵の暗黒神殿壁・水晶鉱脈 (#03161c〜#05232c)
  // ==========================================

  /** 地下湖・水没神殿モザイクタイル */
  public static readonly LAKE_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0e7490"/>
  <rect x="4" y="4" width="26" height="26" rx="2" fill="#0891b2" stroke="#064e3b" stroke-width="1.2"/>
  <rect x="34" y="4" width="26" height="26" rx="2" fill="#06b6d4" stroke="#064e3b" stroke-width="1.2"/>
  <rect x="4" y="34" width="26" height="26" rx="2" fill="#06b6d4" stroke="#064e3b" stroke-width="1.2"/>
  <rect x="34" y="34" width="26" height="26" rx="2" fill="#0891b2" stroke="#064e3b" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="5" fill="#67e8f9" stroke="#083344" stroke-width="1"/>
</svg>
`.trim();

  /** 地下湖・青水晶片散布タイル */
  public static readonly LAKE_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0e7490"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#0891b2" stroke="#083344" stroke-width="1.5"/>
  <polygon points="18,24 24,14 30,22 24,28" fill="#67e8f9" stroke="#083344" stroke-width="1"/>
  <polygon points="44,42 48,34 52,40 48,46" fill="#a5f3fc" stroke="#083344" stroke-width="1"/>
  <circle cx="42" cy="18" r="2" fill="#a5f3fc"/>
</svg>
`.trim();

  /** 地下湖・古代ルーン模様タイル */
  public static readonly LAKE_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0e7490"/>
  <rect x="2" y="2" width="60" height="60" rx="4" fill="#0891b2" stroke="#083344" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="16" fill="none" stroke="#67e8f9" stroke-width="1.5"/>
  <polygon points="32,16 46,40 18,40" fill="none" stroke="#a5f3fc" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="3" fill="#67e8f9"/>
</svg>
`.trim();

  /** 地下湖・沈んだ段差石段 */
  public static readonly LAKE_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0e7490"/>
  <rect x="4" y="6" width="56" height="14" rx="2" fill="#06b6d4" stroke="#083344" stroke-width="1.2"/>
  <rect x="4" y="25" width="56" height="14" rx="2" fill="#0891b2" stroke="#083344" stroke-width="1.2"/>
  <rect x="4" y="44" width="56" height="14" rx="2" fill="#0e7490" stroke="#083344" stroke-width="1.2"/>
  <line x1="8" y1="8" x2="52" y2="8" stroke="#a5f3fc" stroke-width="1.2"/>
</svg>
`.trim();

  /** 地下湖・水晶鉱脈が埋まる深海神殿壁1 */
  public static readonly LAKE_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#155e75" stroke="#021a24" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#22d3ee" stroke-width="1.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#03161c" stroke="#021a24" stroke-width="2"/>
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#06252f" stroke="#021a24" stroke-width="1.6"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#06252f" stroke="#021a24" stroke-width="1.6"/>
  <rect x="2" y="42" width="20" height="20" rx="2" fill="#041b22" stroke="#021a24" stroke-width="1.6"/>
  <rect x="24" y="42" width="38" height="20" rx="2" fill="#06252f" stroke="#021a24" stroke-width="1.6"/>
  <!-- 埋め込まれた水晶鉱脈 -->
  <polygon points="44,24 50,19 54,26 48,31" fill="#22d3ee" stroke="#a5f3fc" stroke-width="1"/>
  <polygon points="12,46 16,42 19,48 15,51" fill="#22d3ee" stroke="#a5f3fc" stroke-width="1"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 地下湖・ルーン刻印神殿壁2 */
  public static readonly LAKE_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#155e75" stroke="#021a24" stroke-width="2"/>
  <rect x="0" y="18" width="64" height="46" fill="#03161c" stroke="#021a24" stroke-width="2"/>
  <circle cx="32" cy="42" r="14" fill="none" stroke="#0891b2" stroke-width="1.8" stroke-dasharray="3,2"/>
  <line x1="32" y1="32" x2="32" y2="52" stroke="#22d3ee" stroke-width="1.6"/>
  <line x1="22" y1="42" x2="42" y2="42" stroke="#22d3ee" stroke-width="1.6"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 6. 白銀の雪原回廊 (SNOW) SVG 定義
  // 床: 純白・淡青の積雪敷石と雪の結晶 (#cbd5e1〜#f8fafc)
  // 壁: 冠雪した漆黒凍結巨石壁・氷柱 (#0a1120〜#1e293b)
  // ==========================================

  /** 雪原・積雪した古代石畳 */
  public static readonly SNOW_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#94a3b8"/>
  <rect x="2" y="2" width="36" height="26" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>
  <path d="M4 4 Q20 2 34 6 Q28 14 4 10 Z" fill="#ffffff" opacity="0.9"/>
  <rect x="41" y="2" width="21" height="26" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>
  <path d="M43 4 Q54 3 60 7" stroke="#ffffff" stroke-width="2" fill="none"/>
  <rect x="2" y="31" width="24" height="31" rx="3" fill="#cbd5e1" stroke="#64748b" stroke-width="1.2"/>
  <rect x="29" y="31" width="33" height="31" rx="3" fill="#f1f5f9" stroke="#64748b" stroke-width="1.2"/>
  <circle cx="44" cy="45" r="4" fill="#ffffff"/>
  <circle cx="14" cy="44" r="2.5" fill="#f8fafc"/>
</svg>
`.trim();

  /** 雪原・雪の結晶が刻まれた霜板 */
  public static readonly SNOW_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#94a3b8"/>
  <rect x="2" y="2" width="60" height="60" rx="4" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
  <path d="M4 4 L60 4 L56 12 L10 12 Z" fill="#ffffff"/>
  <!-- 雪の結晶レリーフ -->
  <line x1="32" y1="18" x2="32" y2="46" stroke="#38bdf8" stroke-width="2"/>
  <line x1="18" y1="32" x2="46" y2="32" stroke="#38bdf8" stroke-width="2"/>
  <line x1="22" y1="22" x2="42" y2="42" stroke="#38bdf8" stroke-width="1.5"/>
  <line x1="22" y1="42" x2="42" y2="22" stroke="#38bdf8" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="3" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/>
</svg>
`.trim();

  /** 雪原・踏み固められた足跡タイル */
  public static readonly SNOW_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#94a3b8"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>
  <!-- 足跡 -->
  <ellipse cx="24" cy="24" rx="4" ry="7" transform="rotate(-15 24 24)" fill="#64748b" opacity="0.65"/>
  <ellipse cx="23" cy="20" rx="3" ry="5" transform="rotate(-15 23 20)" fill="#475569" opacity="0.6"/>
  <ellipse cx="40" cy="40" rx="4" ry="7" transform="rotate(-10 40 40)" fill="#64748b" opacity="0.65"/>
  <ellipse cx="39" cy="36" rx="3" ry="5" transform="rotate(-10 39 36)" fill="#475569" opacity="0.6"/>
  <!-- 粉雪ハイライト -->
  <circle cx="16" cy="48" r="3" fill="#ffffff"/>
  <circle cx="50" cy="18" r="2" fill="#ffffff"/>
</svg>
`.trim();

  /** 雪原・凍結クラックと吹き溜まり */
  public static readonly SNOW_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#94a3b8"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2"/>
  <path d="M12 12 L26 24 L20 36 L38 44 L52 38" stroke="#38bdf8" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  <path d="M26 24 L34 20" stroke="#38bdf8" stroke-width="1.2" fill="none"/>
  <ellipse cx="48" cy="50" rx="10" ry="6" fill="#ffffff"/>
  <ellipse cx="14" cy="16" rx="8" ry="4" fill="#ffffff"/>
</svg>
`.trim();

  /** 雪原・冠雪した凍結暗岩壁1 */
  public static readonly SNOW_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 天板部と積雪 -->
  <rect x="0" y="0" width="64" height="18" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <path d="M0 0 L64 0 L64 8 Q48 14 32 8 Q16 13 0 7 Z" fill="#f8fafc"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <!-- 壁正面（漆黒に近い凍土岩） -->
  <rect x="0" y="18" width="64" height="46" fill="#080e1a"/>
  <rect x="2" y="20" width="28" height="20" rx="2" fill="#0f172a" stroke="#020617" stroke-width="1.5"/>
  <rect x="33" y="20" width="29" height="20" rx="2" fill="#0f172a" stroke="#020617" stroke-width="1.5"/>
  <rect x="2" y="42" width="22" height="20" rx="2" fill="#0a101d" stroke="#020617" stroke-width="1.5"/>
  <rect x="26" y="42" width="36" height="20" rx="2" fill="#0f172a" stroke="#020617" stroke-width="1.5"/>
  <!-- つらら -->
  <polygon points="12,18 14,26 16,18" fill="#bae6fd"/>
  <polygon points="38,18 40,29 43,18" fill="#e0f2fe"/>
  <polygon points="52,18 53,24 55,18" fill="#bae6fd"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 雪原・霜降る巨石岩壁2 */
  public static readonly SNOW_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <path d="M0 0 L64 0 L64 6 Q40 12 24 6 Q12 11 0 6 Z" fill="#f8fafc"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#080e1a"/>
  <path d="M0 24 L28 28 L64 22" stroke="#020617" stroke-width="2.2" fill="none"/>
  <path d="M0 44 L36 48 L64 42" stroke="#020617" stroke-width="2.2" fill="none"/>
  <line x1="20" y1="18" x2="22" y2="28" stroke="#bae6fd" stroke-width="1.5"/>
  <line x1="46" y1="18" x2="48" y2="30" stroke="#bae6fd" stroke-width="1.5"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 7. 永久凍土と蒼氷窟 (ICE) SVG 定義
  // 床: 透き通る蒼氷タイル・結晶反射 (#0284c7〜#7dd3fc)
  // 壁: 深淵の氷結暗黒岩・鋭利な氷晶 (#031326〜#0c4a6e)
  // ==========================================

  /** 蒼氷窟・透明氷ブロックタイル */
  public static readonly ICE_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0369a1"/>
  <rect x="3" y="3" width="27" height="27" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
  <polygon points="5,5 28,5 25,12 8,12" fill="#bae6fd" opacity="0.8"/>
  <rect x="34" y="3" width="27" height="27" rx="3" fill="#0ea5e9" stroke="#0284c7" stroke-width="1.5"/>
  <polygon points="36,5 59,5 56,12 39,12" fill="#bae6fd" opacity="0.8"/>
  <rect x="3" y="34" width="27" height="27" rx="3" fill="#0ea5e9" stroke="#0284c7" stroke-width="1.5"/>
  <rect x="34" y="34" width="27" height="27" rx="3" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="3" fill="#ffffff"/>
</svg>
`.trim();

  /** 蒼氷窟・氷晶クラックタイル */
  public static readonly ICE_FLOOR_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0369a1"/>
  <rect x="2" y="2" width="60" height="60" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
  <path d="M10 20 L28 32 L46 22 L56 38" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M28 32 L26 50 L38 58" stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M46 22 L52 14" stroke="#ffffff" stroke-width="1.5" fill="none"/>
  <polygon points="28,28 32,32 28,36 24,32" fill="#ffffff"/>
</svg>
`.trim();

  /** 蒼氷窟・六角氷晶レリーフタイル */
  public static readonly ICE_FLOOR_3_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0369a1"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#0284c7" stroke="#075985" stroke-width="1.5"/>
  <polygon points="32,10 50,21 50,43 32,54 14,43 14,21" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.8"/>
  <polygon points="32,18 43,25 43,39 32,46 21,39 21,25" fill="#7dd3fc" stroke="#ffffff" stroke-width="1.2"/>
  <circle cx="32" cy="32" r="4" fill="#ffffff"/>
</svg>
`.trim();

  /** 蒼氷窟・光屈折滑走氷床 */
  public static readonly ICE_FLOOR_4_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0284c7"/>
  <polygon points="2,2 62,2 48,32 2,16" fill="#38bdf8" opacity="0.9"/>
  <polygon points="62,2 62,62 32,48 48,32" fill="#0ea5e9" opacity="0.8"/>
  <polygon points="2,16 48,32 32,48 2,62" fill="#7dd3fc" opacity="0.85"/>
  <polygon points="2,62 32,48 62,62" fill="#38bdf8" opacity="0.9"/>
  <line x1="6" y1="6" x2="26" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  <circle cx="48" cy="20" r="2.5" fill="#ffffff"/>
</svg>
`.trim();

  /** 蒼氷窟・鋭利な氷晶巨壁1 */
  public static readonly ICE_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#0369a1" stroke="#021424" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#7dd3fc" stroke-width="2"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <!-- 正面（漆黒氷結岩） -->
  <rect x="0" y="18" width="64" height="46" fill="#021324"/>
  <polygon points="8,22 28,26 24,42 6,38" fill="#0c2d4a" stroke="#021424" stroke-width="1.5"/>
  <polygon points="34,22 58,26 54,42 32,38" fill="#0c2d4a" stroke="#021424" stroke-width="1.5"/>
  <polygon points="12,44 48,46 44,60 10,58" fill="#082138" stroke="#021424" stroke-width="1.5"/>
  <!-- 突き出た氷晶 -->
  <polygon points="26,24 32,18 36,25 30,30" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>
  <polygon points="48,42 54,36 58,44 52,48" fill="#7dd3fc" stroke="#ffffff" stroke-width="1"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  /** 蒼氷窟・水晶鉱脈氷壁2 */
  public static readonly ICE_WALL_2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="0" y="0" width="64" height="18" fill="#0369a1" stroke="#021424" stroke-width="2"/>
  <line x1="2" y1="2" x2="62" y2="2" stroke="#bae6fd" stroke-width="2"/>
  <line x1="0" y1="18" x2="64" y2="18" stroke="#000000" stroke-width="2.5"/>
  <rect x="0" y="18" width="64" height="46" fill="#021324"/>
  <line x1="8" y1="24" x2="56" y2="28" stroke="#0369a1" stroke-width="2"/>
  <line x1="4" y1="44" x2="60" y2="40" stroke="#0369a1" stroke-width="2"/>
  <polygon points="20,32 25,26 30,33 24,38" fill="#38bdf8" stroke="#ffffff" stroke-width="1"/>
  <line x1="0" y1="63" x2="64" y2="63" stroke="#000000" stroke-width="2"/>
</svg>
`.trim();

  // ==========================================
  // 木の橋 (BRIDGE) SVG 定義
  // 水流の上に架けられた厚板の桟橋（縦連結・横連結・交差点・壊れかけ）
  // ==========================================

  /** 木の橋・縦連結（南北に架かる橋: 横板4枚、左右に太い丸太支持梁とロープ） */
  public static readonly BRIDGE_VERTICAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 左右の頑丈な縦支持丸太梁・ロープ -->
  <rect x="2" y="0" width="6" height="64" fill="#451a03" stroke="#260e02" stroke-width="1.2"/>
  <rect x="56" y="0" width="6" height="64" fill="#451a03" stroke="#260e02" stroke-width="1.2"/>
  <line x1="5" y1="0" x2="5" y2="64" stroke="#78350f" stroke-width="1.5"/>
  <line x1="59" y1="0" x2="59" y2="64" stroke="#78350f" stroke-width="1.5"/>
  <!-- 横木板 4枚 -->
  <!-- 板1 -->
  <rect x="4" y="3" width="56" height="12" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <line x1="8" y1="6" x2="52" y2="6" stroke="#b45309" stroke-width="1.2"/>
  <path d="M14 9 Q28 8 46 9" stroke="#78350f" stroke-width="0.8" fill="none"/>
  <circle cx="8" cy="9" r="1.6" fill="#1e293b"/>
  <circle cx="56" cy="9" r="1.6" fill="#1e293b"/>
  <!-- 板2 -->
  <rect x="4" y="18" width="56" height="12" rx="2" fill="#b45309" stroke="#451a03" stroke-width="1.5"/>
  <line x1="8" y1="21" x2="52" y2="21" stroke="#d97706" stroke-width="1.2"/>
  <circle cx="8" cy="24" r="1.6" fill="#1e293b"/>
  <circle cx="56" cy="24" r="1.6" fill="#1e293b"/>
  <!-- 板3 -->
  <rect x="4" y="33" width="56" height="12" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <line x1="8" y1="36" x2="52" y2="36" stroke="#b45309" stroke-width="1.2"/>
  <circle cx="8" cy="39" r="1.6" fill="#1e293b"/>
  <circle cx="56" cy="39" r="1.6" fill="#1e293b"/>
  <!-- 板4 -->
  <rect x="4" y="48" width="56" height="12" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <line x1="8" y1="51" x2="52" y2="51" stroke="#92400e" stroke-width="1.2"/>
  <circle cx="8" cy="54" r="1.6" fill="#1e293b"/>
  <circle cx="56" cy="54" r="1.6" fill="#1e293b"/>
  <!-- 両端の固定ロープ巻き -->
  <line x1="4" y1="15" x2="8" y2="15" stroke="#d97706" stroke-width="2.5"/>
  <line x1="4" y1="30" x2="8" y2="30" stroke="#d97706" stroke-width="2.5"/>
  <line x1="4" y1="45" x2="8" y2="45" stroke="#d97706" stroke-width="2.5"/>
  <line x1="56" y1="15" x2="60" y2="15" stroke="#d97706" stroke-width="2.5"/>
  <line x1="56" y1="30" x2="60" y2="30" stroke="#d97706" stroke-width="2.5"/>
  <line x1="56" y1="45" x2="60" y2="45" stroke="#d97706" stroke-width="2.5"/>
</svg>
`.trim();

  /** 木の橋・横連結（東西に架かる橋: 縦板4枚、上下に太い丸太支持梁とロープ） */
  public static readonly BRIDGE_HORIZONTAL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 上下の頑丈な横支持丸太梁・ロープ -->
  <rect x="0" y="2" width="64" height="6" fill="#451a03" stroke="#260e02" stroke-width="1.2"/>
  <rect x="0" y="56" width="64" height="6" fill="#451a03" stroke="#260e02" stroke-width="1.2"/>
  <line x1="0" y1="5" x2="64" y2="5" stroke="#78350f" stroke-width="1.5"/>
  <line x1="0" y1="59" x2="64" y2="59" stroke="#78350f" stroke-width="1.5"/>
  <!-- 縦木板 4枚 -->
  <!-- 板1 -->
  <rect x="3" y="4" width="12" height="56" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <line x1="6" y1="8" x2="6" y2="52" stroke="#b45309" stroke-width="1.2"/>
  <circle cx="9" cy="8" r="1.6" fill="#1e293b"/>
  <circle cx="9" cy="56" r="1.6" fill="#1e293b"/>
  <!-- 板2 -->
  <rect x="18" y="4" width="12" height="56" rx="2" fill="#b45309" stroke="#451a03" stroke-width="1.5"/>
  <line x1="21" y1="8" x2="21" y2="52" stroke="#d97706" stroke-width="1.2"/>
  <circle cx="24" cy="8" r="1.6" fill="#1e293b"/>
  <circle cx="24" cy="56" r="1.6" fill="#1e293b"/>
  <!-- 板3 -->
  <rect x="33" y="4" width="12" height="56" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <line x1="36" y1="8" x2="36" y2="52" stroke="#b45309" stroke-width="1.2"/>
  <circle cx="39" cy="8" r="1.6" fill="#1e293b"/>
  <circle cx="39" cy="56" r="1.6" fill="#1e293b"/>
  <!-- 板4 -->
  <rect x="48" y="4" width="12" height="56" rx="2" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <line x1="51" y1="8" x2="51" y2="52" stroke="#92400e" stroke-width="1.2"/>
  <circle cx="54" cy="8" r="1.6" fill="#1e293b"/>
  <circle cx="54" cy="56" r="1.6" fill="#1e293b"/>
  <!-- 上下の固定ロープ巻き -->
  <line x1="15" y1="4" x2="15" y2="8" stroke="#d97706" stroke-width="2.5"/>
  <line x1="30" y1="4" x2="30" y2="8" stroke="#d97706" stroke-width="2.5"/>
  <line x1="45" y1="4" x2="45" y2="8" stroke="#d97706" stroke-width="2.5"/>
  <line x1="15" y1="56" x2="15" y2="60" stroke="#d97706" stroke-width="2.5"/>
  <line x1="30" y1="56" x2="30" y2="60" stroke="#d97706" stroke-width="2.5"/>
  <line x1="45" y1="56" x2="45" y2="60" stroke="#d97706" stroke-width="2.5"/>
</svg>
`.trim();

  /** 木の橋・交差点（十字・T字分岐: 中央組木構造、四隅補強柱、真鍮留め座金） */
  public static readonly BRIDGE_CROSS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 四隅の頑丈な親杭・角丸太 -->
  <rect x="1" y="1" width="10" height="10" rx="3" fill="#381a07" stroke="#1f0d04" stroke-width="1.5"/>
  <circle cx="6" cy="6" r="2" fill="#a16207"/>
  <rect x="53" y="1" width="10" height="10" rx="3" fill="#381a07" stroke="#1f0d04" stroke-width="1.5"/>
  <circle cx="58" cy="6" r="2" fill="#a16207"/>
  <rect x="1" y="53" width="10" height="10" rx="3" fill="#381a07" stroke="#1f0d04" stroke-width="1.5"/>
  <circle cx="6" cy="58" r="2" fill="#a16207"/>
  <rect x="53" y="53" width="10" height="10" rx="3" fill="#381a07" stroke="#1f0d04" stroke-width="1.5"/>
  <circle cx="58" cy="58" r="2" fill="#a16207"/>
  <!-- 外周の板敷き -->
  <rect x="12" y="2" width="40" height="14" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <rect x="12" y="48" width="40" height="14" rx="2" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <rect x="2" y="12" width="14" height="40" rx="2" fill="#b45309" stroke="#451a03" stroke-width="1.5"/>
  <rect x="48" y="12" width="14" height="40" rx="2" fill="#b45309" stroke="#451a03" stroke-width="1.5"/>
  <!-- 中央の交差大板 -->
  <rect x="14" y="14" width="36" height="36" rx="4" fill="#a16207" stroke="#451a03" stroke-width="2"/>
  <rect x="20" y="20" width="24" height="24" rx="3" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
  <!-- 中央補強座金・十字金具 -->
  <circle cx="32" cy="32" r="6" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <circle cx="32" cy="32" r="2" fill="#facc15"/>
  <line x1="22" y1="22" x2="42" y2="42" stroke="#d97706" stroke-width="1.5"/>
  <line x1="22" y1="42" x2="42" y2="22" stroke="#d97706" stroke-width="1.5"/>
</svg>
`.trim();

  /** 木の橋・壊れかけの老朽木橋（板が一部欠落して下の水面が見え、ヒビ割れ・傾き） */
  public static readonly BRIDGE_BROKEN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 露出した下の水面（川の深層水と水流波紋） -->
  <rect x="0" y="0" width="64" height="64" fill="#0369a1"/>
  <path d="M12 28 Q32 24 52 29" stroke="#38bdf8" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M16 38 Q36 42 48 37" stroke="#7dd3fc" stroke-width="1.5" fill="none" opacity="0.7"/>
  <!-- 左右のほつれかけた支持梁 -->
  <rect x="2" y="0" width="6" height="64" fill="#381a07" stroke="#1f0d04" stroke-width="1.2"/>
  <rect x="56" y="0" width="6" height="40" fill="#381a07" stroke="#1f0d04" stroke-width="1.2"/>
  <!-- ほつれたロープ -->
  <path d="M59 40 Q62 48 57 54" stroke="#d97706" stroke-width="2.5" fill="none"/>
  <!-- 残った老朽板1 (上部) -->
  <rect x="4" y="3" width="56" height="11" rx="1.5" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <path d="M18 5 L24 12 L20 14" stroke="#1f0d04" stroke-width="1.5" fill="none"/>
  <!-- 傾いた老朽板2 (中央上) -->
  <polygon points="4,18 58,16 56,27 4,30" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <line x1="8" y1="23" x2="48" y2="22" stroke="#b45309" stroke-width="1.2"/>
  <circle cx="8" cy="24" r="1.5" fill="#0f172a"/>
  <!-- ★中央部 (y=30〜46): 板が崩落して大きな穴が開いて水面が見えている！ -->
  <!-- 折れた板の残骸片 -->
  <polygon points="4,34 18,33 12,42 4,41" fill="#78350f" stroke="#381a07" stroke-width="1.5"/>
  <polygon points="48,36 58,35 56,43 44,42" fill="#78350f" stroke="#381a07" stroke-width="1.5"/>
  <!-- 残った老朽板4 (下部) -->
  <rect x="4" y="48" width="56" height="12" rx="1.5" fill="#5c2605" stroke="#381a07" stroke-width="1.5"/>
  <path d="M34 50 L42 58 L38 60" stroke="#1f0d04" stroke-width="1.5" fill="none"/>
  <circle cx="8" cy="54" r="1.5" fill="#0f172a"/>
  <circle cx="56" cy="54" r="1.5" fill="#0f172a"/>
</svg>
`.trim();

  /** 木の橋・厚板桟橋1 (後方互換用) */
  public static readonly BRIDGE_1_SVG = TileSprites.BRIDGE_VERTICAL_SVG;

  /** 木の橋・年季の入った古桟橋2 (後方互換用) */
  public static readonly BRIDGE_2_SVG = TileSprites.BRIDGE_HORIZONTAL_SVG;

  // ==========================================
  // 8. 泥濘の湿地帯 (SWAMP) SVG 定義
  // ==========================================
  public static readonly SWAMP_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1b281c"/>
  <circle cx="20" cy="22" r="14" fill="#243825" stroke="#121d13" stroke-width="1.5"/>
  <circle cx="46" cy="42" r="12" fill="#243825" stroke="#121d13" stroke-width="1.5"/>
  <ellipse cx="36" cy="18" rx="8" ry="4" fill="#15803d" opacity="0.4"/>
  <circle cx="48" cy="16" r="2.5" fill="#365314"/>
  <circle cx="16" cy="46" r="3" fill="#365314"/>
</svg>`.trim();

  public static readonly SWAMP_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0b140c"/>
  <rect x="2" y="2" width="60" height="28" rx="2" fill="#142316" stroke="#060c07" stroke-width="2"/>
  <rect x="2" y="34" width="60" height="28" rx="2" fill="#142316" stroke="#060c07" stroke-width="2"/>
  <path d="M10 4 Q14 18 10 30 Q16 42 12 58" stroke="#15803d" stroke-width="2" fill="none"/>
  <path d="M50 4 Q46 22 52 40 Q48 50 50 60" stroke="#15803d" stroke-width="1.8" fill="none"/>
</svg>`.trim();

  // ==========================================
  // 9. 腐蝕の毒沼窟 (TOXIC) SVG 定義
  // ==========================================
  public static readonly TOXIC_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#24142a"/>
  <polygon points="12,12 36,6 48,24 28,34" fill="#361a3f" stroke="#150a18" stroke-width="1.5"/>
  <polygon points="26,38 52,32 58,54 34,58" fill="#361a3f" stroke="#150a18" stroke-width="1.5"/>
  <path d="M14 28 Q24 26 34 36 Q42 30 52 38" stroke="#a855f7" stroke-width="1.2" fill="none" opacity="0.6"/>
  <circle cx="20" cy="50" r="3" fill="#9333ea" opacity="0.5"/>
</svg>`.trim();

  public static readonly TOXIC_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#100713"/>
  <rect x="2" y="2" width="60" height="28" rx="3" fill="#1e0c24" stroke="#08030a" stroke-width="2"/>
  <rect x="2" y="34" width="60" height="28" rx="3" fill="#1e0c24" stroke="#08030a" stroke-width="2"/>
  <path d="M18 10 L24 22 L20 28" stroke="#c084fc" stroke-width="1.5" fill="none"/>
  <path d="M42 38 L46 48 L40 56" stroke="#c084fc" stroke-width="1.5" fill="none"/>
</svg>`.trim();

  // ==========================================
  // 10. 古代真鍮の機巧回廊 (MECHA) SVG 定義
  // ==========================================
  public static readonly MECHA_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#382918"/>
  <rect x="3" y="3" width="58" height="58" rx="2" fill="#4d3721" stroke="#22180d" stroke-width="2"/>
  <circle cx="32" cy="32" r="14" fill="none" stroke="#d97706" stroke-width="2" stroke-dasharray="4,3"/>
  <circle cx="32" cy="32" r="5" fill="#d97706"/>
  <circle cx="8" cy="8" r="2.5" fill="#f59e0b"/>
  <circle cx="56" cy="8" r="2.5" fill="#f59e0b"/>
  <circle cx="8" cy="56" r="2.5" fill="#f59e0b"/>
  <circle cx="56" cy="56" r="2.5" fill="#f59e0b"/>
</svg>`.trim();

  public static readonly MECHA_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#1a1109"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#2b1c0e" stroke="#0e0804" stroke-width="2"/>
  <circle cx="32" cy="32" r="18" fill="#451a03" stroke="#b45309" stroke-width="3"/>
  <circle cx="32" cy="32" r="8" fill="#78350f" stroke="#f59e0b" stroke-width="2"/>
  <line x1="32" y1="6" x2="32" y2="58" stroke="#d97706" stroke-width="2.5"/>
  <line x1="6" y1="32" x2="58" y2="32" stroke="#d97706" stroke-width="2.5"/>
</svg>`.trim();

  // ==========================================
  // 11. 大海原の孤島迷宮 (ISLAND) SVG 定義
  // ==========================================
  public static readonly ISLAND_FLOOR_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#475569"/>
  <rect x="2" y="2" width="60" height="60" rx="4" fill="#64748b" stroke="#334155" stroke-width="1.8"/>
  <path d="M8 20 Q24 14 40 22 Q52 18 58 24" stroke="#94a3b8" stroke-width="2" fill="none" opacity="0.6"/>
  <circle cx="24" cy="44" r="3" fill="#f1f5f9" opacity="0.7"/>
  <circle cx="48" cy="38" r="2" fill="#f1f5f9" opacity="0.7"/>
</svg>`.trim();

  public static readonly ISLAND_WALL_1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0f172a"/>
  <rect x="2" y="2" width="60" height="28" rx="2" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <rect x="2" y="34" width="60" height="28" rx="2" fill="#1e293b" stroke="#020617" stroke-width="2"/>
  <line x1="4" y1="16" x2="60" y2="16" stroke="#475569" stroke-width="1.5"/>
  <line x1="4" y1="48" x2="60" y2="48" stroke="#475569" stroke-width="1.5"/>
</svg>`.trim();

  // ==========================================
  // 特殊環境ギミック床 (GIMMICKS) SVG 定義
  // ==========================================
  public static readonly GIMMICK_ICE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#0284c7"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#38bdf8" stroke="#0369a1" stroke-width="1.5"/>
  <!-- 滑走を暗示する氷光ハイライト -->
  <line x1="8" y1="8" x2="56" y2="56" stroke="#e0f2fe" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  <line x1="20" y1="8" x2="56" y2="44" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" opacity="0.9"/>
  <!-- 氷結晶 -->
  <circle cx="24" cy="40" r="3" fill="#ffffff" opacity="0.8"/>
  <circle cx="44" cy="20" r="2.5" fill="#ffffff" opacity="0.8"/>
</svg>`.trim();

  public static readonly GIMMICK_MUD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#451a03"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#78350f" stroke="#291002" stroke-width="1.5"/>
  <!-- 足を取られる泥濘・気泡 -->
  <circle cx="22" cy="24" r="8" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="44" cy="40" r="10" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <circle cx="22" cy="22" r="2.5" fill="#fde68a" opacity="0.6"/>
  <circle cx="44" cy="38" r="3.5" fill="#fde68a" opacity="0.6"/>
  <ellipse cx="34" cy="48" rx="6" ry="3" fill="#451a03"/>
</svg>`.trim();

  public static readonly GIMMICK_POISON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" fill="#3b0764"/>
  <rect x="2" y="2" width="60" height="60" rx="3" fill="#581c87" stroke="#2e1065" stroke-width="1.5"/>
  <!-- 有毒な泡と液面 -->
  <circle cx="20" cy="26" r="9" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
  <circle cx="44" cy="36" r="11" fill="#16a34a" stroke="#14532d" stroke-width="1.5"/>
  <circle cx="18" cy="24" r="3" fill="#bbf7d0" opacity="0.8"/>
  <circle cx="42" cy="34" r="3.5" fill="#bbf7d0" opacity="0.8"/>
  <polygon points="32,18 36,26 28,26" fill="#a855f7"/>
</svg>`.trim();

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
      // SNOW
      tile_snow_floor_1: this.SNOW_FLOOR_1_SVG,
      tile_snow_floor_2: this.SNOW_FLOOR_2_SVG,
      tile_snow_floor_3: this.SNOW_FLOOR_3_SVG,
      tile_snow_floor_4: this.SNOW_FLOOR_4_SVG,
      tile_snow_wall_1: this.SNOW_WALL_1_SVG,
      tile_snow_wall_2: this.SNOW_WALL_2_SVG,
      // ICE
      tile_ice_floor_1: this.ICE_FLOOR_1_SVG,
      tile_ice_floor_2: this.ICE_FLOOR_2_SVG,
      tile_ice_floor_3: this.ICE_FLOOR_3_SVG,
      tile_ice_floor_4: this.ICE_FLOOR_4_SVG,
      tile_ice_wall_1: this.ICE_WALL_1_SVG,
      tile_ice_wall_2: this.ICE_WALL_2_SVG,

      // BRIDGE (縦連結・横連結・交差点・壊れかけ)
      tile_bridge_vertical: this.BRIDGE_VERTICAL_SVG,
      tile_bridge_horizontal: this.BRIDGE_HORIZONTAL_SVG,
      tile_bridge_cross: this.BRIDGE_CROSS_SVG,
      tile_bridge_broken: this.BRIDGE_BROKEN_SVG,
      tile_bridge_1: this.BRIDGE_1_SVG,
      tile_bridge_2: this.BRIDGE_2_SVG,
      // SWAMP
      tile_swamp_floor_1: this.SWAMP_FLOOR_1_SVG,
      tile_swamp_floor_2: this.SWAMP_FLOOR_1_SVG,
      tile_swamp_floor_3: this.SWAMP_FLOOR_1_SVG,
      tile_swamp_floor_4: this.SWAMP_FLOOR_1_SVG,
      tile_swamp_wall_1: this.SWAMP_WALL_1_SVG,
      tile_swamp_wall_2: this.SWAMP_WALL_1_SVG,
      // TOXIC
      tile_toxic_floor_1: this.TOXIC_FLOOR_1_SVG,
      tile_toxic_floor_2: this.TOXIC_FLOOR_1_SVG,
      tile_toxic_floor_3: this.TOXIC_FLOOR_1_SVG,
      tile_toxic_floor_4: this.TOXIC_FLOOR_1_SVG,
      tile_toxic_wall_1: this.TOXIC_WALL_1_SVG,
      tile_toxic_wall_2: this.TOXIC_WALL_1_SVG,
      // MECHA
      tile_mecha_floor_1: this.MECHA_FLOOR_1_SVG,
      tile_mecha_floor_2: this.MECHA_FLOOR_1_SVG,
      tile_mecha_floor_3: this.MECHA_FLOOR_1_SVG,
      tile_mecha_floor_4: this.MECHA_FLOOR_1_SVG,
      tile_mecha_wall_1: this.MECHA_WALL_1_SVG,
      tile_mecha_wall_2: this.MECHA_WALL_1_SVG,
      // ISLAND
      tile_island_floor_1: this.ISLAND_FLOOR_1_SVG,
      tile_island_floor_2: this.ISLAND_FLOOR_1_SVG,
      tile_island_floor_3: this.ISLAND_FLOOR_1_SVG,
      tile_island_floor_4: this.ISLAND_FLOOR_1_SVG,
      tile_island_wall_1: this.ISLAND_WALL_1_SVG,
      tile_island_wall_2: this.ISLAND_WALL_1_SVG,
      // GIMMICKS
      tile_gimmick_ice: this.GIMMICK_ICE_SVG,
      tile_gimmick_mud: this.GIMMICK_MUD_SVG,
      tile_gimmick_poison: this.GIMMICK_POISON_SVG,
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

  /**
   * 連結方向および老朽フラグに基づいて、適切な木の橋タイルスプライトを取得します。
   *
   * @param isVertical - 縦方向（上下）に繋がっているか
   * @param isHorizontal - 横方向（左右）に繋がっているか
   * @param isCross - 3方向以上または十字に交差しているか
   * @param isBroken - 壊れかけの老朽木橋かどうか
   * @returns 適合する橋タイルのHTMLImageElement
   */
  public static getBridgeSprite(
    isVertical: boolean,
    isHorizontal: boolean,
    isCross: boolean,
    isBroken = false
  ): HTMLImageElement | undefined {
    if (isBroken) {
      return (
        this.imageCache.get('tile_bridge_broken') ??
        this.imageCache.get('tile_bridge_vertical')
      );
    }
    if (isCross) {
      return (
        this.imageCache.get('tile_bridge_cross') ??
        this.imageCache.get('tile_bridge_vertical')
      );
    }
    if (isHorizontal && !isVertical) {
      return (
        this.imageCache.get('tile_bridge_horizontal') ??
        this.imageCache.get('tile_bridge_vertical')
      );
    }
    return (
      this.imageCache.get('tile_bridge_vertical') ??
      this.imageCache.get('tile_bridge_1')
    );
  }

  /**
   * 特殊環境ギミック床（滑る氷床、足枷泥濘床、毒沼床）のスプライト画像を取得します。
   *
   * @param tile - タイル種別
   * @returns 適合するギミックタイルのHTMLImageElement
   */
  public static getGimmickSprite(tile: TileType): HTMLImageElement | undefined {
    switch (tile) {
      case TileType.Ice:
        return this.imageCache.get('tile_gimmick_ice');
      case TileType.Mud:
        return this.imageCache.get('tile_gimmick_mud');
      case TileType.Poison:
        return this.imageCache.get('tile_gimmick_poison');
      default:
        return undefined;
    }
  }
}
