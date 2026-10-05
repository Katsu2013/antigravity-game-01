# RogueLabyrinth（ローグラビリンス）

Webブラウザ上で動作する、PC・スマートフォン（縦/横）両対応の**完全オフラインSPA ターン制ローグライクRPG**です。  
本プロジェクトは、AIエージェント統合開発環境 **Google Antigravity** 上で、**Gemini 3.8 Flash** を活用して設計・実装されています。

---

## プロジェクト概要

- **ジャンル**: 王道ターン制ダンジョン探索型ローグライク（不思議のダンジョン系）
- **開発環境 / AI**: **Google Antigravity**（モデル: **Gemini 3.8 Flash**）
- **対応環境**: PC（キーボード/マウス）、スマートフォン・タブレット（タッチ/仮想パッド）
- **アーキテクチャ**: 完全オフラインSPA / PWA（Service Worker + IndexedDB）
- **技術スタック**: TypeScript + Vite + HTML5 2D Canvas (HiDPI対応) + Tailwind CSS

---

## 開発・実行コマンド

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (PC: http://localhost:3000 / スマホ: http://<ローカルIP>:3000)
npm run dev

# プロダクションビルド (TypeScript型チェック + バンドル)
npm run build

# TypeDoc APIリファレンスドキュメントの生成 (docs/api/ にHTML出力)
npm run doc
```

---

## GitHubでの自動ビルド＆公開（GitHub Pages）

本プロジェクトは外部サーバーを一切必要としない完全静的SPA（Single Page Application）として設計されているため、**GitHubにプッシュするだけでGitHub Actionsが自動ビルドを実行し、GitHub Pages上で即座に遊ぶことができます。**

### 公開手順（わずか3ステップ）
1. **GitHubリポジトリを作成してプッシュ**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```
2. **GitHubリポジトリの設定**:
   - リポジトリの **[Settings]** → **[Pages]** を開く。
   - **Build and deployment** の **Source** を `Deploy from a branch` から **`GitHub Actions`** に変更する。
3. **プレイ開始**:
   - プッシュに伴い `.github/workflows/deploy.yml` が自動起動し、約1分でビルド・公開が完了します。
   - 発行されたURL（`https://<あなたのユーザー名>.github.io/<リポジトリ名>/`）にアクセスすれば、PC・スマートフォンのブラウザでそのまま遊べます！
   - スマートフォンでは「ホーム画面に追加」することで、電波のないオフライン環境でも起動できる全画面PWAアプリになります。


---

## 操作体系（十字キー ＋ 4ボタン）

直感的で親しみやすいクラシックゲームパッド風の操作体系を採用しています。

| ボタン | 役割 | PCキーボード | スマホ操作 |
|---|---|---|---|
| **十字キー** | 8方向移動 / 正面の敵へ攻撃 | `WASD` / `矢印` / `テンキー` | 画面左側の8方向十字キー |
| **[A] ボタン** | 決定 / 正面の敵へ攻撃 / 階段降り / 拾う / 素振り | `Z` / `J` / `Enter` | 画面右側 [A 決定] ボタン (緑) |
| **[B] ボタン** | その場で1ターン足踏み (HP回復) | `X` / `K` / `Space` | 画面右側 [B 足踏] ボタン (赤) |
| **[X] ボタン** | 所持品一覧（インベントリ）開閉 | `C` / `I` / `Tab` | 画面右側 [X 持物] ボタン (青) |
| **[Y] ボタン** | ミニマップ表示のON / OFF切替 | `V` / `M` | 画面右側 [Y MAP] ボタン (黄) / 上部HUD |

---

## ドキュメント一覧

- 📜 **[ゲーム企画書 (GDD)](docs/01_game_design.md)**: ゲームルール、操作仕様、リソース設計
- 🏗️ **[システムアーキテクチャ設計書](docs/02_architecture.md)**: 全体構成、PWA、IndexedDB、各種アルゴリズム
- 🗺️ **[開発ロードマップ & マイルストーン](docs/03_roadmap.md)**: 開発工程とフェーズ詳細
- 👾 **[キャラクター一覧＆グラフィック設計書](docs/04_characters.md)**: 各キャラクターのSVGグラフィックプレビュー、AI、アニメーション仕様
- 🏆 **[タイトル画面＆スコア履歴設計書](docs/05_title_and_scores.md)**: タイトルUI、スコア算出式、ランキング仕様、パーマデス連携
- 🌲 **[ダンジョンバイオーム＆フロア構成設計書](docs/06_biomes_and_floors.md)**: 7大バイオーム（石・赤土・旧遺跡・清流洞・地下湖・雪原・氷窟）、連続水流・木橋アルゴリズム、正面敵攻撃・素振り仕様
- 📚 **[TypeDoc APIリファレンス (HTML)](docs/api/index.html)**: 各クラス・メソッド・型の詳細仕様（`npm run doc` で生成）

---

## ソースコード構成とTypeDoc対応状況

本リポジトリの全TypeScriptソースコードには、レビューおよび保守を円滑に行えるよう、**TypeDoc標準に準拠した包括的な日本語ドキュメンテーションコメント**（クラス、プロパティ、メソッド、定数、引数 `@param`、返り値 `@returns`）を記述しています。

| ファイル | 概要・役割 |
|---|---|
| [`src/core/types.ts`](src/core/types.ts) | タイル種別(`TileType`)、バイオーム(`BiomeType`)、座標(`Point`)、アクション(`ActionType`)、ステータス等の型定義 |
| [`src/core/algorithms/DungeonGenerator.ts`](src/core/algorithms/DungeonGenerator.ts) | 手続き型ダンジョン自動生成（部屋配置・重なり判定・通路掘削・7大バイオーム・連続水流・木橋・全域到達性保証） |
| [`src/core/algorithms/FOV.ts`](src/core/algorithms/FOV.ts) | プレイヤー視界計算（部屋一括可視化 ＋ 360度レイキャスティング） |
| [`src/core/algorithms/Pathfinding.ts`](src/core/algorithms/Pathfinding.ts) | A*（A-Star）探索によるモンスターの最短経路探索アルゴリズム |
| [`src/core/entities/EntityFactory.ts`](src/core/entities/EntityFactory.ts) | モンスター（全10種）およびアイテム（全16種）のインスタンス生成・階層スケーリングファクトリ |
| [`src/core/systems/CombatSystem.ts`](src/core/systems/CombatSystem.ts) | 近接攻撃、ダメージ計算式、撃破判定、経験値獲得およびレベルアップ処理（HP回復バランス調整済み） |
| [`src/core/systems/ItemSystem.ts`](src/core/systems/ItemSystem.ts) | アイテム拾得、使用・消費・装備変更、および足元投棄処理 |
| [`src/core/GameEngine.ts`](src/core/GameEngine.ts) | コアゲームステート統括、ターン進行、モンスター自律AI、行動ログ管理 |
| [`src/storage/StorageManager.ts`](src/storage/StorageManager.ts) | IndexedDB による1ターンごとの自動中断セーブ・復元・パーマデス消去・ハイスコア記録 |
| [`src/render/sprites/SVGSprites.ts`](src/render/sprites/SVGSprites.ts) | 100%ベクターSVGスプライト定義（プレイヤー素体8方向＋歩行アニメ・倒れ姿、モンスター、基本アイテム、下り階段） |
| [`src/render/sprites/EquipmentSprites.ts`](src/render/sprites/EquipmentSprites.ts) | 装備品（武器5種・盾5種×各5方向＝全50種）の動的オーバーレイ（ペーパードールシステム）スプライト |
| [`src/render/sprites/MonsterAndItemSprites.ts`](src/render/sprites/MonsterAndItemSprites.ts) | 拡張モンスター4種（コウモリ・亡霊・メイジ・ドラゴン）および拡張アイテムスプライト |
| [`src/render/sprites/TileSprites.ts`](src/render/sprites/TileSprites.ts) | 7大バイオーム壁・床（高コントラスト設計）および木製の橋スプライト |
| [`src/render/AnimationEngine.ts`](src/render/AnimationEngine.ts) | 移動イージング補間、歩行ステップ、攻撃スラッシュ、被弾フラッシュ＆振動、死亡ダウン演出管理 |
| [`src/render/CanvasRenderer.ts`](src/render/CanvasRenderer.ts) | HiDPI対応 60fps描画エンジン、装備ペーパードール合成、環境大気パーティクル（粉雪・氷晶）、ミニマップ |
| [`src/input/InputManager.ts`](src/input/InputManager.ts) | PCキーボード/マウス ＋ スマホ仮想十字キー＆4ボタンの入力を統一アクションへ変換 |
| [`src/ui/UIManager.ts`](src/ui/UIManager.ts) | レスポンシブDOM UI（HUD、インベントリ、行動ログ、モーダルダイアログ）の更新 |
| [`src/main.ts`](src/main.ts) | アプリケーションエントリーポイント（Service Worker登録・中断データ復元） |
| [`public/sw.js`](public/sw.js) | 完全オフライン動作を提供する Service Worker（Cache-First戦略） |
| [`public/manifest.json`](public/manifest.json) | PWA設定ファイル（スマホホーム画面追加・スタンドアロン全画面起動） |
