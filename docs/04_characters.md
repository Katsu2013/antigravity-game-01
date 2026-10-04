# キャラクター＆アイテム仕様設計書（Character & Item Specification）

本ドキュメントでは、ゲーム内に登場するプレイヤー、各モンスター、およびアイテムの**ベクターグラフィック（SVG）**、**8方向（正面/背面/真横/斜め前/斜め奥）**、**ステータス設定**、**行動AI**、および**アニメーション仕様**を定義します。
風来のシレンやトルネコの大冒険のプレイフィールに準拠し、斜め移動・斜め攻撃を含む8方向への自動追従、手足の歩行ステップ、浮遊アイテム演出、および中世クラシックファンタジー世界観に統一されたアートワークを網羅しています。

---

## 1. 冒険者（プレイヤー / Player）

### 8方向ビジュアルプレビュー

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 正面（下向き / 南） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M20 28 L14 54 L32 50 L50 54 L44 28 Z" fill="#047857"/>
      <rect x="23" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="22" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
      <rect x="34" y="44" width="7" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="33" y="52" width="9" height="5" rx="2" fill="#1e293b"/>
      <rect x="22" y="24" width="20" height="24" rx="4" fill="#334155" stroke="#1e293b" stroke-width="2"/>
      <rect x="26" y="28" width="12" height="16" rx="2" fill="#475569"/>
      <rect x="22" y="42" width="20" height="4" fill="#d97706"/>
      <rect x="29" y="41" width="6" height="6" fill="#fbbf24"/>
      <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <path d="M30 6 Q32 2 34 6 L33 12 L31 12 Z" fill="#ef4444"/>
      <rect x="25" y="16" width="14" height="4" rx="2" fill="#0f172a"/>
      <rect x="28" y="17" width="2" height="2" fill="#38bdf8"/>
      <rect x="34" y="17" width="2" height="2" fill="#38bdf8"/>
      <path d="M14 26 Q12 40 20 44 Q28 40 26 26 Z" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="20" cy="34" r="3" fill="#fbbf24"/>
      <rect x="44" y="12" width="4" height="24" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <rect x="41" y="32" width="10" height="3" fill="#d97706"/>
      <rect x="45" y="35" width="2" height="6" fill="#78350f"/>
      <circle cx="46" cy="42" r="2" fill="#fbbf24"/>
    </svg>
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">正面（Down）</div>
    <div style="color: #94a3b8; font-size: 11px;">南（真下）</div>
  </div>

  <!-- 背面（上向き / 北 / 後ろ姿） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="23" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="34" y="46" width="7" height="10" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M22 24 L14 53 L32 50 L50 53 L42 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
      <path d="M26 26 L18 52 L32 49 L46 52 L38 26 Z" fill="#059669"/>
      <path d="M14 24 Q12 38 20 42 Q28 38 26 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
      <line x1="16" y1="30" x2="24" y2="36" stroke="#78350f" stroke-width="2.5"/>
      <line x1="16" y1="36" x2="24" y2="30" stroke="#78350f" stroke-width="2.5"/>
      <rect x="42" y="10" width="4" height="18" rx="1" fill="#78350f"/>
      <rect x="39" y="22" width="10" height="3" fill="#d97706"/>
      <circle cx="32" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <path d="M24 16 Q32 20 40 16" stroke="#475569" stroke-width="2" fill="none"/>
      <path d="M30 6 Q32 2 34 6 L33 14 L31 14 Z" fill="#ef4444"/>
    </svg>
    <div style="color: #6ee7b7; font-weight: bold; font-size: 13px; margin-top: 6px;">背面（Up）</div>
    <div style="color: #94a3b8; font-size: 11px;">北（真上・背中）</div>
  </div>

  <!-- 横向き（Side / 東・西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="19" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M22 26 L12 52 L26 50 L28 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
      <rect x="23" y="44" width="8" height="12" rx="2" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="21" y="52" width="12" height="5" rx="2" fill="#1e293b"/>
      <rect x="29" y="44" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="27" y="52" width="12" height="5" rx="2" fill="#1e293b"/>
      <path d="M22 24 L38 26 L36 46 L24 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
      <rect x="23" y="42" width="14" height="4" fill="#d97706"/>
      <ellipse cx="26" cy="34" rx="6" ry="10" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="26" cy="34" r="2.5" fill="#fbbf24"/>
      <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <path d="M25 6 Q32 2 33 8 L29 14 L24 14 Z" fill="#ef4444"/>
      <polygon points="30,16 42,18 40,22 30,20" fill="#0f172a"/>
      <rect x="36" y="18" width="5" height="2" fill="#38bdf8"/>
      <rect x="38" y="24" width="22" height="4" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <rect x="36" y="21" width="3" height="10" fill="#d97706"/>
      <rect x="32" y="24.5" width="5" height="3" fill="#78350f"/>
      <circle cx="31" cy="26" r="2" fill="#fbbf24"/>
    </svg>
    <div style="color: #60a5fa; font-weight: bold; font-size: 13px; margin-top: 6px;">真横（Side）</div>
    <div style="color: #94a3b8; font-size: 11px;">東/西（左右反転）</div>
  </div>

  <!-- 斜め前（Diag Down / 南東・南西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M16 26 L6 52 L22 52 L42 54 L36 28 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
      <rect x="20" y="44" width="7" height="12" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="18" y="52" width="10" height="5" rx="2" fill="#0f172a"/>
      <rect x="30" y="45" width="8" height="12" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="30" y="53" width="12" height="5" rx="2" fill="#1e293b"/>
      <path d="M18 24 L38 27 L34 47 L18 45 Z" fill="#334155" stroke="#1e293b" stroke-width="2"/>
      <path d="M22 27 L36 29 L33 43 L21 41 Z" fill="#475569"/>
      <rect x="18" y="42" width="18" height="4" fill="#d97706"/>
      <ellipse cx="16" cy="35" rx="5" ry="9" fill="#2563eb" stroke="#fbbf24" stroke-width="2"/>
      <circle cx="16" cy="35" r="2" fill="#fbbf24"/>
      <circle cx="29" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <path d="M25 6 Q30 2 33 7 L29 13 L25 13 Z" fill="#ef4444"/>
      <polygon points="26,16 40,19 37,23 25,20" fill="#0f172a"/>
      <rect x="32" y="19" width="6" height="2" rx="1" fill="#38bdf8"/>
      <g transform="rotate(40 38 28)">
        <rect x="38" y="6" width="4.5" height="28" rx="1" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.2"/>
        <line x1="40" y1="8" x2="40" y2="34" stroke="#64748b" stroke-width="1"/>
        <polygon points="40,8 42,14 41,32 40,32" fill="#ffffff" opacity="0.8"/>
        <rect x="33" y="34" width="14" height="4" rx="1" fill="#d97706"/>
        <rect x="38" y="38" width="4" height="6" rx="1" fill="#78350f"/>
        <circle cx="40" cy="45" r="2.5" fill="#fbbf24"/>
      </g>
    </svg>
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">斜め前（Diag Down）</div>
    <div style="color: #94a3b8; font-size: 11px;">南東/南西（右前方へ剣を構える）</div>
  </div>

  <!-- 斜め奥（Diag Up / 北東・北西） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="20" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="20" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <rect x="31" y="47" width="7" height="9" rx="2" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <path d="M18 24 L8 50 L26 50 L48 54 L36 24 Z" fill="#047857" stroke="#064e3b" stroke-width="1.5"/>
      <path d="M22 26 L12 48 L26 48 L44 51 L32 26 Z" fill="#059669"/>
      <path d="M12 24 Q9 38 16 42 Q24 38 22 24 Z" fill="#1e3a8a" stroke="#d97706" stroke-width="1.5"/>
      <circle cx="16" cy="33" r="2.5" fill="#fbbf24"/>
      <g transform="rotate(25 36 20)">
        <rect x="35" y="4" width="4" height="26" rx="1" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <rect x="32" y="18" width="10" height="3" fill="#d97706"/>
        <circle cx="37" cy="5" r="2.5" fill="#fbbf24"/>
      </g>
      <circle cx="30" cy="18" r="12" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <path d="M24 16 Q31 21 38 17" stroke="#475569" stroke-width="2" fill="none"/>
      <path d="M28 6 Q32 2 35 6 L33 13 L30 13 Z" fill="#ef4444"/>
    </svg>
    <div style="color: #a78bfa; font-weight: bold; font-size: 13px; margin-top: 6px;">斜め奥（Diag Up）</div>
    <div style="color: #94a3b8; font-size: 11px;">北東/北西（北東向き後ろ姿）</div>
  </div>

  <!-- 倒れ姿（力尽き / Dead / 墓石文字からの完全画像化） -->
  <div style="background-color: #0f172a; border: 1px solid #7f1d1d; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="46" rx="28" ry="12" fill="rgba(0,0,0,0.45)"/>
      <path d="M14 42 Q28 34 46 40 Q38 48 18 48 Z" fill="#047857" opacity="0.9"/>
      <ellipse cx="26" cy="44" rx="14" ry="7" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <path d="M12 45 L4 47 L6 50 L14 47 Z" fill="#1e293b"/>
      <path d="M14 43 L8 44 L9 47 L16 45 Z" fill="#0f172a"/>
      <ellipse cx="38" cy="43" rx="7" ry="6" fill="#64748b" stroke="#334155" stroke-width="1.5"/>
      <rect x="36" y="42" width="6" height="2" rx="1" fill="#0f172a"/>
      <path d="M42 39 Q46 36 48 40 L44 42 Z" fill="#ef4444"/>
      <g transform="rotate(35 46 30)">
        <rect x="44" y="16" width="3" height="20" rx="1" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
        <rect x="42" y="32" width="8" height="2.5" fill="#d97706"/>
      </g>
      <g transform="rotate(-20 18 36)">
        <ellipse cx="18" cy="36" rx="6" ry="8" fill="#2563eb" stroke="#fbbf24" stroke-width="1.5"/>
        <circle cx="18" cy="36" r="2" fill="#fbbf24"/>
      </g>
    </svg>
    <div style="color: #f87171; font-weight: bold; font-size: 13px; margin-top: 6px;">倒れ姿（Dead）</div>
    <div style="color: #94a3b8; font-size: 11px;">力尽き・散らばる武具</div>
  </div>
</div>

### 基本ステータス（初期値）
| 項目 | 初期値 | 備考 |
|---|---|---|
| **HP / 最大HP** | 20 / 20 | レベルアップ時に最大HP +5（全快） |
| **基礎攻撃力 (Base ATK)** | 5 | レベルアップ時に +2、装備品で加算 |
| **基礎防御力 (Base DEF)** | 1 | レベルアップ時に +1、装備品で加算 |
| **満腹度 (Hunger)** | 100% | 10ターンごとに 1% 消費。0%で餓死ダメージ |
| **初期所持品** | 薬草 × 1 | HP 15 回復（美麗ポーション瓶アイコン） |

### アニメーション＆8方向仕様
- **完全8方向追従 (8-Way Direction)**:
  - **真下 (Down)**: 南を向き、バイザーの光彩と正面アーマー、直立した盾と剣を表示。
  - **真上 (Up)**: 北を向き、広がるマントと兜の後頭部、背負った剣と盾を表示。
  - **真横 (Right / Left)**: 東を向き、左側（西）は `scaleX = -1.0` で水平反転。
  - **斜め前 (Down-Right / Down-Left)**: 斜め手前を向く専用スプライト。クォータービューの角度で剣を斜め前方に構える。左側は反転描画。
  - **斜め奥 (Up-Right / Up-Left)**: 斜め奥を向く専用スプライト。斜めに翻るマントと背負った武器を表示。左側は反転描画。
  - **壁移動（方向転換）**: 壁に向かって移動入力をした際、ターンを消費せずにその方向へ向き直る（シレン式）。
- **足踏み（WAIT）時の敵索敵・向き直し**:
  - 足踏み時、周囲隣接マス（8方向）に敵がいる場合は最も近い敵の方向（斜め含む）へ自動で向き直り、対峙する。
- **手足の歩行ステップ (Walk Cycle)**:
  - 正面・背面・真横・斜め前の各方向ごとに歩行2コマ（`walk1`, `walk2`）を用意し、足を交互に踏み出し腕を振るモーションを滑らかに再生。
  - 上下 3.5px のホップバウンス、左右への体重移動ロッキング、足元ステップダスト演出。
- **攻撃スラッシュ**:
  - 8方向の攻撃方向に向かって 0.35 マス踏み込み、鋭い青白い斬撃光条エフェクトを角度に合わせて正確に回転描画。
- **ドラマチックな倒れ込み演出（ダウンモーション）**:
  - **被弾・絶命（0.0s〜0.4s）**: 強烈な被弾赤フラッシュ（`damageFlash`）と画面シェイク振動。立っていた冒険者が進行方向へグラッと傾き、膝をつく。
  - **床への崩れ落ち・着地（0.4s〜0.75s）**: 重心が床面へ沈み込み、床に着地する瞬間にパフッと広がる土埃（衝撃ダストリング）を発生。外れた兜と散らばる武具が描かれた `player_dead` スプライトへと自然に遷移。
  - **静寂と暗転ヴィネット（0.5s〜1.8s）**: 倒れ伏した冒険者の周囲から闇が迫る円形グラデーションヴィネットを展開。
  - **ゲームオーバーダイアログのフェードイン（約1.8秒後）**: 倒れた情景をしっかり噛み締めた後、フワッと浮き上がるCSSアニメーションとともに最終スコア画面が出現。従来の文字記号 `✝` は完全撤廃され、映画的な終焉を演出。

---

## 2. 敵モンスター（Monster Specification）

### ビジュアル＆8方向プレビュー

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- スライム -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="56" rx="22" ry="6" fill="rgba(0,0,0,0.3)"/>
      <path d="M32 10 C46 10 56 26 56 42 C56 52 46 56 32 56 C18 56 8 52 8 42 C8 26 18 10 32 10 Z" fill="#10b981" stroke="#047857" stroke-width="2"/>
      <path d="M32 18 C42 18 50 30 50 42 C50 50 42 52 32 52 C22 52 14 50 14 42 C14 30 22 18 32 18 Z" fill="#34d399" opacity="0.6"/>
      <ellipse cx="24" cy="36" rx="4" ry="6" fill="#064e3b"/>
      <circle cx="23" cy="34" r="2" fill="#ffffff"/>
      <ellipse cx="40" cy="36" rx="4" ry="6" fill="#064e3b"/>
      <circle cx="39" cy="34" r="2" fill="#ffffff"/>
      <ellipse cx="24" cy="20" rx="6" ry="3" transform="rotate(-25 24 20)" fill="#a7f3d0"/>
      <circle cx="38" cy="22" r="2" fill="#a7f3d0"/>
    </svg>
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">スライム（Slime）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 8 / ATK: 3</div>
  </div>

  <!-- ゴブリン -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M16 26 L4 18 L18 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
      <path d="M48 26 L60 18 L46 32 Z" fill="#84cc16" stroke="#4d7c0f" stroke-width="1.5"/>
      <rect x="22" y="32" width="20" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="2"/>
      <circle cx="32" cy="26" r="14" fill="#84cc16" stroke="#4d7c0f" stroke-width="2"/>
      <circle cx="26" cy="27" r="3" fill="#dc2626"/>
      <circle cx="38" cy="27" r="3" fill="#dc2626"/>
      <rect x="46" y="20" width="8" height="28" rx="3" transform="rotate(20 46 20)" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
    </svg>
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">ゴブリン（Goblin）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 16 / ATK: 6</div>
  </div>

  <!-- スケルトン -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="30" y="30" width="4" height="22" fill="#e2e8f0"/>
      <line x1="22" y1="34" x2="42" y2="34" stroke="#cbd5e1" stroke-width="2.5"/>
      <line x1="24" y1="39" x2="40" y2="39" stroke="#cbd5e1" stroke-width="2.5"/>
      <circle cx="32" cy="20" r="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="27" cy="19" r="3" fill="#0f172a"/>
      <circle cx="27" cy="19" r="1.5" fill="#ef4444"/>
      <circle cx="37" cy="19" r="3" fill="#0f172a"/>
      <circle cx="37" cy="19" r="1.5" fill="#ef4444"/>
      <rect x="46" y="16" width="4" height="26" rx="1" transform="rotate(15 46 16)" fill="#713f12" stroke="#451a03" stroke-width="1"/>
    </svg>
    <div style="color: #e2e8f0; font-weight: bold; font-size: 13px; margin-top: 6px;">スケルトン（Skeleton）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 24 / ATK: 9</div>
  </div>

  <!-- 岩石ゴーレム -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="22" ry="6" fill="rgba(0,0,0,0.4)"/>
      <rect x="20" y="44" width="10" height="12" rx="3" fill="#57534e" stroke="#292524" stroke-width="2"/>
      <rect x="34" y="44" width="10" height="12" rx="3" fill="#57534e" stroke="#292524" stroke-width="2"/>
      <rect x="16" y="24" width="32" height="22" rx="6" fill="#78716c" stroke="#292524" stroke-width="2.5"/>
      <path d="M22 28 L28 36 L24 40" stroke="#a8a29e" stroke-width="2" fill="none"/>
      <rect x="22" y="12" width="20" height="16" rx="4" fill="#57534e" stroke="#292524" stroke-width="2.5"/>
      <rect x="26" y="18" width="12" height="4" rx="2" fill="#0c0a09"/>
      <circle cx="29" cy="20" r="2" fill="#f59e0b"/>
      <circle cx="35" cy="20" r="2" fill="#f59e0b"/>
      <rect x="8" y="26" width="10" height="18" rx="4" fill="#78716c" stroke="#292524" stroke-width="2"/>
      <rect x="46" y="26" width="10" height="18" rx="4" fill="#78716c" stroke="#292524" stroke-width="2"/>
    </svg>
    <div style="color: #f59e0b; font-weight: bold; font-size: 13px; margin-top: 6px;">岩石ゴーレム（Golem）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 35 / ATK: 12</div>
  </div>

  <!-- マンドラゴラ -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="16" ry="5" fill="rgba(0,0,0,0.3)"/>
      <path d="M32 20 Q24 6 16 10 Q20 18 30 22 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>
      <path d="M32 20 Q40 6 48 10 Q44 18 34 22 Z" fill="#16a34a" stroke="#15803d" stroke-width="1.5"/>
      <path d="M32 18 Q32 2 36 2 Q36 12 32 18 Z" fill="#4ade80"/>
      <ellipse cx="32" cy="38" rx="16" ry="18" fill="#a16207" stroke="#713f12" stroke-width="2"/>
      <circle cx="26" cy="34" r="3" fill="#451a03"/>
      <circle cx="38" cy="34" r="3" fill="#451a03"/>
      <circle cx="25" cy="33" r="1" fill="#fef08a"/>
      <circle cx="37" cy="33" r="1" fill="#fef08a"/>
      <ellipse cx="32" cy="44" rx="4" ry="5" fill="#451a03"/>
      <path d="M26 52 Q22 62 26 62" stroke="#713f12" stroke-width="2.5" fill="none"/>
      <path d="M38 52 Q42 62 38 62" stroke="#713f12" stroke-width="2.5" fill="none"/>
    </svg>
    <div style="color: #4ade80; font-weight: bold; font-size: 13px; margin-top: 6px;">マンドラゴラ（Mandragora）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 18 / ATK: 7</div>
  </div>

  <!-- サハギン戦士 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <ellipse cx="32" cy="58" rx="18" ry="5" fill="rgba(0,0,0,0.35)"/>
      <path d="M22 46 L20 58 L28 56 Z" fill="#0284c7"/>
      <path d="M42 46 L44 58 L36 56 Z" fill="#0284c7"/>
      <rect x="22" y="30" width="20" height="20" rx="4" fill="#0284c7" stroke="#0369a1" stroke-width="2"/>
      <ellipse cx="32" cy="24" rx="13" ry="12" fill="#0369a1" stroke="#075985" stroke-width="2"/>
      <polygon points="32,8 35,16 29,16" fill="#38bdf8"/>
      <polygon points="20,18 16,14 20,24" fill="#38bdf8"/>
      <polygon points="44,18 48,14 44,24" fill="#38bdf8"/>
      <circle cx="27" cy="24" r="3" fill="#facc15"/>
      <circle cx="37" cy="24" r="3" fill="#facc15"/>
      <circle cx="27" cy="24" r="1.5" fill="#0f172a"/>
      <circle cx="37" cy="24" r="1.5" fill="#0f172a"/>
      <!-- 三叉槍 -->
      <line x1="48" y1="12" x2="48" y2="48" stroke="#78350f" stroke-width="2"/>
      <polygon points="48,8 46,14 50,14" fill="#e0f2fe"/>
      <polygon points="44,12 43,16 46,15" fill="#e0f2fe"/>
      <polygon points="52,12 53,16 50,15" fill="#e0f2fe"/>
    </svg>
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">サハギン戦士（Sahagin）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP: 28 / ATK: 10</div>
  </div>
</div>

### モンスターの8方向＆行動仕様
- **行動AI (A* Tracking & 8-Way Facing)**:
  - プレイヤーを追跡・移動する際、進行方向（8方向）へ向きが自動更新。
  - 斜め追跡時には斜め用スプライトが選択され、自然な斜め方向を向いて迫ります。
  - プレイヤーを攻撃する際はプレイヤーの方向を向いて踏み込み、赤い打撃エフェクトを発動。
- **方向別グラフィック**:
  - **正面 (Down)**: 顔・目・武器・装飾。
  - **背面 (Up)**: 目が見えない後ろ姿、背負った武器・背中。
  - **真横 (Right / Left)**: 横顔、前方に構えた武器。
  - **斜め前 / 斜め奥 (Diag)**: 進行角度に即したクォータービュー。

---

## 3. アイテム一覧＆ベクターグラフィック（Item Specification）

文字記号ではなく、すべて**専用のSVGベクターグラフィック**としてダンジョン床およびインベントリに描画されます。ダンジョン床ではふんわりと上下に浮遊するボビングアニメーションが適用されます。
「大きなパン」はおにぎり表現を廃止し、中世ファンタジー世界観に合わせた**香ばしい黄金の丸パン（カンパーニュ）**として再設計されています。

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <!-- 薬草 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
      <rect x="28" y="14" width="8" height="6" rx="1" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
      <ellipse cx="32" cy="14" rx="4" ry="1.5" fill="#d97706"/>
      <rect x="26" y="20" width="12" height="4" rx="1.5" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
      <rect x="28" y="23" width="8" height="7" fill="rgba(255,255,255,0.2)"/>
      <circle cx="32" cy="42" r="16" fill="rgba(15,23,42,0.4)" stroke="#94a3b8" stroke-width="2"/>
      <path d="M18 42 C18 50 24 56 32 56 C40 56 46 50 46 42 Q39 40 32 42 Q25 44 18 42 Z" fill="#10b981"/>
      <circle cx="28" cy="46" r="2.5" fill="#34d399"/>
      <circle cx="36" cy="49" r="1.5" fill="#6ee7b7"/>
      <circle cx="33" cy="44" r="1" fill="#a7f3d0"/>
      <path d="M22 34 A 12 12 0 0 1 32 30" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.8"/>
      <path d="M34 22 Q40 18 42 22 Q40 26 34 24 Z" fill="#22c55e"/>
    </svg>
    <div style="color: #34d399; font-weight: bold; font-size: 13px; margin-top: 6px;">薬草（Potion）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 15 回復</div>
  </div>

  <!-- 大きなパン（新・丸パンデザイン） -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <!-- 影 -->
      <ellipse cx="32" cy="56" rx="20" ry="5" fill="rgba(0,0,0,0.35)"/>
      <!-- パン本体 -->
      <path d="M12 44 C12 24 22 14 32 14 C42 14 52 24 52 44 C52 52 44 54 32 54 C20 54 12 52 12 44 Z" fill="#d97706" stroke="#78350f" stroke-width="2"/>
      <!-- こんがり焼き色のグラデーション層 -->
      <path d="M15 42 C15 26 23 18 32 18 C41 18 49 26 49 42 C49 48 42 50 32 50 C22 50 15 48 15 42 Z" fill="#f59e0b" opacity="0.85"/>
      <!-- 十文字のクープ（パンの切り込み）から覗くふんわり白い中身 -->
      <ellipse cx="32" cy="30" rx="14" ry="4" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
      <ellipse cx="32" cy="30" rx="4" ry="12" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
      <!-- クープの割れ目ライン -->
      <line x1="18" y1="30" x2="46" y2="30" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="32" y1="18" x2="32" y2="42" stroke="#92400e" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 表面の小麦粉（粉糖）ハイライト -->
      <ellipse cx="24" cy="22" rx="4" ry="2" fill="#ffffff" opacity="0.6"/>
      <ellipse cx="40" cy="24" rx="3" ry="1.5" fill="#ffffff" opacity="0.6"/>
      <!-- 麦の穂アクセント -->
      <path d="M38 46 Q44 44 46 48" stroke="#78350f" stroke-width="1.5" fill="none"/>
    </svg>
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">大きなパン（Bread）</div>
    <div style="color: #94a3b8; font-size: 11px;">満腹度 50% 回復</div>
  </div>

  <!-- 鉄の剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
      <g transform="rotate(45 32 32)">
        <polygon points="32,6 36,12 35,42 29,42 28,12" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="32" y1="8" x2="32" y2="42" stroke="#64748b" stroke-width="1.5"/>
        <polygon points="32,8 35,14 34,38 32,38" fill="#ffffff" opacity="0.7"/>
        <rect x="22" y="42" width="20" height="4.5" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1"/>
        <circle cx="32" cy="44" r="2" fill="#fbbf24"/>
        <rect x="30" y="46.5" width="4" height="10" rx="1" fill="#1e293b"/>
        <circle cx="32" cy="58" r="3.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
        <circle cx="32" cy="58" r="1.5" fill="#38bdf8"/>
      </g>
    </svg>
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">鉄の剣（Weapon）</div>
    <div style="color: #94a3b8; font-size: 11px;">攻撃力 +4</div>
  </div>

  <!-- 鋼の盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
      <path d="M16 16 L48 16 Q48 38 32 54 Q16 38 16 16 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="2"/>
      <path d="M19 19 L45 19 Q45 36 32 50 Q19 36 19 19 Z" fill="#1e40af" stroke="#fbbf24" stroke-width="2.5"/>
      <polygon points="32,24 34,31 41,31 35,35 37,42 32,38 27,42 29,35 23,31 30,31" fill="#fbbf24"/>
      <circle cx="32" cy="33" r="2.5" fill="#ef4444"/>
      <circle cx="21" cy="21" r="1.5" fill="#fbbf24"/>
      <circle cx="43" cy="21" r="1.5" fill="#fbbf24"/>
      <path d="M22 22 L38 22" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    </svg>
    <div style="color: #a78bfa; font-weight: bold; font-size: 13px; margin-top: 6px;">鋼の盾（Shield）</div>
    <div style="color: #94a3b8; font-size: 11px;">防御力 +3</div>
  </div>

  <!-- ワープの巻物 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
      <rect x="12" y="16" width="40" height="4" rx="2" fill="#78350f"/>
      <circle cx="12" cy="18" r="3" fill="#b45309"/>
      <circle cx="52" cy="18" r="3" fill="#b45309"/>
      <rect x="12" y="46" width="40" height="4" rx="2" fill="#78350f"/>
      <circle cx="12" cy="48" r="3" fill="#b45309"/>
      <circle cx="52" cy="48" r="3" fill="#b45309"/>
      <rect x="15" y="18" width="34" height="30" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
      <line x1="20" y1="24" x2="44" y2="24" stroke="#c084fc" stroke-width="2" stroke-dasharray="3,2"/>
      <line x1="20" y1="29" x2="38" y2="29" stroke="#c084fc" stroke-width="2" stroke-dasharray="4,2"/>
      <line x1="20" y1="34" x2="44" y2="34" stroke="#c084fc" stroke-width="2" stroke-dasharray="2,3"/>
      <line x1="20" y1="39" x2="32" y2="39" stroke="#c084fc" stroke-width="2" stroke-dasharray="3,2"/>
      <rect x="30" y="18" width="4" height="30" fill="#ec4899"/>
      <circle cx="32" cy="33" r="5" fill="#f43f5e" stroke="#fbbf24" stroke-width="1.5"/>
      <polygon points="32,30 33,32 35,32 33,34 34,36 32,35 30,36 31,34 29,32 31,32" fill="#fbbf24"/>
    </svg>
    <div style="color: #f472b6; font-weight: bold; font-size: 13px; margin-top: 6px;">ワープの巻物（Scroll）</div>
    <div style="color: #94a3b8; font-size: 11px;">安全な部屋へ転移</div>
  </div>

  <!-- 特薬草 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
      <rect x="28" y="10" width="8" height="6" rx="1" fill="#7c3aed" stroke="#5b21b6" stroke-width="1.5"/>
      <ellipse cx="32" cy="10" rx="4" ry="1.5" fill="#a855f7"/>
      <rect x="26" y="16" width="12" height="4" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="32" cy="40" r="17" fill="rgba(30,27,75,0.4)" stroke="#a855f7" stroke-width="2"/>
      <path d="M17 40 C17 50 24 57 32 57 C40 57 47 50 47 40 Q39 38 32 40 Q25 42 17 40 Z" fill="#06b6d4"/>
      <circle cx="28" cy="45" r="2.5" fill="#67e8f9"/>
      <circle cx="36" cy="48" r="1.5" fill="#a5f3fc"/>
      <polygon points="32,24 33.5,28 38,28 34.5,31 36,35 32,32.5 28,35 29.5,31 26,28 30.5,28" fill="#fbbf24"/>
    </svg>
    <div style="color: #22d3ee; font-weight: bold; font-size: 13px; margin-top: 6px;">特薬草（Potion）</div>
    <div style="color: #94a3b8; font-size: 11px;">HP 40 回復</div>
  </div>

  <!-- 力の種 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
      <path d="M32 14 C20 24 16 38 22 48 C28 58 36 58 42 48 C48 38 44 24 32 14 Z" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
      <path d="M32 18 C24 26 21 37 25 45 C29 53 35 53 39 45 C43 37 40 26 32 18 Z" fill="#f97316"/>
      <ellipse cx="28" cy="30" rx="3" ry="8" transform="rotate(-20 28 30)" fill="#ffedd5" opacity="0.6"/>
      <polygon points="32,30 33,33 36,33 33.5,35 34.5,38 32,36 29.5,38 30.5,35 28,33 31,33" fill="#fef08a"/>
    </svg>
    <div style="color: #fb923c; font-weight: bold; font-size: 13px; margin-top: 6px;">力の種（Seed）</div>
    <div style="color: #94a3b8; font-size: 11px;">最大HP+3 / 攻撃力+1</div>
  </div>

  <!-- ミスリルの剣 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="16" ry="4" fill="rgba(0,0,0,0.35)"/>
      <g transform="rotate(45 32 32)">
        <polygon points="32,4 37,12 36,42 28,42 27,12" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="32" y1="6" x2="32" y2="42" stroke="#0284c7" stroke-width="1.5"/>
        <polygon points="32,6 36,12 35,40 32,40" fill="#ffffff" opacity="0.8"/>
        <rect x="20" y="42" width="24" height="5" rx="2" fill="#0284c7" stroke="#0369a1" stroke-width="1"/>
        <circle cx="32" cy="44.5" r="2.5" fill="#38bdf8"/>
        <rect x="30" y="47" width="4" height="10" rx="1" fill="#0f172a"/>
        <circle cx="32" cy="58" r="4" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
        <circle cx="32" cy="58" r="1.5" fill="#ffffff"/>
      </g>
    </svg>
    <div style="color: #38bdf8; font-weight: bold; font-size: 13px; margin-top: 6px;">ミスリルの剣（Weapon）</div>
    <div style="color: #94a3b8; font-size: 11px;">攻撃力 +8</div>
  </div>

  <!-- ドラゴンの盾 -->
  <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px; text-align: center; width: 140px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="72" height="72">
      <ellipse cx="32" cy="58" rx="18" ry="4.5" fill="rgba(0,0,0,0.35)"/>
      <path d="M14 14 L50 14 Q50 38 32 56 Q14 38 14 14 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="2"/>
      <path d="M17 17 L47 17 Q47 36 32 52 Q17 36 17 17 Z" fill="#b91c1c" stroke="#f59e0b" stroke-width="2.5"/>
      <polygon points="32,22 36,30 44,32 38,38 39,46 32,42 25,46 26,38 20,32 28,30" fill="#f59e0b"/>
      <circle cx="32" cy="34" r="3.5" fill="#dc2626"/>
      <path d="M22 20 L42 20" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
    </svg>
    <div style="color: #ef4444; font-weight: bold; font-size: 13px; margin-top: 6px;">ドラゴンの盾（Shield）</div>
    <div style="color: #94a3b8; font-size: 11px;">防御力 +6</div>
  </div>
</div>

---

## 4. ダンジョンギミック＆設備（Dungeon Features & Stairs）

従来の文字記号 `▼` から完全脱却し、下層深淵への開口部と重厚な石段を描いたベクターSVGグラフィックに刷新されました。

### 下り階段（Stairs Down）ビジュアルプレビュー

<div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px;">
  <div style="background-color: #0f172a; border: 1px solid #d97706; border-radius: 12px; padding: 16px; text-align: center; width: 160px;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="88" height="88">
      <rect x="2" y="2" width="60" height="60" rx="3" fill="#1e293b" stroke="#0f172a" stroke-width="2"/>
      <rect x="6" y="6" width="52" height="52" rx="2" fill="#090d16"/>
      <!-- 下層への暗黒開口部 -->
      <polygon points="8,8 56,8 50,56 14,56" fill="#030712"/>
      <!-- 1段目（最も手前） -->
      <polygon points="10,48 54,48 52,56 12,56" fill="#475569" stroke="#1e293b" stroke-width="1"/>
      <rect x="12" y="48" width="40" height="2.5" fill="#64748b"/>
      <!-- 2段目 -->
      <polygon points="12,40 52,40 50,48 14,48" fill="#334155" stroke="#1e293b" stroke-width="1"/>
      <rect x="14" y="40" width="36" height="2" fill="#475569"/>
      <!-- 3段目 -->
      <polygon points="14,32 50,32 48,40 16,40" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
      <rect x="16" y="32" width="32" height="1.8" fill="#334155"/>
      <!-- 4段目 -->
      <polygon points="16,24 48,24 46,32 18,32" fill="#0f172a" stroke="#030712" stroke-width="1"/>
      <rect x="18" y="24" width="28" height="1.5" fill="#1e293b"/>
      <!-- 5段目（奥の暗がり） -->
      <polygon points="18,16 46,16 44,24 20,24" fill="#030712"/>
      <!-- 左右の石壁手すり -->
      <path d="M4 4 L10 8 L10 56 L4 60 Z" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
      <path d="M60 4 L54 8 L54 56 L60 60 Z" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
      <!-- 誘導の黄金インジケータ（光る下り矢印） -->
      <polygon points="32,22 38,15 26,15" fill="#fbbf24"/>
      <polygon points="32,32 37,25 27,25" fill="#f59e0b" opacity="0.7"/>
    </svg>
    <div style="color: #fbbf24; font-weight: bold; font-size: 13px; margin-top: 6px;">下り階段（Stairs Down）</div>
    <div style="color: #94a3b8; font-size: 11px;">次フロアへの降り口</div>
  </div>
</div>

### 演出仕様
- **呼吸する黄金グロー光彩**:
  - 現在視界内（`isVisible`）にある場合、階段背面から半径 `s * 0.55` の黄金円形グラデーションパルスが `0.35 ± 0.15` の透明度で穏やかに脈動し、暗いフロア内での発見と目標到達の視認性を劇的に向上。
- **暗がりでの記憶表示**:
  - 探索済みだが視界外の場合、半透明（`opacity = 0.45`）の落ち着いたトーンで配置記憶を描画。

---

## 5. 装備グラフィック動的反映システム（Paperdoll Equipment System）

プレイヤーは素体（Base）として描画され、インベントリで装備している武器および盾がある場合のみ、向いている方向（8方向）と歩行アニメーションに同期して手元・背中にリアルタイム動的合成されます。

### 武器バリエーション（全5種）
| 武器名称 | カテゴリ | 補正効果 | グラフィック特徴 |
| :--- | :--- | :--- | :--- |
| **青銅の短剣** | WEAPON | 攻撃力 +2 | 取り回しの良い軽量な青銅色ショートブレード |
| **鉄の剣** | WEAPON | 攻撃力 +4 | 鍛えられた鋼鉄片手剣、黄金の鍔とポメル |
| **ミスリルの剣** | WEAPON | 攻撃力 +7 | 神秘的な銀白と蒼光を放つ細身の魔導剣 |
| **炎の剣** | WEAPON | 攻撃力 +10 | 紅蓮の業火を纏う燃え盛る名剣 |
| **ルーンの剣** | WEAPON | 攻撃力 +12 | 古代魔法文字が刻まれた紫光の伝説魔剣 |

### 盾バリエーション（全5種）
| 盾名称 | カテゴリ | 補正効果 | グラフィック特徴 |
| :--- | :--- | :--- | :--- |
| **木の盾** | SHIELD | 防御力 +1 | 軽くて温かみのある木目調の丸盾 |
| **青銅の盾** | SHIELD | 防御力 +2 | 青銅で鍛造された頑丈な小型バックラー |
| **鋼の盾** | SHIELD | 防御力 +4 | 堅牢な銀鋼ヒーターシールド、十字星エンブレム |
| **魔法の盾** | SHIELD | 防御力 +6 | 蒼い魔導障壁と水晶コアが輝く魔法盾 |
| **ドラゴンの盾** | SHIELD | 防御力 +8 | 紅蓮の竜鱗で覆われた威風堂々たる大盾 |

---

## 6. 追加モンスター（New Monsters / 全10種体制）

新たに4種の強力・個性的なモンスターを追加し、全10種の生態系を構築しました。

| モンスター種 | 主な生息地 | HP/ATK/DEF/EXP | 行動特徴・ビジュアル |
| :--- | :--- | :--- | :--- |
| **吸血コウモリ（BAT）** | 洞窟・水流 | 11 / 4 / 1 / 7 | 暗闇を素早く羽ばたく紫黒の翼と光る赤い瞳 |
| **彷徨う亡霊（GHOST）** | 旧遺跡・地下湖 | 18 / 6 / 4 / 16 | 青白く揺らめくアンデッド霊体、高い防御力 |
| **ダークメイジ（MAGE）** | 深層全域 | 22 / 9 / 2 / 22 | 尖がりフードと魔力の杖を携えた高火力魔術師 |
| **レッドドラゴン（DRAGON）** | B8F以降の深層 | 42 / 13 / 5 / 45 | 巨大な角と竜翼、黄金の瞳を持つ深層の覇者 |

---

## 7. 追加アイテム＆消費効果

| アイテム名 | カテゴリ | 効果 | ビジュアル |
| :--- | :--- | :--- | :--- |
| **特製おにぎり** | FOOD | 満腹度 35%回復 | 三角形ご飯に海苔が巻かれた香ばしいおにぎり |
| **剛力の秘薬** | POTION | 基礎攻撃力 +2永続上昇 | 深紅のエリクサーが満たされた秘薬瓶 |
| **雷の巻物** | SCROLL | 視界内の敵全員に15ダメージ | 稲妻の紋章が刻まれた黄金の巻物 |
| **あかりの巻物** | SCROLL | フロア全域の構造・敵を開示 | 神秘のシアン光を放つ魔導巻物 |

---

## 8. アートスタイル＆世界観の統一基準（Art Style & Tone and Manner）

- **中世クラシックファンタジーの統一**:
  - キャラクター（青マントの重装騎士、スライム、小鬼ゴブリン、不死骨剣士）の世界観と親和性の高いデザイン基準を維持。
- **線画・アウトラインの規約**:
  - 全アセット共通で外形線は `1.5px` 〜 `2.0px` のダークスレート系カラー（`#1e293b`, `#0f172a`, `#78350f`）を使用し、視認性を担保。
- **ドロップシャドウと接地感**:
  - 足元およびアイテム下部には一貫して半透明の楕円シャドウ（`rgba(0,0,0,0.3)` 〜 `0.35`）を配置し、ダンジョンタイルの暗がりから浮き上がらない接地感と立体感を両立。

---

## 9. 完全オフライン & ベクターレンダリング方針
- **外部通信ゼロ**: すべてのSVGグラフィックはインライン文字列として定義され、Data URL経由でメモリキャッシュされます。
- **高解像度 (HiDPI)**: ベクターデータのためRetinaディスプレイやスマートフォン画面でも一切ドット崩れ・にじみが生じません。
- **Service Workerキャッシュ**: Service Workerによる完全ローカルキャッシュでオフライン動作を完全担保しています。

