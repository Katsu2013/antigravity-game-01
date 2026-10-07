/**
 * @file EntityFactory.ts
 * @description モンスターおよびアイテムの生成・ステータス設定を担当するファクトリクラス。
 * 階層（Floor）に応じた強さのスケーリングや、各種アイテムのプロパティ定義を行います。
 */

import {
  BiomeType,
  Item,
  ItemCategory,
  Monster,
  MonsterType,
  Obstacle,
  ObstacleType,
} from '../types';

/**
 * モンスターおよびアイテムをインスタンス化する静的ファクトリクラス。
 */
export class EntityFactory {
  /**
   * 一意なエンティティID（monster_1, item_1等）を発番するための静的連番カウンタ。
   * - 想定値: 0以上の整数（オブジェクト生成ごとにインクリメント）
   * - 初期値: `0`
   */
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

    let monster: Monster;

    switch (type) {
      case 'MERCHANT':
        return this.createMerchant(x, y);

      case 'GUARD_DOG':
        return this.createGuardDog(x, y);

      case 'WANDERING_ADVENTURER':
        return this.createWanderingAdventurer(x, y, floor);

      case 'GAMBLER_SAGE':
        return this.createGamblerSage(x, y);

      case 'HEALING_FAIRY':
        return this.createHealingFairy(x, y);

      case 'TRAVELING_BLACKSMITH':
        return this.createTravelingBlacksmith(x, y);

      case 'ABYSS_LORD':
        return this.createAbyssLord(x, y);

      case 'SCOOTER_GUY':
        return this.createScooterGuy(x, y, x + 5, y + 5);

      case 'SLIME': {
        // メタルスライム（全階層で約 1.5% の極低確率出現: カチコチ高防御・大量経験値）
        if (Math.random() < 0.015) {
          monster = {
            id,
            name: 'メタルスライム',
            type: 'SLIME',
            variantId: 'metal_slime',
            x,
            y,
            hp: 4,
            maxHp: 4,
            atk: Math.round(4 * floorScale),
            def: 99,
            expValue: Math.round(150 * floorScale),
            symbol: 's',
            color: '#cbd5e1',
          };
          break;
        }
        // レッドスライム（6F以降、約 45% の確率で出現: 好戦的・攻撃力高め）
        if (floor >= 6 && Math.random() < 0.45) {
          monster = {
            id,
            name: 'レッドスライム',
            type: 'SLIME',
            variantId: 'red_slime',
            x,
            y,
            hp: Math.round(14 * floorScale),
            maxHp: Math.round(14 * floorScale),
            atk: Math.round(6 * floorScale),
            def: 2,
            expValue: Math.round(10 * floorScale),
            symbol: 's',
            color: '#ef4444',
          };
          break;
        }
        monster = {
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
        break;
      }

      case 'GOBLIN': {
        // ゴブリンシャーマン（26F以降、約 40% の確率で出現: 中距離魔法弾）
        if (floor >= 26 && Math.random() < 0.4) {
          monster = {
            id,
            name: 'ゴブリンシャーマン',
            type: 'GOBLIN',
            variantId: 'goblin_shaman',
            x,
            y,
            hp: Math.round(22 * floorScale),
            maxHp: Math.round(22 * floorScale),
            atk: Math.round(8 * floorScale),
            def: 2,
            expValue: Math.round(24 * floorScale),
            hasRangedAttack: true,
            rangedAttackType: 'magic',
            symbol: 'g',
            color: '#7c3aed',
          };
          break;
        }
        // ホブゴブリン（11F以降、約 50% の確率で出現: 高HP・強打）
        if (floor >= 11 && Math.random() < 0.5) {
          monster = {
            id,
            name: 'ホブゴブリン',
            type: 'GOBLIN',
            variantId: 'hobgoblin',
            x,
            y,
            hp: Math.round(26 * floorScale),
            maxHp: Math.round(26 * floorScale),
            atk: Math.round(9 * floorScale),
            def: 3,
            expValue: Math.round(18 * floorScale),
            hasBackBlindSpot: true,
            symbol: 'g',
            color: '#b45309',
          };
          break;
        }
        monster = {
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
          hasBackBlindSpot: true,
          symbol: 'g',
          color: '#f59e0b',
        };
        break;
      }

      case 'SKELETON': {
        // ブラッドスケルトン（31F以降、約 50% の確率で出現: 高火力）
        if (floor >= 31 && Math.random() < 0.5) {
          monster = {
            id,
            name: 'ブラッドスケルトン',
            type: 'SKELETON',
            variantId: 'blood_skeleton',
            x,
            y,
            hp: Math.round(36 * floorScale),
            maxHp: Math.round(36 * floorScale),
            atk: Math.round(14 * floorScale),
            def: 4,
            expValue: Math.round(32 * floorScale),
            symbol: 'k',
            color: '#dc2626',
          };
          break;
        }
        // ポイズンスケルトン（16F以降、約 50% の確率で出現: 毒骨）
        if (floor >= 16 && Math.random() < 0.5) {
          monster = {
            id,
            name: 'ポイズンスケルトン',
            type: 'SKELETON',
            variantId: 'poison_skeleton',
            x,
            y,
            hp: Math.round(26 * floorScale),
            maxHp: Math.round(26 * floorScale),
            atk: Math.round(9 * floorScale),
            def: 3,
            expValue: Math.round(22 * floorScale),
            symbol: 'k',
            color: '#10b981',
          };
          break;
        }
        monster = {
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
        break;
      }

      case 'GOLEM': {
        // マグマゴーレム（35F以降、約 50% の確率で出現: 溶岩熱打撃）
        if (floor >= 35 && Math.random() < 0.5) {
          monster = {
            id,
            name: 'マグマゴーレム',
            type: 'GOLEM',
            variantId: 'magma_golem',
            x,
            y,
            hp: Math.round(48 * floorScale),
            maxHp: Math.round(48 * floorScale),
            atk: Math.round(14 * floorScale),
            def: 6,
            expValue: Math.round(40 * floorScale),
            isSlow: true,
            symbol: 'G',
            color: '#dc2626',
          };
          break;
        }
        monster = {
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
          isSlow: true,
          symbol: 'G',
          color: '#a8a29e',
        };
        break;
      }

      case 'MANDRAGORA':
        monster = {
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
        break;

      case 'SAHAGIN':
        monster = {
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
        break;

      case 'BAT': {
        // カオスバット（18F以降、約 50% の確率で出現: 黄金羽・混乱超音波）
        if (floor >= 18 && Math.random() < 0.5) {
          monster = {
            id,
            name: 'カオスバット',
            type: 'BAT',
            variantId: 'chaos_bat',
            x,
            y,
            hp: Math.round(18 * floorScale),
            maxHp: Math.round(18 * floorScale),
            atk: Math.round(6 * floorScale),
            def: 2,
            expValue: Math.round(16 * floorScale),
            symbol: 'b',
            color: '#f59e0b',
          };
          break;
        }
        monster = {
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
        break;
      }

      case 'GHOST': {
        // 冥府のレイス（25F以降、約 50% の確率で出現: 死霊紫黒・高防御）
        if (floor >= 25 && Math.random() < 0.5) {
          monster = {
            id,
            name: '冥府のレイス',
            type: 'GHOST',
            variantId: 'wraith',
            x,
            y,
            hp: Math.round(28 * floorScale),
            maxHp: Math.round(28 * floorScale),
            atk: Math.round(10 * floorScale),
            def: 5,
            expValue: Math.round(26 * floorScale),
            symbol: 'u',
            color: '#a855f7',
          };
          break;
        }
        monster = {
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
        break;
      }

      case 'MAGE':
        monster = {
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
          hasRangedAttack: true,
          rangedAttackType: 'magic',
          symbol: 'M',
          color: '#a855f7',
        };
        break;

      case 'DRAGON': {
        // ブラックドラゴン（48F以降、約 30% の確率で出現: 漆黒の最凶覇者）
        if (floor >= 48 && Math.random() < 0.3) {
          monster = {
            id,
            name: 'ブラックドラゴン',
            type: 'DRAGON',
            variantId: 'black_dragon',
            x,
            y,
            hp: Math.round(75 * floorScale),
            maxHp: Math.round(75 * floorScale),
            atk: Math.round(20 * floorScale),
            def: 8,
            expValue: Math.round(90 * floorScale),
            hasRangedAttack: true,
            rangedAttackType: 'fire',
            symbol: 'D',
            color: '#0f172a',
          };
          break;
        }
        // ブルードラゴン（45F以降、約 40% の確率で出現: 蒼き冷気竜）
        if (floor >= 45 && Math.random() < 0.4) {
          monster = {
            id,
            name: 'ブルードラゴン',
            type: 'DRAGON',
            variantId: 'blue_dragon',
            x,
            y,
            hp: Math.round(55 * floorScale),
            maxHp: Math.round(55 * floorScale),
            atk: Math.round(16 * floorScale),
            def: 6,
            expValue: Math.round(60 * floorScale),
            hasRangedAttack: true,
            rangedAttackType: 'magic',
            symbol: 'D',
            color: '#2563eb',
          };
          break;
        }
        monster = {
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
          hasRangedAttack: true,
          rangedAttackType: 'fire',
          symbol: 'D',
          color: '#ef4444',
        };
        break;
      }

      case 'MIMIC':
        monster = {
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
          isDormant: true,
          symbol: 'T',
          color: '#d97706',
        };
        break;

      case 'ZOMBIE':
        monster = {
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
          isSlow: true,
          symbol: 'z',
          color: '#65a30d',
        };
        break;

      case 'IMP':
        monster = {
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
          hasRangedAttack: true,
          rangedAttackType: 'fire',
          hasBackBlindSpot: true,
          symbol: 'i',
          color: '#ec4899',
        };
        break;

      case 'MUMMY':
        monster = {
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
          isSlow: true,
          symbol: 'M',
          color: '#d4d4d8',
        };
        break;

      default:
        monster = {
          id,
          name: 'スライム',
          type: 'SLIME',
          x,
          y,
          hp: 6,
          maxHp: 6,
          atk: 2,
          def: 1,
          expValue: 3,
          symbol: 's',
          color: '#34d399',
        };
        break;
    }

    // 極稀（約 2.5%）でプレイヤーに攻撃せず仲良くしたがる友好仲間モンスターとして生成
    if (
      !monster.isShopkeeper &&
      !monster.isGuardDog &&
      !monster.isRareNpc &&
      monster.type !== 'ABYSS_LORD' &&
      Math.random() < 0.025
    ) {
      monster.isFriendly = true;
      monster.isCompanion = true;
      monster.companionAffection = 0;

      const friendlyPrefixes = ['人なつっこい', '心優しい', '甘えん坊な', 'おとなしい', '照れ屋な'];
      const prefix = friendlyPrefixes[Math.floor(Math.random() * friendlyPrefixes.length)];
      monster.name = `${prefix}${monster.name}`;

      if (monster.type === 'SLIME') {
        monster.variantId = 'friendly_slime';
        monster.color = '#f472b6';
      }
    }

    return monster;
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

    // 7階以上: 深層（強力な魔導士、岩石ゴーレム、古代ミイラ、そしてドラゴン降臨！）
    const dragonChance = floor >= 35 ? 0.38 : floor >= 20 ? 0.30 : floor >= 8 ? 0.22 : 0;
    if (roll < dragonChance) return 'DRAGON';

    const subRoll = dragonChance > 0 ? (roll - dragonChance) / (1 - dragonChance) : roll;
    switch (biome) {
      case 'MAGMA':
        if (subRoll < 0.4) return 'GOLEM';
        if (subRoll < 0.7) return 'MAGE';
        if (subRoll < 0.85) return 'MUMMY';
        return 'DRAGON';
      case 'TEMPLE':
      case 'ALTAR':
        if (subRoll < 0.35) return 'MAGE';
        if (subRoll < 0.65) return 'MUMMY';
        if (subRoll < 0.85) return 'GHOST';
        return 'GOLEM';
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
   * 指定した座標にランダムなアイテムを生成します（適正価格自動付与・階層に応じた未識別判定）。
   *
   * @param x - 初期配置X座標
   * @param y - 初期配置Y座標
   * @param floor - 現在の地下階層番号（未識別アイテム判定に使用、8F以降で未識別率上昇）
   * @returns 生成されたアイテムオブジェクト
   */
  public static createRandomItem(x: number, y: number, floor = 1): Item {
    const raw = this.createRawRandomItem(x, y);
    const item = this.assignItemPrices(raw);
    return this.applyIdentificationState(item, floor);
  }

  /**
   * ショップ（店）に並ぶ高品質な商品アイテムを生成します。
   *
   * @param x - 初期配置X座標
   * @param y - 初期配置Y座標
   * @param floor - 現在の地下階層番号
   * @returns 生成されたショップ陳列アイテム
   */
  public static createShopItem(x: number, y: number, floor = 1): Item {
    const raw = Math.random() < 0.20 ? this.createSynthesisPot(x, y) : this.createRawRandomItem(x, y);
    const item = this.assignItemPrices(raw);
    item.isShopItem = true;
    return this.applyIdentificationState(item, floor);
  }

  /**
   * 内部用: ランダムな基本アイテムデータを生成します。
   */
  private static createRawRandomItem(x: number, y: number): Item {
    const id = `item_${++this.idCounter}`;
    const roll = Math.random();

    // 1. ポーション・薬草・草類 (22%)
    if (roll < 0.05) {
      // 薬草
      return {
        id,
        name: '薬草',
        category: 'POTION',
        description: '飲むとHPが15回復する不思議な薬草。敵に投げ当てるとアンデッドにダメージを与える。',
        value: 15,
        x,
        y,
        symbol: '!',
        color: '#10b981',
      };
    } else if (roll < 0.09) {
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
    } else if (roll < 0.12) {
      // 弟切草
      return {
        id,
        name: '弟切草',
        category: 'POTION',
        description: '鮮烈な赤い草。飲むとHPが100超回復する。アンデッドに投げると大打撃を与える。',
        value: 100,
        x,
        y,
        symbol: '!',
        color: '#ef4444',
      };
    } else if (roll < 0.14) {
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
    } else if (roll < 0.16) {
      // 命の草
      return {
        id,
        name: '命の草',
        category: 'POTION',
        description: '生命力が湧き上がる薬草。最大HPが永続的に5上昇する。',
        value: 5,
        x,
        y,
        symbol: '!',
        color: '#10b981',
      };
    } else if (roll < 0.18) {
      // すばやさの草
      return {
        id,
        name: 'すばやさの草',
        category: 'POTION',
        description: '飲むと足が軽くなり、10ターンの間倍速で行動できる。',
        value: 10,
        x,
        y,
        symbol: '!',
        color: '#06b6d4',
      };
    } else if (roll < 0.20) {
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
    } else if (roll < 0.215) {
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
    } else if (roll < 0.22) {
      // 復活の草 (超レア)
      return {
        id,
        name: '復活の草',
        category: 'POTION',
        description: '倒れたとき奇跡を起こす聖なる草。所持しているだけで力尽きた瞬間にHP全快で復活する。',
        value: 999,
        x,
        y,
        symbol: '!',
        color: '#fbbf24',
      };
    }

    // 2. 食料（おにぎり・パン） (12%)
    else if (roll < 0.28) {
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
    } else if (roll < 0.32) {
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
    } else if (roll < 0.34) {
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

    // 3. 飛び道具・矢 (14%)
    else if (roll < 0.41) {
      // 木の矢 (5〜15本)
      const count = Math.floor(Math.random() * 11) + 5;
      return {
        id,
        name: '木の矢',
        category: 'ARROW',
        description: `真っ直ぐ飛ぶ木の矢。8方向に撃って離れた敵を攻撃する。床に落ちた矢は回収可能。`,
        value: 6,
        count,
        x,
        y,
        symbol: ')',
        color: '#b45309',
      };
    } else if (roll < 0.46) {
      // 鉄の矢 (4〜10本)
      const count = Math.floor(Math.random() * 7) + 4;
      return {
        id,
        name: '鉄の矢',
        category: 'ARROW',
        description: `鋭利な鋼鉄の矢。高い威力を誇り、離れた敵に大ダメージを与える。`,
        value: 10,
        count,
        x,
        y,
        symbol: ')',
        color: '#94a3b8',
      };
    } else if (roll < 0.48) {
      // 銀の矢 (3〜6本、全貫通！)
      const count = Math.floor(Math.random() * 4) + 3;
      return {
        id,
        name: '銀の矢',
        category: 'ARROW',
        description: `聖なる光を纏う銀の矢。直線上のすべてのモンスターを一直線に貫通して薙ぎ払う。`,
        value: 14,
        count,
        x,
        y,
        symbol: ')',
        color: '#38bdf8',
      };
    }

    // 4. 魔法の杖 (14%)
    else if (roll < 0.51) {
      // 吹き飛ばしの杖
      const charges = Math.floor(Math.random() * 3) + 4; // 4〜6回
      return {
        id,
        name: '吹き飛ばしの杖',
        category: 'STAFF',
        description: '振ると暴風魔法を放ち、直線の敵を5マス後方へ吹き飛ばす。壁に激突すると10ダメージ。',
        value: 5,
        charges,
        x,
        y,
        symbol: '-',
        color: '#10b981',
      };
    } else if (roll < 0.54) {
      // 場所替えの杖
      const charges = Math.floor(Math.random() * 3) + 4;
      return {
        id,
        name: '場所替えの杖',
        category: 'STAFF',
        description: '振ると空間転移光を放ち、命中したモンスターとプレイヤーの位置を入れ替える。',
        value: 1,
        charges,
        x,
        y,
        symbol: '-',
        color: '#818cf8',
      };
    } else if (roll < 0.57) {
      // かなしばりの杖
      const charges = Math.floor(Math.random() * 3) + 3; // 3〜5回
      return {
        id,
        name: 'かなしばりの杖',
        category: 'STAFF',
        description: '振ると麻痺雷を放ち、命中したモンスターを金縛り状態にして完全に行動不能にする。',
        value: 1,
        charges,
        x,
        y,
        symbol: '-',
        color: '#eab308',
      };
    } else if (roll < 0.59) {
      // 睡眠の杖
      const charges = Math.floor(Math.random() * 3) + 3;
      return {
        id,
        name: '睡眠の杖',
        category: 'STAFF',
        description: '振ると催眠波を放ち、命中したモンスターを数ターン深い眠りに落とす。',
        value: 5,
        charges,
        x,
        y,
        symbol: '-',
        color: '#a855f7',
      };
    } else if (roll < 0.605) {
      // 封印の杖
      const charges = Math.floor(Math.random() * 3) + 3;
      return {
        id,
        name: '封印の杖',
        category: 'STAFF',
        description: '振ると呪封光を放ち、モンスターの特殊能力や分裂・遠距離攻撃を完全に封じ込める。',
        value: 1,
        charges,
        x,
        y,
        symbol: '-',
        color: '#ef4444',
      };
    } else if (roll < 0.62) {
      // 雷鳴の杖
      const charges = Math.floor(Math.random() * 3) + 3;
      return {
        id,
        name: '雷鳴の杖',
        category: 'STAFF',
        description: '振ると激しい電撃ビームを放ち、命中した敵に固定25の大ダメージを与える。',
        value: 25,
        charges,
        x,
        y,
        symbol: '-',
        color: '#facc15',
      };
    }

    // 5. 腕輪 (5%)
    else if (roll < 0.64) {
      // ちからの腕輪
      return {
        id,
        name: 'ちからの腕輪',
        category: 'TALISMAN',
        description: '身につけると筋力が強化され、攻撃力が3上昇する黄金の腕輪。',
        value: 3,
        x,
        y,
        symbol: '=',
        color: '#f59e0b',
      };
    } else if (roll < 0.655) {
      // 遠見の腕輪
      return {
        id,
        name: '遠見の腕輪',
        category: 'TALISMAN',
        description: '身につけると洞察力が高まり、視界の広さと敵の察知能力が向上する神秘の腕輪。',
        value: 1,
        x,
        y,
        symbol: '=',
        color: '#06b6d4',
      };
    } else if (roll < 0.67) {
      // すり抜けの腕輪
      return {
        id,
        name: 'すり抜けの腕輪',
        category: 'TALISMAN',
        description: '身につけると身体が霊体化し、障害物や敵のすり抜け回避率が高まる幻の腕輪。',
        value: 1,
        x,
        y,
        symbol: '=',
        color: '#c084fc',
      };
    }

    // 6. 武器（9種、ランダム+1値ボーナスあり） (13%)
    else if (roll < 0.70) {
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
    } else if (roll < 0.73) {
      // 鉄の剣
      const up = Math.random() < 0.25 ? 1 : 0;
      return {
        id,
        name: '鉄の剣',
        category: 'WEAPON',
        description: '鍛えられた片手剣。装備すると攻撃力が4上昇する。',
        value: 4,
        upgradeLevel: up,
        x,
        y,
        symbol: '/',
        color: '#38bdf8',
      };
    } else if (roll < 0.75) {
      // ミスリルの剣
      const up = Math.random() < 0.2 ? 1 : 0;
      return {
        id,
        name: 'ミスリルの剣',
        category: 'WEAPON',
        description: '神聖な銀白の魔導剣。装備すると攻撃力が7大幅上昇する。',
        value: 7,
        upgradeLevel: up,
        x,
        y,
        symbol: '/',
        color: '#818cf8',
      };
    } else if (roll < 0.765) {
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
    } else if (roll < 0.775) {
      // ドラゴンキラー
      return {
        id,
        name: 'ドラゴンキラー',
        category: 'WEAPON',
        description: '龍の堅い鱗を断ち切る特効大剣。ドラゴン種族に対して2倍の破滅的ダメージを与える。',
        value: 9,
        runes: ['DRAGON'],
        x,
        y,
        symbol: '/',
        color: '#ea580c',
      };
    } else if (roll < 0.785) {
      // 炎の剣
      return {
        id,
        name: '炎の剣',
        category: 'WEAPON',
        description: '燃え盛る紅蓮の業火を纏う名剣。装備すると攻撃力が10急上昇する。',
        value: 10,
        runes: ['FIRE'],
        x,
        y,
        symbol: '/',
        color: '#ef4444',
      };
    } else if (roll < 0.792) {
      // ホーリーランス
      return {
        id,
        name: 'ホーリーランス',
        category: 'WEAPON',
        description: '聖なる天光を宿した聖槍。装備すると攻撃力が11大幅上昇する。',
        value: 11,
        runes: ['HOLY'],
        x,
        y,
        symbol: '/',
        color: '#fef08a',
      };
    } else if (roll < 0.797) {
      // ルーンの剣
      return {
        id,
        name: 'ルーンの剣',
        category: 'WEAPON',
        description: '古代の呪文が刻まれた伝説の魔剣。装備すると攻撃力が12圧倒的上昇する。',
        value: 12,
        runes: ['DOUBLE'],
        x,
        y,
        symbol: '/',
        color: '#c084fc',
      };
    } else if (roll < 0.80) {
      // 妖刀ムラマサ
      return {
        id,
        name: '妖刀ムラマサ',
        category: 'WEAPON',
        description: '血を求めて怪しい紅光を放つ伝説の妖刀。装備すると攻撃力が15究極上昇する。',
        value: 15,
        runes: ['CRITICAL'],
        x,
        y,
        symbol: '/',
        color: '#dc2626',
      };
    }

    // 7. 盾（8種、ランダム+1値ボーナスあり） (9%)
    else if (roll < 0.825) {
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
    } else if (roll < 0.845) {
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
      // 風の盾
      return {
        id,
        name: '風の盾',
        category: 'SHIELD',
        description: '翠嵐の風を纏った軽装盾。装備すると防御力が3上昇する。',
        value: 3,
        runes: ['EVASION'],
        x,
        y,
        symbol: ')',
        color: '#10b981',
      };
    } else if (roll < 0.87) {
      // 鋼の盾
      const up = Math.random() < 0.25 ? 1 : 0;
      return {
        id,
        name: '鋼の盾',
        category: 'SHIELD',
        description: '頑丈な銀鋼の盾。装備すると防御力が4上昇する。',
        value: 4,
        upgradeLevel: up,
        x,
        y,
        symbol: ')',
        color: '#a78bfa',
      };
    } else if (roll < 0.878) {
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
    } else if (roll < 0.884) {
      // 魔法の盾
      return {
        id,
        name: '魔法の盾',
        category: 'SHIELD',
        description: '蒼い魔導障壁を張る神秘の盾。装備すると防御力が6大幅上昇する。',
        value: 6,
        runes: ['MAGIC_RESIST'],
        x,
        y,
        symbol: ')',
        color: '#38bdf8',
      };
    } else if (roll < 0.887) {
      // ドラゴンの盾
      return {
        id,
        name: 'ドラゴンの盾',
        category: 'SHIELD',
        description: '紅蓮の龍鱗で補強された大盾。装備すると防御力が8圧倒的上昇する。',
        value: 8,
        runes: ['DRAGON_RESIST'],
        x,
        y,
        symbol: ')',
        color: '#f43f5e',
      };
    } else if (roll < 0.89) {
      // イージスの盾
      return {
        id,
        name: 'イージスの盾',
        category: 'SHIELD',
        description: 'あらゆる厄災を退ける神話の神盾。装備すると防御力が10究極上昇する。',
        value: 10,
        runes: ['DEFENSE_UP'],
        x,
        y,
        symbol: ')',
        color: '#f59e0b',
      };
    }

    // 8. 巻物（8種） (11%)
    else if (roll < 0.91) {
      // 天の恵みの巻物
      return {
        id,
        name: '天の恵みの巻物',
        category: 'SCROLL',
        description: '読むと装備中の武器を鍛錬強化し、攻撃力を永続的に+1引き上げる神聖な巻物。',
        value: 1,
        x,
        y,
        symbol: '?',
        color: '#facc15',
      };
    } else if (roll < 0.93) {
      // 地の恵みの巻物
      return {
        id,
        name: '地の恵みの巻物',
        category: 'SCROLL',
        description: '読むと装備中の盾を堅牢に鍛錬し、防御力を永続的に+1引き上げる大地の巻物。',
        value: 1,
        x,
        y,
        symbol: '?',
        color: '#38bdf8',
      };
    } else if (roll < 0.945) {
      // 真空斬りの巻物
      return {
        id,
        name: '真空斬りの巻物',
        category: 'SCROLL',
        description: '読むと鋭い真空の刃が旋回し、部屋内のすべての敵に20の大ダメージを与える。',
        value: 20,
        x,
        y,
        symbol: '?',
        color: '#34d399',
      };
    } else if (roll < 0.96) {
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
    } else if (roll < 0.975) {
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
    } else if (roll < 0.985) {
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
    } else if (roll < 0.990) {
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
    } else if (roll < 0.994) {
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
    } else if (roll < 0.998) {
      // 識別の巻物
      return this.createIdentifyScroll(x, y);
    } else {
      // 合成の壺（武具の合算強化・印継承）
      return this.createSynthesisPot(x, y);
    }
  }

  /**
   * 識別の巻物アイテムを新規生成します。
   *
   * @param x 初期配置X座標
   * @param y 初期配置Y座標
   * @returns 生成された識別の巻物アイテム
   */
  public static createIdentifyScroll(x: number, y: number): Item {
    const id = `item_${++this.idCounter}`;
    return {
      id,
      name: '識別の巻物',
      category: 'SCROLL',
      description: '読むと所持品の中から1つのアイテムを選んで真の正体を看破・鑑定する魔導の巻物。',
      value: 1,
      specialEffect: 'IDENTIFY',
      x,
      y,
      symbol: '?',
      color: '#c084fc',
      isIdentified: true,
    };
  }

  /**
   * 階層およびアイテムカテゴリに応じて未識別状態を判定・適用します。
   * 第8層以降では草・杖・巻物が約70%の確率で未識別（仮名表示）として生成されます。
   *
   * @param item 対象アイテム
   * @param floor 現在の地下階層番号
   * @returns 未識別プロパティが付与されたアイテム
   */
  public static applyIdentificationState(item: Item, floor: number): Item {
    // 既に識別フラグが明示されている場合
    if (item.isIdentified !== undefined) {
      return item;
    }

    // 序盤階層（1〜7F）または武具・矢・食料・壺・ゴールドは初期から識別済み
    if (floor < 8 || !['POTION', 'STAFF', 'SCROLL'].includes(item.category)) {
      item.isIdentified = true;
      return item;
    }

    // 8F以降の草・杖・巻物は70%の確率で未識別
    if (Math.random() < 0.70) {
      item.isIdentified = false;
      item.unidentifiedName = this.getUnidentifiedName(item.name, item.category);
    } else {
      item.isIdentified = true;
    }

    return item;
  }

  /**
   * アイテムの正規名称およびカテゴリに対応する未識別の仮名称を取得します。
   *
   * @param realName アイテムの正規名称
   * @param category アイテムのカテゴリ分類
   * @returns 風情ある未識別の仮名称
   */
  public static getUnidentifiedName(realName: string, category: ItemCategory): string {
    const nameMap: Record<string, string> = {
      // 草・ポーション
      '薬草': 'あかい草',
      '特薬草': 'きいろい草',
      '弟切草': 'べにいろの草',
      'どくけし草': 'みどりの草',
      '命の草': 'わかくさ色の草',
      'すばやさの草': 'あおい草',
      '力の種': 'ちゃいろの種',
      '復活の草': 'きんいろの草',
      // 魔法の杖
      '吹き飛ばしの杖': 'くねくねした杖',
      '場所替えの杖': 'ねじれた杖',
      'かなしばりの杖': 'ぎざぎざの杖',
      '睡眠の杖': 'みじかい杖',
      '封印の杖': 'こくたんの杖',
      '雷鳴の杖': 'ガラスの杖',
      // 巻物
      '天の恵みの巻物': 'アギの巻物',
      '地の恵みの巻物': 'ポロンの巻物',
      '真空斬りの巻物': 'ルーンの巻物',
      'ワープの巻物': 'シエルの巻物',
      '雷の巻物': 'バルドの巻物',
      '睡眠の巻物': 'ミルルの巻物',
      '混乱の巻物': 'ザクの巻物',
      'あかりの巻物': 'ネルの巻物',
      '識別の巻物': 'ヒスイの巻物',
    };

    if (nameMap[realName]) {
      return nameMap[realName];
    }

    switch (category) {
      case 'POTION':
        return 'なぞの草';
      case 'STAFF':
        return 'ふしぎな杖';
      case 'SCROLL':
        return '古びた巻物';
      default:
        return '未識別の品';
    }
  }

  /**
   * アイテムのカテゴリ、効果値、強化値等に基づいて適正な買値・売値を自動算定・付与します。
   */
  public static assignItemPrices(item: Item): Item {
    let basePrice = 100;
    const name = item.name;

    if (item.category === 'POTION') {
      if (name.includes('復活')) basePrice = 1500;
      else if (name.includes('剛力')) basePrice = 600;
      else if (name.includes('命の草')) basePrice = 500;
      else if (name.includes('すばやさ')) basePrice = 400;
      else if (name.includes('力の種')) basePrice = 350;
      else if (name.includes('弟切草')) basePrice = 300;
      else if (name.includes('特薬草')) basePrice = 150;
      else if (name.includes('どくけし')) basePrice = 60;
      else basePrice = 50; // 薬草
    } else if (item.category === 'FOOD') {
      if (name.includes('巨大なおにぎり')) basePrice = 250;
      else if (name.includes('パン')) basePrice = 120;
      else basePrice = 100; // 特製おにぎり
    } else if (item.category === 'WEAPON') {
      if (name.includes('ムラマサ')) basePrice = 2000;
      else if (name.includes('ホーリーランス')) basePrice = 1500;
      else if (name.includes('ルーン')) basePrice = 1200;
      else if (name.includes('ドラゴンキラー')) basePrice = 1400;
      else if (name.includes('炎')) basePrice = 1000;
      else if (name.includes('ウォーハンマー')) basePrice = 800;
      else if (name.includes('ミスリル')) basePrice = 600;
      else if (name.includes('短剣')) basePrice = 150;
      else basePrice = 250; // 鉄の剣
      if (item.upgradeLevel) {
        basePrice += item.upgradeLevel * 200;
      }
    } else if (item.category === 'SHIELD') {
      if (name.includes('イージス')) basePrice = 2500;
      else if (name.includes('ドラゴン')) basePrice = 1500;
      else if (name.includes('魔法')) basePrice = 900;
      else if (name.includes('タワー')) basePrice = 700;
      else if (name.includes('風')) basePrice = 500;
      else if (name.includes('青銅')) basePrice = 300;
      else if (name.includes('木')) basePrice = 150;
      else basePrice = 350;
      if (item.upgradeLevel) {
        basePrice += item.upgradeLevel * 200;
      }
    } else if (item.category === 'TALISMAN') {
      if (name.includes('すり抜け')) basePrice = 3000;
      else if (name.includes('遠見')) basePrice = 2000;
      else if (name.includes('ちから')) basePrice = 1500;
      else basePrice = 1500;
    } else if (item.category === 'STAFF') {
      const charge = item.charges ?? 5;
      if (name.includes('かなしばり')) basePrice = 500 + charge * 80;
      else if (name.includes('雷鳴')) basePrice = 400 + charge * 60;
      else if (name.includes('場所替え')) basePrice = 400 + charge * 60;
      else basePrice = 300 + charge * 50; // 吹き飛ばし
    } else if (item.category === 'ARROW') {
      const count = item.count ?? 10;
      if (name.includes('銀の矢')) basePrice = count * 35;
      else if (name.includes('鉄の矢')) basePrice = count * 15;
      else basePrice = count * 6; // 木の矢
    } else if (item.category === 'SCROLL') {
      if (name.includes('天の恵み') || name.includes('地の恵み')) basePrice = 600;
      else if (name.includes('真空斬り')) basePrice = 400;
      else if (name.includes('雷')) basePrice = 300;
      else if (name.includes('混乱') || name.includes('睡眠')) basePrice = 250;
      else if (name.includes('あかり')) basePrice = 150;
      else basePrice = 100; // ワープ
    } else if (item.category === 'POT') {
      basePrice = 2500;
    }

    item.price = basePrice;
    item.sellPrice = Math.max(10, Math.floor(basePrice * 0.5));
    return item;
  }

  /**
   * 指定した階層と座標に床落ちゴールド（金貨の山）を生成します。
   */
  public static createGoldPile(floor: number, x: number, y: number): Item {
    const id = `gold_${++this.idCounter}`;
    const amount = Math.floor(60 + floor * 45 + Math.random() * 40);
    return {
      id,
      name: `${amount}ゴールド`,
      category: 'GOLD',
      description: `床に散らばる黄金の金貨。拾うと所持金が ${amount}G 増加する。`,
      value: amount,
      price: amount,
      sellPrice: amount,
      x,
      y,
      symbol: '$',
      color: '#fbbf24',
    };
  }

  /**
   * 店主（多種多様な商人たち）を生成します（平時は中立NPC・話しかけると買い物や会話が可能）。
   */
  public static createMerchant(
    x: number,
    y: number,
    profile?: { id: string; name: string; color: string }
  ): Monster {
    const id = `merchant_${++this.idCounter}`;
    const profId = profile?.id ?? 'NERO';
    const name = profile?.name ?? '商人ネロ';
    const color = profile?.color ?? '#fbbf24';

    return {
      id,
      name,
      type: 'MERCHANT',
      x,
      y,
      hp: 300,
      maxHp: 300,
      atk: 60,
      def: 25,
      expValue: 600,
      isFriendly: true,
      isShopkeeper: true,
      shopkeeperProfileId: profId,
      symbol: 'M',
      color,
    };
  }

  /**
   * スクーターおじさんを生成します（脈絡なくダンジョンを疾走・通過する謎のオジサン）。
   */
  public static createScooterGuy(
    x: number,
    y: number,
    targetX: number,
    targetY: number
  ): Monster {
    const id = `scooter_guy_${++this.idCounter}`;
    return {
      id,
      name: 'スクーターおじさん',
      type: 'SCOOTER_GUY',
      x,
      y,
      hp: 999,
      maxHp: 999,
      atk: 0,
      def: 99,
      expValue: 0,
      isFriendly: true,
      symbol: '🛵',
      color: '#ef4444',
      scooterData: {
        targetX,
        targetY,
        despawnTurns: 45,
        engineSoundTimer: 0,
      },
    };
  }

  /**
   * 泥棒発生時に召喚される俊敏な番犬・警備隊を生成します。
   */
  public static createGuardDog(x: number, y: number): Monster {
    const id = `guard_dog_${++this.idCounter}`;
    return {
      id,
      name: '番犬',
      type: 'GUARD_DOG',
      x,
      y,
      hp: 55,
      maxHp: 55,
      atk: 22,
      def: 8,
      expValue: 60,
      isGuardDog: true,
      symbol: 'd',
      color: '#dc2626',
    };
  }

  /**
   * さすらいの冒険者レオン（物々交換の旅人）を生成します。
   */
  public static createWanderingAdventurer(x: number, y: number, floor: number): Monster {
    const id = `adventurer_${++this.idCounter}`;
    const categories: { cat: import('../types').ItemCategory; label: string }[] = [
      { cat: 'WEAPON', label: '剣・武器' },
      { cat: 'SHIELD', label: '盾・防具' },
      { cat: 'POTION', label: '薬草・ポーション' },
      { cat: 'SCROLL', label: '巻物' },
      { cat: 'FOOD', label: '食料・おにぎり' },
    ];
    const picked = categories[Math.floor(Math.random() * categories.length)];

    // 提供するレアアイテム（階層に応じて強化値付与）
    const offered = this.createRandomItem(x, y);
    if (offered.category === 'WEAPON' || offered.category === 'SHIELD') {
      const bonus = floor >= 20 ? 3 : floor >= 10 ? 2 : 1;
      offered.upgradeLevel = (offered.upgradeLevel ?? 0) + bonus;
    }

    return {
      id,
      name: '冒険者レオン',
      type: 'WANDERING_ADVENTURER',
      x,
      y,
      hp: 150,
      maxHp: 150,
      atk: 28,
      def: 15,
      expValue: 200,
      isFriendly: true,
      isRareNpc: true,
      npcData: {
        tradeWantCategory: picked.cat,
        tradeWantCategoryName: picked.label,
        tradeOfferedItem: offered,
        tradeCompleted: false,
      },
      symbol: 'A',
      color: '#3b82f6',
    };
  }

  /**
   * 賭博仙人ガンジ（じゃんけん大勝負）を生成します。
   */
  public static createGamblerSage(x: number, y: number): Monster {
    const id = `gambler_${++this.idCounter}`;
    return {
      id,
      name: '賭博仙人ガンジ',
      type: 'GAMBLER_SAGE',
      x,
      y,
      hp: 200,
      maxHp: 200,
      atk: 35,
      def: 20,
      expValue: 300,
      isFriendly: true,
      isRareNpc: true,
      npcData: {
        rpsStreak: 0,
      },
      symbol: 'G',
      color: '#a855f7',
    };
  }

  /**
   * 慈愛の妖精ピクシー（敵なのに回復してくれるおせっかいモンスター）を生成します。
   */
  public static createHealingFairy(x: number, y: number): Monster {
    const id = `fairy_${++this.idCounter}`;
    return {
      id,
      name: '妖精ピクシー',
      type: 'HEALING_FAIRY',
      x,
      y,
      hp: 30,
      maxHp: 30,
      atk: 1,
      def: 5,
      expValue: 50,
      isFriendly: true, // プレイヤーを攻撃しない
      symbol: 'f',
      color: '#10b981',
    };
  }

  /**
   * さすらいの鍛冶職人バルカン（武具の無料鍛錬）を生成します。
   */
  public static createTravelingBlacksmith(x: number, y: number): Monster {
    const id = `blacksmith_${++this.idCounter}`;
    return {
      id,
      name: '鍛冶屋バルカン',
      type: 'TRAVELING_BLACKSMITH',
      x,
      y,
      hp: 250,
      maxHp: 250,
      atk: 40,
      def: 30,
      expValue: 400,
      isFriendly: true,
      isRareNpc: true,
      npcData: {
        hasForged: false,
      },
      symbol: 'B',
      color: '#f97316',
    };
  }

  /**
   * 第50層最深部ボス『奈落の魔王アビス・ロード』を生成します。
   */
  public static createAbyssLord(x: number, y: number): Monster {
    const id = `boss_abyss_${++this.idCounter}`;
    return {
      id,
      name: '奈落の魔王アビス・ロード',
      type: 'ABYSS_LORD',
      x,
      y,
      hp: 450,
      maxHp: 450,
      atk: 36,
      def: 18,
      expValue: 10000,
      hasRangedAttack: true,
      rangedAttackType: 'fire',
      symbol: 'Ω',
      color: '#c084fc',
    };
  }

  /**
   * 神秘の『合成の壺』（武器・盾の合成・強化値合算・印継承）を生成します。
   */
  public static createSynthesisPot(x: number, y: number): Item {
    const id = `pot_${++this.idCounter}`;
    return {
      id,
      name: '合成の壺',
      category: 'POT',
      description: '武具同士を融合させる神秘の壺。使うと2つの武器または盾を合成し、強化値を合算して特殊能力（印）を引き継ぐ。',
      value: 3,
      potCapacity: 3,
      x,
      y,
      symbol: 'U',
      color: '#06b6d4',
      price: 2500,
      sellPrice: 1200,
    };
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
