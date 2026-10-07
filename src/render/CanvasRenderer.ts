/**
 * @file CanvasRenderer.ts
 * @description HTML5 Canvas 2D を用いたゲーム画面のレンダリングエンジン。
 * HiDPI対応、SVGスプライト描画、移動イージング補間、攻撃・被弾・待機アニメーション、
 * およびミニマップのリアルタイム描画を担当します。
 */

import { GameEngine } from '../core/GameEngine';
import { BiomeType, Direction8, Item, Monster, Obstacle, TileType } from '../core/types';
import { AnimationEngine } from './AnimationEngine';
import { SVGSprites, SpriteId } from './sprites/SVGSprites';
import { TileSprites } from './sprites/TileSprites';
import { EquipmentSprites } from './sprites/EquipmentSprites';
import { SoundSystem } from '../audio/SoundSystem';

/**
 * 2D Canvas描画管理クラス。
 */
export class CanvasRenderer {
  /**
   * 描画先の HTMLCanvasElement。
   */
  private canvas: HTMLCanvasElement;

  /**
   * Canvasの2D描画コンテキスト。
   */
  private ctx: CanvasRenderingContext2D;

  /**
   * 描画元データを参照するゲームエンジンインスタンス。
   */
  private engine: GameEngine;

  /**
   * Canvasを内包する親コンテナ要素（リサイズ計算基準）。
   */
  private container: HTMLElement;

  /**
   * アニメーション状態（イージング、パーティクル、飛翔体）を管理するエンジン。
   */
  public anim: AnimationEngine;

  /**
   * 基準となる1タイルのピクセルサイズ（デバイス解像度やウィンドウ幅に応じて動的に変動）。
   * - 想定値: 24 〜 48 の整数（基準値: 32）
   * - 初期値: 32
   */
  public tileSize = 32;

  /**
   * 現在のカメラズーム倍率。
   * - 想定値: 0.8 〜 3.0 の浮動小数点数（標準値: 1.5 = 150%迫力ズーム）
   * - 初期値: 1.5（localStorage 'rogue_camera_zoom' より復元）
   */
  public zoom = 1.5;

  /**
   * ズーム倍率変更時コールバック関数（HUDボタンの倍率表示更新用）。
   * - 初期値: `undefined`
   */
  public onZoomChange?: (zoom: number) => void;

  /**
   * ミニマップを画面右上にオーバーレイ描画するかどうかのフラグ。
   * - 想定値:
   *   - `true`: ミニマップ（探索済みマップと敵・階段位置）を表示
   *   - `false`: ミニマップを非表示（全画面ダンジョンビュー）
   * - 初期値: `true`
   */
  public showMinimap = true;

  /**
   * requestAnimationFrame の描画ループ管理用ID。
   * - 想定値: requestAnimationFrameが返却する正の整数、または停止時 `null`
   * - 初期値: `null`
   */
  private rafId: number | null = null;

  /**
   * 前フレームのタイムスタンプ（ミリ秒、デルタタイム計算用）。
   * - 想定値: performance.now() または requestAnimationFrameのタイムスタンプ
   * - 初期値: 0
   */
  private lastTime = 0;

  /**
   * 直前に描画したフロア階層番号（階層切り替え・新フロア到達検知用）。
   * - 想定値: 1以上の正の整数
   * - 初期値: 1
   */
  private lastFloor = 1;

  /**
   * CanvasRenderer のインスタンスを生成し、SVGスプライトのロード、
   * アニメーションエンジンの初期化、および描画ループを開始します。
   *
   * @param canvas - 描画対象のキャンバス要素
   * @param container - サイズ計算基準となる親コンテナ要素
   * @param engine - 描画データを供給するGameEngineインスタンス
   */
  constructor(
    canvas: HTMLCanvasElement,
    container: HTMLElement,
    engine: GameEngine
  ) {
    this.canvas = canvas;
    this.container = container;
    this.engine = engine;
    this.anim = new AnimationEngine();

    // ローカルストレージから保存されたズーム設定を復元（デフォルトは150% / 1.5倍）
    try {
      const savedZoom = localStorage.getItem('rogue_camera_zoom');
      if (savedZoom !== null) {
        const parsed = parseFloat(savedZoom);
        if (!isNaN(parsed) && parsed >= 0.8 && parsed <= 3.0) {
          this.zoom = parsed;
        } else {
          this.zoom = 1.5;
        }
      } else {
        this.zoom = 1.5;
      }
    } catch {
      this.zoom = 1.5;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = ctx;

    // SVGスプライトの非同期初期化
    SVGSprites.init().then(() => {
      this.render();
    });

    // ゲームエンジンとのアニメーションイベント配線
    this.bindEngineEvents();

    // マウスホイールによるズーム操作（Ctrl+ホイール または 通常ホイール）
    this.setupWheelZoom();

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    // 60fps 連続アニメーションループ開始
    this.startLoop();
  }

  /**
   * ゲームエンジンからの攻撃・被弾イベントをアニメーションエンジンへ接続します。
   */
  private bindEngineEvents(): void {
    this.engine.onAttack = (attackerId, dx, dy, targetId) => {
      this.anim.triggerAttack(attackerId, dx, dy);
      this.anim.triggerDamage(targetId);
    };

    this.engine.onDamage = (targetId) => {
      this.anim.triggerDamage(targetId);
    };

    this.engine.onObstaclePush = (obstacle, _dx, _dy) => {
      SoundSystem.getInstance().playPushObstacle();
      this.anim.triggerDustParticles(obstacle.x, obstacle.y);
      this.anim.triggerHeavyDustParticles(obstacle.x, obstacle.y);
      this.anim.triggerScreenShake(0.35, 3.5); // 地響きスクリーンシェイク
    };

    this.engine.onObstacleBreak = (obstacle) => {
      SoundSystem.getInstance().playBreakObstacle();
      const color =
        obstacle.type === 'ICE_BLOCK'
          ? '#7dd3fc'
          : obstacle.type === 'SNOW_MOUND'
          ? '#f0f9ff'
          : obstacle.type === 'TREE_STUMP'
          ? '#78350f'
          : '#b45309';
      this.anim.triggerBreakParticles(obstacle.x, obstacle.y, color, 18);
      this.anim.triggerScreenShake(0.25, 3.0);
    };

    this.engine.onSwampStuck = (x, y) => {
      this.anim.triggerMudParticles(x, y);
      this.anim.triggerDamage('player'); // もがきジタバタシェイク
    };

    this.engine.onSwampEscape = (fromX, fromY, toX, toY) => {
      this.anim.triggerMudEscapeParticles(fromX, fromY, toX, toY);
      this.anim.triggerSwampEscapeMotion();
    };

    this.engine.onIceSlide = (
      fromX,
      fromY,
      toX,
      toY,
      hitWall,
      durationSec,
      didFall,
      _slipDamage
    ) => {
      const dist = Math.hypot(toX - fromX, toY - fromY);
      const slideDuration = durationSec || Math.max(0.5, (dist / 3.0) + 0.15);

      // プレイヤーの等速滑走アニメーション状態を設定（滑走完了時に壁激突ならエフェクト発動）
      const pState = this.anim.getState('player', fromX, fromY);
      pState.renderX = fromX;
      pState.renderY = fromY;
      pState.targetX = toX;
      pState.targetY = toY;
      pState.isSliding = true;
      pState.onSlideComplete = () => {
        if (hitWall) {
          this.anim.triggerScreenShake(0.35, 5.0);
          this.anim.triggerBreakParticles(toX, toY, '#bae6fd', 14);
        }
        if (didFall) {
          // 転倒演出: 尻もちスクワッシュ＆星パーティクル＆被弾フラッシュ＆シェイク
          this.anim.triggerPlayerSlipFall(0.45);
          this.anim.triggerDamage('player');
          this.anim.triggerScreenShake(0.3, 4.0);
          this.anim.triggerDizzyStars(toX, toY);
        }
      };

      this.anim.triggerIceSlideMotion(slideDuration);
    };

    // 飛び道具・杖ビームアニメーションの購読
    this.engine.onProjectile = (fromX, fromY, toX, toY, type, color) => {
      this.anim.triggerProjectile(fromX, fromY, toX, toY, type, color);
    };
  }

  /**
   * 毎フレームの描画ループを開始します（requestAnimationFrame）。
   */
  private startLoop(): void {
    const loop = (time: number) => {
      if (this.lastTime === 0) {
        this.lastTime = time;
      }
      const dt = Math.min(0.1, (time - this.lastTime) / 1000);
      this.lastTime = time;

      // 1. エンティティ座標の同期
      this.syncEntities();

      // 2. アニメーションエンジンの更新
      this.anim.update(dt);

      // 3. 画面の再描画
      this.render();

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * アニメーションループを停止します。
   */
  public stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * ゲームエンジンの論理エンティティ座標とアニメーション目標座標を同期します。
   */
  private syncEntities(): void {
    const player = this.engine.player;

    // フロア階層が切り替わった場合、旧フロアのエンティティ（モンスター・大石等）のアニメーションを全消去
    if (this.lastFloor !== player.floor) {
      this.lastFloor = player.floor;
      this.anim.clearFloorEntities();
    }

    const curTile = this.engine.map.tiles[player.y]?.[player.x];
    const isSwamp = curTile === TileType.Mud || curTile === TileType.Poison;
    this.anim.playerSinkOffsetY = isSwamp ? 4.5 : 0;
    const playerSpeedMult = isSwamp ? 0.35 : 1.0;

    const pState = this.anim.getState('player', player.x, player.y);
    const isPlayerSliding = pState.isSliding;

    this.anim.syncPosition('player', player.x, player.y, isPlayerSliding, playerSpeedMult);
    this.anim.setDirection('player', player.direction || 'down');

    const validIds = new Set<string>(['player']);
    for (const monster of this.engine.map.monsters) {
      validIds.add(monster.id);
      this.anim.syncPosition(monster.id, monster.x, monster.y);
      if (monster.direction) {
        this.anim.setDirection(monster.id, monster.direction);
      }
    }

    if (this.engine.map.obstacles) {
      for (const obstacle of this.engine.map.obstacles) {
        validIds.add(obstacle.id);
        const speedMult = obstacle.isSliding ? 1.0 : obstacle.isPushable ? 0.2 : 1.0;
        this.anim.syncPosition(
          obstacle.id,
          obstacle.x,
          obstacle.y,
          obstacle.isSliding,
          speedMult,
          obstacle.isPushable
        );
      }
    }

    this.anim.pruneInactive(validIds);
  }

  /**
   * ミニマップの表示・非表示をトグル切り替えします。
   *
   * @returns 切り替え後のミニマップ表示状態
   */
  public toggleMinimap(): boolean {
    this.showMinimap = !this.showMinimap;
    return this.showMinimap;
  }

  /**
   * カメラのズーム倍率を設定し、ローカルストレージへ保存します。
   *
   * @param newZoom - 新しいズーム倍率（0.8〜3.0）
   */
  public setZoom(newZoom: number): void {
    const clamped = Math.min(3.0, Math.max(0.8, Math.round(newZoom * 100) / 100));
    this.zoom = clamped;
    try {
      localStorage.setItem('rogue_camera_zoom', String(this.zoom));
    } catch {
      // ignore
    }
    this.onZoomChange?.(this.zoom);
    this.render();
  }

  /**
   * ズーム倍率を主要プリセット（100% -> 150% -> 200% -> 100%）で循環切り替えします。
   *
   * @returns 切り替え後のズーム倍率
   */
  public cycleZoom(): number {
    if (this.zoom < 1.25) {
      this.setZoom(1.5);
    } else if (this.zoom < 1.75) {
      this.setZoom(2.0);
    } else {
      this.setZoom(1.0);
    }
    return this.zoom;
  }

  /**
   * キャンバス上でのマウスホイール操作およびピンチ操作によるズーム拡大縮小を登録します。
   */
  private setupWheelZoom(): void {
    // 1. マウスホイール操作（キャンバス上スクロールで直感的に拡縮）
    this.canvas.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.15 : -0.15;
        this.setZoom(this.zoom + delta);
      },
      { passive: false }
    );

    // 2. スマホのピンチズーム操作（2本指タッチ）
    let initialPinchDist = 0;
    let initialZoom = 1.5;

    this.canvas.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialPinchDist = Math.hypot(dx, dy);
          initialZoom = this.zoom;
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length === 2 && initialPinchDist > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const ratio = dist / initialPinchDist;
          this.setZoom(initialZoom * ratio);
        }
      },
      { passive: true }
    );

    this.canvas.addEventListener(
      'touchend',
      (e: TouchEvent) => {
        if (e.touches.length < 2) {
          initialPinchDist = 0;
        }
      },
      { passive: true }
    );
  }

  /**
   * 親コンテナの大きさとデバイスピクセル比（DPR）に合わせてCanvasの解像度を再設定します。
   */
  public handleResize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();

    // 画面サイズに応じたタイル基準サイズの自動切替
    const isSmallScreen = rect.width < 600 || rect.height < 500;
    this.tileSize = isSmallScreen ? 36 : 32;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  /**
   * ゲーム画面全体の1フレームを描画します。
   * タイル、床落ちアイテム、敵モンスター、プレイヤーの順にレイヤード描画します。
   */
  public render(): void {
    const { width, height } = this.container.getBoundingClientRect();
    const ctx = this.ctx;
    const map = this.engine.map;
    const player = this.engine.player;

    // 1. 画面クリア（未探索の闇）
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // プレイヤーのアニメーション描画座標（カメラがスムーズに追従）
    const animPlayer = this.anim.getState('player', player.x, player.y);
    const effectiveTileSize = this.tileSize * this.zoom;

    // カメラオフセット（プレイヤーの滑らかなアニメーション座標を中心に配置 ＋ 画面全体の地響き振動）
    const cameraX =
      width / 2 -
      (animPlayer.renderX + animPlayer.attackOffsetX + 0.5) * effectiveTileSize +
      this.anim.screenShakeX;
    const cameraY =
      height / 2 -
      (animPlayer.renderY + animPlayer.attackOffsetY + 0.5) * effectiveTileSize +
      this.anim.screenShakeY;

    // タイルカリング計算
    const minTileX = Math.max(0, Math.floor(-cameraX / effectiveTileSize));
    const maxTileX = Math.min(
      map.width - 1,
      Math.ceil((width - cameraX) / effectiveTileSize)
    );
    const minTileY = Math.max(0, Math.floor(-cameraY / effectiveTileSize));
    const maxTileY = Math.min(
      map.height - 1,
      Math.ceil((height - cameraY) / effectiveTileSize)
    );

    // 2. タイルの描画
    const biome = map.biome || 'STONE';
    for (let y = minTileY; y <= maxTileY; y++) {
      for (let x = minTileX; x <= maxTileX; x++) {
        const isExplored = map.explored[y][x];
        const isVisible = map.visible[y][x];

        if (!isExplored) continue;

        const screenX = Math.floor(cameraX + x * effectiveTileSize);
        const screenY = Math.floor(cameraY + y * effectiveTileSize);
        const tile = map.tiles[y][x];

        this.drawTile(
          ctx,
          tile,
          screenX,
          screenY,
          effectiveTileSize,
          isVisible,
          biome,
          x,
          y
        );
      }
    }

    // 3. 床落ちアイテムの描画
    for (const item of map.items) {
      if (map.explored[item.y][item.x]) {
        const isVisible = map.visible[item.y][item.x];
        const screenX = Math.floor(cameraX + item.x * effectiveTileSize);
        const screenY = Math.floor(cameraY + item.y * effectiveTileSize);
        this.drawItem(ctx, item, screenX, screenY, effectiveTileSize, isVisible);
      }
    }

    // 3.5. インタラクティブ障害物の描画（土塊、倒木、雪塊、押せる大石、滑る氷塊）
    for (const obstacle of (map.obstacles || [])) {
      if (map.explored[obstacle.y]?.[obstacle.x]) {
        const isVisible = map.visible[obstacle.y]?.[obstacle.x];
        const animState = this.anim.getState(
          obstacle.id,
          obstacle.x,
          obstacle.y
        );
        const screenX = Math.floor(
          cameraX + animState.renderX * effectiveTileSize + animState.shakeX
        );
        const screenY = Math.floor(
          cameraY + animState.renderY * effectiveTileSize + animState.shakeY
        );
        this.drawObstacle(
          ctx,
          obstacle,
          screenX,
          screenY,
          effectiveTileSize,
          isVisible,
          animState
        );
      }
    }

    // 4. 敵モンスターの描画（視界内のみ、SVGスプライト＆アニメーション）
    for (const monster of map.monsters) {
      if (map.visible[monster.y][monster.x]) {
        this.drawMonster(ctx, monster, cameraX, cameraY, effectiveTileSize);
      }
    }

    // 5. プレイヤーの描画（SVGスプライト＆アニメーション）
    this.drawPlayer(
      ctx,
      animPlayer,
      cameraX,
      cameraY,
      effectiveTileSize,
      player.isAlive
    );

    // 5.5. 演出パーティクルの描画（破砕片・土煙・きらめき等）
    this.drawParticles(ctx, cameraX, cameraY, effectiveTileSize);

    // 5.6. 飛翔中の飛び道具・魔法ビーム光線・投擲物の描画
    this.drawProjectiles(ctx, cameraX, cameraY, effectiveTileSize);

    // 6. 死亡時ゲームオーバー暗幕・ドラマチックヴィネットエフェクト
    if (!player.isAlive) {
      const deathTime = this.anim.getPlayerDeathTime();
      // 倒れ込み直後（0.5秒以降）から画面周囲を暗転させるヴィネットグラデーション
      if (deathTime >= 0.5) {
        const fadeT = Math.min(1.0, (deathTime - 0.5) / 1.0); // 0.5s〜1.5s でフェードイン
        const vignette = ctx.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.2,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.75
        );
        vignette.addColorStop(0, `rgba(15, 23, 42, ${fadeT * 0.3})`);
        vignette.addColorStop(1, `rgba(3, 7, 18, ${fadeT * 0.85})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // 6.5. 環境パーティクル演出（SNOWの粉雪、ICEの氷晶きらめき）
    this.drawBiomeAtmosphere(ctx, width, height, biome);

    // 7. ミニマップオーバーレイ描画
    if (this.showMinimap) {
      this.drawMinimap(ctx, width, height);
    }
  }

  /**
   * バイオーム別の壁・天板テーマカラー定義
   */
  private static readonly BIOME_WALL_THEMES: Record<
    BiomeType,
    {
      roofBase: string;
      roofHighlight: string;
      roofDetail: string;
      frontBase: string;
      frontHighlight: string;
    }
  > = {
    STONE: {
      roofBase: '#334155',
      roofHighlight: '#64748b',
      roofDetail: '#243247',
      frontBase: '#090d16',
      frontHighlight: '#1e293b',
    },
    EARTH: {
      roofBase: '#451a03',
      roofHighlight: '#78350f',
      roofDetail: '#2c1002',
      frontBase: '#120704',
      frontHighlight: '#260e07',
    },
    FOREST: {
      roofBase: '#14532d',
      roofHighlight: '#16a34a',
      roofDetail: '#072b14',
      frontBase: '#061a0c',
      frontHighlight: '#11381c',
    },
    RIVER: {
      roofBase: '#1e3a8a',
      roofHighlight: '#3b82f6',
      roofDetail: '#172554',
      frontBase: '#030b1e',
      frontHighlight: '#0e254e',
    },
    LAKE: {
      roofBase: '#0e7490',
      roofHighlight: '#06b6d4',
      roofDetail: '#164e63',
      frontBase: '#04151f',
      frontHighlight: '#0d3247',
    },
    SNOW: {
      roofBase: '#f8fafc',
      roofHighlight: '#ffffff',
      roofDetail: '#cbd5e1',
      frontBase: '#080e1a',
      frontHighlight: '#192b47',
    },
    ICE: {
      roofBase: '#0369a1',
      roofHighlight: '#7dd3fc',
      roofDetail: '#0284c7',
      frontBase: '#021324',
      frontHighlight: '#0c3559',
    },
    SWAMP: {
      roofBase: '#1b2e1c',
      roofHighlight: '#22c55e',
      roofDetail: '#121f13',
      frontBase: '#0b140c',
      frontHighlight: '#1a331c',
    },
    TOXIC: {
      roofBase: '#3b0764',
      roofHighlight: '#a855f7',
      roofDetail: '#24043d',
      frontBase: '#100713',
      frontHighlight: '#280d30',
    },
    MECHA: {
      roofBase: '#4d3721',
      roofHighlight: '#d97706',
      roofDetail: '#2b1c0e',
      frontBase: '#1a1109',
      frontHighlight: '#3b2513',
    },
    ISLAND: {
      roofBase: '#1e293b',
      roofHighlight: '#475569',
      roofDetail: '#0f172a',
      frontBase: '#0f172a',
      frontHighlight: '#1e293b',
    },
    MAGMA: {
      roofBase: '#7f1d1d',
      roofHighlight: '#ef4444',
      roofDetail: '#450a0a',
      frontBase: '#250505',
      frontHighlight: '#7f1d1d',
    },
    TEMPLE: {
      roofBase: '#312e81',
      roofHighlight: '#818cf8',
      roofDetail: '#1e1b4b',
      frontBase: '#0f0e26',
      frontHighlight: '#3730a3',
    },
    ALTAR: {
      roofBase: '#581c87',
      roofHighlight: '#c084fc',
      roofDetail: '#3b0764',
      frontBase: '#1a052e',
      frontHighlight: '#6b21a8',
    },
  };

  /**
   * 1つのタイルをバイオームに応じた高品質オートタイリング、
   * アニメーション波紋、および記憶表現付きで描画します。
   */
  private drawTile(
    ctx: CanvasRenderingContext2D,
    tile: TileType,
    x: number,
    y: number,
    size: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number
  ): void {
    const s = Math.ceil(size);

    // 1. 壁タイルのオートタイリング描画
    if (tile === TileType.Wall) {
      this.drawWallAutoTile(ctx, x, y, s, isVisible, biome, gridX, gridY);
      return;
    }

    // 2. 床タイルの描画（立体ドロップシャドウ付き）
    if (tile === TileType.Floor) {
      this.drawFloorAutoTile(ctx, x, y, s, isVisible, biome, gridX, gridY);
      return;
    }

    // 3. 水路・湖タイルのオートタイリング描画
    if (tile === TileType.Water) {
      this.drawWaterAutoTile(ctx, x, y, s, isVisible, biome, gridX, gridY);
      return;
    }

    // 3.5. 木の橋タイルの描画（オートタイリング & 壊れかけ木橋対応）
    if (tile === TileType.Bridge || tile === TileType.BrokenBridge) {
      this.drawBridgeTile(
        ctx,
        x,
        y,
        s,
        isVisible,
        biome,
        gridX,
        gridY,
        tile === TileType.BrokenBridge
      );
      return;
    }

    // 3.8. 特殊環境ギミック床 (Ice, Mud, Poison)
    if (tile === TileType.Ice || tile === TileType.Mud || tile === TileType.Poison) {
      this.drawGimmickTile(ctx, x, y, s, isVisible, tile, gridX, gridY, biome);
      return;
    }

    // 4. 階段タイル (TileType.StairsDown)
    if (tile === TileType.StairsDown) {
      this.drawStairsTile(ctx, x, y, s, isVisible, biome, gridX, gridY);
      return;
    }
  }

  /**
   * 上下左右の隣接壁判定（オートタイリング）に基づいて、
   * J-RPG風見下ろし型の自然な立体壁（天板面・前面垂直壁・側壁シャドウ）を描画します。
   */
  private drawWallAutoTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number
  ): void {
    const map = this.engine.map;
    const isWall = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return true;
      return map.tiles[gy][gx] === TileType.Wall;
    };

    const hasDown = isWall(gridX, gridY + 1);
    const hasUp = isWall(gridX, gridY - 1);
    const hasLeft = isWall(gridX - 1, gridY);
    const hasRight = isWall(gridX + 1, gridY);

    const theme =
      CanvasRenderer.BIOME_WALL_THEMES[biome] ||
      CanvasRenderer.BIOME_WALL_THEMES.STONE;
    const wallSprite = TileSprites.getWallSprite(biome, gridX, gridY);

    if (hasDown) {
      // ==========================================
      // 【天板マス / Roof Surface】
      // 下も壁であるため、垂直な手前壁面は描画せず、
      // タイル全面を厚みのある「上面（天板・ルーフ）」として描く。
      // これにより、縦に並んだ壁の途中に天板ラインが何度も挟まる違和感が完全に消滅する！
      // ==========================================
      ctx.fillStyle = theme.roofBase;
      ctx.fillRect(x, y, s, s);

      // 天板の質感・ブロック目地・テクスチャ
      ctx.fillStyle = theme.roofDetail;
      const hash = Math.abs((gridX * 7919 ^ gridY * 6271) % 4);
      if (hash === 0) {
        ctx.fillRect(x + 2, y + 2, s * 0.44, s * 0.42);
        ctx.fillRect(x + s * 0.52, y + 2, s * 0.44, s * 0.42);
        ctx.fillRect(x + 2, y + s * 0.48, s * 0.94, s * 0.48);
      } else if (hash === 1) {
        ctx.fillRect(x + 2, y + 2, s * 0.94, s * 0.44);
        ctx.fillRect(x + 2, y + s * 0.52, s * 0.44, s * 0.44);
        ctx.fillRect(x + s * 0.52, y + s * 0.52, s * 0.44, s * 0.44);
      } else {
        ctx.fillRect(x + 2, y + 2, s * 0.44, s * 0.92);
        ctx.fillRect(x + s * 0.52, y + 2, s * 0.44, s * 0.92);
      }

      // 上が壁でない（最上段）場合：上面ハイライトライン
      if (!hasUp) {
        ctx.fillStyle = theme.roofHighlight;
        ctx.fillRect(x, y, s, Math.max(1.5, s * 0.08));
      }

      // 左が壁でない場合：左側面の稜線・シャドウ
      if (!hasLeft) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(x, y, Math.max(2, s * 0.08), s);
      }

      // 右が壁でない場合：右側面の稜線・シャドウ
      if (!hasRight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(x + s - Math.max(2, s * 0.08), y, Math.max(2, s * 0.08), s);
      }
    } else {
      // ==========================================
      // 【前面垂直壁マス / Front Wall Face】
      // 下が床または水であるため、プレイヤーの手前にそびえ立つ「垂直壁面」を描く。
      // ==========================================
      if (wallSprite) {
        ctx.drawImage(wallSprite, x, y, s, s);
      } else {
        ctx.fillStyle = theme.frontBase;
        ctx.fillRect(x, y, s, s);
        ctx.fillStyle = theme.roofBase;
        ctx.fillRect(x, y, s, s * 0.28);
      }

      // 上端：上が壁なら天板との接続シャドウ、上でなければ天板ハイライト
      if (!hasUp) {
        ctx.fillStyle = theme.roofHighlight;
        ctx.fillRect(x, y, s, Math.max(1.5, s * 0.06));
      } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(x, y, s, Math.max(1, s * 0.04));
      }

      // 左が壁でない場合：左側面の立体影
      if (!hasLeft) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, Math.max(2.5, s * 0.08), s);
      }

      // 右が壁でない場合：右側面の立体影
      if (!hasRight) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x + s - Math.max(2.5, s * 0.08), y, Math.max(2.5, s * 0.08), s);
      }

      // 下端：床への接地ベースライン（漆黒の強固な境界）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(x, y + s - Math.max(2, s * 0.06), s, Math.max(2, s * 0.06));
    }

    // 未視界（探索済みの記憶）の場合は暗色半透明マスクを被せる
    if (!isVisible) {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.65)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 床タイルの描画および周囲の壁からの自然な立体ドロップシャドウ
   */
  private drawFloorAutoTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number
  ): void {
    const map = this.engine.map;
    const shop = map.shopRoom;
    const isShopTile =
      shop &&
      gridX >= shop.x &&
      gridX < shop.x + shop.w &&
      gridY >= shop.y &&
      gridY < shop.y + shop.h;

    if (isShopTile) {
      // ショップ（店部屋）の高級深紅絨毯（カーペット）
      ctx.fillStyle = '#831843';
      ctx.fillRect(x, y, s, s);

      // 内側の織物テクスチャ（市松・格子ハイライト）
      if ((gridX + gridY) % 2 === 0) {
        ctx.fillStyle = 'rgba(157, 23, 77, 0.45)';
        ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      }

      // 部屋の外周境界なら金糸の飾りステッチ縁取りライン
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      if (gridY === shop.y) {
        ctx.beginPath();
        ctx.moveTo(x, y + 1.5);
        ctx.lineTo(x + s, y + 1.5);
        ctx.stroke();
      }
      if (gridY === shop.y + shop.h - 1) {
        ctx.beginPath();
        ctx.moveTo(x, y + s - 1.5);
        ctx.lineTo(x + s, y + s - 1.5);
        ctx.stroke();
      }
      if (gridX === shop.x) {
        ctx.beginPath();
        ctx.moveTo(x + 1.5, y);
        ctx.lineTo(x + 1.5, y + s);
        ctx.stroke();
      }
      if (gridX === shop.x + shop.w - 1) {
        ctx.beginPath();
        ctx.moveTo(x + s - 1.5, y);
        ctx.lineTo(x + s - 1.5, y + s);
        ctx.stroke();
      }
    } else {
      const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
      if (floorSprite) {
        ctx.drawImage(floorSprite, x, y, s, s);
      } else {
        const floorColors: Record<string, string> = {
          MAGMA: '#3d1212',
          TEMPLE: '#1e1b4b',
          ALTAR: '#270c3e',
          MECHA: '#2c1e11',
          TOXIC: '#220d2d',
          ISLAND: '#0f172a',
        };
        ctx.fillStyle = floorColors[biome] || '#253346';
        ctx.fillRect(x, y, s, s);
      }
    }

    const isWall = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return true;
      return map.tiles[gy][gx] === TileType.Wall;
    };

    // 1. 上が壁マスなら上端からリアルなドロップシャドウを落とす
    if (isWall(gridX, gridY - 1)) {
      const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.45);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(x, y, s, s * 0.45);
    }

    // 2. 左が壁マスなら左端からソフトな側壁シャドウ
    if (isWall(gridX - 1, gridY)) {
      const shadowLeft = ctx.createLinearGradient(x, y, x + s * 0.25, y);
      shadowLeft.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowLeft;
      ctx.fillRect(x, y, s * 0.25, s);
    }

    // 3. 右が壁マスなら右端からソフトな側壁シャドウ
    if (isWall(gridX + 1, gridY)) {
      const shadowRight = ctx.createLinearGradient(x + s, y, x + s - s * 0.25, y);
      shadowRight.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      shadowRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowRight;
      ctx.fillRect(x + s - s * 0.25, y, s * 0.25, s);
    }

    // 未視界の暗がりマスク
    if (!isVisible) {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.65)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 水路タイルのオートタイリング描画（岸壁・波打ち際・深層波紋）
   */
  private drawWaterAutoTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number
  ): void {
    const map = this.engine.map;

    // 1. 水底ベース（床スプライトを下敷きにして川底の質感を演出）
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    }

    // 2. バイオーム別の水面・岸辺パレット
    const waterColors: Record<
      BiomeType,
      {
        base: string;
        deep: string;
        shallow: string;
        wave: string;
        bank: string;
        highlight: string;
      }
    > = {
      STONE: {
        base: 'rgba(2, 132, 199, 0.76)',
        deep: 'rgba(3, 105, 161, 0.88)',
        shallow: 'rgba(56, 189, 248, 0.60)',
        wave: '#bae6fd',
        bank: '#1e293b',
        highlight: 'rgba(255, 255, 255, 0.75)',
      },
      EARTH: {
        base: 'rgba(13, 148, 136, 0.78)',
        deep: 'rgba(15, 118, 110, 0.90)',
        shallow: 'rgba(45, 212, 191, 0.60)',
        wave: '#99f6e4',
        bank: '#2e1002',
        highlight: 'rgba(254, 243, 199, 0.75)',
      },
      FOREST: {
        base: 'rgba(5, 150, 105, 0.78)',
        deep: 'rgba(4, 120, 87, 0.90)',
        shallow: 'rgba(52, 211, 153, 0.60)',
        wave: '#a7f3d0',
        bank: '#052e16',
        highlight: 'rgba(255, 255, 255, 0.75)',
      },
      RIVER: {
        base: 'rgba(37, 99, 235, 0.76)',
        deep: 'rgba(29, 78, 216, 0.90)',
        shallow: 'rgba(96, 165, 250, 0.62)',
        wave: '#bfdbfe',
        bank: '#0f172a',
        highlight: 'rgba(255, 255, 255, 0.85)',
      },
      LAKE: {
        base: 'rgba(8, 145, 178, 0.80)',
        deep: 'rgba(14, 116, 144, 0.92)',
        shallow: 'rgba(34, 211, 238, 0.62)',
        wave: '#a5f3fc',
        bank: '#0f172a',
        highlight: 'rgba(255, 255, 255, 0.85)',
      },
      SNOW: {
        base: 'rgba(56, 189, 248, 0.70)',
        deep: 'rgba(2, 132, 199, 0.85)',
        shallow: 'rgba(186, 230, 253, 0.55)',
        wave: '#f0f9ff',
        bank: '#334155',
        highlight: 'rgba(255, 255, 255, 0.90)',
      },
      ICE: {
        base: 'rgba(14, 165, 233, 0.78)',
        deep: 'rgba(3, 105, 161, 0.92)',
        shallow: 'rgba(125, 211, 252, 0.60)',
        wave: '#e0f2fe',
        bank: '#021324',
        highlight: 'rgba(255, 255, 255, 0.90)',
      },
      SWAMP: {
        base: 'rgba(21, 128, 61, 0.80)',
        deep: 'rgba(20, 83, 45, 0.92)',
        shallow: 'rgba(74, 222, 128, 0.62)',
        wave: '#bbf7d0',
        bank: '#142316',
        highlight: 'rgba(254, 240, 138, 0.75)',
      },
      TOXIC: {
        base: 'rgba(126, 34, 206, 0.82)',
        deep: 'rgba(88, 28, 135, 0.94)',
        shallow: 'rgba(192, 132, 252, 0.65)',
        wave: '#e9d5ff',
        bank: '#24043d',
        highlight: 'rgba(240, 171, 252, 0.85)',
      },
      MECHA: {
        base: 'rgba(180, 83, 9, 0.78)',
        deep: 'rgba(120, 53, 15, 0.92)',
        shallow: 'rgba(245, 158, 11, 0.62)',
        wave: '#fef08a',
        bank: '#1a1109',
        highlight: 'rgba(255, 255, 255, 0.75)',
      },
      ISLAND: {
        base: 'rgba(14, 116, 144, 0.85)',
        deep: 'rgba(19, 78, 74, 0.94)',
        shallow: 'rgba(45, 212, 191, 0.65)',
        wave: '#99f6e4',
        bank: '#0f172a',
        highlight: 'rgba(255, 255, 255, 0.85)',
      },
      MAGMA: {
        base: 'rgba(239, 68, 68, 0.85)',
        deep: 'rgba(185, 28, 28, 0.95)',
        shallow: 'rgba(251, 146, 60, 0.70)',
        wave: '#fed7aa',
        bank: '#450a0a',
        highlight: 'rgba(254, 240, 138, 0.90)',
      },
      TEMPLE: {
        base: 'rgba(79, 70, 229, 0.82)',
        deep: 'rgba(67, 56, 202, 0.94)',
        shallow: 'rgba(129, 140, 248, 0.65)',
        wave: '#c7d2fe',
        bank: '#1e1b4b',
        highlight: 'rgba(255, 255, 255, 0.85)',
      },
      ALTAR: {
        base: 'rgba(88, 28, 135, 0.88)',
        deep: 'rgba(59, 7, 100, 0.96)',
        shallow: 'rgba(168, 85, 247, 0.70)',
        wave: '#f3e8ff',
        bank: '#1e0538',
        highlight: 'rgba(255, 255, 255, 0.90)',
      },
    };
    const wc = waterColors[biome] || waterColors.STONE;

    // 周辺8マスの水流判定
    const isWater = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return false;
      return map.tiles[gy][gx] === TileType.Water;
    };

    const upW = isWater(gridX, gridY - 1);
    const downW = isWater(gridX, gridY + 1);
    const leftW = isWater(gridX - 1, gridY);
    const rightW = isWater(gridX + 1, gridY);
    const ulW = isWater(gridX - 1, gridY - 1);
    const urW = isWater(gridX + 1, gridY - 1);
    const dlW = isWater(gridX - 1, gridY + 1);
    const drW = isWater(gridX + 1, gridY + 1);

    // 川底の砂利・丸小石（水を通して透けて見える川底テクスチャ）
    const stoneHash = Math.abs((gridX * 4391 ^ gridY * 8537) % 5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    if (stoneHash === 0) {
      ctx.beginPath();
      ctx.ellipse(x + s * 0.35, y + s * 0.45, s * 0.08, s * 0.05, 0.4, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.65, y + s * 0.7, s * 0.07, s * 0.05, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (stoneHash === 1) {
      ctx.beginPath();
      ctx.ellipse(x + s * 0.5, y + s * 0.35, s * 0.09, s * 0.06, -0.2, 0, Math.PI * 2);
      ctx.ellipse(x + s * 0.25, y + s * 0.65, s * 0.06, s * 0.04, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 水流ボディの描画（深水と浅瀬のグラデーション）
    const isDeep = upW && downW && leftW && rightW;
    if (isDeep) {
      // 四方が水: 深淵な深水面
      const deepGrad = ctx.createRadialGradient(
        x + s * 0.5,
        y + s * 0.5,
        s * 0.1,
        x + s * 0.5,
        y + s * 0.5,
        s * 0.75
      );
      deepGrad.addColorStop(0, wc.deep);
      deepGrad.addColorStop(1, wc.base);
      ctx.fillStyle = deepGrad;
      ctx.fillRect(x, y, s, s);
    } else {
      // 陸地に近い浅瀬: 透き通るベース
      ctx.fillStyle = wc.base;
      ctx.fillRect(x, y, s, s);
    }

    // 4. 有機的な岸辺（バンクエッジ）と角丸アウター/インナーコーナー
    const cornerR = s * 0.36; // 岸辺の丸み半径

    // (A) 上が陸地（北岸）: 突き出た陸地からの深層ドロップシャドウと土手ライン
    if (!upW) {
      // 陸地段差シャドウ
      const bankGrad = ctx.createLinearGradient(x, y, x, y + s * 0.45);
      bankGrad.addColorStop(0, 'rgba(0, 0, 0, 0.70)');
      bankGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.30)');
      bankGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bankGrad;
      ctx.fillRect(x, y, s, s * 0.45);

      // 土手ヘリ
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x, y, s, Math.max(2, s * 0.08));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(x, y + Math.max(2, s * 0.08), s, 1);
    }

    // (B) 下が陸地（南岸）: 浅瀬に打ち寄せる波の白泡リップル
    if (!downW) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x, y + s - Math.max(2, s * 0.06), s, Math.max(2, s * 0.06));

      // 白泡ライン
      ctx.fillStyle = wc.highlight;
      ctx.fillRect(x, y + s - Math.max(3, s * 0.1), s, Math.max(1.5, s * 0.04));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(x, y + s - Math.max(4.5, s * 0.14), s, 1);
    }

    // (C) 左が陸地（西岸）
    if (!leftW) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x, y, Math.max(2, s * 0.07), s);
      const leftShadow = ctx.createLinearGradient(x, y, x + s * 0.3, y);
      leftShadow.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      leftShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = leftShadow;
      ctx.fillRect(x, y, s * 0.3, s);
    }

    // (D) 右が陸地（東岸）
    if (!rightW) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x + s - Math.max(2, s * 0.07), y, Math.max(2, s * 0.07), s);
      const rightShadow = ctx.createLinearGradient(x + s, y, x + s - s * 0.3, y);
      rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rightShadow;
      ctx.fillRect(x + s - s * 0.3, y, s * 0.3, s);
    }

    // (E) アウターコーナー（凸角）の自然なカーブ処理
    if (!upW && !leftW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cornerR, y);
      ctx.quadraticCurveTo(x + cornerR * 0.4, y + cornerR * 0.4, x, y + cornerR);
      ctx.closePath();
      ctx.fill();
    }
    if (!upW && !rightW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x + s, y);
      ctx.lineTo(x + s - cornerR, y);
      ctx.quadraticCurveTo(x + s - cornerR * 0.4, y + cornerR * 0.4, x + s, y + cornerR);
      ctx.closePath();
      ctx.fill();
    }
    if (!downW && !leftW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.lineTo(x + cornerR, y + s);
      ctx.quadraticCurveTo(x + cornerR * 0.4, y + s - cornerR * 0.4, x, y + s - cornerR);
      ctx.closePath();
      ctx.fill();
    }
    if (!downW && !rightW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x + s, y + s);
      ctx.lineTo(x + s - cornerR, y + s);
      ctx.quadraticCurveTo(x + s - cornerR * 0.4, y + s - cornerR * 0.4, x + s, y + s - cornerR);
      ctx.closePath();
      ctx.fill();
    }

    // (F) インナーコーナー（凹角）の処理
    if (upW && leftW && !ulW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s * 0.22, y);
      ctx.quadraticCurveTo(x + s * 0.08, y + s * 0.08, x, y + s * 0.22);
      ctx.closePath();
      ctx.fill();
    }
    if (upW && rightW && !urW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x + s, y);
      ctx.lineTo(x + s - s * 0.22, y);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s * 0.08, x + s, y + s * 0.22);
      ctx.closePath();
      ctx.fill();
    }
    if (downW && leftW && !dlW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.lineTo(x + s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s * 0.08, y + s - s * 0.08, x, y + s - s * 0.22);
      ctx.closePath();
      ctx.fill();
    }
    if (downW && rightW && !drW) {
      ctx.fillStyle = wc.bank;
      ctx.beginPath();
      ctx.moveTo(x + s, y + s);
      ctx.lineTo(x + s - s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s - s * 0.08, x + s, y + s - s * 0.22);
      ctx.closePath();
      ctx.fill();
    }

    // 5. 生きた水流アニメーションと光の屈折（コースティクス波紋）
    if (isVisible) {
      const time = this.anim.globalTime;
      const flowT = time * 1.8;

      const cOffset1 = Math.sin(flowT + gridX * 0.9 + gridY * 0.7) * (s * 0.08);
      const cOffset2 = Math.cos(flowT * 1.2 + gridX * 0.6 + gridY * 1.1) * (s * 0.07);

      ctx.strokeStyle = wc.wave;
      ctx.lineWidth = Math.max(1.2, s * 0.04);
      ctx.lineCap = 'round';

      // メイン波紋ライン1
      ctx.beginPath();
      ctx.moveTo(x + s * 0.15, y + s * 0.38 + cOffset1);
      ctx.bezierCurveTo(
        x + s * 0.38,
        y + s * 0.38 + cOffset1 - 3,
        x + s * 0.62,
        y + s * 0.38 + cOffset1 + 3,
        x + s * 0.85,
        y + s * 0.38 + cOffset1
      );
      ctx.stroke();

      // サブ波紋ライン2
      ctx.beginPath();
      ctx.moveTo(x + s * 0.25, y + s * 0.68 + cOffset2);
      ctx.bezierCurveTo(
        x + s * 0.45,
        y + s * 0.68 + cOffset2 + 2,
        x + s * 0.68,
        y + s * 0.68 + cOffset2 - 2,
        x + s * 0.88,
        y + s * 0.68 + cOffset2
      );
      ctx.stroke();

      // 光の屈折コースティクス網目
      ctx.strokeStyle = wc.highlight;
      ctx.lineWidth = 1;
      const ringPulse = (Math.sin(flowT * 2.5 + gridX * 2.3 + gridY * 1.9) + 1) * 0.5;
      if (ringPulse > 0.45) {
        ctx.beginPath();
        ctx.ellipse(
          x + s * 0.52,
          y + s * 0.5,
          s * 0.18 * ringPulse,
          s * 0.09 * ringPulse,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // キラリと光る水面反射ハイライト
      const sparkle = Math.sin(time * 3.8 + gridX * 1.9 + gridY * 2.7);
      if (sparkle > 0.65) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + s * 0.62, y + s * 0.28, Math.max(1.2, s * 0.035), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.62)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 木の橋タイルのオートタイリング描画（縦連結・横連結・交差点・壊れかけ木橋）
   */
  private drawBridgeTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number,
    isBroken = false
  ): void {
    const map = this.engine.map;
    // 水流を下敷きとして描画
    const waterColors: Record<
      BiomeType,
      { base: string }
    > = {
      STONE: { base: 'rgba(2, 132, 199, 0.72)' },
      EARTH: { base: 'rgba(13, 148, 136, 0.75)' },
      FOREST: { base: 'rgba(5, 150, 105, 0.75)' },
      RIVER: { base: 'rgba(37, 99, 235, 0.72)' },
      LAKE: { base: 'rgba(8, 145, 178, 0.78)' },
      SNOW: { base: 'rgba(56, 189, 248, 0.65)' },
      ICE: { base: 'rgba(14, 165, 233, 0.75)' },
      SWAMP: { base: 'rgba(21, 128, 61, 0.78)' },
      TOXIC: { base: 'rgba(126, 34, 206, 0.82)' },
      MECHA: { base: 'rgba(180, 83, 9, 0.75)' },
      ISLAND: { base: 'rgba(14, 116, 144, 0.85)' },
      MAGMA: { base: 'rgba(239, 68, 68, 0.85)' },
      TEMPLE: { base: 'rgba(79, 70, 229, 0.82)' },
      ALTAR: { base: 'rgba(88, 28, 135, 0.88)' },
    };
    const wc = waterColors[biome] || waterColors.RIVER;
    ctx.fillStyle = wc.base;
    ctx.fillRect(x, y, s, s);

    // 上下左右の隣接マスが通行可能（Bridge, BrokenBridge, Floor, StairsDown）か判定
    const isBridgeOrFloor = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return false;
      const t = map.tiles[gy][gx];
      return (
        t === TileType.Bridge ||
        t === TileType.BrokenBridge ||
        t === TileType.Floor ||
        t === TileType.StairsDown
      );
    };

    const hasUp = isBridgeOrFloor(gridX, gridY - 1);
    const hasDown = isBridgeOrFloor(gridX, gridY + 1);
    const hasLeft = isBridgeOrFloor(gridX - 1, gridY);
    const hasRight = isBridgeOrFloor(gridX + 1, gridY);

    const isVertical = hasUp || hasDown;
    const isHorizontal = hasLeft || hasRight;
    const connectCount =
      (hasUp ? 1 : 0) +
      (hasDown ? 1 : 0) +
      (hasLeft ? 1 : 0) +
      (hasRight ? 1 : 0);
    const isCross = connectCount >= 3 || (isVertical && isHorizontal);

    // 木の橋スプライトの描画
    const bridgeSprite = TileSprites.getBridgeSprite(
      isVertical,
      isHorizontal,
      isCross,
      isBroken
    );
    if (bridgeSprite) {
      ctx.drawImage(bridgeSprite, x, y, s, s);
    } else {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y + s * 0.15, s, s * 0.7);
    }

    // 上が壁なら橋にも影
    if (gridY > 0 && map.tiles[gridY - 1]?.[gridX] === TileType.Wall) {
      const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.4);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(x, y, s, s * 0.4);
    }

    // 視界外マスク
    if (!isVisible) {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.62)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 特殊環境ギミック床 (Ice, Mud, Poison) の描画
   */
  private drawGimmickTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    tile: TileType,
    gridX: number,
    gridY: number,
    biome: BiomeType
  ): void {
    const map = this.engine.map;

    // 泥濘 (Mud) および 毒沼 (Poison) は高精細な有機的オートタイリングで描画
    if (tile === TileType.Mud || tile === TileType.Poison) {
      this.drawSwampAutoTile(
        ctx,
        x,
        y,
        s,
        isVisible,
        tile,
        gridX,
        gridY,
        biome
      );
      return;
    }

    // 氷 (Ice) の描画（床スプライトを下敷きに、滑らかな半透明氷床を重ねる）
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    }
    const gimmickSprite = TileSprites.getGimmickSprite(tile);
    if (gimmickSprite) {
      ctx.drawImage(gimmickSprite, x, y, s, s);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x, y, s, s);
    }

    // 上が壁なら影
    if (gridY > 0 && map.tiles[gridY - 1]?.[gridX] === TileType.Wall) {
      const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.4);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(x, y, s, s * 0.4);
    }

    if (!isVisible) {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.62)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 沼地（泥濘: Mud / 毒沼: Poison）の高精細有機的オートタイリング描画。
   * 周辺8方向の隣接判定、陸地床との湿潤シャドウ・境界ブレンディング、
   * 沼同士がシームレスに結合する深泥プール、有機的な境界カーブ、
   * およびポコポコと湧き出る気泡アニメーション・泥濘ディテールを描画します。
   */
  private drawSwampAutoTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    tile: TileType,
    gridX: number,
    gridY: number,
    biome: BiomeType
  ): void {
    const map = this.engine.map;
    const isPoison = tile === TileType.Poison;

    // 1. 下敷き床スプライト（沼地以外の陸地との境界ブレンディング用）
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    }

    // 周辺8マスの同種沼判定
    const isSwamp = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return false;
      const t = map.tiles[gy][gx];
      return t === tile;
    };

    const upS = isSwamp(gridX, gridY - 1);
    const downS = isSwamp(gridX, gridY + 1);
    const leftS = isSwamp(gridX - 1, gridY);
    const rightS = isSwamp(gridX + 1, gridY);
    const ulS = isSwamp(gridX - 1, gridY - 1);
    const urS = isSwamp(gridX + 1, gridY - 1);
    const dlS = isSwamp(gridX - 1, gridY + 1);
    const drS = isSwamp(gridX + 1, gridY + 1);

    // 2. パレット設定（Mud: リアルな泥褐色 / Poison: 腐食妖毒紫）
    const colors = isPoison
      ? {
          deep: '#1e052c',
          base: '#3b0764',
          surface: '#581c87',
          rim: '#a855f7',
          bubble: '#22c55e',
          bubbleHi: '#86efac',
          wet: 'rgba(30, 5, 45, 0.55)',
        }
      : {
          deep: '#291002',
          base: '#451a03',
          surface: '#6b2d0a',
          rim: '#b45309',
          bubble: '#d97706',
          bubbleHi: '#fef3c7',
          wet: 'rgba(35, 15, 5, 0.50)',
        };

    // 3. 境界湿潤シャドウ（床へジワリと染み出す泥の湿り気グラデーション）
    if (!upS || !downS || !leftS || !rightS) {
      ctx.fillStyle = colors.wet;
      ctx.fillRect(x, y, s, s);
    }

    // 4. メイン沼地プール（有機的な形状とシームレス連結）
    const m = s * 0.08; // 陸地境界のマージン
    const r = s * 0.38; // 陸地境界の角丸み半径

    // 有機的なうねり（境界の端点では0になり、接続面で段差が生じない）
    const waveU = !upS ? Math.sin((gridX * 7 + gridY * 13) % 7) * (s * 0.035) : 0;
    const waveD = !downS ? Math.sin((gridX * 9 + gridY * 17) % 7) * (s * 0.035) : 0;
    const waveL = !leftS ? Math.cos((gridX * 13 + gridY * 7) % 7) * (s * 0.035) : 0;
    const waveR = !rightS ? Math.cos((gridX * 11 + gridY * 5) % 7) * (s * 0.035) : 0;

    ctx.save();
    ctx.beginPath();

    // --- (A) 左上開始点 ---
    if (!upS && !leftS) {
      ctx.moveTo(x + r, y + m);
    } else if (!upS) {
      ctx.moveTo(x, y + m);
    } else if (!leftS) {
      ctx.moveTo(x + m, y);
    } else {
      ctx.moveTo(x, y);
    }

    // --- (B) 上辺 〜 右上 ---
    if (!upS) {
      ctx.lineTo(x + s * 0.5, y + m + waveU);
      if (!rightS) {
        ctx.lineTo(x + s - r, y + m);
        ctx.quadraticCurveTo(x + s - m, y + m, x + s - m, y + r);
      } else {
        ctx.lineTo(x + s, y + m);
      }
    } else {
      if (!rightS) {
        ctx.lineTo(x + s - m, y);
      } else {
        ctx.lineTo(x + s, y);
      }
    }

    // --- (C) 右辺 〜 右下 ---
    if (!rightS) {
      ctx.lineTo(x + s - m + waveR, y + s * 0.5);
      if (!downS) {
        ctx.lineTo(x + s - m, y + s - r);
        ctx.quadraticCurveTo(x + s - m, y + s - m, x + s - r, y + s - m);
      } else {
        ctx.lineTo(x + s - m, y + s);
      }
    } else {
      if (!downS) {
        ctx.lineTo(x + s, y + s - m);
      } else {
        ctx.lineTo(x + s, y + s);
      }
    }

    // --- (D) 下辺 〜 左下 ---
    if (!downS) {
      ctx.lineTo(x + s * 0.5, y + s - m + waveD);
      if (!leftS) {
        ctx.lineTo(x + r, y + s - m);
        ctx.quadraticCurveTo(x + m, y + s - m, x + m, y + s - r);
      } else {
        ctx.lineTo(x, y + s - m);
      }
    } else {
      if (!leftS) {
        ctx.lineTo(x + m, y + s);
      } else {
        ctx.lineTo(x, y + s);
      }
    }

    // --- (E) 左辺 〜 左上クローズ ---
    if (!leftS) {
      ctx.lineTo(x + m + waveL, y + s * 0.5);
      if (!upS) {
        ctx.lineTo(x + m, y + r);
        ctx.quadraticCurveTo(x + m, y + m, x + r, y + m);
      } else {
        ctx.lineTo(x + m, y);
      }
    } else {
      if (!upS) {
        ctx.lineTo(x, y + m);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();

    // 沼地ベースの塗りつぶし（中央ほど深くなるラジアルグラデーション）
    const swampGrad = ctx.createRadialGradient(
      x + s * 0.5,
      y + s * 0.5,
      s * 0.1,
      x + s * 0.5,
      y + s * 0.5,
      s * 0.7
    );
    swampGrad.addColorStop(0, colors.deep);
    swampGrad.addColorStop(0.7, colors.base);
    swampGrad.addColorStop(1, colors.surface);
    ctx.fillStyle = swampGrad;
    ctx.fill();
    ctx.restore();

    // --- 陸地に面している境界のみにフチ（rim）を描画 ---
    // ※隣が沼（繋がっている部分）には絶対に描画しない！
    ctx.save();
    ctx.strokeStyle = colors.rim;
    ctx.lineWidth = Math.max(1.2, s * 0.035);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. 上辺の陸地境界
    if (!upS) {
      ctx.beginPath();
      const startX = leftS ? x : (!leftS ? x + r : x + m);
      const endX = rightS ? x + s : (!rightS ? x + s - r : x + s - m);
      ctx.moveTo(startX, y + m);
      ctx.lineTo(x + s * 0.5, y + m + waveU);
      ctx.lineTo(endX, y + m);
      ctx.stroke();
    }

    // 2. 右上アウターコーナー
    if (!upS && !rightS) {
      ctx.beginPath();
      ctx.moveTo(x + s - r, y + m);
      ctx.quadraticCurveTo(x + s - m, y + m, x + s - m, y + r);
      ctx.stroke();
    }

    // 3. 右辺の陸地境界
    if (!rightS) {
      ctx.beginPath();
      const startY = upS ? y : (!upS ? y + r : y + m);
      const endY = downS ? y + s : (!downS ? y + s - r : y + s - m);
      ctx.moveTo(x + s - m, startY);
      ctx.lineTo(x + s - m + waveR, y + s * 0.5);
      ctx.lineTo(x + s - m, endY);
      ctx.stroke();
    }

    // 4. 右下アウターコーナー
    if (!downS && !rightS) {
      ctx.beginPath();
      ctx.moveTo(x + s - m, y + s - r);
      ctx.quadraticCurveTo(x + s - m, y + s - m, x + s - r, y + s - m);
      ctx.stroke();
    }

    // 5. 下辺の陸地境界
    if (!downS) {
      ctx.beginPath();
      const startX = rightS ? x + s : (!rightS ? x + s - r : x + s - m);
      const endX = leftS ? x : (!leftS ? x + r : x + m);
      ctx.moveTo(startX, y + s - m);
      ctx.lineTo(x + s * 0.5, y + s - m + waveD);
      ctx.lineTo(endX, y + s - m);
      ctx.stroke();
    }

    // 6. 左下アウターコーナー
    if (!downS && !leftS) {
      ctx.beginPath();
      ctx.moveTo(x + r, y + s - m);
      ctx.quadraticCurveTo(x + m, y + s - m, x + m, y + s - r);
      ctx.stroke();
    }

    // 7. 左辺の陸地境界
    if (!leftS) {
      ctx.beginPath();
      const startY = downS ? y + s : (!downS ? y + s - r : y + s - m);
      const endY = upS ? y : (!upS ? y + r : y + m);
      ctx.moveTo(x + m, startY);
      ctx.lineTo(x + m + waveL, y + s * 0.5);
      ctx.lineTo(x + m, endY);
      ctx.stroke();
    }

    // 8. 左上アウターコーナー
    if (!upS && !leftS) {
      ctx.beginPath();
      ctx.moveTo(x + m, y + r);
      ctx.quadraticCurveTo(x + m, y + m, x + r, y + m);
      ctx.stroke();
    }

    // 9. インナーコーナー（斜めだけが陸地の場合の泥岸の切り込み）
    // カーブ部分のみにフチを引き、タイルの外枠には絶対に線を引かない
    if (upS && leftS && !ulS) {
      ctx.fillStyle = colors.wet;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s * 0.22, y);
      ctx.quadraticCurveTo(x + s * 0.08, y + s * 0.08, x, y + s * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y);
      ctx.quadraticCurveTo(x + s * 0.08, y + s * 0.08, x, y + s * 0.22);
      ctx.stroke();
    }
    if (upS && rightS && !urS) {
      ctx.fillStyle = colors.wet;
      ctx.beginPath();
      ctx.moveTo(x + s, y);
      ctx.lineTo(x + s - s * 0.22, y);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s * 0.08, x + s, y + s * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + s - s * 0.22, y);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s * 0.08, x + s, y + s * 0.22);
      ctx.stroke();
    }
    if (downS && leftS && !dlS) {
      ctx.fillStyle = colors.wet;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.lineTo(x + s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s * 0.08, y + s - s * 0.08, x, y + s - s * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s * 0.08, y + s - s * 0.08, x, y + s - s * 0.22);
      ctx.stroke();
    }
    if (downS && rightS && !drS) {
      ctx.fillStyle = colors.wet;
      ctx.beginPath();
      ctx.moveTo(x + s, y + s);
      ctx.lineTo(x + s - s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s - s * 0.08, x + s, y + s - s * 0.22);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + s - s * 0.22, y + s);
      ctx.quadraticCurveTo(x + s - s * 0.08, y + s - s * 0.08, x + s, y + s - s * 0.22);
      ctx.stroke();
    }

    ctx.restore();

    // 6. 表面ディテール: 半分沈んだ小石や泥のシワ
    const detailHash = Math.abs((gridX * 6173 ^ gridY * 9887) % 4);
    if (detailHash === 0) {
      // 沈んだ小石
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.ellipse(x + s * 0.35, y + s * 0.6, s * 0.08, s * 0.05, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(x + s * 0.35, y + s * 0.58, s * 0.05, s * 0.03, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (detailHash === 1) {
      // 泥の粘性シワ
      ctx.strokeStyle = colors.deep;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x + s * 0.65, y + s * 0.4, s * 0.14, 0.5, 2.8);
      ctx.stroke();
    }

    // 7. 生きたアニメーション気泡（泡の膨張・パチンと弾ける演出）
    if (isVisible) {
      const time = this.anim.globalTime;

      // 気泡1
      const phase1 = (time * 1.6 + gridX * 0.7 + gridY * 1.1) % (Math.PI * 2);
      const bScale1 = Math.sin(phase1);
      if (bScale1 > 0) {
        const bRad1 = s * 0.07 * (0.4 + 0.6 * bScale1);
        const bx1 = x + s * (0.28 + ((gridX * 17) % 3) * 0.05);
        const by1 = y + s * (0.35 + ((gridY * 19) % 3) * 0.05);

        ctx.fillStyle = colors.bubble;
        ctx.beginPath();
        ctx.arc(bx1, by1, bRad1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.bubbleHi;
        ctx.beginPath();
        ctx.arc(bx1 - bRad1 * 0.3, by1 - bRad1 * 0.3, bRad1 * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // 気泡2（少し遅れて発生するサブ気泡）
      const phase2 = (time * 2.1 + gridX * 1.3 + gridY * 0.8 + 2.0) % (Math.PI * 2);
      const bScale2 = Math.sin(phase2);
      if (bScale2 > 0.2) {
        const bRad2 = s * 0.055 * (0.5 + 0.5 * bScale2);
        const bx2 = x + s * (0.68 - ((gridY * 13) % 3) * 0.05);
        const by2 = y + s * (0.65 - ((gridX * 23) % 3) * 0.05);

        ctx.fillStyle = colors.bubble;
        ctx.beginPath();
        ctx.arc(bx2, by2, bRad2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colors.bubbleHi;
        ctx.beginPath();
        ctx.arc(bx2 - bRad2 * 0.3, by2 - bRad2 * 0.3, bRad2 * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // 毒沼特有の有毒ガス胞パルス
      if (isPoison) {
        const pulse = (Math.sin(time * 3.2 + gridX * 2.1 + gridY * 1.7) + 1) * 0.5;
        if (pulse > 0.6) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x + s * 0.5, y + s * 0.5, s * 0.22 * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.62)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * 階段タイルの描画
   */
  private drawStairsTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    s: number,
    isVisible: boolean,
    biome: BiomeType,
    gridX: number,
    gridY: number
  ): void {
    const map = this.engine.map;
    // 下敷きとなる床
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x, y, s, s);
    }

    // 上が壁なら影
    if (gridY > 0 && map.tiles[gridY - 1]?.[gridX] === TileType.Wall) {
      const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.35);
      shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(x, y, s, s * 0.35);
    }

    const stairsImg = SVGSprites.get('tile_stairs_down');

    if (isVisible) {
      // 下層フロアへの神秘的な黄金グロー光彩（呼吸するように緩やかに脈動）
      const glowPulse = 0.35 + Math.sin(this.anim.globalTime * 3.0) * 0.15;
      const cx = x + s / 2;
      const cy = y + s / 2;
      const glowGrad = ctx.createRadialGradient(
        cx,
        cy,
        s * 0.1,
        cx,
        cy,
        s * 0.55
      );
      glowGrad.addColorStop(0, `rgba(251, 191, 36, ${glowPulse})`);
      glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(x, y, s, s);

      if (stairsImg) {
        ctx.drawImage(stairsImg, x, y, s, s);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.floor(s * 0.7)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▼', cx, cy);
      }
    } else {
      // 未視界（探索済み暗がり）: 薄暗いトーンで配置記憶を表示
      if (stairsImg) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.drawImage(stairsImg, x, y, s, s);
        ctx.restore();
      } else {
        ctx.fillStyle = '#785514';
        ctx.font = `bold ${Math.floor(s * 0.7)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('▼', x + s / 2, y + s / 2);
      }
      ctx.fillStyle = 'rgba(3, 7, 18, 0.4)';
      ctx.fillRect(x, y, s, s);
    }
  }

  /**
   * インタラクティブ障害物（土の塊、倒木、雪の塊、押せる大石、滑る氷塊）を描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param obstacle - 障害物データ
   * @param x - スクリーン上X座標
   * @param y - スクリーン上Y座標
   * @param size - タイルサイズ（ピクセル）
   * @param isVisible - 視界内かどうか
   * @param animState - 障害物のアニメーション状態
   */
  private drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    x: number,
    y: number,
    size: number,
    isVisible: boolean,
    animState?: ReturnType<AnimationEngine['getState']>
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const s = Math.ceil(size);

    const spriteId = SVGSprites.getObstacleSpriteId(obstacle.type);
    const spriteImg = SVGSprites.get(spriteId);

    if (isVisible) {
      // 接地影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.32, s * 0.32, s * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // スライド移動中・滑走中の氷の擦過線や土煙演出
      if (animState?.isSliding || animState?.isWalking) {
        ctx.strokeStyle =
          obstacle.type === 'ICE_BLOCK'
            ? 'rgba(224, 242, 254, 0.6)'
            : 'rgba(168, 162, 158, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.2, cy + s * 0.32);
        ctx.lineTo(cx + s * 0.2, cy + s * 0.32);
        ctx.stroke();
      }

      const obSize = s * 0.95;
      ctx.save();
      if (animState && animState.damageFlash > 0) {
        ctx.filter = `brightness(${1 + animState.damageFlash * 1.5}) saturate(${
          1 + animState.damageFlash * 2
        })`;
      }

      if (spriteImg) {
        ctx.drawImage(
          spriteImg,
          cx - obSize / 2,
          cy - obSize / 2,
          obSize,
          obSize
        );
      } else {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(
          cx - obSize * 0.4,
          cy - obSize * 0.4,
          obSize * 0.8,
          obSize * 0.8
        );
      }
      ctx.restore();

      // 耐久度（HP）ゲージ表示（最大HPが2以上の破壊可能オブジェクトでダメージを受けている場合）
      if (
        obstacle.isDestructible &&
        obstacle.maxHp > 1 &&
        obstacle.hp < obstacle.maxHp
      ) {
        const barW = s * 0.7;
        const barH = Math.max(3, s * 0.08);
        const barX = cx - barW / 2;
        const barY = y + 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX, barY, barW, barH);

        const hpRatio = Math.max(0, obstacle.hp / obstacle.maxHp);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
      }
    } else {
      // 記憶タイル内（未視界）の薄暗いシルエット
      const obSize = s * 0.9;
      ctx.save();
      ctx.filter = 'brightness(35%) grayscale(100%)';
      if (spriteImg) {
        ctx.drawImage(
          spriteImg,
          cx - obSize / 2,
          cy - obSize / 2,
          obSize,
          obSize
        );
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(
          cx - obSize * 0.4,
          cy - obSize * 0.4,
          obSize * 0.8,
          obSize * 0.8
        );
      }
      ctx.restore();
    }
  }

  /**
   * 床落ちアイテムを描画します（上下浮遊を廃止し床に自然接地、たまにキラリと光る演出）。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param item - アイテムデータ
   * @param x - スクリーン上X座標
   * @param y - スクリーン上Y座標
   * @param size - タイルサイズ（ピクセル）
   * @param isVisible - 視界内かどうか
   */
  private drawItem(
    ctx: CanvasRenderingContext2D,
    item: Item,
    x: number,
    y: number,
    size: number,
    isVisible: boolean
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const s = Math.ceil(size);

    // 個別アイテム名に対応したスプライトIDの取得
    const spriteId = SVGSprites.getItemSpriteId(item.category, item.name);
    const spriteImg = SVGSprites.get(spriteId);

    if (isVisible) {
      // 1. 床への自然な固定接地影（ふわふわ浮遊は廃止）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + s * 0.28, s * 0.28, s * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. アイテムSVGスプライトの描画（床にしっかり腰を据えて配置）
      const itemSize = s * 0.85;

      if (spriteImg) {
        ctx.drawImage(
          spriteImg,
          cx - itemSize / 2,
          cy - itemSize / 2,
          itemSize,
          itemSize
        );
      } else {
        // スプライト未取得時のフォールバック
        ctx.fillStyle = item.color;
        ctx.font = `bold ${Math.floor(s * 0.65)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, cx, cy);
      }

      // 3. たまにキラリと光る（Glitter / Twinkle）演出
      // アイテムごとに位相をずらした周期（約3.0秒〜3.8秒）
      const hash = Math.abs((item.x * 47 ^ item.y * 83) % 1000);
      const cyclePeriod = 3.0 + (hash % 9) * 0.1;
      const t = (this.anim.globalTime + hash * 0.02) % cyclePeriod;

      // 0.35秒間だけキラーンと輝く
      if (t < 0.35) {
        const glintAlpha =
          t < 0.12 ? t / 0.12 : Math.max(0, 1.0 - (t - 0.12) / 0.23);

        const glintX = cx + itemSize * 0.2;
        const glintY = cy - itemSize * 0.2;

        ctx.save();
        ctx.globalAlpha = glintAlpha;

        // 十字光条（縦横に伸びる鋭いスパークルスター）
        const rayLen = s * 0.35 * glintAlpha;
        const rayWidth = Math.max(1.5, s * 0.04);

        // 外側の淡いグロー
        const grad = ctx.createRadialGradient(
          glintX,
          glintY,
          0,
          glintX,
          glintY,
          rayLen * 1.2
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.6)');
        grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(glintX, glintY, rayLen * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 鋭い水平光条
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(glintX - rayLen, glintY);
        ctx.lineTo(glintX, glintY - rayWidth);
        ctx.lineTo(glintX + rayLen, glintY);
        ctx.lineTo(glintX, glintY + rayWidth);
        ctx.closePath();
        ctx.fill();

        // 鋭い垂直光条
        ctx.beginPath();
        ctx.moveTo(glintX, glintY - rayLen);
        ctx.lineTo(glintX - rayWidth, glintY);
        ctx.lineTo(glintX, glintY + rayLen);
        ctx.lineTo(glintX + rayWidth, glintY);
        ctx.closePath();
        ctx.fill();

        // 斜めの小光条
        const subRay = rayLen * 0.45;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(glintX - subRay, glintY - subRay);
        ctx.lineTo(glintX + subRay, glintY + subRay);
        ctx.moveTo(glintX - subRay, glintY + subRay);
        ctx.lineTo(glintX + subRay, glintY - subRay);
        ctx.stroke();

        ctx.restore();
      }

      // 4. ショップ未会計商品または売却待ちアイテムの値札タグ描画
      if (item.isShopItem || item.isSoldToShop) {
        const isShopSale = item.isShopItem;
        const price = isShopSale ? item.price ?? item.value : item.sellPrice ?? Math.floor((item.value ?? 100) * 0.5);
        const tagText = isShopSale ? `${price}G` : `売${price}G`;

        ctx.font = `bold ${Math.max(8, Math.floor(s * 0.24))}px monospace`;
        const textWidth = ctx.measureText(tagText).width;
        const badgeW = textWidth + 8;
        const badgeH = Math.max(12, Math.floor(s * 0.28));
        const badgeX = cx - badgeW / 2;
        const badgeY = cy + s * 0.22;

        ctx.save();
        ctx.fillStyle = isShopSale ? 'rgba(15, 23, 42, 0.9)' : 'rgba(20, 83, 45, 0.9)';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
        ctx.fill();

        ctx.strokeStyle = isShopSale ? '#f59e0b' : '#22c55e';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isShopSale ? '#fef08a' : '#bbf7d0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, cx, badgeY + badgeH / 2);
        ctx.restore();
      }
    } else {
      // 記憶タイル内（未視界）の薄暗いシルエット
      const itemSize = s * 0.8;

      ctx.save();
      ctx.filter = 'brightness(35%) grayscale(100%)';
      if (spriteImg) {
        ctx.drawImage(
          spriteImg,
          cx - itemSize / 2,
          cy - itemSize / 2,
          itemSize,
          itemSize
        );
      } else {
        ctx.fillStyle = '#64748b';
        ctx.font = `bold ${Math.floor(s * 0.6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, cx, cy);
      }
      ctx.restore();
    }
  }

  /**
   * 演出用パーティクル（破片、土煙等）を描画します。
   */
  private drawParticles(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    effectiveTileSize: number
  ): void {
    if (this.anim.particles.length === 0) return;

    ctx.save();
    for (const p of this.anim.particles) {
      const px = Math.floor(cameraX + p.x * effectiveTileSize);
      const py = Math.floor(cameraY + p.y * effectiveTileSize);

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /**
   * 飛翔中の飛び道具（矢、石、アイテム）および魔法の杖のビーム光線を描画します。
   */
  private drawProjectiles(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    cameraY: number,
    tileSize: number
  ): void {
    if (!this.anim.projectiles || this.anim.projectiles.length === 0) return;

    ctx.save();
    for (const p of this.anim.projectiles) {
      const fromScreenX = cameraX + (p.fromX + 0.5) * tileSize;
      const fromScreenY = cameraY + (p.fromY + 0.5) * tileSize;
      const toScreenX = cameraX + (p.toX + 0.5) * tileSize;
      const toScreenY = cameraY + (p.toY + 0.5) * tileSize;

      const curScreenX = fromScreenX + (toScreenX - fromScreenX) * p.progress;
      let curScreenY = fromScreenY + (toScreenY - fromScreenY) * p.progress;

      const angle = Math.atan2(toScreenY - fromScreenY, toScreenX - fromScreenX);

      if (p.type === 'BEAM') {
        // 杖の魔法光線（太いグローライン＋中心コアレーザー＋先端スパーク）
        const alpha = Math.sin(p.progress * Math.PI); // フェードイン・アウト
        ctx.save();
        ctx.globalAlpha = Math.max(0.2, alpha);

        // 外側グロー
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fromScreenX, fromScreenY);
        ctx.lineTo(toScreenX, toScreenY);
        ctx.stroke();

        // 内側コア光線
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromScreenX, fromScreenY);
        ctx.lineTo(toScreenX, toScreenY);
        ctx.stroke();

        // 先端スパーク
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(curScreenX, curScreenY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'ARROW') {
        // 矢の描画（直線高速飛翔＋矢羽・鏃）
        ctx.save();
        ctx.translate(curScreenX, curScreenY);
        ctx.rotate(angle);

        // 矢のトレイル（飛行の残像）
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // 矢のシャフト
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(8, 0);
        ctx.stroke();

        // 矢羽（後部フェザー）
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-13, -3);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-13, 3);
        ctx.closePath();
        ctx.fill();

        // 鏃（先端メタルヘッド）
        ctx.fillStyle = p.color === '#e2e8f0' ? '#f8fafc' : '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(8, -4);
        ctx.lineTo(13, 0);
        ctx.lineTo(8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // STONE or ITEM: 放物線アークを描いて回転しながら飛ぶ
        const arcHeight = Math.sin(p.progress * Math.PI) * (tileSize * 0.8);
        curScreenY -= arcHeight;

        ctx.save();
        ctx.translate(curScreenX, curScreenY);
        ctx.rotate(p.progress * Math.PI * 8); // 高速回転

        if (p.type === 'STONE') {
          // 石ころ
          ctx.fillStyle = '#78716c';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#a8a29e';
          ctx.beginPath();
          ctx.arc(-1, -1, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // アイテム投擲（汎用アイテム光弾 / ドロップ体）
          ctx.fillStyle = p.color || '#38bdf8';
          ctx.shadowColor = p.color || '#38bdf8';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  /**
   * 敵モンスターをSVGスプライトおよび向き・アニメーション付きで描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param monster - モンスターデータ
   * @param cameraX - カメラオフセットX
   * @param cameraY - カメラオフセットY
   * @param tileSize - タイルサイズ
   */
  private drawMonster(
    ctx: CanvasRenderingContext2D,
    monster: Monster,
    cameraX: number,
    cameraY: number,
    tileSize: number
  ): void {
    const anim = this.anim.getState(monster.id, monster.x, monster.y);

    // アニメーション合成座標（スムーズ移動 ＋ 攻撃ステップイン ＋ 被弾振動）
    const worldX = anim.renderX + anim.attackOffsetX;
    const worldY = anim.renderY + anim.attackOffsetY;
    const screenX = cameraX + worldX * tileSize + anim.shakeX;
    const screenY = cameraY + worldY * tileSize + anim.shakeY;

    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const size =
      monster.type === 'ABYSS_LORD'
        ? tileSize * 1.45
        : monster.type === 'FOOD_STALL'
        ? tileSize * 1.35
        : tileSize * 1.05;

    // アイドルおよび歩行アニメーションの計算
    const time = this.anim.globalTime * 3.5 + anim.idleOffset;
    let bobY = 0;
    let scaleX = 1.0;
    let scaleY = 1.0;
    let rotation = 0;

    if (monster.type === 'SLIME') {
      if (anim.isWalking) {
        // スライム移動時: 飛び跳ねバウンス
        bobY = -Math.abs(Math.sin(anim.walkTime)) * 4.0;
        scaleY = 1.0 + Math.sin(anim.walkTime) * 0.15;
      } else {
        // スライム待機時: ぷるぷる伸縮パルス
        scaleY = 1.0 - Math.sin(time) * 0.08;
      }
    } else {
      if (anim.isWalking) {
        // 二足歩行モンスター移動時: トコトコ歩行ステップ
        bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.0;
        rotation = Math.sin(anim.walkTime) * 0.08;
      } else {
        // 待機時: 呼吸ボビング
        bobY = Math.sin(time) * 1.5;
      }
    }

    // 8方向スプライトIDおよび水平反転の決定
    let monsterBase: string;
    if (monster.variantId) {
      monsterBase = monster.variantId.toLowerCase();
    } else if (monster.type === 'MERCHANT') {
      const pid = (monster.shopkeeperProfileId && monster.shopkeeperProfileId !== 'NERO')
        ? `_${monster.shopkeeperProfileId.toLowerCase()}`
        : '';
      monsterBase = monster.isAngryMerchant
        ? `angry_merchant${pid}`
        : `merchant${pid}`;
    } else if (monster.type === 'FOOD_STALL') {
      if (monster.npcData?.stallType === 'ODEN') {
        monsterBase = 'food_stall_oden';
      } else if (monster.npcData?.stallClerk === 'WIFE') {
        monsterBase = 'food_stall_ramen_wife';
      } else {
        monsterBase = 'food_stall_ramen';
      }
    } else {
      monsterBase = monster.type.toLowerCase();
    }
    let dirSuffix = 'down';

    switch (anim.direction) {
      case 'up':
        dirSuffix = 'up';
        break;
      case 'up_right':
        dirSuffix = 'diag_up';
        break;
      case 'up_left':
        dirSuffix = 'diag_up';
        scaleX = -1.0;
        break;
      case 'right':
        dirSuffix = 'side';
        break;
      case 'left':
        dirSuffix = 'side';
        scaleX = -1.0;
        break;
      case 'down_right':
        dirSuffix = 'diag_down';
        break;
      case 'down_left':
        dirSuffix = 'diag_down';
        scaleX = -1.0;
        break;
      case 'down':
      default:
        dirSuffix = 'down';
        break;
    }

    // スライムの横方向伸縮パルスを反転スケールに合成
    if (monster.type === 'SLIME') {
      const pulse = anim.isWalking
        ? 1.0 - Math.sin(anim.walkTime) * 0.15
        : 1.0 + Math.sin(time) * 0.08;
      scaleX *= pulse;
    } else {
      rotation *= scaleX;
    }

    const spriteId = `${monsterBase}_${dirSuffix}` as SpriteId;
    const spriteImg =
      SVGSprites.get(spriteId) ??
      SVGSprites.get(`${monsterBase}_down` as SpriteId) ??
      SVGSprites.get(monsterBase as SpriteId);

    ctx.save();
    ctx.translate(cx, cy + bobY);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);

    // 被弾赤フラッシュ演出
    if (anim.damageFlash > 0) {
      ctx.filter = `brightness(${1 + anim.damageFlash * 0.5}) sepia(${anim.damageFlash}) saturate(${1 + anim.damageFlash * 3}) hue-rotate(-50deg)`;
    }

    if (spriteImg) {
      ctx.drawImage(spriteImg, -size / 2, -size / 2, size, size);
    } else {
      // スプライト未完了時のフォールバック
      ctx.fillStyle = monster.color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 敵モンスター攻撃アクション中の打撃・爪痕エフェクト
    const isMonsterAttacking =
      Math.hypot(anim.attackOffsetX, anim.attackOffsetY) > 0.05;
    if (isMonsterAttacking) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(size * 0.25, 0, size * 0.45, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    }

    ctx.restore();

    // 状態異常アイコン（頭上バッジ）の描画
    const statusBadges: { icon: string; bg: string; color: string }[] = [];
    if (monster.isParalyzed) {
      statusBadges.push({ icon: '⚡', bg: '#854d0e', color: '#fef08a' }); // かなしばり
    }
    if ((monster.sleepTurns ?? 0) > 0) {
      statusBadges.push({ icon: '💤', bg: '#3730a3', color: '#c7d2fe' }); // 睡眠
    }
    if ((monster.confuseTurns ?? 0) > 0) {
      statusBadges.push({ icon: '💫', bg: '#86198f', color: '#f5d0fe' }); // 混乱
    }
    if (monster.isSealed) {
      statusBadges.push({ icon: '🔒', bg: '#991b1b', color: '#fee2e2' }); // 封印
    }
    if (monster.isFriendly && monster.isShopkeeper) {
      statusBadges.push({ icon: '🏪', bg: '#ca8a04', color: '#fef08a' }); // 店主
    } else if (monster.isAngryMerchant) {
      statusBadges.push({ icon: '💢', bg: '#991b1b', color: '#fef2f2' }); // 怒れる店主
    } else if (monster.isGuardDog) {
      statusBadges.push({ icon: '🚨', bg: '#b91c1c', color: '#fee2e2' }); // 番犬警備
    } else if (monster.type === 'WANDERING_ADVENTURER') {
      statusBadges.push({ icon: '🎒', bg: '#1d4ed8', color: '#93c5fd' }); // 冒険者レオン（物々交換）
    } else if (monster.type === 'GAMBLER_SAGE') {
      statusBadges.push({ icon: '🎲', bg: '#6b21a8', color: '#f0abfc' }); // 賭博仙人ガンジ（じゃんけん）
    } else if (monster.type === 'HEALING_FAIRY') {
      statusBadges.push({ icon: '💖', bg: '#047857', color: '#6ee7b7' }); // 慈愛の妖精ピクシー（回復）
    } else if (monster.type === 'TRAVELING_BLACKSMITH') {
      statusBadges.push({ icon: '🔨', bg: '#9a3412', color: '#fed7aa' }); // 鍛冶屋バルカン（武具強化）
    } else if (monster.type === 'SCOOTER_GUY') {
      statusBadges.push({ icon: '🛵', bg: '#0284c7', color: '#bae6fd' }); // スクーターおじさん
    } else if (monster.isCompanion) {
      statusBadges.push({ icon: '💖', bg: '#be185d', color: '#fbcfe8' }); // 仲良し仲間モンスター（愛着）
    }

    if (statusBadges.length > 0) {
      const badgeSize = Math.max(12, Math.floor(tileSize * 0.38));
      const totalW = statusBadges.length * (badgeSize + 2) - 2;
      let startBx = cx - totalW / 2;
      const startBy = screenY - badgeSize + 2;

      for (const badge of statusBadges) {
        ctx.fillStyle = badge.bg;
        ctx.beginPath();
        ctx.arc(startBx + badgeSize / 2, startBy + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = badge.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = `${Math.floor(badgeSize * 0.7)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = badge.color;
        ctx.fillText(badge.icon, startBx + badgeSize / 2, startBy + badgeSize / 2);
        startBx += badgeSize + 2;
      }
    }

    // HPバーの描画（ボスの場合は常時豪華バー表示、通常敵は負傷時のみ表示）
    if (monster.type === 'ABYSS_LORD') {
      const barW = tileSize * 1.5;
      const barH = 5;
      const barX = cx - barW / 2;
      const barY = screenY - 8;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const hpRatio = Math.max(0, monster.hp / monster.maxHp);
      const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, '#c084fc');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
    } else if (monster.hp < monster.maxHp) {
      const barW = tileSize * 0.7;
      const barH = 3;
      const barX = cx - barW / 2;
      const barY = screenY + 1;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barW, barH);

      const hpRatio = Math.max(0, monster.hp / monster.maxHp);
      ctx.fillStyle = hpRatio > 0.4 ? '#ef4444' : '#b91c1c';
      ctx.fillRect(barX, barY, barW * hpRatio, barH);
    }
  }

  /**
   * プレイヤーキャラクターをSVGスプライトおよび向き（8方向）・歩行アニメーション付きで描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param anim - プレイヤーのアニメーション状態
   * @param cameraX - カメラオフセットX
   * @param cameraY - カメラオフセットY
   * @param tileSize - タイルサイズ
   * @param isAlive - 生存中かどうか
   */
  private drawPlayer(
    ctx: CanvasRenderingContext2D,
    anim: ReturnType<AnimationEngine['getState']>,
    cameraX: number,
    cameraY: number,
    tileSize: number,
    isAlive: boolean
  ): void {
    const worldX = anim.renderX + anim.attackOffsetX;
    const worldY = anim.renderY + anim.attackOffsetY;
    const screenX = cameraX + worldX * tileSize + anim.shakeX;
    const screenY = cameraY + worldY * tileSize + anim.shakeY;

    const cx = screenX + tileSize / 2;
    const cy = screenY + tileSize / 2;
    const size = tileSize * 1.05;

    if (isAlive) {
      // 生存中なら死亡アニメーション状態をリセット
      if (this.anim.isPlayerDead()) {
        this.anim.resetPlayerDeath();
      }

      // 1. 生存時: 足元の光輪エフェクト
      const r = size * 0.4;
      const gradient = ctx.createRadialGradient(
        cx,
        cy + 4,
        r * 0.2,
        cx,
        cy + 4,
        r * 1.5
      );
      gradient.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
      gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy + 4, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. 移動時 vs 待機時のアニメーション計算 & 8方向スプライト選択
      let bobY = 0;
      let rotation = 0;
      let spriteKey: SpriteId = 'player_down';
      let scaleX = 1.0;
      const dir = anim.direction; // Direction8
      let effectiveDir: Direction8 = dir;

      switch (dir) {
        case 'up': {
          // 真上（北・背面）
          if (anim.isWalking) {
            bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.5;
            rotation = Math.sin(anim.walkTime) * 0.06;
            const cycle = Math.sin(anim.walkTime);
            if (cycle > 0.2) spriteKey = 'player_up_walk1';
            else if (cycle < -0.2) spriteKey = 'player_up_walk2';
            else spriteKey = 'player_up';
          } else {
            bobY = Math.sin(this.anim.globalTime * 3) * 1.5;
            spriteKey = 'player_up';
          }
          break;
        }

        case 'up_right':
        case 'up_left': {
          // 斜め奥（北東 / 北西・クォータービュー後ろ姿）
          scaleX = dir === 'up_left' ? -1.0 : 1.0;
          if (anim.isWalking) {
            bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.5;
            rotation = Math.sin(anim.walkTime) * 0.07 * scaleX;
            const cycle = Math.sin(anim.walkTime);
            if (cycle > 0.2) spriteKey = 'player_diag_up_walk1';
            else if (cycle < -0.2) spriteKey = 'player_diag_up_walk2';
            else spriteKey = 'player_diag_up';
          } else {
            bobY = Math.sin(this.anim.globalTime * 3) * 1.5;
            spriteKey = 'player_diag_up';
          }
          break;
        }

        case 'right':
        case 'left': {
          // 真横（東 / 西）
          scaleX = dir === 'left' ? -1.0 : 1.0;
          if (anim.isWalking) {
            bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.5;
            rotation = Math.sin(anim.walkTime) * 0.08 * scaleX;
            const cycle = Math.sin(anim.walkTime);
            if (cycle > 0.2) spriteKey = 'player_side_walk1';
            else if (cycle < -0.2) spriteKey = 'player_side_walk2';
            else spriteKey = 'player_side';
          } else {
            bobY = Math.sin(this.anim.globalTime * 3) * 1.5;
            spriteKey = 'player_side';
          }
          break;
        }

        case 'down_right':
        case 'down_left': {
          // 斜め手前（南東 / 南西・クォータービュー前向き）
          scaleX = dir === 'down_left' ? -1.0 : 1.0;
          if (anim.isWalking) {
            bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.5;
            rotation = Math.sin(anim.walkTime) * 0.07 * scaleX;
            const cycle = Math.sin(anim.walkTime);
            if (cycle > 0.2) spriteKey = 'player_diag_down_walk1';
            else if (cycle < -0.2) spriteKey = 'player_diag_down_walk2';
            else spriteKey = 'player_diag_down';
          } else {
            bobY = Math.sin(this.anim.globalTime * 3) * 1.5;
            spriteKey = 'player_diag_down';
          }
          break;
        }

        case 'down':
        default: {
          // 真下（南・正面）
          if (anim.isWalking) {
            bobY = -Math.abs(Math.sin(anim.walkTime)) * 3.5;
            rotation = Math.sin(anim.walkTime) * 0.08;
            const cycle = Math.sin(anim.walkTime);
            if (cycle > 0.2) spriteKey = 'player_down_walk1';
            else if (cycle < -0.2) spriteKey = 'player_down_walk2';
            else spriteKey = 'player_down';
          } else {
            bobY = Math.sin(this.anim.globalTime * 3) * 1.5;
            spriteKey = 'player_down';
          }
          break;
        }
      }

      // 氷上滑走中演出: ユーザー要望「左を向いて歩いていたら、左上方を向いて滑っていく」に基づき、
      // 表情（横顔）が見えるスプライトのまま、体全体を斜め上方に大きく傾けて（仰天スリップポーズ）滑走！
      const isSlidingOnIce = this.anim.isIceSliding() || anim.isSliding;
      if (isSlidingOnIce) {
        bobY = 0; // 滑走中は足踏み上下動なし

        const isLeft = dir.includes('left') || (dir !== 'right' && anim.facingDir === -1);
        if (isLeft) {
          // 左向きスプライト（横顔が見える状態）
          spriteKey = 'player_side';
          scaleX = -1.0;
          effectiveDir = 'left';
          // 正の回転角（+0.58 rad ≈ +33.2度）：
          // 体が右後ろにのけぞり、足が左前方へ放り出され、顔が「左斜め上方（空）」をしっかり仰ぎ見る！
          rotation = 0.58;
        } else {
          // 右向きスプライト（横顔が見える状態）
          spriteKey = 'player_side';
          scaleX = 1.0;
          effectiveDir = 'right';
          // 負の回転角（-0.58 rad ≈ -33.2度）：
          // 体が左後ろにのけぞり、足が右前方へ放り出され、顔が「右斜め上方（空）」をしっかり仰ぎ見る！
          rotation = -0.58;
        }
      }

      // 移動時の足元ステップダスト演出（※滑走中は土煙が出ないよう完全に抑制）
      if (anim.isWalking && !isSlidingOnIce) {
        const dustAlpha = Math.abs(Math.sin(anim.walkTime)) * 0.4;
        if (dustAlpha > 0.05) {
          ctx.fillStyle = `rgba(148, 163, 184, ${dustAlpha})`;
          ctx.beginPath();
          const dustOffsetX =
            (dir.includes('left') ? 1 : dir.includes('right') ? -1 : 0) *
            size *
            0.25;
          const dustOffsetY = dir.includes('up')
            ? size * 0.45
            : size * 0.35;
          ctx.ellipse(
            cx + dustOffsetX,
            cy + dustOffsetY,
            size * 0.16,
            size * 0.05,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // 氷上滑走時の風切りスピード線演出（※煙ではなく、ピューッと後方に吹き抜けるシャープな風線）
      if (isSlidingOnIce) {
        ctx.save();
        ctx.lineCap = 'round';

        // 進行方向の逆向きベクトル（風が後ろへ抜ける方向）
        let windDx = 0;
        let windDy = 0;
        if (dir.includes('left')) windDx = 1;
        else if (dir.includes('right')) windDx = -1;
        if (dir.includes('up')) windDy = 1;
        else if (dir.includes('down')) windDy = -1;
        if (windDx === 0 && windDy === 0) windDx = anim.facingDir === -1 ? 1 : -1;

        const windLen = Math.hypot(windDx, windDy) || 1;
        const normWindX = windDx / windLen;
        const normWindY = windDy / windLen;
        const perpX = -normWindY;
        const perpY = normWindX;

        // キャラクター後方に吹き抜ける風切りスピードライン（画像のようなシャープな白い風線）
        const time = this.anim.globalTime * 22;
        const windStreaks = [
          { lateral: -size * 0.28, length: size * 0.65, width: 2.2, offsetPhase: 0 },
          { lateral: size * 0.06, length: size * 0.85, width: 3.0, offsetPhase: 2.6 },
          { lateral: size * 0.34, length: size * 0.55, width: 1.8, offsetPhase: 5.2 },
        ];

        for (let i = 0; i < windStreaks.length; i++) {
          const streak = windStreaks[i];
          const phase = (time + streak.offsetPhase) % 8;
          const flowProgress = phase / 8; // 0.0 -> 1.0
          const currentAlpha = Math.sin(flowProgress * Math.PI) * 0.95;

          const baseDist = size * 0.15 + flowProgress * size * 0.45;
          const startX = cx + normWindX * baseDist + perpX * streak.lateral;
          const startY = cy + normWindY * baseDist + perpY * streak.lateral;
          const endX = startX + normWindX * streak.length;
          const endY = startY + normWindY * streak.length;

          // 緩やかな弧を描くシャープな風切り曲線
          const curveSide = streak.lateral > 0 ? 5 : -5;
          const ctrlX = (startX + endX) / 2 + perpX * curveSide;
          const ctrlY = (startY + endY) / 2 + perpY * curveSide;

          ctx.lineWidth = streak.width;
          ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.stroke();

          // 風線の中央コア（より明るい白い光条）
          ctx.lineWidth = streak.width * 0.5;
          ctx.strokeStyle = `rgba(224, 242, 254, ${currentAlpha * 0.85})`;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 3. プレイヤー本体の描画（進行方向に合わせた水平反転 scale(scaleX, 1.0) を適用）
      // 泥濘沈み込み(sinkOffsetY)・脱出跳躍(escapeJumpY)・氷上スリップ傾き(slipTilt)・ワタワタ揺れ(playerSlipWobbleY)・転倒スクワッシュ変形を合成
      const fallSquash = this.anim.getPlayerFallSquash();
      const totalYOffset =
        bobY +
        this.anim.playerSinkOffsetY +
        this.anim.playerEscapeJumpY +
        this.anim.playerSlipWobbleY +
        fallSquash.offsetY;
      const totalRotation =
        rotation +
        (isSlidingOnIce ? (scaleX < 0 ? 1 : -1) * this.anim.playerSlipTilt : 0);
      ctx.save();
      ctx.translate(cx, cy + totalYOffset);
      ctx.rotate(totalRotation);
      ctx.scale(scaleX * fallSquash.scaleX, 1.0 * fallSquash.scaleY);

      // 被弾赤フラッシュ演出
      if (anim.damageFlash > 0) {
        ctx.filter = `brightness(${1 + anim.damageFlash * 0.5}) sepia(${anim.damageFlash}) saturate(${1 + anim.damageFlash * 3}) hue-rotate(-50deg)`;
      }

      const playerSprite =
        SVGSprites.get(spriteKey) ??
        SVGSprites.get('player_down') ??
        SVGSprites.get('player');
      if (playerSprite) {
        ctx.drawImage(playerSprite, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }

      // 装備中の盾スプライト（装備している場合のみ手元/背中に動的合成）
      const playerState = this.engine.player;
      if (playerState.equippedShield) {
        const shieldImg = EquipmentSprites.getShieldSprite(
          playerState.equippedShield.name,
          effectiveDir
        );
        if (shieldImg) {
          ctx.drawImage(shieldImg, -size / 2, -size / 2, size, size);
        }
      }

      // 装備中の武器スプライト（装備している場合のみ手元/背中に動的合成）
      if (playerState.equippedWeapon) {
        const weaponImg = EquipmentSprites.getWeaponSprite(
          playerState.equippedWeapon.name,
          effectiveDir
        );
        if (weaponImg) {
          ctx.drawImage(weaponImg, -size / 2, -size / 2, size, size);
        }
      }

      // 4. 攻撃アクション中のエフェクト（武器装備時は剣撃斬撃、素手時は渾身のパンチ打撃）
      const isAttacking =
        Math.hypot(anim.attackOffsetX, anim.attackOffsetY) > 0.05;
      if (isAttacking) {
        if (playerState.equippedWeapon) {
          // --- 【武器装備時: 鋭い剣撃スラッシュ（斬撃の光条）】 ---
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          if (dir === 'up') {
            ctx.arc(
              0,
              -size * 0.25,
              size * 0.42,
              -Math.PI * 0.85,
              -Math.PI * 0.15
            );
          } else if (dir === 'down') {
            ctx.arc(0, size * 0.25, size * 0.42, Math.PI * 0.15, Math.PI * 0.85);
          } else if (dir === 'up_right' || dir === 'up_left') {
            ctx.arc(
              size * 0.18,
              -size * 0.18,
              size * 0.44,
              -Math.PI * 0.6,
              Math.PI * 0.1
            );
          } else if (dir === 'down_right' || dir === 'down_left') {
            ctx.arc(
              size * 0.18,
              size * 0.18,
              size * 0.44,
              -Math.PI * 0.1,
              Math.PI * 0.6
            );
          } else {
            ctx.arc(size * 0.25, 0, size * 0.45, -Math.PI * 0.35, Math.PI * 0.35);
          }
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (dir === 'up') {
            ctx.arc(
              0,
              -size * 0.25,
              size * 0.38,
              -Math.PI * 0.75,
              -Math.PI * 0.25
            );
          } else if (dir === 'down') {
            ctx.arc(0, size * 0.25, size * 0.38, Math.PI * 0.25, Math.PI * 0.75);
          } else if (dir === 'up_right' || dir === 'up_left') {
            ctx.arc(
              size * 0.18,
              -size * 0.18,
              size * 0.4,
              -Math.PI * 0.5,
              0
            );
          } else if (dir === 'down_right' || dir === 'down_left') {
            ctx.arc(
              size * 0.18,
              size * 0.18,
              size * 0.4,
              0,
              Math.PI * 0.5
            );
          } else {
            ctx.arc(size * 0.25, 0, size * 0.42, -Math.PI * 0.25, Math.PI * 0.25);
          }
          ctx.stroke();
        } else {
          // --- 【素手時: 渾身のパンチ・ナックル打撃インパクトエフェクト】 ---
          let punchX = 0;
          let punchY = 0;
          if (dir === 'up') {
            punchX = 0;
            punchY = -size * 0.38;
          } else if (dir === 'down') {
            punchX = 0;
            punchY = size * 0.38;
          } else if (dir === 'up_right' || dir === 'up_left') {
            punchX = size * 0.3;
            punchY = -size * 0.25;
          } else if (dir === 'down_right' || dir === 'down_left') {
            punchX = size * 0.3;
            punchY = size * 0.25;
          } else {
            punchX = size * 0.38;
            punchY = 0;
          }

          ctx.save();
          ctx.translate(punchX, punchY);

          // 1. 拳のインパクト衝撃波リング
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
          ctx.stroke();

          // 2. 放射状の打撃インパクト閃光（バシッ！というナックルヒット）
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const r1 = size * 0.1;
            const r2 = size * 0.26;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
            ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
            ctx.stroke();
          }

          // 3. 中心部の強打撃ナックルコア
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      ctx.restore();

      // プレイヤー頭上の棒グラフHPゲージ描画
      const player = this.engine.player;
      const barW = tileSize * 0.75;
      const barH = 4;
      const barX = cx - barW / 2;
      const barY = screenY - 2;

      // 下地背景枠
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const hpRatio = Math.max(0, Math.min(1, player.hp / player.maxHp));
      let barColor = '#10b981';
      if (hpRatio <= 0.25) {
        barColor = '#ef4444';
      } else if (hpRatio <= 0.5) {
        barColor = '#f59e0b';
      }
      ctx.fillStyle = barColor;
      ctx.fillRect(barX, barY, barW * hpRatio, barH);

      // 5. 氷上スリップ焦り（冷や汗漫符 💦）および転倒（ピヨピヨ星 💫）演出描画
      if (this.anim.isIceSliding()) {
        // --- 焦り冷や汗漫符 💦 ---
        // 頭上（仰け反った頭の側）にコミカルな冷や汗アイコン
        const sweatOffsetX = (scaleX < 0 ? 1 : -1) * size * 0.28;
        const sweatX = cx + sweatOffsetX;
        const sweatY = barY - 14 + Math.sin(this.anim.globalTime * 12) * 2;
        ctx.save();
        ctx.translate(sweatX, sweatY);
        ctx.fillStyle = '#38bdf8';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        // 汗しずく描画
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.quadraticCurveTo(5, -1, 4, 3);
        ctx.arc(0, 3, 4, 0, Math.PI);
        ctx.quadraticCurveTo(-5, -1, 0, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // 汗のハイライト光沢
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(1.5, 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (this.anim.isPlayerSlipFallen()) {
        // --- 転倒ピヨピヨ星 💫 ---
        // 頭上をくるくる旋回する黄色い星
        const starCenterY = barY - 12;
        ctx.save();
        for (let s = 0; s < 3; s++) {
          const angle = this.anim.globalTime * 7 + (s * Math.PI * 2) / 3;
          const starRadiusX = size * 0.32;
          const starRadiusY = 6;
          const starX = cx + Math.cos(angle) * starRadiusX;
          const starY = starCenterY + Math.sin(angle) * starRadiusY;

          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1;
          // 小さな四角星/ひし形
          ctx.beginPath();
          ctx.moveTo(starX, starY - 4);
          ctx.lineTo(starX + 3, starY);
          ctx.lineTo(starX, starY + 4);
          ctx.lineTo(starX - 3, starY);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      // 死亡時: ドラマチックな倒れ込みダウンモーション & 倒れ伏しスプライト描画
      this.anim.triggerPlayerDeath();
      const deathTime = this.anim.getPlayerDeathTime();
      const deadSprite = SVGSprites.get('player_dead');

      // 倒れ込み進行度 (0.0: 立っている状態 〜 1.0: 床に完全に倒れ伏した状態, 0.75秒で完了)
      const fallDuration = 0.75;
      const progress = Math.min(1.0, Math.max(0, deathTime / fallDuration));
      // ガクッと膝をついて崩れ落ちるイージング (Cubic Ease In)
      const easeProgress = progress * progress * (3 - 2 * progress);

      // 倒れる方向（プレイヤーの向きに応じた自然な倒れ込み）
      const fallDir = anim.facingDir === -1 ? -1 : 1;

      ctx.save();

      // 被弾赤フラッシュ演出
      if (anim.damageFlash > 0) {
        ctx.filter = `brightness(${1 + anim.damageFlash * 0.5}) sepia(${anim.damageFlash}) saturate(${1 + anim.damageFlash * 3}) hue-rotate(-50deg)`;
      }

      if (progress < 0.55) {
        // 【フェーズ1: よろめき・崩れ落ち中】
        // 立っているスプライトが徐々に床へ傾き沈み込む
        const tiltAngle = Math.PI * 0.42 * easeProgress * fallDir;
        const sinkY = size * 0.22 * easeProgress;
        ctx.translate(cx + size * 0.15 * easeProgress * fallDir, cy + sinkY);
        ctx.rotate(tiltAngle);
        ctx.scale(fallDir, 1.0);

        const currentStandSprite =
          SVGSprites.get('player_down') ?? SVGSprites.get('player');
        if (currentStandSprite) {
          ctx.drawImage(currentStandSprite, -size / 2, -size / 2, size, size);
        }
      } else {
        // 【フェーズ2: 床への激突・倒れ伏し完了】
        // 倒れ伏しスプライト（player_dead）を描画
        ctx.translate(cx, cy + size * 0.1);
        ctx.scale(fallDir, 1.0);

        // 床着地の瞬間（progress 0.55〜0.85）に広がる衝撃ダスト
        if (progress < 0.85) {
          const dustT = (progress - 0.55) / 0.3;
          const dustRadius = size * 0.45 * dustT;
          const dustAlpha = (1 - dustT) * 0.5;
          ctx.save();
          ctx.fillStyle = `rgba(148, 163, 184, ${dustAlpha})`;
          ctx.beginPath();
          ctx.ellipse(0, size * 0.2, dustRadius, dustRadius * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (deadSprite) {
          ctx.drawImage(deadSprite, -size / 2, -size / 2, size, size);
        } else {
          // フォールバック
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 0.4, size * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  /**
   * 探索済みフロア全体を俯瞰できるミニマップをCanvas上にオーバーレイ描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param screenWidth - 描画領域の横幅（ピクセル）
   * @param screenHeight - 描画領域の縦幅（ピクセル）
   */
  private drawMinimap(
    ctx: CanvasRenderingContext2D,
    screenWidth: number,
    screenHeight: number
  ): void {
    const map = this.engine.map;
    const player = this.engine.player;

    const isSmall = screenWidth < 600 || screenHeight < 500;
    const padding = 6;
    const cellW = isSmall ? 2.2 : 2.8;
    const cellH = isSmall ? 2.2 : 2.8;

    const mapPixelW = map.width * cellW;
    const mapPixelH = map.height * cellH;

    const boxW = mapPixelW + padding * 2;
    const boxH = mapPixelH + padding * 2 + 14;
    const boxX = screenWidth - boxW - 10;
    const boxY = 10;

    // 半透明背景ボックス
    ctx.fillStyle = 'rgba(3, 7, 18, 0.85)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // ヘッダーテキスト (MAP)
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`MAP (B${player.floor}F)`, boxX + padding, boxY + 3);

    const startX = boxX + padding;
    const startY = boxY + padding + 12;

    // バイオーム別のミニマップカラー
    const biome = map.biome || 'STONE';
    const minimapPalettes: Record<
      BiomeType,
      { wall: string; floorVis: string; floorDim: string; waterVis: string; waterDim: string }
    > = {
      STONE: { wall: '#475569', floorVis: '#334155', floorDim: '#1e293b', waterVis: '#38bdf8', waterDim: '#0369a1' },
      EARTH: { wall: '#78350f', floorVis: '#4e342e', floorDim: '#2e1c18', waterVis: '#5eead4', waterDim: '#0f766e' },
      FOREST: { wall: '#166534', floorVis: '#064e3b', floorDim: '#022c22', waterVis: '#34d399', waterDim: '#047857' },
      RIVER: { wall: '#334155', floorVis: '#1e3a8a', floorDim: '#0f172a', waterVis: '#38bdf8', waterDim: '#1d4ed8' },
      LAKE: { wall: '#0e7490', floorVis: '#083344', floorDim: '#041c26', waterVis: '#67e8f9', waterDim: '#0e7490' },
      SNOW: { wall: '#334155', floorVis: '#cbd5e1', floorDim: '#64748b', waterVis: '#93c5fd', waterDim: '#1e3a8a' },
      ICE: { wall: '#0369a1', floorVis: '#0284c7', floorDim: '#082f49', waterVis: '#38bdf8', waterDim: '#0369a1' },
      SWAMP: { wall: '#14532d', floorVis: '#166534', floorDim: '#052e16', waterVis: '#86efac', waterDim: '#15803d' },
      TOXIC: { wall: '#581c87', floorVis: '#3b0764', floorDim: '#1e0538', waterVis: '#d8b4fe', waterDim: '#7e22ce' },
      MECHA: { wall: '#78350f', floorVis: '#451a03', floorDim: '#270e02', waterVis: '#fde68a', waterDim: '#b45309' },
      ISLAND: { wall: '#1e293b', floorVis: '#64748b', floorDim: '#334155', waterVis: '#67e8f9', waterDim: '#0891b2' },
      MAGMA: { wall: '#7f1d1d', floorVis: '#450a0a', floorDim: '#200505', waterVis: '#f87171', waterDim: '#b91c1c' },
      TEMPLE: { wall: '#3730a3', floorVis: '#1e1b4b', floorDim: '#0f0e26', waterVis: '#818cf8', waterDim: '#4338ca' },
      ALTAR: { wall: '#4c0519', floorVis: '#2e0210', floorDim: '#150107', waterVis: '#c084fc', waterDim: '#581c87' },
    };
    const mp = minimapPalettes[biome] || minimapPalettes.STONE;

    // 各セルの描画
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        if (!map.explored[y][x]) continue;

        const tile = map.tiles[y][x];
        const cx = startX + x * cellW;
        const cy = startY + y * cellH;

        if (tile === TileType.Wall) {
          ctx.fillStyle = mp.wall;
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Floor) {
          ctx.fillStyle = map.visible[y][x] ? mp.floorVis : mp.floorDim;
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Water) {
          ctx.fillStyle = map.visible[y][x] ? mp.waterVis : mp.waterDim;
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Bridge) {
          ctx.fillStyle = map.visible[y][x] ? '#d97706' : '#78350f';
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Ice) {
          ctx.fillStyle = map.visible[y][x] ? '#38bdf8' : '#0284c7';
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Mud) {
          ctx.fillStyle = map.visible[y][x] ? '#92400e' : '#451a03';
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.Poison) {
          ctx.fillStyle = map.visible[y][x] ? '#a855f7' : '#581c87';
          ctx.fillRect(cx, cy, cellW, cellH);
        } else if (tile === TileType.StairsDown) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx, cy, cellW, cellH);
        }
      }
    }

    // 障害物のミニマップ表示（探索済みマスの障害物はオレンジ褐色のドット）
    for (const ob of (map.obstacles || [])) {
      if (map.explored[ob.y][ob.x]) {
        const ox = startX + ob.x * cellW;
        const oy = startY + ob.y * cellH;
        ctx.fillStyle = map.visible[ob.y][ob.x] ? '#f59e0b' : '#92400e';
        ctx.fillRect(ox, oy, cellW, cellH);
      }
    }

    // 視界内の敵モンスター（赤の点）
    for (const monster of map.monsters) {
      if (map.visible[monster.y][monster.x]) {
        const mx = startX + monster.x * cellW;
        const my = startY + monster.y * cellH;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(mx - 0.5, my - 0.5, cellW + 1, cellH + 1);
      }
    }

    // プレイヤー現在地（緑の点滅）
    const px = startX + player.x * cellW;
    const py = startY + player.y * cellH;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(px - 1, py - 1, cellW + 2, cellH + 2);
    ctx.strokeStyle = '#ecfdf5';
    ctx.strokeRect(px - 1, py - 1, cellW + 2, cellH + 2);
  }

  /**
   * スクリーン上のマウス/タップピクセル座標をダンジョンマップのグリッドセル座標に変換します。
   *
   * @param screenX - Canvasコンテナ内のX座標（ピクセル）
   * @param screenY - Canvasコンテナ内のY座標（ピクセル）
   * @returns 変換されたグリッド座標 { x, y }
   */
  public screenToGrid(
    screenX: number,
    screenY: number
  ): { x: number; y: number } {
    const { width, height } = this.container.getBoundingClientRect();
    const effectiveTileSize = this.tileSize * this.zoom;
    const player = this.engine.player;

    const cameraX = width / 2 - (player.x + 0.5) * effectiveTileSize;
    const cameraY = height / 2 - (player.y + 0.5) * effectiveTileSize;

    const gridX = Math.floor((screenX - cameraX) / effectiveTileSize);
    const gridY = Math.floor((screenY - cameraY) / effectiveTileSize);

    return { x: gridX, y: gridY };
  }

  /**
   * 特定のバイオーム（SNOWの粉雪、ICEの氷晶）に応じた環境大気パーティクルを描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param width - 描画領域幅
   * @param height - 描画領域高さ
   * @param biome - 現在のバイオーム
   */
  private drawBiomeAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    biome: BiomeType
  ): void {
    if (biome !== 'SNOW' && biome !== 'ICE') return;

    const t = this.anim.globalTime;
    ctx.save();
    if (biome === 'SNOW') {
      // 舞い落ちる白銀の粉雪パーティクル
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      const flakeCount = 35;
      for (let i = 0; i < flakeCount; i++) {
        const speed = 40 + (i % 5) * 15;
        const drift = Math.sin(t * 1.5 + i) * 20;
        const x = ((i * 73 + t * 25 + drift) % width + width) % width;
        const y = ((i * 127 + t * speed) % height + height) % height;
        const r = 1.2 + (i % 3) * 0.8;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (biome === 'ICE') {
      // 煌めく氷晶・ダイヤモンドダストのきらめき
      const sparkCount = 25;
      for (let i = 0; i < sparkCount; i++) {
        const x = ((i * 97 + Math.sin(i * 3) * 50) % width + width) % width;
        const y = ((i * 149 + Math.cos(i * 5) * 50) % height + height) % height;
        const phase = Math.sin(t * 3.5 + i * 2.1);
        if (phase > 0.3) {
          const alpha = ((phase - 0.3) / 0.7) * 0.8;
          ctx.fillStyle = `rgba(186, 230, 253, ${alpha})`;
          const r = 1.5 + (i % 2) * 1.0;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}
