/**
 * @file GameEngine.ts
 * @description コアゲーム状態の管理、ターン進行、戦闘解決、モンスターAI、アイテム操作、ログ管理、
 * および IndexedDB オートセーブ連携を行う統合ゲームエンジン。
 */

import { DungeonGenerator } from './algorithms/DungeonGenerator';
import { FOV } from './algorithms/FOV';
import { Pathfinding } from './algorithms/Pathfinding';
import { EntityFactory } from './entities/EntityFactory';
import { CombatSystem } from './systems/CombatSystem';
import { ItemSystem } from './systems/ItemSystem';
import { StorageManager } from '../storage/StorageManager';
import {
  ActionType,
  Direction8,
  DungeonMap,
  GameLogEntry,
  PlayerState,
  TileType,
} from './types';

/**
 * ゲーム全体のステートとルール進行を統括する中央エンジンクラス。
 */
export class GameEngine {
  /** 現在のダンジョンフロアの完全なマップ情報 */
  public map!: DungeonMap;

  /** プレイヤーの現在ステータス（座標、HP、満腹度等） */
  public player!: PlayerState;

  /** 行動ログの履歴リスト（新しいログが先頭） */
  public logs: GameLogEntry[] = [];

  /** 死亡時の敗因メッセージ（スコア記録用） */
  public lastDefeatCause = '';

  /** ログエントリの一意なIDを生成するための連番カウンタ */
  private logIdCounter = 0;

  /** ゲーム状態が変化した際に通知を受け取るコールバック関数のリスト */
  private listeners: (() => void)[] = [];

  /** 攻撃アニメーション発生時コールバック */
  public onAttack?: (
    attackerId: string,
    dx: number,
    dy: number,
    targetId: string
  ) => void;

  /** 被ダメージアニメーション発生時コールバック */
  public onDamage?: (targetId: string) => void;

  /**
   * GameEngine のインスタンスを生成し、初期フロアを生成してゲームを開始します。
   */
  constructor() {
    this.startNewGame();
  }

  /**
   * 到達階層、冒険者レベル、生存ターン数から総合冒険スコアを算出します。
   *
   * @param floor - 到達階層
   * @param level - 冒険者レベル
   * @param turn - 生存ターン数
   * @returns 総合スコア値
   */
  public static calculateScore(floor: number, level: number, turn: number): number {
    return floor * 1000 + level * 350 + turn * 10;
  }

  /**
   * IndexedDBの中断セーブデータを読み込み、前回の冒険を再開します。
   *
   * @returns 再開に成功した場合は true、データがない場合は false
   */
  public async resumeSavedGame(): Promise<boolean> {
    const saved = await StorageManager.loadCurrentRun();
    if (saved && saved.player && saved.player.isAlive && saved.map) {
      this.player = saved.player;
      this.map = saved.map;
      this.logs = saved.logs || [];
      this.lastDefeatCause = '';
      this.addLog('前回の冒険の続きを再開した。', 'turn-header');
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * ゲームエンジンを非同期初期化し、IndexedDBの中断セーブデータが存在すれば復元します。
   *
   * @returns 初期化完了を示すPromise
   */
  public async initAsync(): Promise<void> {
    await this.resumeSavedGame();
  }

  /**
   * ゲーム状態の変化を監視するリスナーを登録します。
   *
   * @param listener - 状態更新時に実行されるコールバック関数
   * @returns 登録解除用のアンサブスクライブ関数
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * 登録されているすべてのリスナーに対して状態変更を通知します。
   */
  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * 新しいゲームを初期ステータス（地下1階、初期アイテム所持）で開始します。
   * 既存のセーブデータはクリアされます。
   */
  public startNewGame(): void {
    StorageManager.clearCurrentRun();

    this.player = {
      x: 0,
      y: 0,
      direction: 'down',
      hp: 20,
      maxHp: 20,
      baseAtk: 5,
      baseDef: 1,
      atk: 5,
      def: 1,
      level: 1,
      exp: 0,
      nextExp: 10,
      hunger: 100,
      maxHunger: 100,
      floor: 1,
      turn: 1,
      inventory: [
        EntityFactory.createRandomItem(0, 0),
      ],
      equippedWeapon: null,
      equippedShield: null,
      isAlive: true,
    };

    // 初期アイテムとして薬草を確定支給
    this.player.inventory[0].name = '薬草';
    this.player.inventory[0].category = 'POTION';
    this.player.inventory[0].description = '飲むとHPが15回復する不思議な薬草。';
    this.player.inventory[0].value = 15;
    this.player.inventory[0].symbol = '!';
    this.player.inventory[0].color = '#10b981';

    this.logs = [];
    this.generateFloor(1);
    this.addLog('ダンジョン深部への冒険が始まった。', 'info');
  }

  /**
   * 指定した階層番号のフロアを生成し、プレイヤーを開始位置へ配置して初期視界を計算します。
   *
   * @param floorNum - 生成する階層番号（1 = B1F）
   */
  public generateFloor(floorNum: number): void {
    this.player.floor = floorNum;
    this.map = DungeonGenerator.generate(floorNum, 48, 36);

    // プレイヤーの配置
    this.player.x = this.map.startPos.x;
    this.player.y = this.map.startPos.y;

    // 視界の初期計算
    FOV.compute(this.map, { x: this.player.x, y: this.player.y });

    this.notify();
  }

  /**
   * プレイヤーからの要求アクションを実行し、ゲーム内時間を進めます。
   *
   * @param action - 実行するアクションオブジェクト
   * @returns ターンが実際に経過した場合は true、無効な移動などターンが経過しなかった場合は false
   */
  public executeAction(action: ActionType): boolean {
    // 死亡している場合はリスタートアクション以外を受け付けない
    if (!this.player.isAlive) {
      if (action.type === 'RESTART') {
        this.startNewGame();
        return true;
      }
      return false;
    }

    let turnPassed = false;

    switch (action.type) {
      case 'MOVE': {
        // 入力方向へプレイヤーの向き（8方向）を即座に更新
        let moveDir: Direction8 = 'down';
        if (action.dx !== 0 && action.dy !== 0) {
          if (action.dx > 0 && action.dy > 0) moveDir = 'down_right';
          else if (action.dx < 0 && action.dy > 0) moveDir = 'down_left';
          else if (action.dx > 0 && action.dy < 0) moveDir = 'up_right';
          else if (action.dx < 0 && action.dy < 0) moveDir = 'up_left';
        } else if (action.dx !== 0) {
          moveDir = action.dx > 0 ? 'right' : 'left';
        } else if (action.dy !== 0) {
          moveDir = action.dy > 0 ? 'down' : 'up';
        }
        this.player.direction = moveDir;

        const targetX = this.player.x + action.dx;
        const targetY = this.player.y + action.dy;

        // マップ範囲外チェック
        if (
          targetX < 0 ||
          targetX >= this.map.width ||
          targetY < 0 ||
          targetY >= this.map.height
        ) {
          this.notify();
          return false;
        }

        // 進行方向にモンスターがいるか判定（近接攻撃）
        const targetMonster = this.map.monsters.find(
          (m) => m.x === targetX && m.y === targetY
        );

        if (targetMonster) {
          this.onAttack?.('player', action.dx, action.dy, targetMonster.id);
          this.onDamage?.(targetMonster.id);
          const result = CombatSystem.playerAttack(this.player, targetMonster);
          this.addLog(
            `${targetMonster.name} に ${result.damage} のダメージを与えた！`,
            'damage'
          );

          if (result.isDefeated) {
            this.addLog(
              `${targetMonster.name} を倒した！ (${result.expGained} EXP獲得)`,
              'info'
            );
            this.map.monsters = this.map.monsters.filter(
              (m) => m.id !== targetMonster.id
            );

            if (result.didLevelUp) {
              this.addLog(
                `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
                'turn-header'
              );
            }
          }

          turnPassed = true;
          break;
        }

        // 壁・水路チェック（壁や水路に向かって方向キーを押した場合は向きのみ変更しターン消費なし）
        const targetTile = this.map.tiles[targetY][targetX];
        if (targetTile === TileType.Wall || targetTile === TileType.Water) {
          this.notify();
          return false;
        }

        // 移動実行
        this.player.x = targetX;
        this.player.y = targetY;
        turnPassed = true;

        // 足元のアイテム検知
        const groundItem = this.map.items.find(
          (it) => it.x === this.player.x && it.y === this.player.y
        );
        if (groundItem) {
          this.addLog(`足元に ${groundItem.name} が落ちている。`, 'info');
        }

        if (targetTile === TileType.StairsDown) {
          this.addLog('下り階段を見つけた。(Enterまたは階段ボタンで次へ)', 'info');
        }
        break;
      }

      case 'WAIT': {
        turnPassed = true;
        this.addLog('その場で周囲を警戒した。', 'normal');
        // 周囲隣接マス（8方向）に敵モンスターが存在する場合、その敵の方向へ自動で向き直る
        const nearMonster = this.map.monsters.find(
          (m) => Math.hypot(m.x - this.player.x, m.y - this.player.y) <= 1.5
        );
        if (nearMonster) {
          const dx = nearMonster.x - this.player.x;
          const dy = nearMonster.y - this.player.y;
          if (dx !== 0 && dy !== 0) {
            if (dx > 0 && dy > 0) this.player.direction = 'down_right';
            else if (dx < 0 && dy > 0) this.player.direction = 'down_left';
            else if (dx > 0 && dy < 0) this.player.direction = 'up_right';
            else if (dx < 0 && dy < 0) this.player.direction = 'up_left';
          } else if (dx !== 0) {
            this.player.direction = dx > 0 ? 'right' : 'left';
          } else if (dy !== 0) {
            this.player.direction = dy > 0 ? 'down' : 'up';
          }
        }
        break;
      }

      case 'PICKUP': {
        const result = ItemSystem.pickupItem(this.player, this.map);
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        break;
      }

      case 'INTERACT': {
        // 1. プレイヤーの向いている方向（8方向）の直前マスを計算
        let fdx = 0;
        let fdy = 1;
        switch (this.player.direction) {
          case 'up':
            fdx = 0;
            fdy = -1;
            break;
          case 'down':
            fdx = 0;
            fdy = 1;
            break;
          case 'left':
            fdx = -1;
            fdy = 0;
            break;
          case 'right':
            fdx = 1;
            fdy = 0;
            break;
          case 'up_left':
            fdx = -1;
            fdy = -1;
            break;
          case 'up_right':
            fdx = 1;
            fdy = -1;
            break;
          case 'down_left':
            fdx = -1;
            fdy = 1;
            break;
          case 'down_right':
            fdx = 1;
            fdy = 1;
            break;
        }

        const targetX = this.player.x + fdx;
        const targetY = this.player.y + fdy;

        // 正面マスにモンスターがいる場合は最優先で直接近接攻撃！
        const facingMonster = this.map.monsters.find(
          (m) => m.x === targetX && m.y === targetY
        );

        if (facingMonster) {
          this.onAttack?.('player', fdx, fdy, facingMonster.id);
          this.onDamage?.(facingMonster.id);
          const result = CombatSystem.playerAttack(this.player, facingMonster);
          this.addLog(
            `${facingMonster.name} に ${result.damage} のダメージを与えた！`,
            'damage'
          );
          if (result.isDefeated) {
            this.addLog(
              `${facingMonster.name} を倒した！ (${result.expGained} EXP獲得)`,
              'info'
            );
            this.map.monsters = this.map.monsters.filter(
              (m) => m.id !== facingMonster.id
            );
            if (result.didLevelUp) {
              this.addLog(
                `レベルが上がった！ (Lv.${this.player.level} / 最大HP: ${this.player.maxHp})`,
                'turn-header'
              );
            }
          }
          turnPassed = true;
          break;
        }

        // 2. 階段マス判定（足元）
        const currentTile = this.map.tiles[this.player.y][this.player.x];
        if (currentTile === TileType.StairsDown) {
          this.player.floor += 1;
          this.player.turn += 1;
          const nextBiome = DungeonGenerator.getBiomeForFloor(this.player.floor);
          this.addLog(
            `階段を降り、地下 ${this.player.floor} 階【${nextBiome.name}】へ進んだ。`,
            'info'
          );
          this.generateFloor(this.player.floor);
          return true;
        }

        // 3. 足元アイテム拾得判定
        const hasGroundItem = this.map.items.some(
          (it) => it.x === this.player.x && it.y === this.player.y
        );
        if (hasGroundItem) {
          const result = ItemSystem.pickupItem(this.player, this.map);
          this.addLog(result.message, result.success ? 'info' : 'warning');
          turnPassed = result.success;
          break;
        }

        // 4. 正面に敵がおらず足元にも階段・アイテムがない場合、正面に向かって素振り（空振り攻撃）を実行！
        this.onAttack?.('player', fdx, fdy, '');
        this.addLog('正面へ剣を素振りした。手応えはない。', 'normal');
        turnPassed = true;
        break;
      }

      case 'USE_ITEM': {
        const result = ItemSystem.useItem(this.player, this.map, action.itemId);
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        if (result.success) {
          FOV.compute(this.map, { x: this.player.x, y: this.player.y });
        }
        break;
      }

      case 'DROP_ITEM': {
        const result = ItemSystem.dropItem(this.player, this.map, action.itemId);
        this.addLog(result.message, result.success ? 'info' : 'warning');
        turnPassed = result.success;
        break;
      }

      case 'DESCEND': {
        const currentTile = this.map.tiles[this.player.y][this.player.x];
        if (currentTile === TileType.StairsDown) {
          this.player.floor += 1;
          this.player.turn += 1;
          this.addLog(`階段を降り、地下 ${this.player.floor} 階へ進んだ。`, 'info');
          this.generateFloor(this.player.floor);
          return true;
        } else {
          this.addLog('ここには降りる階段がない。', 'warning');
          this.notify();
          return false;
        }
      }

      case 'RESTART': {
        this.startNewGame();
        return true;
      }

      case 'REGEN': {
        this.addLog('フロアを再生成した。', 'info');
        this.generateFloor(this.player.floor);
        return true;
      }
    }

    if (turnPassed) {
      this.endTurn();
    }

    this.notify();
    return turnPassed;
  }

  /**
   * ターン終了時の共通処理を実行します。
   * 敵モンスターの自律行動AI、ターン加算、満腹度減少、HP自然回復、視界更新、
   * および IndexedDB へのオートセーブ（死亡時はデータ削除＆ハイスコア記録）を行います。
   */
  private endTurn(): void {
    // 1. 敵モンスターの自律AI処理
    this.updateMonsters();

    if (!this.player.isAlive) {
      const cause = this.lastDefeatCause || '力尽きて倒れてしまった';
      this.addLog(`あなたは${cause}…… (GAME OVER)`, 'damage');
      // 死亡時: パーマデス担保のためセーブデータを削除しハイスコアを保存
      StorageManager.clearCurrentRun();
      StorageManager.saveHighscore({
        floor: this.player.floor,
        level: this.player.level,
        turn: this.player.turn,
        score: GameEngine.calculateScore(
          this.player.floor,
          this.player.level,
          this.player.turn
        ),
        causeOfDeath: cause,
        timestamp: Date.now(),
      });
      this.notify();
      return;
    }

    this.player.turn += 1;

    // 2. 満腹度の減少（10ターンごとに1%減少）
    if (this.player.turn % 10 === 0 && this.player.hunger > 0) {
      this.player.hunger = Math.max(0, this.player.hunger - 1);
      if (this.player.hunger === 0) {
        this.addLog('空腹で目が眩んできた！(HPが減少し始めます)', 'warning');
      }
    }

    // 3. HPの自然回復（満腹度が残っている場合、5ターンごとに1回復）
    if (this.player.hunger > 0) {
      if (this.player.turn % 5 === 0 && this.player.hp < this.player.maxHp) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
      }
    } else {
      // 餓死スリップダメージ
      this.player.hp = Math.max(0, this.player.hp - 1);
      this.addLog('飢えにより体力を奪われている！', 'warning');
      if (this.player.hp <= 0) {
        this.player.isAlive = false;
        const cause = '飢えに耐えかねて力尽きた';
        this.lastDefeatCause = cause;
        this.addLog(`あなたは${cause}…… (GAME OVER)`, 'damage');
        StorageManager.clearCurrentRun();
        StorageManager.saveHighscore({
          floor: this.player.floor,
          level: this.player.level,
          turn: this.player.turn,
          score: GameEngine.calculateScore(
            this.player.floor,
            this.player.level,
            this.player.turn
          ),
          causeOfDeath: cause,
          timestamp: Date.now(),
        });
      }
    }

    // 4. 視界更新
    FOV.compute(this.map, { x: this.player.x, y: this.player.y });

    // 5. IndexedDB へ1ターン自動セーブ
    if (this.player.isAlive) {
      StorageManager.saveCurrentRun({
        player: this.player,
        map: this.map,
        logs: this.logs,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * マップ上の生存モンスター全員の自律AI（索敵・追跡・攻撃）を実行します。
   */
  private updateMonsters(): void {
    const playerPos = { x: this.player.x, y: this.player.y };

    for (const monster of this.map.monsters) {
      const isPlayerVisible = this.map.visible[monster.y][monster.x];
      const distToPlayer = Math.max(
        Math.abs(monster.x - playerPos.x),
        Math.abs(monster.y - playerPos.y)
      );

      // 隣接（距離1）している場合は近接攻撃
      if (distToPlayer <= 1) {
        const dx = playerPos.x - monster.x;
        const dy = playerPos.y - monster.y;
        if (dx !== 0 && dy !== 0) {
          if (dx > 0 && dy > 0) monster.direction = 'down_right';
          else if (dx < 0 && dy > 0) monster.direction = 'down_left';
          else if (dx > 0 && dy < 0) monster.direction = 'up_right';
          else if (dx < 0 && dy < 0) monster.direction = 'up_left';
        } else if (dx !== 0) {
          monster.direction = dx > 0 ? 'right' : 'left';
        } else if (dy !== 0) {
          monster.direction = dy > 0 ? 'down' : 'up';
        }

        this.onAttack?.(monster.id, dx, dy, 'player');
        this.onDamage?.('player');
        const combat = CombatSystem.monsterAttack(monster, this.player);
        this.addLog(
          `${monster.name} の攻撃！ あなたは ${combat.damage} のダメージを受けた！`,
          'damage'
        );
        if (!this.player.isAlive) {
          this.lastDefeatCause = `${monster.name} の攻撃により力尽きた`;
          break;
        }
        continue;
      }

      // 視界内にプレイヤーがいる場合は接近
      if (isPlayerVisible) {
        const otherMonsters = this.map.monsters
          .filter((m) => m.id !== monster.id)
          .map((m) => ({ x: m.x, y: m.y }));

        const nextStep = Pathfinding.getNextStep(
          this.map,
          { x: monster.x, y: monster.y },
          playerPos,
          otherMonsters
        );

        if (nextStep) {
          const dx = nextStep.x - monster.x;
          const dy = nextStep.y - monster.y;
          if (dx !== 0 && dy !== 0) {
            if (dx > 0 && dy > 0) monster.direction = 'down_right';
            else if (dx < 0 && dy > 0) monster.direction = 'down_left';
            else if (dx > 0 && dy < 0) monster.direction = 'up_right';
            else if (dx < 0 && dy < 0) monster.direction = 'up_left';
          } else if (dx !== 0) {
            monster.direction = dx > 0 ? 'right' : 'left';
          } else if (dy !== 0) {
            monster.direction = dy > 0 ? 'down' : 'up';
          }

          monster.x = nextStep.x;
          monster.y = nextStep.y;
        }
      }
    }
  }

  /**
   * 行動ログを新しく追加します。最新の30件まで保持されます。
   *
   * @param text - ログ本文
   * @param type - ログ種別（UI装飾用: normal, info, warning, damage, turn-header）
   */
  public addLog(
    text: string,
    type: 'normal' | 'info' | 'warning' | 'damage' | 'turn-header' = 'normal'
  ): void {
    this.logs.unshift({
      id: `${++this.logIdCounter}`,
      turn: this.player.turn,
      text,
      type,
    });
    if (this.logs.length > 30) {
      this.logs.pop();
    }
  }
}
