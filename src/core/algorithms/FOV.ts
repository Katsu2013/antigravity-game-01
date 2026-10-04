/**
 * @file FOV.ts
 * @description プレイヤーの視界計算（Field of View）および探索済みマップ（Fog of War）の更新を行うクラス。
 * 部屋全体の一括可視化ルールと、通路向けの360度レイキャスティングを組み合わせています。
 */

import { DungeonMap, Point, TileType } from '../types';

/**
 * 視界計算（Field of View）処理を担当する静的ユーティリティクラス。
 */
export class FOV {
  /** 通路でのレイキャスティングで使用する光線（Ray）の本数 */
  private static readonly RAY_STEPS = 120;

  /**
   * プレイヤーの現在位置に基づいて視界フラグ（visible）と探索済みフラグ（explored）を計算・更新します。
   *
   * 処理手順:
   * 1. マップ全体の可視フラグ（visible）を false にリセット。
   * 2. プレイヤーがいる部屋を特定。部屋内にいる場合はその部屋全体と周囲の壁をすべて可視化（ローグライクの伝統仕様）。
   * 3. プレイヤーを中心とした360度レイキャスティングを行い、指定半径内の視認可能マスを特定。壁に衝突した場合はその壁までを可視化して光線を停止。
   * 4. 可視化されたすべてのマスの探索済みフラグ（explored）を true に更新。
   *
   * @param map - 更新対象のダンジョンマップデータ
   * @param playerPos - プレイヤーの現在座標
   * @param radius - 通路における最大視界半径（セル数、デフォルト: 7）
   */
  public static compute(map: DungeonMap, playerPos: Point, radius = 7): void {
    // 1. 直前の視界フラグを全マスリセット
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.visible[y][x] = false;
      }
    }

    // プレイヤーの現在マスは常に可視かつ探索済み
    map.visible[playerPos.y][playerPos.x] = true;
    map.explored[playerPos.y][playerPos.x] = true;

    // 2. プレイヤーがいる部屋を特定（部屋にいればその部屋全体が見渡せる）
    let currentRoom = null;
    for (const room of map.rooms) {
      if (
        playerPos.x >= room.x &&
        playerPos.x < room.x + room.w &&
        playerPos.y >= room.y &&
        playerPos.y < room.y + room.h
      ) {
        currentRoom = room;
        break;
      }
    }

    if (currentRoom) {
      // 部屋内および外周壁1マス分をすべて可視・探索済みに設定
      const minX = Math.max(0, currentRoom.x - 1);
      const maxX = Math.min(map.width - 1, currentRoom.x + currentRoom.w);
      const minY = Math.max(0, currentRoom.y - 1);
      const maxY = Math.min(map.height - 1, currentRoom.y + currentRoom.h);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          map.visible[y][x] = true;
          map.explored[y][x] = true;
        }
      }
    }

    // 3. 通路や部屋の外周に向けて360度のレイキャスティング視界を補完
    for (let i = 0; i < this.RAY_STEPS; i++) {
      const angle = (i * 2 * Math.PI) / this.RAY_STEPS;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      let currX = playerPos.x + 0.5;
      let currY = playerPos.y + 0.5;

      for (let d = 0; d < radius; d++) {
        currX += dx;
        currY += dy;

        const tileX = Math.floor(currX);
        const tileY = Math.floor(currY);

        // マップ境界外に出た場合は光線停止
        if (
          tileX < 0 ||
          tileX >= map.width ||
          tileY < 0 ||
          tileY >= map.height
        ) {
          break;
        }

        map.visible[tileY][tileX] = true;
        map.explored[tileY][tileX] = true;

        // 壁に当たった場合、壁マス自体は見えた上で視線が遮断される
        if (map.tiles[tileY][tileX] === TileType.Wall) {
          break;
        }
      }
    }
  }
}
