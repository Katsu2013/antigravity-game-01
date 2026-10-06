/**
 * @file SynthesisSystem.ts
 * @description 武器同士・盾同士の鍛冶合成、強化値合算、特殊能力（印・ルーン）の継承を
 * 司る合成システム。風来のシレン・トルネコシリーズ準拠の奥深いビルド構築を実現します。
 */

import { Item } from '../types';

/**
 * 武器・盾に宿る特殊印（ルーン）の定義。
 */
export interface RuneDefinition {
  /** ルーンの一意なID識別子（例: 'DRAGON', 'FIRE'） */
  id: string;
  /** UIや装備名末尾に表示される漢字1文字シンボル（例: '竜', '炎', '金'） */
  symbol: string;
  /** 特殊印の名称（例: 「ドラゴン特効」「サビよけ」） */
  name: string;
  /** 特殊印の具体的な効果説明文 */
  description: string;
  /**
   * 印を付与できる対象装備カテゴリ。
   * - 想定値: `'WEAPON'` (武器専用) または `'SHIELD'` (盾専用)
   */
  category: 'WEAPON' | 'SHIELD';
}

export class SynthesisSystem {
  /**
   * 定義されているすべての特殊印（ルーン）マスターリスト。
   */
  public static readonly RUNES: Record<string, RuneDefinition> = {
    DRAGON: {
      id: 'DRAGON',
      symbol: '竜',
      name: 'ドラゴン特効',
      description: 'ドラゴン種族（レッドドラゴン等）への攻撃時、ダメージが1.5倍に増加する。',
      category: 'WEAPON',
    },
    FIRE: {
      id: 'FIRE',
      symbol: '炎',
      name: '紅蓮属性',
      description: '攻撃命中時に火炎爆発が奔り、追加で4ダメージを与える。',
      category: 'WEAPON',
    },
    HOLY: {
      id: 'HOLY',
      symbol: '聖',
      name: '退魔の聖光',
      description: 'アンデッド系（スケルトン、ゾンビ、亡霊、ミイラ）へのダメージが1.5倍になる。',
      category: 'WEAPON',
    },
    DOUBLE: {
      id: 'DOUBLE',
      symbol: '連',
      name: '連撃の型',
      description: '30%の確率で2回連続攻撃を繰り出す。',
      category: 'WEAPON',
    },
    CRITICAL: {
      id: 'CRITICAL',
      symbol: '会',
      name: '必殺の一撃',
      description: '会心の一撃（クリティカル）の発生率が大幅に上昇する。',
      category: 'WEAPON',
    },
    DRAGON_RESIST: {
      id: 'DRAGON_RESIST',
      symbol: '竜防',
      name: '竜炎耐性',
      description: 'ドラゴンの火炎ブレス攻撃による被ダメージを50%軽減する。',
      category: 'SHIELD',
    },
    MAGIC_RESIST: {
      id: 'MAGIC_RESIST',
      symbol: '魔防',
      name: '魔導障壁',
      description: 'ダークメイジや敵の遠隔魔弾による被ダメージを50%軽減する。',
      category: 'SHIELD',
    },
    EVASION: {
      id: 'EVASION',
      symbol: '避',
      name: '見切りの極意',
      description: '敵からの近接攻撃を15%の確率で完全に回避する。',
      category: 'SHIELD',
    },
    DEFENSE_UP: {
      id: 'DEFENSE_UP',
      symbol: '守',
      name: '絶対防壁',
      description: '受けるすべての物理ダメージを常時20%カットする。',
      category: 'SHIELD',
    },
  };

  /**
   * 2つのアイテムが合成可能かどうか判定します。
   *
   * @param baseItem - ベースとなる装備品
   * @param materialItem - 素材として消費する装備品
   * @returns 合成判定結果と不可理由
   */
  public static canSynthesize(
    baseItem: Item,
    materialItem: Item,
    pot?: Item
  ): { valid: boolean; reason?: string } {
    if (pot && (pot.potCapacity ?? 0) <= 0) {
      return { valid: false, reason: '壺の容量がいっぱいで合成できません。' };
    }

    if (baseItem.id === materialItem.id) {
      return { valid: false, reason: '同じアイテム同士は合成できません。' };
    }

    if (
      baseItem.category !== 'WEAPON' &&
      baseItem.category !== 'SHIELD'
    ) {
      return {
        valid: false,
        reason: 'ベースアイテムは武器または盾である必要があります。',
      };
    }

    if (baseItem.category !== materialItem.category) {
      return {
        valid: false,
        reason: '武器同士、または盾同士のみ合成可能です。',
      };
    }

    return { valid: true };
  }

  /**
   * 武器または盾の合成を実行し、合算強化値と印を継承した新しいアイテムを生成します。
   *
   * @param baseItem - ベースとなる装備品（残る側）
   * @param materialItem - 素材となる装備品（消滅する側）
   * @param _pot - 合成に使用した壺（省略可能）
   * @returns 合成結果アイテムと詳細ログメッセージ一覧
   */
  public static synthesize(
    baseItem: Item,
    materialItem: Item,
    _pot?: Item
  ): { success: boolean; result: Item; message: string; logMessages: string[] } {
    const logMessages: string[] = [];

    // 1. 強化値の合算
    const baseUp = baseItem.upgradeLevel ?? 0;
    const matUp = materialItem.upgradeLevel ?? 0;
    const newUp = baseUp + matUp;

    // 2. 印（ルーン）の継承・統合
    const baseRunes = baseItem.runes ? [...baseItem.runes] : [];
    const matRunes = materialItem.runes ? [...materialItem.runes] : [];
    const addedRunes: string[] = [];

    for (const r of matRunes) {
      if (!baseRunes.includes(r) && baseRunes.length < 5) {
        baseRunes.push(r);
        addedRunes.push(r);
      }
    }

    const result: Item = {
      ...baseItem,
      upgradeLevel: newUp,
      runes: baseRunes,
    };

    // ログメッセージの生成
    logMessages.push(
      `【合成成功】${baseItem.name} に ${materialItem.name} を合成した！`
    );

    if (matUp > 0) {
      logMessages.push(`強化値が合算され +${newUp} になった！`);
    }

    if (addedRunes.length > 0) {
      const runeNames = addedRunes
        .map((r) => {
          const def = this.RUNES[r];
          return def ? `[${def.symbol}:${def.name}]` : `[${r}]`;
        })
        .join(', ');
      logMessages.push(`特殊能力印 ${runeNames} を継承した！`);
    }

    return {
      success: true,
      result,
      message: logMessages.join(' '),
      logMessages,
    };
  }

  /**
   * アイテムの表示名に印の文字装飾を付与した文字列を取得します。
   * 例: 「ドラゴンキラー+3 [竜][炎]」
   */
  public static getDecoratedName(item: Item): string {
    let name = item.name;
    if (item.upgradeLevel !== undefined && item.upgradeLevel > 0) {
      name += `+${item.upgradeLevel}`;
    }
    if (item.runes && item.runes.length > 0) {
      const runeSymbols = item.runes
        .map((r) => {
          const def = this.RUNES[r];
          return def ? `[${def.symbol}]` : `[${r}]`;
        })
        .join('');
      name += ` ${runeSymbols}`;
    }
    return name;
  }
}
