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
   * 現在のゲーム状態（プレイヤー、マップ、ログ）をIndexedDBに自動保存します。
   *
   * @param data - 保存する中断セーブデータ
   * @returns 保存完了を示すPromise
   */
  public static async saveCurrentRun(data: SavedRunData): Promise<void> {
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
   * IndexedDBから進行中の中断セーブデータを読み込みます。
   *
   * @returns 保存されていたセーブデータ。存在しない場合は null
   */
  public static async loadCurrentRun(): Promise<SavedRunData | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.STORE_CURRENT_RUN, 'readonly');
        const store = tx.objectStore(this.STORE_CURRENT_RUN);
        const req = store.get(this.KEY_ACTIVE_RUN);

        req.onsuccess = () => {
          resolve((req.result as SavedRunData) || null);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Failed to load run data from IndexedDB:', err);
      return null;
    }
  }

  /**
   * 進行中のセーブデータを完全に削除します（プレイヤー死亡時やゲームリセット時に呼び出されます）。
   *
   * @returns 削除完了を示すPromise
   */
  public static async clearCurrentRun(): Promise<void> {
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
