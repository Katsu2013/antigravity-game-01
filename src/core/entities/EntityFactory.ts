/**
 * @file EntityFactory.ts
 * @description モンスターおよびアイテムの生成・ステータス設定を担当するファクトリクラス。
 * 階層（Floor）に応じた強さのスケーリングや、各種アイテムのプロパティ定義を行います。
 */

import { BiomeType, Item, Monster, MonsterType } from '../types';

/**
 * モンスターおよびアイテムをインスタンス化する静的ファクトリクラス。
 */
export class EntityFactory {
  /** 一意なID発番用カウンタ */
  private static idCounter = 0;

  /**
   * 指定した階層、環境バイオーム、および座標に適合するモンスターを生成します。
   *
   * @param floor - 現在の地下階層番号
   * @param x - 初期配置X座標
   * @param y - 初期配置Y座標
   * @param biome - フロアの環境バイオーム（デフォルト: 'STONE'）
   * @returns 生成されたモンスターオブジェクト
   */
  public static createMonster(
    floor: number,
    x: number,
    y: number,
    biome: BiomeType = 'STONE'
  ): Monster {
    const id = `monster_${++this.idCounter}`;

    // バイオームと階層に基づく出現種族の重み付け抽選
    let type: MonsterType = 'SLIME';
    const roll = Math.random();

    if (biome === 'EARTH') {
      if (floor >= 8 && roll < 0.2) type = 'DRAGON';
      else if (roll < 0.45) type = 'GOLEM';
      else if (roll < 0.7) type = 'BAT';
      else if (roll < 0.85) type = 'GOBLIN';
      else type = 'SKELETON';
    } else if (biome === 'FOREST') {
      if (floor >= 8 && roll < 0.2) type = 'MAGE';
      else if (roll < 0.45) type = 'MANDRAGORA';
      else if (roll < 0.7) type = 'GHOST';
      else if (roll < 0.85) type = 'SLIME';
      else type = 'GOBLIN';
    } else if (biome === 'RIVER' || biome === 'LAKE') {
      if (floor >= 8 && roll < 0.2) type = 'DRAGON';
      else if (roll < 0.45) type = 'SAHAGIN';
      else if (roll < 0.7) type = 'BAT';
      else if (roll < 0.85) type = 'GHOST';
      else type = 'SLIME';
    } else if (biome === 'SNOW') {
      if (floor >= 8 && roll < 0.25) type = 'DRAGON';
      else if (roll < 0.35) type = 'GHOST';
      else if (roll < 0.6) type = 'BAT';
      else if (roll < 0.8) type = 'SKELETON';
      else type = 'GOLEM';
    } else if (biome === 'ICE') {
      if (floor >= 8 && roll < 0.3) type = 'DRAGON';
      else if (roll < 0.4) type = 'MAGE';
      else if (roll < 0.65) type = 'GHOST';
      else if (roll < 0.85) type = 'GOLEM';
      else type = 'BAT';
    } else {
      // STONE
      if (floor === 1) {
        type = roll < 0.6 ? 'SLIME' : roll < 0.85 ? 'GOBLIN' : 'BAT';
      } else if (floor <= 3) {
        if (roll < 0.3) type = 'SLIME';
        else if (roll < 0.6) type = 'GOBLIN';
        else if (roll < 0.85) type = 'BAT';
        else type = 'SKELETON';
      } else if (floor <= 6) {
        if (roll < 0.2) type = 'GOBLIN';
        else if (roll < 0.45) type = 'SKELETON';
        else if (roll < 0.7) type = 'BAT';
        else if (roll < 0.88) type = 'GHOST';
        else type = 'MAGE';
      } else {
        if (roll < 0.25) type = 'SKELETON';
        else if (roll < 0.5) type = 'MAGE';
        else if (roll < 0.75) type = 'GHOST';
        else type = 'DRAGON';
      }
    }

    // 階層スケーリング（深層ほど基本ステータス微増）
    const floorScale = 1 + (floor - 1) * 0.15;

    switch (type) {
      case 'SLIME':
        return {
          id,
          name: 'スライム',
          type: 'SLIME',
          x,
          y,
          hp: Math.round(8 * floorScale),
          maxHp: Math.round(8 * floorScale),
          atk: Math.round(3 * floorScale),
          def: 1,
          expValue: Math.round(4 * floorScale),
          symbol: 's',
          color: '#34d399',
        };

      case 'GOBLIN':
        return {
          id,
          name: 'ゴブリン',
          type: 'GOBLIN',
          x,
          y,
          hp: Math.round(14 * floorScale),
          maxHp: Math.round(14 * floorScale),
          atk: Math.round(5 * floorScale),
          def: 2,
          expValue: Math.round(8 * floorScale),
          symbol: 'g',
          color: '#f59e0b',
        };

      case 'SKELETON':
        return {
          id,
          name: 'スケルトン',
          type: 'SKELETON',
          x,
          y,
          hp: Math.round(20 * floorScale),
          maxHp: Math.round(20 * floorScale),
          atk: Math.round(8 * floorScale),
          def: 3,
          expValue: Math.round(15 * floorScale),
          symbol: 'k',
          color: '#e2e8f0',
        };

      case 'GOLEM':
        return {
          id,
          name: '岩石ゴーレム',
          type: 'GOLEM',
          x,
          y,
          hp: Math.round(26 * floorScale),
          maxHp: Math.round(26 * floorScale),
          atk: Math.round(7 * floorScale),
          def: 4,
          expValue: Math.round(18 * floorScale),
          symbol: 'G',
          color: '#a8a29e',
        };

      case 'MANDRAGORA':
        return {
          id,
          name: 'マンドラゴラ',
          type: 'MANDRAGORA',
          x,
          y,
          hp: Math.round(16 * floorScale),
          maxHp: Math.round(16 * floorScale),
          atk: Math.round(7 * floorScale),
          def: 2,
          expValue: Math.round(12 * floorScale),
          symbol: 'm',
          color: '#84cc16',
        };

      case 'SAHAGIN':
        return {
          id,
          name: 'サハギン戦士',
          type: 'SAHAGIN',
          x,
          y,
          hp: Math.round(20 * floorScale),
          maxHp: Math.round(20 * floorScale),
          atk: Math.round(6 * floorScale),
          def: 3,
          expValue: Math.round(15 * floorScale),
          symbol: 'w',
          color: '#06b6d4',
        };

      case 'BAT':
        return {
          id,
          name: '吸血コウモリ',
          type: 'BAT',
          x,
          y,
          hp: Math.round(11 * floorScale),
          maxHp: Math.round(11 * floorScale),
          atk: Math.round(4 * floorScale),
          def: 1,
          expValue: Math.round(7 * floorScale),
          symbol: 'b',
          color: '#c084fc',
        };

      case 'GHOST':
        return {
          id,
          name: '彷徨う亡霊',
          type: 'GHOST',
          x,
          y,
          hp: Math.round(18 * floorScale),
          maxHp: Math.round(18 * floorScale),
          atk: Math.round(6 * floorScale),
          def: 4,
          expValue: Math.round(16 * floorScale),
          symbol: 'u',
          color: '#67e8f9',
        };

      case 'MAGE':
        return {
          id,
          name: 'ダークメイジ',
          type: 'MAGE',
          x,
          y,
          hp: Math.round(22 * floorScale),
          maxHp: Math.round(22 * floorScale),
          atk: Math.round(9 * floorScale),
          def: 2,
          expValue: Math.round(22 * floorScale),
          symbol: 'M',
          color: '#a855f7',
        };

      case 'DRAGON':
        return {
          id,
          name: 'レッドドラゴン',
          type: 'DRAGON',
          x,
          y,
          hp: Math.round(42 * floorScale),
          maxHp: Math.round(42 * floorScale),
          atk: Math.round(13 * floorScale),
          def: 5,
          expValue: Math.round(45 * floorScale),
          symbol: 'D',
          color: '#ef4444',
        };
    }
  }

  /**
   * 指定した座標にランダムなアイテムを生成します。
   *
   * @param x - 初期配置X座標
   * @param y - 初期配置Y座標
   * @returns 生成されたアイテムオブジェクト
   */
  public static createRandomItem(x: number, y: number): Item {
    const id = `item_${++this.idCounter}`;
    const roll = Math.random();

    // 1. ポーション・回復・強化薬 (32%)
    if (roll < 0.16) {
      // 薬草
      return {
        id,
        name: '薬草',
        category: 'POTION',
        description: '飲むとHPが15回復する不思議な薬草。',
        value: 15,
        x,
        y,
        symbol: '!',
        color: '#10b981',
      };
    } else if (roll < 0.24) {
      // 特薬草
      return {
        id,
        name: '特薬草',
        category: 'POTION',
        description: '極めて純度の高い薬草。飲むとHPが35大幅回復する。',
        value: 35,
        x,
        y,
        symbol: '!',
        color: '#34d399',
      };
    } else if (roll < 0.28) {
      // 剛力の秘薬
      return {
        id,
        name: '剛力の秘薬',
        category: 'POTION',
        description: '飲むと永続的に基礎攻撃力が2上昇する神秘の霊薬。',
        value: 2,
        x,
        y,
        symbol: '!',
        color: '#f43f5e',
      };
    } else if (roll < 0.32) {
      // 力の種
      return {
        id,
        name: '力の種',
        category: 'POTION',
        description: '食べると永続的に最大HPが3、基礎攻撃力が1上昇する神秘の種。',
        value: 3,
        x,
        y,
        symbol: 'o',
        color: '#f97316',
      };
    }

    // 2. 食料（おにぎり・パン） (20%)
    else if (roll < 0.42) {
      // 特製おにぎり
      return {
        id,
        name: '特製おにぎり',
        category: 'FOOD',
        description: '海苔が巻かれた香ばしいおにぎり。食べると満腹度が35%回復する。',
        value: 35,
        x,
        y,
        symbol: '%',
        color: '#f8fafc',
      };
    } else if (roll < 0.52) {
      // 大きなパン
      return {
        id,
        name: '大きなパン',
        category: 'FOOD',
        description: 'ふっくらと焼き上げられた大きなパン。食べると満腹度が60%回復する。',
        value: 60,
        x,
        y,
        symbol: '%',
        color: '#fbbf24',
      };
    }

    // 3. 武器（5種） (20%)
    else if (roll < 0.58) {
      // 青銅の短剣
      return {
        id,
        name: '青銅の短剣',
        category: 'WEAPON',
        description: '取り回しの良い軽量な青銅短剣。攻撃力が2上昇する。',
        value: 2,
        x,
        y,
        symbol: '/',
        color: '#d97706',
      };
    } else if (roll < 0.64) {
      // 鉄の剣
      return {
        id,
        name: '鉄の剣',
        category: 'WEAPON',
        description: '鍛えられた片手剣。装備すると攻撃力が4上昇する。',
        value: 4,
        x,
        y,
        symbol: '/',
        color: '#38bdf8',
      };
    } else if (roll < 0.68) {
      // ミスリルの剣
      return {
        id,
        name: 'ミスリルの剣',
        category: 'WEAPON',
        description: '神聖な銀白の魔導剣。装備すると攻撃力が7大幅上昇する。',
        value: 7,
        x,
        y,
        symbol: '/',
        color: '#818cf8',
      };
    } else if (roll < 0.71) {
      // 炎の剣
      return {
        id,
        name: '炎の剣',
        category: 'WEAPON',
        description: '燃え盛る紅蓮の業火を纏う名剣。装備すると攻撃力が10急上昇する。',
        value: 10,
        x,
        y,
        symbol: '/',
        color: '#ef4444',
      };
    } else if (roll < 0.72) {
      // ルーンの剣
      return {
        id,
        name: 'ルーンの剣',
        category: 'WEAPON',
        description: '古代の呪文が刻まれた伝説の魔剣。装備すると攻撃力が12圧倒的上昇する。',
        value: 12,
        x,
        y,
        symbol: '/',
        color: '#c084fc',
      };
    }

    // 4. 盾（5種） (16%)
    else if (roll < 0.78) {
      // 木の盾
      return {
        id,
        name: '木の盾',
        category: 'SHIELD',
        description: '軽くて扱いやすい木製の丸盾。防御力が1上昇する。',
        value: 1,
        x,
        y,
        symbol: ')',
        color: '#b45309',
      };
    } else if (roll < 0.83) {
      // 青銅の盾
      return {
        id,
        name: '青銅の盾',
        category: 'SHIELD',
        description: '青銅で鍛造されたバックラー。装備すると防御力が2上昇する。',
        value: 2,
        x,
        y,
        symbol: ')',
        color: '#d97706',
      };
    } else if (roll < 0.86) {
      // 鋼の盾
      return {
        id,
        name: '鋼の盾',
        category: 'SHIELD',
        description: '頑丈な銀鋼の盾。装備すると防御力が4上昇する。',
        value: 4,
        x,
        y,
        symbol: ')',
        color: '#a78bfa',
      };
    } else if (roll < 0.875) {
      // 魔法の盾
      return {
        id,
        name: '魔法の盾',
        category: 'SHIELD',
        description: '蒼い魔導障壁を張る神秘の盾。装備すると防御力が6大幅上昇する。',
        value: 6,
        x,
        y,
        symbol: ')',
        color: '#38bdf8',
      };
    } else if (roll < 0.88) {
      // ドラゴンの盾
      return {
        id,
        name: 'ドラゴンの盾',
        category: 'SHIELD',
        description: '紅蓮の龍鱗で補強された大盾。装備すると防御力が8圧倒的上昇する。',
        value: 8,
        x,
        y,
        symbol: ')',
        color: '#f43f5e',
      };
    }

    // 5. 巻物（3種） (12%)
    else if (roll < 0.93) {
      // ワープの巻物
      return {
        id,
        name: 'ワープの巻物',
        category: 'SCROLL',
        description: '読むとフロア内の安全な部屋へ瞬時に瞬間移動する。',
        value: 1,
        x,
        y,
        symbol: '?',
        color: '#f472b6',
      };
    } else if (roll < 0.97) {
      // 雷の巻物
      return {
        id,
        name: '雷の巻物',
        category: 'SCROLL',
        description: '読むと部屋全体の敵に激しい稲妻が降り注ぎ、15の大ダメージを与える。',
        value: 15,
        x,
        y,
        symbol: '?',
        color: '#fbbf24',
      };
    } else {
      // あかりの巻物
      return {
        id,
        name: 'あかりの巻物',
        category: 'SCROLL',
        description: '読むとフロア全体のマップ構造と、すべての敵・アイテムの位置が完全に判明する。',
        value: 1,
        x,
        y,
        symbol: '?',
        color: '#38bdf8',
      };
    }
  }
}
