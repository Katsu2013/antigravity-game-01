/**
 * @file SVGSprites.ts
 * @description ベクターSVGベースのキャラクターおよびアイテムグラフィックスプライトを定義・キャッシュ・描画するクラス。
 * 外部通信を一切行わず、インラインSVGデータを内部でCanvas描画用Imageオブジェクトに変換して高速キャッシュします。
 * 風来のシレンやトルネコの大冒険に準拠した完全8方向（正面/背面/真横/斜め前/斜め奥）および歩行モーションに対応します。
 */

import { ItemCategory } from '../../core/types';
import { TileSprites } from './TileSprites';

/**
 * 利用可能なキャラクタースプライトおよびアイテムスプライトの識別子。
 */
export type SpriteId =
  // 冒険者プレイヤー（正面 / 下向き）
  | 'player'
  | 'player_down'
  | 'player_down_walk1'
  | 'player_down_walk2'
  | 'player_walk1'
  | 'player_walk2'
  // 冒険者プレイヤー（背面 / 上向き・後ろ姿）
  | 'player_up'
  | 'player_up_walk1'
  | 'player_up_walk2'
  // 冒険者プレイヤー（真横 / サイドビュー）
  | 'player_side'
  | 'player_side_walk1'
  | 'player_side_walk2'
  // 冒険者プレイヤー（斜め手前 / クォータービュー前向き）
  | 'player_diag_down'
  | 'player_diag_down_walk1'
  | 'player_diag_down_walk2'
  // 冒険者プレイヤー（斜め奥 / クォータービュー後ろ姿）
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
  // アイテムグラフィックスプライト
  | 'item_potion'
  | 'item_potion_high'
  | 'item_seed'
  | 'item_food'
  | 'item_weapon'
  | 'item_weapon_mithril'
  | 'item_shield'
  | 'item_shield_dragon'
  | 'item_scroll';

/**
 * SVGスプライトの定義・生成・キャッシュ管理クラス。
 */
export class SVGSprites {
  /** プリロードされたスプライト画像のキャッシュマップ */
  private static imageCache: Map<SpriteId, HTMLImageElement> = new Map();

  /** 全スプライトのロード完了を監視するPromise */
  private static readyPromise: Promise<void> | null = null;

  // ==========================================
  // 1. プレイヤー正面（Down / 真下・南）SVG
  // ==========================================

  /** 冒険者プレイヤー（正面待機: 両足直立、バイザー光彩、剣と盾） */
  public static readonly PLAYER_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M20 28 L14 54 L32 50 L50 54 L44 28 Z" fill="#047857"/>
  <rect x="23" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="22" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
  <rect x="34" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="33" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
  <rect x="22" y="24" width="20" height="24" rx="4" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="26" y="28" width="12" height="16" rx="2" fill="#475569"/>
  <rect x="22" y="42" width="20" height="4" fill="#d97706"/>
  <rect x="29" y="41" width="6" height="6" fill="#fbbf24"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M30 6 Q32 2 34 6 L33 12 L31 12 Z" fill="#ef4444"/>
  <rect x="25" y="16" width="14" height="4" rx="2" fill="#0f172a"/>
  <rect x="28" y="17" width="2" height="2" fill="#38bdf8"/>
  <rect x="34" y="17" width="2" height="2" fill="#38bdf8"/>
  <path d="M14 26 Q12 40 20 44 Q28 40 26 26 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="20" cy="34" r="3" fill="#fbbf24"/>
  <rect x="44" y="12" width="4" height="24" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <rect x="41" y="32" width="10" height="3" fill="#d97706"/>
  <rect x="45" y="35" width="2" height="6" fill="#78350f"/>
  <circle cx="46" cy="42" r="2" fill="#fbbf24"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（正面歩行1） */
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
  <g transform="translate(-3, -2)">
    <path d="M14 26 Q12 40 20 44 Q28 40 26 26 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
    <circle cx="20" cy="34" r="3" fill="#fbbf24"/>
  </g>
  <g transform="rotate(-18 45 35)">
    <rect x="44" y="12" width="4" height="24" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <rect x="41" y="32" width="10" height="3" fill="#d97706"/>
    <circle cx="46" cy="42" r="2" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  /** 冒険者プレイヤー（正面歩行2） */
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
  <g transform="translate(2, 2)">
    <path d="M14 26 Q12 40 20 44 Q28 40 26 26 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
    <circle cx="20" cy="34" r="3" fill="#fbbf24"/>
  </g>
  <g transform="rotate(22 45 35)">
    <rect x="44" y="12" width="4" height="24" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <rect x="41" y="32" width="10" height="3" fill="#d97706"/>
    <circle cx="46" cy="42" r="2" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  // ==========================================
  // 2. プレイヤー背面（Up / 真上・北・後ろ姿）SVG
  // ==========================================

  /** 冒険者プレイヤー（背面待機） */
  public static readonly PLAYER_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="23" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="34" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M22 24 L14 53 L32 50 L50 53 L42 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M26 26 L18 52 L32 49 L46 52 L38 26 Z" fill="#059669"/>
  <path d="M14 24 Q12 38 20 42 Q28 38 26 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <line x1="16" y1="30" x2="24" y2="36" stroke="#78350f" stroke-width="2.5"/>
  <line x1="16" y1="36" x2="24" y2="30" stroke="#78350f" stroke-width="2.5"/>
  <rect x="42" y="10" width="4" height="18" rx="1" fill="#78350f"/>
  <rect x="39" y="22" width="10" height="3" fill="#d97706"/>
  <rect x="43" y="8" width="2" height="4" fill="#fbbf24"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 16 Q32 20 40 16" stroke="#475569" stroke-width="2" fill="none"/>
  <path d="M30 6 Q32 2 34 6 L33 14 L31 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（背面歩行1） */
  public static readonly PLAYER_UP_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="35" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(-4, -4)">
    <rect x="23" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="22" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M22 24 L10 52 L28 49 L50 54 L42 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M26 26 L14 50 L28 48 L46 53 L38 26 Z" fill="#059669"/>
  <g transform="translate(-2, 0)">
    <path d="M14 24 Q12 38 20 42 Q28 38 26 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  </g>
  <rect x="42" y="10" width="4" height="18" rx="1" fill="#78350f"/>
  <rect x="39" y="22" width="10" height="3" fill="#d97706"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M29 6 Q31 2 34 5 L33 14 L30 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（背面歩行2） */
  public static readonly PLAYER_UP_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="22" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(4, -4)">
    <rect x="34" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="33" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M22 24 L14 54 L36 49 L54 52 L42 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M26 26 L18 53 L36 48 L50 50 L38 26 Z" fill="#059669"/>
  <path d="M14 24 Q12 38 20 42 Q28 38 26 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <rect x="42" y="10" width="4" height="18" rx="1" fill="#78350f"/>
  <rect x="39" y="22" width="10" height="3" fill="#d97706"/>
  <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M30 6 Q32 2 35 6 L34 14 L31 14 Z" fill="#ef4444"/>
</svg>
`.trim();

  // ==========================================
  // 3. プレイヤー真横（Side / 東・西）SVG
  // ==========================================

  /** 冒険者プレイヤー（真横待機） */
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
  <ellipse cx="26" cy="34" rx="6" ry="10" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="26" cy="34" r="2.5" fill="#fbbf24"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q32 2 33 8 L29 14 L24 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
  <rect x="38" y="24" width="22" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <rect x="36" y="21" width="3" height="10" fill="#d97706"/>
  <rect x="32" y="24.5" width="5" height="3" fill="#78350f"/>
  <circle cx="31" cy="26" r="2" fill="#fbbf24"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（真横歩行1） */
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
  <ellipse cx="23" cy="34" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 6 Q31 2 32 8 L28 14 L23 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
  <g transform="translate(2, -1)">
    <rect x="38" y="24" width="23" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <rect x="36" y="21" width="3" height="10" fill="#d97706"/>
    <circle cx="31" cy="26" r="2" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  /** 冒険者プレイヤー（真横歩行2） */
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
  <ellipse cx="30" cy="33" rx="6" ry="10" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="30" cy="33" r="2.5" fill="#fbbf24"/>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q32 2 34 8 L29 14 L24 14 Z" fill="#ef4444"/>
  <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
  <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
  <g transform="rotate(-15 36 26)">
    <rect x="38" y="24" width="20" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
    <rect x="36" y="21" width="3" height="10" fill="#d97706"/>
    <circle cx="31" cy="26" r="2" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  // ==========================================
  // 4. プレイヤー斜め手前（Down-Right / Down-Left）SVG
  // ==========================================

  /** 冒険者プレイヤー（斜め前待機: クォータービュー45度、右前方へ剣を鋭く突き出した斜め構え） */
  public static readonly PLAYER_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 斜めマント（左後方から翻る） -->
  <path d="M16 26 L6 52 L22 52 L42 54 L36 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <!-- 両足（南東へ向かうクォータービュースタンス） -->
  <rect x="20" y="44" width="7" height="12" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="18" y="52" width="10" height="5" rx="2" fill="#0f172a"/>
  <rect x="30" y="45" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="30" y="53" width="12" height="5" rx="2" fill="#1e293b"/>
  <!-- 斜めアーマー胴体（45度傾斜パース） -->
  <path d="M18 24 L38 27 L34 47 L18 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <path d="M22 27 L36 29 L33 43 L21 41 Z" fill="#475569"/>
  <rect x="18" y="42" width="18" height="4" fill="#d97706"/>
  <!-- 左手・後方に引いた丸盾 -->
  <ellipse cx="16" cy="35" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="16" cy="35" r="2" fill="#fbbf24"/>
  <!-- 兜（明確に右斜め前45度を向く） -->
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <!-- 斜めバイザー（右下へ伸びるスリット） -->
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <!-- バイザーの青い光彩（右前方を見つめる） -->
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
  <!-- 右手・右斜め前方（南東45度）へ突き出された鋭い長剣 -->
  <g transform="rotate(40 38 28)">
    <rect x="38" y="6" width="4.5" height="28" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="40" y1="8" x2="40" y2="34" stroke="#64748b" stroke-width="1"/>
    <polygon points="40,8 42,14 41,32 40,32" fill="#ffffff" opacity="0.8"/>
    <rect x="33" y="34" width="14" height="4" rx="1" fill="#d97706"/>
    <rect x="38" y="38" width="4" height="6" rx="1" fill="#78350f"/>
    <circle cx="40" cy="45" r="2.5" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  /** 冒険者プレイヤー（斜め前歩行1） */
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
  <ellipse cx="15" cy="34" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="15" cy="34" r="2" fill="#fbbf24"/>
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
  <g transform="rotate(22 38 28)">
    <rect x="38" y="6" width="4.5" height="28" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
    <rect x="33" y="34" width="14" height="4" rx="1" fill="#d97706"/>
    <circle cx="40" cy="45" r="2.5" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  /** 冒険者プレイヤー（斜め前歩行2） */
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
  <ellipse cx="17" cy="35" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="17" cy="35" r="2" fill="#fbbf24"/>
  <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
  <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
  <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
  <g transform="rotate(52 38 28)">
    <rect x="38" y="6" width="4.5" height="28" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
    <rect x="33" y="34" width="14" height="4" rx="1" fill="#d97706"/>
    <circle cx="40" cy="45" r="2.5" fill="#fbbf24"/>
  </g>
</svg>
`.trim();

  // ==========================================
  // 5. プレイヤー斜め奥（Up-Right / Up-Left）SVG
  // ==========================================

  /** 冒険者プレイヤー（斜め後ろ待機） */
  /** 冒険者プレイヤー（斜め後ろ待機: 北東45度クォータービュー後ろ姿） */
  public static readonly PLAYER_DIAG_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 斜め後ろスタンスの足 -->
  <rect x="20" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="31" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <!-- 右奥（北東）へ翻る大マント -->
  <path d="M18 24 L8 50 L26 50 L48 54 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M22 26 L12 48 L26 48 L44 51 L32 26 Z" fill="#059669"/>
  <!-- 左背負いの盾裏 -->
  <path d="M12 24 Q9 38 16 42 Q24 38 22 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <circle cx="16" cy="33" r="2.5" fill="#fbbf24"/>
  <!-- 背中の剣（北東へ突き出る斜め鞘） -->
  <g transform="rotate(25 36 20)">
    <rect x="35" y="4" width="4" height="26" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#d97706"/>
    <circle cx="37" cy="5" r="2.5" fill="#fbbf24"/>
  </g>
  <!-- 兜の後頭部（明確に北東45度を向く） -->
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M24 16 Q31 21 38 17" stroke="#475569" stroke-width="2" fill="none"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（斜め後ろ歩行1） */
  public static readonly PLAYER_DIAG_UP_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="32" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(-4, -4)">
    <rect x="20" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="19" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M18 24 L6 48 L24 48 L48 53 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M12 24 Q9 38 16 42 Q24 38 22 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <g transform="rotate(25 36 20)">
    <rect x="35" y="4" width="4" height="26" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#d97706"/>
  </g>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（斜め後ろ歩行2） */
  public static readonly PLAYER_DIAG_UP_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="19" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <g transform="translate(4, -4)">
    <rect x="31" y="46" width="7" height="10" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="30" y="52" width="9" height="4" rx="1" fill="#0f172a"/>
  </g>
  <path d="M18 24 L10 52 L30 48 L50 51 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M12 24 Q9 38 16 42 Q24 38 22 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <g transform="rotate(25 36 20)">
    <rect x="35" y="4" width="4" height="26" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#d97706"/>
  </g>
  <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー（力尽き・倒れ姿: 膝をつき床へ崩れ伏した姿、散らばる剣と盾） */
  public static readonly PLAYER_DEAD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 地面の影と暗がり -->
  <ellipse cx="32" cy="46" rx="26" ry="10" fill="rgba(0,0,0,0.5)"/>
  <ellipse cx="34" cy="48" rx="14" ry="5" fill="rgba(153,27,27,0.3)"/>
  <!-- 床に大きく広がった緑のマント -->
  <path d="M12 40 Q24 32 44 36 Q52 46 40 52 Q22 54 12 40 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
  <path d="M16 42 Q26 36 40 38 Q46 46 36 50 Q22 51 16 42 Z" fill="#059669"/>
  <!-- 投げ出された両足（床に横倒し） -->
  <rect x="8" y="42" width="14" height="6" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" transform="rotate(-10 15 45)"/>
  <rect x="6" y="44" width="6" height="7" rx="2" fill="#0f172a"/>
  <!-- 横倒しになったアーマー胴体 -->
  <path d="M20 36 L36 34 L38 48 L22 50 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
  <rect x="22" y="42" width="14" height="4" fill="#d97706"/>
  <!-- 床に伏した頭部・外れかけた兜 -->
  <circle cx="42" cy="42" r="10" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <path d="M38 32 Q42 28 44 33 L41 38 Z" fill="#ef4444"/>
  <polygon points="40,40 50,42 48,46 38,44" fill="#0f172a"/>
  <!-- 手放して床に転がる丸盾 -->
  <ellipse cx="22" cy="30" rx="9" ry="5" fill="#2563eb" stroke="#fbbf24" stroke-width="1.5" transform="rotate(-20 22 30)"/>
  <circle cx="22" cy="30" r="2" fill="#fbbf24"/>
  <!-- 手放して床に転がった折れそうな剣 -->
  <g transform="rotate(75 48 46)">
    <rect x="46" y="24" width="3.5" height="24" rx="1" fill="#cbd5e1" stroke="#64748b" stroke-width="1"/>
    <rect x="42" y="44" width="11" height="3" fill="#d97706"/>
    <rect x="46.5" y="47" width="2.5" height="5" fill="#78350f"/>
  </g>
</svg>
`.trim();

  // ==========================================
  // 6. モンスターSVG（8方向対応）
  // ==========================================

  /** スライム正面（下向き） */
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
  <circle cx="38" cy="22" r="2" fill="#a7f3d0"/>
</svg>
`.trim();

  /** スライム背面（上向き） */
  public static readonly SLIME_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M32 10 C46 10 56 26 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 26 18 10 32 10 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <path d="M32 18 C42 18 50 30 50 42 C50 50 42 52 32 52 C22 52 14 50 14 42 C14 30 22 18 32 18 Z" fill="#34d399" opacity="0.6"/>
  <ellipse cx="30" cy="22" rx="8" ry="4" transform="rotate(-15 30 22)" fill="#a7f3d0"/>
  <circle cx="42" cy="26" r="3" fill="#a7f3d0"/>
</svg>
`.trim();

  /** スライム真横 */
  public static readonly SLIME_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M26 12 C44 14 56 28 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 28 16 12 26 12 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <ellipse cx="42" cy="36" rx="4.5" ry="6.5" fill="#064e3b"/>
  <circle cx="41" cy="34" r="2" fill="#ffffff"/>
  <ellipse cx="26" cy="22" rx="6" ry="3" fill="#a7f3d0"/>
</svg>
`.trim();

  /** スライム斜め手前 */
  public static readonly SLIME_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
  <path d="M30 11 C46 12 56 26 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 26 16 11 30 11 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
  <ellipse cx="30" cy="36" rx="4" ry="6" fill="#064e3b"/>
  <circle cx="29" cy="34" r="2" fill="#ffffff"/>
  <ellipse cx="44" cy="36" rx="3.5" ry="5.5" fill="#064e3b"/>
  <circle cx="43" cy="34" r="1.5" fill="#ffffff"/>
  <ellipse cx="26" cy="21" rx="6" ry="3" fill="#a7f3d0"/>
</svg>
`.trim();

  /** スライム斜め奥 */
  public static readonly SLIME_DIAG_UP_SVG = SVGSprites.SLIME_UP_SVG;

  /** ゴブリン正面 */
  public static readonly GOBLIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L4 18 L18 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <path d="M48 26 L60 18 L46 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <rect x="22" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <circle cx="32" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <circle cx="26" cy="27" r="3" fill="#dc2626"/>
  <circle cx="38" cy="27" r="3" fill="#dc2626"/>
  <polygon points="32,28 30,33 34,33" fill="#4d7c0f"/>
  <rect x="46" y="20" width="8" height="28" rx="3" transform="rotate(20 46 20)" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
</svg>
`.trim();

  /** ゴブリン背面 */
  public static readonly GOBLIN_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M16 26 L4 18 L18 32 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="1.5"/>
  <path d="M48 26 L60 18 L46 32 Z" fill="#65a30d" stroke="#4d7c0f" stroke-width="1.5"/>
  <circle cx="32" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <rect x="22" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <rect x="42" y="18" width="8" height="30" rx="3" transform="rotate(-15 42 18)" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
</svg>
`.trim();

  /** ゴブリン真横 */
  public static readonly GOBLIN_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M18 26 L6 18 L20 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <circle cx="30" cy="26" r="13" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <polygon points="38,25 48,29 38,32" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <circle cx="35" cy="24" r="3" fill="#dc2626"/>
  <rect x="22" y="32" width="18" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <rect x="36" y="24" width="8" height="26" rx="3" transform="rotate(35 36 24)" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
</svg>
`.trim();

  /** ゴブリン斜め手前 */
  public static readonly GOBLIN_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M14 26 L2 18 L16 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
  <circle cx="30" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
  <polygon points="36,25 44,28 36,31" fill="#84cc16"/>
  <circle cx="28" cy="26" r="3" fill="#dc2626"/>
  <circle cx="38" cy="26" r="2.5" fill="#dc2626"/>
  <rect x="20" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <rect x="42" y="20" width="8" height="28" rx="3" transform="rotate(25 42 20)" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
</svg>
`.trim();

  /** ゴブリン斜め奥 */
  public static readonly GOBLIN_DIAG_UP_SVG = SVGSprites.GOBLIN_UP_SVG;

  /** スケルトン正面 */
  public static readonly SKELETON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="30" y="30" width="4" height="22" fill="#e2e8f0"/>
  <line x1="22" y1="34" x2="42" y2="34" stroke="#cbd5e1" stroke-width="2.5"/>
  <line x1="24" y1="39" x2="40" y2="39" stroke="#cbd5e1" stroke-width="2.5"/>
  <circle cx="32" cy="20" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="27" cy="19" r="3.5" fill="#0f172a"/>
  <circle cx="27" cy="19" r="1.5" fill="#ef4444"/>
  <circle cx="37" cy="19" r="3.5" fill="#0f172a"/>
  <circle cx="37" cy="19" r="1.5" fill="#ef4444"/>
  <rect x="46" y="16" width="4" height="26" rx="1" transform="rotate(15 46 16)" fill="#713f12" stroke="#451a03" stroke-width="1"/>
</svg>
`.trim();

  /** スケルトン背面 */
  public static readonly SKELETON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="30" y="30" width="4" height="22" fill="#e2e8f0"/>
  <line x1="24" y1="34" x2="40" y2="34" stroke="#cbd5e1" stroke-width="3"/>
  <circle cx="32" cy="20" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="44" y="16" width="4" height="26" rx="1" transform="rotate(-15 44 16)" fill="#713f12" stroke="#451a03" stroke-width="1"/>
</svg>
`.trim();

  /** スケルトン真横 */
  public static readonly SKELETON_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <circle cx="30" cy="20" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="34" cy="19" r="3.5" fill="#0f172a"/>
  <circle cx="34" cy="19" r="1.5" fill="#ef4444"/>
  <rect x="28" y="30" width="4" height="22" fill="#e2e8f0"/>
  <rect x="36" y="24" width="22" height="4" rx="1" fill="#713f12" stroke="#451a03" stroke-width="1"/>
</svg>
`.trim();

  /** スケルトン斜め手前 */
  public static readonly SKELETON_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <rect x="29" y="30" width="4" height="22" fill="#e2e8f0"/>
  <line x1="22" y1="35" x2="38" y2="35" stroke="#cbd5e1" stroke-width="2.5"/>
  <circle cx="30" cy="20" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="27" cy="19" r="3.5" fill="#0f172a"/>
  <circle cx="27" cy="19" r="1.5" fill="#ef4444"/>
  <circle cx="36" cy="19" r="3" fill="#0f172a"/>
  <circle cx="36" cy="19" r="1" fill="#ef4444"/>
  <rect x="40" y="18" width="4" height="26" rx="1" transform="rotate(25 40 18)" fill="#713f12" stroke="#451a03" stroke-width="1"/>
</svg>
`.trim();

  /** スケルトン斜め奥 */
  public static readonly SKELETON_DIAG_UP_SVG = SVGSprites.SKELETON_UP_SVG;

  // ==========================================
  // 6-2. 新モンスターSVG（岩石ゴーレム、マンドラゴラ、サハギン戦士）
  // ==========================================

  /** 岩石ゴーレム正面 */
  public static readonly GOLEM_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.35)"/>
  <!-- 巨大な腕（左右） -->
  <rect x="8" y="24" width="11" height="26" rx="3" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <rect x="45" y="24" width="11" height="26" rx="3" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <!-- 岩石の胴体 -->
  <rect x="17" y="22" width="30" height="28" rx="4" fill="#57534e" stroke="#292524" stroke-width="2"/>
  <!-- 胸部魔導コア -->
  <circle cx="32" cy="36" r="6" fill="#f59e0b" stroke="#b45309" stroke-width="2"/>
  <circle cx="32" cy="36" r="2.5" fill="#fef08a"/>
  <!-- 四角い岩石頭部 -->
  <rect x="22" y="8" width="20" height="16" rx="2" fill="#a8a29e" stroke="#57534e" stroke-width="2"/>
  <rect x="26" y="14" width="4" height="3" fill="#fbbf24"/>
  <rect x="34" y="14" width="4" height="3" fill="#fbbf24"/>
  <!-- 脚部 -->
  <rect x="21" y="48" width="9" height="10" rx="2" fill="#44403c"/>
  <rect x="34" y="48" width="9" height="10" rx="2" fill="#44403c"/>
</svg>
`.trim();

  public static readonly GOLEM_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="24" ry="6" fill="rgba(0,0,0,0.35)"/>
  <rect x="8" y="24" width="11" height="26" rx="3" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <rect x="45" y="24" width="11" height="26" rx="3" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <rect x="17" y="22" width="30" height="28" rx="4" fill="#57534e" stroke="#292524" stroke-width="2"/>
  <!-- 背中の岩盤ヒビ割れ -->
  <line x1="24" y1="28" x2="38" y2="42" stroke="#44403c" stroke-width="2.5"/>
  <rect x="22" y="8" width="20" height="16" rx="2" fill="#78716c" stroke="#44403c" stroke-width="2"/>
  <rect x="21" y="48" width="9" height="10" rx="2" fill="#44403c"/>
  <rect x="34" y="48" width="9" height="10" rx="2" fill="#44403c"/>
</svg>
`.trim();

  /** 岩石ゴーレム（斜め手前: 45度立体岩石クォータービュー、前方へ巨拳を構える） */
  public static readonly GOLEM_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
  <!-- 斜め足 -->
  <rect x="18" y="46" width="9" height="11" rx="2" fill="#44403c"/>
  <rect x="29" y="47" width="10" height="11" rx="2" fill="#57534e" stroke="#292524" stroke-width="1.5"/>
  <!-- 立体的な斜め岩石胴体 -->
  <polygon points="16,26 36,22 44,36 24,48" fill="#78716c" stroke="#292524" stroke-width="2"/>
  <polygon points="16,26 24,48 18,46 12,28" fill="#57534e"/>
  <!-- 斜め岩石頭部 -->
  <polygon points="20,12 36,10 40,24 24,26" fill="#78716c" stroke="#292524" stroke-width="2"/>
  <!-- 琥珀色の瞳（右斜め前を睨む） -->
  <rect x="28" y="16" width="8" height="3" rx="1" fill="#0c0a09"/>
  <circle cx="31" cy="17.5" r="1.5" fill="#f59e0b"/>
  <circle cx="35" cy="17.5" r="1.5" fill="#f59e0b"/>
  <!-- 引いた左腕 -->
  <rect x="10" y="26" width="8" height="16" rx="3" fill="#57534e" stroke="#292524" stroke-width="1.5"/>
  <!-- 右斜め前方（南東45度）へ突き出された巨大岩石拳 -->
  <g transform="rotate(35 40 32)">
    <rect x="34" y="22" width="13" height="18" rx="4" fill="#a8a29e" stroke="#292524" stroke-width="2"/>
    <circle cx="40" cy="27" r="2.5" fill="#f59e0b"/>
  </g>
</svg>
`.trim();

  public static readonly GOLEM_SIDE_SVG = SVGSprites.GOLEM_DIAG_DOWN_SVG;
  public static readonly GOLEM_DIAG_UP_SVG = SVGSprites.GOLEM_UP_SVG;

  /** マンドラゴラ正面 */
  public static readonly MANDRAGORA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 丸い根茎の身体 -->
  <ellipse cx="32" cy="38" rx="16" ry="18" fill="#a16207" stroke="#713f12" stroke-width="2"/>
  <!-- 根のひげ（手足） -->
  <path d="M22 52 Q18 58 14 56" stroke="#713f12" stroke-width="2" fill="none"/>
  <path d="M42 52 Q46 58 50 56" stroke="#713f12" stroke-width="2" fill="none"/>
  <path d="M18 38 Q10 42 12 48" stroke="#713f12" stroke-width="2" fill="none"/>
  <path d="M46 38 Q54 42 52 48" stroke="#713f12" stroke-width="2" fill="none"/>
  <!-- 頭頂の瑞々しい双葉 -->
  <path d="M32 22 Q18 8 10 16 Q20 26 32 22 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
  <path d="M32 22 Q46 8 54 16 Q44 26 32 22 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
  <!-- つぶらな赤い瞳 -->
  <ellipse cx="25" cy="36" rx="3.5" ry="5" fill="#0f172a"/>
  <circle cx="24" cy="34" r="1.5" fill="#ffffff"/>
  <circle cx="26" cy="37" r="1" fill="#ef4444"/>
  <ellipse cx="39" cy="36" rx="3.5" ry="5" fill="#0f172a"/>
  <circle cx="38" cy="34" r="1.5" fill="#ffffff"/>
  <circle cx="40" cy="37" r="1" fill="#ef4444"/>
</svg>
`.trim();

  public static readonly MANDRAGORA_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
  <ellipse cx="32" cy="38" rx="16" ry="18" fill="#a16207" stroke="#713f12" stroke-width="2"/>
  <path d="M32 22 Q18 8 10 16 Q20 26 32 22 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
  <path d="M32 22 Q46 8 54 16 Q44 26 32 22 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
  <line x1="28" y1="32" x2="36" y2="40" stroke="#713f12" stroke-width="2"/>
</svg>
`.trim();

  /** マンドラゴラ（斜め手前: 45度斜め向き、瞳と葉っぱが斜めを向く） */
  public static readonly MANDRAGORA_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 斜め根茎身体 -->
  <ellipse cx="30" cy="38" rx="15" ry="17" fill="#a16207" stroke="#713f12" stroke-width="2"/>
  <!-- 斜め葉っぱ（右前方へたなびく） -->
  <path d="M28 22 Q20 6 12 12 Q20 22 28 22 Z" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
  <path d="M30 20 Q44 4 52 14 Q40 24 30 20 Z" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
  <!-- 斜めの顔パーツ（右斜め前を注視） -->
  <ellipse cx="28" cy="36" rx="3.5" ry="5" fill="#0f172a"/>
  <circle cx="28" cy="34" r="1.5" fill="#ffffff"/>
  <circle cx="29" cy="37" r="1" fill="#ef4444"/>
  <ellipse cx="38" cy="36" rx="3" ry="4.5" fill="#0f172a"/>
  <circle cx="38" cy="34" r="1.2" fill="#ffffff"/>
  <circle cx="39" cy="37" r="0.8" fill="#ef4444"/>
  <ellipse cx="33" cy="44" rx="3" ry="4" fill="#451a03"/>
  <path d="M24 52 Q20 60 24 60" stroke="#713f12" stroke-width="2.5" fill="none"/>
  <path d="M36 52 Q42 60 38 60" stroke="#713f12" stroke-width="2.5" fill="none"/>
</svg>
`.trim();

  public static readonly MANDRAGORA_SIDE_SVG = SVGSprites.MANDRAGORA_DIAG_DOWN_SVG;
  public static readonly MANDRAGORA_DIAG_UP_SVG = SVGSprites.MANDRAGORA_UP_SVG;

  /** サハギン戦士正面 */
  public static readonly SAHAGIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M18 20 L8 16 L14 26 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <path d="M46 20 L56 16 L50 26 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <path d="M22 20 Q16 40 22 52 L42 52 Q48 40 42 20 Z" fill="#0d9488" stroke="#115e59" stroke-width="2"/>
  <circle cx="32" cy="20" r="12" fill="#14b8a6" stroke="#0f766e" stroke-width="2"/>
  <circle cx="26" cy="20" r="3.5" fill="#facc15" stroke="#a16207" stroke-width="1"/>
  <circle cx="26" cy="20" r="1.5" fill="#0f172a"/>
  <circle cx="38" cy="20" r="3.5" fill="#facc15" stroke="#a16207" stroke-width="1"/>
  <circle cx="38" cy="20" r="1.5" fill="#0f172a"/>
  <path d="M28 32 Q32 30 36 32" stroke="#ccfbf1" stroke-width="1.5" fill="none"/>
  <path d="M27 38 Q32 36 37 38" stroke="#ccfbf1" stroke-width="1.5" fill="none"/>
  <line x1="48" y1="8" x2="48" y2="48" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M44 14 L48 6 L52 14" fill="none" stroke="#38bdf8" stroke-width="2"/>
  <line x1="48" y1="6" x2="48" y2="14" stroke="#38bdf8" stroke-width="2"/>
</svg>
`.trim();

  public static readonly SAHAGIN_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <path d="M18 20 L8 16 L14 26 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <path d="M46 20 L56 16 L50 26 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <path d="M22 20 Q16 40 22 52 L42 52 Q48 40 42 20 Z" fill="#0d9488" stroke="#115e59" stroke-width="2"/>
  <path d="M30 14 L34 14 L33 34 L31 34 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <circle cx="32" cy="20" r="12" fill="#0d9488" stroke="#0f766e" stroke-width="2"/>
  <line x1="48" y1="8" x2="48" y2="48" stroke="#cbd5e1" stroke-width="2"/>
</svg>
`.trim();

  /** サハギン戦士（斜め手前: 45度斜め向き、三叉槍を南東へ構える） */
  public static readonly SAHAGIN_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 斜めヒレ耳 -->
  <path d="M14 20 L6 14 L12 24 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <path d="M42 22 L52 18 L46 28 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.5"/>
  <!-- 斜め魚人身体 -->
  <path d="M20 22 Q16 42 20 54 L38 52 Q44 40 38 22 Z" fill="#0d9488" stroke="#115e59" stroke-width="2"/>
  <circle cx="28" cy="20" r="12" fill="#14b8a6" stroke="#0f766e" stroke-width="2"/>
  <!-- 斜め魚眼 -->
  <circle cx="26" cy="20" r="3.5" fill="#facc15" stroke="#a16207" stroke-width="1"/>
  <circle cx="27" cy="20" r="1.5" fill="#0f172a"/>
  <circle cx="36" cy="21" r="3" fill="#facc15" stroke="#a16207" stroke-width="1"/>
  <circle cx="37" cy="21" r="1.3" fill="#0f172a"/>
  <!-- 右斜め前方（南東45度）へ突き出された三叉槍 -->
  <g transform="rotate(35 44 26)">
    <line x1="44" y1="2" x2="44" y2="46" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M40 8 L44 0 L48 8" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <line x1="44" y1="0" x2="44" y2="8" stroke="#38bdf8" stroke-width="2"/>
  </g>
</svg>
`.trim();

  public static readonly SAHAGIN_SIDE_SVG = SVGSprites.SAHAGIN_DIAG_DOWN_SVG;
  public static readonly SAHAGIN_DIAG_UP_SVG = SVGSprites.SAHAGIN_UP_SVG;

  // ==========================================
  // 7. アイテムSVG（統一感のある中世ファンタジー調）
  // ==========================================

  /** 薬草・ポーション（丸底コルク瓶、エメラルド薬液、光沢、双葉） */
  public static readonly ITEM_POTION_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="28" y="14" width="8" height="6" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
  <ellipse cx="32" cy="14" rx="4" ry="1.5" fill="#d97706"/>
  <rect x="26" y="20" width="12" height="4" rx="1.5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
  <rect x="28" y="23" width="8" height="7" fill="rgba(255,255,255,0.2)"/>
  <circle cx="32" cy="42" r="16" fill="rgba(15,23,42,0.4)" stroke="#94a3b8" stroke-width="2"/>
  <path d="M18 42 C18 50 24 56 32 56 C40 56 46 50 46 42 Q39 40 32 42 Q25 44 18 42 Z" fill="#10b981"/>
  <circle cx="28" cy="46" r="2.5" fill="#34d399"/>
  <circle cx="36" cy="49" r="1.5" fill="#6ee7b7"/>
  <circle cx="33" cy="44" r="1" fill="#a7f3d0"/>
  <path d="M22 34 A 12 12 0 0 1 32 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
  <path d="M34 22 Q40 18 42 22 Q40 26 34 24 Z" fill="#22c55e"/>
</svg>
`.trim();

  /**
   * 大きなパン（中世ファンタジー風の大きな丸パン: 黄金の焼き色、ふっくら生地、十文字のクープ切り込み）
   */
  public static readonly ITEM_FOOD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 影 -->
  <ellipse cx="32" cy="56" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <!-- パン本体（ふっくら大きな丸パン・カンパーニュ） -->
  <path d="M12 44 C12 24 22 14 32 14 C42 14 52 24 52 44 C52 52 44 54 32 54 C20 54 12 52 12 44 Z" fill="#d97706" stroke="#78350f" stroke-width="2"/>
  <!-- こんがり焼き色のグラデーション層 -->
  <path d="M15 42 C15 26 23 18 32 18 C41 18 49 26 49 42 C49 48 42 50 32 50 C22 50 15 48 15 42 Z" fill="#f59e0b" opacity="0.85"/>
  <!-- 十文字のクープ（パンの切り込み）から覗くふんわり白い中身 -->
  <ellipse cx="32" cy="30" rx="14" ry="4" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
  <ellipse cx="32" cy="30" rx="4" ry="12" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
  <!-- クープの割れ目ライン -->
  <line x1="18" y1="30" x2="46" y2="30" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="32" y1="18" x2="32" y2="42" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
  <!-- 表面の小麦粉（粉糖）ハイライト -->
  <ellipse cx="24" cy="22" rx="4" ry="2" fill="#ffffff" opacity="0.6"/>
  <ellipse cx="40" cy="24" rx="3" ry="1.5" fill="#ffffff" opacity="0.6"/>
  <!-- 麦の穂アクセント -->
  <path d="M38 46 Q44 44 46 48" stroke="#78350f" stroke-width="1.5" fill="none"/>
</svg>
`.trim();

  /** 鉄の剣（鋭い鋼鉄刀身、黄金の鍔、ポメル宝玉） */
  public static readonly ITEM_WEAPON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,6 36,12 35,42 29,42 28,12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="32" y1="8" x2="32" y2="42" stroke="#64748b" stroke-width="1.5"/>
    <polygon points="32,8 35,14 34,38 32,38" fill="#ffffff" opacity="0.7"/>
    <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1"/>
    <circle cx="32" cy="44" r="2" fill="#fbbf24"/>
    <rect x="30" y="46.5" width="4" height="10" rx="1" fill="#1e293b"/>
    <circle cx="32" cy="58" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
    <circle cx="32" cy="58" r="1.5" fill="#38bdf8"/>
  </g>
</svg>
`.trim();

  /** 鋼の盾（深青ヒーターシールド、金縁、十字星エンブレム） */
  public static readonly ITEM_SHIELD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M16 16 L48 16 Q48 38 32 54 Q16 38 16 16 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
  <path d="M19 19 L45 19 Q45 36 32 50 Q19 36 19 19 Z" fill="#1e40af" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="32,24 34,31 41,31 35,35 37,42 32,38 27,42 29,35 23,31 30,31" fill="#fbbf24"/>
  <circle cx="32" cy="33" r="2.5" fill="#ef4444"/>
  <circle cx="21" cy="21" r="1.5" fill="#fbbf24"/>
  <circle cx="43" cy="21" r="1.5" fill="#fbbf24"/>
  <path d="M22 22 L38 22" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
</svg>
`.trim();

  /** ワープの巻物（古代羊皮紙、木製巻き軸、魔法文字ルーン、封蝋） */
  public static readonly ITEM_SCROLL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="12" y="16" width="40" height="4" rx="2" fill="#78350f"/>
  <circle cx="12" cy="18" r="3" fill="#b45309"/>
  <circle cx="52" cy="18" r="3" fill="#b45309"/>
  <rect x="12" y="46" width="40" height="4" rx="2" fill="#78350f"/>
  <circle cx="12" cy="48" r="3" fill="#b45309"/>
  <circle cx="52" cy="48" r="3" fill="#b45309"/>
  <rect x="15" y="18" width="34" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <line x1="20" y1="24" x2="44" y2="24" stroke="#c084fc" stroke-width="2" stroke-dasharray="3,2"/>
  <line x1="20" y1="29" x2="38" y2="29" stroke="#c084fc" stroke-width="2" stroke-dasharray="4,2"/>
  <line x1="20" y1="34" x2="44" y2="34" stroke="#c084fc" stroke-width="2" stroke-dasharray="2,3"/>
  <line x1="20" y1="39" x2="32" y2="39" stroke="#c084fc" stroke-width="2" stroke-dasharray="3,2"/>
  <rect x="30" y="18" width="4" height="30" fill="#ec4899"/>
  <circle cx="32" cy="33" r="5" fill="#f43f5e" stroke="#fbbf24" stroke-width="1.5"/>
  <polygon points="32,30 33,32 35,32 33,34 34,36 32,35 30,36 31,34 29,32 31,32" fill="#fbbf24"/>
</svg>
`.trim();

  /** 特薬草（黄金装飾のクリスタル薬瓶、エメラルドに輝く濃密薬液） */
  public static readonly ITEM_POTION_HIGH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="27" y="12" width="10" height="7" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
  <circle cx="32" cy="11" r="3" fill="#fbbf24"/>
  <rect x="24" y="19" width="16" height="5" rx="2" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="17" fill="rgba(15,23,42,0.5)" stroke="#fbbf24" stroke-width="2.5"/>
  <path d="M17 42 C17 51 24 57 32 57 C40 57 47 51 47 42 Q39 40 32 42 Q25 44 17 42 Z" fill="#059669"/>
  <circle cx="28" cy="46" r="3" fill="#34d399"/>
  <circle cx="36" cy="49" r="2" fill="#6ee7b7"/>
  <circle cx="33" cy="44" r="1.5" fill="#a7f3d0"/>
  <polygon points="32,24 34,29 39,29 35,32 37,37 32,34 27,37 29,32 25,29 30,29" fill="#fbbf24"/>
</svg>
`.trim();

  /** 力の種（燃えるような橙赤色の神秘のどんぐり種子、金の葉脈、オーラ） */
  public static readonly ITEM_SEED_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 12 C44 12 50 32 48 46 C46 54 18 54 16 46 C14 32 20 12 32 12 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
  <path d="M32 14 L32 50" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
  <path d="M32 24 Q42 22 46 28" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
  <path d="M32 24 Q22 22 18 28" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
  <path d="M32 34 Q42 32 46 38" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
  <path d="M32 34 Q22 32 18 38" stroke="#fbbf24" stroke-width="1.5" fill="none"/>
  <ellipse cx="32" cy="14" rx="10" ry="4" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="30" y="8" width="4" height="6" rx="1" fill="#78350f"/>
</svg>
`.trim();

  /** ミスリルの剣（白銀と聖なる蒼光を帯びた魔導剣） */
  public static readonly ITEM_WEAPON_MITHRIL_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,4 37,12 35,42 29,42 27,12" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
    <line x1="32" y1="6" x2="32" y2="42" stroke="#818cf8" stroke-width="1.5"/>
    <polygon points="32,6 35,12 34,38 32,38" fill="#ffffff" opacity="0.9"/>
    <path d="M18 42 Q32 38 46 42 L42 46 L22 46 Z" fill="#4338ca" stroke="#312e81" stroke-width="1.5"/>
    <circle cx="32" cy="44" r="2.5" fill="#38bdf8"/>
    <rect x="30" y="46" width="4" height="10" rx="1" fill="#1e1b4b"/>
    <circle cx="32" cy="58" r="4" fill="#6366f1" stroke="#38bdf8" stroke-width="1.5"/>
  </g>
</svg>
`.trim();

  /** ドラゴンの盾（紅蓮の竜鱗、黄金の竜頭クレスト） */
  public static readonly ITEM_SHIELD_DRAGON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M14 14 L50 14 Q52 38 32 56 Q12 38 14 14 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
  <path d="M18 18 L46 18 Q48 36 32 50 Q16 36 18 18 Z" fill="#b91c1c" stroke="#fbbf24" stroke-width="2"/>
  <polygon points="32,22 36,30 44,28 38,36 40,44 32,39 24,44 26,36 20,28 28,30" fill="#fbbf24"/>
  <circle cx="32" cy="34" r="3" fill="#ef4444"/>
</svg>
`.trim();

  // ==========================================
  // 8. ダンジョンタイルSVG（下り階段）
  // ==========================================

  /** 下り階段（重厚な石造りダンジョン階段、奥へ続くステップ、黄金の誘導光彩） */
  public static readonly STAIRS_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 外枠石畳ベース -->
  <rect x="4" y="4" width="56" height="56" rx="4" fill="#0f172a" stroke="#475569" stroke-width="2"/>
  <!-- 階段開口部の暗黒深淵 -->
  <rect x="10" y="8" width="44" height="48" rx="2" fill="#030712"/>
  <!-- 深層からの光彩グラデーション -->
  <polygon points="16,10 48,10 52,52 12,52" fill="rgba(251, 191, 36, 0.18)"/>
  <!-- 石段ステップ（手前から奥へ下るパース） -->
  <!-- 1段目（最も手前） -->
  <polygon points="10,48 54,48 52,56 12,56" fill="#475569" stroke="#1e293b" stroke-width="1"/>
  <rect x="12" y="48" width="40" height="2.5" fill="#64748b"/>
  <!-- 2段目 -->
  <polygon points="12,40 52,40 50,48 14,48" fill="#334155" stroke="#1e293b" stroke-width="1"/>
  <rect x="14" y="40" width="36" height="2" fill="#475569"/>
  <!-- 3段目 -->
  <polygon points="14,32 50,32 48,40 16,40" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
  <rect x="16" y="32" width="32" height="1.8" fill="#334155"/>
  <!-- 4段目 -->
  <polygon points="16,24 48,24 46,32 18,32" fill="#0f172a" stroke="#030712" stroke-width="1"/>
  <rect x="18" y="24" width="28" height="1.5" fill="#1e293b"/>
  <!-- 5段目（奥の暗がり） -->
  <polygon points="18,16 46,16 44,24 20,24" fill="#030712"/>
  <!-- 左右の石壁手すり -->
  <path d="M4 4 L10 8 L10 56 L4 60 Z" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <path d="M60 4 L54 8 L54 56 L60 60 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <!-- 誘導の黄金インジケータ（光る下り矢印） -->
  <polygon points="32,22 38,15 26,15" fill="#fbbf24"/>
  <polygon points="32,32 37,25 27,25" fill="#f59e0b" opacity="0.7"/>
</svg>
`.trim();

  // 後方互換用エイリアス
  public static readonly PLAYER_SVG = SVGSprites.PLAYER_DOWN_SVG;
  public static readonly PLAYER_WALK1_SVG = SVGSprites.PLAYER_DOWN_WALK1_SVG;
  public static readonly PLAYER_WALK2_SVG = SVGSprites.PLAYER_DOWN_WALK2_SVG;
  public static readonly SLIME_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly GOBLIN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly SKELETON_SVG = SVGSprites.SKELETON_DOWN_SVG;

  /**
   * 全スプライトの事前ロードを開始します。
   * インラインSVG文字列を Data URL に変換し、HTMLImageElement としてメモリ内にキャッシュします。
   *
   * @returns 全画像ロード完了を示すPromise
   */
  public static init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    const spriteMap: Record<SpriteId, string> = {
      // プレイヤー正面（下）
      player: this.PLAYER_DOWN_SVG,
      player_down: this.PLAYER_DOWN_SVG,
      player_down_walk1: this.PLAYER_DOWN_WALK1_SVG,
      player_down_walk2: this.PLAYER_DOWN_WALK2_SVG,
      player_walk1: this.PLAYER_DOWN_WALK1_SVG,
      player_walk2: this.PLAYER_DOWN_WALK2_SVG,
      // プレイヤー背面（上）
      player_up: this.PLAYER_UP_SVG,
      player_up_walk1: this.PLAYER_UP_WALK1_SVG,
      player_up_walk2: this.PLAYER_UP_WALK2_SVG,
      // プレイヤー真横
      player_side: this.PLAYER_SIDE_SVG,
      player_side_walk1: this.PLAYER_SIDE_WALK1_SVG,
      player_side_walk2: this.PLAYER_SIDE_WALK2_SVG,
      // プレイヤー斜め手前
      player_diag_down: this.PLAYER_DIAG_DOWN_SVG,
      player_diag_down_walk1: this.PLAYER_DIAG_DOWN_WALK1_SVG,
      player_diag_down_walk2: this.PLAYER_DIAG_DOWN_WALK2_SVG,
      // プレイヤー斜め奥
      player_diag_up: this.PLAYER_DIAG_UP_SVG,
      player_diag_up_walk1: this.PLAYER_DIAG_UP_WALK1_SVG,
      player_diag_up_walk2: this.PLAYER_DIAG_UP_WALK2_SVG,
      // プレイヤー倒れ姿（力尽き）
      player_dead: this.PLAYER_DEAD_SVG,
      // 階段タイル
      tile_stairs_down: this.STAIRS_DOWN_SVG,
      // スライム
      slime: this.SLIME_DOWN_SVG,
      slime_down: this.SLIME_DOWN_SVG,
      slime_up: this.SLIME_UP_SVG,
      slime_side: this.SLIME_SIDE_SVG,
      slime_diag_down: this.SLIME_DIAG_DOWN_SVG,
      slime_diag_up: this.SLIME_DIAG_UP_SVG,
      // ゴブリン
      goblin: this.GOBLIN_DOWN_SVG,
      goblin_down: this.GOBLIN_DOWN_SVG,
      goblin_up: this.GOBLIN_UP_SVG,
      goblin_side: this.GOBLIN_SIDE_SVG,
      goblin_diag_down: this.GOBLIN_DIAG_DOWN_SVG,
      goblin_diag_up: this.GOBLIN_DIAG_UP_SVG,
      // スケルトン
      skeleton: this.SKELETON_DOWN_SVG,
      skeleton_down: this.SKELETON_DOWN_SVG,
      skeleton_up: this.SKELETON_UP_SVG,
      skeleton_side: this.SKELETON_SIDE_SVG,
      skeleton_diag_down: this.SKELETON_DIAG_DOWN_SVG,
      skeleton_diag_up: this.SKELETON_DIAG_UP_SVG,
      // 岩石ゴーレム
      golem: this.GOLEM_DOWN_SVG,
      golem_down: this.GOLEM_DOWN_SVG,
      golem_up: this.GOLEM_UP_SVG,
      golem_side: this.GOLEM_SIDE_SVG,
      golem_diag_down: this.GOLEM_DIAG_DOWN_SVG,
      golem_diag_up: this.GOLEM_DIAG_UP_SVG,
      // マンドラゴラ
      mandragora: this.MANDRAGORA_DOWN_SVG,
      mandragora_down: this.MANDRAGORA_DOWN_SVG,
      mandragora_up: this.MANDRAGORA_UP_SVG,
      mandragora_side: this.MANDRAGORA_SIDE_SVG,
      mandragora_diag_down: this.MANDRAGORA_DIAG_DOWN_SVG,
      mandragora_diag_up: this.MANDRAGORA_DIAG_UP_SVG,
      // サハギン戦士
      sahagin: this.SAHAGIN_DOWN_SVG,
      sahagin_down: this.SAHAGIN_DOWN_SVG,
      sahagin_up: this.SAHAGIN_UP_SVG,
      sahagin_side: this.SAHAGIN_SIDE_SVG,
      sahagin_diag_down: this.SAHAGIN_DIAG_DOWN_SVG,
      sahagin_diag_up: this.SAHAGIN_DIAG_UP_SVG,
      // アイテム（中世ファンタジー調）
      item_potion: this.ITEM_POTION_SVG,
      item_potion_high: this.ITEM_POTION_HIGH_SVG,
      item_seed: this.ITEM_SEED_SVG,
      item_food: this.ITEM_FOOD_SVG,
      item_weapon: this.ITEM_WEAPON_SVG,
      item_weapon_mithril: this.ITEM_WEAPON_MITHRIL_SVG,
      item_shield: this.ITEM_SHIELD_SVG,
      item_shield_dragon: this.ITEM_SHIELD_DRAGON_SVG,
      item_scroll: this.ITEM_SCROLL_SVG,
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

    this.readyPromise = Promise.all([...promises, TileSprites.init()]).then(() => {});
    return this.readyPromise;
  }

  /**
   * キャッシュされたスプライト画像を取得します。
   *
   * @param id - スプライトID
   * @returns ロード済みの HTMLImageElement。未ロードの場合は undefined
   */
  public static get(id: SpriteId): HTMLImageElement | undefined {
    return this.imageCache.get(id);
  }

  /**
   * アイテムのカテゴリおよびアイテム名から対応するスプライトIDを取得します。
   *
   * @param category - アイテムカテゴリ（'POTION', 'FOOD', 'WEAPON', 'SHIELD', 'SCROLL'）
   * @param name - アイテム名（オプション。特薬草やミスリルの剣などの個別スプライト判定用）
   * @returns 対応するスプライトID
   */
  public static getItemSpriteId(
    category: ItemCategory,
    name?: string
  ): SpriteId {
    if (name) {
      if (name === '特薬草') return 'item_potion_high';
      if (name === '力の種') return 'item_seed';
      if (name === 'ミスリルの剣') return 'item_weapon_mithril';
      if (name === 'ドラゴンの盾') return 'item_shield_dragon';
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
