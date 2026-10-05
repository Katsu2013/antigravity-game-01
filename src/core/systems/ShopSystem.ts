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

export interface ShopkeeperTalkResult {
  message: string;
  type: 'normal' | 'info' | 'warning' | 'damage' | 'turn-header';
  actionTaken?: 'slap' | 'close_shop' | 'checkout';
  slapDamage?: number;
  knockbackDir?: { dx: number; dy: number };
}

/**
 * 店主が泥棒中のプレイヤーに対して遠隔攻撃を実行した結果を表すインターフェース。
 */
export interface ShopkeeperTheftAttackResult {
  executed: boolean;
  attackName: string;
  message: string;
  damage: number;
  projectileType: 'ITEM' | 'ARROW' | 'BEAM' | 'STONE';
  color: string;
  soundType: 'thunder' | 'slash' | 'hammer' | 'throw' | 'slap';
}

/**
 * 店主が泥棒追撃時に繰り出す遠隔攻撃の定義インターフェース。
 */
export interface ShopkeeperRangedAttack {
  name: string;
  msg: string;
  damage: number;
  projectileType: 'ITEM' | 'ARROW' | 'BEAM' | 'STONE';
  color: string;
  soundType: 'thunder' | 'slash' | 'hammer' | 'throw' | 'slap';
}

/**
 * 店主キャラクターの個性・外見・専用台詞を定義するインターフェース。
 */
export interface ShopkeeperProfile {
  id: 'NERO' | 'TORNEKO' | 'SHIREN' | 'GOLDO' | 'CELIA';
  name: string;
  angryName: string;
  color: string;
  angryColor: string;
  greetingMsg: string;
  shortageMsg: (need: number, has: number) => string;
  purchaseMsg: (cost: number, remain: number) => string;
  sellMsg: (earned: number, total: number) => string;
  settleMsg: (cost: number, sell: number, remain: number) => string;
  angryTheftMsg: string;
  /** しつこく話しかけられた時の困惑・警告台詞 */
  annoyedMsg: (streak: number) => string;
  /** 怒りのビンタ・張り手台詞 */
  slapQuote: string;
  /** シャッター強制閉店台詞 */
  closeShopQuote: string;
  /** 泥棒追撃時の遠隔攻撃定義 */
  rangedAttack: ShopkeeperRangedAttack;
}

/**
 * 個性豊かな名物店主たちのプロファイル定義一覧。
 */
export const SHOPKEEPER_PROFILES: Record<string, ShopkeeperProfile> = {
  TORNEKO: {
    id: 'TORNEKO',
    name: '大商人トルネー',
    angryName: '激怒の大商人トルネー',
    color: '#3b82f6',
    angryColor: '#ef4444',
    greetingMsg: '大商人トルネー「毎度あり！わしは世界一の武器商人を目指しておるんじゃ。良い品が揃っておるよ、ゆっくり見ていっておくれ！」',
    shortageMsg: (need, has) => `大商人トルネー「おやおや、お金が足りんようじゃな！(必要: ${need}G / 所持金: ${has}G) 無理な買い物はいかんよ」`,
    purchaseMsg: (cost, remain) => `大商人トルネー「まいどあり！代金 ${cost}G を頂戴したぞ。大事に使ってくだされ！(残金: ${remain}G)」`,
    sellMsg: (earned, total) => `大商人トルネー「良い品を買い取らせてもらった！ ${earned}G をお渡ししよう！(所持金: ${total}G)」`,
    settleMsg: (cost, sell, remain) => `大商人トルネー「差し引き精算じゃな！商品代金 ${cost}G から買取代 ${sell}G を相殺したぞ！(残金: ${remain}G)」`,
    angryTheftMsg: '大商人トルネー「わ、わしの店で泥棒じゃとーーっ！？ 冒険者の風上にも置けん奴め！ 番犬ども、全財産を奪い返せーーっ！！」',
    annoyedMsg: (streak) =>
      streak <= 4
        ? '大商人トルネー「おやおや、何かお探しですかな？ 冷やかしなら困るんじゃが…」'
        : '大商人トルネー「これこれ若者！ しつこいぞ！ これ以上からかったら怒るぞい！」',
    slapQuote: '大商人トルネー「もう我慢ならんわい！ 塩でも食らえーーっ！！」',
    closeShopQuote: '大商人トルネー「もうお前さんには売らん！ 本日の営業は店じまいじゃ！」',
    rangedAttack: {
      name: '巨大フランスパン投げ',
      msg: '大商人トルネー「泥棒ーーっ！ そいつを返せーーっ！」と頑丈な特大フランスパンを投げつけてきた！',
      damage: 14,
      projectileType: 'ITEM',
      color: '#f59e0b',
      soundType: 'throw',
    },
  },
  SHIREN: {
    id: 'SHIREN',
    name: '風来坊シレンス',
    angryName: '修羅の風来坊シレンス',
    color: '#0284c7',
    angryColor: '#dc2626',
    greetingMsg: '風来坊シレンス「……いらっしゃい。旅の備えなら揃っている。命を大事にしな。」',
    shortageMsg: (need, has) => `風来坊シレンス「……手持ちが足りないようだ。(必要: ${need}G / 所持金: ${has}G) 悪いがツケは利かない。」`,
    purchaseMsg: (cost, remain) => `風来坊シレンス「……代金 ${cost}G、確かに受け取った。道中気をつけてな。(残金: ${remain}G)」`,
    sellMsg: (earned, total) => `風来坊シレンス「買い取ろう。代金 ${earned}G だ。(所持金: ${total}G)」`,
    settleMsg: (cost, sell, remain) => `風来坊シレンス「差し引き完了だ。(購入 ${cost}G / 売却 ${sell}G / 残金: ${remain}G)」`,
    angryTheftMsg: '風来坊シレンス「……泥棒か。迷宮の掟を破ったな。逃げ切れると思うなよ……！」',
    annoyedMsg: (streak) =>
      streak <= 4
        ? '風来坊シレンス「……用がないなら、静かに商品を見てくれ。」'
        : '風来坊シレンス「……何度も同じことを言わせるな。次はないぞ。」',
    slapQuote: '風来坊シレンス「……警告はしたはずだ。（パシィン！ 鞘の峰打ち！）」',
    closeShopQuote: '風来坊シレンス「……冷やかしの相手をしている暇はない。店を閉める。」',
    rangedAttack: {
      name: '飛剣の真空波',
      msg: '風来坊シレンス「逃がさん……！」と鋭い真空の刃を放ってきた！',
      damage: 16,
      projectileType: 'BEAM',
      color: '#38bdf8',
      soundType: 'slash',
    },
  },
  GOLDO: {
    id: 'GOLDO',
    name: '鍛冶商人ゴルド',
    angryName: '噴火の鍛冶親父ゴルド',
    color: '#d97706',
    angryColor: '#b91c1c',
    greetingMsg: '鍛冶商人ゴルド「おう！冷やかしなら帰んな！俺が鍛え上げた業物ばかりだ、じっくり品定めしな！」',
    shortageMsg: (need, has) => `鍛冶商人ゴルド「おいおい！金が足りねえぞ！(必要: ${need}G / 所持金: ${has}G) タダで譲るわけにはいかん！」`,
    purchaseMsg: (cost, remain) => `鍛冶商人ゴルド「ガハハ！毎度！ ${cost}G いただきだ！その武具で敵をぶっ叩いてきな！(残金: ${remain}G)」`,
    sellMsg: (earned, total) => `鍛冶商人ゴルド「よし、いい素材だ！ ${earned}G で引き取ってやるぜ！(所持金: ${total}G)」`,
    settleMsg: (cost, sell, remain) => `鍛冶商人ゴルド「計算ぴったりだ！(代金 ${cost}G - 買取 ${sell}G / 残金: ${remain}G)」`,
    angryTheftMsg: '鍛冶商人ゴルド「俺の目の前でタダ持ち出しだとぉ！？ 許さねえ！ ハンマーで叩き潰して鉄屑にしてやるわい！！」',
    annoyedMsg: (streak) =>
      streak <= 4
        ? '鍛冶商人ゴルド「おいおい！ 何度もつついてどうした！？ 買うもんねえなら邪魔だぜ！」'
        : '鍛冶商人ゴルド「おい貴様！ 俺の仕事の邪魔をするな！ ハンマーが唸るぞ！」',
    slapQuote: '鍛冶商人ゴルド「てめえ！ 脳天にゲンコツ食らわしてやるわい！！」',
    closeShopQuote: '鍛冶商人ゴルド「やってられっか！ 今日はもう店じまいだ！ 帰れ帰れ！」',
    rangedAttack: {
      name: '鉄塊投げ',
      msg: '鍛冶商人ゴルド「逃げるたぁいい度胸だ！」と重い鉄塊をドカンと投げつけてきた！',
      damage: 18,
      projectileType: 'STONE',
      color: '#71717a',
      soundType: 'hammer',
    },
  },
  CELIA: {
    id: 'CELIA',
    name: '魔導商人セリア',
    angryName: '冷徹な魔女セリア',
    color: '#a855f7',
    angryColor: '#9333ea',
    greetingMsg: '魔導商人セリア「あら、ようこそ迷宮の迷い子さん。ふふ、何をお探し？ 深層は危険よ、しっかり準備なさいな。」',
    shortageMsg: (need, has) => `魔導商人セリア「ふふ、ゴールドが足りないみたいよ？(必要: ${need}G / 所持金: ${has}G) お金は魔力と同じくらい大切よ。」`,
    purchaseMsg: (cost, remain) => `魔導商人セリア「お買い上げありがとう。あなたに幸運の加護を。(代金 ${cost}G / 残金: ${remain}G)」`,
    sellMsg: (earned, total) => `魔導商人セリア「素敵な不用品ね、 ${earned}G で買い取らせていただくわ。(所持金: ${total}G)」`,
    settleMsg: (cost, sell, remain) => `魔導商人セリア「商品代 ${cost}G と買取代 ${sell}G を相殺して精算完了よ。ふふ、賢いお買い物ね。(残金: ${remain}G)」`,
    angryTheftMsg: '魔導商人セリア「あらあら……私の店で泥棒？ 身の程知らずな子ね。逃げられると思ったら大間違いよ、灰にしてあげるわ！」',
    annoyedMsg: (streak) =>
      streak <= 4
        ? '魔導商人セリア「ふふ、私の顔に何かついてるかしら？ 見惚れるのもいいけれど、お買い物はどう？」'
        : '魔導商人セリア「あら……私を怒らせたいのかしら？ 後悔することになるわよ？」',
    slapQuote: '魔導商人セリア「しつこい男は嫌いよ。（バチチッ！ 静電気ショック！）」',
    closeShopQuote: '魔導商人セリア「冷やかしはお断りよ。ふふ、今日はもうおしまい。」',
    rangedAttack: {
      name: '紫電の雷撃ボルト',
      msg: '魔導商人セリア「ふふ、逃げられるかしら？」と紫電の魔弾を撃ち込んできた！',
      damage: 16,
      projectileType: 'BEAM',
      color: '#c084fc',
      soundType: 'thunder',
    },
  },
  NERO: {
    id: 'NERO',
    name: '商人ネロ',
    angryName: '怒りの店主ネロ',
    color: '#fbbf24',
    angryColor: '#ef4444',
    greetingMsg: '商人ネロ「毎度どうも！ごゆっくり見ていっておくれよ！」',
    shortageMsg: (need, has) => `商人ネロ「お客さん、お金が足りないよ！(必要: ${need}G / 所持金: ${has}G)」`,
    purchaseMsg: (cost, remain) => `まいどあり！代金 ${cost}G を支払い、商品を受け取りました。(残金: ${remain}G)`,
    sellMsg: (earned, total) => `買い取り成立！不要品を売却して ${earned}G を受け取りました！(所持金: ${total}G)`,
    settleMsg: (cost, sell, remain) => `会計完了！商品代金 ${cost}G から売却代金 ${sell}G を相殺し、精算しました。(残金: ${remain}G)`,
    angryTheftMsg: '商人ネロ「泥棒だーーーっ！！ 番犬ども、あいつを絶対に逃すなーーっ！！」',
    annoyedMsg: (streak) =>
      streak <= 4
        ? '商人ネロ「お客さん、何か用かい？ 冷やかしはお断りだよ！」'
        : '商人ネロ「いい加減にしな！ これ以上しつこくしたらタダじゃ置かないよ！」',
    slapQuote: '商人ネロ「出て行けーーーーっ！！（ドゴォッ！ ほうきで叩き出された！）」',
    closeShopQuote: '商人ネロ「もう営業終了だ！ シャッター閉めるよ！！」',
    rangedAttack: {
      name: '包丁投げ',
      msg: '商人ネロ「この泥棒猫め！」と目にも留まらぬ速さで包丁を投げてきた！',
      damage: 14,
      projectileType: 'ARROW',
      color: '#e2e8f0',
      soundType: 'throw',
    },
  },
};

/**
 * ショップ関連のロジックを統括する静的システムクラス。
 */
export class ShopSystem {
  /**
   * 店主プロファイルを取得します（未指定または未定義時はランダムまたはNERO）。
   */
  public static getProfile(id?: string): ShopkeeperProfile {
    if (id && SHOPKEEPER_PROFILES[id]) {
      return SHOPKEEPER_PROFILES[id];
    }
    return SHOPKEEPER_PROFILES.NERO;
  }

  /**
   * ランダムな店主プロファイルを抽選します。
   */
  public static getRandomProfile(): ShopkeeperProfile {
    const keys = Object.keys(SHOPKEEPER_PROFILES);
    const chosen = keys[Math.floor(Math.random() * keys.length)];
    return SHOPKEEPER_PROFILES[chosen];
  }

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

    // 店主モンスターとプロファイルの特定
    const merchant = map.monsters.find(
      (m) => m.type === 'MERCHANT' || m.isShopkeeper === true
    );
    const profile = this.getProfile(merchant?.shopkeeperProfileId);

    if (bill.unpaidItems.length === 0 && bill.sellItems.length === 0) {
      return {
        success: true,
        message: profile.greetingMsg,
        paid: 0,
        earned: 0,
      };
    }

    if (!bill.canAfford) {
      return {
        success: false,
        message: profile.shortageMsg(bill.balance, player.gold),
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
      msg = profile.settleMsg(bill.totalCost, bill.totalSell, player.gold);
    } else if (bill.totalCost > 0) {
      msg = profile.purchaseMsg(bill.totalCost, player.gold);
    } else {
      msg = profile.sellMsg(bill.totalSell, player.gold);
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
    const profile = this.getProfile(merchant?.shopkeeperProfileId);

    if (merchant) {
      merchant.name = profile.angryName;
      merchant.isFriendly = false;
      merchant.isAngryMerchant = true;
      merchant.hp = 350;
      merchant.maxHp = 350;
      merchant.atk = 65;
      merchant.def = 25;
      merchant.color = profile.angryColor;
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

  /**
   * 店主NPCへ接触または話しかけた際の統合ハンドラ。
   * 会計（購入・売却）があれば精算し、冷やかしやしつこい接触が続くと困惑→警告→お仕置きビンタまたは強制閉店に発展します。
   */
  public static handleTalkToShopkeeper(
    player: PlayerState,
    map: DungeonMap,
    merchant: Monster,
    facingDir?: { dx: number; dy: number }
  ): ShopkeeperTalkResult {
    const profile = this.getProfile(merchant.shopkeeperProfileId);

    // 1. 既にシャッター閉店済みの場合は営業終了メッセージのみ
    if (merchant.isShopClosed) {
      return {
        message: `${merchant.name}「本日の営業は終了しました。またのお越しをお待ちしております。」（シャッターが固く閉ざされている……）`,
        type: 'warning',
      };
    }

    // 2. 会計品（未会計アイテムまたは売却待ちアイテム）がある場合は精算処理
    const bill = this.calculateBill(player, map);
    if (bill.unpaidItems.length > 0 || bill.sellItems.length > 0) {
      merchant.talkStreak = 0;
      const checkoutRes = this.checkout(player, map);
      return {
        message: checkoutRes.message,
        type: checkoutRes.success ? 'turn-header' : 'warning',
        actionTaken: 'checkout',
      };
    }

    // 3. 会計品がない状態での連続会話（冷やかし）カウント処理
    merchant.talkStreak = (merchant.talkStreak ?? 0) + 1;
    const streak = merchant.talkStreak;

    // 1〜2回目: 通常の挨拶
    if (streak <= 2) {
      return {
        message: profile.greetingMsg,
        type: 'turn-header',
      };
    }

    // 3〜4回目: 困惑メッセージ
    if (streak <= 4) {
      return {
        message: profile.annoyedMsg(streak),
        type: 'normal',
      };
    }

    // 5〜6回目: 強い警告メッセージ
    if (streak <= 6) {
      return {
        message: profile.annoyedMsg(streak),
        type: 'warning',
      };
    }

    // 7回目以上: お仕置きビンタ (50%) または シャッター強制閉店 (50%)
    const doSlap = Math.random() < 0.5;

    if (doSlap) {
      merchant.talkStreak = 0;
      const slapDamage = 8;
      const knockbackDir = facingDir
        ? { dx: -facingDir.dx, dy: -facingDir.dy }
        : undefined;

      return {
        message: `${profile.slapQuote} あなたは痛烈なビンタを食らい、${slapDamage} のダメージを受けた！`,
        type: 'damage',
        actionTaken: 'slap',
        slapDamage,
        knockbackDir,
      };
    } else {
      merchant.isShopClosed = true;
      merchant.talkStreak = 0;

      // 店内の未購入商品を全回収（撤去）
      map.items = map.items.filter((it) => !it.isShopItem);

      return {
        message: `${profile.closeShopQuote} ガラガラガラ……！ 店主は商品を片付け、シャッターを下ろしてしまった！`,
        type: 'warning',
        actionTaken: 'close_shop',
      };
    }
  }

  /**
   * 泥棒追撃中、店主がプレイヤーへ遠隔追撃を行うかを判定・実行します。
   * 距離2〜5マス、射線が通る場合に50%の確率で発動します。
   */
  public static checkAndExecuteRangedTheftAttack(
    merchant: Monster,
    player: PlayerState,
    map: DungeonMap,
    hasLoS: boolean
  ): ShopkeeperTheftAttackResult | null {
    if (!map.isThiefMode || !merchant.isAngryMerchant || !player.isAlive) {
      return null;
    }

    const dist = Math.max(
      Math.abs(merchant.x - player.x),
      Math.abs(merchant.y - player.y)
    );

    // 距離が2〜5マスで、射線が通っている場合に対象
    if (dist < 2 || dist > 5 || !hasLoS) {
      return null;
    }

    // 50%の確率で繰り出す
    if (Math.random() < 0.5) {
      return null;
    }

    const profile = this.getProfile(merchant.shopkeeperProfileId);
    const ranged = profile.rangedAttack;

    return {
      executed: true,
      attackName: ranged.name,
      message: ranged.msg,
      damage: ranged.damage,
      projectileType: ranged.projectileType,
      color: ranged.color,
      soundType: ranged.soundType,
    };
  }
}

