/**
 * @file ItemSystem.ts
 * @description アイテムの拾得、使用、装備変更、および足元への投棄を管理するシステムクラス。
 */

import { DungeonMap, ItemCategory, Monster, PlayerState, TileType } from '../types';
import { CombatSystem } from './CombatSystem';

/**
 * アイテム操作の結果情報を表すインターフェース。
 */
export interface ItemActionResult {
  /** 操作が成功したかどうか */
  success: boolean;
  /** ログ表示用の結果メッセージ */
  message: string;
  /** 飛翔体または光線の始点・終点情報（アニメーション用） */
  projectile?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    type: 'ARROW' | 'BEAM' | 'STONE' | 'ITEM';
    color: string;
    hitMonsterId?: string;
  };
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

    const item = map.items[itemIndex];

    // 1. ゴールド（通貨）の拾得: インベントリ枠を消費せず直接所持金に加算
    if (item.category === 'GOLD') {
      map.items.splice(itemIndex, 1);
      const amount = item.value;
      player.gold = (player.gold ?? 0) + amount;
      return {
        success: true,
        message: `🪙 ${item.name} を手に入れた！(現在の所持金: ${player.gold}G)`,
      };
    }

    // 2. 通常アイテムのインベントリ空き容量チェック
    if (player.inventory.length >= this.MAX_INVENTORY_SIZE) {
      return {
        success: false,
        message: '持ち物がいっぱいで拾えない！(最大12個)',
      };
    }

    map.items.splice(itemIndex, 1);
    player.inventory.push(item);

    // 3. ショップ商品拾得時の案内
    if (item.isShopItem) {
      const price = item.price ?? item.value ?? 100;
      return {
        success: true,
        message: `${item.name} (${price}G) を手に取った。出入口で店主に代金を払おう。`,
      };
    }

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

        if (item.name === '弟切草') {
          const heal = Math.min(100, player.maxHp - player.hp);
          player.hp += heal;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を飲んだ！傷口が神速で塞がり、HPが ${heal} 大幅回復した！`,
          };
        }

        if (item.name === '命の草') {
          player.maxHp += 5;
          player.hp += 5;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を食べた！命の脈動が高まり、最大HPが+5上昇した！(HP 5回復)`,
          };
        }

        if (item.name === 'すばやさの草') {
          player.speedTurns = (player.speedTurns || 0) + 10;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を食べた！全身に疾風が宿り、10ターンの間倍速で行動できるようになった！`,
          };
        }

        if (item.name === '復活の草') {
          player.maxHp += 2;
          player.hp = player.maxHp;
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を食べた！生命の輝きが満ち、HPが全快した！(※持っているだけで倒れた時に自動復活します)`,
          };
        }

        if (item.name === '毒草') {
          player.hp = Math.max(1, player.hp - 5);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `うぐっ……！ ${item.name} を飲んでしまった！激痛が走り、5ダメージを受けた！(敵に投げて使いましょう)`,
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

      case 'TALISMAN': {
        if (player.equippedTalisman?.id === item.id) {
          player.equippedTalisman = null;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} を外した。`,
          };
        } else {
          player.equippedTalisman = item;
          CombatSystem.updatePlayerStats(player);
          return {
            success: true,
            message: `${item.name} を装備した！神秘の加護が身体を包む。(ATK: ${player.atk}, DEF: ${player.def})`,
          };
        }
      }

      case 'ARROW': {
        if (player.equippedArrow?.id === item.id) {
          player.equippedArrow = null;
          return {
            success: true,
            message: `${item.name} の装備を外した。`,
          };
        } else {
          player.equippedArrow = item;
          return {
            success: true,
            message: `${item.name} を装備した！(Bボタン / Fキーで即座に撃てる)`,
          };
        }
      }

      case 'STAFF': {
        if (player.equippedStaff?.id === item.id) {
          player.equippedStaff = null;
          return {
            success: true,
            message: `${item.name} の装備を外した。`,
          };
        } else {
          player.equippedStaff = item;
          return {
            success: true,
            message: `${item.name} を装備した！(Yボタン / Tキーで即座に振れる)`,
          };
        }
      }

      case 'SCROLL': {
        if (item.name.includes('天の恵み') || item.name.includes('武器強化')) {
          if (!player.equippedWeapon) {
            return {
              success: false,
              message: '武器を装備していないため、巻物の魔力が虚空に消えた！(先に武器を装備してください)',
            };
          }
          player.equippedWeapon.upgradeLevel = (player.equippedWeapon.upgradeLevel || 0) + 1;
          CombatSystem.updatePlayerStats(player);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！天から光が降り注ぎ、${player.equippedWeapon.name} が強化された！(+${player.equippedWeapon.upgradeLevel} / ATK: ${player.atk})`,
          };
        }

        if (item.name.includes('地の恵み') || item.name.includes('盾強化')) {
          if (!player.equippedShield) {
            return {
              success: false,
              message: '盾を装備していないため、巻物の魔力が虚空に消えた！(先に盾を装備してください)',
            };
          }
          player.equippedShield.upgradeLevel = (player.equippedShield.upgradeLevel || 0) + 1;
          CombatSystem.updatePlayerStats(player);
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！大地の加護が宿り、${player.equippedShield.name} が強化された！(+${player.equippedShield.upgradeLevel} / DEF: ${player.def})`,
          };
        }

        if (item.name.includes('真空斬り')) {
          let hitCount = 0;
          for (let i = map.monsters.length - 1; i >= 0; i--) {
            const m = map.monsters[i];
            if (map.visible[m.y][m.x]) {
              hitCount++;
              m.hp -= 20;
              if (m.hp <= 0) {
                player.exp += m.expValue;
                CombatSystem.checkLevelUp(player);
                map.monsters.splice(i, 1);
              }
            }
          }
          player.inventory.splice(index, 1);
          return {
            success: true,
            message: `${item.name} を読んだ！真空の刃が旋風となって吹き荒れ、視界内の敵（${hitCount}体）を切り刻んだ！(各20ダメージ)`,
          };
        }

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
              m.sleepTurns = 6;
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
              m.confuseTurns = 6;
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

      case 'GOLD':
        return {
          success: false,
          message: 'ゴールドは買い物や取引に使う通貨です。',
        };

      default:
        return {
          success: false,
          message: 'このアイテムは使用できません。',
        };
    }
  }

  /**
   * プレイヤーの方位または指定ベクトルから正規化された方位ベクトルを取得します。
   */
  public static resolveDirection(
    player: PlayerState,
    dx?: number,
    dy?: number
  ): { dx: number; dy: number } {
    if (dx !== undefined && dy !== undefined && (dx !== 0 || dy !== 0)) {
      return { dx: Math.sign(dx), dy: Math.sign(dy) };
    }
    const dir = player.direction || 'down';
    switch (dir) {
      case 'up': return { dx: 0, dy: -1 };
      case 'down': return { dx: 0, dy: 1 };
      case 'left': return { dx: -1, dy: 0 };
      case 'right': return { dx: 1, dy: 0 };
      case 'up_left': return { dx: -1, dy: -1 };
      case 'up_right': return { dx: 1, dy: -1 };
      case 'down_left': return { dx: -1, dy: 1 };
      case 'down_right': return { dx: 1, dy: 1 };
      default: return { dx: 0, dy: 1 };
    }
  }

  /**
   * 飛び道具（弓矢）を指定方位へ発射します。
   */
  public static shootArrow(
    player: PlayerState,
    map: DungeonMap,
    arrowId?: string,
    dx?: number,
    dy?: number
  ): ItemActionResult {
    const targetArrowId = arrowId ?? player.equippedArrow?.id;
    const index = targetArrowId
      ? player.inventory.findIndex((it) => it.id === targetArrowId)
      : -1;

    if (index === -1) {
      return { success: false, message: '矢を装備していません！所持品から矢を装備してください。' };
    }

    const arrow = player.inventory[index];
    const isSilver = arrow.name.includes('銀');

    // 1本消費
    const count = arrow.count ?? 1;
    if (count <= 1) {
      player.inventory.splice(index, 1);
      if (player.equippedArrow?.id === arrow.id) {
        player.equippedArrow = null;
      }
    } else {
      arrow.count = count - 1;
    }

    const dirVec = this.resolveDirection(player, dx, dy);
    let currX = player.x;
    let currY = player.y;
    let lastValidX = currX;
    let lastValidY = currY;
    const hitInfos: string[] = [];
    let hitMonsterId: string | undefined;

    for (let step = 1; step <= 10; step++) {
      const nextX = currX + dirVec.dx * step;
      const nextY = currY + dirVec.dy * step;

      if (nextX < 0 || nextX >= map.width || nextY < 0 || nextY >= map.height) break;
      if (map.tiles[nextY][nextX] === TileType.Wall) break;

      // 障害物判定
      const obs = map.obstacles?.find((o) => o.x === nextX && o.y === nextY);
      if (obs && !isSilver) {
        lastValidX = nextX;
        lastValidY = nextY;
        obs.hp -= 3;
        hitInfos.push(`${obs.name}に命中！`);
        break;
      }

      lastValidX = nextX;
      lastValidY = nextY;

      const targetM = map.monsters.find((m) => m.x === nextX && m.y === nextY);
      if (targetM) {
        hitMonsterId = targetM.id;
        const combat = CombatSystem.calculateRangedDamage(player, targetM, arrow.value);
        hitInfos.push(
          `${targetM.name}に${combat.damage}ダメージ${combat.isDefeated ? ' (撃破!)' : ''}`
        );
        if (combat.isDefeated) {
          const mIdx = map.monsters.indexOf(targetM);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
        if (!isSilver) break;
      }
    }

    // 銀の矢以外で誰にも当たらなかった場合、60%の確率で着弾マスに矢が落ちる
    if (!isSilver && hitInfos.length === 0 && Math.random() < 0.6) {
      const occupied = map.items.some((it) => it.x === lastValidX && it.y === lastValidY);
      if (!occupied && (lastValidX !== player.x || lastValidY !== player.y)) {
        map.items.push({
          id: `dropped_arrow_${Date.now()}_${Math.random()}`,
          name: arrow.name,
          category: 'ARROW',
          description: arrow.description,
          value: arrow.value,
          count: 1,
          x: lastValidX,
          y: lastValidY,
          symbol: ')',
          color: arrow.color,
        });
      }
    }

    const resultMsg =
      hitInfos.length > 0
        ? `${arrow.name} を射抜いた！ (${hitInfos.join(', ')})`
        : `${arrow.name} を放ったが、暗闇を突き抜けて外れてしまった。`;

    return {
      success: true,
      message: resultMsg,
      projectile: {
        fromX: player.x,
        fromY: player.y,
        toX: lastValidX,
        toY: lastValidY,
        type: 'ARROW',
        color: isSilver ? '#e0f2fe' : '#fbbf24',
        hitMonsterId,
      },
    };
  }

  /**
   * 魔法の杖を向いている方向へ振ります。
   */
  public static zapStaff(
    player: PlayerState,
    map: DungeonMap,
    staffId?: string,
    dx?: number,
    dy?: number
  ): ItemActionResult {
    const targetStaffId = staffId ?? player.equippedStaff?.id;
    const index = targetStaffId
      ? player.inventory.findIndex((it) => it.id === targetStaffId)
      : -1;

    if (index === -1) {
      return { success: false, message: '魔法の杖を装備していません！所持品から杖を装備してください。' };
    }

    const staff = player.inventory[index];
    const charges = staff.charges ?? 0;
    if (charges <= 0) {
      return {
        success: false,
        message: `${staff.name} を振ったが、魔力が尽きている！(敵に投げつければ最後の1回が発動する)`,
      };
    }

    staff.charges = charges - 1;

    const dirVec = this.resolveDirection(player, dx, dy);
    let currX = player.x;
    let currY = player.y;
    let lastValidX = currX;
    let lastValidY = currY;
    let targetMonster: Monster | null = null;

    for (let step = 1; step <= 10; step++) {
      const nextX = currX + dirVec.dx * step;
      const nextY = currY + dirVec.dy * step;

      if (nextX < 0 || nextX >= map.width || nextY < 0 || nextY >= map.height) break;
      if (map.tiles[nextY][nextX] === TileType.Wall) break;

      lastValidX = nextX;
      lastValidY = nextY;

      const m = map.monsters.find((mon) => mon.x === nextX && mon.y === nextY);
      if (m) {
        targetMonster = m;
        break;
      }
    }

    let effectMsg = '';
    const beamColor = '#38bdf8';

    if (!targetMonster) {
      effectMsg = `${staff.name} を振った！閃光が空間を突き抜けたが、誰にも当たらなかった。(残り[${staff.charges}])`;
    } else {
      if (staff.name.includes('吹き飛ばし')) {
        let pushX = targetMonster.x;
        let pushY = targetMonster.y;
        let hitWall = false;
        for (let p = 1; p <= 5; p++) {
          const nx = targetMonster.x + dirVec.dx * p;
          const ny = targetMonster.y + dirVec.dy * p;
          if (
            nx < 0 || nx >= map.width || ny < 0 || ny >= map.height ||
            map.tiles[ny][nx] === TileType.Wall ||
            map.monsters.some((o) => o !== targetMonster && o.x === nx && o.y === ny)
          ) {
            hitWall = true;
            break;
          }
          pushX = nx;
          pushY = ny;
        }
        targetMonster.x = pushX;
        targetMonster.y = pushY;
        let bonusDmg = 0;
        if (hitWall) {
          bonusDmg = 10;
          targetMonster.hp -= bonusDmg;
        }
        effectMsg = `${staff.name} の魔風が炸裂！ ${targetMonster.name} を激しく吹き飛ばした！${hitWall ? ' (壁激突で10ダメージ!)' : ''}`;
        if (targetMonster.hp <= 0) {
          player.exp += targetMonster.expValue;
          CombatSystem.checkLevelUp(player);
          const mIdx = map.monsters.indexOf(targetMonster);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
      } else if (staff.name.includes('場所替え')) {
        const oldPx = player.x;
        const oldPy = player.y;
        player.x = targetMonster.x;
        player.y = targetMonster.y;
        targetMonster.x = oldPx;
        targetMonster.y = oldPy;
        effectMsg = `${staff.name} の光が輝く！ あなたと ${targetMonster.name} の位置が一瞬で入れ替わった！`;
      } else if (staff.name.includes('かなしばり')) {
        targetMonster.isParalyzed = true;
        effectMsg = `${staff.name} の霊縛が発動！ ${targetMonster.name} は金縛りに遭い、動けなくなった！`;
      } else if (staff.name.includes('睡眠')) {
        targetMonster.sleepTurns = 6;
        effectMsg = `${staff.name} の眠気の霧が包み込む！ ${targetMonster.name} は深い眠りに落ちた！`;
      } else if (staff.name.includes('封印')) {
        targetMonster.isSealed = true;
        targetMonster.hasRangedAttack = false;
        targetMonster.isDormant = false;
        effectMsg = `${staff.name} の言霊が刺さる！ ${targetMonster.name} の特殊能力が永久封印された！`;
      } else if (staff.name.includes('雷鳴')) {
        targetMonster.hp -= 25;
        effectMsg = `${staff.name} から轟雷が迸る！ ${targetMonster.name} に25の電撃大ダメージ！`;
        if (targetMonster.hp <= 0) {
          player.exp += targetMonster.expValue;
          CombatSystem.checkLevelUp(player);
          const mIdx = map.monsters.indexOf(targetMonster);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
      } else if (staff.name.includes('一時しのぎ')) {
        targetMonster.x = map.stairsDown.x;
        targetMonster.y = map.stairsDown.y;
        targetMonster.isParalyzed = true;
        effectMsg = `${staff.name} の空間転移！ ${targetMonster.name} を階段マスへ吹き飛ばし、金縛りにした！(階段の場所が判明した)`;
      } else {
        targetMonster.hp -= 10;
        effectMsg = `${staff.name} の魔力光が直撃！ ${targetMonster.name} に10ダメージを与えた！`;
      }
    }

    return {
      success: true,
      message: effectMsg,
      projectile: {
        fromX: player.x,
        fromY: player.y,
        toX: lastValidX,
        toY: lastValidY,
        type: 'BEAM',
        color: beamColor,
        hitMonsterId: targetMonster?.id,
      },
    };
  }

  /**
   * インベントリ内の任意のアイテムを向いている方向へ投げつけます。
   */
  public static throwItem(
    player: PlayerState,
    map: DungeonMap,
    itemId: string,
    dx?: number,
    dy?: number
  ): ItemActionResult {
    const index = player.inventory.findIndex((it) => it.id === itemId);
    if (index === -1) {
      return { success: false, message: 'そのアイテムは所持していない。' };
    }

    const item = player.inventory.splice(index, 1)[0];

    // 装備解除
    if (player.equippedWeapon?.id === item.id) {
      player.equippedWeapon = null;
      CombatSystem.updatePlayerStats(player);
    }
    if (player.equippedShield?.id === item.id) {
      player.equippedShield = null;
      CombatSystem.updatePlayerStats(player);
    }
    if (player.equippedTalisman?.id === item.id) {
      player.equippedTalisman = null;
      CombatSystem.updatePlayerStats(player);
    }
    if (player.equippedArrow?.id === item.id) {
      player.equippedArrow = null;
    }
    if (player.equippedStaff?.id === item.id) {
      player.equippedStaff = null;
    }

    const dirVec = this.resolveDirection(player, dx, dy);
    let currX = player.x;
    let currY = player.y;
    let lastValidX = currX;
    let lastValidY = currY;
    let hitMonster: Monster | null = null;

    for (let step = 1; step <= 10; step++) {
      const nextX = currX + dirVec.dx * step;
      const nextY = currY + dirVec.dy * step;
      if (nextX < 0 || nextX >= map.width || nextY < 0 || nextY >= map.height) break;
      if (map.tiles[nextY][nextX] === TileType.Wall) break;

      lastValidX = nextX;
      lastValidY = nextY;

      const m = map.monsters.find((mon) => mon.x === nextX && mon.y === nextY);
      if (m) {
        hitMonster = m;
        break;
      }
    }

    let msg = `${item.name} を投げつけた！`;

    if (hitMonster) {
      if (item.category === 'STAFF') {
        // 残り0回の杖をぶつけると最後の1回が発動！
        if (hitMonster.isParalyzed !== undefined) hitMonster.isParalyzed = false;
        hitMonster.hp -= 15;
        msg += ` ${item.name} が ${hitMonster.name} に激突して粉砕！ 秘められた魔力が暴発して15ダメージを与えた！`;
        if (hitMonster.hp <= 0) {
          player.exp += hitMonster.expValue;
          CombatSystem.checkLevelUp(player);
          const mIdx = map.monsters.indexOf(hitMonster);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
      } else if (item.category === 'POTION') {
        if (item.name === '毒草') {
          hitMonster.atk = Math.max(1, Math.round(hitMonster.atk * 0.5));
          hitMonster.hp -= 5;
          msg += ` 毒素が浸透！ ${hitMonster.name} の攻撃力が半減し、5ダメージを受けた！`;
        } else if (item.name === '睡眠草') {
          hitMonster.sleepTurns = 6;
          msg += ` 甘い香りが漂い、${hitMonster.name} は眠りについた！`;
        } else if (item.name === '弟切草') {
          const isUndead = hitMonster.type === 'SKELETON' || hitMonster.type === 'ZOMBIE' || hitMonster.type === 'GHOST' || hitMonster.type === 'MUMMY';
          if (isUndead) {
            hitMonster.hp -= 50;
            msg += ` 聖なる薬効がアンデッドを灼く！ ${hitMonster.name} に50の特効大ダメージ！`;
          } else {
            hitMonster.hp = Math.min(hitMonster.maxHp, hitMonster.hp + 50);
            msg += ` ${hitMonster.name} の傷口が塞がり、HPが50回復してしまった！`;
          }
        } else {
          hitMonster.hp -= 4;
          msg += ` ${hitMonster.name} に命中！ (4ダメージ)`;
        }
        if (hitMonster.hp <= 0) {
          player.exp += hitMonster.expValue;
          CombatSystem.checkLevelUp(player);
          const mIdx = map.monsters.indexOf(hitMonster);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
      } else {
        // 武器・盾・その他アイテム投擲ダメージ
        const throwDmg = Math.max(2, Math.round(item.value * 0.75 + 3));
        hitMonster.hp -= throwDmg;
        msg += ` ${hitMonster.name} に命中！ (${throwDmg}ダメージ)`;
        if (hitMonster.hp <= 0) {
          player.exp += hitMonster.expValue;
          CombatSystem.checkLevelUp(player);
          const mIdx = map.monsters.indexOf(hitMonster);
          if (mIdx !== -1) map.monsters.splice(mIdx, 1);
        }
        // 50%で床に落ちる（割れないアイテム）
        if (Math.random() < 0.5) {
          item.x = lastValidX;
          item.y = lastValidY;
          map.items.push(item);
        }
      }
    } else {
      // 誰にも当たらず床に落ちる
      item.x = lastValidX;
      item.y = lastValidY;
      map.items.push(item);
      msg += ` 床の上にポトリと落ちた。`;
    }

    return {
      success: true,
      message: msg,
      projectile: {
        fromX: player.x,
        fromY: player.y,
        toX: lastValidX,
        toY: lastValidY,
        type: item.name.includes('石') ? 'STONE' : 'ITEM',
        color: item.color,
        hitMonsterId: hitMonster?.id,
      },
    };
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
    if (player.equippedTalisman?.id === item.id) {
      player.equippedTalisman = null;
      CombatSystem.updatePlayerStats(player);
    }
    if (player.equippedArrow?.id === item.id) {
      player.equippedArrow = null;
    }
    if (player.equippedStaff?.id === item.id) {
      player.equippedStaff = null;
    }

    item.x = player.x;
    item.y = player.y;

    // ショップ（店部屋）の中に置いた場合、売却待ち状態に設定
    const isInsideShop =
      map.shopRoom &&
      player.x >= map.shopRoom.x &&
      player.x < map.shopRoom.x + map.shopRoom.w &&
      player.y >= map.shopRoom.y &&
      player.y < map.shopRoom.y + map.shopRoom.h;

    if (isInsideShop) {
      item.isSoldToShop = true;
      const sellPrice = item.sellPrice ?? Math.floor((item.value ?? 100) * 0.5);
      map.items.push(item);
      return {
        success: true,
        message: `${item.name} を店の床に置いた。店主ネロ「その ${item.name} は ${sellPrice}G で買い取らせてもらおう！」`,
      };
    }

    map.items.push(item);

    return {
      success: true,
      message: `${item.name} を足元に置いた。`,
    };
  }

  /**
   * プレイヤーの所持品インベントリを論理順（装備中優先、武器→盾→矢→杖→腕輪→薬・種→食料→巻物）に整理・ソートします。
   *
   * @param player - 対象のプレイヤーステータス
   */
  public static sortInventory(player: PlayerState): void {
    const categoryOrder: Record<ItemCategory, number> = {
      WEAPON: 0,
      SHIELD: 1,
      ARROW: 2,
      STAFF: 3,
      TALISMAN: 4,
      POTION: 5,
      FOOD: 6,
      SCROLL: 7,
      GOLD: 8,
    };

    player.inventory.sort((a, b) => {
      const aEquipped =
        player.equippedWeapon?.id === a.id ||
        player.equippedShield?.id === a.id ||
        player.equippedTalisman?.id === a.id ||
        player.equippedArrow?.id === a.id ||
        player.equippedStaff?.id === a.id;
      const bEquipped =
        player.equippedWeapon?.id === b.id ||
        player.equippedShield?.id === b.id ||
        player.equippedTalisman?.id === b.id ||
        player.equippedArrow?.id === b.id ||
        player.equippedStaff?.id === b.id;

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
