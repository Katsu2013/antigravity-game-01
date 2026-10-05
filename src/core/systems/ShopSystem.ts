/**
 * @file ShopSystem.ts
 * @description ダンジョン内の商店（ショップ）、店主NPCとの取引・会計、および泥棒追撃システムを管理するクラス。
 * 風来のシレン・トルネコの大冒険におけるショップルール（未会計アイテムの持ち出し、売却査定、泥棒時の番犬召喚）に完全準拠します。
 */

import { DungeonMap, Item, Monster, PlayerState, Room } from '../types';
import { EntityFactory } from '../entities/EntityFactory';

/**
 * ショップ会計の計算結果を表すインターフェース。
 */
export interface ShopBill {
  /** プレイヤーが所持している未会計の商品アイテム一覧 */
  unpaidItems: Item[];
  /** 店の床に置かれた売却待ちのアイテム一覧 */
  sellItems: Item[];
  /** 購入に必要な合計金額（Gold） */
  totalCost: number;
  /** 売却によって得られる合計金額（Gold） */
  totalSell: number;
  /** 差引請求金額（正数: プレイヤーが支払う、負数: プレイヤーが受け取る） */
  balance: number;
  /** プレイヤーの所持金が足りているかどうか */
  canAfford: boolean;
}

/**
 * ショップ関連のロジックを統括する静的システムクラス。
 */
export class ShopSystem {
  /**
   * 指定座標がショップ（店部屋）の内部領域に含まれるかを判定します。
   *
   * @param x - X座標
   * @param y - Y座標
   * @param shopRoom - 対象フロアの店部屋情報
   */
  public static isInsideShop(
    x: number,
    y: number,
    shopRoom?: Room | null
  ): boolean {
    if (!shopRoom || !shopRoom.isShop) return false;
    return (
      x >= shopRoom.x &&
      x < shopRoom.x + shopRoom.w &&
      y >= shopRoom.y &&
      y < shopRoom.y + shopRoom.h
    );
  }

  /**
   * 移動によってプレイヤーがショップから外の通路へ出ようとしているかを判定します。
   */
  public static isLeavingShop(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    shopRoom?: Room | null
  ): boolean {
    const wasInside = this.isInsideShop(fromX, fromY, shopRoom);
    const isInsideNow = this.isInsideShop(toX, toY, shopRoom);
    return wasInside && !isInsideNow;
  }

  /**
   * 現在の未会計商品および売却待ちアイテムの合計金額・差引請求額を計算します。
   */
  public static calculateBill(player: PlayerState, map: DungeonMap): ShopBill {
    const unpaidItems = player.inventory.filter((it) => it.isShopItem === true);

    const sellItems = map.shopRoom
      ? map.items.filter(
          (it) =>
            it.isSoldToShop === true &&
            this.isInsideShop(it.x, it.y, map.shopRoom)
        )
      : [];

    const totalCost = unpaidItems.reduce(
      (sum, it) => sum + (it.price ?? it.value ?? 100),
      0
    );

    const totalSell = sellItems.reduce(
      (sum, it) => sum + (it.sellPrice ?? Math.floor((it.value ?? 100) * 0.5)),
      0
    );

    const balance = totalCost - totalSell;
    const canAfford = player.gold >= balance;

    return {
      unpaidItems,
      sellItems,
      totalCost,
      totalSell,
      balance,
      canAfford,
    };
  }

  /**
   * 店主との会計・精算を実行します。
   */
  public static checkout(
    player: PlayerState,
    map: DungeonMap
  ): { success: boolean; message: string; paid: number; earned: number } {
    const bill = this.calculateBill(player, map);

    if (bill.unpaidItems.length === 0 && bill.sellItems.length === 0) {
      return {
        success: true,
        message: '店主ネロ「毎度どうも！ごゆっくり見ていっておくれよ！」',
        paid: 0,
        earned: 0,
      };
    }

    if (!bill.canAfford) {
      return {
        success: false,
        message: `店主ネロ「お客さん、お金が足りないよ！(必要: ${bill.balance}G / 所持金: ${player.gold}G)」`,
        paid: 0,
        earned: 0,
      };
    }

    // 会計実行
    if (bill.balance > 0) {
      player.gold -= bill.balance;
    } else if (bill.balance < 0) {
      player.gold += Math.abs(bill.balance);
    }

    // 購入アイテムの未会計フラグを解除
    for (const item of bill.unpaidItems) {
      delete item.isShopItem;
    }

    // 売却アイテムをショップの通常売り場商品へ昇格
    for (const item of bill.sellItems) {
      delete item.isSoldToShop;
      item.isShopItem = true;
    }

    let msg = '';
    if (bill.totalCost > 0 && bill.totalSell > 0) {
      msg = `会計完了！商品代金 ${bill.totalCost}G から売却代金 ${bill.totalSell}G を相殺し、精算しました。(現在: ${player.gold}G)`;
    } else if (bill.totalCost > 0) {
      msg = `まいどあり！代金 ${bill.totalCost}G を支払い、商品を受け取りました。(残金: ${player.gold}G)`;
    } else {
      msg = `買い取り成立！不要品を売却して ${bill.totalSell}G を受け取りました！(所持金: ${player.gold}G)`;
    }

    return {
      success: true,
      message: msg,
      paid: Math.max(0, bill.balance),
      earned: Math.max(0, -bill.balance),
    };
  }

  /**
   * 泥棒（窃盗）イベントをトリガーし、店主の激怒と番犬警備隊の召喚を発動します。
   */
  public static triggerTheft(
    player: PlayerState,
    map: DungeonMap
  ): { message: string; alarmTriggered: boolean } {
    if (map.isThiefMode) {
      return { message: '', alarmTriggered: false };
    }

    map.isThiefMode = true;

    // 1. 店主を激怒モードに変貌
    const merchant = map.monsters.find(
      (m) => m.type === 'MERCHANT' || m.isShopkeeper === true
    );
    if (merchant) {
      merchant.name = '怒りの店主ネロ';
      merchant.isFriendly = false;
      merchant.isAngryMerchant = true;
      merchant.hp = 350;
      merchant.maxHp = 350;
      merchant.atk = 65;
      merchant.def = 25;
      merchant.color = '#ef4444';
      merchant.symbol = 'M';
      merchant.isSlow = false;
    }

    // 2. プレイヤー周辺および出口に通路から番犬（GUARD_DOG）を2〜3体即座に召喚
    const spawnedDogs: Monster[] = [];
    const spawnAttempts = 15;
    for (let i = 0; i < 3; i++) {
      for (let a = 0; a < spawnAttempts; a++) {
        const offsetDist = Math.floor(Math.random() * 3) + 2;
        const dx = (Math.random() < 0.5 ? 1 : -1) * offsetDist;
        const dy = (Math.random() < 0.5 ? 1 : -1) * offsetDist;
        const sx = player.x + dx;
        const sy = player.y + dy;

        if (
          sx >= 0 &&
          sx < map.width &&
          sy >= 0 &&
          sy < map.height &&
          map.tiles[sy][sx] !== 'Wall' &&
          !map.monsters.some((m) => m.x === sx && m.y === sy) &&
          (sx !== player.x || sy !== player.y)
        ) {
          const dog = EntityFactory.createGuardDog(sx, sy);
          map.monsters.push(dog);
          spawnedDogs.push(dog);
          break;
        }
      }
    }

    return {
      message:
        '『泥棒ーーーーーーー！！ 誰かあの不届き者を捕まえてくれーーーーーーー！！』 警備の番犬たちが一斉に放たれた！',
      alarmTriggered: true,
    };
  }

  /**
   * 泥棒中、ターン経過に応じて追加の番犬を増援召喚します。
   */
  public static processThiefTurn(
    map: DungeonMap,
    turn: number
  ): Monster | null {
    if (!map.isThiefMode) return null;

    // 10ターンに1回、かつ番犬が4匹未満の場合に増援
    if (turn % 10 !== 0) return null;

    const dogCount = map.monsters.filter((m) => m.type === 'GUARD_DOG').length;
    if (dogCount >= 5) return null;

    // 階段の周辺や通路の空きマスに召喚
    const cx = map.stairsDown.x;
    const cy = map.stairsDown.y;

    for (let r = 1; r <= 5; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const sx = cx + dx;
          const sy = cy + dy;
          if (
            sx >= 0 &&
            sx < map.width &&
            sy >= 0 &&
            sy < map.height &&
            map.tiles[sy][sx] !== 'Wall' &&
            !map.monsters.some((m) => m.x === sx && m.y === sy)
          ) {
            const dog = EntityFactory.createGuardDog(sx, sy);
            map.monsters.push(dog);
            return dog;
          }
        }
      }
    }

    return null;
  }
}
