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

## 2. 敵モンスター＆第50層ボス一覧（Monster & Boss Specification）

ダンジョンのバイオームおよびフロア深度（1〜50階）に応じて、個性豊かで凶悪なモンスターが生息しています。
スライムと同等以上の圧倒的なクオリティを目指し、全モンスターが武器（棍棒、錆びた剣、三叉銛、魔導杖、ピッチフォークなど）・防具（円盾、バックラー、革鎧、ブレストプレートなど）・立体陰影・骨格/筋肉テクスチャ・発光エフェクト（ソウルアイ、赤熱ブレス、魔導オーブ、古代呪眼）を備えた、超美麗な純粋ベクターSVGで描画されます。また、全種が8方向追従に対応しています。

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

  <!-- ミミック -->
  <div style="background-color: #0f172a; border: 1px solid #d97706; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_mimic.svg" width="88" height="88" alt="ミミック" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">人食い箱(ミミック)</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 30 / ATK: 14</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">宝箱に擬態・高火力奇襲</div>
  </div>

  <!-- ゾンビ -->
  <div style="background-color: #0f172a; border: 1px solid #15803d; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_zombie.svg" width="88" height="88" alt="ゾンビ" style="display: inline-block;" />
    <div style="color: #4ade80; font-weight: bold; font-size: 13px; margin-top: 6px;">腐乱ゾンビ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 38 / ATK: 8</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">湿地や毒沼の高HP不死者</div>
  </div>

  <!-- インプ -->
  <div style="background-color: #0f172a; border: 1px solid #be185d; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_imp.svg" width="88" height="88" alt="インプ" style="display: inline-block;" />
    <div style="color: #f472b6; font-weight: bold; font-size: 13px; margin-top: 6px;">小悪魔インプ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 15 / ATK: 11</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">狡猾・素早い奇襲小悪魔</div>
  </div>

  <!-- 古代ミイラ -->
  <div style="background-color: #0f172a; border: 1px solid #a1a1aa; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_mummy.svg" width="88" height="88" alt="古代ミイラ" style="display: inline-block;" />
    <div style="color: #e4e4e7; font-weight: bold; font-size: 13px; margin-top: 6px;">古代のミイラ</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 32 / ATK: 10</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">呪術の包帯を纏う高防御怪人</div>
  </div>

  <!-- 番犬・警備犬 -->
  <div style="background-color: #0f172a; border: 1px solid #b45309; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/monsters/monster_guard_dog.svg" width="88" height="88" alt="警備番犬" style="display: inline-block;" />
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">警備番犬</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 75 / ATK: 24</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">泥棒時に群れで追跡・2回行動</div>
  </div>

  <!-- 奈落の魔王アビス・ロード -->
  <div style="background-color: #1e112a; border: 2px solid #a855f7; border-radius: 12px; padding: 16px; text-align: center; width: 140px; box-shadow: 0 0 16px rgba(168,85,247,0.3);">
    <img src="assets/monsters/monster_abyss_lord.svg" width="88" height="88" alt="魔王アビス・ロード" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">奈落の魔王アビス</div>
    <div style="color: #e879f9; font-size: 11px; font-weight: bold;">HP: 1200 / ATK: 48</div>
    <div style="color: #a855f7; font-size: 10px; margin-top: 2px;">第50層君臨・火炎ブレス</div>
  </div>
</div>

---

## 3. 武具・装備品仕様（Weapons & Shields）

### 武器一覧（Weapons - 全8種）
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

  <!-- 妖刀ムラマサ -->
  <div style="background-color: #0f172a; border: 1px solid #991b1b; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_muramasa.svg" width="72" height="72" alt="妖刀ムラマサ" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">妖刀ムラマサ</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +14</div>
  </div>

  <!-- ウォーハンマー -->
  <div style="background-color: #0f172a; border: 1px solid #eab308; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_hammer.svg" width="72" height="72" alt="ウォーハンマー" style="display: inline-block;" />
    <div style="color: #fde047; font-weight: bold; font-size: 13px; margin-top: 6px;">ウォーハンマー</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +9</div>
  </div>

  <!-- ホーリーランス -->
  <div style="background-color: #0f172a; border: 1px solid #38bdf8; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/weapons/weapon_lance.svg" width="72" height="72" alt="ホーリーランス" style="display: inline-block;" />
    <div style="color: #bae6fd; font-weight: bold; font-size: 13px; margin-top: 6px;">ホーリーランス</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +12</div>
  </div>
</div>

### 盾一覧（Shields - 全8種）
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

  <!-- 風の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_wind.svg" width="72" height="72" alt="風の盾" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">風の盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +3</div>
  </div>

  <!-- タワーシールド -->
  <div style="background-color: #0f172a; border: 1px solid #64748b; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_tower.svg" width="72" height="72" alt="タワーシールド" style="display: inline-block;" />
    <div style="color: #94a3b8; font-weight: bold; font-size: 13px; margin-top: 6px;">タワーシールド</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +7</div>
  </div>

  <!-- イージスの盾 -->
  <div style="background-color: #0f172a; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/shields/shield_aegis.svg" width="72" height="72" alt="イージスの盾" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">イージスの盾</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +11</div>
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

  <!-- どくけし草 -->
  <div style="background-color: #0f172a; border: 1px solid #16a34a; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_antidote.svg" width="72" height="72" alt="どくけし草" style="display: inline-block;" />
    <div style="color: #4ade80; font-weight: bold; font-size: 13px; margin-top: 6px;">どくけし草</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 10 回復＆解毒</div>
  </div>

  <!-- ちからの種 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_seed.svg" width="72" height="72" alt="ちからの種" style="display: inline-block;" />
    <div style="color: #fb923c; font-weight: bold; font-size: 13px; margin-top: 6px;">ちからの種</div>
    <div style="color: #94a3b8; font-size: 11px;">ATK +1 永続</div>
  </div>

  <!-- すばやさの種 -->
  <div style="background-color: #0f172a; border: 1px solid #0891b2; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_seed_speed.svg" width="72" height="72" alt="すばやさの種" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">すばやさの種</div>
    <div style="color: #94a3b8; font-size: 11px;">DEF +1 永続</div>
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

  <!-- 巨大なおにぎり -->
  <div style="background-color: #0f172a; border: 1px solid #facc15; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_food_big_riceball.svg" width="72" height="72" alt="巨大なおにぎり" style="display: inline-block;" />
    <div style="color: #fef08a; font-weight: bold; font-size: 13px; margin-top: 6px;">巨大なおにぎり</div>
    <div style="color: #94a3b8; font-size: 11px;">全快 ＆ 上限+20</div>
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

  <!-- 睡眠の巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #6366f1; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_sleep.svg" width="72" height="72" alt="睡眠の巻物" style="display: inline-block;" />
    <div style="color: #a5b4fc; font-weight: bold; font-size: 13px; margin-top: 6px;">睡眠の巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">部屋全体の敵を行動不能</div>
  </div>

  <!-- 混乱の巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #ec4899; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_confuse.svg" width="72" height="72" alt="混乱の巻物" style="display: inline-block;" />
    <div style="color: #f472b6; font-weight: bold; font-size: 13px; margin-top: 6px;">混乱の巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">部屋全体の敵を同士討ち</div>
  </div>

  <!-- 合成の壺 -->
  <div style="background-color: #082f49; border: 2px solid #06b6d4; border-radius: 12px; padding: 16px; text-align: center; width: 140px; box-shadow: 0 0 12px rgba(6,182,212,0.3);">
    <img src="assets/items/item_pot_synthesis.svg" width="72" height="72" alt="合成の壺" style="display: inline-block;" />
    <div style="color: #22d3ee; font-weight: bold; font-size: 13px; margin-top: 6px;">合成の壺</div>
    <div style="color: #67e8f9; font-size: 11px;">武具強化値合算＆印継承</div>
  </div>

  <!-- 復活の草 -->
  <div style="background-color: #0f172a; border: 1px solid #eab308; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_revive.svg" width="72" height="72" alt="復活の草" style="display: inline-block;" />
    <div style="color: #facc15; font-weight: bold; font-size: 13px; margin-top: 6px;">復活の草</div>
    <div style="color: #94a3b8; font-size: 11px;">力尽きた時にHP全快蘇生</div>
  </div>

  <!-- 弟切草 -->
  <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_otogiri.svg" width="72" height="72" alt="弟切草" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">弟切草</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 100 回復</div>
  </div>

  <!-- 命の草 -->
  <div style="background-color: #0f172a; border: 1px solid #ec4899; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_potion_life.svg" width="72" height="72" alt="命の草" style="display: inline-block;" />
    <div style="color: #f472b6; font-weight: bold; font-size: 13px; margin-top: 6px;">命の草</div>
    <div style="color: #94a3b8; font-size: 11px;">最大HP +5 永続上昇</div>
  </div>

  <!-- ゴールドの山 -->
  <div style="background-color: #0f172a; border: 1px solid #ca8a04; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_gold_pile.svg" width="72" height="72" alt="ゴールド" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">ゴールド通貨</div>
    <div style="color: #94a3b8; font-size: 11px;">ショップ売買用の資金</div>
  </div>

  <!-- 木の矢 -->
  <div style="background-color: #0f172a; border: 1px solid #78350f; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_arrow.svg" width="72" height="72" alt="木の矢" style="display: inline-block;" />
    <div style="color: #d97706; font-weight: bold; font-size: 13px; margin-top: 6px;">木の矢</div>
    <div style="color: #94a3b8; font-size: 11px;">直線の敵へ遠隔射撃</div>
  </div>

  <!-- 魔法の杖 -->
  <div style="background-color: #0f172a; border: 1px solid #7e22ce; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_staff.svg" width="72" height="72" alt="魔法の杖" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">魔法の杖</div>
    <div style="color: #94a3b8; font-size: 11px;">直線魔法光線を放つ</div>
  </div>

  <!-- まもりの指輪 -->
  <div style="background-color: #0f172a; border: 1px solid #38bdf8; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_ring.svg" width="72" height="72" alt="まもりの指輪" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">まもりの指輪</div>
    <div style="color: #94a3b8; font-size: 11px;">装備中 DEF +3</div>
  </div>

  <!-- 天の恵みの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #eab308; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_upgrade_atk.svg" width="72" height="72" alt="天の恵みの巻物" style="display: inline-block;" />
    <div style="color: #facc15; font-weight: bold; font-size: 13px; margin-top: 6px;">天の恵みの巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">装備中の武器を+1強化</div>
  </div>

  <!-- 地の恵みの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_upgrade_def.svg" width="72" height="72" alt="地の恵みの巻物" style="display: inline-block;" />
    <div style="color: #60a5fa; font-weight: bold; font-size: 13px; margin-top: 6px;">地の恵みの巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">装備中の盾を+1強化</div>
  </div>

  <!-- 真空斬りの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #06b6d4; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/items/item_scroll_vacuum.svg" width="72" height="72" alt="真空斬りの巻物" style="display: inline-block;" />
    <div style="color: #22d3ee; font-weight: bold; font-size: 13px; margin-top: 6px;">真空斬りの巻物</div>
    <div style="color: #94a3b8; font-size: 11px;">部屋全体の敵へ鋭い真空波</div>
  </div>
</div>

### 持ち物整理機能（インベントリソート）
- **操作方法**:
  - デスクトップ版: インベントリパネルの「整 整理」ボタンをクリック、またはキーボード「O」キー。
  - スマホ/タブレット版: 持ち物ダイアログヘッダー内の「整 整理」ボタンをタップ。
- **並び順ルール**:
  1. 装備中のアイテム（武器・盾）を最優先で先頭に配置
  2. アイテム種別順（武器 → 盾 → 薬草・種 → 食料 → 巻物）
  3. 同種別内では効果値・レアリティ順

---

## 5. インタラクティブ障害物・ギミックオブジェクト（Obstacles）

ダンジョン内には単なる壁や川だけでなく、プレイヤーの攻撃や体当たりによってインタラクトできるオブジェクトが配置されます。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 土の塊 -->
  <div style="background-color: #0f172a; border: 1px solid #78350f; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/obstacles/obstacle_dirt.svg" width="72" height="72" alt="土の塊" style="display: inline-block;" />
    <div style="color: #d97706; font-weight: bold; font-size: 13px; margin-top: 6px;">土の塊</div>
    <div style="color: #94a3b8; font-size: 11px;">耐久: 2 / 破壊可能</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">粉砕時にアイテム出現</div>
  </div>

  <!-- 倒木 -->
  <div style="background-color: #0f172a; border: 1px solid #451a03; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/obstacles/obstacle_tree.svg" width="72" height="72" alt="倒木" style="display: inline-block;" />
    <div style="color: #b45309; font-weight: bold; font-size: 13px; margin-top: 6px;">倒木・木塊</div>
    <div style="color: #94a3b8; font-size: 11px;">耐久: 3 / 破壊可能</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">攻撃3回で粉砕</div>
  </div>

  <!-- 雪の塊 -->
  <div style="background-color: #0f172a; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/obstacles/obstacle_snow.svg" width="72" height="72" alt="雪の塊" style="display: inline-block;" />
    <div style="color: #e0f2fe; font-weight: bold; font-size: 13px; margin-top: 6px;">雪の塊</div>
    <div style="color: #94a3b8; font-size: 11px;">耐久: 1 / 破壊可能</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">一撃で砕け散る</div>
  </div>

  <!-- 押せる石 -->
  <div style="background-color: #0f172a; border: 1px solid #64748b; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/obstacles/obstacle_push_rock.svg" width="72" height="72" alt="押せる石" style="display: inline-block;" />
    <div style="color: #cbd5e1; font-weight: bold; font-size: 13px; margin-top: 6px;">押せる大石</div>
    <div style="color: #94a3b8; font-size: 11px;">破壊不能 / 押し移動</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">体当たりで1マス動く</div>
  </div>

  <!-- 滑る氷塊 -->
  <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/obstacles/obstacle_ice_block.svg" width="72" height="72" alt="滑る氷塊" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">滑る氷塊</div>
    <div style="color: #94a3b8; font-size: 11px;">直進滑走 / 衝突粉砕</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">敵直撃で20ダメージ</div>
  </div>
</div>

---

## 6. 階段・特殊タイル

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

---

## 7. レアキャラクター＆特殊NPC（Rare Wanderers & Fairies）

ダンジョン内に出現する個性豊かな旅人・仙人・妖精、および突如ダンジョンを疾走するスクーターおじさんです。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- さすらいの冒険者レオン -->
  <div style="background-color: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_leon.svg" width="88" height="88" alt="冒険者レオン" style="display: inline-block;" />
    <div style="color: #60a5fa; font-weight: bold; font-size: 13px; margin-top: 6px;">冒険者レオン</div>
    <div style="color: #94a3b8; font-size: 11px;">物々交換（Trade）</div>
  </div>

  <!-- 賭博仙人ガンジ -->
  <div style="background-color: #0f172a; border: 1px solid #a855f7; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_gambler.svg" width="88" height="88" alt="賭博仙人ガンジ" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">賭博仙人ガンジ</div>
    <div style="color: #94a3b8; font-size: 11px;">じゃんけん勝負（枠拡張）</div>
  </div>

  <!-- 慈愛の妖精ピクシー -->
  <div style="background-color: #0f172a; border: 1px solid #10b981; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_fairy.svg" width="88" height="88" alt="妖精ピクシー" style="display: inline-block;" />
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">妖精ピクシー</div>
    <div style="color: #94a3b8; font-size: 11px;">敵味方無差別癒やし</div>
  </div>

  <!-- さすらいの鍛冶職人バルカン -->
  <div style="background-color: #0f172a; border: 1px solid #ea580c; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_blacksmith.svg" width="88" height="88" alt="鍛冶職人バルカン" style="display: inline-block;" />
    <div style="color: #fb923c; font-weight: bold; font-size: 13px; margin-top: 6px;">鍛冶職人バルカン</div>
    <div style="color: #94a3b8; font-size: 11px;">武具の無料鍛錬</div>
  </div>

  <!-- スクーターおじさん（正面） -->
  <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_scooter_down.svg" width="88" height="88" alt="スクーターおじさん 正面" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">スクーターおじさん</div>
    <div style="color: #94a3b8; font-size: 11px;">正面（トコトコ走行）</div>
  </div>

  <!-- スクーターおじさん（横向き走行） -->
  <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_scooter_side.svg" width="88" height="88" alt="スクーターおじさん 横" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">スクーター疾走</div>
    <div style="color: #94a3b8; font-size: 11px;">横向き（マフラー排気）</div>
  </div>

  <!-- スクーターおじさん（後ろ姿） -->
  <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/characters/npc_scooter_up.svg" width="88" height="88" alt="スクーターおじさん 後ろ" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">走り去る姿</div>
    <div style="color: #94a3b8; font-size: 11px;">北向き（テールランプ）</div>
  </div>
</div>

### 7.1. さすらいの冒険者レオン（WANDERING_ADVENTURER / 🎒）
- **外見的特徴**: 鳥の羽をあしらった緑の旅帽子、スカイブルーのマント、大荷物を詰めたリュックサック。
- **行動パターン**: 中立NPC。敵モンスターを索敵せず、マイペースに部屋内を巡回・散策。
- **対話イベント**: **「物々交換（Trade）」**
  - レオンが求めている指定カテゴリ（武器・盾・薬草・巻物・食料など）のアイテムを提示。
  - プレイヤーが手持ちのアイテムを渡すと、レオンから階層に応じた強化値付き・上位のレアアイテムが返礼として手に入ります。

### 7.2. 賭博仙人ガンジ（GAMBLER_SAGE / 🎲）
- **外見的特徴**: 胸まで伸びた豊麗な白い髭、高貴な紫色の道着、右手には金色の扇子、左手には真紅のサイコロ。
- **行動パターン**: 中立NPC。その場にどっしりと佇み、勝負師を待つ。
- **対話イベント**: **「じゃんけん勝負（Janken / Rock-Paper-Scissors）」**
  - グー（✊）・チョキ（✌️）・パー（🖐️）の3択勝負。
  - **勝利時**: プレイヤーの「持ち物の最大所持枠」が永続的に +2 枠拡張（最大24枠まで拡張可能）。
  - **あいこ時**: 勝負継続（何度でも再挑戦可能）。
  - **敗北時**: 所持金500Gを没収。ゴールドが不足している場合は、所持品の中からランダムに1つのアイテムが没収されます。

### 7.3. 慈愛の妖精ピクシー（HEALING_FAIRY / 💖）
- **外見的特徴**: 薄桃色に輝く髪、半透明の光る妖精の羽、ピンクのハートステッキ、キラキラと舞う星屑のエフェクト。
- **行動パターン**: 癒やし系モンスター。敵対せず、ふわふわと浮遊移動。
- **癒やしイベント**: **「敵味方無差別ヒーリング」**
  - プレイヤーが接触または対話すると、ハートの光とともにプレイヤーの **HPが25回復** し、**満腹度が15%** 回復します。
  - さらに、周囲に負傷した敵モンスターがいる場合、そのモンスターのHPも無差別に回復してしまう「おせっかい」な一面を持ちます。

### 7.4. さすらいの鍛冶職人バルカン（TRAVELING_BLACKSMITH / 🔨）
- **外見的特徴**: 筋骨隆々なドワーフ、立派な赤髭、煤で汚れた革のエプロン、黄金の巨大な金槌（スレッジハンマー）。
- **行動パターン**: 中立NPC。ダンジョン内の鉱脈を探しながら放浪。
- **対話イベント**: **「武具の無償強化（Free Smithing）」**
  - プレイヤーが現在装備している武器または盾を、丹念に叩いて鍛錬。
  - +1〜+2 の強化値を無償で付与してくれます（同一フロアにつき1回限定）。

### 7.5. スクーターおじさん（SCOOTER_GUY / 🛵）
- **外見的特徴**: レトロなクリーム色のヘルメット、丸メガネ、ちょび髭、緑のナイロンジャンパー、赤い原付スクーター。
- **行動パターン**: **脈絡なくダンジョンをトコトコと横断して去っていく**謎のおじさん。敵でも味方でもなく、何をするわけでもなく安全運転で走り抜けます。
- **演出＆サウンド**:
  - Web Audio APIによる単気筒4ストエンジンの排気パルス音（トコトコトコ…ブルルルン！）が近接時に響きます。
  - 話しかけると「おっと危ないよ若者！ 一時停止はちゃんと左右確認しなきゃダメだよ！」「制限速度は30km/h厳守！」など日常会話。
  - 目的地に到達すると「じゃあね〜！ 安全運転でね〜！」とクラクション（プッピー！）を鳴らして去っていきます。

---

## 8. 多種多様な名物店主たち（Shopkeepers Specification）

ダンジョン内のショップには、名作ローグライクへのリスペクトを込めた多彩な店主たちがランダムに店番として登場します。各店主には専用のビジュアル（通常姿および泥棒時の激怒姿）、専用の警告台詞、お仕置きビンタ、および個性豊かな遠隔追撃攻撃が実装されています。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 大商人トルネー 通常 -->
  <div style="background-color: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_torneko.svg" width="88" height="88" alt="大商人トルネー" style="display: inline-block;" />
    <div style="color: #60a5fa; font-weight: bold; font-size: 13px; margin-top: 6px;">大商人トルネー</div>
    <div style="color: #94a3b8; font-size: 11px;">通常（温厚な商人）</div>
  </div>

  <!-- 大商人トルネー 激怒 -->
  <div style="background-color: #1e1111; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_torneko_angry.svg" width="88" height="88" alt="激怒トルネー" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">激怒トルネー</div>
    <div style="color: #ef4444; font-size: 11px;">大袋振り回し・パン投げ</div>
  </div>

  <!-- 風来坊シレンス 通常 -->
  <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_shiren.svg" width="88" height="88" alt="風来坊シレンス" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">風来坊シレンス</div>
    <div style="color: #94a3b8; font-size: 11px;">通常（三度笠と相棒）</div>
  </div>

  <!-- 風来坊シレンス 激怒 -->
  <div style="background-color: #1e1111; border: 1px solid #dc2626; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_shiren_angry.svg" width="88" height="88" alt="修羅シレンス" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">修羅シレンス</div>
    <div style="color: #dc2626; font-size: 11px;">抜刀・真空波</div>
  </div>

  <!-- 鍛冶商人ゴルド 通常 -->
  <div style="background-color: #0f172a; border: 1px solid #d97706; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_goldo.svg" width="88" height="88" alt="鍛冶商人ゴルド" style="display: inline-block;" />
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">鍛冶商人ゴルド</div>
    <div style="color: #94a3b8; font-size: 11px;">通常（赤髭ドワーフ）</div>
  </div>

  <!-- 鍛冶商人ゴルド 激怒 -->
  <div style="background-color: #1e1111; border: 1px solid #b91c1c; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_goldo_angry.svg" width="88" height="88" alt="噴火ゴルド" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">噴火親父ゴルド</div>
    <div style="color: #b91c1c; font-size: 11px;">赤熱ハンマー・鉄塊投げ</div>
  </div>

  <!-- 魔導商人セリア 通常 -->
  <div style="background-color: #0f172a; border: 1px solid #a855f7; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_celia.svg" width="88" height="88" alt="魔導商人セリア" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">魔導商人セリア</div>
    <div style="color: #94a3b8; font-size: 11px;">通常（エルフの魔女）</div>
  </div>

  <!-- 魔導商人セリア 激怒 -->
  <div style="background-color: #1e1111; border: 1px solid #9333ea; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_celia_angry.svg" width="88" height="88" alt="冷徹セリア" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">冷徹魔女セリア</div>
    <div style="color: #9333ea; font-size: 11px;">紫電魔法陣・雷撃ボルト</div>
  </div>

  <!-- 元祖商人ネロ 通常 -->
  <div style="background-color: #0f172a; border: 1px solid #eab308; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_nero.svg" width="88" height="88" alt="商人ネロ" style="display: inline-block;" />
    <div style="color: #facc15; font-weight: bold; font-size: 13px; margin-top: 6px;">商人ネロ</div>
    <div style="color: #94a3b8; font-size: 11px;">通常（黄色ターバン）</div>
  </div>

  <!-- 元祖商人ネロ 激怒 -->
  <div style="background-color: #1e1111; border: 1px solid #ef4444; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <img src="assets/merchants/merchant_nero_angry.svg" width="88" height="88" alt="怒りネロ" style="display: inline-block;" />
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">怒りの店主ネロ</div>
    <div style="color: #ef4444; font-size: 11px;">逆立ち怒髪・包丁投げ</div>
  </div>
</div>


