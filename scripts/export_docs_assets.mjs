import fs from 'fs';
import path from 'path';

const srcFile = path.resolve('src/render/sprites/MonsterAndItemSprites.ts');
const content = fs.readFileSync(srcFile, 'utf8');

// 定義を抽出するマップ
const exportsMap = {
  // 店主たち
  'merchants/merchant_torneko.svg': 'MERCHANT_TORNEKO_DOWN_SVG',
  'merchants/merchant_torneko_angry.svg': 'ANGRY_TORNEKO_DOWN_SVG',
  'merchants/merchant_shiren.svg': 'MERCHANT_SHIREN_DOWN_SVG',
  'merchants/merchant_shiren_angry.svg': 'ANGRY_SHIREN_DOWN_SVG',
  'merchants/merchant_goldo.svg': 'MERCHANT_GOLDO_DOWN_SVG',
  'merchants/merchant_goldo_angry.svg': 'ANGRY_GOLDO_DOWN_SVG',
  'merchants/merchant_celia.svg': 'MERCHANT_CELIA_DOWN_SVG',
  'merchants/merchant_celia_angry.svg': 'ANGRY_CELIA_DOWN_SVG',
  'merchants/merchant_nero.svg': 'MERCHANT_DOWN_SVG',
  'merchants/merchant_nero_angry.svg': 'ANGRY_MERCHANT_DOWN_SVG',

  // 特殊レアキャラクター＆NPC
  'characters/npc_leon.svg': 'WANDERING_ADVENTURER_DOWN_SVG',
  'characters/npc_gambler.svg': 'GAMBLER_SAGE_DOWN_SVG',
  'characters/npc_fairy.svg': 'HEALING_FAIRY_DOWN_SVG',
  'characters/npc_blacksmith.svg': 'TRAVELING_BLACKSMITH_DOWN_SVG',
  'characters/npc_scooter_down.svg': 'SCOOTER_GUY_DOWN_SVG',
  'characters/npc_scooter_up.svg': 'SCOOTER_GUY_UP_SVG',
  'characters/npc_scooter_side.svg': 'SCOOTER_GUY_SIDE_SVG',

  // モンスター
  'monsters/monster_abyss_lord.svg': 'ABYSS_LORD_DOWN_SVG',
  'monsters/monster_guard_dog.svg': 'GUARD_DOG_DOWN_SVG',

  // アイテム
  'items/item_pot_synthesis.svg': 'ITEM_POT_SYNTHESIS_SVG',
  'items/item_potion_revive.svg': 'ITEM_POTION_REVIVE_SVG',
  'items/item_potion_otogiri.svg': 'ITEM_POTION_OTOGIRI_SVG',
  'items/item_potion_life.svg': 'ITEM_POTION_LIFE_SVG',
  'items/item_potion_agi.svg': 'ITEM_POTION_AGI_SVG',
  'items/item_gold_pile.svg': 'ITEM_GOLD_PILE_SVG',
  'items/item_arrow.svg': 'ITEM_ARROW_SVG',
  'items/item_arrow_iron.svg': 'ITEM_ARROW_IRON_SVG',
  'items/item_arrow_silver.svg': 'ITEM_ARROW_SILVER_SVG',
  'items/item_staff.svg': 'ITEM_STAFF_SVG',
  'items/item_staff_thunder.svg': 'ITEM_STAFF_THUNDER_SVG',
  'items/item_ring.svg': 'ITEM_RING_SVG',
  'items/item_scroll_upgrade_atk.svg': 'ITEM_SCROLL_UPGRADE_ATK_SVG',
  'items/item_scroll_upgrade_def.svg': 'ITEM_SCROLL_UPGRADE_DEF_SVG',
  'items/item_scroll_vacuum.svg': 'ITEM_SCROLL_VACUUM_SVG',
};

const docsAssetsDir = path.resolve('docs/assets');

let extractedCount = 0;
for (const [relPath, constName] of Object.entries(exportsMap)) {
  // public static readonly CONST_NAME = `...`; または .trim();
  const regex = new RegExp(`public\\s+static\\s+readonly\\s+${constName}\\s*=\\s*\`([\\s\\S]*?)\`\\s*(\\.|;)`, 'm');
  const match = content.match(regex);
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
