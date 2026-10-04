/**
 * @file CanvasRenderer.ts
 * @description HTML5 Canvas 2D を用いたゲーム画面のレンダリングエンジン。
 * HiDPI対応、SVGスプライト描画、移動イージング補間、攻撃・被弾・待機アニメーション、
 * およびミニマップのリアルタイム描画を担当します。
 */

import { GameEngine } from '../core/GameEngine';
import { BiomeType, Item, Monster, Obstacle, TileType } from '../core/types';
import { AnimationEngine } from './AnimationEngine';
import { SVGSprites, SpriteId } from './sprites/SVGSprites';
import { TileSprites } from './sprites/TileSprites';
import { EquipmentSprites } from './sprites/EquipmentSprites';

/**
 * 2D Canvas描画管理クラス。
 */
export class CanvasRenderer {
  /** 描画先の HTMLCanvasElement */
  private canvas: HTMLCanvasElement;

  /** Canvasの2D描画コンテキスト */
  private ctx: CanvasRenderingContext2D;

  /** 描画データを参照するゲームエンジンインスタンス */
  private engine: GameEngine;

  /** Canvasを内包する親コンテナ要素 */
  private container: HTMLElement;

  /** アニメーション状態を管理するエンジン */
  public anim: AnimationEngine;

  /** 基準となる1タイルのピクセルサイズ（デバイス幅に応じて動的に変動） */
  public tileSize = 32;

  /** 現在のカメラズーム倍率 */
  public zoom = 1.0;

  /** ミニマップを表示するかどうかのフラグ */
  public showMinimap = true;

  /** requestAnimationFrame のループ管理用ID */
  private rafId: number | null = null;

  /** 前フレームのタイムスタンプ（デルタタイム計算用） */
  private lastTime = 0;

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
      this.anim.triggerDustParticles(obstacle.x, obstacle.y);
    };

    this.engine.onObstacleBreak = (obstacle) => {
      const color =
        obstacle.type === 'ICE_BLOCK'
          ? '#7dd3fc'
          : obstacle.type === 'SNOW_MOUND'
          ? '#f0f9ff'
          : obstacle.type === 'TREE_STUMP'
          ? '#78350f'
          : '#b45309';
      this.anim.triggerBreakParticles(obstacle.x, obstacle.y, color, 16);
    };

    this.engine.onSwampStuck = (x, y) => {
      this.anim.triggerMudParticles(x, y);
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
    const curTile = this.engine.map.tiles[player.y]?.[player.x];
    const isSwamp = curTile === TileType.Mud || curTile === TileType.Poison;
    const playerSpeedMult = isSwamp ? 0.35 : 1.0;

    this.anim.syncPosition('player', player.x, player.y, false, playerSpeedMult);
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
        const speedMult = obstacle.isSliding ? 2.5 : obstacle.isPushable ? 0.2 : 1.0;
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

    // カメラオフセット（プレイヤーの滑らかなアニメーション座標を中心に配置）
    const cameraX =
      width / 2 -
      (animPlayer.renderX + animPlayer.attackOffsetX + 0.5) * effectiveTileSize;
    const cameraY =
      height / 2 -
      (animPlayer.renderY + animPlayer.attackOffsetY + 0.5) * effectiveTileSize;

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
      this.drawGimmickTile(ctx, x, y, s, isVisible, tile, gridX, gridY);
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
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    } else {
      ctx.fillStyle = '#253346';
      ctx.fillRect(x, y, s, s);
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
    // 水面ベース（床スプライトをうっすら下敷きにして水深感を演出）
    const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
    if (floorSprite) {
      ctx.drawImage(floorSprite, x, y, s, s);
    }

    // バイオーム別の水面トーン
    const waterColors: Record<
      BiomeType,
      { base: string; wave: string; bank: string; deep: string }
    > = {
      STONE: { base: 'rgba(2, 132, 199, 0.72)', wave: '#7dd3fc', bank: '#1e293b', deep: '#0369a1' },
      EARTH: { base: 'rgba(13, 148, 136, 0.75)', wave: '#5eead4', bank: '#2e1002', deep: '#0f766e' },
      FOREST: { base: 'rgba(5, 150, 105, 0.75)', wave: '#6ee7b7', bank: '#052e16', deep: '#047857' },
      RIVER: { base: 'rgba(37, 99, 235, 0.72)', wave: '#93c5fd', bank: '#0f172a', deep: '#1d4ed8' },
      LAKE: { base: 'rgba(8, 145, 178, 0.78)', wave: '#67e8f9', bank: '#0f172a', deep: '#0e7490' },
      SNOW: { base: 'rgba(56, 189, 248, 0.65)', wave: '#e0f2fe', bank: '#334155', deep: '#0284c7' },
      ICE: { base: 'rgba(14, 165, 233, 0.75)', wave: '#bae6fd', bank: '#021324', deep: '#0369a1' },
      SWAMP: { base: 'rgba(21, 128, 61, 0.78)', wave: '#86efac', bank: '#142316', deep: '#14532d' },
      TOXIC: { base: 'rgba(126, 34, 206, 0.82)', wave: '#d8b4fe', bank: '#24043d', deep: '#581c87' },
      MECHA: { base: 'rgba(180, 83, 9, 0.75)', wave: '#fde68a', bank: '#1a1109', deep: '#78350f' },
      ISLAND: { base: 'rgba(14, 116, 144, 0.85)', wave: '#67e8f9', bank: '#0f172a', deep: '#164e63' },
    };
    const wc = waterColors[biome] || waterColors.STONE;

    ctx.fillStyle = wc.base;
    ctx.fillRect(x, y, s, s);

    const isWater = (gx: number, gy: number): boolean => {
      if (gx < 0 || gx >= map.width || gy < 0 || gy >= map.height) return false;
      return map.tiles[gy][gx] === TileType.Water;
    };

    const upWater = isWater(gridX, gridY - 1);
    const downWater = isWater(gridX, gridY + 1);
    const leftWater = isWater(gridX - 1, gridY);
    const rightWater = isWater(gridX + 1, gridY);

    // 岸辺（バンクエッジ）のオートタイリング
    // 1. 上が陸地なら：上端に岸壁段差と深層シャドウ
    if (!upWater) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x, y, s, Math.max(2, s * 0.08));
      const bankGrad = ctx.createLinearGradient(x, y, x, y + s * 0.35);
      bankGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      bankGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bankGrad;
      ctx.fillRect(x, y, s, s * 0.35);
    }

    // 2. 下が陸地なら：下端に波打ち際リップルライン
    if (!downWater) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fillRect(x, y + s - Math.max(1.5, s * 0.05), s, Math.max(1.5, s * 0.05));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(x, y + s - Math.max(3, s * 0.09), s, Math.max(1.5, s * 0.04));
    }

    // 3. 左が陸地なら：左端に岸壁ライン
    if (!leftWater) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x, y, Math.max(2, s * 0.06), s);
    }

    // 4. 右が陸地なら：右端に岸壁ライン
    if (!rightWater) {
      ctx.fillStyle = wc.bank;
      ctx.fillRect(x + s - Math.max(2, s * 0.06), y, Math.max(2, s * 0.06), s);
    }

    // 水面アニメーション波紋（視界内のみ）
    if (isVisible) {
      const time = this.anim.globalTime;
      const waveOffset1 =
        Math.sin(time * 2.6 + gridX * 0.8 + gridY * 0.5) * (s * 0.12);
      const waveOffset2 =
        Math.cos(time * 2.2 + gridX * 0.5 + gridY * 0.9) * (s * 0.1);

      ctx.strokeStyle = wc.wave;
      ctx.lineWidth = Math.max(1, s * 0.04);
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x + s * 0.18, y + s * 0.45 + waveOffset1);
      ctx.quadraticCurveTo(
        x + s * 0.5,
        y + s * 0.45 + waveOffset1 - 2,
        x + s * 0.82,
        y + s * 0.45 + waveOffset1
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + s * 0.28, y + s * 0.72 + waveOffset2);
      ctx.quadraticCurveTo(
        x + s * 0.55,
        y + s * 0.72 + waveOffset2 + 2,
        x + s * 0.72,
        y + s * 0.72 + waveOffset2
      );
      ctx.stroke();

      // きらめきハイライト
      const sparkle = Math.sin(time * 4.0 + gridX * 1.7 + gridY * 2.3);
      if (sparkle > 0.6) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + s * 0.6, y + s * 0.3, Math.max(1, s * 0.03), 0, Math.PI * 2);
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
    gridY: number
  ): void {
    const map = this.engine.map;
    const gimmickSprite = TileSprites.getGimmickSprite(tile);
    if (gimmickSprite) {
      ctx.drawImage(gimmickSprite, x, y, s, s);
    } else {
      ctx.fillStyle =
        tile === TileType.Ice
          ? '#38bdf8'
          : tile === TileType.Mud
          ? '#78350f'
          : '#7e22ce';
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
    const size = tileSize * 0.95;

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
    const monsterBase = monster.type.toLowerCase();
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

    // HPバーの描画（ダメージを受けている場合のみ）
    if (monster.hp < monster.maxHp) {
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
    const size = tileSize * 0.95;

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

      // 移動時の足元ステップダスト演出
      if (anim.isWalking) {
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

      // 3. プレイヤー本体の描画（進行方向に合わせた水平反転 scale(scaleX, 1.0) を適用）
      ctx.save();
      ctx.translate(cx, cy + bobY);
      ctx.rotate(rotation);
      ctx.scale(scaleX, 1.0);

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
          dir
        );
        if (shieldImg) {
          ctx.drawImage(shieldImg, -size / 2, -size / 2, size, size);
        }
      }

      // 装備中の武器スプライト（装備している場合のみ手元/背中に動的合成）
      if (playerState.equippedWeapon) {
        const weaponImg = EquipmentSprites.getWeaponSprite(
          playerState.equippedWeapon.name,
          dir
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
