/**
 * @file ItemSystem.ts
 * @description アイテムの拾得、使用、装備変更、および足元への投棄を管理するシステムクラス。
 */

import { DungeonMap, ItemCategory, PlayerState, TileType } from '../types';
import { CombatSystem } from './CombatSystem';

/**
 * アイテム操作の結果情報を表すインターフェース。
 */
export interface ItemActionResult {
  /** 操作が成功したかどうか */
  success: boolean;
  /** ログ表示用の結果メッセージ */
  message: string;
}

/**
 * アイテム関連のロジックを統括する静的システムクラス。
 */
export class ItemSystem {
  /** インベントリの最大所持枠数 */
  public static readonly MAX_INVENTORY_SIZE = 12;

  /**
   * プレイヤーの足元にあるアイテムを拾い上げてインベントリに格納します。
   *
   * @param player - 拾得を行うプレイヤー
   * @param map - ダンジョンマップデータ
   * @returns 処理結果とメッセージ
   */
  public static pickupItem(player: PlayerState, map: DungeonMap): ItemActionResult {
    const itemIndex = map.items.findIndex(
      (it) => it.x === player.x && it.y === player.y
    );

    if (itemIndex === -1) {
      return { success: false, message: '足元には何も落ちていない。' };
    }

    if (player.inventory.length >= this.MAX_INVENTORY_SIZE) {
      return {
        success: false,
        message: '持ち物がいっぱいで拾えない！(最大12個)',
      };
    }

    const item = map.items.splice(itemIndex, 1)[0];
    player.inventory.push(item);

    return {
      success: true,
      message: `${item.name} を拾って持ち物にしまった。`,
    };
  }

  /**
   * インベントリ内の指定アイテムを使用、消費、または装備します。
   *
   * @param player - 使用を行うプレイヤー
   * @param map - ダンジョンマップデータ（ワープ等で使用）
   * @param itemId - 使用対象アイテムのID
   * @returns 処理結果とメッセージ
   */
  public static useItem(
    player: PlayerState,
    map: DungeonMap,
    itemId: string
  ): ItemActionResult {
    const index = player.inventory.findIndex((it) => it.id === itemId);
    if (index === -1) {
      return { success: false, message: 'そのアイテムは所持していない。' };
    }

    const item = player.inventory[index];

    switch (item.category) {
      case 'POTION': {
        if (item.name === 'どくけし草') {
          const heal = Math.min(15, player.maxHp - player.hp);
          player.hp += heal;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を煎じて飲んだ。体内の毒気が浄化され、HPが ${heal} 回復した！`,
          };
        }

        if (item.name === 'すばやさの種') {
          player.maxHp += 2;
          player.hp = Math.min(player.maxHp, player.hp + 2);
          player.baseDef += 1;
          CombatSystem.updatePlayerStats(player);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を食べた！身体が軽くなり、身のこなしが鋭くなった！(最大HP+2, 防御+1)`,
          };
        }

        if (item.name === '力の種') {
          player.maxHp += 3;
          player.hp = Math.min(player.maxHp, player.hp + 3);
          player.baseAtk += 1;
          CombatSystem.updatePlayerStats(player);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を食べた。身体の芯から力が湧き上がった！(最大HP+3, 攻撃力+1)`,
          };
        }

        if (item.name === '剛力の秘薬') {
          player.baseAtk += 2;
          CombatSystem.updatePlayerStats(player);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を飲み干した！全身に凄まじい力がみなぎる！(基礎攻撃力+2永続上昇)`,
          };
        }

        const heal = Math.min(item.value, player.maxHp - player.hp);
        player.hp += heal;
        // 消費してインベントリから削除
        player.inventory.splice(index, 1);
        return {
          success: true,
          message: `${item.name} を飲んだ。HPが ${heal} 回復した！`,
        };
      }

      case 'FOOD': {
        if (item.name === '巨大なおにぎり') {
          player.maxHunger += 20;
          player.hunger = player.maxHunger;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} をたいらげた！胃袋の限界を超えて満腹になり、最大満腹度も+20拡張された！`,
          };
        }

        const recover = Math.min(item.value, player.maxHunger - player.hunger);
        player.hunger = Math.min(player.maxHunger, player.hunger + item.value);
        player.inventory.splice(index, 1);
        return {
          success: true,
          message: `${item.name} を食べた。お腹が満たされた！(+${recover}%)`,
        };
      }

      case 'WEAPON': {
        if (player.equippedWeapon?.id === item.id) {
          // 既に装備中の場合は外す
          player.equippedWeapon = null;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} の装備を外した。`,
          };
        } else {
          // 装備する
          player.equippedWeapon = item;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} を装備した！(ATK: ${player.atk})`,
          };
        }
      }

      case 'SHIELD': {
        if (player.equippedShield?.id === item.id) {
          player.equippedShield = null;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} の装備を外した。`,
          };
        } else {
          player.equippedShield = item;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} を装備した！(DEF: ${player.def})`,
          };
        }
      }

      case 'SCROLL': {
        if (item.name === '雷の巻物') {
          // 部屋全体、または視界内の敵全員に15ダメージ
          let didLevelUp = false;
          const targetMonsters: string[] = [];
          for (let i = map.monsters.length - 1; i >= 0; i--) {
            const m = map.monsters[i];
            if (map.visible[m.y][m.x]) {
              m.hp -= 15;
              if (m.hp <= 0) {
                targetMonsters.push(`${m.name}を撃破`);
                player.exp += m.expValue;
                if (CombatSystem.checkLevelUp(player)) {
                  didLevelUp = true;
                }
                map.monsters.splice(i, 1);
              } else {
                targetMonsters.push(`${m.name}に15ダメージ`);
              }
            }
          }
          player.inventory.splice(index, 1);
          const detail = targetMonsters.length > 0 ? ` (${targetMonsters.join(', ')})` : ' (周囲に敵はいなかった)';
          const lvUpMsg = didLevelUp ? ` レベルが上がった！ (Lv.${player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)` : '';
          return {
            success: true,
            message: `${item.name} を読んだ！轟音とともに激しい稲妻が視界の敵を焼き払った！${detail}${lvUpMsg}`,
          };
        }

        if (item.name === 'あかりの巻物') {
          // フロア全域の探索済みフラグを有効化
          for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
              map.explored[y][x] = true;
            }
          }
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！神秘の輝きがダンジョンを満たし、フロア全体の構造が明らかになった！`,
          };
        }

        if (item.name === '睡眠の巻物') {
          let count = 0;
          for (const m of map.monsters) {
            if (map.visible[m.y][m.x]) {
              count++;
            }
          }
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！神秘的な安らぎが満ち、視界内の敵（${count}体）が深い眠りに落ちた！`,
          };
        }

        if (item.name === '混乱の巻物') {
          let count = 0;
          for (const m of map.monsters) {
            if (map.visible[m.y][m.x]) {
              count++;
            }
          }
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！妖しい狂気の波長が放たれ、視界内の敵（${count}体）が激しい混乱に陥った！`,
          };
        }

        // ワープの巻物: ランダムな部屋の空きマスへ移動
        const randomRoom =
          map.rooms[Math.floor(Math.random() * map.rooms.length)];
        let targetX = randomRoom.x + Math.floor(Math.random() * randomRoom.w);
        let targetY = randomRoom.y + Math.floor(Math.random() * randomRoom.h);

        // 安全な床・橋マスを探索
        if (
          map.tiles[targetY][targetX] === TileType.Floor ||
          map.tiles[targetY][targetX] === TileType.Bridge
        ) {
          player.x = targetX;
          player.y = targetY;
        }

        player.inventory.splice(index, 1);
        return {
          success: true,
          message: `${item.name} を読んだ！不思議な光に包まれて別の場所へワープした！`,
        };
      }
    }
  }

  /**
   * インベントリ内のアイテムを足元の床に置きます。
   *
   * @param player - 投棄を行うプレイヤー
   * @param map - ダンジョンマップデータ
   * @param itemId - 対象アイテムのID
   * @returns 処理結果とメッセージ
   */
  public static dropItem(
    player: PlayerState,
    map: DungeonMap,
    itemId: string
  ): ItemActionResult {
    const isOccupied = map.items.some(
      (it) => it.x === player.x && it.y === player.y
    );
    if (isOccupied) {
      return {
        success: false,
        message: '足元には既にアイテムが置いてある。',
      };
    }

    const index = player.inventory.findIndex((it) => it.id === itemId);
    if (index === -1) {
      return { success: false, message: 'そのアイテムは所持していない。' };
    }

    const item = player.inventory.splice(index, 1)[0];

    // 装備中なら解除
    if (player.equippedWeapon?.id === item.id) {
      player.equippedWeapon = null;
      CombatSystem.updatePlayerStats(player);
    }
    if (player.equippedShield?.id === item.id) {
      player.equippedShield = null;
      CombatSystem.updatePlayerStats(player);
    }

    item.x = player.x;
    item.y = player.y;
    map.items.push(item);

    return {
      success: true,
      message: `${item.name} を足元に置いた。`,
    };
  }

  /**
   * プレイヤーの所持品インベントリを論理順（装備中優先、武器→盾→薬・種→食料→巻物）に整理・ソートします。
   *
   * @param player - 対象のプレイヤーステータス
   */
  public static sortInventory(player: PlayerState): void {
    const categoryOrder: Record<ItemCategory, number> = {
      WEAPON: 0,
      SHIELD: 1,
      POTION: 2,
      FOOD: 3,
      SCROLL: 4,
    };

    player.inventory.sort((a, b) => {
      const aEquipped =
        player.equippedWeapon?.id === a.id || player.equippedShield?.id === a.id;
      const bEquipped =
        player.equippedWeapon?.id === b.id || player.equippedShield?.id === b.id;

      // 1. 装備中アイテムを最優先
      if (aEquipped && !bEquipped) return -1;
      if (!aEquipped && bEquipped) return 1;

      // 2. カテゴリ順
      const catA = categoryOrder[a.category] ?? 99;
      const catB = categoryOrder[b.category] ?? 99;
      if (catA !== catB) return catA - catB;

      // 3. 性能・効果値（value）降順
      if (b.value !== a.value) return b.value - a.value;

      // 4. 名称五十音順
      return a.name.localeCompare(b.name, 'ja');
    });
  }
}
