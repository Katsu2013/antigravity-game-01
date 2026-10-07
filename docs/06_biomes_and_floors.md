# ダンジョンバイオーム＆フロア構成設計書（Biomes & Dungeon Floors Specification）

本ドキュメントでは、フロアごとの多彩なダンジョン環境（7大バイオーム / テーマ）、連続水路と木橋（Bridge）の自動生成アルゴリズム、および決定ボタン（Aボタン）による正面敵への優先攻撃・素振りシステムに関する詳細仕様を定義します。

---

## 1. 正面攻撃＆素振りシステム（Directional Attack & Slash System）

### 概要
プレイヤーが敵の方向を向いた状態で【決定ボタン】（ゲームパッドAボタン / PCキーボード: `Z`, `J`, `Enter`）を押下した際、**移動キーを押すことなくその場で即座に正面の敵へ近接攻撃**を行えるように設計されています。

また、正面に敵がおらず階段やアイテムもない場合は、シレンやトルネコシリーズにおける伝統的な**「素振り（空振り）」**が発動し、1ターン消費して敵を引き付けたりHPを回復したりする戦術的な立ち回りが可能です。

```mermaid
flowchart TD
    A["[A 決定ボタン] 押下"] --> B{"足元にアイテムがあるか？"}
    B -- "はい (アイテムあり)" --> C["足元アイテムを拾う<br/>(インベントリ格納 & 1ターン経過)"]
    B -- "いいえ" --> D{"足元に階段があるか？"}
    D -- "はい (階段あり)" --> E["次の階層へ降りる<br/>(フロア遷移 & 仲間モンスター同伴連行)"]
    D -- "いいえ" --> F{"正面マス(8方向)に対象が存在するか？"}
    F -- "店主・中立NPC" --> G["会話・会計・対話イベントを開く"]
    F -- "仲間モンスター" --> H["触れ合い＆位置スワップ<br/>(なかよし度+1 / 確率HP癒やし回復 & 1ターン経過)"]
    F -- "敵モンスター" --> I["正面敵への近接攻撃を実行<br/>(踏み込み & スラッシュ演出 & 1ターン経過)"]
    F -- "障害物(岩/木塊)" --> J["障害物の破壊または押し出し<br/>(1ターン経過)"]
    F -- "誰もいない" --> K["正面へ向かって「素振り」実行<br/>(スラッシュ光条演出 & 1ターン経過)"]
```

### 優先順位仕様
1. **足元アイテム拾得（最優先）**:
   - 足元の床にアイテムが存在する場合、最優先でインベントリに回収。
2. **階段降り**:
   - 足元が下り階段（`TileType.StairsDown`）の場合、次の深層フロアへ進む（生存している仲間モンスターも一緒に次フロアへ駆け下りて連行）。
3. **正面エンティティとの対話・インタラクション**:
   - **平時店主NPC**: 攻撃せず商品購入・売却会計や会話を実行。
   - **レア中立NPC**: レオン（物々交換）、ガンジ（じゃんけん）、バルカン（鍛錬）などのイベントを開く。
   - **仲良し仲間モンスター**: 攻撃せず位置を相互スワップし、なかよし度加算＆HP癒やし回復を行う。
   - **敵モンスター**: 正面敵への近接攻撃を実行（踏み込みアニメーション＋斬撃エフェクト）。
   - **障害物**: 土塊・雪塊の破壊、または大石・氷塊の押し出しを実行。
4. **素振り（ターン送り）**:
   - 足元にも正面にも何もない場合、正面に向かって武器または拳を素振り（空振り）し、1ターン経過（足踏みと同様にHP自然回復や敵の接近を誘発）。

---

## 2. 全11大ダンジョンバイオーム＆動的階層抽選（Dynamic Floor Biomes）

固定階層周期を廃止し、**ダンジョン深度（浅層・中層・深層）に応じた動的バイオーム抽選システム**を採用しています。
毎フロアごとに新鮮な環境が訪れ、壁・床の質感や環境ギミック、出現モンスターの生態系が大きく変化します。

| バイオーム種別 | 出現階層傾向 | テーマ・雰囲気 | 壁・床グラフィック | 特徴・環境ギミック | 主な出現モンスター |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`STONE`（石造りの地下迷宮）** | 浅層〜中層 | 堅牢な灰青色の古代石造迷宮 | 壁: 重厚暗黒石<br/>床: 灰青敷石 | 均整の取れた王道ダンジョン | スライム、ゴブリン、スケルトン |
| **`EARTH`（岩と赤土の洞窟）** | 浅層〜中層 | 赤土と露出した玄武岩盤 | 壁: 漆黒火山岩<br/>床: 赤土敷石 | 土塊・大石などの障害物が散在 | ゴブリン、岩石ゴーレム、バット |
| **`FOREST`（草木が生い茂る旧遺跡）** | 浅層〜深層 | 苔むした緑壁と古代樹の根 | 壁: 深緑巨石壁<br/>床: 青苔敷石 | 倒木などの木製障害物が出現 | スライム、マンドラゴラ、彷徨う亡霊 |
| **`RIVER`（地下水流と木橋の清流洞）** | 中層〜深層 | 湿潤な清流と渡り木橋 | 壁: 暗青削岩壁<br/>床: 蒼青石畳<br/>橋: 木製桟橋 | 部屋を貫く連続水流と木製の橋 | サハギン戦士、バット、亡霊 |
| **`LAKE`（水没せし蒼玉の地下湖）** | 中層〜深層 | 神秘的な蒼碧の地下大湖 | 壁: 紺青神殿壁<br/>床: 蒼玉モザイク | 部屋中央に広がる雄大な地底湖 | サハギン戦士、亡霊、スライム |
| **`SNOW`（白銀の雪原回廊）** | 中層〜深層 | 吹雪と積雪の白銀回廊 | 壁: 冠雪暗岩壁<br/>床: 純白積雪石 | 雪の塊が出現・粉雪パーティクル | 彷徨う亡霊、スケルトン、ゴーレム |
| **`ICE`（永久凍土と蒼氷窟）** | 中層〜深層 | 澄み渡る蒼氷と氷晶 | 壁: 氷晶巨岩壁<br/>床: 透光蒼氷盤 | **滑る氷床・滑る氷塊**が出現 | ダークメイジ、レッドドラゴン、ゴーレム |
| **`SWAMP`（泥濘の湿地帯）** | 中層〜深層 | 薄暗い水草と泥濘の沼地 | 壁: 暗緑湿岩壁<br/>床: 湿地腐泥床 | **泥濘床（足を取られターン遅延）** | 腐乱ゾンビ、サハギン、マンドラゴラ |
| **`TOXIC`（腐蝕の毒沼窟）** | 中層〜最深層 | 有毒な紫泡と怪奇結晶 | 壁: 濃紫変異壁<br/>床: 腐蝕毒泥床 | **毒沼床（踏むと2ダメージ）** | 腐乱ゾンビ、ダークメイジ、インプ |
| **`MECHA`（古代真鍮の機巧回廊）** | 中層〜最深層 | 歯車と真鍮のリベット装甲 | 壁: 歯車装甲壁<br/>床: 螺子留め鉄板床 | 堅牢な古代文明の仕掛け回廊 | スケルトン、ゴーレム、古代ミイラ |
| **`ISLAND`（大海原の孤島迷宮）** | 中層〜最深層 | 外洋に浮かぶ孤島群 | 壁: なし（全周囲海）<br/>床: 孤島岩礁<br/>橋: 海峡桟橋 | **壁が一切なく全周海＋木橋で連結** | サハギン戦士、インプ、人食い箱 |

### バイオーム別タイルグラフィック一覧

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- STONE -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/stone_wall.svg" width="48" height="48" alt="石の壁" />
      <img src="assets/tiles/stone_floor.svg" width="48" height="48" alt="石の床" />
    </div>
    <div style="color: #94a3b8; font-weight: bold; font-size: 12px; margin-top: 6px;">1. 石造迷宮</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- EARTH -->
  <div style="background-color: #0f172a; border: 1px solid #78350f; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/earth_wall.svg" width="48" height="48" alt="赤土の壁" />
      <img src="assets/tiles/earth_floor.svg" width="48" height="48" alt="赤土の床" />
    </div>
    <div style="color: #f59e0b; font-weight: bold; font-size: 12px; margin-top: 6px;">2. 赤土洞窟</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- FOREST -->
  <div style="background-color: #0f172a; border: 1px solid #14532d; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/forest_wall.svg" width="48" height="48" alt="草木の壁" />
      <img src="assets/tiles/forest_floor.svg" width="48" height="48" alt="草木の床" />
    </div>
    <div style="color: #4ade80; font-weight: bold; font-size: 12px; margin-top: 6px;">3. 旧遺跡</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- RIVER -->
  <div style="background-color: #0f172a; border: 1px solid #1e3a8a; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/river_wall.svg" width="48" height="48" alt="水流の壁" />
      <img src="assets/tiles/river_floor.svg" width="48" height="48" alt="水流の床" />
    </div>
    <div style="color: #60a5fa; font-weight: bold; font-size: 12px; margin-top: 6px;">4. 清流洞</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- LAKE -->
  <div style="background-color: #0f172a; border: 1px solid #0e7490; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/lake_wall.svg" width="48" height="48" alt="地下湖の壁" />
      <img src="assets/tiles/lake_floor.svg" width="48" height="48" alt="地下湖の床" />
    </div>
    <div style="color: #22d3ee; font-weight: bold; font-size: 12px; margin-top: 6px;">5. 地下大湖</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- SNOW -->
  <div style="background-color: #0f172a; border: 1px solid #38bdf8; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/snow_wall.svg" width="48" height="48" alt="雪原の壁" />
      <img src="assets/tiles/snow_floor.svg" width="48" height="48" alt="雪原の床" />
    </div>
    <div style="color: #e2e8f0; font-weight: bold; font-size: 12px; margin-top: 6px;">6. 白銀雪原</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- ICE -->
  <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/ice_wall.svg" width="48" height="48" alt="蒼氷の壁" />
      <img src="assets/tiles/ice_floor.svg" width="48" height="48" alt="蒼氷の床" />
    </div>
    <div style="color: #38bdf8; font-weight: bold; font-size: 12px; margin-top: 6px;">7. 蒼氷窟</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- SWAMP -->
  <div style="background-color: #0f172a; border: 1px solid #14532d; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/swamp_wall.svg" width="48" height="48" alt="湿地の壁" />
      <img src="assets/tiles/swamp_floor.svg" width="48" height="48" alt="湿地の床" />
    </div>
    <div style="color: #4ade80; font-weight: bold; font-size: 12px; margin-top: 6px;">8. 泥濘湿地</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- TOXIC -->
  <div style="background-color: #0f172a; border: 1px solid #581c87; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/toxic_wall.svg" width="48" height="48" alt="毒沼の壁" />
      <img src="assets/tiles/toxic_floor.svg" width="48" height="48" alt="毒沼の床" />
    </div>
    <div style="color: #c084fc; font-weight: bold; font-size: 12px; margin-top: 6px;">9. 腐蝕毒沼</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- MECHA -->
  <div style="background-color: #0f172a; border: 1px solid #b45309; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/mecha_wall.svg" width="48" height="48" alt="機巧の壁" />
      <img src="assets/tiles/mecha_floor.svg" width="48" height="48" alt="機巧の床" />
    </div>
    <div style="color: #f59e0b; font-weight: bold; font-size: 12px; margin-top: 6px;">10. 機巧回廊</div>
    <div style="color: #64748b; font-size: 10px;">壁 / 床</div>
  </div>

  <!-- ISLAND -->
  <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px; text-align: center; width: 130px;">
    <div style="display: flex; justify-content: center; gap: 4px;">
      <img src="assets/tiles/island_wall.svg" width="48" height="48" alt="外洋の波" />
      <img src="assets/tiles/island_floor.svg" width="48" height="48" alt="孤島の岩" />
    </div>
    <div style="color: #94a3b8; font-weight: bold; font-size: 12px; margin-top: 6px;">11. 外洋孤島</div>
    <div style="color: #64748b; font-size: 10px;">外洋 / 孤島</div>
  </div>
</div>

### 特殊環境ギミック床（Gimmick Floors）

フロア上には、キャラクターの移動や状態に直接影響を与える環境ギミック床が存在します。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 滑る氷床 -->
  <div style="background-color: #0f172a; border: 1px solid #0284c7; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/tiles/gimmick_ice.svg" width="64" height="64" alt="滑る氷床" style="display: inline-block;" />
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">滑る氷床</div>
    <div style="color: #94a3b8; font-size: 11px;">一直線に滑走</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">壁や障害物に当たるまで停止不能</div>
  </div>

  <!-- 泥濘床 -->
  <div style="background-color: #0f172a; border: 1px solid #78350f; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/tiles/gimmick_mud.svg" width="64" height="64" alt="泥濘床" style="display: inline-block;" />
    <div style="color: #d97706; font-weight: bold; font-size: 13px; margin-top: 6px;">足枷泥濘床</div>
    <div style="color: #94a3b8; font-size: 11px;">移動ターン遅延</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">足を取られて連続行動を消費</div>
  </div>

  <!-- 毒沼床 -->
  <div style="background-color: #0f172a; border: 1px solid #581c87; border-radius: 12px; padding: 16px; text-align: center; width: 150px;">
    <img src="assets/tiles/gimmick_poison.svg" width="64" height="64" alt="毒沼床" style="display: inline-block;" />
    <div style="color: #c084fc; font-weight: bold; font-size: 13px; margin-top: 6px;">腐蝕毒沼床</div>
    <div style="color: #94a3b8; font-size: 11px;">2ダメージ/歩</div>
    <div style="color: #64748b; font-size: 10px; margin-top: 2px;">踏むたびに有毒スリップダメージ</div>
  </div>
</div>

---

## 3. 連続水流と木橋生成アルゴリズム（River & Bridge Generation）

従来のランダムな水たまり配置を廃止し、**部屋を端から端まで貫く本物の川（連続水流）**と、その川に架けられた**通行可能な木の橋（`TileType.Bridge`）**を生成します。

### 水域と木橋タイルの性質
- **水路タイル (`TileType.Water`)**:
  - 通行不能（Passable: False）。
  - 視界は完全に透過（Transparent: True）。向こう側の敵やアイテムを視認可能。
- **木橋タイル (`TileType.Bridge`)**:
  - 通行可能（Passable: True）。プレイヤーおよびモンスターが川を渡るための通路。
  - 水流の上に厚板と鉄鋲、ロープで固定された桟橋グラフィックが描画されます。
- **到達性の数学的保証（BFS Reachability Guarantee）**:
  - ダンジョン生成後、プレイヤー開始地点から下り階段への経路を幅優先探索（BFS）で検証。
  - 水路によって部屋が分断されている場合、最短交差マスを自動で `TileType.Bridge` へ置換し、100%確実に階段へ到達できる構造を保証します。

```mermaid
graph TD
    A["ダンジョン部屋・通路生成完了"] --> B{"バイオーム判定"}
    B -- "RIVER (清流洞)" --> C["部屋の端から端まで貫通する連続水流 (Water) を掘削"]
    C --> D["水流の中央（広部屋は複数箇所）に木製の橋 (Bridge) を架橋"]
    B -- "LAKE (地下湖)" --> E["部屋中央に雄大な湖 (Water) を掘削 & 渡り桟橋 (Bridge) を配置"]
    B -- "SNOW / ICE" --> F["凍結した小水路・氷池を配置"]
    D --> G["BFS（幅優先探索）による全域到達可能性チェック"]
    E --> G
    F --> G
    G --> H["階段までの導線が100%開通していることを保証"]
```

---

## 4. 環境大気パーティクル演出（Atmospheric Particles）

`CanvasRenderer` では、バイオームの雰囲気を高めるためにリアルタイムの軽量パーティクルを描画しています。

- **`SNOW`（白銀の雪原回廊）**:
  - 画面上部から優雅に舞い落ちる35粒の粉雪粒子。風の揺らぎ（サイン波ドリフト）を伴って舞い散ります。
- **`ICE`（永久凍土と蒼氷窟）**:
  - 暗闇の中にキラキラと光が瞬く25粒の氷晶・ダイヤモンドダスト。位相差による煌めきアニメーション。
- **`RIVER` & `LAKE`**:
  - 水面を走る二重サイン波のアニメーション波紋と、水光のスパークルハイライト。
