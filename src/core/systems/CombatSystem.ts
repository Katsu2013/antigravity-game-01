/**
 * @file CombatSystem.ts
 * @description プレイヤーとモンスター間の戦闘ダメージ計算、命中・撃破判定、経験値取得、レベルアップを管理するシステムクラス。
 */

import { Monster, PlayerState } from '../types';

/**
 * 戦闘アクションの結果情報を表すインターフェース。
 */
export interface CombatResult {
  /** 攻撃側エンティティの名称（例: 「プレイヤー」「レッドドラゴン」） */
  attackerName: string;
  /** 防御側エンティティの名称 */
  defenderName: string;
  /**
   * 実際に与えた実効ダメージ値。
   * - 想定値: 0以上の整数（回避時は0）
   */
  damage: number;
  /**
   * 防御側が力尽きて撃破・消滅したかどうかのフラグ。
   * - 想定値:
   *   - `true`: HPが0以下になり撃破された
   *   - `false`: まだHPが残っており生存している
   * - 初期値: 計算時にHP<=0で `true`
   */
  isDefeated: boolean;
  /**
   * モンスター撃破に伴いプレイヤーのレベルアップが発生したかどうかのフラグ。
   * - 想定値:
   *   - `true`: 経験値が閾値に達しレベル上昇（HP全快＋最大HP/ATK/DEF上昇）
   *   - `false` / `undefined`: レベルアップなし
   * - 初期値: `false`
   */
  didLevelUp?: boolean;
  /**
   * この戦闘で獲得した経験値量。
   * - 想定値: 0以上の整数
   */
  expGained?: number;
  /**
   * 背後死角からの不意打ちクリティカルヒットかどうかのフラグ。
   * - 想定値:
   *   - `true`: 敵の背後から奇襲し、ダメージが1.5〜2倍に跳ね上がる
   *   - `false` / `undefined`: 通常の正面・側面攻撃
   * - 初期値: `false`
   */
  isBackstab?: boolean;
  /** 発動した特殊印の効果メッセージ一覧 */
  runeEffects?: string[];
  /**
   * 攻撃を完全回避（ミス・空振り）したかどうかのフラグ。
   * - 想定値:
   *   - `true`: 攻撃が命中せずダメージ0
   *   - `false` / `undefined`: 攻撃命中
   * - 初期値: `false`
   */
  isEvaded?: boolean;
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
      bonusAtk += player.equippedWeapon.value + (player.equippedWeapon.upgradeLevel ?? 0);
    }

    if (player.equippedShield) {
      bonusDef += player.equippedShield.value + (player.equippedShield.upgradeLevel ?? 0);
    }

    if (player.equippedTalisman) {
      if (player.equippedTalisman.name.includes('ちから') || player.equippedTalisman.name.includes('力')) {
        bonusAtk += player.equippedTalisman.value || 3;
      }
    }

    player.atk = player.baseAtk + bonusAtk;
    player.def = player.baseDef + bonusDef;
  }

  /**
   * プレイヤーからモンスターへの近接攻撃を実行します。
   *
   * @param player - 攻撃側のプレイヤー
   * @param monster - 攻撃対象のモンスター
   * @param isBackstab - 背後からの不意打ちかどうか（ダメージ1.6倍）
   * @returns 戦闘結果オブジェクト
   */
  public static playerAttack(
    player: PlayerState,
    monster: Monster,
    isBackstab = false
  ): CombatResult {
    // 攻撃を受けたモンスターの金縛り・睡眠状態を解除
    if (monster.isParalyzed) {
      monster.isParalyzed = false;
    }
    if (monster.sleepTurns) {
      monster.sleepTurns = 0;
    }

    // ダメージ計算: ATK * (0.85 〜 1.15) - DEF
    const variance = 0.85 + Math.random() * 0.3;
    let baseDamage = player.atk * variance - monster.def;

    const runes = player.equippedWeapon?.runes || [];
    const runeEffects: string[] = [];

    // 印効果: DRAGON（ドラゴン特効）
    if (runes.includes('DRAGON') && (monster.type === 'DRAGON' || monster.type === 'ABYSS_LORD')) {
      baseDamage *= 1.5;
      runeEffects.push('【竜】ドラゴン特効が炸裂！');
    }

    // 印効果: HOLY（アンデッド特効）
    const isUndead = ['SKELETON', 'ZOMBIE', 'GHOST', 'MUMMY'].includes(monster.type);
    if (runes.includes('HOLY') && isUndead) {
      baseDamage *= 1.5;
      runeEffects.push('【聖】退魔の聖光がアンデッドを浄化！');
    }

    // 印効果: FIRE（紅蓮追加ダメージ）
    if (runes.includes('FIRE')) {
      baseDamage += 4;
      runeEffects.push('【炎】紅蓮の火炎爆発！');
    }

    // 印効果: CRITICAL（会心）
    if (runes.includes('CRITICAL') && Math.random() < 0.35) {
      baseDamage *= 1.5;
      runeEffects.push('【会】必殺の会心の一撃！');
    }

    let damage = Math.max(1, Math.round(baseDamage));

    // 印効果: DOUBLE（2回連続攻撃）
    if (runes.includes('DOUBLE') && Math.random() < 0.30) {
      damage = Math.round(damage * 1.8);
      runeEffects.push('【連】電光石火の2回連続攻撃！');
    }

    if (isBackstab) {
      damage = Math.max(2, Math.round(damage * 1.6));
    }

    monster.hp = Math.max(0, monster.hp - damage);
    const isDefeated = monster.hp <= 0;
    let didLevelUp = false;
    let expGained = 0;

    if (isDefeated) {
      expGained = monster.expValue;
      player.exp += expGained;
      didLevelUp = this.checkLevelUp(player);
    }

    return {
      attackerName: 'あなた',
      defenderName: monster.name,
      damage,
      isDefeated,
      didLevelUp,
      expGained,
      isBackstab,
      runeEffects,
    };
  }

  /**
   * 飛び道具（弓矢・投石・投擲アイテム）によるモンスターへの遠距離ダメージを計算・適用します。
   *
   * @param player - 攻撃側のプレイヤー
   * @param monster - 標的モンスター
   * @param projectilePower - 飛び道具の威力
   * @returns 戦闘結果オブジェクト
   */
  public static calculateRangedDamage(
    player: PlayerState,
    monster: Monster,
    projectilePower: number
  ): CombatResult {
    // 被弾により金縛り・睡眠は解除
    if (monster.isParalyzed) {
      monster.isParalyzed = false;
    }
    if (monster.sleepTurns) {
      monster.sleepTurns = 0;
    }

    // 遠隔ダメージ式: 飛び道具威力 + (ATK * 0.35) - (DEF * 0.7)
    const variance = 0.9 + Math.random() * 0.25;
    const rawDamage = (projectilePower + player.atk * 0.35) * variance - monster.def * 0.7;
    const damage = Math.max(1, Math.round(rawDamage));

    monster.hp = Math.max(0, monster.hp - damage);
    const isDefeated = monster.hp <= 0;
    let didLevelUp = false;
    let expGained = 0;

    if (isDefeated) {
      expGained = monster.expValue;
      player.exp += expGained;
      didLevelUp = this.checkLevelUp(player);
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
    const shieldRunes = player.equippedShield?.runes || [];
    const runeEffects: string[] = [];

    // 印効果: EVASION（見切り回避）
    if (shieldRunes.includes('EVASION') && Math.random() < 0.15) {
      runeEffects.push('【避】見切りの極意で攻撃を完全回避！');
      return {
        attackerName: monster.name,
        defenderName: 'あなた',
        damage: 0,
        isDefeated: false,
        isEvaded: true,
        runeEffects,
      };
    }

    const variance = 0.85 + Math.random() * 0.3;
    let rawDamage = monster.atk * variance - player.def;

    // 印効果: DEFENSE_UP（絶対防壁 - 物理ダメージ20%カット）
    if (shieldRunes.includes('DEFENSE_UP')) {
      rawDamage *= 0.80;
      runeEffects.push('【守】絶対防壁が衝撃を20%カット！');
    }

    // 印効果: DRAGON_RESIST（竜耐性 - ダメージ50%カット）
    if (shieldRunes.includes('DRAGON_RESIST') && (monster.type === 'DRAGON' || monster.type === 'ABYSS_LORD')) {
      rawDamage *= 0.50;
      runeEffects.push('【竜防】竜耐性がダメージを半減！');
    }

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
      runeEffects,
    };
  }

  /**
   * プレイヤーの現在経験値に基づき、必要経験値を満たしていればレベルアップを実行します。
   *
   * @param player - 対象のプレイヤーステータス
   * @returns レベルアップが発生したかどうか
   */
  public static checkLevelUp(player: PlayerState): boolean {
    let didLevelUp = false;
    while (player.exp >= player.nextExp) {
      didLevelUp = true;
      player.level += 1;
      const hpGain = 5;
      player.maxHp += hpGain;
      // レベルアップ時は全快ではなく、最大HPの上昇分（+5）のみHPを回復して緊張感を維持
      player.hp = Math.min(player.maxHp, player.hp + hpGain);
      player.baseAtk += 2;
      player.baseDef += 1;
      player.nextExp = Math.round(player.nextExp * 1.8);
    }

    if (didLevelUp) {
      this.updatePlayerStats(player);
    }

    return didLevelUp;
  }
}
