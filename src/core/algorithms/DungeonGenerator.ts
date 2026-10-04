/**
 * @file DungeonGenerator.ts
 * @description ダンジョンフロアの自動生成を担当するアルゴリズムクラス。
 * 部屋の配置と重なり判定、部屋間を結ぶ通路の掘削、および敵モンスターやアイテムの初期配置を行います。
 */

import { EntityFactory } from '../entities/EntityFactory';
import {
  BiomeType,
  DungeonMap,
  Item,
  Monster,
  Point,
  Room,
  TileType,
} from '../types';

/**
 * プロシージャル（手続き型）ダンジョン生成クラス。
 */
export class DungeonGenerator {
  /** 生成する部屋の最大目標数 */
  private static readonly MAX_ROOMS = 8;

  /** 部屋の最小横・縦サイズ（セル数） */
  private static readonly MIN_ROOM_SIZE = 5;

  /** 部屋の最大横・縦サイズ（セル数） */
  private static readonly MAX_ROOM_SIZE = 10;

  /** 部屋配置の試行回数上限 */
  private static readonly MAX_PLACEMENT_ATTEMPTS = 40;

  /**
   * 指定された階層、幅、高さを持つランダムダンジョンフロアを生成します。
   * 全体が壁で埋め尽くされたマップ上に複数の部屋を配置し、通路で連結した上で、
   * スタート位置、階段位置、敵モンスター、アイテムを配置します。
   *
   * @param floor - 現在の階層番号（敵のスケーリングに使用）
   * @param width - マップ全体の横幅（セル数、デフォルト: 50）
   * @param height - マップ全体の縦幅（セル数、デフォルト: 36）
   * @returns 生成された完全なダンジョンマップデータ
   */
  public static generate(floor = 1, width = 50, height = 36): DungeonMap {
    // 1. すべて壁で初期化
    const tiles: TileType[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => TileType.Wall)
    );
    const explored: boolean[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => false)
    );
    const visible: boolean[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => false)
    );

    const rooms: Room[] = [];

    // 2. 部屋のランダム配置（重なり判定付き）
    for (
      let i = 0;
      i < this.MAX_PLACEMENT_ATTEMPTS && rooms.length < this.MAX_ROOMS;
      i++
    ) {
      const w =
        Math.floor(
          Math.random() * (this.MAX_ROOM_SIZE - this.MIN_ROOM_SIZE + 1)
        ) + this.MIN_ROOM_SIZE;
      const h =
        Math.floor(
          Math.random() * (this.MAX_ROOM_SIZE - this.MIN_ROOM_SIZE + 1)
        ) + this.MIN_ROOM_SIZE;
      const x = Math.floor(Math.random() * (width - w - 4)) + 2;
      const y = Math.floor(Math.random() * (height - h - 4)) + 2;

      const newRoom: Room = { x, y, w, h };
      let intersects = false;

      // 既存の部屋との境界間隔（最低1マスの壁）を保つ衝突判定
      for (const room of rooms) {
        if (
          newRoom.x <= room.x + room.w + 1 &&
          newRoom.x + newRoom.w + 1 >= room.x &&
          newRoom.y <= room.y + room.h + 1 &&
          newRoom.y + newRoom.h + 1 >= room.y
        ) {
          intersects = true;
          break;
        }
      }

      if (!intersects) {
        // 部屋の床を掘削
        for (let ry = newRoom.y; ry < newRoom.y + newRoom.h; ry++) {
          for (let rx = newRoom.x; rx < newRoom.x + newRoom.w; rx++) {
            tiles[ry][rx] = TileType.Floor;
          }
        }
        rooms.push(newRoom);
      }
    }

    // 生成された部屋が2部屋未満の場合は連結が成立しないため再試行
    if (rooms.length < 2) {
      return this.generate(floor, width, height);
    }

    // 3. 通路で各部屋を接続（直前の部屋の中心とL字型に接続）
    for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i - 1];
      const curr = rooms[i];

      const prevCenter: Point = {
        x: Math.floor(prev.x + prev.w / 2),
        y: Math.floor(prev.y + prev.h / 2),
      };
      const currCenter: Point = {
        x: Math.floor(curr.x + curr.w / 2),
        y: Math.floor(curr.y + curr.h / 2),
      };

      if (Math.random() < 0.5) {
        this.digHorizontal(tiles, prevCenter.x, currCenter.x, prevCenter.y);
        this.digVertical(tiles, prevCenter.y, currCenter.y, currCenter.x);
      } else {
        this.digVertical(tiles, prevCenter.y, currCenter.y, prevCenter.x);
        this.digHorizontal(tiles, prevCenter.x, currCenter.x, currCenter.y);
      }
    }

    // 4. スタート地点（最初の部屋の中心）の決定
    const startRoom = rooms[0];
    const startPos: Point = {
      x: Math.floor(startRoom.x + startRoom.w / 2),
      y: Math.floor(startRoom.y + startRoom.h / 2),
    };

    // 5. 階段位置の決定（スタート地点から最も離れた部屋の中心）
    let maxDist = -1;
    let stairRoomIndex = 1;
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      const cx = Math.floor(room.x + room.w / 2);
      const cy = Math.floor(room.y + room.h / 2);
      const dist = Math.hypot(cx - startPos.x, cy - startPos.y);
      if (dist > maxDist) {
        maxDist = dist;
        stairRoomIndex = i;
      }
    }

    const stairRoom = rooms[stairRoomIndex];
    const stairsDown: Point = {
      x: Math.floor(stairRoom.x + stairRoom.w / 2),
      y: Math.floor(stairRoom.y + stairRoom.h / 2),
    };

    tiles[stairsDown.y][stairsDown.x] = TileType.StairsDown;

    // 6. バイオーム情報の決定と水路・湖タイルの適用
    const biomeInfo = this.getBiomeForFloor(floor);
    this.applyBiomeWater(tiles, biomeInfo.biome, rooms, startPos, stairsDown);

    // 7. モンスターとアイテムの配置
    const monsters: Monster[] = [];
    const items: Item[] = [];

    // 部屋1以降（スタート部屋以外）に敵モンスターを配置
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      // 部屋ごとに1〜2体のモンスターを配置
      const monsterCount = Math.floor(Math.random() * 2) + 1;
      for (let m = 0; m < monsterCount; m++) {
        const mx = room.x + Math.floor(Math.random() * room.w);
        const my = room.y + Math.floor(Math.random() * room.h);

        // 階段マスや既にモンスターがいるマス、水路マスは避ける
        const isStairs = mx === stairsDown.x && my === stairsDown.y;
        const isOccupied = monsters.some((mon) => mon.x === mx && mon.y === my);

        if (!isStairs && !isOccupied && tiles[my][mx] === TileType.Floor) {
          monsters.push(
            EntityFactory.createMonster(floor, mx, my, biomeInfo.biome)
          );
        }
      }

      // 各部屋に約60%の確率でアイテムを1個配置
      if (Math.random() < 0.6) {
        const ix = room.x + Math.floor(Math.random() * room.w);
        const iy = room.y + Math.floor(Math.random() * room.h);
        const isStairs = ix === stairsDown.x && iy === stairsDown.y;
        const isItemOccupied = items.some((it) => it.x === ix && it.y === iy);

        if (!isStairs && !isItemOccupied && tiles[iy][ix] === TileType.Floor) {
          items.push(EntityFactory.createRandomItem(ix, iy));
        }
      }
    }

    return {
      width,
      height,
      tiles,
      explored,
      visible,
      stairsDown,
      startPos,
      rooms,
      monsters,
      items,
      biome: biomeInfo.biome,
      biomeName: biomeInfo.name,
    };
  }

  /**
   * 指定したY座標において、2つのX座標間の床を通路として掘削します。
   *
   * @param tiles - タイル配列 [y][x]
   * @param x1 - 開始X座標
   * @param x2 - 終了X座標
   * @param y - 通路を掘るY座標
   */
  private static digHorizontal(
    tiles: TileType[][],
    x1: number,
    x2: number,
    y: number
  ): void {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      tiles[y][x] = TileType.Floor;
    }
  }

  /**
   * 指定したX座標において、2つのY座標間の床を通路として掘削します。
   *
   * @param tiles - タイル配列 [y][x]
   * @param y1 - 開始Y座標
   * @param y2 - 終了Y座標
   * @param x - 通路を掘るX座標
   */
  private static digVertical(
    tiles: TileType[][],
    y1: number,
    y2: number,
    x: number
  ): void {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      tiles[y][x] = TileType.Floor;
    }
  }

  /**
   * 階層番号に基づいてフロアのバイオーム分類および和名を決定します。
   * 5階層周期で変化し、ダンジョン探索の単調さを防ぎます。
   *
   * @param floor - 階層番号
   * @returns バイオーム種別と和名のオブジェクト
   */
  public static getBiomeForFloor(floor: number): {
    biome: BiomeType;
    name: string;
  } {
    const cycle = (floor - 1) % 5;
    switch (cycle) {
      case 0:
        return { biome: 'STONE', name: '石造りの地下迷宮' };
      case 1:
        return { biome: 'EARTH', name: '岩と赤土の洞窟' };
      case 2:
        return { biome: 'FOREST', name: '草木が生い茂る旧遺跡' };
      case 3:
        return { biome: 'RIVER', name: '地下水流と清流洞' };
      case 4:
        return { biome: 'LAKE', name: '水没せし蒼玉の地下湖' };
      default:
        return { biome: 'STONE', name: '石造りの地下迷宮' };
    }
  }

  /**
   * バイオームに応じて、安全な水路（川・湖）タイルを配置します。
   * プレイヤー開始位置、階段、および部屋の主要通路が塞がれないよう配慮して配置されます。
   *
   * @param tiles - タイルグリッド配列
   * @param biome - バイオーム分類
   * @param rooms - 部屋リスト
   * @param startPos - プレイヤー開始地点
   * @param stairsDown - 階段位置
   */
  private static applyBiomeWater(
    tiles: TileType[][],
    biome: BiomeType,
    rooms: Room[],
    startPos: Point,
    stairsDown: Point
  ): void {
    if (biome !== 'RIVER' && biome !== 'LAKE') {
      return;
    }

    if (biome === 'RIVER') {
      // 川バイオーム: いくつかの部屋の片隅に小川を生成
      for (const room of rooms) {
        if (room.w >= 6 && room.h >= 6 && Math.random() < 0.65) {
          const isHoriz = Math.random() < 0.5;
          if (isHoriz) {
            const riverY = room.y + Math.floor(room.h / 2);
            for (let rx = room.x + 1; rx < room.x + room.w - 1; rx++) {
              // 飛び石として1マス置きにFloorを残し、通行可能にする
              if (rx % 3 !== 0) {
                tiles[riverY][rx] = TileType.Water;
              }
            }
          } else {
            const riverX = room.x + Math.floor(room.w / 2);
            for (let ry = room.y + 1; ry < room.y + room.h - 1; ry++) {
              if (ry % 3 !== 0) {
                tiles[ry][riverX] = TileType.Water;
              }
            }
          }
        }
      }
    } else if (biome === 'LAKE') {
      // 湖バイオーム: 部屋の中央に円形・長方形の湖を生成（外周2マスはFloorを保証）
      for (const room of rooms) {
        if (room.w >= 7 && room.h >= 7) {
          const innerW = room.w - 4;
          const innerH = room.h - 4;
          for (let ry = room.y + 2; ry < room.y + 2 + innerH; ry++) {
            for (let rx = room.x + 2; rx < room.x + 2 + innerW; rx++) {
              tiles[ry][rx] = TileType.Water;
            }
          }
        }
      }
    }

    // スタート地点と階段地点、およびその隣接3x3マスは確実に歩行可能（Floor / StairsDown）にリセット
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const sx = startPos.x + dx;
        const sy = startPos.y + dy;
        if (tiles[sy]?.[sx] === TileType.Water) {
          tiles[sy][sx] = TileType.Floor;
        }

        const ex = stairsDown.x + dx;
        const ey = stairsDown.y + dy;
        if (tiles[ey]?.[ex] === TileType.Water) {
          tiles[ey][ex] = TileType.Floor;
        }
      }
    }

    tiles[stairsDown.y][stairsDown.x] = TileType.StairsDown;
    tiles[startPos.y][startPos.x] = TileType.Floor;
  }
}
