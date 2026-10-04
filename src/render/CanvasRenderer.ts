/**
 * @file CanvasRenderer.ts
 * @description HTML5 Canvas 2D を用いたゲーム画面のレンダリングエンジン。
 * HiDPI対応、SVGスプライト描画、移動イージング補間、攻撃・被弾・待機アニメーション、
 * およびミニマップのリアルタイム描画を担当します。
 */

import { GameEngine } from '../core/GameEngine';
import { BiomeType, Item, Monster, TileType } from '../core/types';
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
    this.anim.syncPosition('player', player.x, player.y);
    this.anim.setDirection('player', player.direction || 'down');

    const validIds = new Set<string>(['player']);
    for (const monster of this.engine.map.monsters) {
      validIds.add(monster.id);
      this.anim.syncPosition(monster.id, monster.x, monster.y);
      if (monster.direction) {
        this.anim.setDirection(monster.id, monster.direction);
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

    // 7. ミニマップオーバーレイ描画
    if (this.showMinimap) {
      this.drawMinimap(ctx, width, height);
    }
  }

  /**
   * 1つのタイルをバイオームに応じた高品質ベクターSVGスプライト、
   * アニメーション波紋、および記憶表現付きで描画します。
   *
   * @param ctx - Canvas描画コンテキスト
   * @param tile - タイル種別
   * @param x - スクリーン上X座標
   * @param y - スクリーン上Y座標
   * @param size - 描画サイズ（ピクセル）
   * @param isVisible - 現在視界内に入っているかどうか
   * @param biome - 現在フロアのバイオーム種別
   * @param gridX - マップ上のグリッドX座標
   * @param gridY - マップ上のグリッドY座標
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
    const map = this.engine.map;

    // 1. 壁タイルの描画
    if (tile === TileType.Wall) {
      const wallSprite = TileSprites.getWallSprite(biome, gridX, gridY);
      if (wallSprite) {
        ctx.drawImage(wallSprite, x, y, s, s);
      } else {
        // ロード前のフォールバック
        ctx.fillStyle = '#090d16';
        ctx.fillRect(x, y, s, s);
      }

      // 壁の立体天板ハイライト（上端に微細な明るいライン）
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x, y, s, Math.max(1, s * 0.04));

      // 壁の接地面ベースライン（下端に漆黒の境界線を引き、床との境界をクッキリ分離）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(x, y + s - Math.max(2, s * 0.06), s, Math.max(2, s * 0.06));

      // 未視界（探索済みの記憶）の場合は暗色半透明マスクを被せる
      if (!isVisible) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.65)';
        ctx.fillRect(x, y, s, s);
      }
      return;
    }

    // 2. 床タイルの描画
    if (tile === TileType.Floor) {
      const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
      if (floorSprite) {
        ctx.drawImage(floorSprite, x, y, s, s);
      } else {
        ctx.fillStyle = '#253346';
        ctx.fillRect(x, y, s, s);
      }

      // 壁の下のマスに対する立体ドロップシャドウ（上が壁タイルなら上端に影を落とす）
      if (gridY > 0 && map.tiles[gridY - 1]?.[gridX] === TileType.Wall) {
        const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.45);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(x, y, s, s * 0.45);
      }

      // 未視界の暗がりマスク
      if (!isVisible) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.65)';
        ctx.fillRect(x, y, s, s);
      }
      return;
    }

    // 3. 水路・湖タイルの描画
    if (tile === TileType.Water) {
      // 水面ベース（床スプライトをうっすら下敷きにして水深感を演出）
      const floorSprite = TileSprites.getFloorSprite(biome, gridX, gridY);
      if (floorSprite) {
        ctx.drawImage(floorSprite, x, y, s, s);
      }

      // バイオーム別の水面トーン
      const waterColors: Record<
        BiomeType,
        { base: string; wave: string; deep: string }
      > = {
        STONE: { base: 'rgba(2, 132, 199, 0.72)', wave: '#7dd3fc', deep: '#0369a1' },
        EARTH: { base: 'rgba(13, 148, 136, 0.75)', wave: '#5eead4', deep: '#0f766e' },
        FOREST: { base: 'rgba(5, 150, 105, 0.75)', wave: '#6ee7b7', deep: '#047857' },
        RIVER: { base: 'rgba(37, 99, 235, 0.72)', wave: '#93c5fd', deep: '#1d4ed8' },
        LAKE: { base: 'rgba(8, 145, 178, 0.78)', wave: '#67e8f9', deep: '#0e7490' },
      };
      const wc = waterColors[biome] || waterColors.STONE;

      // 水面カラー塗り
      ctx.fillStyle = wc.base;
      ctx.fillRect(x, y, s, s);

      // 上が壁なら水面にも影
      if (gridY > 0 && map.tiles[gridY - 1]?.[gridX] === TileType.Wall) {
        const shadowGrad = ctx.createLinearGradient(x, y, x, y + s * 0.4);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(x, y, s, s * 0.4);
      }

      if (isVisible) {
        // 水面の緩やかなアニメーション波紋（時間経過で揺らぐ二重波線）
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
        // 視界外マスク
        ctx.fillStyle = 'rgba(3, 7, 18, 0.62)';
        ctx.fillRect(x, y, s, s);
      }
      return;
    }

    // 4. 階段タイル (TileType.StairsDown)
    if (tile === TileType.StairsDown) {
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
  }

  /**
   * 床落ちアイテムを描画します。
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

    // 床落ちアイテムの浮遊ボビングアニメーション（わずかに上下にゆらゆら浮く）
    const floatBobY =
      Math.sin(this.anim.globalTime * 3.5 + (item.x * 3 + item.y * 7)) * 2.5;

    // 個別アイテム名に対応したスプライトIDの取得
    const spriteId = SVGSprites.getItemSpriteId(item.category, item.name);
    const spriteImg = SVGSprites.get(spriteId);

    if (isVisible) {
      // アイテム落下の影（浮遊の高さに合わせて伸縮）
      const shadowScale = Math.max(0.6, 1.0 - floatBobY / 8.0);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + s * 0.28,
        s * 0.28 * shadowScale,
        s * 0.12 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // アイテムSVGスプライトの描画
      const itemSize = s * 0.85;

      if (spriteImg) {
        ctx.drawImage(
          spriteImg,
          cx - itemSize / 2,
          cy - itemSize / 2 + floatBobY,
          itemSize,
          itemSize
        );
      } else {
        // スプライト未取得時のフォールバック
        ctx.fillStyle = item.color;
        ctx.font = `bold ${Math.floor(s * 0.65)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.symbol, cx, cy + floatBobY);
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

      // 4. 攻撃アクション中の剣撃スラッシュ（斬撃の光条）エフェクト
      const isAttacking =
        Math.hypot(anim.attackOffsetX, anim.attackOffsetY) > 0.05;
      if (isAttacking) {
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
        } else if (tile === TileType.StairsDown) {
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(cx, cy, cellW, cellH);
        }
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
}
