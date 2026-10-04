/**
 * @file export-sprites.mjs
 * @description ゲーム内の全ベクターSVGスプライトを抽出し、
 * 設計書ドキュメント(docs/)から直接画像リンクできるように docs/assets/ 以下に独立したSVG画像ファイルとして保存するスクリプト。
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DOCS_ASSETS_DIR = path.join(ROOT_DIR, 'docs', 'assets');

// ディレクトリ作成
const DIRS = [
  path.join(DOCS_ASSETS_DIR, 'characters'),
  path.join(DOCS_ASSETS_DIR, 'monsters'),
  path.join(DOCS_ASSETS_DIR, 'items'),
  path.join(DOCS_ASSETS_DIR, 'weapons'),
  path.join(DOCS_ASSETS_DIR, 'shields'),
  path.join(DOCS_ASSETS_DIR, 'tiles'),
];

DIRS.forEach((d) => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

// 各ファイルからSVG文字列を抽出するヘルパー
function extractConstants(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const results = {};
  const regex = /(?:public|private)\s+static\s+readonly\s+([A-Za-z0-9_]+)\s*=\s*`([\s\S]*?)`\.trim\(\);/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    results[match[1]] = match[2].trim();
  }
  return results;
}

// 1. 各スプライト定義ファイルの読み込み
const svgSprites = extractConstants('src/render/sprites/SVGSprites.ts');
const monsterItemSprites = extractConstants('src/render/sprites/MonsterAndItemSprites.ts');
const equipSprites = extractConstants('src/render/sprites/EquipmentSprites.ts');
const tileSprites = extractConstants('src/render/sprites/TileSprites.ts');

console.log('SVGSprites:', Object.keys(svgSprites).length);
console.log('MonsterAndItemSprites:', Object.keys(monsterItemSprites).length);
console.log('EquipmentSprites:', Object.keys(equipSprites).length);
console.log('TileSprites:', Object.keys(tileSprites).length);

// SVGファイルを保存するヘルパー
function saveSvg(filePath, svgContent) {
  if (!svgContent) {
    console.warn('Empty SVG content for', filePath);
    return;
  }
  let content = svgContent.trim();
  if (!content.startsWith('<svg')) {
    content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">\n${content}\n</svg>`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// -------------------------------------------------------------
// 2. プレイヤー素体 (Base)
// -------------------------------------------------------------
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_down.svg'), svgSprites.PLAYER_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_up.svg'), svgSprites.PLAYER_UP_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_side.svg'), svgSprites.PLAYER_SIDE_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_diag_down.svg'), svgSprites.PLAYER_DIAG_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_diag_up.svg'), svgSprites.PLAYER_DIAG_UP_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'characters', 'player_dead.svg'), svgSprites.PLAYER_DEAD_SVG);

// -------------------------------------------------------------
// 3. プレイヤー装備合成画像（ペーパードール方式プレビュー）
// -------------------------------------------------------------
function extractInnerSvg(svg) {
  if (!svg) return '';
  return svg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();
}

function createCompositePlayerSvg(weaponSvg, shieldSvg) {
  const baseInner = extractInnerSvg(svgSprites.PLAYER_DOWN_SVG);
  const shieldInner = shieldSvg ? extractInnerSvg(shieldSvg) : '';
  const weaponInner = weaponSvg ? extractInnerSvg(weaponSvg) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <!-- プレイヤー素体 -->
  ${baseInner}
  <!-- 装備盾 -->
  ${shieldInner}
  <!-- 装備武器 -->
  ${weaponInner}
</svg>`;
}

// 装備例合成プレビュー
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'characters', 'player_equipped_iron_steel.svg'),
  createCompositePlayerSvg(equipSprites.IRON_SWORD_DOWN, equipSprites.STEEL_SHIELD_DOWN)
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'characters', 'player_equipped_flame_dragon.svg'),
  createCompositePlayerSvg(equipSprites.FLAME_SWORD_DOWN, equipSprites.DRAGON_SHIELD_DOWN)
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'characters', 'player_equipped_mithril_magic.svg'),
  createCompositePlayerSvg(equipSprites.MITHRIL_SWORD_DOWN, equipSprites.MAGIC_SHIELD_DOWN)
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'characters', 'player_equipped_dagger_wood.svg'),
  createCompositePlayerSvg(equipSprites.DAGGER_DOWN, equipSprites.WOOD_SHIELD_DOWN)
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'characters', 'player_equipped_rune.svg'),
  createCompositePlayerSvg(equipSprites.RUNE_SWORD_DOWN, equipSprites.BRONZE_SHIELD_DOWN)
);

// -------------------------------------------------------------
// 4. モンスター全10種
// -------------------------------------------------------------
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_slime.svg'), svgSprites.SLIME_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_goblin.svg'), svgSprites.GOBLIN_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_skeleton.svg'), svgSprites.SKELETON_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_golem.svg'), svgSprites.GOLEM_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_mandragora.svg'), svgSprites.MANDRAGORA_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_sahagin.svg'), svgSprites.SAHAGIN_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_bat.svg'), monsterItemSprites.BAT_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_ghost.svg'), monsterItemSprites.GHOST_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_mage.svg'), monsterItemSprites.MAGE_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'monsters', 'monster_dragon.svg'), monsterItemSprites.DRAGON_DOWN_SVG);

// -------------------------------------------------------------
// 5. 武器・盾アイテム単体
// -------------------------------------------------------------
saveSvg(path.join(DOCS_ASSETS_DIR, 'weapons', 'weapon_dagger.svg'), monsterItemSprites.ITEM_WEAPON_DAGGER_SVG);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'weapons', 'weapon_iron_sword.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,6 36,12 35,42 29,42 28,12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
    <line x1="32" y1="8" x2="32" y2="42" stroke="#64748b" stroke-width="1.5"/>
    <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1"/>
    <circle cx="32" cy="44" r="2" fill="#fbbf24"/>
    <rect x="30" y="46.5" width="4" height="10" rx="1" fill="#1e293b"/>
    <circle cx="32" cy="58" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
  </g>
</svg>`
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'weapons', 'weapon_mithril_sword.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <g transform="rotate(45 32 32)">
    <polygon points="32,4 37,12 35,42 29,42 27,12" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
    <line x1="32" y1="6" x2="32" y2="42" stroke="#818cf8" stroke-width="1.5"/>
    <rect x="20" y="42" width="24" height="4.5" rx="2" fill="#4338ca"/>
    <circle cx="32" cy="44" r="2.5" fill="#38bdf8"/>
    <rect x="30" y="46.5" width="4" height="10" rx="1" fill="#1e1b4b"/>
    <circle cx="32" cy="58" r="3.5" fill="#818cf8"/>
  </g>
</svg>`
);
saveSvg(path.join(DOCS_ASSETS_DIR, 'weapons', 'weapon_flame_sword.svg'), monsterItemSprites.ITEM_WEAPON_FLAME_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'weapons', 'weapon_rune_sword.svg'), monsterItemSprites.ITEM_WEAPON_RUNE_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'shields', 'shield_wood.svg'), monsterItemSprites.ITEM_SHIELD_WOOD_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'shields', 'shield_bronze.svg'), monsterItemSprites.ITEM_SHIELD_BRONZE_SVG);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'shields', 'shield_steel.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M16 16 L48 16 Q48 38 32 54 Q16 38 16 16 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2.5"/>
  <path d="M22 20 L42 20 Q42 36 32 48 Q22 36 22 20 Z" fill="#3b82f6"/>
  <circle cx="32" cy="33" r="3" fill="#fbbf24"/>
</svg>`
);
saveSvg(path.join(DOCS_ASSETS_DIR, 'shields', 'shield_magic.svg'), monsterItemSprites.ITEM_SHIELD_MAGIC_SVG);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'shields', 'shield_dragon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <path d="M14 14 L50 14 Q50 38 32 56 Q14 38 14 14 Z" fill="#b91c1c" stroke="#fbbf24" stroke-width="2.5"/>
  <polygon points="32,24 35,32 44,34 36,37 32,46 28,37 20,34 29,32" fill="#fbbf24"/>
  <circle cx="32" cy="34" r="2.5" fill="#ffffff"/>
</svg>`
);

// -------------------------------------------------------------
// 6. アイテム（薬草・食料・巻物）
// -------------------------------------------------------------
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'items', 'item_potion.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="28" y="14" width="8" height="6" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="16" fill="rgba(15,23,42,0.4)" stroke="#94a3b8" stroke-width="2"/>
  <path d="M18 42 C18 50 24 56 32 56 C40 56 46 50 46 42 Z" fill="#10b981"/>
  <circle cx="28" cy="46" r="2.5" fill="#34d399"/>
  <circle cx="36" cy="49" r="1.5" fill="#6ee7b7"/>
</svg>`
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'items', 'item_potion_high.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
  <rect x="28" y="13" width="8" height="6" rx="1" fill="#d97706" stroke="#92400e" stroke-width="1.5"/>
  <circle cx="32" cy="42" r="17" fill="rgba(15,23,42,0.5)" stroke="#fbbf24" stroke-width="2.5"/>
  <path d="M17 42 C17 51 24 57 32 57 C40 57 47 51 47 42 Z" fill="#059669"/>
  <circle cx="32" cy="30" r="3" fill="#fbbf24"/>
  <circle cx="28" cy="46" r="2.5" fill="#34d399"/>
</svg>`
);
saveSvg(path.join(DOCS_ASSETS_DIR, 'items', 'item_potion_str.svg'), monsterItemSprites.ITEM_POTION_STR_SVG);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'items', 'item_seed.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="15" ry="4" fill="rgba(0,0,0,0.35)"/>
  <path d="M32 12 C44 12 50 32 48 46 C46 54 18 54 16 46 C14 32 20 12 32 12 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
  <ellipse cx="32" cy="14" rx="10" ry="4" fill="#78350f"/>
  <circle cx="32" cy="32" r="4" fill="#fed7aa"/>
</svg>`
);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'items', 'item_food.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="56" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
  <path d="M12 44 C12 24 22 14 32 14 C42 14 52 24 52 44 C52 52 44 54 32 54 C20 54 12 52 12 44 Z" fill="#d97706" stroke="#78350f" stroke-width="2"/>
  <ellipse cx="32" cy="30" rx="14" ry="4" fill="#fef3c7"/>
  <line x1="18" y1="30" x2="46" y2="30" stroke="#92400e" stroke-width="1.5"/>
  <line x1="32" y1="18" x2="32" y2="42" stroke="#92400e" stroke-width="1.5"/>
</svg>`
);
saveSvg(path.join(DOCS_ASSETS_DIR, 'items', 'item_food_riceball.svg'), monsterItemSprites.ITEM_FOOD_RICEBALL_SVG);
saveSvg(
  path.join(DOCS_ASSETS_DIR, 'items', 'item_scroll_warp.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
  <rect x="15" y="18" width="34" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <circle cx="32" cy="33" r="6" fill="#818cf8"/>
  <polygon points="32,25 35,31 41,33 36,36 33,42 29,36 24,33 30,31" fill="#ffffff"/>
</svg>`
);
saveSvg(path.join(DOCS_ASSETS_DIR, 'items', 'item_scroll_thunder.svg'), monsterItemSprites.ITEM_SCROLL_THUNDER_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'items', 'item_scroll_light.svg'), monsterItemSprites.ITEM_SCROLL_LIGHT_SVG);

// -------------------------------------------------------------
// 7. タイル・階段・橋・バイオーム壁床
// -------------------------------------------------------------
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'stairs_down.svg'), svgSprites.STAIRS_DOWN_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'tile_bridge.svg'), tileSprites.BRIDGE_1_SVG);

// 7バイオーム代表タイル
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'stone_floor.svg'), tileSprites.STONE_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'stone_wall.svg'), tileSprites.STONE_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'earth_floor.svg'), tileSprites.EARTH_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'earth_wall.svg'), tileSprites.EARTH_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'forest_floor.svg'), tileSprites.FOREST_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'forest_wall.svg'), tileSprites.FOREST_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'river_floor.svg'), tileSprites.RIVER_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'river_wall.svg'), tileSprites.RIVER_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'lake_floor.svg'), tileSprites.LAKE_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'lake_wall.svg'), tileSprites.LAKE_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'snow_floor.svg'), tileSprites.SNOW_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'snow_wall.svg'), tileSprites.SNOW_WALL_1_SVG);

saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'ice_floor.svg'), tileSprites.ICE_FLOOR_1_SVG);
saveSvg(path.join(DOCS_ASSETS_DIR, 'tiles', 'ice_wall.svg'), tileSprites.ICE_WALL_1_SVG);

console.log('Successfully exported all SVG assets to docs/assets/ !');
