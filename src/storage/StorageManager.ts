/**
 * @file StorageManager.ts
 * @description IndexedDB を用いたゲームデータのローカル永続化マネージャー。
 * 1ターンごとの自動中断セーブ（オートセーブ）、ゲーム再開時のデータ復元、
 * 死亡時のセーブデータ消去（パーマデス担保）、およびハイスコア・戦歴の保存を担当します。
 */

import { DungeonMap, GameLogEntry, PlayerState } from '../core/types';

/**
 * 進行中ゲームの中断セーブデータを表すインターフェース。
 */
export interface SavedRunData {
  /** プレイヤーのステータス情報 */
  player: PlayerState;
  /** 現在フロアのマップデータ（タイル、敵、アイテム、視界、探索状況） */
  map: DungeonMap;
  /** 直近の行動ログ履歴 */
  logs: GameLogEntry[];
  /** セーブが実行されたUNIXタイムスタンプ（ミリ秒） */
  timestamp: number;
}

/**
 * 冒険終了時のスコア・戦歴実績を表すインターフェース。
 */
export interface RunStats {
  /** 自動採番キー（IDB生成時） */
  id?: number;
  /** 到達した最大階層 */
  floor: number;
  /** 最終レベル */
  level: number;
  /** 生存ターン数 */
  turn: number;
  /** 算出された総合冒険スコア */
  score: number;
  /** 冒険の結末・死因メッセージ */
  causeOfDeath: string;
  /** 記録日時UNIXタイムスタンプ */
  timestamp: number;
}

/**
 * IndexedDB との通信およびデータ永続化を統括するシングルトン風マネージャークラス。
 */
export class StorageManager {
  /** IndexedDB データベース名 */
  private static readonly DB_NAME = 'RogueLabyrinthDB';

  /** データベーススキーマバージョン */
  private static readonly DB_VERSION = 1;

  /** 中断セーブデータ用オブジェクトストア名 */
  private static readonly STORE_CURRENT_RUN = 'current_run';

  /** 通算戦歴・ハイスコア用オブジェクトストア名 */
  private static readonly STORE_HIGHSCORES = 'highscores';

  /** 中断セーブデータのプライマリキー名 */
  private static readonly KEY_ACTIVE_RUN = 'active';

  /** ブラウザ終了・クラッシュ時にも即時同期書き込み可能なlocalStorageバックアップキー名 */
  private static readonly LOCAL_STORAGE_KEY = 'RogueLabyrinth_ActiveRun';

  /** 現在表示されている画面状態（タイトルかプレイ中か）を記録するlocalStorageキー名 */
  private static readonly LOCAL_STORAGE_SCREEN_KEY = 'RogueLabyrinth_CurrentScreen';

  /** 開かれたIDBDatabaseインスタンスのキャッシュ */
  private static dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * IndexedDBへの接続を取得します。未接続の場合は初期化およびオブジェクトストアの作成を行います。
   *
   * @returns 解決された IDBDatabase インスタンス
   */
  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      // IndexedDBのサポート確認
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // 進行中データストア（キー: 'active'）
        if (!db.objectStoreNames.contains(this.STORE_CURRENT_RUN)) {
          db.createObjectStore(this.STORE_CURRENT_RUN);
        }
        // ハイスコアストア（自動採番ID）
        if (!db.objectStoreNames.contains(this.STORE_HIGHSCORES)) {
          db.createObjectStore(this.STORE_HIGHSCORES, {
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * 現在のゲーム状態（プレイヤー、マップ、ログ）をlocalStorage（同期即時書き込み）
   * および IndexedDB（大容量非同期）に二重保存します。
   * ブラウザが強制終了された場合でも、直前の1手が確実に保持されます。
   *
   * @param data - 保存する中断セーブデータ
   * @returns 保存完了を示すPromise
   */
  public static async saveCurrentRun(data: SavedRunData): Promise<void> {
    // 1. 同期即時保存（localStorage）: ブラウザ即時終了時のデータ消失を完全に防止
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Failed to save run to localStorage backup:', e);
    }

    // 2. 非同期永続化（IndexedDB）
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_CURRENT_RUN, 'readwrite');
        const store = tx.objectStore(this.STORE_CURRENT_RUN);
        const req = store.put(data, this.KEY_ACTIVE_RUN);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to auto-save run data to IndexedDB:', err);
    }
  }

  /**
   * ブラウザ終了（beforeunload / pagehide）イベント用の完全同期セーブ処理。
   * イベントループ終了による非同期中断を防ぐため localStorage へ即座にコミットします。
   *
   * @param data - 保存する中断セーブデータ
   */
  public static saveCurrentRunSync(data: SavedRunData): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Failed to save sync run to localStorage:', e);
    }
  }

  /**
   * IndexedDBまたはlocalStorageから進行中の中断セーブデータを読み込みます。
   * IndexedDBから読み込めない場合でも、localStorageの同期バックアップから自動フォールバック復元します。
   *
   * @returns 保存されていたセーブデータ。存在しない場合は null
   */
  public static async loadCurrentRun(): Promise<SavedRunData | null> {
    // 1. まず IndexedDB からの読み込みを試行
    try {
      const db = await this.getDB();
      const idbData = await new Promise<SavedRunData | null>((resolve) => {
        const tx = db.transaction(this.STORE_CURRENT_RUN, 'readonly');
        const store = tx.objectStore(this.STORE_CURRENT_RUN);
        const req = store.get(this.KEY_ACTIVE_RUN);

        req.onsuccess = () => {
          resolve((req.result as SavedRunData) || null);
        };
        req.onerror = () => resolve(null);
      });

      if (idbData && idbData.player && idbData.player.isAlive) {
        return idbData;
      }
    } catch (err) {
      console.warn('IndexedDB read failed, falling back to localStorage:', err);
    }

    // 2. フォールバック: localStorage からの復元
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as SavedRunData;
          if (parsed && parsed.player && parsed.player.isAlive) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load backup run from localStorage:', e);
    }

    return null;
  }

  /**
   * 進行中のセーブデータを完全に削除します（プレイヤー死亡時やゲームリセット時に呼び出されます）。
   * IndexedDBおよびlocalStorageの両方のキャッシュを消去します。
   *
   * @returns 削除完了を示すPromise
   */
  public static async clearCurrentRun(): Promise<void> {
    // 1. localStorage から消去
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to clear localStorage backup:', e);
    }

    // 画面状態をタイトル画面にリセット
    this.saveCurrentScreen('title');

    // 2. IndexedDB から消去
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_CURRENT_RUN, 'readwrite');
        const store = tx.objectStore(this.STORE_CURRENT_RUN);
        const req = store.delete(this.KEY_ACTIVE_RUN);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to clear run data from IndexedDB:', err);
    }
  }

  /**
   * 現在の画面状態（タイトル画面かプレイ画面か）をlocalStorageに即時保存します。
   *
   * @param screen - 画面状態 ('title' | 'playing')
   */
  public static saveCurrentScreen(screen: 'title' | 'playing'): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.LOCAL_STORAGE_SCREEN_KEY, screen);
      }
    } catch (e) {
      console.warn('Failed to save current screen state:', e);
    }
  }

  /**
   * 前回の画面状態（タイトル画面かプレイ画面か）を取得します。
   * 未設定の場合はデフォルトで 'title' を返します。
   *
   * @returns 画面状態 ('title' | 'playing')
   */
  public static loadCurrentScreen(): 'title' | 'playing' {
    try {
      if (typeof localStorage !== 'undefined') {
        const screen = localStorage.getItem(this.LOCAL_STORAGE_SCREEN_KEY);
        if (screen === 'playing' || screen === 'title') {
          return screen;
        }
      }
    } catch (e) {
      console.warn('Failed to load current screen state:', e);
    }
    return 'title';
  }

  /**
   * 冒険結果の戦歴・スコアを記録します。
   *
   * @param stats - 記録する戦歴情報
   * @returns 保存完了を示すPromise
   */
  public static async saveHighscore(stats: RunStats): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_HIGHSCORES, 'readwrite');
        const store = tx.objectStore(this.STORE_HIGHSCORES);
        const req = store.add(stats);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to save highscore to IndexedDB:', err);
    }
  }

  /**
   * 中断セーブデータが存在するかどうかを高速判定します。
   *
   * @returns 有効な中断データが存在する場合は true
   */
  public static async hasCurrentRun(): Promise<boolean> {
    const run = await this.loadCurrentRun();
    return run !== null && run.player !== undefined && run.player.isAlive;
  }

  /**
   * 過去の全戦歴・ハイスコア履歴を取得します。
   * スコアの高い順（同一スコア時は日時の新しい順）にソートして返却します。
   *
   * @returns ソート済みの戦歴配列
   */
  public static async loadHighscores(): Promise<RunStats[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_HIGHSCORES, 'readonly');
        const store = tx.objectStore(this.STORE_HIGHSCORES);
        const req = store.getAll();

        req.onsuccess = () => {
          const list = (req.result as RunStats[]) || [];
          list.sort((a, b) => {
            if (b.score !== a.score) {
              return b.score - a.score;
            }
            return b.timestamp - a.timestamp;
          });
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to load highscores from IndexedDB:', err);
      return [];
    }
  }
}
