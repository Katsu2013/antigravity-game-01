/**
 * @file EquipmentSprites.ts
 * @description プレイヤーキャラクターが装備する武器（片手剣・短剣・魔剣など5種）および
 * 盾（丸盾・バックラー・大盾など5種）の方向別オーバーレイスプライトを定義・キャッシュ・提供するクラス。
 * プレイヤー素体（64x64 viewBox）の手元・背中に完全に合致するよう座標設計されています。
 */

import { Direction8 } from '../../core/types';

/**
 * 装備スプライトの識別子。
 */
export type EquipmentSpriteId =
  // 武器 (WEAPON) 5種 x 5方向 (down, up, side, diag_down, diag_up)
  | 'weapon_dagger_down'
  | 'weapon_dagger_up'
  | 'weapon_dagger_side'
  | 'weapon_dagger_diag_down'
  | 'weapon_dagger_diag_up'
  | 'weapon_iron_sword_down'
  | 'weapon_iron_sword_up'
  | 'weapon_iron_sword_side'
  | 'weapon_iron_sword_diag_down'
  | 'weapon_iron_sword_diag_up'
  | 'weapon_mithril_sword_down'
  | 'weapon_mithril_sword_up'
  | 'weapon_mithril_sword_side'
  | 'weapon_mithril_sword_diag_down'
  | 'weapon_mithril_sword_diag_up'
  | 'weapon_flame_sword_down'
  | 'weapon_flame_sword_up'
  | 'weapon_flame_sword_side'
  | 'weapon_flame_sword_diag_down'
  | 'weapon_flame_sword_diag_up'
  | 'weapon_rune_sword_down'
  | 'weapon_rune_sword_up'
  | 'weapon_rune_sword_side'
  | 'weapon_rune_sword_diag_down'
  | 'weapon_rune_sword_diag_up'
  // 盾 (SHIELD) 5種 x 5方向 (down, up, side, diag_down, diag_up)
  | 'shield_wood_down'
  | 'shield_wood_up'
  | 'shield_wood_side'
  | 'shield_wood_diag_down'
  | 'shield_wood_diag_up'
  | 'shield_bronze_down'
  | 'shield_bronze_up'
  | 'shield_bronze_side'
  | 'shield_bronze_diag_down'
  | 'shield_bronze_diag_up'
  | 'shield_steel_down'
  | 'shield_steel_up'
  | 'shield_steel_side'
  | 'shield_steel_diag_down'
  | 'shield_steel_diag_up'
  | 'shield_magic_down'
  | 'shield_magic_up'
  | 'shield_magic_side'
  | 'shield_magic_diag_down'
  | 'shield_magic_diag_up'
  | 'shield_dragon_down'
  | 'shield_dragon_up'
  | 'shield_dragon_side'
  | 'shield_dragon_diag_down'
  | 'shield_dragon_diag_up';

/**
 * 武器および盾のオーバーレイスプライト管理クラス。
 */
export class EquipmentSprites {
  /**
   * キャッシュされた装備スプライト画像マップ。
   */
  private static imageCache: Map<EquipmentSpriteId, HTMLImageElement> = new Map();

  /**
   * 初期化完了を通知するPromise。
   */
  private static readyPromise: Promise<void> | null = null;

  // =========================================================================
  // 1. 武器 (WEAPONS) SVG 定義
  // =========================================================================

  /** 青銅の短剣（下向き正面）オーバーレイSVG */
  private static readonly DAGGER_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="44" y="20" width="3.5" height="15" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1"/>
  <polygon points="44,20 45.7,16 47.5,20" fill="#f59e0b"/>
  <rect x="42" y="34" width="8" height="2.5" fill="#78350f"/>
  <rect x="44.5" y="36.5" width="2" height="4" fill="#451a03"/>
</svg>`.trim();

  /** 青銅の短剣（上向き背面）オーバーレイSVG */
  private static readonly DAGGER_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="43" y="14" width="3" height="12" rx="1" fill="#92400e"/>
  <rect x="41" y="24" width="7" height="2.5" fill="#78350f"/>
</svg>`.trim();

  /** 青銅の短剣（横向きサイドビュー）オーバーレイSVG */
  private static readonly DAGGER_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="39" y="31.5" width="14" height="3" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1"/>
  <polygon points="53,31.5 56.5,33 53,34.5" fill="#f59e0b"/>
  <rect x="37" y="30" width="2.5" height="6" fill="#78350f"/>
</svg>`.trim();

  /** 青銅の短剣（斜め手前クォータービュー）オーバーレイSVG */
  private static readonly DAGGER_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(38 38 28)">
    <rect x="38" y="14" width="3.5" height="18" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1"/>
    <polygon points="38,14 39.7,10 41.5,14" fill="#f59e0b"/>
    <rect x="35" y="31" width="10" height="3" fill="#78350f"/>
  </g>
</svg>`.trim();

  /** 青銅の短剣（斜め奥背面）オーバーレイSVG */
  private static readonly DAGGER_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(25 36 20)">
    <rect x="36" y="8" width="3" height="16" rx="1" fill="#92400e"/>
    <rect x="34" y="20" width="7" height="2.5" fill="#78350f"/>
  </g>
</svg>`.trim();

  /** 鉄の剣（下向き正面）オーバーレイSVG */
  private static readonly IRON_SWORD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="44" y="10" width="4" height="24" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <polygon points="44,10 46,6 48,10" fill="#ffffff"/>
  <rect x="41" y="32" width="10" height="3" fill="#d97706"/>
  <rect x="45" y="35" width="2" height="6" fill="#78350f"/>
  <circle cx="46" cy="42" r="2" fill="#fbbf24"/>
</svg>`.trim();

  /** 鉄の剣（上向き背面）オーバーレイSVG */
  private static readonly IRON_SWORD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="42" y="8" width="4" height="18" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <rect x="39" y="22" width="10" height="3" fill="#d97706"/>
  <circle cx="44" cy="7" r="2" fill="#fbbf24"/>
</svg>`.trim();

  /** 鉄の剣（横向きサイドビュー）オーバーレイSVG */
  private static readonly IRON_SWORD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="39" y="31" width="21" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
  <polygon points="60,31 63.5,33 60,35" fill="#ffffff"/>
  <rect x="37" y="28" width="3" height="10" fill="#d97706"/>
  <circle cx="34" cy="33" r="2" fill="#fbbf24"/>
</svg>`.trim();

  /** 鉄の剣（斜め手前クォータービュー）オーバーレイSVG */
  private static readonly IRON_SWORD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(40 38 28)">
    <rect x="38" y="6" width="4.5" height="26" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
    <polygon points="38,6 40.2,2 42.5,6" fill="#ffffff"/>
    <rect x="33" y="32" width="14" height="4" rx="1" fill="#d97706"/>
    <circle cx="40" cy="42" r="2.5" fill="#fbbf24"/>
  </g>
</svg>`.trim();

  /** 鉄の剣（斜め奥背面）オーバーレイSVG */
  private static readonly IRON_SWORD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(25 36 20)">
    <rect x="35" y="4" width="4" height="24" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#d97706"/>
    <circle cx="37" cy="5" r="2.5" fill="#fbbf24"/>
  </g>
</svg>`.trim();

  /** ミスリルの剣（下向き正面）オーバーレイSVG */
  private static readonly MITHRIL_SWORD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="44" y="8" width="4" height="25" rx="1" fill="#c7d2fe" stroke="#6366f1" stroke-width="1.2"/>
  <line x1="46" y1="9" x2="46" y2="30" stroke="#ffffff" stroke-width="1.2"/>
  <rect x="40" y="32" width="12" height="3.5" rx="1" fill="#4338ca"/>
  <circle cx="46" cy="33.7" r="1.5" fill="#a5b4fc"/>
  <circle cx="46" cy="42" r="2.5" fill="#818cf8"/>
</svg>`.trim();

  /** ミスリルの剣（上向き背面）オーバーレイSVG */
  private static readonly MITHRIL_SWORD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="42" y="6" width="4" height="20" rx="1" fill="#312e81" stroke="#6366f1" stroke-width="1"/>
  <rect x="39" y="22" width="10" height="3.5" fill="#4338ca"/>
  <circle cx="44" cy="5" r="2.5" fill="#a5b4fc"/>
</svg>`.trim();

  /** ミスリルの剣（横向きサイドビュー）オーバーレイSVG */
  private static readonly MITHRIL_SWORD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="39" y="30.5" width="22" height="4.5" rx="1" fill="#c7d2fe" stroke="#6366f1" stroke-width="1.2"/>
  <polygon points="61,30.5 64.5,32.7 61,35" fill="#ffffff"/>
  <rect x="37" y="27" width="3" height="11" rx="1" fill="#4338ca"/>
  <circle cx="34" cy="32.5" r="2.5" fill="#818cf8"/>
</svg>`.trim();

  /** ミスリルの剣（斜め手前クォータービュー）オーバーレイSVG */
  private static readonly MITHRIL_SWORD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(40 38 28)">
    <rect x="38" y="4" width="4.5" height="28" rx="1" fill="#c7d2fe" stroke="#6366f1" stroke-width="1.2"/>
    <polygon points="38,4 40.2,0 42.5,4" fill="#ffffff"/>
    <rect x="33" y="32" width="14" height="4" rx="1" fill="#4338ca"/>
    <circle cx="40" cy="42" r="2.5" fill="#818cf8"/>
  </g>
</svg>`.trim();

  /** ミスリルの剣（斜め奥背面）オーバーレイSVG */
  private static readonly MITHRIL_SWORD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(25 36 20)">
    <rect x="35" y="2" width="4" height="24" rx="1" fill="#312e81" stroke="#6366f1" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#4338ca"/>
    <circle cx="37" cy="3" r="2.5" fill="#a5b4fc"/>
  </g>
</svg>`.trim();

  /** 炎の剣（下向き正面）オーバーレイSVG */
  private static readonly FLAME_SWORD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M44 8 Q47 18 45 28 L47 32 L45 32 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
  <rect x="45" y="8" width="2" height="24" fill="#fef08a"/>
  <rect x="40" y="32" width="12" height="4" rx="1" fill="#991b1b"/>
  <circle cx="46" cy="42" r="2.5" fill="#f97316"/>
</svg>`.trim();

  /** 炎の剣（上向き背面）オーバーレイSVG */
  private static readonly FLAME_SWORD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="42" y="6" width="4" height="19" rx="1" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
  <rect x="39" y="22" width="10" height="3.5" fill="#991b1b"/>
</svg>`.trim();

  /** 炎の剣（横向きサイドビュー）オーバーレイSVG */
  private static readonly FLAME_SWORD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="39" y="30.5" width="22" height="4.5" rx="1" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
  <polygon points="61,29 65,32.7 61,36" fill="#fef08a"/>
  <rect x="37" y="27" width="3" height="11" rx="1" fill="#991b1b"/>
</svg>`.trim();

  /** 炎の剣（斜め手前クォータービュー）オーバーレイSVG */
  private static readonly FLAME_SWORD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(40 38 28)">
    <rect x="38" y="4" width="4.5" height="28" rx="1" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
    <polygon points="38,4 40.2,0 42.5,4" fill="#fef08a"/>
    <rect x="33" y="32" width="14" height="4" rx="1" fill="#991b1b"/>
    <circle cx="40" cy="42" r="2.5" fill="#f97316"/>
  </g>
</svg>`.trim();

  /** 炎の剣（斜め奥背面）オーバーレイSVG */
  private static readonly FLAME_SWORD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(25 36 20)">
    <rect x="35" y="2" width="4" height="24" rx="1" fill="#7f1d1d" stroke="#ef4444" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#991b1b"/>
  </g>
</svg>`.trim();

  /** ルーンの剣（下向き正面）オーバーレイSVG */
  private static readonly RUNE_SWORD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="44" y="6" width="4" height="27" rx="1" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
  <polygon points="44,6 46,2 48,6" fill="#e9d5ff"/>
  <circle cx="46" cy="18" r="1.5" fill="#ffffff"/>
  <rect x="40" y="32" width="12" height="4" rx="1" fill="#581c87"/>
  <circle cx="46" cy="42" r="2.5" fill="#c084fc"/>
</svg>`.trim();

  /** ルーンの剣（上向き背面）オーバーレイSVG */
  private static readonly RUNE_SWORD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="42" y="5" width="4" height="21" rx="1" fill="#3b0764" stroke="#a855f7" stroke-width="1"/>
  <rect x="39" y="22" width="10" height="3.5" fill="#581c87"/>
</svg>`.trim();

  /** ルーンの剣（横向きサイドビュー）オーバーレイSVG */
  private static readonly RUNE_SWORD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect x="39" y="30" width="23" height="5" rx="1" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
  <polygon points="62,30 65.5,32.5 62,35" fill="#e9d5ff"/>
  <rect x="37" y="26.5" width="3" height="12" rx="1" fill="#581c87"/>
</svg>`.trim();

  /** ルーンの剣（斜め手前クォータービュー）オーバーレイSVG */
  private static readonly RUNE_SWORD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(40 38 28)">
    <rect x="38" y="2" width="4.5" height="30" rx="1" fill="#a855f7" stroke="#6b21a8" stroke-width="1.2"/>
    <polygon points="38,2 40.2,-2 42.5,2" fill="#e9d5ff"/>
    <rect x="33" y="32" width="14" height="4" rx="1" fill="#581c87"/>
    <circle cx="40" cy="42" r="2.5" fill="#c084fc"/>
  </g>
</svg>`.trim();

  /** ルーンの剣（斜め奥背面）オーバーレイSVG */
  private static readonly RUNE_SWORD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g transform="rotate(25 36 20)">
    <rect x="35" y="1" width="4" height="25" rx="1" fill="#3b0764" stroke="#a855f7" stroke-width="1"/>
    <rect x="32" y="18" width="10" height="3" fill="#581c87"/>
  </g>
</svg>`.trim();

  // =========================================================================
  // 2. 盾 (SHIELDS) SVG 定義
  // =========================================================================

  // --- 2-1. 木の盾 (Wood Shield) ---
  /** 木の盾（下向き正面）オーバーレイSVG */
  private static readonly WOOD_SHIELD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="20" cy="34" r="8" fill="#78350f" stroke="#451a03" stroke-width="2"/>
  <circle cx="20" cy="34" r="3" fill="#92400e"/>
</svg>`.trim();

  /** 木の盾（上向き背面）オーバーレイSVG */
  private static readonly WOOD_SHIELD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="20" cy="33" r="7.5" fill="#451a03" stroke="#291003" stroke-width="1.5"/>
</svg>`.trim();

  /** 木の盾（横向き側面）オーバーレイSVG */
  private static readonly WOOD_SHIELD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="26" cy="34" rx="5" ry="8" fill="#78350f" stroke="#451a03" stroke-width="2"/>
</svg>`.trim();

  /** 木の盾（斜め手前）オーバーレイSVG */
  private static readonly WOOD_SHIELD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="35" rx="5" ry="8" fill="#78350f" stroke="#451a03" stroke-width="2"/>
</svg>`.trim();

  /** 木の盾（斜め奥背面）オーバーレイSVG */
  private static readonly WOOD_SHIELD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="33" rx="5" ry="7.5" fill="#451a03" stroke="#291003" stroke-width="1.5"/>
</svg>`.trim();

  // --- 2-2. 青銅の盾 (Bronze Buckler) ---
  /** 青銅の盾（下向き正面）オーバーレイSVG */
  private static readonly BRONZE_SHIELD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="20" cy="34" r="8.5" fill="#b45309" stroke="#78350f" stroke-width="2"/>
  <circle cx="20" cy="34" r="3.5" fill="#d97706"/>
</svg>`.trim();

  /** 青銅の盾（上向き背面）オーバーレイSVG */
  private static readonly BRONZE_SHIELD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="20" cy="33" r="8" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
</svg>`.trim();

  /** 青銅の盾（横向き側面）オーバーレイSVG */
  private static readonly BRONZE_SHIELD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="26" cy="34" rx="5.5" ry="9" fill="#b45309" stroke="#78350f" stroke-width="2"/>
</svg>`.trim();

  /** 青銅の盾（斜め手前）オーバーレイSVG */
  private static readonly BRONZE_SHIELD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="35" rx="5.5" ry="9" fill="#b45309" stroke="#78350f" stroke-width="2"/>
</svg>`.trim();

  /** 青銅の盾（斜め奥背面）オーバーレイSVG */
  private static readonly BRONZE_SHIELD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="33" rx="5" ry="8" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
</svg>`.trim();

  // --- 2-3. 鋼の盾 (Steel Shield) ---
  /** 鋼の盾（下向き正面）オーバーレイSVG */
  private static readonly STEEL_SHIELD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M14 26 Q12 40 20 44 Q28 40 26 26 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="20" cy="34" r="3" fill="#fbbf24"/>
</svg>`.trim();

  /** 鋼の盾（上向き背面）オーバーレイSVG */
  private static readonly STEEL_SHIELD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M14 24 Q12 38 20 42 Q28 38 26 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
</svg>`.trim();

  /** 鋼の盾（横向き側面）オーバーレイSVG */
  private static readonly STEEL_SHIELD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="26" cy="34" rx="6" ry="10" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="26" cy="34" r="2.5" fill="#fbbf24"/>
</svg>`.trim();

  /** 鋼の盾（斜め手前）オーバーレイSVG */
  private static readonly STEEL_SHIELD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="35" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="16" cy="35" r="2" fill="#fbbf24"/>
</svg>`.trim();

  /** 鋼の盾（斜め奥背面）オーバーレイSVG */
  private static readonly STEEL_SHIELD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M12 24 Q9 38 16 42 Q24 38 22 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
  <circle cx="16" cy="33" r="2.5" fill="#fbbf24"/>
</svg>`.trim();

  // --- 2-4. 魔法の盾 (Magic Shield) ---
  /** 魔法の盾（下向き正面）オーバーレイSVG */
  private static readonly MAGIC_SHIELD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M13 24 Q11 40 20 45 Q29 40 27 24 Z" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="20,28 23,34 20,40 17,34" fill="#a5f3fc"/>
</svg>`.trim();

  /** 魔法の盾（上向き背面）オーバーレイSVG */
  private static readonly MAGIC_SHIELD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M13 23 Q11 38 20 43 Q29 38 27 23 Z" fill="#0369a1" stroke="#0284c7" stroke-width="1.5"/>
</svg>`.trim();

  /** 魔法の盾（横向き側面）オーバーレイSVG */
  private static readonly MAGIC_SHIELD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="26" cy="34" rx="6.5" ry="10.5" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="26,29 28,34 26,39 24,34" fill="#a5f3fc"/>
</svg>`.trim();

  /** 魔法の盾（斜め手前）オーバーレイSVG */
  private static readonly MAGIC_SHIELD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="35" rx="5.5" ry="9.5" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
  <polygon points="16,30 18,35 16,40 14,35" fill="#a5f3fc"/>
</svg>`.trim();

  /** 魔法の盾（斜め奥背面）オーバーレイSVG */
  private static readonly MAGIC_SHIELD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M11 23 Q8 38 16 43 Q24 38 22 23 Z" fill="#0369a1" stroke="#0284c7" stroke-width="1.5"/>
</svg>`.trim();

  // --- 2-5. ドラゴンの盾 (Dragon Shield) ---
  /** ドラゴンの盾（下向き正面）オーバーレイSVG */
  private static readonly DRAGON_SHIELD_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M13 24 L20 46 L27 24 L20 22 Z" fill="#dc2626" stroke="#fbbf24" stroke-width="2"/>
  <polygon points="20,26 23,32 20,40 17,32" fill="#fbbf24"/>
</svg>`.trim();

  /** ドラゴンの盾（上向き背面）オーバーレイSVG */
  private static readonly DRAGON_SHIELD_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M13 22 L20 44 L27 22 L20 20 Z" fill="#991b1b" stroke="#d97706" stroke-width="1.5"/>
</svg>`.trim();

  /** ドラゴンの盾（横向き側面）オーバーレイSVG */
  private static readonly DRAGON_SHIELD_SIDE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="26" cy="34" rx="7" ry="11" fill="#dc2626" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="26" cy="34" r="3" fill="#fbbf24"/>
</svg>`.trim();

  /** ドラゴンの盾（斜め手前）オーバーレイSVG */
  private static readonly DRAGON_SHIELD_DIAG_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="16" cy="35" rx="6" ry="10" fill="#dc2626" stroke="#fbbf24" stroke-width="2"/>
  <circle cx="16" cy="35" r="2.5" fill="#fbbf24"/>
</svg>`.trim();

  /** ドラゴンの盾（斜め奥背面）オーバーレイSVG */
  private static readonly DRAGON_SHIELD_DIAG_UP = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M11 22 L17 44 L23 22 L17 20 Z" fill="#991b1b" stroke="#d97706" stroke-width="1.5"/>
</svg>`.trim();

  /**
   * 全装備スプライトの事前ロードを開始します。
   *
   * @returns 全画像ロード完了を示すPromise
   */
  public static init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise;
    }

    const spriteMap: Record<EquipmentSpriteId, string> = {
      // 武器 (WEAPON)
      weapon_dagger_down: this.DAGGER_DOWN,
      weapon_dagger_up: this.DAGGER_UP,
      weapon_dagger_side: this.DAGGER_SIDE,
      weapon_dagger_diag_down: this.DAGGER_DIAG_DOWN,
      weapon_dagger_diag_up: this.DAGGER_DIAG_UP,

      weapon_iron_sword_down: this.IRON_SWORD_DOWN,
      weapon_iron_sword_up: this.IRON_SWORD_UP,
      weapon_iron_sword_side: this.IRON_SWORD_SIDE,
      weapon_iron_sword_diag_down: this.IRON_SWORD_DIAG_DOWN,
      weapon_iron_sword_diag_up: this.IRON_SWORD_DIAG_UP,

      weapon_mithril_sword_down: this.MITHRIL_SWORD_DOWN,
      weapon_mithril_sword_up: this.MITHRIL_SWORD_UP,
      weapon_mithril_sword_side: this.MITHRIL_SWORD_SIDE,
      weapon_mithril_sword_diag_down: this.MITHRIL_SWORD_DIAG_DOWN,
      weapon_mithril_sword_diag_up: this.MITHRIL_SWORD_DIAG_UP,

      weapon_flame_sword_down: this.FLAME_SWORD_DOWN,
      weapon_flame_sword_up: this.FLAME_SWORD_UP,
      weapon_flame_sword_side: this.FLAME_SWORD_SIDE,
      weapon_flame_sword_diag_down: this.FLAME_SWORD_DIAG_DOWN,
      weapon_flame_sword_diag_up: this.FLAME_SWORD_DIAG_UP,

      weapon_rune_sword_down: this.RUNE_SWORD_DOWN,
      weapon_rune_sword_up: this.RUNE_SWORD_UP,
      weapon_rune_sword_side: this.RUNE_SWORD_SIDE,
      weapon_rune_sword_diag_down: this.RUNE_SWORD_DIAG_DOWN,
      weapon_rune_sword_diag_up: this.RUNE_SWORD_DIAG_UP,

      // 盾 (SHIELD)
      shield_wood_down: this.WOOD_SHIELD_DOWN,
      shield_wood_up: this.WOOD_SHIELD_UP,
      shield_wood_side: this.WOOD_SHIELD_SIDE,
      shield_wood_diag_down: this.WOOD_SHIELD_DIAG_DOWN,
      shield_wood_diag_up: this.WOOD_SHIELD_DIAG_UP,

      shield_bronze_down: this.BRONZE_SHIELD_DOWN,
      shield_bronze_up: this.BRONZE_SHIELD_UP,
      shield_bronze_side: this.BRONZE_SHIELD_SIDE,
      shield_bronze_diag_down: this.BRONZE_SHIELD_DIAG_DOWN,
      shield_bronze_diag_up: this.BRONZE_SHIELD_DIAG_UP,

      shield_steel_down: this.STEEL_SHIELD_DOWN,
      shield_steel_up: this.STEEL_SHIELD_UP,
      shield_steel_side: this.STEEL_SHIELD_SIDE,
      shield_steel_diag_down: this.STEEL_SHIELD_DIAG_DOWN,
      shield_steel_diag_up: this.STEEL_SHIELD_DIAG_UP,

      shield_magic_down: this.MAGIC_SHIELD_DOWN,
      shield_magic_up: this.MAGIC_SHIELD_UP,
      shield_magic_side: this.MAGIC_SHIELD_SIDE,
      shield_magic_diag_down: this.MAGIC_SHIELD_DIAG_DOWN,
      shield_magic_diag_up: this.MAGIC_SHIELD_DIAG_UP,

      shield_dragon_down: this.DRAGON_SHIELD_DOWN,
      shield_dragon_up: this.DRAGON_SHIELD_UP,
      shield_dragon_side: this.DRAGON_SHIELD_SIDE,
      shield_dragon_diag_down: this.DRAGON_SHIELD_DIAG_DOWN,
      shield_dragon_diag_up: this.DRAGON_SHIELD_DIAG_UP,
    };

    const promises: Promise<void>[] = [];

    for (const [key, svg] of Object.entries(spriteMap)) {
      const id = key as EquipmentSpriteId;
      const img = new Image();
      const svgBase64 = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

      const p = new Promise<void>((resolve) => {
        img.onload = () => {
          this.imageCache.set(id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load equipment sprite: ${id}`);
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
   * 装備アイテム名とプレイヤーの向きから、適合する武器スプライト画像を取得します。
   *
   * @param weaponName - 武器の名称（例: '鉄の剣', 'ミスリルの剣'）
   * @param dir - プレイヤーの向き
   * @returns 適合する武器のHTMLImageElement、未装備時はundefined
   */
  public static getWeaponSprite(
    weaponName: string | undefined,
    dir: Direction8
  ): HTMLImageElement | undefined {
    if (!weaponName) return undefined;

    let weaponKey = 'iron_sword';
    if (weaponName.includes('短剣') || weaponName.includes('青銅')) {
      weaponKey = 'dagger';
    } else if (weaponName.includes('ミスリル') || weaponName.includes('ランス')) {
      weaponKey = 'mithril_sword';
    } else if (weaponName.includes('炎') || weaponName.includes('ムラマサ') || weaponName.includes('妖刀')) {
      weaponKey = 'flame_sword';
    } else if (weaponName.includes('ルーン') || weaponName.includes('ハンマー')) {
      weaponKey = 'rune_sword';
    }

    const dirKey = this.getDirectionKey(dir);
    const spriteId = `weapon_${weaponKey}_${dirKey}` as EquipmentSpriteId;
    return this.imageCache.get(spriteId);
  }

  /**
   * 装備盾名とプレイヤーの向きから、適合する盾スプライト画像を取得します。
   *
   * @param shieldName - 盾の名称（例: '木の盾', '鋼の盾'）
   * @param dir - プレイヤーの向き
   * @returns 適合する盾のHTMLImageElement、未装備時はundefined
   */
  public static getShieldSprite(
    shieldName: string | undefined,
    dir: Direction8
  ): HTMLImageElement | undefined {
    if (!shieldName) return undefined;

    let shieldKey = 'steel';
    if (shieldName.includes('木') || shieldName.includes('風')) {
      shieldKey = 'wood';
    } else if (shieldName.includes('青銅')) {
      shieldKey = 'bronze';
    } else if (shieldName.includes('魔法') || shieldName.includes('タワー')) {
      shieldKey = 'magic';
    } else if (shieldName.includes('ドラゴン') || shieldName.includes('イージス')) {
      shieldKey = 'dragon';
    }

    const dirKey = this.getDirectionKey(dir);
    const spriteId = `shield_${shieldKey}_${dirKey}` as EquipmentSpriteId;
    return this.imageCache.get(spriteId);
  }

  /**
   * Direction8 から 5大方位キー ('down' | 'up' | 'side' | 'diag_down' | 'diag_up') に正規化します。
   */
  private static getDirectionKey(
    dir: Direction8
  ): 'down' | 'up' | 'side' | 'diag_down' | 'diag_up' {
    switch (dir) {
      case 'up':
        return 'up';
      case 'left':
      case 'right':
        return 'side';
      case 'up_left':
      case 'up_right':
        return 'diag_up';
      case 'down_left':
      case 'down_right':
        return 'diag_down';
      case 'down':
      default:
        return 'down';
    }
  }
}
