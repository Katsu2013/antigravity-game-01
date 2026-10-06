/**
 * @file main.ts
 * @description アプリケーションのエントリーポイント。
 * DOM読み込み完了時にゲームエンジン、描画システム、UI、入力を統合初期化し、
 * オフライン動作のための Service Worker の登録および IndexedDB 中断セーブの復元を行います。
 */

import { GameEngine } from './core/GameEngine';
import { InputManager } from './input/InputManager';
import { CanvasRenderer } from './render/CanvasRenderer';
import { StorageManager } from './storage/StorageManager';
import { UIManager } from './ui/UIManager';

/**
 * Service Worker を登録し、オフラインSPAおよびPWA機能を有効化します。
 * 新しいバージョンがサーバーに配備された場合は自動更新チェックと即時同期を実行します。
 */
function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.log(
            'Service Worker registered successfully with scope:',
            registration.scope
          );

          // 起動時に最新のService Workerが存在するかサーバーへ確認
          registration.update().catch((err) => {
            console.warn('Service Worker update check failed:', err);
          });

          // 新バージョンインストール完了検知時に即時アクティベート要求
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (
                  installingWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('New Service Worker installed, requesting skipWaiting...');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });

      // 新しい Service Worker がクライアント制御を開始した際に最新版へ自動リフレッシュ
      let isRefreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!isRefreshing) {
          isRefreshing = true;
          console.log('Service Worker controller changed, reloading page...');
          window.location.reload();
        }
      });
    });
  }
}

/**
 * DOMコンテンツ読み込み完了イベントハンドラ。
 * 主要サブシステムのインスタンス化、中断データ復元、サブスクリプション配線を行います。
 */
window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const container = document.getElementById('canvas-container') as HTMLElement;

  if (!canvas || !container) {
    console.error('Canvas or container not found');
    return;
  }

  // 1. コアゲームエンジンの初期化
  const engine = new GameEngine();

  // 2. 描画エンジンの初期化
  const renderer = new CanvasRenderer(canvas, container, engine);

  // 3. UIマネージャーの初期化
  const ui = new UIManager(engine);

  // 4. 入力抽象化マネージャーの初期化
  new InputManager(engine, renderer, ui, canvas);

  // 5. 状態変化リスナーの登録（ゲームエンジンからの状態更新イベントで再描画とUI更新を同期）
  engine.subscribe(() => {
    renderer.render();
    ui.update();
  });

  // 6. 画面状態と中断セーブデータの確認
  // ユーザーが「ゲームプレイ中」にブラウザを閉じた場合のみ直接ゲーム画面へ復帰。
  // 「タイトル画面」にいた場合や、まだ開始していない場合はタイトル画面を表示（再開ボタンは活性化）。
  const currentScreen = StorageManager.loadCurrentScreen();
  const hasSave = await StorageManager.hasCurrentRun();

  if (currentScreen === 'playing' && hasSave) {
    const resumed = await engine.resumeSavedGame();
    if (resumed) {
      ui.hideTitleScreen();
      ui.showToast(`B${engine.player.floor}F の直前の状態から復帰しました`, 3000);
    } else {
      await ui.showTitleScreen();
    }
  } else {
    // タイトル画面で閉じられた場合、またはセーブがない場合はタイトル画面を表示
    await ui.showTitleScreen();
  }

  // 7. 初回フレームの描画およびUI反映
  renderer.render();
  ui.update();

  // 8. ブラウザ終了・タブ閉じ・ページリロード・アプリ切り替え時の直前同期セーブ
  window.addEventListener('beforeunload', () => {
    engine.saveGameSync();
  });
  window.addEventListener('pagehide', () => {
    engine.saveGameSync();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      engine.saveGameSync();
    }
  });

  // 9. 完全オフラインPWAのための Service Worker 登録
  registerServiceWorker();

  console.log('RogueLabyrinth initialized successfully with auto-resume & offline support.');
});
