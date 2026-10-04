/**
 * @file EntityFactory.ts
 * @description モンスターおよびアイテムの生成・ステータス設定を担当するファクトリクラス。
 * 階層（Floor）に応じた強さのスケーリングや、各種アイテムのプロパティ定義を行います。
 */

import {
  BiomeType,
  Item,
  Monster,
  MonsterType,
  Obstacle,
  ObstacleType,
} from '../types';

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

    // バイオームと階層に基づく出現種族の重み付け抽選（序盤から理不尽な強敵が出現しないよう階層制限）
    const roll = Math.random();
    const type: MonsterType = this.chooseMonsterType(biome, floor, roll);

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

      case 'MIMIC':
        return {
          id,
          name: '人食い箱',
          type: 'MIMIC',
          x,
          y,
          hp: Math.round(24 * floorScale),
          maxHp: Math.round(24 * floorScale),
          atk: Math.round(8 * floorScale),
          def: 3,
          expValue: Math.round(20 * floorScale),
          symbol: 'T',
          color: '#d97706',
        };

      case 'ZOMBIE':
        return {
          id,
          name: '腐乱ゾンビ',
          type: 'ZOMBIE',
          x,
          y,
          hp: Math.round(20 * floorScale),
          maxHp: Math.round(20 * floorScale),
          atk: Math.round(5 * floorScale),
          def: 2,
          expValue: Math.round(11 * floorScale),
          symbol: 'z',
          color: '#65a30d',
        };

      case 'IMP':
        return {
          id,
          name: '小悪魔インプ',
          type: 'IMP',
          x,
          y,
          hp: Math.round(15 * floorScale),
          maxHp: Math.round(15 * floorScale),
          atk: Math.round(7 * floorScale),
          def: 2,
          expValue: Math.round(14 * floorScale),
          symbol: 'i',
          color: '#ec4899',
        };

      case 'MUMMY':
        return {
          id,
          name: '古代のミイラ',
          type: 'MUMMY',
          x,
          y,
          hp: Math.round(30 * floorScale),
          maxHp: Math.round(30 * floorScale),
          atk: Math.round(9 * floorScale),
          def: 4,
          expValue: Math.round(25 * floorScale),
          symbol: 'M',
          color: '#d4d4d8',
        };
    }
  }

  /**
   * フロアの階層（floor）および環境バイオームに基づいて、適切な難易度ティアのモンスター種族を決定します。
   * 1階では初心者が即死しないよう最弱級モンスターに限定し、深層へ進むにつれて段階的に強敵を解禁します。
   *
   * @param biome - フロアの環境バイオーム
   * @param floor - 地下階層番号
   * @param roll - 0.0〜1.0 のランダム抽選値
   * @returns 抽選されたモンスター種別
   */
  private static chooseMonsterType(
    biome: BiomeType,
    floor: number,
    roll: number
  ): MonsterType {
    // 1階: 初心者向け最弱級モンスター限定（スライム、コウモリ、ゴブリンなどHP6〜14の敵のみ）
    if (floor === 1) {
      if (biome === 'FOREST') {
        return roll < 0.45 ? 'SLIME' : roll < 0.75 ? 'BAT' : 'MANDRAGORA';
      } else if (biome === 'RIVER' || biome === 'LAKE' || biome === 'ISLAND') {
        return roll < 0.5 ? 'SLIME' : roll < 0.8 ? 'BAT' : 'GOBLIN';
      } else if (biome === 'SNOW' || biome === 'ICE') {
        return roll < 0.55 ? 'SLIME' : roll < 0.85 ? 'BAT' : 'GOBLIN';
      } else {
        return roll < 0.5 ? 'SLIME' : roll < 0.8 ? 'GOBLIN' : 'BAT';
      }
    }

    // 2〜3階: 序盤（スライム、コウモリ、ゴブリンを主軸に、バイオーム特色の初級〜中級が少量出現）
    if (floor <= 3) {
      switch (biome) {
        case 'EARTH':
        case 'STONE':
          if (roll < 0.3) return 'SLIME';
          if (roll < 0.55) return 'GOBLIN';
          if (roll < 0.75) return 'BAT';
          if (roll < 0.9) return 'SKELETON';
          return 'ZOMBIE';
        case 'FOREST':
          if (roll < 0.35) return 'SLIME';
          if (roll < 0.6) return 'MANDRAGORA';
          if (roll < 0.8) return 'GOBLIN';
          return 'IMP';
        case 'RIVER':
        case 'LAKE':
        case 'ISLAND':
          if (roll < 0.35) return 'SLIME';
          if (roll < 0.6) return 'BAT';
          if (roll < 0.8) return 'GOBLIN';
          return 'SAHAGIN';
        case 'SNOW':
        case 'ICE':
          if (roll < 0.35) return 'SLIME';
          if (roll < 0.6) return 'BAT';
          if (roll < 0.8) return 'GOBLIN';
          return 'SKELETON';
        case 'SWAMP':
        case 'TOXIC':
          if (roll < 0.35) return 'SLIME';
          if (roll < 0.6) return 'BAT';
          if (roll < 0.8) return 'ZOMBIE';
          return 'MANDRAGORA';
        case 'MECHA':
          if (roll < 0.35) return 'BAT';
          if (roll < 0.65) return 'GOBLIN';
          if (roll < 0.85) return 'IMP';
          return 'SKELETON';
      }
    }

    // 4〜6階: 中盤（スケルトン、ゾンビ、インプ、ゴースト、サハギンなどが主力。稀にゴーレムやメイジ、ミミック）
    if (floor <= 6) {
      switch (biome) {
        case 'EARTH':
          if (roll < 0.2) return 'GOBLIN';
          if (roll < 0.45) return 'SKELETON';
          if (roll < 0.65) return 'MUMMY';
          if (roll < 0.85) return 'BAT';
          return 'GOLEM';
        case 'FOREST':
          if (roll < 0.25) return 'MANDRAGORA';
          if (roll < 0.5) return 'IMP';
          if (roll < 0.7) return 'GHOST';
          if (roll < 0.85) return 'GOBLIN';
          return 'MAGE';
        case 'RIVER':
        case 'LAKE':
          if (roll < 0.35) return 'SAHAGIN';
          if (roll < 0.55) return 'BAT';
          if (roll < 0.75) return 'GHOST';
          if (roll < 0.9) return 'MIMIC';
          return 'MAGE';
        case 'SNOW':
        case 'ICE':
          if (roll < 0.3) return 'SKELETON';
          if (roll < 0.55) return 'GHOST';
          if (roll < 0.75) return 'IMP';
          if (roll < 0.9) return 'MIMIC';
          return 'GOLEM';
        case 'SWAMP':
        case 'TOXIC':
          if (roll < 0.3) return 'ZOMBIE';
          if (roll < 0.55) return 'SAHAGIN';
          if (roll < 0.75) return 'MANDRAGORA';
          if (roll < 0.9) return 'IMP';
          return 'MAGE';
        case 'MECHA':
          if (roll < 0.3) return 'SKELETON';
          if (roll < 0.55) return 'IMP';
          if (roll < 0.75) return 'GOLEM';
          if (roll < 0.9) return 'MIMIC';
          return 'MAGE';
        case 'ISLAND':
          if (roll < 0.35) return 'SAHAGIN';
          if (roll < 0.6) return 'BAT';
          if (roll < 0.8) return 'GHOST';
          if (roll < 0.92) return 'MIMIC';
          return 'GOBLIN';
        default: // STONE
          if (roll < 0.2) return 'GOBLIN';
          if (roll < 0.45) return 'SKELETON';
          if (roll < 0.65) return 'GHOST';
          if (roll < 0.8) return 'IMP';
          if (roll < 0.9) return 'MIMIC';
          return 'MAGE';
      }
    }

    // 7階以上: 深層（強力な魔導士、岩石ゴーレム、古代ミイラ、そして8階以上でドラゴン降臨！）
    const dragonChance = floor >= 8 ? 0.22 : 0;
    if (roll < dragonChance) return 'DRAGON';

    const subRoll = dragonChance > 0 ? (roll - dragonChance) / (1 - dragonChance) : roll;
    switch (biome) {
      case 'EARTH':
        if (subRoll < 0.35) return 'GOLEM';
        if (subRoll < 0.6) return 'MUMMY';
        if (subRoll < 0.8) return 'SKELETON';
        return 'MAGE';
      case 'FOREST':
        if (subRoll < 0.35) return 'MAGE';
        if (subRoll < 0.6) return 'GHOST';
        if (subRoll < 0.8) return 'MANDRAGORA';
        return 'MIMIC';
      case 'RIVER':
      case 'LAKE':
      case 'ISLAND':
        if (subRoll < 0.35) return 'SAHAGIN';
        if (subRoll < 0.6) return 'MAGE';
        if (subRoll < 0.8) return 'MIMIC';
        return 'GHOST';
      case 'SNOW':
      case 'ICE':
        if (subRoll < 0.35) return 'GOLEM';
        if (subRoll < 0.6) return 'MAGE';
        if (subRoll < 0.8) return 'GHOST';
        return 'MIMIC';
      case 'SWAMP':
      case 'TOXIC':
        if (subRoll < 0.35) return 'MAGE';
        if (subRoll < 0.6) return 'ZOMBIE';
        if (subRoll < 0.8) return 'MUMMY';
        return 'SAHAGIN';
      case 'MECHA':
        if (subRoll < 0.35) return 'GOLEM';
        if (subRoll < 0.6) return 'MAGE';
        if (subRoll < 0.8) return 'MIMIC';
        return 'SKELETON';
      default: // STONE
        if (subRoll < 0.3) return 'GOLEM';
        if (subRoll < 0.55) return 'MAGE';
        if (subRoll < 0.75) return 'MUMMY';
        if (subRoll < 0.9) return 'GHOST';
        return 'SKELETON';
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

    // 1. ポーション・回復・強化薬 (28%)
    if (roll < 0.10) {
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
    } else if (roll < 0.16) {
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
    } else if (roll < 0.20) {
      // どくけし草
      return {
        id,
        name: 'どくけし草',
        category: 'POTION',
        description: '体内の毒素を清め中和する薬草。HPを5回復し毒状態を解除する。',
        value: 5,
        x,
        y,
        symbol: '!',
        color: '#22c55e',
      };
    } else if (roll < 0.24) {
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
    } else if (roll < 0.26) {
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
    } else if (roll < 0.28) {
      // すばやさの種
      return {
        id,
        name: 'すばやさの種',
        category: 'POTION',
        description: '飲むと体が軽くなり、永続的に攻撃力+1、防御力+1が上昇する霊種。',
        value: 2,
        x,
        y,
        symbol: 'o',
        color: '#06b6d4',
      };
    }

    // 2. 食料（おにぎり・パン） (18%)
    else if (roll < 0.38) {
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
    } else if (roll < 0.44) {
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
    } else if (roll < 0.46) {
      // 巨大なおにぎり
      return {
        id,
        name: '巨大なおにぎり',
        category: 'FOOD',
        description: '米俵のような特大おにぎり。食べると満腹度が100%完全回復する。',
        value: 100,
        x,
        y,
        symbol: '%',
        color: '#ffffff',
      };
    }

    // 3. 武器（8種） (22%)
    else if (roll < 0.51) {
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
    } else if (roll < 0.56) {
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
    } else if (roll < 0.60) {
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
    } else if (roll < 0.63) {
      // ウォーハンマー
      return {
        id,
        name: 'ウォーハンマー',
        category: 'WEAPON',
        description: '重厚な鉄塊で鍛えられた戦槌。装備すると攻撃力が8上昇する。',
        value: 8,
        x,
        y,
        symbol: '/',
        color: '#eab308',
      };
    } else if (roll < 0.65) {
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
    } else if (roll < 0.665) {
      // ホーリーランス
      return {
        id,
        name: 'ホーリーランス',
        category: 'WEAPON',
        description: '聖なる天光を宿した聖槍。装備すると攻撃力が11大幅上昇する。',
        value: 11,
        x,
        y,
        symbol: '/',
        color: '#fef08a',
      };
    } else if (roll < 0.675) {
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
    } else if (roll < 0.68) {
      // 妖刀ムラマサ
      return {
        id,
        name: '妖刀ムラマサ',
        category: 'WEAPON',
        description: '血を求めて怪しい紅光を放つ伝説の妖刀。装備すると攻撃力が15究極上昇する。',
        value: 15,
        x,
        y,
        symbol: '/',
        color: '#dc2626',
      };
    }

    // 4. 盾（8種） (18%)
    else if (roll < 0.73) {
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
    } else if (roll < 0.77) {
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
    } else if (roll < 0.80) {
      // 風の盾
      return {
        id,
        name: '風の盾',
        category: 'SHIELD',
        description: '翠嵐の風を纏った軽装盾。装備すると防御力が3上昇する。',
        value: 3,
        x,
        y,
        symbol: ')',
        color: '#10b981',
      };
    } else if (roll < 0.825) {
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
    } else if (roll < 0.845) {
      // タワーシールド
      return {
        id,
        name: 'タワーシールド',
        category: 'SHIELD',
        description: '全身を強固に防護する大盾。装備すると防御力が5上昇する。',
        value: 5,
        x,
        y,
        symbol: ')',
        color: '#94a3b8',
      };
    } else if (roll < 0.855) {
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
    } else if (roll < 0.86) {
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
    } else if (roll < 0.865) {
      // イージスの盾
      return {
        id,
        name: 'イージスの盾',
        category: 'SHIELD',
        description: 'あらゆる厄災を退ける神話の神盾。装備すると防御力が10究極上昇する。',
        value: 10,
        x,
        y,
        symbol: ')',
        color: '#f59e0b',
      };
    }

    // 5. 巻物（5種） (13.5%)
    else if (roll < 0.90) {
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
    } else if (roll < 0.93) {
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
    } else if (roll < 0.955) {
      // 睡眠の巻物
      return {
        id,
        name: '睡眠の巻物',
        category: 'SCROLL',
        description: '読むとフロア内のすべての敵を深い眠りに誘い、数ターン無力化する。',
        value: 5,
        x,
        y,
        symbol: '?',
        color: '#818cf8',
      };
    } else if (roll < 0.975) {
      // 混乱の巻物
      return {
        id,
        name: '混乱の巻物',
        category: 'SCROLL',
        description: '読むと周囲のモンスターが錯乱し、数ターンの間デタラメな行動を取る。',
        value: 8,
        x,
        y,
        symbol: '?',
        color: '#f43f5e',
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

  /**
   * 指定した種類と座標のインタラクティブ障害物を生成します。
   *
   * @param type - 障害物の種別
   * @param x - 初期配置X座標
   * @param y - 初期配置Y座標
   * @returns 生成された障害物オブジェクト
   */
  public static createObstacle(type: ObstacleType, x: number, y: number): Obstacle {
    const id = `obstacle_${++this.idCounter}`;

    switch (type) {
      case 'DIRT_BLOCK':
        return {
          id,
          type,
          x,
          y,
          hp: 2,
          maxHp: 2,
          isDestructible: true,
          isPushable: false,
          isSliding: false,
          symbol: '#',
          color: '#92400e',
          name: '土の塊',
        };
      case 'TREE_STUMP':
        return {
          id,
          type,
          x,
          y,
          hp: 3,
          maxHp: 3,
          isDestructible: true,
          isPushable: false,
          isSliding: false,
          symbol: '%',
          color: '#15803d',
          name: '倒木',
        };
      case 'SNOW_MOUND':
        return {
          id,
          type,
          x,
          y,
          hp: 1,
          maxHp: 1,
          isDestructible: true,
          isPushable: false,
          isSliding: false,
          symbol: '*',
          color: '#e0f2fe',
          name: '雪の塊',
        };
      case 'PUSH_ROCK':
        return {
          id,
          type,
          x,
          y,
          hp: 999,
          maxHp: 999,
          isDestructible: false,
          isPushable: true,
          isSliding: false,
          symbol: 'O',
          color: '#64748b',
          name: '押せる大石',
        };
      case 'ICE_BLOCK':
        return {
          id,
          type,
          x,
          y,
          hp: 1,
          maxHp: 1,
          isDestructible: true,
          isPushable: true,
          isSliding: true,
          symbol: '◇',
          color: '#38bdf8',
          name: '滑る氷塊',
        };
    }
  }
}
