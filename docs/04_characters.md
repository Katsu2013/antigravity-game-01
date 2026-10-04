# キャラクター＆アイテム仕様設計書（Character & Item Specification）

本ドキュメントでは、ゲーム内に登場するプレイヤー、各モンスター、武器・盾、およびアイテムの**実際のベクターグラフィック画像（SVG）**、**8方向（正面/背面/真横/斜め前/斜め奥）**、**装備ペーパードール外見変化**、**ステータス設定**、**行動AI**、および**アニメーション仕様**を定義します。

風来のシレンやトルネコの大冒険のプレイフィールに準拠し、斜め移動・斜め攻撃を含む8方向への自動追従、手足の歩行ステップ、浮遊アイテム演出、および中世クラシックファンタジー世界観に統一されたアートワークを網羅しています。

---

## 1. 冒険者（プレイヤー / Player）

### 8方向ビジュアルプレビュー（未装備素体 / Base Form）
初期状態の冒険者は剣や盾を持たず、革の手袋と拳で身軽に行動します。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 正面（下向き / 南） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_down.svg" width="88" height="88" alt="正面（Down）" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">正面（Down）</div>
    <div style="color: #94a3b8; font-size: 11px;">南（真下）</div>
  </div>

  <!-- 背面（上向き / 北 / 後ろ姿） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_up.svg" width="88" height="88" alt="背面（Up）" style="display: inline-block;" />
    <div style="color: #6ee7b7; font-weight: bold; font-size: 13px; margin-top: 6px;">背面（Up）</div>
    <div style="color: #94a3b8; font-size: 11px;">北（真上・背中）</div>
  </div>

  <!-- 横向き（Side / 東・西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_side.svg" width="88" height="88" alt="真横（Side）" style="display: inline-block;" />
    <div style="color: #60a5fa; font-weight: bold; font-size: 13px; margin-top: 6px;">真横（Side）</div>
    <div style="color: #94a3b8; font-size: 11px;">東/西（左右反転）</div>
  </div>

  <!-- 斜め前（Diag Down / 南東・南西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_diag_down.svg" width="88" height="88" alt="斜め前（Diag Down）" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">斜め前（Diag Down）</div>
    <div style="color: #94a3b8; font-size: 11px;">南東/南西</div>
  </div>

  <!-- 斜め奥（Diag Up / 北東・北西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_diag_up.svg" width="88" height="88" alt="斜め奥（Diag Up）" style="display: inline-block;" />
    <div style="color: #a78bfa; font-weight: bold; font-size: 13px; margin-top: 6px;">斜め奥（Diag Up）</div>
    <div style="color: #94a3b8; font-size: 11px;">北東/北西</div>
  </div>

  <!-- 倒れ姿（力尽き / Dead） -->
  <div style="background-color: #0f172a; border: 1px solid #7f1d1d; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/player_dead.svg" width="88" height="88" alt="倒れ姿（Dead）" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">倒れ姿（Dead）</div>
    <div style="color: #94a3b8; font-size: 11px;">力尽き・散らばる武具</div>
  </div>
</div>

---

### 装備動的反映（ペーパードールシステム）プレビュー
インベントリで武器や盾を装備すると、装備品固有のグラフィックがリアルタイムにプレイヤーキャラクターへ合成されます。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 鉄の剣 ＋ 鋼の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/characters/player_equipped_iron_steel.svg" width="88" height="88" alt="鉄の剣＋鋼の盾" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">王道の重装戦士</div>
    <div style="color: #94a3b8; font-size: 11px;">鉄の剣 ＋ 鋼の盾</div>
  </div>

  <!-- 炎の剣 ＋ ドラゴンの盾 -->
  <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/characters/player_equipped_flame_dragon.svg" width="88" height="88" alt="炎の剣＋ドラゴンの盾" style="display: inline-block;" />
    <div style="color: #ef4444; font-weight: bold; font-size: 13px; margin-top: 6px;">真紅の竜騎士</div>
    <div style="color: #94a3b8; font-size: 11px;">炎の剣 ＋ ドラゴンの盾</div>
  </div>

  <!-- ミスリルの剣 ＋ 魔法の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #818cf8; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/characters/player_equipped_mithril_magic.svg" width="88" height="88" alt="ミスリルの剣＋魔法の盾" style="display: inline-block;" />
    <div style="color: #818cf8; font-weight: bold; font-size: 13px; margin-top: 6px;">秘術の聖騎士</div>
    <div style="color: #94a3b8; font-size: 11px;">ミスリルの剣 ＋ 魔法の盾</div>
  </div>

  <!-- 青銅の短剣 ＋ 木の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #b45309; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/characters/player_equipped_dagger_wood.svg" width="88" height="88" alt="青銅の短剣＋木の盾" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">軽装の探索者</div>
    <div style="color: #94a3b8; font-size: 11px;">青銅の短剣 ＋ 木の盾</div>
  </div>

  <!-- ルーンの剣 ＋ 青銅の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/characters/player_equipped_rune.svg" width="88" height="88" alt="ルーンの剣＋青銅の盾" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">古代の魔剣士</div>
    <div style="color: #94a3b8; font-size: 11px;">ルーンの剣 ＋ 青銅の盾</div>
  </div>
</div>

---

### 基本ステータス（初期値＆レベルアップ仕様）
| 項目 | 初期値 | 成長仕様・ゲーム難易度調整 |
|---|---|---|
| **HP / 最大HP** | 20 / 20 | レベルアップ時に最大HP +5。<br/>**HP回復量は最大HP上昇分（+5）のみ**（完全復活ではなく上昇分回復とすることで、回復薬や足踏みの戦略性を維持）。 |
| **基礎攻撃力 (Base ATK)** | 5 | レベルアップ時に +2、装備品（武器）で加算 |
| **基礎防御力 (Base DEF)** | 1 | レベルアップ時に +1、装備品（盾）で加算 |
| **満腹度 (Hunger)** | 100% | 10ターンごとに 1% 消費。0%で1ターンにつき1ダメージの餓死危険 |
| **初期所持品** | 薬草 × 1 | HP 15 回復 |

---

## 2. 敵モンスター全10種（Monster Specification）

ダンジョンのバイオームおよびフロア深度に応じて、多彩なモンスターが生息しています。すべて8方向追従に対応した専用ベクターグラフィックを持ちます。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- スライム -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_slime.svg" width="88" height="88" alt="スライム" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">スライム</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 8 / ATK: 3</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">全域浅層に出現</div>
  </div>

  <!-- ゴブリン -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_goblin.svg" width="88" height="88" alt="ゴブリン" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">ゴブリン</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 16 / ATK: 6</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">棍棒を振り回す小鬼</div>
  </div>

  <!-- スケルトン -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_skeleton.svg" width="88" height="88" alt="スケルトン" style="display: inline-block;" />
    <div style="color: #e2e8f0; font-weight: bold; font-size: 13px; margin-top: 6px;">スケルトン</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 24 / ATK: 9</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">錆びた剣を持つ骸骨兵</div>
  </div>

  <!-- 岩石ゴーレム -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_golem.svg" width="88" height="88" alt="ゴーレム" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">岩石ゴーレム</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 35 / ATK: 12</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">高い防御と剛腕</div>
  </div>

  <!-- マンドラゴラ -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_mandragora.svg" width="88" height="88" alt="マンドラゴラ" style="display: inline-block;" />
    <div style="color: #4ade80; font-weight: bold; font-size: 13px; margin-top: 6px;">マンドラゴラ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 18 / ATK: 7</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">森林遺跡に潜む怪奇植物</div>
  </div>

  <!-- サハギン戦士 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_sahagin.svg" width="88" height="88" alt="サハギン戦士" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">サハギン戦士</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 28 / ATK: 10</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">三叉槍を構える半魚人</div>
  </div>

  <!-- 吸血コウモリ -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_bat.svg" width="88" height="88" alt="吸血コウモリ" style="display: inline-block;" />
    <div style="color: #f43f5e; font-weight: bold; font-size: 13px; margin-top: 6px;">吸血コウモリ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 12 / ATK: 5</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">暗闇を素早く舞う翼獣</div>
  </div>

  <!-- 彷徨う亡霊 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_ghost.svg" width="88" height="88" alt="彷徨う亡霊" style="display: inline-block;" />
    <div style="color: #a78bfa; font-weight: bold; font-size: 13px; margin-top: 6px;">彷徨う亡霊</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 20 / ATK: 8</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">青白く浮遊する怨霊</div>
  </div>

  <!-- ダークメイジ -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_mage.svg" width="88" height="88" alt="ダークメイジ" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">ダークメイジ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 26 / ATK: 13</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">邪術を操る黒魔道士</div>
  </div>

  <!-- レッドドラゴン -->
  <div style="background-color: #0f172a; border: 1px solid #b91c1c; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_dragon.svg" width="88" height="88" alt="レッドドラゴン" style="display: inline-block;" />
    <div style="color: #ef4444; font-weight: bold; font-size: 13px; margin-top: 6px;">レッドドラゴン</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 55 / ATK: 18</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">深層の最凶巨竜</div>
  </div>
</div>

---

## 3. 武具・装備品仕様（Weapons & Shields）

### 武器一覧（Weapons - 全5種）
<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 青銅の短剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_dagger.svg" width="72" height="72" alt="青銅の短剣" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">青銅の短剣</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +2</div>
  </div>

  <!-- 鉄の剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_iron_sword.svg" width="72" height="72" alt="鉄の剣" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">鉄の剣</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +4</div>
  </div>

  <!-- ミスリルの剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_mithril_sword.svg" width="72" height="72" alt="ミスリルの剣" style="display: inline-block;" />
    <div style="color: #818cf8; font-weight: bold; font-size: 13px; margin-top: 6px;">ミスリルの剣</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +6</div>
  </div>

  <!-- 炎の剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_flame_sword.svg" width="72" height="72" alt="炎の剣" style="display: inline-block;" />
    <div style="color: #ef4444; font-weight: bold; font-size: 13px; margin-top: 6px;">炎の剣</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +8</div>
  </div>

  <!-- ルーンの剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_rune_sword.svg" width="72" height="72" alt="ルーンの剣" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">ルーンの剣</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +10</div>
  </div>
</div>

### 盾一覧（Shields - 全5種）
<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 木の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_wood.svg" width="72" height="72" alt="木の盾" style="display: inline-block;" />
    <div style="color: #d97706; font-weight: bold; font-size: 13px; margin-top: 6px;">木の盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +1</div>
  </div>

  <!-- 青銅の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_bronze.svg" width="72" height="72" alt="青銅の盾" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">青銅の盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +2</div>
  </div>

  <!-- 鋼の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_steel.svg" width="72" height="72" alt="鋼の盾" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">鋼の盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +4</div>
  </div>

  <!-- 魔法の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_magic.svg" width="72" height="72" alt="魔法の盾" style="display: inline-block;" />
    <div style="color: #a78bfa; font-weight: bold; font-size: 13px; margin-top: 6px;">魔法の盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +6</div>
  </div>

  <!-- ドラゴンの盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_dragon.svg" width="72" height="72" alt="ドラゴンの盾" style="display: inline-block;" />
    <div style="color: #ef4444; font-weight: bold; font-size: 13px; margin-top: 6px;">ドラゴンの盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +8</div>
  </div>
</div>

---

## 4. アイテム一覧（Items Specification）

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 薬草 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion.svg" width="72" height="72" alt="薬草" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">薬草</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 15 回復</div>
  </div>

  <!-- 特薬草 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_high.svg" width="72" height="72" alt="特薬草" style="display: inline-block;" />
    <div style="color: #10b981; font-weight: bold; font-size: 13px; margin-top: 6px;">特薬草</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 35 回復</div>
  </div>

  <!-- ちからの種 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_seed.svg" width="72" height="72" alt="ちからの種" style="display: inline-block;" />
    <div style="color: #fb923c; font-weight: bold; font-size: 13px; margin-top: 6px;">ちからの種</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +1 永続</div>
  </div>

  <!-- 剛力の秘薬 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_str.svg" width="72" height="72" alt="剛力の秘薬" style="display: inline-block;" />
    <div style="color: #f43f5e; font-weight: bold; font-size: 13px; margin-top: 6px;">剛力の秘薬</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +2 永続</div>
  </div>

  <!-- 大きなパン -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_food.svg" width="72" height="72" alt="大きなパン" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">大きなパン</div>
    <div style="color: #94a3b8; font-size: 11px;">満腹度 50% 回復</div>
  </div>

  <!-- 特製おにぎり -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_food_riceball.svg" width="72" height="72" alt="特製おにぎり" style="display: inline-block;" />
    <div style="color: #fef08a; font-weight: bold; font-size: 13px; margin-top: 6px;">特製おにぎり</div>
    <div style="color: #94a3b8; font-size: 11px;">全快 ＆ 上限+10</div>
  </div>

  <!-- ワープの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_warp.svg" width="72" height="72" alt="ワープの巻物" style="display: inline-block;" />
    <div style="color: #818cf8; font-weight: bold; font-size: 13px; margin-top: 6px;">ワープの巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">ランダム瞬間移動</div>
  </div>

  <!-- 雷の巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_thunder.svg" width="72" height="72" alt="雷の巻物" style="display: inline-block;" />
    <div style="color: #facc15; font-weight: bold; font-size: 13px; margin-top: 6px;">雷の巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">部屋全体15ダメージ</div>
  </div>

  <!-- あかりの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_light.svg" width="72" height="72" alt="あかりの巻物" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">あかりの巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">フロア全域マップ開示</div>
  </div>
</div>

---

## 5. 階段・特殊タイル

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 下り階段 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/tiles/stairs_down.svg" width="72" height="72" alt="下り階段" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">下り階段</div>
    <div style="color: #94a3b8; font-size: 11px;">次フロアへの降り口</div>
  </div>

  <!-- 木の橋 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/tiles/tile_bridge.svg" width="72" height="72" alt="木の橋" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">木の橋</div>
    <div style="color: #94a3b8; font-size: 11px;">川を渡る厚板桟橋</div>
  </div>
</div>
