import fs from 'fs';
import path from 'path';

const monsterAndItemFile = path.resolve('src/render/sprites/MonsterAndItemSprites.ts');
const monsterAndItemContent = fs.readFileSync(monsterAndItemFile, 'utf8');

const svgSpritesFile = path.resolve('src/render/sprites/SVGSprites.ts');
const svgSpritesContent = fs.readFileSync(svgSpritesFile, 'utf8');

// 定義を抽出するマップ
const exportsMap = {
  // SVGSprites.ts 由来のモンスター
  'monsters/monster_slime.svg': { file: svgSpritesContent, constName: 'SLIME_DOWN_SVG' },
  'monsters/monster_goblin.svg': { file: svgSpritesContent, constName: 'GOBLIN_DOWN_SVG' },
  'monsters/monster_skeleton.svg': { file: svgSpritesContent, constName: 'SKELETON_DOWN_SVG' },
  'monsters/monster_golem.svg': { file: svgSpritesContent, constName: 'GOLEM_DOWN_SVG' },
  'monsters/monster_mandragora.svg': { file: svgSpritesContent, constName: 'MANDRAGORA_DOWN_SVG' },
  'monsters/monster_sahagin.svg': { file: svgSpritesContent, constName: 'SAHAGIN_DOWN_SVG' },

  // MonsterAndItemSprites.ts 由来のモンスター
  'monsters/monster_bat.svg': { file: monsterAndItemContent, constName: 'BAT_DOWN_SVG' },
  'monsters/monster_ghost.svg': { file: monsterAndItemContent, constName: 'GHOST_DOWN_SVG' },
  'monsters/monster_mage.svg': { file: monsterAndItemContent, constName: 'MAGE_DOWN_SVG' },
  'monsters/monster_dragon.svg': { file: monsterAndItemContent, constName: 'DRAGON_DOWN_SVG' },
  'monsters/monster_mimic.svg': { file: monsterAndItemContent, constName: 'MIMIC_DOWN_SVG' },
  'monsters/monster_zombie.svg': { file: monsterAndItemContent, constName: 'ZOMBIE_DOWN_SVG' },
  'monsters/monster_imp.svg': { file: monsterAndItemContent, constName: 'IMP_DOWN_SVG' },
  'monsters/monster_mummy.svg': { file: monsterAndItemContent, constName: 'MUMMY_DOWN_SVG' },
  'monsters/monster_abyss_lord.svg': { file: monsterAndItemContent, constName: 'ABYSS_LORD_DOWN_SVG' },
  'monsters/monster_guard_dog.svg': { file: monsterAndItemContent, constName: 'GUARD_DOG_DOWN_SVG' },

  // 店主たち
  'merchants/merchant_torneko.svg': { file: monsterAndItemContent, constName: 'MERCHANT_TORNEKO_DOWN_SVG' },
  'merchants/merchant_torneko_angry.svg': { file: monsterAndItemContent, constName: 'ANGRY_TORNEKO_DOWN_SVG' },
  'merchants/merchant_shiren.svg': { file: monsterAndItemContent, constName: 'MERCHANT_SHIREN_DOWN_SVG' },
  'merchants/merchant_shiren_angry.svg': { file: monsterAndItemContent, constName: 'ANGRY_SHIREN_DOWN_SVG' },
  'merchants/merchant_goldo.svg': { file: monsterAndItemContent, constName: 'MERCHANT_GOLDO_DOWN_SVG' },
  'merchants/merchant_goldo_angry.svg': { file: monsterAndItemContent, constName: 'ANGRY_GOLDO_DOWN_SVG' },
  'merchants/merchant_celia.svg': { file: monsterAndItemContent, constName: 'MERCHANT_CELIA_DOWN_SVG' },
  'merchants/merchant_celia_angry.svg': { file: monsterAndItemContent, constName: 'ANGRY_CELIA_DOWN_SVG' },
  'merchants/merchant_nero.svg': { file: monsterAndItemContent, constName: 'MERCHANT_DOWN_SVG' },
  'merchants/merchant_nero_angry.svg': { file: monsterAndItemContent, constName: 'ANGRY_MERCHANT_DOWN_SVG' },

  // 特殊レアキャラクター＆NPC
  'characters/npc_leon.svg': { file: monsterAndItemContent, constName: 'WANDERING_ADVENTURER_DOWN_SVG' },
  'characters/npc_gambler.svg': { file: monsterAndItemContent, constName: 'GAMBLER_SAGE_DOWN_SVG' },
  'characters/npc_fairy.svg': { file: monsterAndItemContent, constName: 'HEALING_FAIRY_DOWN_SVG' },
  'characters/npc_blacksmith.svg': { file: monsterAndItemContent, constName: 'TRAVELING_BLACKSMITH_DOWN_SVG' },
  'characters/npc_scooter_down.svg': { file: monsterAndItemContent, constName: 'SCOOTER_GUY_DOWN_SVG' },
  'characters/npc_scooter_up.svg': { file: monsterAndItemContent, constName: 'SCOOTER_GUY_UP_SVG' },
  'characters/npc_scooter_side.svg': { file: monsterAndItemContent, constName: 'SCOOTER_GUY_SIDE_SVG' },

  // アイテム
  'items/item_pot_synthesis.svg': { file: monsterAndItemContent, constName: 'ITEM_POT_SYNTHESIS_SVG' },
  'items/item_potion_revive.svg': { file: monsterAndItemContent, constName: 'ITEM_POTION_REVIVE_SVG' },
  'items/item_potion_otogiri.svg': { file: monsterAndItemContent, constName: 'ITEM_POTION_OTOGIRI_SVG' },
  'items/item_potion_life.svg': { file: monsterAndItemContent, constName: 'ITEM_POTION_LIFE_SVG' },
  'items/item_potion_agi.svg': { file: monsterAndItemContent, constName: 'ITEM_POTION_AGI_SVG' },
  'items/item_gold_pile.svg': { file: monsterAndItemContent, constName: 'ITEM_GOLD_PILE_SVG' },
  'items/item_arrow.svg': { file: monsterAndItemContent, constName: 'ITEM_ARROW_SVG' },
  'items/item_arrow_iron.svg': { file: monsterAndItemContent, constName: 'ITEM_ARROW_IRON_SVG' },
  'items/item_arrow_silver.svg': { file: monsterAndItemContent, constName: 'ITEM_ARROW_SILVER_SVG' },
  'items/item_staff.svg': { file: monsterAndItemContent, constName: 'ITEM_STAFF_SVG' },
  'items/item_staff_thunder.svg': { file: monsterAndItemContent, constName: 'ITEM_STAFF_THUNDER_SVG' },
  'items/item_ring.svg': { file: monsterAndItemContent, constName: 'ITEM_RING_SVG' },
  'items/item_scroll_upgrade_atk.svg': { file: monsterAndItemContent, constName: 'ITEM_SCROLL_UPGRADE_ATK_SVG' },
  'items/item_scroll_upgrade_def.svg': { file: monsterAndItemContent, constName: 'ITEM_SCROLL_UPGRADE_DEF_SVG' },
  'items/item_scroll_vacuum.svg': { file: monsterAndItemContent, constName: 'ITEM_SCROLL_VACUUM_SVG' },
};

const docsAssetsDir = path.resolve('docs/assets');

let extractedCount = 0;
for (const [relPath, entry] of Object.entries(exportsMap)) {
  const { file, constName } = entry;
  const regex = new RegExp(`public\\s+static\\s+readonly\\s+${constName}\\s*=\\s*\`([\\s\\S]*?)\`\\s*(\\.|;)`, 'm');
  const match = file.match(regex);
  if (!match) {
    console.warn(`[WARN] Not found: ${constName}`);
    continue;
  }

  const svgContent = match[1].trim();
  const outPath = path.join(docsAssetsDir, relPath);
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outPath, svgContent, 'utf8');
  console.log(`[OK] Extracted: ${relPath} (${svgContent.length} bytes)`);
  extractedCount++;
}

console.log(`Done! Extracted ${extractedCount} SVGs into docs/assets/`);
