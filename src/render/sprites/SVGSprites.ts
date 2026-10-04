/**
 * @file SVGSprites.ts
 * @description ベクターSVGベースのキャラクターおよびアイテムグラフィックスプライトを定義・キャッシュ・描画するクラス。
 * 外部通信を一切行わず、インラインSVGデータを内部でCanvas描画用Imageオブジェクトに変換して高速キャッシュします。
 * プレイヤーは素体（Base）として描画され、装備中の武器・盾はEquipmentSpritesによってリアルタイム動的合成されます。
 * 全10種のモンスター（各5方向/8方向）および全16種のアイテムに対応します。
 */

import { ItemCategory } from '../../core/types';
import { EquipmentSprites } from './EquipmentSprites';
import { MonsterAndItemSprites } from './MonsterAndItemSprites';
import { TileSprites } from './TileSprites';

/**
 * 利用可能なキャラクタースプライトおよびアイテムスプライトの識別子。
 */
export type SpriteId =
  // 冒険者プレイヤー素体（正面 / 下向き）
  | 'player'
  | 'player_down'
  | 'player_down_walk1'
  | 'player_down_walk2'
  | 'player_walk1'
  | 'player_walk2'
  // 冒険者プレイヤー素体（背面 / 上向き・後ろ姿）
  | 'player_up'
  | 'player_up_walk1'
  | 'player_up_walk2'
  // 冒険者プレイヤー素体（真横 / サイドビュー）
  | 'player_side'
  | 'player_side_walk1'
  | 'player_side_walk2'
  // 冒険者プレイヤー素体（斜め手前 / クォータービュー前向き）
  | 'player_diag_down'
  | 'player_diag_down_walk1'
  | 'player_diag_down_walk2'
  // 冒険者プレイヤー素体（斜め奥 / クォータービュー後ろ姿）
  | 'player_diag_up'
  | 'player_diag_up_walk1'
  | 'player_diag_up_walk2'
  // 冒険者プレイヤー（力尽き・倒れ姿）
  | 'player_dead'
  // タイルグラフィックスプライト
  | 'tile_stairs_down'
  // スライム（8方向対応）
  | 'slime'
  | 'slime_down'
  | 'slime_up'
  | 'slime_side'
  | 'slime_diag_down'
  | 'slime_diag_up'
  // ゴブリン（8方向対応）
  | 'goblin'
  | 'goblin_down'
  | 'goblin_up'
  | 'goblin_side'
  | 'goblin_diag_down'
  | 'goblin_diag_up'
  // スケルトン（8方向対応）
  | 'skeleton'
  | 'skeleton_down'
  | 'skeleton_up'
  | 'skeleton_side'
  | 'skeleton_diag_down'
  | 'skeleton_diag_up'
  // 岩石ゴーレム（8方向対応）
  | 'golem'
  | 'golem_down'
  | 'golem_up'
  | 'golem_side'
  | 'golem_diag_down'
  | 'golem_diag_up'
  // マンドラゴラ（8方向対応）
  | 'mandragora'
  | 'mandragora_down'
  | 'mandragora_up'
  | 'mandragora_side'
  | 'mandragora_diag_down'
  | 'mandragora_diag_up'
  // サハギン戦士（8方向対応）
  | 'sahagin'
  | 'sahagin_down'
  | 'sahagin_up'
  | 'sahagin_side'
  | 'sahagin_diag_down'
  | 'sahagin_diag_up'
  // 吸血コウモリ（8方向対応）
  | 'bat'
  | 'bat_down'
  | 'bat_up'
  | 'bat_side'
  | 'bat_diag_down'
  | 'bat_diag_up'
  // 彷徨う亡霊（8方向対応）
  | 'ghost'
  | 'ghost_down'
  | 'ghost_up'
  | 'ghost_side'
  | 'ghost_diag_down'
  | 'ghost_diag_up'
  // ダークメイジ（8方向対応）
  | 'mage'
  | 'mage_down'
  | 'mage_up'
  | 'mage_side'
  | 'mage_diag_down'
  | 'mage_diag_up'
  // レッドドラゴン（8方向対応）
  | 'dragon'
  | 'dragon_down'
  | 'dragon_up'
  | 'dragon_side'
  | 'dragon_diag_down'
  | 'dragon_diag_up'
  // アイテムグラフィックスプライト
  | 'item_potion'
  | 'item_potion_high'
  | 'item_potion_str'
  | 'item_seed'
  | 'item_food'
  | 'item_food_riceball'
  | 'item_weapon'
  | 'item_weapon_dagger'
  | 'item_weapon_mithril'
  | 'item_weapon_flame'
  | 'item_weapon_rune'
  | 'item_shield'
  | 'item_shield_wood'
  | 'item_shield_bronze'
  | 'item_shield_magic'
  | 'item_shield_dragon'
  | 'item_scroll'
  | 'item_scroll_thunder'
  | 'item_scroll_light';

/**
 * SVGスプライトの定義・生成・キャッシュ管理クラス。
 */
export class SVGSprites {
  /** プリロードされたスプライト画像のキャッシュマップ */
  private static imageCache: Map<SpriteId, HTMLImageElement> = new Map();

  /** 全スプライトのロード完了を監視するPromise */
  private static readyPromise: Promise<void> | null = null;

  // ==========================================
  // 1. プレイヤー正面（Down / 真下・南）素体SVG
  // 固定の剣・盾を除去し、手首・両手拳の素体として定義
  // ==========================================

  /** 冒険者プレイヤー素体（正面待機: 両足直立、バイザー光彩、素手拳） */
  public static readonly PLAYER_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- マント -->
  <path d="M20 28 L14 54 L32 50 L50 54 L44 28 Z" fill="#047857"/>
  <!-- 両足 -->
  <rect x="23" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="22" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
  <rect x="34" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="33" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
  <!-- アーマー胴体 -->
  <rect x="22" y="24" width="20" height="24" rx="4" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="26" y="28" width="12" height="16" rx="2" fill="#475569"/>
  <rect x="22" y="42" width="20" height="4" fill="#d97706"/>
  <rect x="29" y="41" width="6" height="6" fill="#fbbf24"/>
  <!-- 兜・頭部 -->
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M30 6 Q32 2 34 6 L33 12 L31 12 Z" fill="#ef4444"/>
  <rect x="25" y="16" width="14" height="4" rx="2" fill="#0f172a"/>
  <rect x="28" y="17" width="2" height="2" fill="#38bdf8"/>
  <rect x="34" y="17" width="2" height="2" fill="#38bdf8"/>
  <!-- 素手の手袋拳（左手・右手） -->
  <circle cx="18" cy="36" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="46" cy="36" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（正面歩行1） */
  public static readonly PLAYER_DOWN_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M20 28 L10 52 L30 50 L46 54 L44 28 Z" fill="#047857"/>
  <g transform="translate(3, 0)">
    <rect x="35" y="43" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="36" y="50" width="8" height="5" rx="2" fill="#0f172a"/>
  </g>
  <g transform="translate(-4, -1)">
    <rect x="21" y="43" width="8" height="13" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="19" y="52" width="11" height="5" rx="2" fill="#1e293b"/>
  </g>
  <rect x="22" y="24" width="20" height="24" rx="4" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="26" y="28" width="12" height="16" rx="2" fill="#475569"/>
  <rect x="22" y="42" width="20" height="4" fill="#d97706"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M29 6 Q31 2 34 5 L33 12 L30 12 Z" fill="#ef4444"/>
  <rect x="25" y="16" width="14" height="4" rx="2" fill="#0f172a"/>
  <rect x="28" y="17" width="2" height="2" fill="#38bdf8"/>
  <rect x="34" y="17" width="2" height="2" fill="#38bdf8"/>
  <!-- 両手の拳 -->
  <circle cx="16" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="48" cy="38" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（正面歩行2） */
  public static readonly PLAYER_DOWN_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M20 28 L16 54 L34 50 L52 50 L44 28 Z" fill="#047857"/>
  <g transform="translate(-2, 0)">
    <rect x="22" y="43" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="21" y="50" width="8" height="5" rx="2" fill="#0f172a"/>
  </g>
  <g transform="translate(3, -1)">
    <rect x="33" y="43" width="8" height="13" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="32" y="52" width="11" height="5" rx="2" fill="#1e293b"/>
  </g>
  <rect x="22" y="24" width="20" height="24" rx="4" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="26" y="28" width="12" height="16" rx="2" fill="#475569"/>
  <rect x="22" y="42" width="20" height="4" fill="#d97706"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M30 6 Q32 2 35 6 L34 12 L31 12 Z" fill="#ef4444"/>
  <rect x="25" y="16" width="14" height="4" rx="2" fill="#0f172a"/>
  <rect x="28" y="17" width="2" height="2" fill="#38bdf8"/>
  <rect x="34" y="17" width="2" height="2" fill="#38bdf8"/>
  <!-- 両手の拳 -->
  <circle cx="20" cy="38" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="44" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
</svg>
`.trim();

  // ==========================================
  // 2. プレイヤー背面（Up / 真上・北・後ろ姿）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（背面待機） */
  public static readonly PLAYER_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="23" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="34" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M20 24 L12 53 L32 50 L52 53 L44 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M24 26 L16 52 L32 49 L48 52 L40 26 Z" fill="#059669"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 16 Q32 20 40 16" stroke="#475569" stroke-width="2" fill="none"/>
  <path d="M30 6 Q32 2 34 6 L33 14 L31 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（背面歩行1） */
  public static readonly PLAYER_UP_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="35" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(-4, -4)">
    <rect x="23" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="22" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M20 24 L8 52 L28 49 L52 54 L44 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M24 26 L12 50 L28 48 L48 53 L40 26 Z" fill="#059669"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M29 6 Q31 2 34 5 L33 14 L30 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（背面歩行2） */
  public static readonly PLAYER_UP_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="22" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(4, -4)">
    <rect x="34" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="33" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M20 24 L12 54 L36 49 L56 52 L44 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M24 26 L16 53 L36 48 L52 50 L40 26 Z" fill="#059669"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M30 6 Q32 2 35 6 L34 14 L31 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  // ==========================================
  // 3. プレイヤー真横（Side / 東・西）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（真横待機） */
  public static readonly PLAYER_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="19" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 26 L12 52 L26 50 L28 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <rect x="23" y="44" width="8" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="21" y="52" width="12" height="5" rx="2" fill="#1e293b"/>
  <rect x="29" y="44" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="27" y="52" width="12" height="5" rx="2" fill="#1e293b"/>
  <path d="M22 24 L38 26 L36 46 L24 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="23" y="42" width="14" height="4" fill="#d97706"/>
  <!-- 側面の手袋拳 -->
  <circle cx="26" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="38" cy="30" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q32 2 33 8 L29 14 L24 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（真横歩行1） */
  public static readonly PLAYER_SIDE_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 26 L8 50 L24 48 L28 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <g transform="translate(-4, 0) rotate(-15 22 44)">
    <rect x="20" y="44" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="18" y="51" width="10" height="5" rx="2" fill="#0f172a"/>
  </g>
  <g transform="translate(6, -1) rotate(15 32 44)">
    <rect x="30" y="43" width="8" height="13" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="29" y="52" width="13" height="5" rx="2" fill="#1e293b"/>
  </g>
  <path d="M22 24 L38 26 L36 46 L24 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="23" y="42" width="14" height="4" fill="#d97706"/>
  <circle cx="24" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="40" cy="28" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 6 Q31 2 32 8 L28 14 L23 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（真横歩行2） */
  public static readonly PLAYER_SIDE_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 26 L12 54 L26 50 L28 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <g transform="translate(-2, 0) rotate(10 24 44)">
    <rect x="22" y="44" width="8" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="20" y="52" width="11" height="5" rx="2" fill="#1e293b"/>
  </g>
  <g transform="translate(4, -2) rotate(-10 32 44)">
    <rect x="28" y="44" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="27" y="51" width="12" height="5" rx="2" fill="#1e293b"/>
  </g>
  <path d="M22 24 L38 26 L36 46 L24 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="23" y="42" width="14" height="4" fill="#d97706"/>
  <circle cx="28" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="36" cy="32" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q32 2 34 8 L29 14 L24 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
</svg>
`.trim();

  // ==========================================
  // 4. プレイヤー斜め手前（Down-Right / Down-Left）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（斜め前待機: クォータービュー45度、素手構え） */
  public static readonly PLAYER_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L6 52 L22 52 L42 54 L36 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <rect x="20" y="44" width="7" height="12" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="18" y="52" width="10" height="5" rx="2" fill="#0f172a"/>
  <rect x="30" y="45" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="30" y="53" width="12" height="5" rx="2" fill="#1e293b"/>
  <path d="M18 24 L38 27 L34 47 L18 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <path d="M22 27 L36 29 L33 43 L21 41 Z" fill="#475569"/>
  <rect x="18" y="42" width="18" height="4" fill="#d97706"/>
  <!-- 両手の拳 -->
  <circle cx="16" cy="35" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="42" cy="32" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め前歩行1） */
  public static readonly PLAYER_DIAG_DOWN_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L4 50 L20 50 L42 54 L36 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <g transform="translate(3, 0)">
    <rect x="30" y="44" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="31" y="51" width="8" height="5" rx="2" fill="#0f172a"/>
  </g>
  <g transform="translate(-4, -1)">
    <rect x="19" y="44" width="8" height="13" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="17" y="53" width="11" height="5" rx="2" fill="#1e293b"/>
  </g>
  <path d="M18 24 L38 27 L34 47 L18 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="18" y="42" width="18" height="4" fill="#d97706"/>
  <circle cx="15" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="44" cy="30" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め前歩行2） */
  public static readonly PLAYER_DIAG_DOWN_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L10 54 L24 50 L44 50 L36 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <g transform="translate(-2, 0)">
    <rect x="19" y="44" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
    <rect x="18" y="51" width="8" height="5" rx="2" fill="#0f172a"/>
  </g>
  <g transform="translate(4, -1)">
    <rect x="30" y="44" width="8" height="13" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="29" y="53" width="11" height="5" rx="2" fill="#1e293b"/>
  </g>
  <path d="M18 24 L38 27 L34 47 L18 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="18" y="42" width="18" height="4" fill="#d97706"/>
  <circle cx="17" cy="35" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="40" cy="34" r="3.5" fill="#fbcfe8" stroke="#334155" stroke-width="1.2"/>
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
</svg>
`.trim();

  // ==========================================
  // 5. プレイヤー斜め奥（Up-Right / Up-Left）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（斜め後ろ待機） */
  public static readonly PLAYER_DIAG_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="20" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M18 24 L8 50 L26 50 L48 54 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M22 26 L12 48 L26 48 L44 51 L32 26 Z" fill="#059669"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 16 Q31 21 38 17" stroke="#475569" stroke-width="2" fill="none"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め後ろ歩行1） */
  public static readonly PLAYER_DIAG_UP_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="32" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(-4, -4)">
    <rect x="20" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="19" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M18 24 L6 48 L24 48 L48 53 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め後ろ歩行2） */
  public static readonly PLAYER_DIAG_UP_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="19" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(4, -4)">
    <rect x="31" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="30" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M18 24 L10 52 L30 48 L50 51 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（力尽き・倒れ姿） */
  public static readonly PLAYER_DEAD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="46" rx="26" ry="10" fill="rgba(0,0,0,0.5)"/>
  <path d="M12 40 Q24 32 44 36 Q52 46 40 52 Q22 54 12 40 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M16 42 Q26 36 40 38 Q46 46 36 50 Q22 51 16 42 Z" fill="#059669"/>
  <rect x="8" y="42" width="14" height="6" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" transform="rotate(-10 15 45)"/>
  <rect x="6" y="44" width="6" height="7" rx="2" fill="#0f172a"/>
  <path d="M20 36 L36 34 L38 48 L22 50 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="22" y="42" width="14" height="4" fill="#d97706"/>
  <circle cx="42" cy="42" r="10" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M38 32 Q42 28 44 33 L41 38 Z" fill="#ef4444"/>
  <polygon points="40,40 50,42 48,46 38,44" fill="#0f172a"/>
</svg>
`.trim();

  // ==========================================
  // 下り階段タイル
  // ==========================================
  public static readonly STAIRS_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="4" y="4" width="56" height="56" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
  <rect x="8" y="8" width="48" height="48" fill="#030712"/>
  <polygon points="8,8 56,8 50,14 14,14" fill="#475569"/>
  <polygon points="14,14 50,14 45,20 19,20" fill="#334155"/>
  <polygon points="19,20 45,20 41,27 23,27" fill="#1e293b"/>
  <polygon points="23,27 41,27 37,35 27,35" fill="#0f172a"/>
  <rect x="27" y="35" width="10" height="21" fill="#020617"/>
  <polygon points="32,46 25,37 39,37" fill="#fbbf24"/>
  <polygon points="32,42 27,36 37,36" fill="#fef08a"/>
</svg>`.trim();

  // ==========================================
  // 既存モンスターSVG（スライム、ゴブリン、スケルトン、ゴーレム、マンドラゴラ、サハギン）
  // ==========================================
  public static readonly SLIME_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 10 C46 10 56 26 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 26 18 10 32 10 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <path d="M32 18 C42 18 50 30 50 42 C50 50 42 52 32 52 C22 52 14 50 14 42 C14 30 22 18 32 18 Z" fill="#34d399" opacity="0.6"/>
  <ellipse cx="24" cy="36" rx="4" ry="6" fill="#064e3b"/>
  <circle cx="23" cy="34" r="2" fill="#ffffff"/>
  <ellipse cx="40" cy="36" rx="4" ry="6" fill="#064e3b"/>
  <circle cx="39" cy="34" r="2" fill="#ffffff"/>
  <ellipse cx="24" cy="20" rx="6" ry="3" transform="rotate(-25 24 20)" fill="#a7f3d0"/>
</svg>`.trim();

  public static readonly SLIME_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 10 C46 10 56 26 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 26 18 10 32 10 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <path d="M32 18 C42 18 50 30 50 42 C50 50 42 52 32 52 C22 52 14 50 14 42 C14 30 22 18 32 18 Z" fill="#34d399" opacity="0.6"/>
</svg>`.trim();

  public static readonly SLIME_SIDE_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly SLIME_DIAG_DOWN_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly SLIME_DIAG_UP_SVG = SVGSprites.SLIME_UP_SVG;

  public static readonly GOBLIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L4 18 L18 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <path d="M48 26 L60 18 L46 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <rect x="22" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <circle cx="32" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <circle cx="26" cy="27" r="3" fill="#dc2626"/>
  <circle cx="38" cy="27" r="3" fill="#dc2626"/>
</svg>`.trim();

  public static readonly GOBLIN_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <rect x="22" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
</svg>`.trim();

  public static readonly GOBLIN_SIDE_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly GOBLIN_DIAG_DOWN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly GOBLIN_DIAG_UP_SVG = SVGSprites.GOBLIN_UP_SVG;

  public static readonly SKELETON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 20 Q32 10 42 20 L40 32 L24 32 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="27" cy="22" r="3.5" fill="#0f172a"/>
  <circle cx="37" cy="22" r="3.5" fill="#0f172a"/>
  <line x1="32" y1="34" x2="32" y2="48" stroke="#f8fafc" stroke-width="3"/>
  <line x1="24" y1="38" x2="40" y2="38" stroke="#f8fafc" stroke-width="2.5"/>
  <line x1="26" y1="44" x2="38" y2="44" stroke="#f8fafc" stroke-width="2.5"/>
</svg>`.trim();

  public static readonly SKELETON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M22 20 Q32 10 42 20 L40 32 L24 32 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="32" y1="34" x2="32" y2="48" stroke="#f8fafc" stroke-width="3"/>
</svg>`.trim();

  public static readonly SKELETON_SIDE_SVG = SVGSprites.SKELETON_DOWN_SVG;
  public static readonly SKELETON_DIAG_DOWN_SVG = SVGSprites.SKELETON_DOWN_SVG;
  public static readonly SKELETON_DIAG_UP_SVG = SVGSprites.SKELETON_UP_SVG;

  public static readonly GOLEM_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.35)"/>
  <rect x="18" y="24" width="28" height="26" rx="5" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <rect x="22" y="10" width="20" height="16" rx="4" fill="#a8a29e" stroke="#44403c" stroke-width="2"/>
  <circle cx="27" cy="18" r="2.5" fill="#f59e0b"/>
  <circle cx="37" cy="18" r="2.5" fill="#f59e0b"/>
</svg>`.trim();

  public static readonly GOLEM_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_SIDE_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_DIAG_DOWN_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_DIAG_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;

  public static readonly MANDRAGORA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M20 28 Q32 20 44 28 Q44 48 32 54 Q20 48 20 28 Z" fill="#65a30d" stroke="#365314" stroke-width="2"/>
  <circle cx="28" cy="34" r="3" fill="#000000"/>
  <circle cx="36" cy="34" r="3" fill="#000000"/>
  <ellipse cx="32" cy="14" rx="6" ry="12" fill="#22c55e"/>
</svg>`.trim();

  public static readonly MANDRAGORA_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_SIDE_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_DIAG_DOWN_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_DIAG_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;

  public static readonly SAHAGIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <circle cx="32" cy="24" r="14" fill="#06b6d4" stroke="#083344" stroke-width="2"/>
  <circle cx="26" cy="22" r="3.5" fill="#fef08a"/>
  <circle cx="38" cy="22" r="3.5" fill="#fef08a"/>
  <circle cx="26" cy="22" r="1.5" fill="#000000"/>
  <circle cx="38" cy="22" r="1.5" fill="#000000"/>
  <rect x="22" y="32" width="20" height="24" rx="4" fill="#0891b2" stroke="#083344" stroke-width="2"/>
  <line x1="48" y1="10" x2="48" y2="52" stroke="#cbd5e1" stroke-width="2"/>
</svg>`.trim();

  public static readonly SAHAGIN_UP_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  public static readonly SAHAGIN_SIDE_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  public static readonly SAHAGIN_DIAG_DOWN_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  public static readonly SAHAGIN_DIAG_UP_SVG = SVGSprites.SAHAGIN_DOWN_SVG;

  // 後方互換用エイリアス
  public static readonly PLAYER_SVG = SVGSprites.PLAYER_DOWN_SVG;
  public static readonly PLAYER_WALK1_SVG = SVGSprites.PLAYER_DOWN_WALK1_SVG;
  public static readonly PLAYER_WALK2_SVG = SVGSprites.PLAYER_DOWN_WALK2_SVG;
  public static readonly SLIME_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly GOBLIN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly SKELETON_SVG = SVGSprites.SKELETON_DOWN_SVG;

  /**
   * 全スプライトの事前ロードを開始します。
   */
  public static init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    const spriteMap: Record<SpriteId, string> = {
      // プレイヤー素体
      player: this.PLAYER_DOWN_SVG,
      player_down: this.PLAYER_DOWN_SVG,
      player_down_walk1: this.PLAYER_DOWN_WALK1_SVG,
      player_down_walk2: this.PLAYER_DOWN_WALK2_SVG,
      player_walk1: this.PLAYER_DOWN_WALK1_SVG,
      player_walk2: this.PLAYER_DOWN_WALK2_SVG,
      player_up: this.PLAYER_UP_SVG,
      player_up_walk1: this.PLAYER_UP_WALK1_SVG,
      player_up_walk2: this.PLAYER_UP_WALK2_SVG,
      player_side: this.PLAYER_SIDE_SVG,
      player_side_walk1: this.PLAYER_SIDE_WALK1_SVG,
      player_side_walk2: this.PLAYER_SIDE_WALK2_SVG,
      player_diag_down: this.PLAYER_DIAG_DOWN_SVG,
      player_diag_down_walk1: this.PLAYER_DIAG_DOWN_WALK1_SVG,
      player_diag_down_walk2: this.PLAYER_DIAG_DOWN_WALK2_SVG,
      player_diag_up: this.PLAYER_DIAG_UP_SVG,
      player_diag_up_walk1: this.PLAYER_DIAG_UP_WALK1_SVG,
      player_diag_up_walk2: this.PLAYER_DIAG_UP_WALK2_SVG,
      player_dead: this.PLAYER_DEAD_SVG,

      // 階段
      tile_stairs_down: this.STAIRS_DOWN_SVG,

      // モンスター
      slime: this.SLIME_DOWN_SVG,
      slime_down: this.SLIME_DOWN_SVG,
      slime_up: this.SLIME_UP_SVG,
      slime_side: this.SLIME_SIDE_SVG,
      slime_diag_down: this.SLIME_DIAG_DOWN_SVG,
      slime_diag_up: this.SLIME_DIAG_UP_SVG,

      goblin: this.GOBLIN_DOWN_SVG,
      goblin_down: this.GOBLIN_DOWN_SVG,
      goblin_up: this.GOBLIN_UP_SVG,
      goblin_side: this.GOBLIN_SIDE_SVG,
      goblin_diag_down: this.GOBLIN_DIAG_DOWN_SVG,
      goblin_diag_up: this.GOBLIN_DIAG_UP_SVG,

      skeleton: this.SKELETON_DOWN_SVG,
      skeleton_down: this.SKELETON_DOWN_SVG,
      skeleton_up: this.SKELETON_UP_SVG,
      skeleton_side: this.SKELETON_SIDE_SVG,
      skeleton_diag_down: this.SKELETON_DIAG_DOWN_SVG,
      skeleton_diag_up: this.SKELETON_DIAG_UP_SVG,

      golem: this.GOLEM_DOWN_SVG,
      golem_down: this.GOLEM_DOWN_SVG,
      golem_up: this.GOLEM_UP_SVG,
      golem_side: this.GOLEM_SIDE_SVG,
      golem_diag_down: this.GOLEM_DIAG_DOWN_SVG,
      golem_diag_up: this.GOLEM_DIAG_UP_SVG,

      mandragora: this.MANDRAGORA_DOWN_SVG,
      mandragora_down: this.MANDRAGORA_DOWN_SVG,
      mandragora_up: this.MANDRAGORA_UP_SVG,
      mandragora_side: this.MANDRAGORA_SIDE_SVG,
      mandragora_diag_down: this.MANDRAGORA_DIAG_DOWN_SVG,
      mandragora_diag_up: this.MANDRAGORA_DIAG_UP_SVG,

      sahagin: this.SAHAGIN_DOWN_SVG,
      sahagin_down: this.SAHAGIN_DOWN_SVG,
      sahagin_up: this.SAHAGIN_UP_SVG,
      sahagin_side: this.SAHAGIN_SIDE_SVG,
      sahagin_diag_down: this.SAHAGIN_DIAG_DOWN_SVG,
      sahagin_diag_up: this.SAHAGIN_DIAG_UP_SVG,

      // 新モンスター（MonsterAndItemSprites より取得）
      bat: MonsterAndItemSprites.BAT_DOWN_SVG,
      bat_down: MonsterAndItemSprites.BAT_DOWN_SVG,
      bat_up: MonsterAndItemSprites.BAT_UP_SVG,
      bat_side: MonsterAndItemSprites.BAT_SIDE_SVG,
      bat_diag_down: MonsterAndItemSprites.BAT_DIAG_DOWN_SVG,
      bat_diag_up: MonsterAndItemSprites.BAT_DIAG_UP_SVG,

      ghost: MonsterAndItemSprites.GHOST_DOWN_SVG,
      ghost_down: MonsterAndItemSprites.GHOST_DOWN_SVG,
      ghost_up: MonsterAndItemSprites.GHOST_UP_SVG,
      ghost_side: MonsterAndItemSprites.GHOST_SIDE_SVG,
      ghost_diag_down: MonsterAndItemSprites.GHOST_DIAG_DOWN_SVG,
      ghost_diag_up: MonsterAndItemSprites.GHOST_DIAG_UP_SVG,

      mage: MonsterAndItemSprites.MAGE_DOWN_SVG,
      mage_down: MonsterAndItemSprites.MAGE_DOWN_SVG,
      mage_up: MonsterAndItemSprites.MAGE_UP_SVG,
      mage_side: MonsterAndItemSprites.MAGE_SIDE_SVG,
      mage_diag_down: MonsterAndItemSprites.MAGE_DIAG_DOWN_SVG,
      mage_diag_up: MonsterAndItemSprites.MAGE_DIAG_UP_SVG,

      dragon: MonsterAndItemSprites.DRAGON_DOWN_SVG,
      dragon_down: MonsterAndItemSprites.DRAGON_DOWN_SVG,
      dragon_up: MonsterAndItemSprites.DRAGON_UP_SVG,
      dragon_side: MonsterAndItemSprites.DRAGON_SIDE_SVG,
      dragon_diag_down: MonsterAndItemSprites.DRAGON_DIAG_DOWN_SVG,
      dragon_diag_up: MonsterAndItemSprites.DRAGON_DIAG_UP_SVG,

      // アイテム
      item_potion: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="28" y="14" width="8" height="6" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="16" fill="rgba(15,23,42,0.4)" stroke="#94a3b8" stroke-width="2"/>
  <path d="M18 42 C18 50 24 56 32 56 C40 56 46 50 46 42 Z" fill="#10b981"/>
</svg>`.trim(),
      item_potion_high: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <circle cx="32" cy="42" r="17" fill="rgba(15,23,42,0.5)" stroke="#fbbf24" stroke-width="2.5"/>
  <path d="M17 42 C17 51 24 57 32 57 C40 57 47 51 47 42 Z" fill="#059669"/>
  <circle cx="32" cy="30" r="3" fill="#fbbf24"/>
</svg>`.trim(),
      item_potion_str: MonsterAndItemSprites.ITEM_POTION_STR_SVG,
      item_seed: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 12 C44 12 50 32 48 46 C46 54 18 54 16 46 C14 32 20 12 32 12 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
  <ellipse cx="32" cy="14" rx="10" ry="4" fill="#78350f"/>
</svg>`.trim(),
      item_food: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M12 44 C12 24 22 14 32 14 C42 14 52 24 52 44 C52 52 44 54 32 54 C20 54 12 52 12 44 Z" fill="#d97706" stroke="#78350f" stroke-width="2"/>
  <line x1="18" y1="30" x2="46" y2="30" stroke="#92400e" stroke-width="1.5"/>
  <line x1="32" y1="18" x2="32" y2="42" stroke="#92400e" stroke-width="1.5"/>
</svg>`.trim(),
      item_food_riceball: MonsterAndItemSprites.ITEM_FOOD_RICEBALL_SVG,
      item_weapon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,6 36,12 35,42 29,42 28,12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#d97706"/>
    <circle cx="32" cy="58" r="3.5" fill="#fbbf24"/>
  </g>
</svg>`.trim(),
      item_weapon_dagger: MonsterAndItemSprites.ITEM_WEAPON_DAGGER_SVG,
      item_weapon_mithril: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,4 37,12 35,42 29,42 27,12" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
    <circle cx="32" cy="44" r="2.5" fill="#38bdf8"/>
    <circle cx="32" cy="58" r="3.5" fill="#818cf8"/>
  </g>
</svg>`.trim(),
      item_weapon_flame: MonsterAndItemSprites.ITEM_WEAPON_FLAME_SVG,
      item_weapon_rune: MonsterAndItemSprites.ITEM_WEAPON_RUNE_SVG,
      item_shield: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M16 16 L48 16 Q48 38 32 54 Q16 38 16 16 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2.5"/>
  <circle cx="32" cy="33" r="3" fill="#fbbf24"/>
</svg>`.trim(),
      item_shield_wood: MonsterAndItemSprites.ITEM_SHIELD_WOOD_SVG,
      item_shield_bronze: MonsterAndItemSprites.ITEM_SHIELD_BRONZE_SVG,
      item_shield_magic: MonsterAndItemSprites.ITEM_SHIELD_MAGIC_SVG,
      item_shield_dragon: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M14 14 L50 14 Q50 38 32 56 Q14 38 14 14 Z" fill="#b91c1c" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="32,24 35,32 44,34 36,37 32,46 28,37 20,34 29,32" fill="#fbbf24"/>
</svg>`.trim(),
      item_scroll: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="15" y="18" width="34" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <circle cx="32" cy="33" r="5" fill="#f43f5e"/>
</svg>`.trim(),
      item_scroll_thunder: MonsterAndItemSprites.ITEM_SCROLL_THUNDER_SVG,
      item_scroll_light: MonsterAndItemSprites.ITEM_SCROLL_LIGHT_SVG,
    };

    const promises: Promise<void>[] = [];

    for (const [key, svg] of Object.entries(spriteMap)) {
      const id = key as SpriteId;
      const img = new Image();
      const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

      const p = new Promise<void>((resolve) => {
        img.onload = () => {
          this.imageCache.set(id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load SVG sprite: ${id}`);
          resolve();
        };
      });

      img.src = svgBase64;
      promises.push(p);
    }

    this.readyPromise = Promise.all([
      ...promises,
      TileSprites.init(),
      EquipmentSprites.init(),
    ]).then(() => {});
    return this.readyPromise;
  }

  /**
   * キャッシュされたスプライト画像を取得します。
   */
  public static get(id: SpriteId): HTMLImageElement | undefined {
    return this.imageCache.get(id);
  }

  /**
   * アイテムのカテゴリおよびアイテム名から対応するスプライトIDを取得します。
   */
  public static getItemSpriteId(
    category: ItemCategory,
    name?: string
  ): SpriteId {
    if (name) {
      // ポーション
      if (name.includes('特薬草')) return 'item_potion_high';
      if (name.includes('剛力')) return 'item_potion_str';
      if (name.includes('力') && name.includes('種')) return 'item_seed';
      // 食料
      if (name.includes('おにぎり')) return 'item_food_riceball';
      if (name.includes('パン')) return 'item_food';
      // 武器
      if (name.includes('短剣') || name.includes('青銅の短剣')) return 'item_weapon_dagger';
      if (name.includes('ミスリル')) return 'item_weapon_mithril';
      if (name.includes('炎')) return 'item_weapon_flame';
      if (name.includes('ルーン')) return 'item_weapon_rune';
      if (name.includes('剣')) return 'item_weapon';
      // 盾
      if (name.includes('木')) return 'item_shield_wood';
      if (name.includes('青銅')) return 'item_shield_bronze';
      if (name.includes('魔法')) return 'item_shield_magic';
      if (name.includes('ドラゴン')) return 'item_shield_dragon';
      if (name.includes('盾')) return 'item_shield';
      // 巻物
      if (name.includes('雷')) return 'item_scroll_thunder';
      if (name.includes('あかり')) return 'item_scroll_light';
      if (name.includes('ワープ') || name.includes('巻物')) return 'item_scroll';
    }

    switch (category) {
      case 'POTION':
        return 'item_potion';
      case 'FOOD':
        return 'item_food';
      case 'WEAPON':
        return 'item_weapon';
      case 'SHIELD':
        return 'item_shield';
      case 'SCROLL':
        return 'item_scroll';
      default:
        return 'item_potion';
    }
  }
}
