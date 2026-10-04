/**
 * @file ItemSystem.ts
 * @description アイテムの拾得、使用、装備変更、および足元への投棄を管理するシステムクラス。
 */

import { DungeonMap, PlayerState, TileType } from '../types';
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
        // ワープの巻物: ランダムな部屋の空きマスへ移動
        const randomRoom =
          map.rooms[Math.floor(Math.random() * map.rooms.length)];
        let targetX = randomRoom.x + Math.floor(Math.random() * randomRoom.w);
        let targetY = randomRoom.y + Math.floor(Math.random() * randomRoom.h);

        // 安全な床マスを探索
        if (map.tiles[targetY][targetX] === TileType.Floor) {
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
}
