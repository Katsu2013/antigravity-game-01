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
  // 店主・商人
  | 'merchant'
  | 'merchant_down'
  | 'merchant_up'
  | 'merchant_side'
  | 'merchant_diag_down'
  | 'merchant_diag_up'
  // 怒りの店主
  | 'angry_merchant'
  | 'angry_merchant_down'
  | 'angry_merchant_up'
  | 'angry_merchant_side'
  | 'angry_merchant_diag_down'
  | 'angry_merchant_diag_up'
  // 番犬・警備犬
  | 'guard_dog'
  | 'guard_dog_down'
  | 'guard_dog_up'
  | 'guard_dog_side'
  | 'guard_dog_diag_down'
  | 'guard_dog_diag_up'
  // レアキャラ4種
  | 'wandering_adventurer'
  | 'wandering_adventurer_down'
  | 'gambler_sage'
  | 'gambler_sage_down'
  | 'healing_fairy'
  | 'healing_fairy_down'
  | 'traveling_blacksmith'
  | 'traveling_blacksmith_down'
  // 第50層ボス
  | 'abyss_lord'
  | 'abyss_lord_down'
  // スクーターおじさん
  | 'scooter_guy'
  | 'scooter_guy_down'
  | 'scooter_guy_up'
  | 'scooter_guy_side'
  | 'scooter_guy_diag_down'
  | 'scooter_guy_diag_up'
  // 店主バリエーション
  | 'merchant_torneko'
  | 'merchant_torneko_down'
  | 'angry_merchant_torneko'
  | 'angry_merchant_torneko_down'
  | 'merchant_shiren'
  | 'merchant_shiren_down'
  | 'angry_merchant_shiren'
  | 'angry_merchant_shiren_down'
  | 'merchant_goldo'
  | 'merchant_goldo_down'
  | 'angry_merchant_goldo'
  | 'angry_merchant_goldo_down'
  | 'merchant_celia'
  | 'merchant_celia_down'
  | 'angry_merchant_celia'
  | 'angry_merchant_celia_down'
  // 迷宮屋台システム（ラーメンマルキン・おでん）
  | 'food_stall'
  | 'food_stall_down'
  | 'food_stall_up'
  | 'food_stall_side'
  | 'food_stall_diag_down'
  | 'food_stall_diag_up'
  | 'food_stall_ramen'
  | 'food_stall_ramen_down'
  | 'food_stall_ramen_wife'
  | 'food_stall_ramen_wife_down'
  | 'food_stall_oden'
  | 'food_stall_oden_down'
  // アイテムグラフィックスプライト
  | 'item_gold'
  | 'item_pot_synthesis'
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
  | 'obstacle_ice_block'
  // 動的パレットスワップ・色違いバリアント用
  | (string & {});

/**
 * SVGスプライトの定義・生成・キャッシュ管理クラス。
 */
export class SVGSprites {
  /**
   * プリロードされたスプライト画像のキャッシュマップ。
   */
  private static imageCache: Map<SpriteId, HTMLImageElement> = new Map();

  /**
   * 全スプライトのロード完了を監視するPromise。
   */
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
  /** 階段（下り）タイルSVG */
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

  /** スライム背面（上向き） */
  public static readonly SLIME_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 10 C46 10 56 24 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 24 18 10 32 10 Z" fill="#10b981" stroke="#064e3b" stroke-width="1.8"/>
  <path d="M32 16 C43 16 52 26 52 41 C52 49 43 53 32 53 C21 53 12 49 12 41 C12 26 21 16 32 16 Z" fill="#34d399" opacity="0.6"/>
  <circle cx="32" cy="38" r="9" fill="#0284c7" opacity="0.65"/>
  <circle cx="31" cy="37" r="7" fill="#38bdf8" opacity="0.7"/>
  <path d="M22 14 Q32 12 40 16 Q34 19 22 17 Z" fill="#ffffff" opacity="0.65"/>
</svg>`.trim();

  /** スライム側面（横向きエイリアス） */
  public static readonly SLIME_SIDE_SVG = SVGSprites.SLIME_DOWN_SVG;
  /** スライム斜め手前エイリアス */
  public static readonly SLIME_DIAG_DOWN_SVG = SVGSprites.SLIME_DOWN_SVG;
  /** スライム斜め奥エイリアス */
  public static readonly SLIME_DIAG_UP_SVG = SVGSprites.SLIME_UP_SVG;

  /** ゴブリン正面（立体多層スキン、トゲ付き棍棒、金属バックラー、ピアス大耳、生き生きとした瞳、ツギハギ革鎧） */
  public static readonly GOBLIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="19" ry="5.5" fill="rgba(0,0,0,0.38)"/>
  
  <!-- 左手: トゲ付き木製棍棒 -->
  <g transform="rotate(-18 13 36)">
    <!-- 棍棒本体（上太・下細の木製グラデーション） -->
    <path d="M11 18 Q14 16 17 18 L16 46 Q13.5 48 11 46 Z" fill="#78350f" stroke="#451a03" stroke-width="1.3"/>
    <path d="M12 20 Q14 18 16 20 L15 44" stroke="#92400e" stroke-width="1.2" fill="none"/>
    <!-- 鉄製スパイク（ハイライト付き） -->
    <polygon points="10,22 5,20 11,25" fill="#e2e8f0" stroke="#475569" stroke-width="0.8"/>
    <polygon points="17,26 22,24 16,29" fill="#e2e8f0" stroke="#475569" stroke-width="0.8"/>
    <polygon points="10,32 5,31 11,35" fill="#cbd5e1" stroke="#475569" stroke-width="0.8"/>
    <polygon points="17,37 21,36 16,40" fill="#cbd5e1" stroke="#475569" stroke-width="0.8"/>
    <!-- 握り革紐 -->
    <line x1="12" y1="41" x2="15" y2="43" stroke="#d97706" stroke-width="1.5"/>
    <line x1="12" y1="43" x2="15" y2="45" stroke="#d97706" stroke-width="1.5"/>
  </g>

  <!-- 脚部と毛皮ブーツ -->
  <rect x="22" y="46" width="7" height="10" rx="2" fill="#4d7c0f" stroke="#1f2937" stroke-width="1.2"/>
  <rect x="33" y="46" width="7" height="10" rx="2" fill="#4d7c0f" stroke="#1f2937" stroke-width="1.2"/>
  <ellipse cx="25" cy="56" rx="4" ry="2.5" fill="#713f12" stroke="#451a03" stroke-width="1"/>
  <ellipse cx="37" cy="56" rx="4" ry="2.5" fill="#713f12" stroke="#451a03" stroke-width="1"/>

  <!-- 毛皮の腰巻き -->
  <path d="M19 41 L43 41 L41 48 L37 46 L33 49 L29 46 L25 48 L21 46 Z" fill="#713f12" stroke="#451a03" stroke-width="1.2"/>

  <!-- 胴体（ツギハギ革鎧・リベット・ステッチ） -->
  <path d="M19 27 L43 27 L41 43 L21 43 Z" fill="#854d0e" stroke="#451a03" stroke-width="1.5"/>
  <!-- 革鎧インナーシャドウ＆ハイライト -->
  <path d="M21 29 L41 29 L39 41 L23 41 Z" fill="#b45309" opacity="0.6"/>
  <!-- ステッチ縫い目 -->
  <path d="M20 35 L42 35" stroke="#fde047" stroke-width="1.2" stroke-dasharray="2,2"/>
  <!-- 鉄のリベット鋲 -->
  <circle cx="23" cy="31" r="1.3" fill="#facc15" stroke="#713f12" stroke-width="0.5"/>
  <circle cx="39" cy="31" r="1.3" fill="#facc15" stroke="#713f12" stroke-width="0.5"/>
  <circle cx="24" cy="39" r="1.3" fill="#facc15" stroke="#713f12" stroke-width="0.5"/>
  <circle cx="38" cy="39" r="1.3" fill="#facc15" stroke="#713f12" stroke-width="0.5"/>

  <!-- 尖った大耳（左・右: 内耳ピンク＆黄金ピアス） -->
  <path d="M18 20 L2 12 Q8 26 19 26 Z" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <path d="M16 19 L6 14 Q10 23 17 23 Z" fill="#f472b6" opacity="0.45"/>
  <circle cx="5" cy="16" r="1.8" fill="#eab308" stroke="#a16207" stroke-width="0.8"/>
  <circle cx="4.5" cy="15.5" r="0.6" fill="#ffffff"/>

  <path d="M46 20 L62 12 Q56 26 45 26 Z" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <path d="M48 19 L58 14 Q54 23 47 23 Z" fill="#f472b6" opacity="0.45"/>
  <circle cx="59" cy="16" r="1.8" fill="#eab308" stroke="#a16207" stroke-width="0.8"/>
  <circle cx="58.5" cy="15.5" r="0.6" fill="#ffffff"/>

  <!-- 頭部（ふっくらした立体感・頬骨） -->
  <ellipse cx="32" cy="21" rx="14" ry="12.5" fill="#65a30d" stroke="#365314" stroke-width="1.8"/>
  <!-- おでこハイライト -->
  <ellipse cx="32" cy="15" rx="8" ry="4" fill="#84cc16" opacity="0.5"/>
  <!-- 眉間のシワ -->
  <path d="M26 14 Q32 12 38 14" stroke="#365314" stroke-width="1.4" fill="none"/>
  <path d="M29 16 L31 18 M35 16 L33 18" stroke="#365314" stroke-width="1"/>

  <!-- 生き生きとした瞳（スライム調の瑞々しいハイライト） -->
  <!-- 左目 -->
  <ellipse cx="26" cy="19" rx="3.8" ry="3.5" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
  <ellipse cx="26" cy="19" rx="2.5" ry="2.8" fill="#ef4444"/>
  <ellipse cx="26" cy="19" rx="1.2" ry="1.8" fill="#7f1d1d"/>
  <circle cx="27" cy="17.8" r="1.2" fill="#ffffff"/>
  <circle cx="25.2" cy="20.5" r="0.6" fill="#ffffff" opacity="0.8"/>

  <!-- 右目 -->
  <ellipse cx="38" cy="19" rx="3.8" ry="3.5" fill="#ca8a04" stroke="#713f12" stroke-width="0.8"/>
  <ellipse cx="38" cy="19" rx="2.5" ry="2.8" fill="#ef4444"/>
  <ellipse cx="38" cy="19" rx="1.2" ry="1.8" fill="#7f1d1d"/>
  <circle cx="39" cy="17.8" r="1.2" fill="#ffffff"/>
  <circle cx="37.2" cy="20.5" r="0.6" fill="#ffffff" opacity="0.8"/>

  <!-- 尖った鉤鼻（陰影付き） -->
  <polygon points="32,18 29,25 35,25" fill="#4d7c0f" stroke="#365314" stroke-width="0.8"/>
  <ellipse cx="32" cy="24" rx="2.5" ry="1.5" fill="#365314"/>

  <!-- 不敵な笑みの口・飛び出た鋭い白い牙 -->
  <path d="M24 28 Q32 34 40 28 Q32 31 24 28 Z" fill="#18181b"/>
  <polygon points="27,30 28.5,25 30,30" fill="#fef3c7" stroke="#78350f" stroke-width="0.6"/>
  <polygon points="34,30 35.5,25 37,30" fill="#fef3c7" stroke="#78350f" stroke-width="0.6"/>

  <!-- 右手: 金属縁の木製バックラー小盾 -->
  <circle cx="48" cy="35" r="8.5" fill="#78350f" stroke="#1f2937" stroke-width="1.8"/>
  <circle cx="48" cy="35" r="6" fill="#b45309"/>
  <circle cx="48" cy="35" r="3" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
  <circle cx="47" cy="34" r="1" fill="#ffffff"/>
</svg>`.trim();

  /** ゴブリン背面（上向き） */
  public static readonly GOBLIN_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5.5" fill="rgba(0,0,0,0.4)"/>
  <path d="M18 22 L2 14 Q10 27 20 28 Z" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <path d="M46 22 L62 14 Q54 27 44 28 Z" fill="#65a30d" stroke="#365314" stroke-width="1.5"/>
  <ellipse cx="32" cy="22" rx="14" ry="12.5" fill="#65a30d" stroke="#365314" stroke-width="1.8"/>
  <path d="M19 28 L43 28 L41 45 L21 45 Z" fill="#713f12" stroke="#451a03" stroke-width="1.5"/>
  <rect x="22" y="46" width="7" height="11" rx="2" fill="#4d7c0f"/>
  <rect x="33" y="46" width="7" height="11" rx="2" fill="#4d7c0f"/>
  <!-- 背中のスパイク棍棒 -->
  <rect x="18" y="16" width="4" height="28" rx="1.5" fill="#78350f" stroke="#451a03" stroke-width="1" transform="rotate(30 20 30)"/>
</svg>`.trim();

  /** ゴブリン側面（横向きエイリアス） */
  public static readonly GOBLIN_SIDE_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  /** ゴブリン斜め手前エイリアス */
  public static readonly GOBLIN_DIAG_DOWN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  /** ゴブリン斜め奥エイリアス */
  public static readonly GOBLIN_DIAG_UP_SVG = SVGSprites.GOBLIN_UP_SVG;

  /** スケルトン正面（立体精巧な頭蓋骨、青白く揺らめくソウルアイ、立体肋骨ケージ、錆びた騎士剣、真鍮鋲の円盾、深紅マントの陰影ドレープ） */
  public static readonly SKELETON_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="19" ry="5.5" fill="rgba(0,0,0,0.4)"/>
  
  <!-- 背面の破れた深紅マント（多層ドレープ＆陰影） -->
  <path d="M22 26 Q16 42 14 53 Q24 49 32 53 Q40 49 50 53 Q48 42 42 26 Z" fill="#881337" stroke="#4c0519" stroke-width="1.2"/>
  <path d="M24 29 Q19 43 17 50 Q25 47 32 50 Q39 47 47 50 Q45 43 40 29 Z" fill="#be123c" opacity="0.6"/>
  <path d="M26 32 Q32 30 38 32 Q32 44 26 32 Z" fill="#e11d48" opacity="0.25"/>

  <!-- 右手: 錆びた片手騎士剣（刃の稜線ハイライト・真鍮鍔） -->
  <g transform="rotate(-15 14 36)">
    <!-- 剣身（両刃の立体稜線） -->
    <path d="M12 10 L14 6 L16 10 L15.5 38 L12.5 38 Z" fill="#94a3b8" stroke="#475569" stroke-width="1.2"/>
    <path d="M14 7 L15.5 10 L15 37 L14 37 Z" fill="#cbd5e1"/>
    <!-- 刃のハイライト光沢 -->
    <line x1="14" y1="8" x2="14" y2="36" stroke="#ffffff" stroke-width="0.8"/>
    <!-- 錆びの斑点アクセント -->
    <circle cx="13" cy="20" r="0.8" fill="#b45309"/>
    <circle cx="14.5" cy="28" r="0.7" fill="#b45309"/>
    <!-- 真鍮ヒルト鍔 & ポメル -->
    <rect x="7" y="38" width="14" height="3" rx="1" fill="#d97706" stroke="#78350f" stroke-width="0.8"/>
    <rect x="12.5" y="41" width="3" height="5" rx="0.5" fill="#451a03"/>
    <circle cx="14" cy="47" r="1.8" fill="#fbbf24" stroke="#78350f" stroke-width="0.8"/>
  </g>

  <!-- 脚の骨（大腿骨・脛骨・関節頭の立体球） -->
  <!-- 左脚 -->
  <circle cx="26" cy="46" r="2.2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>
  <line x1="26" y1="46" x2="25" y2="55" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
  <line x1="25.5" y1="47" x2="24.8" y2="54" stroke="#ffffff" stroke-width="1"/>
  <circle cx="25" cy="55" r="2.2" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8"/>
  <ellipse cx="23" cy="57" rx="3.5" ry="2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>
  
  <!-- 右脚 -->
  <circle cx="38" cy="46" r="2.2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>
  <line x1="38" y1="46" x2="39" y2="55" stroke="#f1f5f9" stroke-width="3" stroke-linecap="round"/>
  <line x1="38.5" y1="47" x2="39.2" y2="54" stroke="#ffffff" stroke-width="1"/>
  <circle cx="39" cy="55" r="2.2" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8"/>
  <ellipse cx="41" cy="57" rx="3.5" ry="2" fill="#e2e8f0" stroke="#64748b" stroke-width="0.8"/>

  <!-- 骨盤（腸骨・仙骨） -->
  <path d="M22 41 Q32 38 42 41 L40 46 Q32 44 24 46 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="1.3"/>
  <ellipse cx="32" cy="44" rx="2.5" ry="1.5" fill="#475569"/>

  <!-- 脊椎と胸腔（奥の陰影＆手前の立体肋骨ケージ） -->
  <rect x="29" y="27" width="6" height="15" fill="#1e293b"/>
  <line x1="32" y1="26" x2="32" y2="43" stroke="#cbd5e1" stroke-width="3.5"/>
  <!-- 肋骨（多層立体・ハイライト） -->
  <path d="M19 29 Q32 33 45 29" stroke="#f8fafc" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M20 28.5 Q32 32.5 44 28.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none"/>
  <path d="M20 33 Q32 37 44 33" stroke="#f8fafc" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <path d="M21 32.5 Q32 36.5 43 32.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none"/>
  <path d="M22 37 Q32 41 42 37" stroke="#f8fafc" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M23 41 Q32 44 41 41" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" fill="none"/>

  <!-- 頭蓋骨（多層立体スカル・クラック・額の光沢ハイライト） -->
  <path d="M19 16 C19 6 45 6 45 16 C45 23 42 25 39 27 L25 27 C22 25 19 23 19 16 Z" fill="#f8fafc" stroke="#475569" stroke-width="1.8"/>
  <path d="M21 15 C21 8 43 8 43 15 C43 21 40 23 37 25 L27 25 C24 23 21 21 21 15 Z" fill="#ffffff" opacity="0.6"/>
  <!-- おでこのうるおい光沢ハイライト（スライム基準） -->
  <ellipse cx="32" cy="11" rx="8" ry="3.5" fill="#ffffff" opacity="0.85"/>
  <ellipse cx="24" cy="13" rx="2" ry="1.5" fill="#ffffff" opacity="0.6"/>

  <!-- 頭蓋のクラック（ひび割れ） -->
  <path d="M29 8 L33 13 L31 16" stroke="#94a3b8" stroke-width="0.9" fill="none"/>

  <!-- 妖しく青白く灯るソウルアイ（スライム基準の多層生きた瞳光） -->
  <!-- 左眼窩 -->
  <ellipse cx="25.5" cy="18" rx="4.5" ry="5" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>
  <!-- 蒼炎オーラ -->
  <circle cx="25.5" cy="18" r="3.2" fill="#0284c7" opacity="0.65"/>
  <circle cx="25.5" cy="18" r="2.2" fill="#38bdf8"/>
  <circle cx="25.5" cy="17.2" r="1.2" fill="#ffffff"/>
  <circle cx="26.8" cy="19.2" r="0.6" fill="#ffffff" opacity="0.9"/>

  <!-- 右眼窩 -->
  <ellipse cx="38.5" cy="18" rx="4.5" ry="5" fill="#090d16" stroke="#1e293b" stroke-width="0.8"/>
  <!-- 蒼炎オーラ -->
  <circle cx="38.5" cy="18" r="3.2" fill="#0284c7" opacity="0.65"/>
  <circle cx="38.5" cy="18" r="2.2" fill="#38bdf8"/>
  <circle cx="38.5" cy="17.2" r="1.2" fill="#ffffff"/>
  <circle cx="39.8" cy="19.2" r="0.6" fill="#ffffff" opacity="0.9"/>

  <!-- 鼻孔（逆三角形の立体陰影） -->
  <polygon points="32,20 30,23 34,23" fill="#090d16"/>

  <!-- 歯列（上顎・下顎の立体歯） -->
  <rect x="25" y="24.5" width="2.6" height="3" rx="0.5" fill="#ffffff" stroke="#64748b" stroke-width="0.5"/>
  <rect x="28.5" y="24.5" width="2.6" height="3" rx="0.5" fill="#ffffff" stroke="#64748b" stroke-width="0.5"/>
  <rect x="32.5" y="24.5" width="2.6" height="3" rx="0.5" fill="#ffffff" stroke="#64748b" stroke-width="0.5"/>
  <rect x="36" y="24.5" width="2.6" height="3" rx="0.5" fill="#ffffff" stroke="#64748b" stroke-width="0.5"/>

  <!-- 左手: 古代鉄鋲の円盾（金属縁・木目・中央突起ボスの輝き） -->
  <circle cx="49" cy="36" r="9.5" fill="#334155" stroke="#0f172a" stroke-width="1.8"/>
  <circle cx="49" cy="36" r="7.5" fill="#64748b"/>
  <circle cx="49" cy="36" r="5" fill="#475569"/>
  <!-- 鉄鋲リベット -->
  <circle cx="49" cy="29" r="0.9" fill="#e2e8f0"/>
  <circle cx="49" cy="43" r="0.9" fill="#e2e8f0"/>
  <circle cx="42" cy="36" r="0.9" fill="#e2e8f0"/>
  <circle cx="56" cy="36" r="0.9" fill="#e2e8f0"/>
  <!-- 中央突起ボス -->
  <polygon points="49,32 52.5,36 49,40 45.5,36" fill="#cbd5e1" stroke="#334155" stroke-width="0.8"/>
  <circle cx="48" cy="35" r="1.2" fill="#ffffff"/>
</svg>`.trim();

  /** スケルトン背面（上向き） */
  public static readonly SKELETON_UP_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="5.5" fill="rgba(0,0,0,0.4)"/>
  <path d="M20 26 Q16 42 14 54 Q26 48 32 52 Q38 48 50 54 Q48 42 44 26 Z" fill="#9f1239" stroke="#4c0519" stroke-width="1.5"/>
  <path d="M22 28 Q18 43 16 51 Q26 47 32 50 Q38 47 48 51 Q46 43 42 28 Z" fill="#be123c" opacity="0.6"/>
  <path d="M20 16 C20 7 44 7 44 16 C44 23 41 25 38 27 L26 27 C23 25 20 23 20 16 Z" fill="#f8fafc" stroke="#475569" stroke-width="1.8"/>
  <line x1="26" y1="46" x2="25" y2="56" stroke="#f1f5f9" stroke-width="3.2"/>
  <line x1="38" y1="46" x2="39" y2="56" stroke="#f1f5f9" stroke-width="3.2"/>
</svg>`.trim();

  /** スケルトン側面（横向きエイリアス） */
  public static readonly SKELETON_SIDE_SVG = SVGSprites.SKELETON_DOWN_SVG;
  /** スケルトン斜め手前エイリアス */
  public static readonly SKELETON_DIAG_DOWN_SVG = SVGSprites.SKELETON_DOWN_SVG;
  /** スケルトン斜め奥エイリアス */
  public static readonly SKELETON_DIAG_UP_SVG = SVGSprites.SKELETON_UP_SVG;

  /** 岩石ゴーレム（立体多面玄武岩、灼熱の古代ルーン溶岩コア発光、クラック陰影、巨岩ハンマーアーム、生きた黄金眼光） */
  public static readonly GOLEM_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="25" ry="6.5" fill="rgba(0,0,0,0.48)"/>

  <!-- 両足巨石ブロック（立体陰影面） -->
  <!-- 左足 -->
  <polygon points="15,45 28,43 29,57 13,57" fill="#57534e" stroke="#1c1917" stroke-width="2"/>
  <polygon points="15,45 28,43 25,48 14,48" fill="#78716c"/>
  <line x1="21" y1="45" x2="20" y2="56" stroke="#a8a29e" stroke-width="1.2"/>
  
  <!-- 右足 -->
  <polygon points="36,43 49,45 51,57 35,57" fill="#57534e" stroke="#1c1917" stroke-width="2"/>
  <polygon points="36,43 49,45 47,48 37,48" fill="#78716c"/>
  <line x1="43" y1="45" x2="44" y2="56" stroke="#a8a29e" stroke-width="1.2"/>

  <!-- 巨大胴体（立体多面体シェーディング） -->
  <polygon points="13,21 51,21 47,47 17,47" fill="#44403c" stroke="#1c1917" stroke-width="2.5"/>
  <!-- 上面ハイライト面 -->
  <polygon points="14,21 50,21 46,26 18,26" fill="#78716c"/>
  <!-- 正面メイン面 -->
  <polygon points="18,26 46,26 43,44 21,44" fill="#57534e"/>

  <!-- 胸のクラックから激しく漏れ出す灼熱の古代溶岩魔導コア（スライム基準の多層発光） -->
  <!-- 外層グロー（オレンジ） -->
  <circle cx="32" cy="34" r="10" fill="#ea580c" opacity="0.35"/>
  <!-- 中層コア（アンバー） -->
  <circle cx="32" cy="34" r="7" fill="#f59e0b" opacity="0.7"/>
  <!-- 灼熱の稲妻クラック -->
  <path d="M25 28 L32 34 L27 42 L37 38 L39 44" stroke="#f97316" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <!-- 内層コア（黄金） -->
  <polygon points="32,28 37,34 32,40 27,34" fill="#fef08a" stroke="#ea580c" stroke-width="1.2"/>
  <!-- 激熱白光ハイライト -->
  <circle cx="32" cy="34" r="2.5" fill="#ffffff"/>

  <!-- 両肩の棘状巨石ポールトロン -->
  <!-- 左肩 -->
  <polygon points="7,17 18,15 20,32 8,30" fill="#78716c" stroke="#1c1917" stroke-width="2"/>
  <polygon points="8,17 18,15 15,22 7,20" fill="#a8a29e"/>
  <line x1="10" y1="19" x2="16" y2="30" stroke="#d6d3d1" stroke-width="1.2"/>
  <!-- 右肩 -->
  <polygon points="57,17 46,15 44,32 56,30" fill="#78716c" stroke="#1c1917" stroke-width="2"/>
  <polygon points="56,17 46,15 49,22 57,20" fill="#a8a29e"/>
  <line x1="54" y1="19" x2="48" y2="30" stroke="#d6d3d1" stroke-width="1.2"/>

  <!-- 巨岩のハンマーハンド腕（立体ブロックと光沢） -->
  <!-- 左腕 -->
  <ellipse cx="8" cy="38" rx="6.5" ry="8.5" fill="#57534e" stroke="#1c1917" stroke-width="2"/>
  <ellipse cx="7" cy="35" rx="3.5" ry="4" fill="#78716c"/>
  <circle cx="6" cy="33" r="1.5" fill="#d6d3d1" opacity="0.8"/>
  <!-- 右腕 -->
  <ellipse cx="56" cy="38" rx="6.5" ry="8.5" fill="#57534e" stroke="#1c1917" stroke-width="2"/>
  <ellipse cx="55" cy="35" rx="3.5" ry="4" fill="#78716c"/>
  <circle cx="54" cy="33" r="1.5" fill="#d6d3d1" opacity="0.8"/>

  <!-- 頭部巨岩（立体ブロック・風化クラック） -->
  <polygon points="21,7 43,7 46,21 18,21" fill="#57534e" stroke="#1c1917" stroke-width="2"/>
  <polygon points="22,7 42,7 39,12 25,12" fill="#a8a29e"/>
  <line x1="22" y1="9" x2="42" y2="9" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
  
  <!-- 苔むしたエメラルドの風合い（自然なグラデーション） -->
  <path d="M19 18 Q23 14 26 18" stroke="#84cc16" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M37 18 Q41 15 44 19" stroke="#84cc16" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="21" cy="23" r="1.5" fill="#4d7c0f"/>
  <circle cx="43" cy="23" r="1.5" fill="#4d7c0f"/>

  <!-- 黄金にギラつく生きたゴーレム眼光（スライム基準のハイライト） -->
  <!-- 左目 -->
  <rect x="24" y="13.5" width="4.8" height="3.8" rx="1" fill="#090d16" stroke="#ea580c" stroke-width="0.6"/>
  <rect x="24.5" y="14" width="3.8" height="2.8" rx="0.8" fill="#fef08a"/>
  <rect x="25" y="14.3" width="1.8" height="1.8" rx="0.5" fill="#ffffff"/>
  <!-- 右目 -->
  <rect x="35" y="13.5" width="4.8" height="3.8" rx="1" fill="#090d16" stroke="#ea580c" stroke-width="0.6"/>
  <rect x="35.5" y="14" width="3.8" height="2.8" rx="0.8" fill="#fef08a"/>
  <rect x="36" y="14.3" width="1.8" height="1.8" rx="0.5" fill="#ffffff"/>
</svg>`.trim();

  /** 岩石ゴーレム（上向きエイリアス） */
  public static readonly GOLEM_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;
  /** 岩石ゴーレム（横向き側面エイリアス） */
  public static readonly GOLEM_SIDE_SVG = SVGSprites.GOLEM_DOWN_SVG;
  /** 岩石ゴーレム（斜め手前エイリアス） */
  public static readonly GOLEM_DIAG_DOWN_SVG = SVGSprites.GOLEM_DOWN_SVG;
  /** 岩石ゴーレム（斜め奥エイリアス） */
  public static readonly GOLEM_DIAG_UP_SVG = SVGSprites.GOLEM_DOWN_SVG;

  /** マンドラゴラ（ふっくら人型根茎、スライム基準の生き生きとした丸い瞳、狂気の大口、瑞々しい大葉・大輪の熱帯毒花） */
  public static readonly MANDRAGORA_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="18" ry="5.5" fill="rgba(0,0,0,0.38)"/>

  <!-- 根の触手足（大地を踏み締める複数のひげ根） -->
  <path d="M23 44 Q15 51 12 58 Q19 55 25 48 Z" fill="#854d0e" stroke="#451a03" stroke-width="1.3"/>
  <path d="M41 44 Q49 51 52 58 Q45 55 39 48 Z" fill="#854d0e" stroke="#451a03" stroke-width="1.3"/>
  <path d="M28 47 Q27 55 24 58 Q29 55 31 49 Z" fill="#713f12"/>
  <path d="M36 47 Q37 55 40 58 Q35 55 33 49 Z" fill="#713f12"/>

  <!-- 人型根茎の肉体（ふっくら立体感・陰影・根のシワ） -->
  <path d="M17 25 Q32 15 47 25 Q49 46 32 54 Q15 46 17 25 Z" fill="#a16207" stroke="#451a03" stroke-width="2"/>
  <!-- お腹のハイライト（ふっくら膨らみ） -->
  <path d="M21 27 Q32 20 43 27 Q45 44 32 50 Q19 44 21 27 Z" fill="#ca8a04" opacity="0.6"/>
  <ellipse cx="32" cy="35" rx="9" ry="10" fill="#eab308" opacity="0.3"/>
  <!-- 根茎の筋・シワ -->
  <path d="M21 32 Q32 28 43 32" stroke="#713f12" stroke-width="1.4" fill="none"/>
  <path d="M20 41 Q32 38 44 41" stroke="#713f12" stroke-width="1.4" fill="none"/>

  <!-- 頭頂から勢いよく繁茂する瑞々しい大葉（葉脈・光沢ハイライト） -->
  <!-- 左大葉 -->
  <path d="M32 18 Q14 7 8 -1 Q24 3 30 14 Z" fill="#15803d" stroke="#14532d" stroke-width="1.6"/>
  <path d="M30 16 Q18 9 14 3" stroke="#86efac" stroke-width="1.2" fill="none"/>
  <!-- 右大葉 -->
  <path d="M32 18 Q50 7 56 -1 Q40 3 34 14 Z" fill="#15803d" stroke="#14532d" stroke-width="1.6"/>
  <path d="M34 16 Q46 9 50 3" stroke="#86efac" stroke-width="1.2" fill="none"/>
  <!-- 中央若葉 -->
  <path d="M32 16 Q32 2 32 -3 Q39 4 33 14 Z" fill="#22c55e" stroke="#166534" stroke-width="1.5"/>
  <ellipse cx="32" cy="3" rx="1.5" ry="3" fill="#ffffff" opacity="0.5"/>

  <!-- 鮮やかな熱帯毒花（多層花弁＆妖しい花粉光） -->
  <circle cx="21" cy="7" r="4.2" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
  <circle cx="21" cy="7" r="2.2" fill="#c084fc"/>
  <circle cx="43" cy="7" r="4.2" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
  <circle cx="43" cy="7" r="2.2" fill="#c084fc"/>
  <circle cx="32" cy="4" r="5" fill="#ec4899" stroke="#be185d" stroke-width="1.2"/>
  <circle cx="32" cy="4" r="2.8" fill="#f472b6"/>
  <circle cx="32" cy="4" r="1.5" fill="#fef08a"/>

  <!-- スライム絶賛基準の生き生きとした大きな丸い瞳（多層構造・白ハイライト2点） -->
  <!-- 左目 -->
  <ellipse cx="25.5" cy="26" rx="4.8" ry="6" fill="#451a03" stroke="#1c1917" stroke-width="1"/>
  <ellipse cx="25.5" cy="26" rx="3.8" ry="4.8" fill="#facc15"/>
  <ellipse cx="25.5" cy="26" rx="2.2" ry="3.2" fill="#dc2626"/>
  <ellipse cx="24.2" cy="23.8" rx="1.6" ry="2.2" fill="#ffffff"/>
  <circle cx="26.8" cy="28.5" r="0.9" fill="#ffffff" opacity="0.9"/>

  <!-- 右目 -->
  <ellipse cx="38.5" cy="26" rx="4.8" ry="6" fill="#451a03" stroke="#1c1917" stroke-width="1"/>
  <ellipse cx="38.5" cy="26" rx="3.8" ry="4.8" fill="#facc15"/>
  <ellipse cx="38.5" cy="26" rx="2.2" ry="3.2" fill="#dc2626"/>
  <ellipse cx="37.2" cy="23.8" rx="1.6" ry="2.2" fill="#ffffff"/>
  <circle cx="39.8" cy="28.5" r="0.9" fill="#ffffff" opacity="0.9"/>

  <!-- 狂気の大口（真っ赤な口腔・尖った牙列・叫びの震え） -->
  <ellipse cx="32" cy="38" rx="6" ry="7.5" fill="#450a0a" stroke="#7f1d1d" stroke-width="1.6"/>
  <!-- 上下の小さな尖り牙 -->
  <polygon points="28,33 29.5,36 31,33" fill="#fef3c7"/>
  <polygon points="33,33 34.5,36 36,33" fill="#fef3c7"/>
  <polygon points="29,43 30.5,40 32,43" fill="#fef3c7"/>
  <polygon points="32,43 33.5,40 35,43" fill="#fef3c7"/>
  <!-- 叫ぶ舌 -->
  <path d="M29 39 Q32 42 35 39 Q32 37 29 39 Z" fill="#ef4444"/>
  <!-- 口元から立ち上る超音波の叫び輪 -->
  <path d="M24 37 Q22 38 24 39" stroke="#fda4af" stroke-width="1" fill="none" opacity="0.7"/>
  <path d="M40 37 Q42 38 40 39" stroke="#fda4af" stroke-width="1" fill="none" opacity="0.7"/>
</svg>`.trim();

  /** マンドラゴラ（上向きエイリアス） */
  public static readonly MANDRAGORA_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  /** マンドラゴラ（横向き側面エイリアス） */
  public static readonly MANDRAGORA_SIDE_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  /** マンドラゴラ（斜め手前エイリアス） */
  public static readonly MANDRAGORA_DIAG_DOWN_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;
  /** マンドラゴラ（斜め奥エイリアス） */
  public static readonly MANDRAGORA_DIAG_UP_SVG = SVGSprites.MANDRAGORA_DOWN_SVG;

  /** サハギン戦士（三叉銛トライデント、半透明トゲ背ビレ、ギョロリ魚眼の生きた光彩、深海魚鱗グラデーション、水滴光沢） */
  public static readonly SAHAGIN_DOWN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- 接地ドロップシャドウ -->
  <ellipse cx="32" cy="58" rx="20" ry="5.5" fill="rgba(0,0,0,0.4)"/>

  <!-- 右手: 白銀に輝く三叉銛（トライデント） -->
  <g transform="rotate(-15 14 36)">
    <!-- 銛のシャフト（深海アクア） -->
    <line x1="14" y1="3" x2="14" y2="49" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
    <line x1="14.5" y1="5" x2="14.5" y2="47" stroke="#38bdf8" stroke-width="1"/>
    <!-- 銛の刃身フレーム -->
    <path d="M6 5 L14 17 L22 5" stroke="#0284c7" stroke-width="2.4" fill="none" stroke-linejoin="round"/>
    <!-- 中央主穂先 -->
    <polygon points="14,1 10.5,8 17.5,8" fill="#f0f9ff" stroke="#0284c7" stroke-width="1"/>
    <polygon points="14,3 12,8 16,8" fill="#ffffff"/>
    <!-- 左右副穂先 -->
    <polygon points="6,3 3.5,9 8.5,9" fill="#e0f2fe" stroke="#0284c7" stroke-width="0.8"/>
    <polygon points="22,3 19.5,9 24.5,9" fill="#e0f2fe" stroke="#0284c7" stroke-width="0.8"/>
    <!-- 水流の煌めき -->
    <circle cx="14" cy="12" r="1.5" fill="#38bdf8"/>
    <circle cx="14" cy="12" r="0.8" fill="#ffffff"/>
  </g>

  <!-- 巨大な半透明トゲ背ビレ（多層透明レイヤー＆ヒレ骨格） -->
  <path d="M32 3 Q40 15 44 28 L30 26 Q30 13 32 3 Z" fill="#2dd4bf" stroke="#0f766e" stroke-width="1.6" opacity="0.9"/>
  <path d="M33 5 Q39 16 42 27 L32 25 Q32 14 33 5 Z" fill="#5eead4" opacity="0.6"/>
  <line x1="32" y1="3" x2="44" y2="15" stroke="#14b8a6" stroke-width="2"/>
  <line x1="32" y1="11" x2="45" y2="21" stroke="#14b8a6" stroke-width="2"/>
  <circle cx="44" cy="15" r="1" fill="#ffffff" opacity="0.8"/>

  <!-- 水掻き付き両足（立体ヒレ足） -->
  <rect x="22" y="46" width="7" height="11" rx="2" fill="#0f766e" stroke="#134e4a" stroke-width="1.3"/>
  <polygon points="17,57 28,54 27,58" fill="#2dd4bf" stroke="#0f766e" stroke-width="1"/>
  <rect x="33" y="46" width="7" height="11" rx="2" fill="#0f766e" stroke="#134e4a" stroke-width="1.3"/>
  <polygon points="47,57 36,54 37,58" fill="#2dd4bf" stroke="#0f766e" stroke-width="1"/>

  <!-- 魚鱗胴体と珊瑚ブレストプレート（多層グラデーション＆水滴光沢） -->
  <path d="M19 25 L45 25 L42 46 L22 46 Z" fill="#0d9488" stroke="#134e4a" stroke-width="1.8"/>
  <!-- 胴体インナーハイライト -->
  <path d="M21 27 L43 27 L40 44 L24 44 Z" fill="#14b8a6" opacity="0.6"/>
  <!-- 魚鱗の波模様（ハイライト） -->
  <path d="M24 30 Q28 33 32 30 Q36 33 40 30" stroke="#a7f3d0" stroke-width="1.5" fill="none"/>
  <path d="M23 35 Q28 38 32 35 Q36 38 41 35" stroke="#a7f3d0" stroke-width="1.5" fill="none"/>
  <path d="M25 40 Q28 43 32 40 Q36 43 39 40" stroke="#a7f3d0" stroke-width="1.5" fill="none"/>
  <!-- 水滴ハイライト光（スライム調） -->
  <ellipse cx="25" cy="28" rx="2" ry="1" fill="#ffffff" opacity="0.65"/>
  <ellipse cx="39" cy="38" rx="1.5" ry="0.8" fill="#ffffff" opacity="0.65"/>

  <!-- 魚面の頭部とエラヒレ（立体造形） -->
  <ellipse cx="32" cy="19" rx="14" ry="12" fill="#0d9488" stroke="#134e4a" stroke-width="1.8"/>
  <ellipse cx="32" cy="14" rx="8" ry="3.5" fill="#2dd4bf" opacity="0.6"/>
  <!-- おでこ光沢 -->
  <ellipse cx="32" cy="11" rx="5" ry="2" fill="#ffffff" opacity="0.75"/>
  <!-- 左右のエラヒレ（半透明） -->
  <path d="M19 20 Q15 24 18 28" stroke="#14b8a6" stroke-width="2.5" fill="none"/>
  <path d="M45 20 Q49 24 46 28" stroke="#14b8a6" stroke-width="2.5" fill="none"/>

  <!-- ギョロリと光る大きな魚の眼球（スライム基準の多層生きた瞳光） -->
  <!-- 左目 -->
  <ellipse cx="25.5" cy="18" rx="4.8" ry="5.5" fill="#134e4a" stroke="#042f2e" stroke-width="1"/>
  <ellipse cx="25.5" cy="18" rx="3.8" ry="4.5" fill="#fef08a"/>
  <ellipse cx="25.5" cy="18" rx="2.2" ry="2.8" fill="#020617"/>
  <ellipse cx="24.2" cy="16.2" rx="1.6" ry="2" fill="#ffffff"/>
  <circle cx="26.8" cy="19.5" r="0.8" fill="#ffffff" opacity="0.85"/>

  <!-- 右目 -->
  <ellipse cx="38.5" cy="18" rx="4.8" ry="5.5" fill="#134e4a" stroke="#042f2e" stroke-width="1"/>
  <ellipse cx="38.5" cy="18" rx="3.8" ry="4.5" fill="#fef08a"/>
  <ellipse cx="38.5" cy="18" rx="2.2" ry="2.8" fill="#020617"/>
  <ellipse cx="37.2" cy="16.2" rx="1.6" ry="2" fill="#ffffff"/>
  <circle cx="39.8" cy="19.5" r="0.8" fill="#ffffff" opacity="0.85"/>

  <!-- 鋭い口元と純白の魚牙列 -->
  <path d="M26 26 Q32 30 38 26" stroke="#134e4a" stroke-width="2" fill="none"/>
  <polygon points="27,26 28.5,23 30,26" fill="#ffffff"/>
  <polygon points="31,26 32.5,23 34,26" fill="#ffffff"/>
  <polygon points="35,26 36.5,23 38,26" fill="#ffffff"/>
</svg>`.trim();

  /** サハギン戦士（上向きエイリアス） */
  public static readonly SAHAGIN_UP_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  /** サハギン戦士（横向き側面エイリアス） */
  public static readonly SAHAGIN_SIDE_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  /** サハギン戦士（斜め手前エイリアス） */
  public static readonly SAHAGIN_DIAG_DOWN_SVG = SVGSprites.SAHAGIN_DOWN_SVG;
  /** サハギン戦士（斜め奥エイリアス） */
  public static readonly SAHAGIN_DIAG_UP_SVG = SVGSprites.SAHAGIN_DOWN_SVG;

  // 後方互換用エイリアス
  /** プレイヤー（正面下向き後方互換エイリアス） */
  public static readonly PLAYER_SVG = SVGSprites.PLAYER_DOWN_SVG;
  /** プレイヤー歩行1（正面下向き後方互換エイリアス） */
  public static readonly PLAYER_WALK1_SVG = SVGSprites.PLAYER_DOWN_WALK1_SVG;
  /** プレイヤー歩行2（正面下向き後方互換エイリアス） */
  public static readonly PLAYER_WALK2_SVG = SVGSprites.PLAYER_DOWN_WALK2_SVG;
  /** スライム（正面下向き後方互換エイリアス） */
  public static readonly SLIME_SVG = SVGSprites.SLIME_DOWN_SVG;
  /** ゴブリン（正面下向き後方互換エイリアス） */
  public static readonly GOBLIN_SVG = SVGSprites.GOBLIN_DOWN_SVG;
  /** スケルトン（正面下向き後方互換エイリアス） */
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

      // 商人・怒りの店主・番犬
      merchant: MonsterAndItemSprites.MERCHANT_DOWN_SVG,
      merchant_down: MonsterAndItemSprites.MERCHANT_DOWN_SVG,
      merchant_up: MonsterAndItemSprites.MERCHANT_UP_SVG,
      merchant_side: MonsterAndItemSprites.MERCHANT_SIDE_SVG,
      merchant_diag_down: MonsterAndItemSprites.MERCHANT_DIAG_DOWN_SVG,
      merchant_diag_up: MonsterAndItemSprites.MERCHANT_DIAG_UP_SVG,

      angry_merchant: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,
      angry_merchant_down: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,
      angry_merchant_up: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,
      angry_merchant_side: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,
      angry_merchant_diag_down: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,
      angry_merchant_diag_up: MonsterAndItemSprites.ANGRY_MERCHANT_DOWN_SVG,

      guard_dog: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,
      guard_dog_down: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,
      guard_dog_up: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,
      guard_dog_side: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,
      guard_dog_diag_down: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,
      guard_dog_diag_up: MonsterAndItemSprites.GUARD_DOG_DOWN_SVG,

      // レアキャラクター4種
      wandering_adventurer: MonsterAndItemSprites.WANDERING_ADVENTURER_DOWN_SVG,
      wandering_adventurer_down: MonsterAndItemSprites.WANDERING_ADVENTURER_DOWN_SVG,
      gambler_sage: MonsterAndItemSprites.GAMBLER_SAGE_DOWN_SVG,
      gambler_sage_down: MonsterAndItemSprites.GAMBLER_SAGE_DOWN_SVG,
      healing_fairy: MonsterAndItemSprites.HEALING_FAIRY_DOWN_SVG,
      healing_fairy_down: MonsterAndItemSprites.HEALING_FAIRY_DOWN_SVG,
      traveling_blacksmith: MonsterAndItemSprites.TRAVELING_BLACKSMITH_DOWN_SVG,
      traveling_blacksmith_down: MonsterAndItemSprites.TRAVELING_BLACKSMITH_DOWN_SVG,
      abyss_lord: MonsterAndItemSprites.ABYSS_LORD_DOWN_SVG,
      abyss_lord_down: MonsterAndItemSprites.ABYSS_LORD_DOWN_SVG,

      // スクーターおじさん
      scooter_guy: MonsterAndItemSprites.SCOOTER_GUY_DOWN_SVG,
      scooter_guy_down: MonsterAndItemSprites.SCOOTER_GUY_DOWN_SVG,
      scooter_guy_up: MonsterAndItemSprites.SCOOTER_GUY_UP_SVG,
      scooter_guy_side: MonsterAndItemSprites.SCOOTER_GUY_SIDE_SVG,
      scooter_guy_diag_down: MonsterAndItemSprites.SCOOTER_GUY_DIAG_DOWN_SVG,
      scooter_guy_diag_up: MonsterAndItemSprites.SCOOTER_GUY_DIAG_UP_SVG,

      // 店主バリエーション
      merchant_torneko: MonsterAndItemSprites.MERCHANT_TORNEKO_DOWN_SVG,
      merchant_torneko_down: MonsterAndItemSprites.MERCHANT_TORNEKO_DOWN_SVG,
      angry_merchant_torneko: MonsterAndItemSprites.ANGRY_TORNEKO_DOWN_SVG,
      angry_merchant_torneko_down: MonsterAndItemSprites.ANGRY_TORNEKO_DOWN_SVG,

      merchant_shiren: MonsterAndItemSprites.MERCHANT_SHIREN_DOWN_SVG,
      merchant_shiren_down: MonsterAndItemSprites.MERCHANT_SHIREN_DOWN_SVG,
      angry_merchant_shiren: MonsterAndItemSprites.ANGRY_SHIREN_DOWN_SVG,
      angry_merchant_shiren_down: MonsterAndItemSprites.ANGRY_SHIREN_DOWN_SVG,

      merchant_goldo: MonsterAndItemSprites.MERCHANT_GOLDO_DOWN_SVG,
      merchant_goldo_down: MonsterAndItemSprites.MERCHANT_GOLDO_DOWN_SVG,
      angry_merchant_goldo: MonsterAndItemSprites.ANGRY_GOLDO_DOWN_SVG,
      angry_merchant_goldo_down: MonsterAndItemSprites.ANGRY_GOLDO_DOWN_SVG,

      merchant_celia: MonsterAndItemSprites.MERCHANT_CELIA_DOWN_SVG,
      merchant_celia_down: MonsterAndItemSprites.MERCHANT_CELIA_DOWN_SVG,
      angry_merchant_celia: MonsterAndItemSprites.ANGRY_CELIA_DOWN_SVG,
      angry_merchant_celia_down: MonsterAndItemSprites.ANGRY_CELIA_DOWN_SVG,

      // 迷宮屋台システム（ラーメンマルキン・おでん）
      food_stall: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_down: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_up: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_side: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_diag_down: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_diag_up: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_ramen: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_ramen_down: MonsterAndItemSprites.FOOD_STALL_RAMEN_DOWN_SVG,
      food_stall_ramen_wife: MonsterAndItemSprites.FOOD_STALL_RAMEN_WIFE_DOWN_SVG,
      food_stall_ramen_wife_down: MonsterAndItemSprites.FOOD_STALL_RAMEN_WIFE_DOWN_SVG,
      food_stall_oden: MonsterAndItemSprites.FOOD_STALL_ODEN_DOWN_SVG,
      food_stall_oden_down: MonsterAndItemSprites.FOOD_STALL_ODEN_DOWN_SVG,

      // アイテム
      item_gold: MonsterAndItemSprites.ITEM_GOLD_PILE_SVG,
      item_pot_synthesis: MonsterAndItemSprites.ITEM_POT_SYNTHESIS_SVG,
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

    // ==========================================
    // 色違い・上位種・亜種モンスターSVGの動的パレットスワップ生成
    // ==========================================
    const baseSprites: Record<
      string,
      { down: string; up: string; side: string; diag_down: string; diag_up: string }
    > = {
      slime: {
        down: this.SLIME_DOWN_SVG,
        up: this.SLIME_UP_SVG,
        side: this.SLIME_SIDE_SVG,
        diag_down: this.SLIME_DIAG_DOWN_SVG,
        diag_up: this.SLIME_DIAG_UP_SVG,
      },
      goblin: {
        down: this.GOBLIN_DOWN_SVG,
        up: this.GOBLIN_UP_SVG,
        side: this.GOBLIN_SIDE_SVG,
        diag_down: this.GOBLIN_DIAG_DOWN_SVG,
        diag_up: this.GOBLIN_DIAG_UP_SVG,
      },
      skeleton: {
        down: this.SKELETON_DOWN_SVG,
        up: this.SKELETON_UP_SVG,
        side: this.SKELETON_SIDE_SVG,
        diag_down: this.SKELETON_DIAG_DOWN_SVG,
        diag_up: this.SKELETON_DIAG_UP_SVG,
      },
      golem: {
        down: this.GOLEM_DOWN_SVG,
        up: this.GOLEM_UP_SVG,
        side: this.GOLEM_SIDE_SVG,
        diag_down: this.GOLEM_DIAG_DOWN_SVG,
        diag_up: this.GOLEM_DIAG_UP_SVG,
      },
      bat: {
        down: MonsterAndItemSprites.BAT_DOWN_SVG,
        up: MonsterAndItemSprites.BAT_UP_SVG,
        side: MonsterAndItemSprites.BAT_SIDE_SVG,
        diag_down: MonsterAndItemSprites.BAT_DIAG_DOWN_SVG,
        diag_up: MonsterAndItemSprites.BAT_DIAG_UP_SVG,
      },
      ghost: {
        down: MonsterAndItemSprites.GHOST_DOWN_SVG,
        up: MonsterAndItemSprites.GHOST_UP_SVG,
        side: MonsterAndItemSprites.GHOST_SIDE_SVG,
        diag_down: MonsterAndItemSprites.GHOST_DIAG_DOWN_SVG,
        diag_up: MonsterAndItemSprites.GHOST_DIAG_UP_SVG,
      },
      dragon: {
        down: MonsterAndItemSprites.DRAGON_DOWN_SVG,
        up: MonsterAndItemSprites.DRAGON_UP_SVG,
        side: MonsterAndItemSprites.DRAGON_SIDE_SVG,
        diag_down: MonsterAndItemSprites.DRAGON_DIAG_DOWN_SVG,
        diag_up: MonsterAndItemSprites.DRAGON_UP_SVG,
      },
    };

    const variantDefs: {
      id: string;
      base: 'slime' | 'goblin' | 'skeleton' | 'bat' | 'ghost' | 'golem' | 'dragon';
      colors: Record<string, string>;
    }[] = [
      // 1. スライム系
      {
        id: 'red_slime',
        base: 'slime',
        colors: {
          '#10b981': '#ef4444',
          '#064e3b': '#7f1d1d',
          '#34d399': '#f87171',
          '#a7f3d0': '#fca5a5',
          '#0284c7': '#ea580c',
          '#38bdf8': '#fde047',
        },
      },
      {
        id: 'metal_slime',
        base: 'slime',
        colors: {
          '#10b981': '#64748b',
          '#064e3b': '#1e293b',
          '#34d399': '#cbd5e1',
          '#a7f3d0': '#f1f5f9',
          '#0284c7': '#38bdf8',
          '#38bdf8': '#ffffff',
        },
      },
      {
        id: 'friendly_slime',
        base: 'slime',
        colors: {
          '#10b981': '#ec4899',
          '#064e3b': '#831843',
          '#34d399': '#f472b6',
          '#a7f3d0': '#fbcfe8',
          '#0284c7': '#f43f5e',
          '#38bdf8': '#fecdd3',
        },
      },
      // 2. ゴブリン系
      {
        id: 'hobgoblin',
        base: 'goblin',
        colors: {
          '#65a30d': '#b45309',
          '#365314': '#451a03',
          '#4d7c0f': '#78350f',
        },
      },
      {
        id: 'goblin_shaman',
        base: 'goblin',
        colors: {
          '#65a30d': '#7c3aed',
          '#365314': '#2e1065',
          '#4d7c0f': '#581c87',
          '#713f12': '#1e1b4b',
        },
      },
      // 3. スケルトン系
      {
        id: 'poison_skeleton',
        base: 'skeleton',
        colors: {
          '#f8fafc': '#10b981',
          '#f1f5f9': '#34d399',
          '#e2e8f0': '#059669',
          '#38bdf8': '#a855f7',
          '#881337': '#064e3b',
          '#9f1239': '#022c22',
        },
      },
      {
        id: 'blood_skeleton',
        base: 'skeleton',
        colors: {
          '#f8fafc': '#dc2626',
          '#f1f5f9': '#ef4444',
          '#e2e8f0': '#b91c1c',
          '#38bdf8': '#fbbf24',
          '#881337': '#450a0a',
          '#9f1239': '#180117',
        },
      },
      // 4. コウモリ系
      {
        id: 'chaos_bat',
        base: 'bat',
        colors: {
          '#3b0764': '#d97706',
          '#581c87': '#f59e0b',
          '#2e1065': '#78350f',
          '#7e22ce': '#fbbf24',
        },
      },
      // 5. ゴースト系
      {
        id: 'wraith',
        base: 'ghost',
        colors: {
          '#38bdf8': '#a855f7',
          '#0284c7': '#6b21a8',
          '#0369a1': '#3b0764',
          '#bae6fd': '#e9d5ff',
        },
      },
      // 6. ゴーレム系
      {
        id: 'magma_golem',
        base: 'golem',
        colors: {
          '#57534e': '#7f1d1d',
          '#44403c': '#450a0a',
          '#a8a29e': '#ea580c',
          '#fef08a': '#fbbf24',
        },
      },
      // 7. ドラゴン系
      {
        id: 'blue_dragon',
        base: 'dragon',
        colors: {
          '#dc2626': '#2563eb',
          '#991b1b': '#1d4ed8',
          '#ef4444': '#38bdf8',
          '#7f1d1d': '#1e3a8a',
        },
      },
      {
        id: 'black_dragon',
        base: 'dragon',
        colors: {
          '#dc2626': '#0f172a',
          '#991b1b': '#1e1b4b',
          '#ef4444': '#475569',
          '#7f1d1d': '#020617',
          '#fbbf24': '#ef4444',
        },
      },
    ];

    for (const v of variantDefs) {
      const b = baseSprites[v.base];
      if (!b) continue;
      const downSvg = this.replaceSvgColors(b.down, v.colors);
      const upSvg = this.replaceSvgColors(b.up, v.colors);
      const sideSvg = this.replaceSvgColors(b.side, v.colors);
      const diagDownSvg = this.replaceSvgColors(b.diag_down, v.colors);
      const diagUpSvg = this.replaceSvgColors(b.diag_up, v.colors);

      spriteMap[v.id as SpriteId] = downSvg;
      spriteMap[`${v.id}_down` as SpriteId] = downSvg;
      spriteMap[`${v.id}_up` as SpriteId] = upSvg;
      spriteMap[`${v.id}_side` as SpriteId] = sideSvg;
      spriteMap[`${v.id}_diag_down` as SpriteId] = diagDownSvg;
      spriteMap[`${v.id}_diag_up` as SpriteId] = diagUpSvg;
    }

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
   * SVG文字列内のカラーコード（HEXコード）を指定されたマッピングに従って一括置換します。
   * 大文字・小文字両方のHEX表記に対応して安全に置換を行います。
   *
   * @param svg - 元となるベクターSVG文字列
   * @param colorMap - 置換元カラー -> 置換後カラーのマッピング
   * @returns パレット置換後のSVG文字列
   */
  public static replaceSvgColors(
    svg: string,
    colorMap: Record<string, string>
  ): string {
    let result = svg;
    for (const [fromColor, toColor] of Object.entries(colorMap)) {
      const escaped = fromColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, toColor);
    }
    return result;
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
    if (category === 'GOLD' || (name && name.includes('ゴールド'))) {
      return 'item_gold';
    }

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
      // 壺
      if (name.includes('壺')) return 'item_pot_synthesis';
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
      case 'POT':
        return 'item_pot_synthesis';
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
