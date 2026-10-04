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
      if (roll < 0.45) type = 'GOLEM';
      else if (roll < 0.8) type = 'GOBLIN';
      else type = 'SKELETON';
    } else if (biome === 'FOREST') {
      if (roll < 0.5) type = 'MANDRAGORA';
      else if (roll < 0.8) type = 'SLIME';
      else type = 'GOBLIN';
    } else if (biome === 'RIVER' || biome === 'LAKE') {
      if (roll < 0.5) type = 'SAHAGIN';
      else if (roll < 0.8) type = 'SLIME';
      else type = 'SKELETON';
    } else {
      // STONE
      if (floor === 1) {
        type = roll < 0.8 ? 'SLIME' : 'GOBLIN';
      } else if (floor <= 3) {
        if (roll < 0.4) type = 'SLIME';
        else if (roll < 0.85) type = 'GOBLIN';
        else type = 'SKELETON';
      } else {
        if (roll < 0.2) type = 'SLIME';
        else if (roll < 0.55) type = 'GOBLIN';
        else type = 'SKELETON';
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

    if (roll < 0.22) {
      // 薬草 (22%)
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
    } else if (roll < 0.3) {
      // 特薬草 (8%)
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
    } else if (roll < 0.52) {
      // 大きなパン (22%)
      return {
        id,
        name: '大きなパン',
        category: 'FOOD',
        description: '食べると満腹度が50%回復する香ばしいパン。',
        value: 50,
        x,
        y,
        symbol: '%',
        color: '#fbbf24',
      };
    } else if (roll < 0.6) {
      // 力の種 (8%)
      return {
        id,
        name: '力の種',
        category: 'POTION',
        description: '食べると永久に最大HPが3、基礎攻撃力が1上昇する神秘の木の実。',
        value: 3,
        x,
        y,
        symbol: 'o',
        color: '#f97316',
      };
    } else if (roll < 0.72) {
      // 鉄の剣 (12%)
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
    } else if (roll < 0.8) {
      // ミスリルの剣 (8%)
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
    } else if (roll < 0.9) {
      // 鋼の盾 (10%)
      return {
        id,
        name: '鋼の盾',
        category: 'SHIELD',
        description: '頑丈な円盾。装備すると防御力が3上昇する。',
        value: 3,
        x,
        y,
        symbol: ')',
        color: '#a78bfa',
      };
    } else if (roll < 0.95) {
      // ドラゴンの盾 (5%)
      return {
        id,
        name: 'ドラゴンの盾',
        category: 'SHIELD',
        description: '紅蓮の龍鱗で補強された大盾。装備すると防御力が6上昇する。',
        value: 6,
        x,
        y,
        symbol: ')',
        color: '#f43f5e',
      };
    } else {
      // ワープの巻物 (5%)
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
    }
  }
}
