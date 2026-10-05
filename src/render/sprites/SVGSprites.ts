/**
 * @file SVGSprites.ts
 * @description ベクターSVGベースのキャラクターおよびアイテムグラフィックスプライトを定義・キャッシュ・描画するクラス。
 * 外部通信を一切行わず、インラインSVGデータを内部でCanvas描画用Imageオブジェクトに変換して高速キャッシュします。
 * プレイヤーは素体（Base）として描画され、装備中の武器・盾はEquipmentSpritesによってリアルタイム動的合成されます。
 * 全10種のモンスター（各5方向/8方向）および全16種のアイテムに対応します。
 */

import { ItemCategory, ObstacleType } from '../../core/types';
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
  // 人食い箱 (MIMIC)
  | 'mimic'
  | 'mimic_down'
  | 'mimic_up'
  | 'mimic_side'
  | 'mimic_diag_down'
  | 'mimic_diag_up'
  // 腐乱ゾンビ (ZOMBIE)
  | 'zombie'
  | 'zombie_down'
  | 'zombie_up'
  | 'zombie_side'
  | 'zombie_diag_down'
  | 'zombie_diag_up'
  // 小悪魔インプ (IMP)
  | 'imp'
  | 'imp_down'
  | 'imp_up'
  | 'imp_side'
  | 'imp_diag_down'
  | 'imp_diag_up'
  // 古代のミイラ (MUMMY)
  | 'mummy'
  | 'mummy_down'
  | 'mummy_up'
  | 'mummy_side'
  | 'mummy_diag_down'
  | 'mummy_diag_up'
  // アイテムグラフィックスプライト
  | 'item_potion'
  | 'item_potion_high'
  | 'item_potion_str'
  | 'item_potion_antidote'
  | 'item_potion_agi'
  | 'item_seed'
  | 'item_food'
  | 'item_food_riceball'
  | 'item_food_big_riceball'
  | 'item_weapon'
  | 'item_weapon_dagger'
  | 'item_weapon_mithril'
  | 'item_weapon_flame'
  | 'item_weapon_rune'
  | 'item_weapon_muramasa'
  | 'item_weapon_warhammer'
  | 'item_weapon_holy_lance'
  | 'item_shield'
  | 'item_shield_wood'
  | 'item_shield_bronze'
  | 'item_shield_magic'
  | 'item_shield_dragon'
  | 'item_shield_wind'
  | 'item_shield_tower'
  | 'item_shield_aegis'
  | 'item_scroll'
  | 'item_scroll_thunder'
  | 'item_scroll_light'
  | 'item_scroll_sleep'
  | 'item_scroll_confuse'
  | 'item_scroll_upgrade_atk'
  | 'item_scroll_upgrade_def'
  | 'item_scroll_vacuum'
  // 飛び道具（矢）
  | 'item_arrow'
  | 'item_arrow_iron'
  | 'item_arrow_silver'
  // 魔法の杖
  | 'item_staff'
  | 'item_staff_blast'
  | 'item_staff_switch'
  | 'item_staff_paralyze'
  | 'item_staff_thunder'
  // 腕輪
  | 'item_ring'
  // 追加の草
  | 'item_potion_revive'
  | 'item_potion_otogiri'
  | 'item_potion_life'
  // 障害物グラフィックスプライト
  | 'obstacle_dirt_block'
  | 'obstacle_tree_stump'
  | 'obstacle_snow_mound'
  | 'obstacle_push_rock'
  | 'obstacle_ice_block';

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
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <!-- マント（背面の深い布ドレープ） -->
  <path d="M18 24 L11 53 Q21 51 32 53 Q43 51 53 53 L46 24 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <path d="M22 28 L15 51 Q23 49 32 51 Q41 49 49 51 L42 28 Z" fill="#059669" opacity="0.35"/>
  <!-- 両足（プレートグリーブ・膝甲・鉄靴） -->
  <rect x="22" y="43" width="8" height="12" rx="2.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="26" cy="45" rx="3.5" ry="2" fill="#94a3b8" opacity="0.8"/>
  <path d="M21 52 L31 52 L31 56 Q26 57.5 20 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="34" y="43" width="8" height="12" rx="2.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="38" cy="45" rx="3.5" ry="2" fill="#94a3b8" opacity="0.8"/>
  <path d="M33 52 L43 52 L44 56 Q38 57.5 33 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 胴体胸甲（ブレストプレート・チェスト稜線） -->
  <path d="M21 23 L43 23 L41 43 L23 43 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M32 24 L32 42" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M24 26 Q32 29 40 26" stroke="#334155" stroke-width="1" fill="none"/>
  <!-- 金装飾エンブレム -->
  <polygon points="32,27 34,31 32,35 30,31" fill="#fbbf24"/>
  <!-- ベルト & タセット -->
  <rect x="21" y="40" width="22" height="4.5" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <rect x="30" y="39.5" width="4" height="5.5" rx="1" fill="#fbbf24"/>
  <!-- 左右ショルダーガード（ポールトロン） -->
  <path d="M16 23 Q21 21 24 25 L21 31 Q16 30 14 26 Z" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="19" cy="24" rx="2.5" ry="1.2" fill="#94a3b8" opacity="0.75"/>
  <path d="M48 23 Q43 21 40 25 L43 31 Q48 30 50 26 Z" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="45" cy="24" rx="2.5" ry="1.2" fill="#94a3b8" opacity="0.75"/>
  <!-- 鋼鉄ガントレット手甲（素手拳） -->
  <ellipse cx="17" cy="35" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="16.5" cy="34" r="1.5" fill="#94a3b8"/>
  <ellipse cx="47" cy="35" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="47.5" cy="34" r="1.5" fill="#94a3b8"/>
  <!-- 兜（サレット / ナイトヘルメット） -->
  <path d="M22 17 C22 10 42 10 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M25 14 Q32 11 39 14" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- スリットバイザー -->
  <path d="M24 18 L40 18 L38 22 L26 22 Z" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="27" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <rect x="34" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <!-- 兜頂部のクレスト羽飾り -->
  <path d="M30 11 Q32 3 36 2 Q35 7 34 12 Z" fill="#dc2626"/>
  <path d="M29 11 Q31 5 34 4 Q33 8 32 12 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（正面歩行1） */
  public static readonly PLAYER_DOWN_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M18 24 L9 51 Q20 50 31 52 Q42 50 51 53 L46 24 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <!-- 左足踏み込み（前） -->
  <g transform="translate(-4, -1)">
    <rect x="22" y="42" width="8.5" height="13" rx="2.5" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="26" cy="44" rx="3.5" ry="2" fill="#cbd5e1"/>
    <path d="M21 52 L31 52 L32 56 Q26 58 19 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <!-- 右足後退（後ろ） -->
  <g transform="translate(3, 0)">
    <rect x="34" y="44" width="7.5" height="11" rx="2.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M33 51 L42 51 L43 55 Q38 56.5 33 55 Z" fill="#0f172a"/>
  </g>
  <!-- 胴体胸甲 -->
  <path d="M21 23 L43 23 L41 43 L23 43 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M32 24 L32 42" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
  <polygon points="32,27 34,31 32,35 30,31" fill="#fbbf24"/>
  <rect x="21" y="40" width="22" height="4.5" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <rect x="30" y="39.5" width="4" height="5.5" rx="1" fill="#fbbf24"/>
  <!-- 肩・腕スイング -->
  <ellipse cx="15" cy="33" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="14.5" cy="32" r="1.5" fill="#94a3b8"/>
  <ellipse cx="49" cy="37" rx="3.5" ry="3.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 兜 -->
  <path d="M22 17 C22 10 42 10 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M25 14 Q32 11 39 14" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M24 18 L40 18 L38 22 L26 22 Z" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="27" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <rect x="34" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <path d="M30 11 Q32 3 36 2 Q35 7 34 12 Z" fill="#dc2626"/>
  <path d="M29 11 Q31 5 34 4 Q33 8 32 12 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（正面歩行2） */
  public static readonly PLAYER_DOWN_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M18 24 L13 53 Q22 50 33 52 Q44 50 55 51 L46 24 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <!-- 左足後退 -->
  <g transform="translate(-2, 0)">
    <rect x="23" y="44" width="7.5" height="11" rx="2.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
    <path d="M22 51 L31 51 L31 55 Q26 56.5 21 55 Z" fill="#0f172a"/>
  </g>
  <!-- 右足踏み込み（前） -->
  <g transform="translate(3, -1)">
    <rect x="33" y="42" width="8.5" height="13" rx="2.5" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="37" cy="44" rx="3.5" ry="2" fill="#cbd5e1"/>
    <path d="M32 52 L42 52 L44 56 Q38 58 32 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <!-- 胴体胸甲 -->
  <path d="M21 23 L43 23 L41 43 L23 43 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <path d="M32 24 L32 42" stroke="#94a3b8" stroke-width="1.2" stroke-linecap="round"/>
  <polygon points="32,27 34,31 32,35 30,31" fill="#fbbf24"/>
  <rect x="21" y="40" width="22" height="4.5" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <rect x="30" y="39.5" width="4" height="5.5" rx="1" fill="#fbbf24"/>
  <!-- 肩・腕スイング -->
  <ellipse cx="19" cy="37" rx="3.5" ry="3.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="45" cy="33" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="45.5" cy="32" r="1.5" fill="#94a3b8"/>
  <!-- 兜 -->
  <path d="M22 17 C22 10 42 10 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M25 14 Q32 11 39 14" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <path d="M24 18 L40 18 L38 22 L26 22 Z" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="27" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <rect x="34" y="19" width="3" height="1.8" rx="0.5" fill="#38bdf8"/>
  <path d="M30 11 Q32 3 36 2 Q35 7 34 12 Z" fill="#dc2626"/>
  <path d="M29 11 Q31 5 34 4 Q33 8 32 12 Z" fill="#ef4444"/>
</svg>
`.trim();

  // ==========================================
  // 2. プレイヤー背面（Up / 真上・北・後ろ姿）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（背面待機） */
  public static readonly PLAYER_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <!-- 鉄靴 -->
  <rect x="22" y="47" width="8" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="34" y="47" width="8" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <!-- マント背面の豪奢な広がり -->
  <path d="M19 22 L11 53 Q21 50 32 53 Q43 50 53 53 L45 22 Z" fill="#047857" stroke="#022c22" stroke-width="1.5"/>
  <path d="M24 25 L16 51 Q23 48 32 50 Q41 48 48 51 L40 25 Z" fill="#059669"/>
  <!-- 兜後頭部 -->
  <path d="M22 17 C22 9 42 9 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M24 18 Q32 22 40 18" stroke="#334155" stroke-width="2" fill="none"/>
  <!-- クレスト（後方へ流れる真紅の羽飾り） -->
  <path d="M30 6 Q32 1 35 3 L34 15 L31 15 Z" fill="#dc2626"/>
  <path d="M29 7 Q31 3 33 4 L33 13 L31 13 Z" fill="#ef4444"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（背面歩行1） */
  public static readonly PLAYER_UP_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="35" y="48" width="7.5" height="8.5" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <g transform="translate(-4, -3)">
    <rect x="22" y="47" width="8" height="9.5" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="26" cy="48" rx="3.5" ry="1.8" fill="#94a3b8"/>
  </g>
  <path d="M19 22 L8 52 Q18 49 29 52 Q40 48 53 54 L45 22 Z" fill="#047857" stroke="#022c22" stroke-width="1.5"/>
  <path d="M24 25 L13 50 Q22 47 30 49 Q40 46 48 51 L40 25 Z" fill="#059669"/>
  <path d="M22 17 C22 9 42 9 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M29 6 Q31 1 35 3 L34 15 L30 15 Z" fill="#dc2626"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（背面歩行2） */
  public static readonly PLAYER_UP_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="22" y="48" width="7.5" height="8.5" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <g transform="translate(4, -3)">
    <rect x="34" y="47" width="8" height="9.5" rx="2" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="38" cy="48" rx="3.5" ry="1.8" fill="#94a3b8"/>
  </g>
  <path d="M19 22 L11 54 Q24 48 35 52 Q46 49 56 52 L45 22 Z" fill="#047857" stroke="#022c22" stroke-width="1.5"/>
  <path d="M24 25 L16 52 Q26 46 36 49 Q44 47 51 49 L40 25 Z" fill="#059669"/>
  <path d="M22 17 C22 9 42 9 42 17 C42 24 38 27 32 27 C26 27 22 24 22 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M30 6 Q32 1 36 3 L35 15 L31 15 Z" fill="#dc2626"/>
</svg>
`.trim();

  // ==========================================
  // 3. プレイヤー真横（Side / 東・西）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（真横待機） */
  public static readonly PLAYER_SIDE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="19" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <!-- マント（背中に流れる） -->
  <path d="M21 24 L10 52 L26 50 L26 28 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <path d="M21 26 L14 49 L24 48 L25 30 Z" fill="#059669" opacity="0.4"/>
  <!-- 足（奥足・手前足） -->
  <rect x="23" y="44" width="8" height="12" rx="2.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="29" y="43" width="8" height="13" rx="2.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="33" cy="45" rx="3.5" ry="2" fill="#94a3b8" opacity="0.8"/>
  <path d="M28 52 L39 52 L40 56 Q34 57.5 28 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <!-- 胴体胸甲（側面） -->
  <path d="M21 23 L39 25 L37 44 L23 44 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="28" y1="24" x2="28" y2="43" stroke="#94a3b8" stroke-width="1.2"/>
  <rect x="22" y="40" width="16" height="4.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <!-- 肩甲と手甲（拳） -->
  <path d="M25 24 Q30 22 33 26 L30 32 Q25 31 23 27 Z" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="27" cy="25" rx="2.5" ry="1.2" fill="#94a3b8"/>
  <ellipse cx="36" cy="33" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="37" cy="32" r="1.5" fill="#94a3b8"/>
  <!-- 兜横顔 -->
  <path d="M20 17 C20 10 40 10 40 17 C40 24 36 27 30 27 C24 27 20 24 20 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M24 13 Q31 10 38 13" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <!-- 横向きスリットバイザー -->
  <polygon points="29,17 41,19 39,23 29,21" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="34" y="19" width="4.5" height="2" rx="0.5" fill="#38bdf8"/>
  <!-- クレスト（後方への羽） -->
  <path d="M24 10 Q28 2 34 3 Q31 8 28 13 Z" fill="#dc2626"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（真横歩行1） */
  public static readonly PLAYER_SIDE_WALK1_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M21 24 L7 50 L23 48 L26 28 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <g transform="translate(-4, 0) rotate(-15 22 44)">
    <rect x="20" y="44" width="7" height="11" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <g transform="translate(6, -1) rotate(15 32 44)">
    <rect x="29" y="42" width="8.5" height="13" rx="2.5" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="33" cy="44" rx="3.5" ry="2" fill="#cbd5e1"/>
    <path d="M28 52 L39 52 L40 56 Q34 57.5 28 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <path d="M21 23 L39 25 L37 44 L23 44 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="22" y="40" width="16" height="4.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <ellipse cx="38" cy="30" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="39" cy="29" r="1.5" fill="#94a3b8"/>
  <path d="M20 17 C20 10 40 10 40 17 C40 24 36 27 30 27 C24 27 20 24 20 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <polygon points="29,17 41,19 39,23 29,21" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="34" y="19" width="4.5" height="2" rx="0.5" fill="#38bdf8"/>
  <path d="M24 10 Q28 2 34 3 Q31 8 28 13 Z" fill="#dc2626"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（真横歩行2） */
  public static readonly PLAYER_SIDE_WALK2_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="21" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M21 24 L11 54 L25 50 L26 28 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <g transform="translate(-2, 0) rotate(10 24 44)">
    <rect x="22" y="44" width="8" height="12" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <g transform="translate(4, -2) rotate(-10 32 44)">
    <rect x="28" y="43" width="8.5" height="13" rx="2.5" fill="#64748b" stroke="#0f172a" stroke-width="1.2"/>
    <ellipse cx="32" cy="45" rx="3.5" ry="2" fill="#cbd5e1"/>
    <path d="M27 52 L38 52 L39 56 Q33 57.5 27 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  </g>
  <path d="M21 23 L39 25 L37 44 L23 44 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <rect x="22" y="40" width="16" height="4.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <ellipse cx="35" cy="35" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="36" cy="34" r="1.5" fill="#94a3b8"/>
  <path d="M20 17 C20 10 40 10 40 17 C40 24 36 27 30 27 C24 27 20 24 20 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <polygon points="29,17 41,19 39,23 29,21" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="34" y="19" width="4.5" height="2" rx="0.5" fill="#38bdf8"/>
  <path d="M24 10 Q28 2 34 3 Q31 8 28 13 Z" fill="#dc2626"/>
</svg>
`.trim();

  // ==========================================
  // 4. プレイヤー斜め手前（Down-Right / Down-Left）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（斜め前待機） */
  public static readonly PLAYER_DIAG_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M16 25 L6 52 Q18 51 30 52 L44 53 L38 27 Z" fill="#047857" stroke="#022c22" stroke-width="1.2"/>
  <rect x="19" y="43" width="7.5" height="12" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="30" y="43" width="8.5" height="13" rx="2.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="34" cy="45" rx="3.5" ry="2" fill="#94a3b8"/>
  <path d="M29 52 L40 52 L41 56 Q35 57.5 29 56 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <path d="M18 23 L40 26 L36 44 L19 43 Z" fill="#475569" stroke="#0f172a" stroke-width="1.5"/>
  <line x1="28" y1="24" x2="27" y2="43" stroke="#94a3b8" stroke-width="1.2"/>
  <polygon points="28,28 30,32 28,36 26,32" fill="#fbbf24"/>
  <rect x="18" y="40" width="19" height="4.5" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <!-- 両手の拳 -->
  <ellipse cx="15" cy="35" rx="3.5" ry="3.5" fill="#334155" stroke="#0f172a" stroke-width="1.2"/>
  <ellipse cx="43" cy="33" rx="3.5" ry="3.5" fill="#475569" stroke="#0f172a" stroke-width="1.2"/>
  <circle cx="43.5" cy="32" r="1.5" fill="#94a3b8"/>
  <!-- 兜（クォータービュー） -->
  <path d="M21 17 C21 10 39 10 39 17 C39 24 35 27 29 27 C23 27 21 24 21 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M24 13 Q31 10 37 13" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  <polygon points="25,17 39,19 36,23 24,21" fill="#090d16" stroke="#1e293b" stroke-width="1"/>
  <rect x="30" y="19" width="6" height="2" rx="0.5" fill="#38bdf8"/>
  <path d="M26 10 Q29 2 34 3 Q31 8 29 13 Z" fill="#dc2626"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め前歩行1） */
  public static readonly PLAYER_DIAG_DOWN_WALK1_SVG = SVGSprites.PLAYER_DIAG_DOWN_SVG;
  /** 冒険者プレイヤー素体（斜め前歩行2） */
  public static readonly PLAYER_DIAG_DOWN_WALK2_SVG = SVGSprites.PLAYER_DIAG_DOWN_SVG;

  // ==========================================
  // 5. プレイヤー斜め奥（Up-Right / Up-Left）素体SVG
  // ==========================================

  /** 冒険者プレイヤー素体（斜め後ろ待機） */
  public static readonly PLAYER_DIAG_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="19" y="47" width="7.5" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="31" y="47" width="7.5" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.2"/>
  <path d="M18 22 L7 51 Q17 49 29 52 L50 54 L40 23 Z" fill="#047857" stroke="#022c22" stroke-width="1.5"/>
  <path d="M22 25 L12 49 Q20 47 29 50 L46 51 L36 25 Z" fill="#059669"/>
  <path d="M21 17 C21 9 39 9 39 17 C39 24 35 27 29 27 C23 27 21 24 21 17 Z" fill="#475569" stroke="#0f172a" stroke-width="1.6"/>
  <path d="M24 16 Q31 20 37 17" stroke="#334155" stroke-width="2" fill="none"/>
  <path d="M28 6 Q30 1 34 3 L33 14 L29 14 Z" fill="#dc2626"/>
</svg>
`.trim();

  /** 冒険者プレイヤー素体（斜め後ろ歩行1） */
  public static readonly PLAYER_DIAG_UP_WALK1_SVG = SVGSprites.PLAYER_DIAG_UP_SVG;
  /** 冒険者プレイヤー素体（斜め後ろ歩行2） */
  public static readonly PLAYER_DIAG_UP_WALK2_SVG = SVGSprites.PLAYER_DIAG_UP_SVG;

  /** 冒険者プレイヤー（力尽き・倒れ姿） */
  public static readonly PLAYER_DEAD_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="48" rx="26" ry="10" fill="rgba(0,0,0,0.5)"/>
  <!-- 地面に広がったマント -->
  <path d="M10 40 Q22 30 46 34 Q54 46 40 52 Q20 54 10 40 Z" fill="#047857" stroke="#022c22" stroke-width="1.5"/>
  <path d="M14 42 Q24 34 42 36 Q48 46 36 50 Q20 51 14 42 Z" fill="#059669" opacity="0.4"/>
  <!-- 倒れた脚部 -->
  <rect x="7" y="42" width="14" height="6" rx="2" fill="#334155" stroke="#0f172a" stroke-width="1.2" transform="rotate(-12 14 45)"/>
  <!-- 倒れた胸甲 -->
  <path d="M18 35 L38 33 L40 48 L20 50 Z" fill="#475569" stroke="#0f172a" stroke-width="1.8"/>
  <rect x="20" y="42" width="16" height="4" fill="#78350f"/>
  <!-- 倒れた兜と外れたプルーム -->
  <circle cx="43" cy="41" r="10.5" fill="#475569" stroke="#0f172a" stroke-width="1.8"/>
  <path d="M38 31 Q42 27 45 32 L41 37 Z" fill="#dc2626"/>
  <polygon points="41,39 52,41 49,45 39,43" fill="#090d16"/>
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

  /** スライム正面（透き通るエメラルドゼリー、内部魔力核、うるおい反射） */
  public static readonly SLIME_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 足元影 -->
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.35)"/>
  <!-- ゼリー状ボディ外殻（深いエメラルドグラデーション） -->
  <path d="M32 10 C46 10 56 24 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 24 18 10 32 10 Z" fill="#10b981" stroke="#064e3b" stroke-width="1.8"/>
  <path d="M32 16 C43 16 52 26 52 41 C52 49 43 53 32 53 C21 53 12 49 12 41 C12 26 21 16 32 16 Z" fill="#34d399" opacity="0.6"/>
  <!-- 内部に透けて浮かぶ魔力核（コア） -->
  <circle cx="32" cy="38" r="9" fill="#0284c7" opacity="0.85"/>
  <circle cx="31" cy="37" r="7" fill="#38bdf8"/>
  <ellipse cx="30" cy="35" rx="3" ry="2" fill="#ffffff" opacity="0.9"/>
  <!-- 気泡 -->
  <circle cx="21" cy="44" r="2.2" fill="#a7f3d0" opacity="0.65"/>
  <circle cx="43" cy="42" r="1.8" fill="#a7f3d0" opacity="0.6"/>
  <!-- 生き生きとした瞳（左目・右目） -->
  <ellipse cx="24" cy="31" rx="4.5" ry="6.5" fill="#022c22"/>
  <ellipse cx="23" cy="29" rx="2.5" ry="3.5" fill="#ffffff"/>
  <circle cx="25.5" cy="34" r="1.2" fill="#ffffff"/>
  <ellipse cx="40" cy="31" rx="4.5" ry="6.5" fill="#022c22"/>
  <ellipse cx="39" cy="29" rx="2.5" ry="3.5" fill="#ffffff"/>
  <circle cx="41.5" cy="34" r="1.2" fill="#ffffff"/>
  <!-- 表面のうるおい光沢ハイライト -->
  <path d="M22 14 Q32 12 40 16 Q34 19 22 17 Z" fill="#ffffff" opacity="0.75"/>
  <ellipse cx="46" cy="25" rx="3" ry="5" transform="rotate(25 46 25)" fill="#ffffff" opacity="0.45"/>
  <ellipse cx="16" cy="38" rx="2" ry="4" transform="rotate(-15 16 38)" fill="#a7f3d0" opacity="0.5"/>
</svg>`.trim();

  public static readonly SLIME_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 10 C46 10 56 24 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 24 18 10 32 10 Z" fill="#10b981" stroke="#064e3b" stroke-width="1.8"/>
  <path d="M32 16 C43 16 52 26 52 41 C52 49 43 53 32 53 C21 53 12 49 12 41 C12 26 21 16 32 16 Z" fill="#34d399" opacity="0.6"/>
  <circle cx="32" cy="38" r="9" fill="#0284c7" opacity="0.65"/>
  <circle cx="31" cy="37" r="7" fill="#38bdf8" opacity="0.7"/>
  <path d="M22 14 Q32 12 40 16 Q34 19 22 17 Z" fill="#ffffff" opacity="0.65"/>
</svg>`.trim();

  public static readonly SLIME_SIDE_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly SLIME_DIAG_DOWN_SVG = SVGSprites.SLIME_DOWN_SVG;
  public static readonly SLIME_DIAG_UP_SVG = SVGSprites.SLIME_UP_SVG;

  /** ゴブリン正面（尖った大耳、鋲留め革鎧、ギラつく黄赤の瞳、鋭い牙） */
  public static readonly GOBLIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <!-- 尖った長い耳（左・右、ピアス付き） -->
  <path d="M18 24 L2 16 Q10 28 20 30 Z" fill="#65a30d" stroke="#365314" stroke-width="1.2"/>
  <path d="M16 23 L6 18 Q12 26 18 27 Z" fill="#ec4899" opacity="0.35"/>
  <circle cx="5" cy="20" r="1.5" fill="#fbbf24"/>
  <path d="M46 24 L62 16 Q54 28 44 30 Z" fill="#65a30d" stroke="#365314" stroke-width="1.2"/>
  <path d="M48 23 L58 18 Q52 26 46 27 Z" fill="#ec4899" opacity="0.35"/>
  <!-- 足と腰布 -->
  <rect x="23" y="46" width="7" height="10" rx="2" fill="#4d7c0f" stroke="#365314" stroke-width="1"/>
  <rect x="34" y="46" width="7" height="10" rx="2" fill="#4d7c0f" stroke="#365314" stroke-width="1"/>
  <!-- ツギハギの鋲留め革鎧胴体 -->
  <path d="M20 30 L44 30 L42 47 L22 47 Z" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <line x1="28" y1="31" x2="36" y2="46" stroke="#92400e" stroke-width="2"/>
  <circle cx="24" cy="35" r="1.3" fill="#fbbf24"/>
  <circle cx="40" cy="35" r="1.3" fill="#fbbf24"/>
  <circle cx="25" cy="42" r="1.3" fill="#fbbf24"/>
  <circle cx="39" cy="42" r="1.3" fill="#fbbf24"/>
  <!-- 頭部（輪郭、頬骨、顎） -->
  <ellipse cx="32" cy="24" rx="14" ry="12" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <!-- 尖った鼻としわ -->
  <polygon points="32,23 30,27 34,27" fill="#4d7c0f"/>
  <path d="M28 17 Q32 15 36 17" stroke="#365314" stroke-width="1.2" fill="none"/>
  <!-- ギラつく黄色い目と鋭い瞳孔 -->
  <ellipse cx="26" cy="21" rx="3.5" ry="3" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
  <ellipse cx="26" cy="21" rx="1.2" ry="2.2" fill="#dc2626"/>
  <ellipse cx="38" cy="21" rx="3.5" ry="3" fill="#fef08a" stroke="#ca8a04" stroke-width="0.8"/>
  <ellipse cx="38" cy="21" rx="1.2" ry="2.2" fill="#dc2626"/>
  <!-- 凶悪な口と突き出た下牙 -->
  <path d="M26 30 Q32 34 38 30" stroke="#1f2937" stroke-width="1.5" fill="none"/>
  <polygon points="28,32 29,28 30,32" fill="#fef3c7"/>
  <polygon points="34,32 35,28 36,32" fill="#fef3c7"/>
</svg>`.trim();

  public static readonly GOBLIN_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M18 24 L2 16 Q10 28 20 30 Z" fill="#65a30d" stroke="#365314" stroke-width="1.2"/>
  <path d="M46 24 L62 16 Q54 28 44 30 Z" fill="#65a30d" stroke="#365314" stroke-width="1.2"/>
  <ellipse cx="32" cy="24" rx="14" ry="12" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <path d="M20 30 L44 30 L42 47 L22 47 Z" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
  <rect x="23" y="46" width="7" height="10" rx="2" fill="#4d7c0f"/>
  <rect x="34" y="46" width="7" height="10" rx="2" fill="#4d7c0f"/>
</svg>`.trim();

  public static readonly GOBLIN_SIDE_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly GOBLIN_DIAG_DOWN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  public static readonly GOBLIN_DIAG_UP_SVG = SVGSprites.GOBLIN_UP_SVG;

  /** スケルトン正面（精巧な頭蓋骨、青白く灯るソウルアイ、肋骨・胸郭、骨盤） */
  public static readonly SKELETON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <!-- 骨盤と脚の骨 -->
  <path d="M24 43 Q32 40 40 43 L37 47 L27 47 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
  <line x1="26" y1="47" x2="25" y2="56" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
  <line x1="38" y1="47" x2="39" y2="56" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="24" cy="57" rx="3" ry="1.5" fill="#cbd5e1"/>
  <ellipse cx="40" cy="57" rx="3" ry="1.5" fill="#cbd5e1"/>
  <!-- 脊椎と胸郭・肋骨 -->
  <line x1="32" y1="28" x2="32" y2="44" stroke="#cbd5e1" stroke-width="3.5"/>
  <path d="M21 32 Q32 35 43 32" stroke="#f1f5f9" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M22 36 Q32 39 42 36" stroke="#f1f5f9" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M24 40 Q32 43 40 40" stroke="#f1f5f9" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- 頭蓋骨 -->
  <path d="M21 17 C21 9 43 9 43 17 C43 23 40 25 38 27 L26 27 C24 25 21 23 21 17 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
  <!-- 深い眼窩と青白く灯るソウルアイ -->
  <ellipse cx="27" cy="18" rx="3.5" ry="4" fill="#0f172a"/>
  <circle cx="27" cy="18" r="1.5" fill="#38bdf8"/>
  <circle cx="27" cy="18" r="0.7" fill="#ffffff"/>
  <ellipse cx="37" cy="18" rx="3.5" ry="4" fill="#0f172a"/>
  <circle cx="37" cy="18" r="1.5" fill="#38bdf8"/>
  <circle cx="37" cy="18" r="0.7" fill="#ffffff"/>
  <polygon points="32,21 31,23 33,23" fill="#0f172a"/>
  <!-- 歯列 -->
  <rect x="27" y="25" width="2" height="3" fill="#f8fafc" stroke="#475569" stroke-width="0.5"/>
  <rect x="30" y="25" width="2" height="3" fill="#f8fafc" stroke="#475569" stroke-width="0.5"/>
  <rect x="33" y="25" width="2" height="3" fill="#f8fafc" stroke="#475569" stroke-width="0.5"/>
  <rect x="36" y="25" width="2" height="3" fill="#f8fafc" stroke="#475569" stroke-width="0.5"/>
</svg>`.trim();

  public static readonly SKELETON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M21 17 C21 9 43 9 43 17 C43 23 40 25 38 27 L26 27 C24 25 21 23 21 17 Z" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
  <line x1="32" y1="28" x2="32" y2="44" stroke="#cbd5e1" stroke-width="3.5"/>
  <path d="M21 32 Q32 35 43 32" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" fill="none"/>
  <path d="M22 36 Q32 39 42 36" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" fill="none"/>
  <line x1="26" y1="47" x2="25" y2="56" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
  <line x1="38" y1="47" x2="39" y2="56" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
</svg>`.trim();

  public static readonly SKELETON_SIDE_SVG = SVGSprites.SKELETON_DOWN_SVG;
  public static readonly SKELETON_DIAG_DOWN_SVG = SVGSprites.SKELETON_DOWN_SVG;
  public static readonly SKELETON_DIAG_UP_SVG = SVGSprites.SKELETON_UP_SVG;

  /** 岩石ゴーレム（立体多面体ブロック、古代発光ルーン、苔・ひび割れ） */
  public static readonly GOLEM_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
  <!-- 両足巨岩ブロック -->
  <polygon points="18,48 28,46 29,56 16,56" fill="#78716c" stroke="#292524" stroke-width="1.5"/>
  <polygon points="36,46 46,48 48,56 35,56" fill="#78716c" stroke="#292524" stroke-width="1.5"/>
  <!-- 巨岩胴体 -->
  <polygon points="16,24 48,24 45,46 19,46" fill="#78716c" stroke="#292524" stroke-width="2"/>
  <path d="M22 28 Q26 26 28 32 Q32 30 36 34" stroke="#292524" stroke-width="1.2" fill="none"/>
  <path d="M20 36 Q24 38 22 42" stroke="#84cc16" stroke-width="1.5" fill="none"/>
  <!-- 胸の古代ルーン発光 -->
  <polygon points="32,28 36,33 32,38 28,33" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/>
  <line x1="32" y1="26" x2="32" y2="40" stroke="#fef08a" stroke-width="1"/>
  <!-- 肩の巨石 -->
  <polygon points="10,22 18,20 20,32 11,30" fill="#a8a29e" stroke="#292524" stroke-width="1.5"/>
  <polygon points="54,22 46,20 44,32 53,30" fill="#a8a29e" stroke="#292524" stroke-width="1.5"/>
  <!-- 頭部巨岩 -->
  <polygon points="23,10 41,10 43,22 21,22" fill="#78716c" stroke="#292524" stroke-width="2"/>
  <ellipse cx="32" cy="11" rx="7" ry="2" fill="#d6d3d1" opacity="0.6"/>
  <!-- 琥珀の光眼 -->
  <circle cx="27" cy="16" r="2.5" fill="#f59e0b"/>
  <circle cx="27" cy="16" r="1.2" fill="#ffffff"/>
  <circle cx="37" cy="16" r="2.5" fill="#f59e0b"/>
  <circle cx="37" cy="16" r="1.2" fill="#ffffff"/>
</svg>`.trim();

  public static readonly GOLEM_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_SIDE_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_DIAG_DOWN_SVG = SVGSprites.GOLEM_DOWN_SVG;
  public static readonly GOLEM_DIAG_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;

  /** マンドラゴラ（ねじれ根茎、叫ぶ怪顔、生い茂る毒草の葉脈） */
  public static readonly MANDRAGORA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 根の脚 -->
  <path d="M24 46 Q20 52 18 56 Q23 54 26 48 Z" fill="#65a30d" stroke="#365314" stroke-width="1"/>
  <path d="M40 46 Q44 52 46 56 Q41 54 38 48 Z" fill="#65a30d" stroke="#365314" stroke-width="1"/>
  <!-- 根茎の肉体（深いシワ） -->
  <path d="M19 28 Q32 18 45 28 Q46 46 32 52 Q18 46 19 28 Z" fill="#65a30d" stroke="#365314" stroke-width="1.8"/>
  <path d="M22 34 Q32 30 42 34" stroke="#365314" stroke-width="1" fill="none"/>
  <path d="M23 42 Q32 40 41 42" stroke="#365314" stroke-width="1" fill="none"/>
  <!-- 狂気の叫ぶ顔 -->
  <ellipse cx="27" cy="30" rx="3.5" ry="4.5" fill="#14532d"/>
  <circle cx="27" cy="29" r="1.5" fill="#ffffff"/>
  <ellipse cx="37" cy="30" rx="3.5" ry="4.5" fill="#14532d"/>
  <circle cx="37" cy="29" r="1.5" fill="#ffffff"/>
  <!-- 叫ぶ口 -->
  <ellipse cx="32" cy="39" rx="4" ry="5.5" fill="#14532d"/>
  <path d="M30 42 Q32 44 34 42" stroke="#f87171" stroke-width="1.2" fill="none"/>
  <!-- 頭頂の繁茂する鮮やかな毒草の葉 -->
  <path d="M32 20 Q20 10 16 2 Q28 6 32 18 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.2"/>
  <path d="M32 20 Q44 10 48 2 Q36 6 32 18 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.2"/>
  <path d="M32 20 Q32 6 32 0 Q36 8 32 18 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.2"/>
</svg>`.trim();

  public static readonly MANDRAGORA_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_SIDE_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_DIAG_DOWN_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  public static readonly MANDRAGORA_DIAG_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;

  /** サハギン戦士（背ビレ、深海魚鱗グラデーション、鋭い水掻き鉤爪、魚の眼球） */
  public static readonly SAHAGIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
  <!-- 背ビレ（トゲとヒレ膜） -->
  <path d="M32 6 Q34 18 36 28 L30 26 Q30 16 32 6 Z" fill="#5eead4" stroke="#0f766e" stroke-width="1.2"/>
  <path d="M32 6 L38 12 L33 16 L40 20 L34 24" stroke="#14b8a6" stroke-width="1.5" fill="none"/>
  <!-- 足と水掻き -->
  <rect x="23" y="46" width="7" height="10" rx="2" fill="#0f766e" stroke="#134e4a" stroke-width="1"/>
  <polygon points="19,57 28,54 27,57" fill="#2dd4bf"/>
  <rect x="34" y="46" width="7" height="10" rx="2" fill="#0f766e" stroke="#134e4a" stroke-width="1"/>
  <polygon points="45,57 36,54 37,57" fill="#2dd4bf"/>
  <!-- 胴体と鱗模様 -->
  <path d="M20 28 L44 28 L42 46 L22 46 Z" fill="#0d9488" stroke="#134e4a" stroke-width="1.5"/>
  <path d="M26 32 Q29 35 32 32 Q35 35 38 32" stroke="#14b8a6" stroke-width="1.2" fill="none"/>
  <path d="M24 38 Q28 41 32 38 Q36 41 40 38" stroke="#14b8a6" stroke-width="1.2" fill="none"/>
  <!-- 魚面の頭部とエラ -->
  <ellipse cx="32" cy="22" rx="13" ry="11" fill="#0d9488" stroke="#134e4a" stroke-width="1.5"/>
  <path d="M22 23 Q20 26 22 29" stroke="#115e59" stroke-width="1.5" fill="none"/>
  <path d="M42 23 Q44 26 42 29" stroke="#115e59" stroke-width="1.5" fill="none"/>
  <!-- ギョロリとした大きな魚の眼球 -->
  <circle cx="26" cy="20" r="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <circle cx="26" cy="20" r="1.8" fill="#000000"/>
  <circle cx="27.5" cy="18.5" r="1" fill="#ffffff"/>
  <circle cx="38" cy="20" r="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1"/>
  <circle cx="38" cy="20" r="1.8" fill="#000000"/>
  <circle cx="39.5" cy="18.5" r="1" fill="#ffffff"/>
  <!-- 鋭い口元と牙 -->
  <path d="M28 28 Q32 31 36 28" stroke="#134e4a" stroke-width="1.5" fill="none"/>
  <polygon points="29,28 30,26 31,28" fill="#ffffff"/>
  <polygon points="33,28 34,26 35,28" fill="#ffffff"/>
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
      item_scroll_sleep: MonsterAndItemSprites.ITEM_SCROLL_SLEEP_SVG,
      item_scroll_confuse: MonsterAndItemSprites.ITEM_SCROLL_CONFUSE_SVG,
      // 新武器
      item_weapon_muramasa: MonsterAndItemSprites.ITEM_WEAPON_MURAMASA_SVG,
      item_weapon_warhammer: MonsterAndItemSprites.ITEM_WEAPON_WARHAMMER_SVG,
      item_weapon_holy_lance: MonsterAndItemSprites.ITEM_WEAPON_HOLY_LANCE_SVG,
      // 新盾
      item_shield_wind: MonsterAndItemSprites.ITEM_SHIELD_WIND_SVG,
      item_shield_tower: MonsterAndItemSprites.ITEM_SHIELD_TOWER_SVG,
      item_shield_aegis: MonsterAndItemSprites.ITEM_SHIELD_AEGIS_SVG,
      // 新消費アイテム
      item_potion_antidote: MonsterAndItemSprites.ITEM_POTION_ANTIDOTE_SVG,
      item_potion_agi: MonsterAndItemSprites.ITEM_POTION_AGI_SVG,
      item_food_big_riceball: MonsterAndItemSprites.ITEM_FOOD_BIG_RICEBALL_SVG,
      // 新モンスター (MIMIC, ZOMBIE, IMP, MUMMY)
      mimic: MonsterAndItemSprites.MIMIC_DOWN_SVG,
      mimic_down: MonsterAndItemSprites.MIMIC_DOWN_SVG,
      mimic_up: MonsterAndItemSprites.MIMIC_UP_SVG,
      mimic_side: MonsterAndItemSprites.MIMIC_DOWN_SVG,
      mimic_diag_down: MonsterAndItemSprites.MIMIC_DOWN_SVG,
      mimic_diag_up: MonsterAndItemSprites.MIMIC_UP_SVG,
      zombie: MonsterAndItemSprites.ZOMBIE_DOWN_SVG,
      zombie_down: MonsterAndItemSprites.ZOMBIE_DOWN_SVG,
      zombie_up: MonsterAndItemSprites.ZOMBIE_UP_SVG,
      zombie_side: MonsterAndItemSprites.ZOMBIE_DOWN_SVG,
      zombie_diag_down: MonsterAndItemSprites.ZOMBIE_DOWN_SVG,
      zombie_diag_up: MonsterAndItemSprites.ZOMBIE_UP_SVG,
      imp: MonsterAndItemSprites.IMP_DOWN_SVG,
      imp_down: MonsterAndItemSprites.IMP_DOWN_SVG,
      imp_up: MonsterAndItemSprites.IMP_UP_SVG,
      imp_side: MonsterAndItemSprites.IMP_DOWN_SVG,
      imp_diag_down: MonsterAndItemSprites.IMP_DOWN_SVG,
      imp_diag_up: MonsterAndItemSprites.IMP_UP_SVG,
      mummy: MonsterAndItemSprites.MUMMY_DOWN_SVG,
      mummy_down: MonsterAndItemSprites.MUMMY_DOWN_SVG,
      mummy_up: MonsterAndItemSprites.MUMMY_UP_SVG,
      mummy_side: MonsterAndItemSprites.MUMMY_DOWN_SVG,
      mummy_diag_down: MonsterAndItemSprites.MUMMY_DOWN_SVG,
      mummy_diag_up: MonsterAndItemSprites.MUMMY_UP_SVG,
      // 障害物
      obstacle_dirt_block: MonsterAndItemSprites.OBSTACLE_DIRT_BLOCK_SVG,
      obstacle_tree_stump: MonsterAndItemSprites.OBSTACLE_TREE_STUMP_SVG,
      obstacle_snow_mound: MonsterAndItemSprites.OBSTACLE_SNOW_MOUND_SVG,
      obstacle_push_rock: MonsterAndItemSprites.OBSTACLE_PUSH_ROCK_SVG,
      obstacle_ice_block: MonsterAndItemSprites.OBSTACLE_ICE_BLOCK_SVG,
      // 飛び道具（矢）
      item_arrow: MonsterAndItemSprites.ITEM_ARROW_SVG,
      item_arrow_iron: MonsterAndItemSprites.ITEM_ARROW_IRON_SVG,
      item_arrow_silver: MonsterAndItemSprites.ITEM_ARROW_SILVER_SVG,
      // 魔法の杖
      item_staff: MonsterAndItemSprites.ITEM_STAFF_SVG,
      item_staff_blast: MonsterAndItemSprites.ITEM_STAFF_BLAST_SVG,
      item_staff_switch: MonsterAndItemSprites.ITEM_STAFF_SWITCH_SVG,
      item_staff_paralyze: MonsterAndItemSprites.ITEM_STAFF_PARALYZE_SVG,
      item_staff_thunder: MonsterAndItemSprites.ITEM_STAFF_THUNDER_SVG,
      // 腕輪
      item_ring: MonsterAndItemSprites.ITEM_RING_SVG,
      // 追加の草
      item_potion_revive: MonsterAndItemSprites.ITEM_POTION_REVIVE_SVG,
      item_potion_otogiri: MonsterAndItemSprites.ITEM_POTION_OTOGIRI_SVG,
      item_potion_life: MonsterAndItemSprites.ITEM_POTION_LIFE_SVG,
      // 追加の巻物
      item_scroll_upgrade_atk: MonsterAndItemSprites.ITEM_SCROLL_UPGRADE_ATK_SVG,
      item_scroll_upgrade_def: MonsterAndItemSprites.ITEM_SCROLL_UPGRADE_DEF_SVG,
      item_scroll_vacuum: MonsterAndItemSprites.ITEM_SCROLL_VACUUM_SVG,
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
      // ポーション・薬・種・草
      if (name.includes('復活')) return 'item_potion_revive';
      if (name.includes('弟切草')) return 'item_potion_otogiri';
      if (name.includes('命の草')) return 'item_potion_life';
      if (name.includes('特薬草')) return 'item_potion_high';
      if (name.includes('剛力')) return 'item_potion_str';
      if (name.includes('どくけし') || name.includes('毒消し')) return 'item_potion_antidote';
      if (name.includes('すばやさ')) return 'item_potion_agi';
      if (name.includes('力') && name.includes('種')) return 'item_seed';
      // 食料
      if (name.includes('巨大なおにぎり')) return 'item_food_big_riceball';
      if (name.includes('おにぎり')) return 'item_food_riceball';
      if (name.includes('パン')) return 'item_food';
      // 飛び道具（矢）
      if (name.includes('銀の矢')) return 'item_arrow_silver';
      if (name.includes('鉄の矢')) return 'item_arrow_iron';
      if (name.includes('矢')) return 'item_arrow';
      // 魔法の杖
      if (name.includes('吹き飛ばし')) return 'item_staff_blast';
      if (name.includes('場所替え')) return 'item_staff_switch';
      if (name.includes('かなしばり') || name.includes('金縛り')) return 'item_staff_paralyze';
      if (name.includes('雷鳴')) return 'item_staff_thunder';
      if (name.includes('杖')) return 'item_staff';
      // 腕輪
      if (name.includes('腕輪')) return 'item_ring';
      // 武器
      if (name.includes('短剣') || name.includes('青銅の短剣')) return 'item_weapon_dagger';
      if (name.includes('ムラマサ') || name.includes('妖刀')) return 'item_weapon_muramasa';
      if (name.includes('ウォーハンマー') || name.includes('ハンマー')) return 'item_weapon_warhammer';
      if (name.includes('ホーリーランス') || name.includes('ランス')) return 'item_weapon_holy_lance';
      if (name.includes('ミスリル')) return 'item_weapon_mithril';
      if (name.includes('炎')) return 'item_weapon_flame';
      if (name.includes('ルーン')) return 'item_weapon_rune';
      if (name.includes('剣')) return 'item_weapon';
      // 盾
      if (name.includes('風')) return 'item_shield_wind';
      if (name.includes('タワー')) return 'item_shield_tower';
      if (name.includes('イージス')) return 'item_shield_aegis';
      if (name.includes('木')) return 'item_shield_wood';
      if (name.includes('青銅')) return 'item_shield_bronze';
      if (name.includes('魔法')) return 'item_shield_magic';
      if (name.includes('ドラゴン')) return 'item_shield_dragon';
      if (name.includes('盾')) return 'item_shield';
      // 巻物
      if (name.includes('天の恵み')) return 'item_scroll_upgrade_atk';
      if (name.includes('地の恵み')) return 'item_scroll_upgrade_def';
      if (name.includes('真空斬り')) return 'item_scroll_vacuum';
      if (name.includes('雷')) return 'item_scroll_thunder';
      if (name.includes('あかり')) return 'item_scroll_light';
      if (name.includes('睡眠')) return 'item_scroll_sleep';
      if (name.includes('混乱')) return 'item_scroll_confuse';
      if (name.includes('ワープ') || name.includes('巻物')) return 'item_scroll';
    }

    switch (category) {
      case 'ARROW':
        return 'item_arrow';
      case 'STAFF':
        return 'item_staff';
      case 'TALISMAN':
        return 'item_ring';
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

  /**
   * 障害物種別に対応するスプライトIDを取得します。
   */
  public static getObstacleSpriteId(type: ObstacleType): SpriteId {
    switch (type) {
      case 'DIRT_BLOCK':
        return 'obstacle_dirt_block';
      case 'TREE_STUMP':
        return 'obstacle_tree_stump';
      case 'SNOW_MOUND':
        return 'obstacle_snow_mound';
      case 'PUSH_ROCK':
        return 'obstacle_push_rock';
      case 'ICE_BLOCK':
        return 'obstacle_ice_block';
      default:
        return 'obstacle_dirt_block';
    }
  }
}
