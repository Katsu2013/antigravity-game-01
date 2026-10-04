/**
 * @file main.ts
 * @description アプリケーションのエントリーポイント。
 * DOM読み込み完了時にゲームエンジン、描画システム、UI、入力を統合初期化し、
 * オフライン動作のための Service Worker の登録および IndexedDB 中断セーブの復元を行います。
 */

import { GameEngine } from './core/GameEngine';
import { InputManager } from './input/InputManager';
import { CanvasRenderer } from './render/CanvasRenderer';
import { UIManager } from './ui/UIManager';

/**
 * Service Worker を登録し、オフラインSPAおよびPWA機能を有効化します。
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
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
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

  // 6. 初回フレームの描画およびUI反映
  renderer.render();
  ui.update();

  // 7. タイトル画面の表示（セーブデータの有無を判定してボタンを活性化）
  await ui.showTitleScreen();

  // 8. 完全オフラインPWAのための Service Worker 登録
  registerServiceWorker();

  console.log('RogueLabyrinth initialized successfully with offline support & title screen.');
});
