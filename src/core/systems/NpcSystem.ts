/**
 * @file NpcSystem.ts
 * @description ダンジョン内にまれに出現する特殊レアNPC（冒険者レオン、賭博仙人ガンジ、鍛冶屋バルカン）
 * および気まぐれモンスター（妖精ピクシー）の会話・イベント・インタラクションを管理するシステムクラス。
 */

import { Item, Monster, PlayerState } from '../types';
import { CombatSystem } from './CombatSystem';
import { SoundSystem } from '../../audio/SoundSystem';

/**
 * NPC対話イベントの種類
 */
export type NpcEventType =
  | 'ADVENTURER_TRADE'
  | 'GAMBLER_RPS'
  | 'BLACKSMITH_FORGE'
  | 'FOOD_STALL';

/**
 * 屋台で注文可能な料理メニュー情報。
 */
export interface FoodMenuItem {
  /** メニュー識別子 */
  id: 'RAMEN_NORMAL' | 'RAMEN_SPECIAL' | 'WIFE_ONIGIRI' | 'ODEN_HOT';
  /** メニュー表示名 */
  name: string;
  /** 必要ゴールド価格 */
  price: number;
  /** 効果説明文 */
  description: string;
  /** アイコン絵文字 */
  icon: string;
}

/**
 * NPCインタラクションの対話モーダル用データインターフェース。
 */
export interface NpcDialogData {
  /** 対話対象のNPC（Monsterインスタンス） */
  npc: Monster;
  /** モーダルヘッダーに表示するNPC名・タイトル */
  title: string;
  /** NPCが語りかけてくるセリフ・説明本文 */
  message: string;
  /**
   * 発生しているイベントの種別。
   * - 想定値:
   *   - `'ADVENTURER_TRADE'`: 旅の冒険者レオンとの物々交換
   *   - `'GAMBLER_RPS'`: 賭博仙人ガンジとのじゃんけん大勝負
   *   - `'BLACKSMITH_FORGE'`: さすらいの鍛冶職人バルカンとの無料鍛錬
   *   - `'FOOD_STALL'`: 迷宮の屋台（ラーメンマルキン・おでん）での食事
   */
  eventType: NpcEventType;
  /** 物々交換で欲しがっているアイテムカテゴリの日本語名（例: 「武器」「巻物」） */
  tradeWantCategoryName?: string;
  /** 物々交換で見返りとして提示されている報酬アイテム */
  tradeOfferedItem?: Item;
  /** プレイヤーの所持品の中で交換条件に合致するアイテム一覧 */
  playerMatchingItems?: Item[];
  /** 鍛冶屋で鍛錬可能なプレイヤーの装備中武器 */
  equippedWeapon?: Item | null;
  /** 鍛冶屋で鍛錬可能なプレイヤーの装備中盾 */
  equippedShield?: Item | null;
  /** 屋台で注文可能な料理メニュー一覧 */
  foodMenuList?: FoodMenuItem[];
  /** 屋台の店員種別（MASTER: おじさん「金さん」, WIFE: 奥さん「ウチやってません」） */
  stallClerk?: 'MASTER' | 'WIFE';
  /** 奥さんへの懇願回数 */
  wifeTalkCount?: number;
  /**
   * 当該イベントがこのフロアですでに完了・終了済みかどうかのフラグ。
   * - 想定値:
   *   - `true`: 既に交換や鍛錬、食事を終えており、追加のイベントは不可
   *   - `false` / `undefined`: 初回対話でありイベント実行可能
   * - 初期値: `undefined`
   */
  alreadyDone?: boolean;
}

export class NpcSystem {
  /**
   * レアNPCとの会話を開始し、対話モーダル用のデータを生成します。
   */
  public static startInteraction(player: PlayerState, npc: Monster): NpcDialogData | null {
    if (!npc.isRareNpc || !npc.npcData) return null;

    // 1. さすらいの冒険者レオン（物々交換）
    if (npc.type === 'WANDERING_ADVENTURER') {
      if (npc.npcData.tradeCompleted) {
        return {
          npc,
          title: 'さすらいの冒険者レオン',
          message: '「さっきは良い取引をありがとう！ これを持ってお互い生きて深層を突破しようぜ！」',
          eventType: 'ADVENTURER_TRADE',
          alreadyDone: true,
        };
      }

      const wantCat = npc.npcData.tradeWantCategory;
      const matching = player.inventory.filter((it) => it.category === wantCat && !it.isShopItem);
      const offered = npc.npcData.tradeOfferedItem!;

      return {
        npc,
        title: 'さすらいの冒険者レオン',
        message: `「やあ、旅の仲間よ！ もし良ければ【${npc.npcData.tradeWantCategoryName}】を1つ、俺の秘蔵の【${offered.name}${offered.upgradeLevel ? `+${offered.upgradeLevel}` : ''}】と物々交換してくれないか？」`,
        eventType: 'ADVENTURER_TRADE',
        tradeWantCategoryName: npc.npcData.tradeWantCategoryName,
        tradeOfferedItem: offered,
        playerMatchingItems: matching,
      };
    }

    // 2. 賭博仙人ガンジ（じゃんけん勝負）
    if (npc.type === 'GAMBLER_SAGE') {
      const currentCap = player.inventoryCapacity ?? 12;
      return {
        npc,
        title: '賭博仙人ガンジ',
        message: `「カッカッカ！ ワシとじゃんけん勝負をせんか？ 勝てば道具袋の容量を増やしてやるぞい！（現在:${currentCap}枠 → ${currentCap + 2}枠）\nただし負けたら500G（無ければ道具1個）をいただくがの！」`,
        eventType: 'GAMBLER_RPS',
      };
    }

    // 3. さすらいの鍛冶職人バルカン（武具無料鍛錬）
    if (npc.type === 'TRAVELING_BLACKSMITH') {
      if (npc.npcData.hasForged) {
        return {
          npc,
          title: 'さすらいの鍛冶職人バルカン',
          message: '「今日の鍛錬はおしまいだ！ 鍛え直した得物で、奥の魔物どもを蹴散らしてこい！」',
          eventType: 'BLACKSMITH_FORGE',
          alreadyDone: true,
        };
      }

      const hasWeapon = !!player.equippedWeapon;
      const hasShield = !!player.equippedShield;

      if (!hasWeapon && !hasShield) {
        return {
          npc,
          title: 'さすらいの鍛冶職人バルカン',
          message: '「おいおい！ 武器も盾も身につけてねえじゃねえか！ 装備してから声をかけな！」',
          eventType: 'BLACKSMITH_FORGE',
          alreadyDone: true,
        };
      }

      return {
        npc,
        title: 'さすらいの鍛冶職人バルカン',
        message: '「おう！ 頑丈そうな獲物を持ってるじゃねえか。ワシの槌で一発、無料で鍛え上げてやろう！ どちらを鍛える？」',
        eventType: 'BLACKSMITH_FORGE',
        equippedWeapon: player.equippedWeapon,
        equippedShield: player.equippedShield,
      };
    }

    // 4. 迷宮の屋台（ラーメン屋台マルキン / 秘伝のおでん屋台）
    if (npc.type === 'FOOD_STALL') {
      const stallType = npc.npcData.stallType ?? 'RAMEN_MARUKIN';

      // ラーメン屋台マルキン
      if (stallType === 'RAMEN_MARUKIN') {
        const stallClerk = npc.npcData.stallClerk ?? 'MASTER';

        // 奥さん（おかみさん）が立っている場合
        if (stallClerk === 'WIFE') {
          if (npc.npcData.foodPurchased) {
            return {
              npc,
              title: '屋台マルキン（奥さん）',
              message: '「塩むすび食ったら、さっさと奥へ行きな！ 風邪なんか引くんじゃないよ！」',
              eventType: 'FOOD_STALL',
              stallClerk: 'WIFE',
              alreadyDone: true,
            };
          }

          const talkCount = npc.npcData.wifeTalkCount ?? 0;
          if (talkCount === 0) {
            return {
              npc,
              title: '屋台マルキン（奥さん）',
              message: '「あんた誰だい！？ ウチやってません！ 今お父ちゃん（金さん）仕込みで留守なんだよ！ 帰った帰った！」',
              eventType: 'FOOD_STALL',
              stallClerk: 'WIFE',
              wifeTalkCount: 0,
              foodMenuList: [],
            };
          } else if (talkCount === 1) {
            return {
              npc,
              title: '屋台マルキン（奥さん）',
              message: '「しつこいねえ！ だからウチやってませんって言ってんだろ！ 暖簾下げてんのが見えないのかい！？ 早くお帰り！」',
              eventType: 'FOOD_STALL',
              stallClerk: 'WIFE',
              wifeTalkCount: 1,
              foodMenuList: [],
            };
          } else {
            return {
              npc,
              title: '屋台マルキン（奥さん）',
              message: '「……ハァ、しょうがないねぇ。お腹空かせて行き倒れられちゃ寝覚めが悪いよ。お父ちゃんには内緒だよ？ そこにある残り物の『塩むすび』でいいなら持ってきな！」',
              eventType: 'FOOD_STALL',
              stallClerk: 'WIFE',
              wifeTalkCount: talkCount,
              foodMenuList: [
                {
                  id: 'WIFE_ONIGIRI',
                  name: 'おかみ特製・塩むすび',
                  price: 50,
                  description: '満腹度+40%回復、HP+15回復。素朴ながら愛情の詰まった賄いむすび。',
                  icon: '🍙',
                },
              ],
            };
          }
        }

        // おじさん店主（金さん）が立っている場合
        if (npc.npcData.foodPurchased) {
          return {
            npc,
            title: 'ラーメン屋台 マルキン',
            message: '「あじゃあうえっぇー！ スープまで飲み干してくれてありがとな！ 腹一杯になったら、奥の魔物も蹴散らしてこい！」',
            eventType: 'FOOD_STALL',
            stallClerk: 'MASTER',
            alreadyDone: true,
          };
        }

        return {
          npc,
          title: 'ラーメン屋台 マルキン',
          message: '「あじゃあうえっぇー！ へいらっしゃい！ 屋台マルキンへようこそ！ 迷宮でお腹を空かせて倒れちゃ敵わねえ。熱々の自家製ラーメンを食ってきな！」',
          eventType: 'FOOD_STALL',
          stallClerk: 'MASTER',
          foodMenuList: [
            {
              id: 'RAMEN_NORMAL',
              name: 'マルキン特製ラーメン',
              price: 150,
              description: '満腹度+100%全回復、HP+30回復。秘伝の醤油豚骨スープが染み渡る！',
              icon: '🍜',
            },
            {
              id: 'RAMEN_SPECIAL',
              name: '極上チャーシュー特盛麺',
              price: 280,
              description: '満腹度+100%全快、HP全快、最大満腹度+5%上限拡張！ 渾身の一杯！',
              icon: '🍥',
            },
          ],
        };
      }

      // 秘伝のおでん屋台
      if (npc.npcData.foodPurchased) {
        return {
          npc,
          title: '秘伝のおでん屋台',
          message: '「へい、綺麗に平らげてくれて嬉しいよ！ お出汁で体も芯から温まったろ！ 気をつけてな！」',
          eventType: 'FOOD_STALL',
          alreadyDone: true,
        };
      }

      return {
        npc,
        title: '秘伝のおでん屋台',
        message: '「へい、らっしゃい！ 地下の冷気で冷えた体には秘伝の出汁が染みたおでんが一番よ！ 腹一杯食べていきな！」',
        eventType: 'FOOD_STALL',
        foodMenuList: [
          {
            id: 'ODEN_HOT',
            name: '熱々おでん盛り合わせ',
            price: 120,
            description: '満腹度+80%回復、HP+25回復。大根、たまご、牛すじ等の絶品盛り。',
            icon: '🍢',
          },
        ],
      };
    }

    return null;
  }

  /**
   * 物々交換を実行します。
   */
  public static executeTrade(
    player: PlayerState,
    npc: Monster,
    playerItemId: string
  ): { success: boolean; message: string } {
    if (!npc.npcData || npc.npcData.tradeCompleted) {
      return { success: false, message: '既に交換は完了している。' };
    }

    const itemIdx = player.inventory.findIndex((it) => it.id === playerItemId);
    if (itemIdx === -1) {
      return { success: false, message: '渡すアイテムが見つからない。' };
    }

    const givenItem = player.inventory[itemIdx];
    const receivedItem = npc.npcData.tradeOfferedItem!;

    // アイテム入れ替え
    player.inventory.splice(itemIdx, 1);
    player.inventory.push(receivedItem);
    npc.npcData.tradeCompleted = true;

    SoundSystem.getInstance().playLevelUp();

    return {
      success: true,
      message: `レオンとアイテムを交換した！ 【${givenItem.name}】を渡し、【${receivedItem.name}${receivedItem.upgradeLevel ? `+${receivedItem.upgradeLevel}` : ''}】を受け取った！`,
    };
  }

  /**
   * じゃんけん勝負を実行します。
   */
  public static playRPS(
    player: PlayerState,
    playerChoice: 'ROCK' | 'SCISSORS' | 'PAPER'
  ): { result: 'WIN' | 'LOSE' | 'DRAW'; sageChoice: 'ROCK' | 'SCISSORS' | 'PAPER'; message: string } {
    const choices: ('ROCK' | 'SCISSORS' | 'PAPER')[] = ['ROCK', 'SCISSORS', 'PAPER'];
    const sageChoice = choices[Math.floor(Math.random() * choices.length)];

    const handNames = {
      ROCK: 'グー',
      SCISSORS: 'チョキ',
      PAPER: 'パー',
    };

    if (playerChoice === sageChoice) {
      SoundSystem.getInstance().playMiss();
      return {
        result: 'DRAW',
        sageChoice,
        message: `あなた:【${handNames[playerChoice]}】 vs ガンジ:【${handNames[sageChoice]}】 ……あいこじゃ！ もう一勝負じゃ！`,
      };
    }

    const isWin =
      (playerChoice === 'ROCK' && sageChoice === 'SCISSORS') ||
      (playerChoice === 'SCISSORS' && sageChoice === 'PAPER') ||
      (playerChoice === 'PAPER' && sageChoice === 'ROCK');

    if (isWin) {
      // 道具枠拡張（+2枠、最大24枠まで）
      const prevCap = player.inventoryCapacity ?? 12;
      const newCap = Math.min(24, prevCap + 2);
      player.inventoryCapacity = newCap;

      SoundSystem.getInstance().playLevelUp();
      return {
        result: 'WIN',
        sageChoice,
        message: `あなた:【${handNames[playerChoice]}】 vs ガンジ:【${handNames[sageChoice]}】 見事勝利！！ ガンジ「参った！約束通り道具袋を広げて進ぜよう！」（持てる道具の最大枠が ${newCap} 個に拡張された！）`,
      };
    } else {
      // 敗北ペナルティ: 500G、足りなければ所持品1つ没収
      SoundSystem.getInstance().playPlayerHit();

      if ((player.gold ?? 0) >= 500) {
        player.gold -= 500;
        return {
          result: 'LOSE',
          sageChoice,
          message: `あなた:【${handNames[playerChoice]}】 vs ガンジ:【${handNames[sageChoice]}】 敗北…… ガンジ「カッカッカ！ 勝負の世界は厳しいのう！」（500G 巻き上げられた！）`,
        };
      } else {
        // アイテム1個没収
        if (player.inventory.length > 0) {
          const lostItem = player.inventory.pop()!;
          return {
            result: 'LOSE',
            sageChoice,
            message: `あなた:【${handNames[playerChoice]}】 vs ガンジ:【${handNames[sageChoice]}】 敗北…… ガンジ「金がないならコレをもらうぞ！」（所持品【${lostItem.name}】を没収された！）`,
          };
        } else {
          return {
            result: 'LOSE',
            sageChoice,
            message: `あなた:【${handNames[playerChoice]}】 vs ガンジ:【${handNames[sageChoice]}】 敗北…… ガンジ「金も道具も持っとらんのか！情けない奴じゃ！」`,
          };
        }
      }
    }
  }

  /**
   * 鍛冶屋バルカンによる武具鍛錬を実行します。
   */
  public static forgeEquipment(
    player: PlayerState,
    npc: Monster,
    target: 'WEAPON' | 'SHIELD'
  ): { success: boolean; message: string } {
    if (!npc.npcData || npc.npcData.hasForged) {
      return { success: false, message: '既に鍛錬は完了している。' };
    }

    const item = target === 'WEAPON' ? player.equippedWeapon : player.equippedShield;
    if (!item) {
      return { success: false, message: '鍛える対象を装備していない。' };
    }

    // 20%で大成功（+2）、80%で成功（+1）
    const isGreat = Math.random() < 0.2;
    const gain = isGreat ? 2 : 1;

    item.upgradeLevel = (item.upgradeLevel ?? 0) + gain;
    npc.npcData.hasForged = true;

    CombatSystem.updatePlayerStats(player);
    SoundSystem.getInstance().playLevelUp();

    return {
      success: true,
      message: isGreat
        ? `バルカン「ガハハ！ 会心の叩き具合だぜ！！」 【${item.name}】が奇跡の錬成で +${gain} 強化された！（現在 +${item.upgradeLevel}）`
        : `バルカン「トンテンカン！ ほらよ、見違える切れ味になったぜ！」 【${item.name}】が +${gain} 強化された！（現在 +${item.upgradeLevel}）`,
    };
  }

  /**
   * 妖精ピクシー（HEALING_FAIRY）のおせっかい回復処理を実行します。
   */
  public static processHealingFairyTurn(
    fairy: Monster,
    player: PlayerState,
    monsters: Monster[]
  ): string | null {
    const distToPlayer = Math.hypot(fairy.x - player.x, fairy.y - player.y);

    // プレイヤーが近く（距離2マス以内）にいれば確率65%でプレイヤーを大回復！
    if (distToPlayer <= 2.2 && Math.random() < 0.65) {
      const healAmount = 25;
      const prevHp = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      player.hunger = Math.min(player.maxHunger, player.hunger + 15);
      const actualHeal = player.hp - prevHp;

      SoundSystem.getInstance().playHeal();

      // さらに周囲の手負い敵モンスターもおせっかいに回復
      const wounded = monsters.find(
        (m) => m !== fairy && m.hp < m.maxHp && Math.hypot(m.x - fairy.x, m.y - fairy.y) <= 2.0
      );
      if (wounded) {
        wounded.hp = Math.min(wounded.maxHp, wounded.hp + 15);
        return `妖精ピクシー「元気を出して！」 優しい光で HPが${actualHeal}回復、お腹が満たされた！ だが【${wounded.name}】の傷まで一緒に癒やしてしまった！`;
      }

      return `妖精ピクシー「元気を出して！」 優しい光があなたを包み込み、HPが${actualHeal}回復、お腹が満たされた！(満腹度+15%)`;
    }

    return null;
  }

  /**
   * 屋台での料理注文・食事を実行します。
   * 所持金を引き落とし、満腹度やHPの回復、最大満腹度の拡張を行い、屋台SEを再生します。
   *
   * @param player - プレイヤー状態
   * @param npc - 屋台NPCモンスター
   * @param menuId - 注文する料理メニューID
   * @returns 注文結果成否および表示メッセージ
   */
  public static orderFood(
    player: PlayerState,
    npc: Monster,
    menuId: 'RAMEN_NORMAL' | 'RAMEN_SPECIAL' | 'WIFE_ONIGIRI' | 'ODEN_HOT'
  ): { success: boolean; message: string } {
    if (!npc.npcData) {
      return { success: false, message: '屋台データが存在しません。' };
    }
    if (npc.npcData.foodPurchased) {
      return { success: false, message: 'この階層の屋台では既に食事を済ませています。' };
    }

    const currentGold = player.gold ?? 0;

    if (menuId === 'RAMEN_NORMAL') {
      const price = 150;
      if (currentGold < price) {
        return {
          success: false,
          message: `金が足りない！（所持金: ${currentGold}G / 必要: ${price}G）`,
        };
      }
      player.gold = currentGold - price;
      player.hunger = player.maxHunger;
      player.hp = Math.min(player.maxHp, player.hp + 30);
      npc.npcData.foodPurchased = true;

      // チャルメラSE＆麺すすりSE再生
      const snd = SoundSystem.getInstance();
      snd.playCharumera();
      setTimeout(() => snd.playSlurp(), 600);

      return {
        success: true,
        message:
          '金さん「あじゃあうえっぇー！ へいお待ち！」 【マルキン特製ラーメン】を平らげた！ 濃厚な醤油豚骨スープが五臓六腑に染み渡り、満腹度が全快、HPが30回復した！',
      };
    }

    if (menuId === 'RAMEN_SPECIAL') {
      const price = 280;
      if (currentGold < price) {
        return {
          success: false,
          message: `金が足りない！（所持金: ${currentGold}G / 必要: ${price}G）`,
        };
      }
      player.gold = currentGold - price;
      player.hunger = player.maxHunger;
      player.hp = player.maxHp;
      player.maxHunger = Math.min(150, player.maxHunger + 5);
      npc.npcData.foodPurchased = true;

      // チャルメラSE＆麺すすりSE＆レベルアップSE再生
      const snd = SoundSystem.getInstance();
      snd.playCharumera();
      setTimeout(() => {
        snd.playSlurp();
        snd.playLevelUp();
      }, 700);

      return {
        success: true,
        message:
          '金さん「あじゃあうえっぇー！ 特盛チャーシューお待ち！」 【極上チャーシュー特盛麺】を豪快に完食！ 満腹度・HPが全回復し、胃袋が鍛えられて最大満腹度が5%アップした！',
      };
    }

    if (menuId === 'WIFE_ONIGIRI') {
      const price = 50;
      if (currentGold < price) {
        return {
          success: false,
          message: `金が足りない！（所持金: ${currentGold}G / 必要: ${price}G）`,
        };
      }
      player.gold = currentGold - price;
      player.hunger = Math.min(player.maxHunger, player.hunger + 40);
      player.hp = Math.min(player.maxHp, player.hp + 15);
      npc.npcData.foodPurchased = true;

      SoundSystem.getInstance().playSlurp();

      return {
        success: true,
        message:
          'おかみ「ほら、持ってきな！ お父ちゃんには内緒だよ！」 【おかみ特製・塩むすび】を食べた！ 満腹度が40%回復、HPが15回復した！',
      };
    }

    if (menuId === 'ODEN_HOT') {
      const price = 120;
      if (currentGold < price) {
        return {
          success: false,
          message: `金が足りない！（所持金: ${currentGold}G / 必要: ${price}G）`,
        };
      }
      player.gold = currentGold - price;
      player.hunger = Math.min(player.maxHunger, player.hunger + 80);
      player.hp = Math.min(player.maxHp, player.hp + 25);
      npc.npcData.foodPurchased = true;

      SoundSystem.getInstance().playSlurp();

      return {
        success: true,
        message:
          '店主「熱いから気をつけてな！」 【熱々おでん盛り合わせ】を食べた！ 秘伝の出汁が体に染み渡り、満腹度が80%回復、HPが25回復した！',
      };
    }

    return { success: false, message: '存在しないメニューです。' };
  }

  /**
   * ラーメン屋台マルキンの奥さんに懇願・話しかけを行います。
   * 会話回数を加算し、頑なな態度が軟化するセリフを返します。
   *
   * @param _player - プレイヤー状態
   * @param npc - 屋台NPCモンスター
   * @returns 対話結果メッセージ
   */
  public static talkWife(
    _player: PlayerState,
    npc: Monster
  ): { message: string } {
    if (!npc.npcData) {
      return { message: '……返事がない。' };
    }

    npc.npcData.wifeTalkCount = (npc.npcData.wifeTalkCount ?? 0) + 1;
    const count = npc.npcData.wifeTalkCount;

    if (count === 1) {
      return {
        message:
          'おかみ「しつこいねえ！ だからウチやってませんって言っただろ！ 暖簾下げてんのが見えないのかい！？ 早くお帰り！」',
      };
    } else {
      return {
        message:
          'おかみ「……ハァ、しょうがないねぇ。お腹空かせて行き倒れられちゃ寝覚めが悪いよ。お父ちゃんには内緒だよ？ そこにある残り物の『塩むすび』でいいなら持ってきな！」',
      };
    }
  }
}
