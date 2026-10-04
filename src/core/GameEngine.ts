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
  Monster,
  Obstacle,
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

  /** 障害物を押して移動した際のコールバック */
  public onObstaclePush?: (obstacle: Obstacle, dx: number, dy: number) => void;

  /** 障害物が破壊・粉砕された際のコールバック */
  public onObstacleBreak?: (obstacle: Obstacle) => void;

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
      if (!this.map.obstacles) {
        this.map.obstacles = [];
      }
      this.logs = saved.logs || [];
      this.lastDefeatCause = '';
      this.addLog('前回の冒険の続きを再開した。', 'turn-header');
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * プレイヤーの所持品インベントリを論理順（装備中優先、武器→盾→薬草→食料→巻物）に整理整頓します。
   */
  public sortInventory(): void {
    ItemSystem.sortInventory(this.player);
    this.addLog('持ち物を種類順に整理整頓した。', 'info');
    this.notify();
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

        // 1. 進行方向にモンスターがいるか判定（近接攻撃）
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

        // 2. 進行方向に障害物があるか判定（破壊・押し出し・滑走）
        const targetObstacle = (this.map.obstacles || []).find(
          (o) => o.x === targetX && o.y === targetY
        );

        if (targetObstacle) {
          turnPassed = this.interactWithObstacle(
            targetObstacle,
            action.dx,
            action.dy
          );
          break;
        }

        // 3. 壁・水路チェック（進入不可タイルの場合は向き変更のみでターン消費なし）
        const targetTile = this.map.tiles[targetY][targetX];
        if (targetTile === TileType.Wall || targetTile === TileType.Water) {
          this.notify();
          return false;
        }

        // 4. 移動実行
        this.player.x = targetX;
        this.player.y = targetY;
        turnPassed = true;

        // 5. タイル環境ギミック処理（氷の滑走、泥濘の足枷、毒沼の毒気）
        const extraTurn = this.handleTileGimmick(
          targetTile,
          action.dx,
          action.dy
        );

        // 足元のアイテム検知
        const groundItem = this.map.items.find(
          (it) => it.x === this.player.x && it.y === this.player.y
        );
        if (groundItem) {
          this.addLog(`足元に ${groundItem.name} が落ちている。`, 'info');
        }

        if (targetTile === TileType.StairsDown) {
          this.addLog('下り階段を見つけた。(決定ボタンまたは階段ボタンで次へ)', 'info');
        }

        if (extraTurn) {
          // 泥濘などで追加のターンが進行
          this.updateMonsters();
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
                `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
                'turn-header'
              );
            }
          }
          turnPassed = true;
          break;
        }

        // 正面マスに障害物がある場合は攻撃または押し出し実行！
        const facingObstacle = (this.map.obstacles || []).find(
          (o) => o.x === targetX && o.y === targetY
        );
        if (facingObstacle) {
          turnPassed = this.interactWithObstacle(facingObstacle, fdx, fdy);
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

        // 4. 正面に敵・障害物がなく足元にも階段・アイテムがない場合、正面に向かって素振り（空振り攻撃）を実行！
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
   * 障害物とのインタラクション（攻撃による破壊、大石の押し出し、氷塊の滑走と敵直撃粉砕）を実行します。
   *
   * @param obstacle - 対象の障害物
   * @param dx - アクションX方向
   * @param dy - アクションY方向
   * @returns ターンが経過した場合は true
   */
  private interactWithObstacle(
    obstacle: Obstacle,
    dx: number,
    dy: number
  ): boolean {
    // 1. 滑る氷塊 (ICE_BLOCK)
    if (obstacle.isSliding) {
      this.addLog(`${obstacle.name} を力いっぱい蹴り出した！`, 'normal');
      this.onAttack?.('player', dx, dy, obstacle.id);

      let curX = obstacle.x;
      let curY = obstacle.y;
      let hitMonster: Monster | undefined;
      let hitObstacle: Obstacle | undefined;
      let hitWall = false;

      // 一直線に滑走
      while (true) {
        const nextX = curX + dx;
        const nextY = curY + dy;

        // マップ外・壁・水路判定
        if (
          nextX < 0 ||
          nextX >= this.map.width ||
          nextY < 0 ||
          nextY >= this.map.height
        ) {
          hitWall = true;
          break;
        }

        const tile = this.map.tiles[nextY][nextX];
        if (tile === TileType.Wall || tile === TileType.Water) {
          hitWall = true;
          break;
        }

        // モンスター衝突判定
        hitMonster = this.map.monsters.find(
          (m) => m.x === nextX && m.y === nextY
        );
        if (hitMonster) {
          break;
        }

        // 他の障害物衝突判定
        hitObstacle = (this.map.obstacles || []).find(
          (o) => o.id !== obstacle.id && o.x === nextX && o.y === nextY
        );
        if (hitObstacle) {
          break;
        }

        curX = nextX;
        curY = nextY;
      }

      if (hitMonster) {
        // モンスターに直撃！20大ダメージ
        this.onDamage?.(hitMonster.id);
        hitMonster.hp -= 20;
        this.addLog(
          `${obstacle.name} が ${hitMonster.name} に激突！ 20 の大ダメージを与えて粉砕した！`,
          'damage'
        );
        // 氷塊は粉砕・消滅
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );

        if (hitMonster.hp <= 0) {
          this.addLog(
            `${hitMonster.name} を粉砕撃破した！ (${hitMonster.expValue} EXP獲得)`,
            'info'
          );
          this.player.exp += hitMonster.expValue;
          this.map.monsters = this.map.monsters.filter(
            (m) => m.id !== hitMonster.id
          );
          // レベルアップチェック
          const expNeeded = this.player.level * 15;
          if (this.player.exp >= expNeeded) {
            this.player.level += 1;
            this.player.exp -= expNeeded;
            this.player.maxHp += 5;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 5);
            this.player.baseAtk += 2;
            this.player.baseDef += 1;
            this.addLog(
              `レベルが上がった！ (Lv.${this.player.level} / 最大HP+5 / 攻撃+2 / 防御+1 / HP+5回復)`,
              'turn-header'
            );
          }
        }
        this.onObstacleBreak?.(obstacle);
        return true;
      } else if (hitObstacle) {
        this.addLog(
          `${obstacle.name} が ${hitObstacle.name} に激突し、木っ端微塵に粉砕した！`,
          'normal'
        );
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        return true;
      } else if (hitWall) {
        this.addLog(
          `${obstacle.name} が壁に激突し、ガラガラと粉砕した！`,
          'normal'
        );
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        return true;
      } else {
        obstacle.x = curX;
        obstacle.y = curY;
        return true;
      }
    }

    // 2. 押せる大石 (PUSH_ROCK)
    if (obstacle.isPushable) {
      const nextX = obstacle.x + dx;
      const nextY = obstacle.y + dy;

      // 1マス奥の通行判定
      if (
        nextX < 0 ||
        nextX >= this.map.width ||
        nextY < 0 ||
        nextY >= this.map.height
      ) {
        this.addLog(`${obstacle.name} は壁に引っかかって押せない！`, 'warning');
        return false;
      }

      const tile = this.map.tiles[nextY][nextX];
      const isBlocked =
        tile === TileType.Wall ||
        tile === TileType.Water ||
        this.map.monsters.some((m) => m.x === nextX && m.y === nextY) ||
        this.map.obstacles.some((o) => o.x === nextX && o.y === nextY);

      if (isBlocked) {
        this.addLog(`奥が塞がっていて ${obstacle.name} を押せない！`, 'warning');
        return false;
      }

      obstacle.x = nextX;
      obstacle.y = nextY;
      this.onAttack?.('player', dx, dy, obstacle.id);
      this.onObstaclePush?.(obstacle, dx, dy);
      this.addLog(`${obstacle.name} をズズズ…と奥へ押して移動させた！`, 'normal');
      return true;
    }

    // 3. 攻撃で壊せる障害物 (DIRT_BLOCK, TREE_STUMP, SNOW_MOUND)
    if (obstacle.isDestructible) {
      obstacle.hp -= 1;
      this.onAttack?.('player', dx, dy, obstacle.id);
      this.onDamage?.(obstacle.id);

      if (obstacle.hp > 0) {
        this.addLog(
          `${obstacle.name} に一撃を加えた！（耐久度: ${obstacle.hp}/${obstacle.maxHp}）`,
          'damage'
        );
      } else {
        this.addLog(`${obstacle.name} を粉砕して道を切り開いた！`, 'info');
        this.onObstacleBreak?.(obstacle);
        this.map.obstacles = this.map.obstacles.filter(
          (o) => o.id !== obstacle.id
        );
        // 20%の確率でアイテムドロップ
        if (Math.random() < 0.2) {
          this.map.items.push(EntityFactory.createRandomItem(obstacle.x, obstacle.y));
          this.addLog('崩れた破片の中からアイテムが現れた！', 'info');
        }
      }
      return true;
    }

    return false;
  }

  /**
   * プレイヤーが移動した先の床ギミック効果（氷の滑走、泥濘の足枷、毒沼の毒気）を適用します。
   *
   * @param currentTile - 進入したタイル種別
   * @param dx - 進入X方向
   * @param dy - 進入Y方向
   * @returns 追加ターン消費（泥濘）が発生した場合は true
   */
  private handleTileGimmick(
    currentTile: TileType,
    dx: number,
    dy: number
  ): boolean {
    let extraTurn = false;

    // 1. 氷床（TileType.Ice）: 進行方向へスーッと滑走！
    if (currentTile === TileType.Ice && (dx !== 0 || dy !== 0)) {
      let curX = this.player.x;
      let curY = this.player.y;
      let slid = false;

      while (true) {
        const nextX = curX + dx;
        const nextY = curY + dy;
        if (
          nextX < 0 ||
          nextX >= this.map.width ||
          nextY < 0 ||
          nextY >= this.map.height
        ) {
          break;
        }

        const nTile = this.map.tiles[nextY][nextX];
        if (nTile === TileType.Wall || nTile === TileType.Water) break;
        if (this.map.monsters.some((m) => m.x === nextX && m.y === nextY)) break;
        if (this.map.obstacles.some((o) => o.x === nextX && o.y === nextY)) break;

        curX = nextX;
        curY = nextY;
        slid = true;

        // 次のマスが氷以外ならそこでストップ
        if (nTile !== TileType.Ice) {
          break;
        }
      }

      if (slid) {
        this.player.x = curX;
        this.player.y = curY;
        this.addLog('氷の床で足が滑り、スーッと滑走した！', 'normal');
      }
    }

    // 2. 泥濘床（TileType.Mud）: 足を取られターン消費増
    if (currentTile === TileType.Mud) {
      this.addLog('泥濘に足を取られ、身動きに余分な時間がかかってしまった！', 'warning');
      extraTurn = true;
    }

    // 3. 毒沼床（TileType.Poison）: 2の毒沼ダメージ
    if (currentTile === TileType.Poison) {
      const poisonDmg = 2;
      this.player.hp = Math.max(1, this.player.hp - poisonDmg);
      this.addLog(
        `毒沼の有毒ガスと腐蝕液で ${poisonDmg} のダメージを受けた！`,
        'damage'
      );
    }

    return extraTurn;
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

      // 視界内にプレイヤーがいる場合は接近（他のモンスターおよび障害物を回避）
      if (isPlayerVisible) {
        const blockers = [
          ...this.map.monsters
            .filter((m) => m.id !== monster.id)
            .map((m) => ({ x: m.x, y: m.y })),
          ...(this.map.obstacles || []).map((o) => ({ x: o.x, y: o.y })),
        ];

        const nextStep = Pathfinding.getNextStep(
          this.map,
          { x: monster.x, y: monster.y },
          playerPos,
          blockers
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
