/**
 * @file CombatSystem.ts
 * @description プレイヤーとモンスター間の戦闘ダメージ計算、命中・撃破判定、経験値取得、レベルアップを管理するシステムクラス。
 */

import { Monster, PlayerState } from '../types';

/**
 * 戦闘アクションの結果情報を表すインターフェース。
 */
export interface CombatResult {
  /** 攻撃側エンティティの名称 */
  attackerName: string;
  /** 防御側エンティティの名称 */
  defenderName: string;
  /** 実際に与えた実効ダメージ値 */
  damage: number;
  /** 防御側が力尽きて撃破されたかどうか */
  isDefeated: boolean;
  /** 撃破に伴いレベルアップが発生したかどうか */
  didLevelUp?: boolean;
  /** 獲得した経験値量 */
  expGained?: number;
}

/**
 * 戦闘計算・ステータス更新を担当する静的システムクラス。
 */
export class CombatSystem {
  /**
   * 装備品（武器・盾）の補正値を考慮して、プレイヤーの総合ATKおよびDEFを再計算します。
   *
   * @param player - 更新対象のプレイヤーステータス
   */
  public static updatePlayerStats(player: PlayerState): void {
    let bonusAtk = 0;
    let bonusDef = 0;

    if (player.equippedWeapon) {
      bonusAtk += player.equippedWeapon.value;
    }

    if (player.equippedShield) {
      bonusDef += player.equippedShield.value;
    }

    player.atk = player.baseAtk + bonusAtk;
    player.def = player.baseDef + bonusDef;
  }

  /**
   * プレイヤーからモンスターへの近接攻撃を実行します。
   *
   * @param player - 攻撃側のプレイヤー
   * @param monster - 攻撃対象のモンスター
   * @returns 戦闘結果オブジェクト
   */
  public static playerAttack(player: PlayerState, monster: Monster): CombatResult {
    // ダメージ計算: ATK * (0.85 〜 1.15) - DEF
    const variance = 0.85 + Math.random() * 0.3;
    const rawDamage = player.atk * variance - monster.def;
    const damage = Math.max(1, Math.round(rawDamage));

    monster.hp = Math.max(0, monster.hp - damage);
    const isDefeated = monster.hp <= 0;
    let didLevelUp = false;
    let expGained = 0;

    if (isDefeated) {
      expGained = monster.expValue;
      player.exp += expGained;

      // レベルアップ判定
      while (player.exp >= player.nextExp) {
        didLevelUp = true;
        player.level += 1;
        player.maxHp += 5;
        player.hp = player.maxHp; // レベルアップで全快
        player.baseAtk += 2;
        player.baseDef += 1;
        player.nextExp = Math.round(player.nextExp * 1.8);
      }

      this.updatePlayerStats(player);
    }

    return {
      attackerName: 'あなた',
      defenderName: monster.name,
      damage,
      isDefeated,
      didLevelUp,
      expGained,
    };
  }

  /**
   * モンスターからプレイヤーへの近接攻撃を実行します。
   *
   * @param monster - 攻撃側のモンスター
   * @param player - 防御側のプレイヤー
   * @returns 戦闘結果オブジェクト
   */
  public static monsterAttack(monster: Monster, player: PlayerState): CombatResult {
    const variance = 0.85 + Math.random() * 0.3;
    const rawDamage = monster.atk * variance - player.def;
    const damage = Math.max(1, Math.round(rawDamage));

    player.hp = Math.max(0, player.hp - damage);
    const isDefeated = player.hp <= 0;

    if (isDefeated) {
      player.isAlive = false;
    }

    return {
      attackerName: monster.name,
      defenderName: 'あなた',
      damage,
      isDefeated,
    };
  }
}
